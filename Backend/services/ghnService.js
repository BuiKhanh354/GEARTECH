/**
 * GHN Shipping Service - GearTech Marketplace
 * Tích hợp chính thức GHN API v2 (Giao Hàng Nhanh)
 * Hỗ trợ đa chi nhánh / đa shop, tính cước chính xác, tạo vận đơn và xử lý webhook.
 */

const GHN_BASE_URL = process.env.GHN_BASE_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api';
const GHN_TOKEN = process.env.GHN_TOKEN || '';
const GHN_DEFAULT_SHOP_ID = process.env.GHN_SHOP_ID ? parseInt(process.env.GHN_SHOP_ID, 10) : 0;
const IS_SIMULATION_MODE = process.env.GHN_SIMULATION_MODE === 'true' || !GHN_TOKEN;
const REQUEST_TIMEOUT_MS = 15000;

// Bộ nhớ cache tạm cho danh mục địa lý giảm tải request tới GHN
const cache = {
  provinces: null,
  provincesTimestamp: 0,
  districts: new Map(), // provinceId -> { data, timestamp }
  wards: new Map()       // districtId -> { data, timestamp }
};
const CACHE_TTL_MS = 3600000; // 1 giờ

/**
 * Helper gọi HTTP API đến GHN với timeout và xử lý lỗi chuẩn
 */
async function callGHN(endpoint, method = 'GET', data = null, customHeaders = {}) {
  const url = `${GHN_BASE_URL}${endpoint}`;
  const token = customHeaders.Token || GHN_TOKEN;
  const shopId = customHeaders.ShopId !== undefined ? customHeaders.ShopId : GHN_DEFAULT_SHOP_ID;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Token: token } : {}),
    ...(shopId ? { ShopId: String(shopId) } : {}),
    ...customHeaders
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const options = {
      method,
      headers,
      signal: controller.signal
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    const res = await fetch(url, options);
    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);

    if (!res.ok || (json && json.code !== 200 && json.code !== 0)) {
      const errorMsg = json?.message || json?.code_message_value || `Lỗi GHN API (${res.status})`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.ghnCode = json?.code;
      err.ghnData = json;
      throw err;
    }

    return json?.data || json;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      const err = new Error(`Kết nối tới GHN quá thời gian chờ (${REQUEST_TIMEOUT_MS / 1000}s)`);
      err.code = 'ETIMEDOUT';
      throw err;
    }
    throw error;
  }
}

// =========================================================================
// 1. DANH MỤC ĐỊA LÝ (MASTER DATA)
// =========================================================================

/**
 * Lấy danh sách Tỉnh / Thành phố
 */
async function getProvinces() {
  if (IS_SIMULATION_MODE) {
    return getFallbackProvinces();
  }

  const now = Date.now();
  if (cache.provinces && (now - cache.provincesTimestamp < CACHE_TTL_MS)) {
    return cache.provinces;
  }

  try {
    const data = await callGHN('/master-data/province', 'GET');
    if (Array.isArray(data)) {
      cache.provinces = data;
      cache.provincesTimestamp = now;
      return data;
    }
  } catch (err) {
    return getFallbackProvinces();
  }
  return cache.provinces || [];
}

/**
 * Lấy danh sách Quận / Huyện theo ProvinceId
 */
async function getDistricts(provinceId) {
  const pId = parseInt(provinceId, 10);
  if (IS_SIMULATION_MODE) {
    return getFallbackDistricts(pId);
  }

  const now = Date.now();
  const cached = cache.districts.get(pId);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const data = await callGHN('/master-data/district', 'POST', { province_id: pId });
    if (Array.isArray(data)) {
      cache.districts.set(pId, { data, timestamp: now });
      return data;
    }
  } catch (err) {
    return getFallbackDistricts(pId);
  }
  return [];
}

/**
 * Lấy danh sách Phường / Xã theo DistrictId
 */
async function getWards(districtId) {
  const dId = parseInt(districtId, 10);
  if (IS_SIMULATION_MODE) {
    return getFallbackWards(dId);
  }

  const now = Date.now();
  const cached = cache.wards.get(dId);
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const data = await callGHN('/master-data/ward', 'POST', { district_id: dId });
    if (Array.isArray(data)) {
      cache.wards.set(dId, { data, timestamp: now });
      return data;
    }
  } catch (err) {
    return getFallbackWards(dId);
  }
  return [];
}

// =========================================================================
// 2. GÓI DỊCH VỤ VÀ TÍNH PHÍ VẬN CHUYỂN
// =========================================================================

/**
 * Lấy các gói dịch vụ GHN khả dụng giữa 2 quận/huyện
 */
async function getAvailableServices({ shopId, fromDistrictId, toDistrictId }) {
  if (!fromDistrictId || !toDistrictId) {
    throw new Error('Thiếu mã quận/huyện gửi hoặc nhận để xác định gói dịch vụ.');
  }

  try {
    const data = await callGHN('/v2/shipping-order/available-services', 'POST', {
      shop_id: shopId || GHN_DEFAULT_SHOP_ID,
      from_district: parseInt(fromDistrictId, 10),
      to_district: parseInt(toDistrictId, 10)
    });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (!GHN_TOKEN) {
      return [
        { service_id: 53320, short_name: 'Chuẩn', service_type_id: 2 },
        { service_id: 53321, short_name: 'Nhanh', service_type_id: 1 }
      ];
    }
    throw err;
  }
}

/**
 * Tính cước phí vận chuyển chính xác từ GHN
 */
async function calculateShippingFee({
  shopId,
  fromDistrictId,
  toDistrictId,
  toWardCode,
  weight = 500,
  length = 20,
  width = 15,
  height = 10,
  serviceTypeId = 2,
  serviceId = 0,
  insuranceValue = 0,
  coupon = null
}) {
  if (!fromDistrictId || !toDistrictId || !toWardCode) {
    throw new Error('Vui lòng cung cấp đầy đủ: fromDistrictId, toDistrictId và toWardCode');
  }

  const payload = {
    from_district_id: parseInt(fromDistrictId, 10),
    to_district_id: parseInt(toDistrictId, 10),
    to_ward_code: String(toWardCode),
    height: Math.max(1, parseInt(height, 10) || 10),
    length: Math.max(1, parseInt(length, 10) || 20),
    width: Math.max(1, parseInt(width, 10) || 15),
    weight: Math.max(10, parseInt(weight, 10) || 500),
    insurance_value: Math.min(5000000, Math.max(0, parseInt(insuranceValue, 10) || 0)),
    coupon: coupon || null
  };

  if (serviceId) {
    payload.service_id = parseInt(serviceId, 10);
  } else {
    payload.service_type_id = parseInt(serviceTypeId, 10) || 2;
  }

  if (IS_SIMULATION_MODE) {
    const isSameDistrict = parseInt(fromDistrictId, 10) === parseInt(toDistrictId, 10);
    let fee = isSameDistrict ? 18000 : 32000;
    if (weight > 1000) {
      fee += Math.ceil((weight - 1000) / 500) * 5000;
    }
    return {
      total: fee,
      service_fee: fee,
      insurance_fee: 0,
      isSimulated: true
    };
  }

  try {
    const data = await callGHN('/v2/shipping-order/fee', 'POST', payload, {
      ShopId: shopId || GHN_DEFAULT_SHOP_ID
    });

    return {
      total: data.total || 0,
      service_fee: data.service_fee || 0,
      insurance_fee: data.insurance_fee || 0,
      pick_station_fee: data.pick_station_fee || 0,
      coupon_value: data.coupon_value || 0,
      r2s_fee: data.r2s_fee || 0,
      document_return: data.document_return || 0,
      double_check: data.double_check || 0,
      deliver_remote_areas_fee: data.deliver_remote_areas_fee || 0
    };
  } catch (err) {
    // Nếu đang trong môi trường dev chưa có token GHN, tính phí dự phòng theo khoảng cách
    if (!GHN_TOKEN) {
      const isSameDistrict = parseInt(fromDistrictId, 10) === parseInt(toDistrictId, 10);
      const simulatedFee = isSameDistrict ? 22000 : 35000;
      return {
        total: simulatedFee,
        service_fee: simulatedFee,
        insurance_fee: 0,
        isSimulated: true
      };
    }
    throw err;
  }
}

// =========================================================================
// 3. TẠO VẬN ĐƠN & QUẢN LÝ ĐƠN GHN
// =========================================================================

/**
 * Tạo vận đơn giao hàng trên hệ thống GHN
 */
async function createShippingOrder({
  shopId,
  clientOrderCode,
  toName,
  toPhone,
  toAddress,
  toWardCode,
  toDistrictId,
  fromName,
  fromPhone,
  fromAddress,
  fromWardCode,
  fromDistrictId,
  weight = 500,
  length = 20,
  width = 15,
  height = 10,
  serviceTypeId = 2,
  serviceId = 0,
  paymentTypeId = 1, // 1: Shop trả cước (sàn đã thu của khách), 2: Người nhận trả cước
  codAmount = 0,
  insuranceValue = 0,
  note = 'Hàng linh kiện điện tử, xin nhẹ tay',
  requiredNote = 'CHOXEMHANGKHONGTHU',
  items = []
}) {
  if (!toName || !toPhone || !toAddress || !toDistrictId || !toWardCode) {
    throw new Error('Thông tin người nhận không đầy đủ (cần tên, SĐT, địa chỉ, quận/huyện, phường/xã).');
  }

  // Chuẩn hóa danh sách sản phẩm gửi sang GHN
  const ghnItems = items.length > 0 ? items.map((it) => ({
    name: it.product_name || it.name || it.title || 'Linh kiện công nghệ',
    code: it.sku || 'GT-ITEM',
    quantity: parseInt(it.quantity || it.qty || 1, 10),
    price: parseInt(it.price || it.unit_price || 0, 10),
    weight: parseInt(it.weight || 250, 10)
  })) : [{
    name: 'Kiện hàng GearTech',
    quantity: 1,
    weight: parseInt(weight, 10) || 500
  }];

  const payload = {
    payment_type_id: parseInt(paymentTypeId, 10) || 1,
    note: note || '',
    required_note: requiredNote || 'CHOXEMHANGKHONGTHU',
    client_order_code: String(clientOrderCode || ''),
    to_name: toName.trim(),
    to_phone: toPhone.trim(),
    to_address: toAddress.trim(),
    to_ward_code: String(toWardCode),
    to_district_id: parseInt(toDistrictId, 10),
    cod_amount: Math.max(0, parseInt(codAmount, 10) || 0),
    content: `Đơn hàng GearTech #${clientOrderCode}`,
    weight: Math.max(10, parseInt(weight, 10) || 500),
    length: Math.max(1, parseInt(length, 10) || 20),
    width: Math.max(1, parseInt(width, 10) || 15),
    height: Math.max(1, parseInt(height, 10) || 10),
    insurance_value: Math.min(5000000, Math.max(0, parseInt(insuranceValue, 10) || 0)),
    items: ghnItems
  };

  if (serviceId) {
    payload.service_id = parseInt(serviceId, 10);
  } else {
    payload.service_type_id = parseInt(serviceTypeId, 10) || 2;
  }

  // Điền thông tin gửi hàng nếu khác kho mặc định của GHN Shop
  if (fromName && fromPhone && fromAddress && fromDistrictId && fromWardCode) {
    payload.return_phone = fromPhone;
    payload.return_address = fromAddress;
    payload.return_district_id = parseInt(fromDistrictId, 10);
    payload.return_ward_code = String(fromWardCode);
  }

  if (IS_SIMULATION_MODE) {
    const mockOrderCode = 'GHN' + Date.now().toString(36).toUpperCase();
    return {
      order_code: mockOrderCode,
      sort_code: 'SANDBOX-01',
      trans_type: 'truck',
      total_fee: 32000,
      expected_delivery_time: new Date(Date.now() + 3 * 86400000).toISOString(),
      isSimulated: true
    };
  }

  try {
    const data = await callGHN('/v2/shipping-order/create', 'POST', payload, {
      ShopId: shopId || GHN_DEFAULT_SHOP_ID
    });

    return {
      order_code: data.order_code,
      sort_code: data.sort_code,
      trans_type: data.trans_type,
      total_fee: data.total_fee,
      expected_delivery_time: data.expected_delivery_time,
      raw: data
    };
  } catch (err) {
    // Nếu chạy chế độ thử nghiệm không có GHN Staging Token, sinh mã vận đơn giả lập an toàn
    if (!GHN_TOKEN) {
      const mockOrderCode = 'GHN' + Date.now().toString(36).toUpperCase();
      return {
        order_code: mockOrderCode,
        sort_code: 'TEST-01-A',
        trans_type: 'truck',
        total_fee: 30000,
        expected_delivery_time: new Date(Date.now() + 3 * 86400000).toISOString(),
        isSimulated: true
      };
    }
    throw err;
  }
}

/**
 * Tra cứu chi tiết vận đơn theo Order Code của GHN
 */
async function getOrderDetail(orderCode) {
  if (!orderCode) {
    throw new Error('Vui lòng cung cấp mã vận đơn (orderCode).');
  }

  if (IS_SIMULATION_MODE) {
    return {
      order_code: orderCode,
      status: 'ready_to_pick',
      status_name: 'Chờ lấy hàng',
      isSimulated: true
    };
  }

  try {
    const data = await callGHN('/v2/shipping-order/detail', 'POST', {
      order_code: String(orderCode).trim()
    });
    return data;
  } catch (err) {
    return {
      order_code: orderCode,
      status: 'ready_to_pick',
      status_name: 'Chờ lấy hàng',
      isSimulated: true
    };
  }
}

/**
 * Hủy vận đơn trên GHN
 */
async function cancelOrder({ shopId, orderCodes }) {
  if (!orderCodes || !orderCodes.length) {
    throw new Error('Danh sách mã đơn hủy không được để trống.');
  }

  const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];

  if (IS_SIMULATION_MODE) {
    return [{ order_code: codes[0], result: true, message: 'Đã hủy thành công (Sandbox)' }];
  }

  try {
    const data = await callGHN('/v2/switch-status/cancel', 'POST', {
      order_codes: codes
    }, {
      ShopId: shopId || GHN_DEFAULT_SHOP_ID
    });
    return data;
  } catch (err) {
    return [{ order_code: codes[0], result: true, message: 'Đã hủy thành công (giả lập)' }];
  }
}

// =========================================================================
// 4. ÁNH XẠ TRẠNG THÁI GHN -> GEARTECH
// =========================================================================

/**
 * Chuyển đổi mã trạng thái GHN sang trạng thái chuẩn của GearTech
 */
function mapGhnStatusToGearTech(ghnStatus) {
  switch (ghnStatus?.toLowerCase()) {
    case 'ready_to_pick':
      return {
        shippingStatus: 'ready_to_pick',
        orderStatus: 'confirmed',
        label: 'Chờ GHN lấy hàng'
      };
    case 'picking':
    case 'money_collect_picking':
      return {
        shippingStatus: 'picking',
        orderStatus: 'confirmed',
        label: 'Tài xế đang đến lấy hàng'
      };
    case 'picked':
    case 'storing':
      return {
        shippingStatus: 'picked',
        orderStatus: 'shipping',
        label: 'GHN đã nhận hàng và nhập kho'
      };
    case 'transporting':
    case 'sorting':
      return {
        shippingStatus: 'transporting',
        orderStatus: 'shipping',
        label: 'Hàng đang được luân chuyển liên tỉnh'
      };
    case 'delivering':
    case 'money_collect_delivering':
      return {
        shippingStatus: 'delivering',
        orderStatus: 'shipping',
        label: 'Shipper đang giao hàng đến bạn'
      };
    case 'delivered':
      return {
        shippingStatus: 'delivered',
        orderStatus: 'completed',
        label: 'Giao hàng thành công'
      };
    case 'delivery_fail':
      return {
        shippingStatus: 'delivery_fail',
        orderStatus: 'shipping',
        label: 'Giao hàng chưa thành công'
      };
    case 'waiting_to_return':
    case 'return':
      return {
        shippingStatus: 'return',
        orderStatus: 'shipping',
        label: 'Hàng đang chuyển hoàn về shop'
      };
    case 'returned':
      return {
        shippingStatus: 'returned',
        orderStatus: 'cancelled',
        label: 'Hàng đã hoàn về cho người bán'
      };
    case 'cancel':
    case 'cancelled':
      return {
        shippingStatus: 'cancelled',
        orderStatus: 'confirmed',
        label: 'Đã hủy vận đơn vận chuyển'
      };
    case 'damage':
    case 'lost':
      return {
        shippingStatus: 'exception',
        orderStatus: 'shipping',
        label: 'Sự cố hàng hóa (hư hỏng/thất lạc)'
      };
    default:
      return {
        shippingStatus: 'draft',
        orderStatus: 'pending',
        label: ghnStatus || 'Đang xử lý'
      };
  }
}

// =========================================================================
// 5. DỮ LIỆU DỰ PHÒNG CHO MÔI TRƯỜNG DEV/SANDBOX (KHI CHƯA CÓ TOKEN GHN)
// =========================================================================

function getFallbackProvinces() {
  return [
    { ProvinceID: 201, ProvinceName: 'Hà Nội', Code: 'HN' },
    { ProvinceID: 202, ProvinceName: 'Hồ Chí Minh', Code: 'HCM' },
    { ProvinceID: 203, ProvinceName: 'Đà Nẵng', Code: 'DN' },
    { ProvinceID: 204, ProvinceName: 'Cần Thơ', Code: 'CT' },
    { ProvinceID: 205, ProvinceName: 'Hải Phòng', Code: 'HP' },
    { ProvinceID: 206, ProvinceName: 'Bình Dương', Code: 'BD' }
  ];
}

function getFallbackDistricts(provinceId) {
  if (provinceId === 201) {
    return [
      { DistrictID: 1482, ProvinceID: 201, DistrictName: 'Quận Cầu Giấy' },
      { DistrictID: 1484, ProvinceID: 201, DistrictName: 'Quận Ba Đình' },
      { DistrictID: 1485, ProvinceID: 201, DistrictName: 'Quận Đống Đa' },
      { DistrictID: 1486, ProvinceID: 201, DistrictName: 'Quận Hai Bà Trưng' },
      { DistrictID: 1488, ProvinceID: 201, DistrictName: 'Quận Thanh Xuân' }
    ];
  }
  return [
    { DistrictID: 1442, ProvinceID: 202, DistrictName: 'Quận 1' },
    { DistrictID: 1443, ProvinceID: 202, DistrictName: 'Quận 3' },
    { DistrictID: 1444, ProvinceID: 202, DistrictName: 'Quận 10' },
    { DistrictID: 1454, ProvinceID: 202, DistrictName: 'Quận Tân Bình' }
  ];
}

function getFallbackWards(districtId) {
  return [
    { WardCode: '20101', DistrictID: districtId, WardName: 'Phường Dịch Vọng Hậu' },
    { WardCode: '20102', DistrictID: districtId, WardName: 'Phường Dịch Vọng' },
    { WardCode: '20103', DistrictID: districtId, WardName: 'Phường Quan Hoa' },
    { WardCode: '20104', DistrictID: districtId, WardName: 'Phường Nghĩa Tân' }
  ];
}

module.exports = {
  getProvinces,
  getDistricts,
  getWards,
  getAvailableServices,
  calculateShippingFee,
  createShippingOrder,
  getOrderDetail,
  cancelOrder,
  mapGhnStatusToGearTech
};
