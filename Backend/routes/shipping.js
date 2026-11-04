const { getDevelopmentErrorDetails } = require('../utils/errorDetails')
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Shipment = require('../models/Shipment');
const Payment = require('../models/Payment');
const { auth } = require('../middleware/auth');
const ghnService = require('../services/ghnService');

// =========================================================================
// 1. DANH MỤC ĐỊA LÝ (Tỉnh/Thành, Quận/Huyện, Phường/Xã)
// =========================================================================

// GET /api/shipping/provinces - Lấy danh sách Tỉnh/Thành phố
router.get('/provinces', async (req, res) => {
  try {
    const provinces = await ghnService.getProvinces();
    res.json(provinces);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy danh mục Tỉnh/Thành phố từ GHN.', ...getDevelopmentErrorDetails(error) });
  }
});

// GET /api/shipping/districts?province_id= - Lấy danh sách Quận/Huyện
router.get('/districts', async (req, res) => {
  try {
    const { province_id } = req.query;
    if (!province_id) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tham số province_id.' });
    }
    const districts = await ghnService.getDistricts(province_id);
    res.json(districts);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy danh mục Quận/Huyện từ GHN.', ...getDevelopmentErrorDetails(error) });
  }
});

// GET /api/shipping/wards?district_id= - Lấy danh sách Phường/Xã
router.get('/wards', async (req, res) => {
  try {
    const { district_id } = req.query;
    if (!district_id) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tham số district_id.' });
    }
    const wards = await ghnService.getWards(district_id);
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: 'Không thể lấy danh mục Phường/Xã từ GHN.', ...getDevelopmentErrorDetails(error) });
  }
});

// =========================================================================
// 2. TÍNH PHÍ VẬN CHUYỂN
// =========================================================================

// POST /api/shipping/calculate-fee - Tính phí vận chuyển chính xác từ GHN
router.post('/calculate-fee', async (req, res) => {
  try {
    const {
      shopId,
      fromDistrictId,
      toDistrictId,
      toWardCode,
      weight,
      length,
      width,
      height,
      insuranceValue,
      serviceTypeId,
      serviceId
    } = req.body;

    if (!toDistrictId || !toWardCode) {
      return res.status(400).json({ error: 'Địa chỉ nhận hàng không hợp lệ (thiếu toDistrictId hoặc toWardCode).' });
    }

    // Xác định quận gửi hàng từ Shop nếu có
    let senderDistrictId = fromDistrictId;
    if (!senderDistrictId && shopId) {
      const shop = await Shop.findById(shopId);
      if (shop && shop.district_id) {
        senderDistrictId = shop.district_id;
      }
    }

    // Mặc định quận kho trung tâm nếu shop chưa cấu hình riêng (Hà Nội: 1482 - Cầu Giấy)
    if (!senderDistrictId) {
      senderDistrictId = 1482;
    }

    const feeResult = await ghnService.calculateShippingFee({
      shopId,
      fromDistrictId: senderDistrictId,
      toDistrictId,
      toWardCode,
      weight: weight || 500,
      length: length || 20,
      width: width || 15,
      height: height || 10,
      insuranceValue: insuranceValue || 0,
      serviceTypeId: serviceTypeId || 2,
      serviceId: serviceId || 0
    });

    res.json({
      success: true,
      shippingFee: feeResult.total,
      details: feeResult
    });
  } catch (error) {
    res.status(500).json({
      error: 'Không thể tính phí vận chuyển từ GHN.',
      ...getDevelopmentErrorDetails(error)
    });
  }
});

// =========================================================================
// 3. TẠO VẬN ĐƠN GHN (Dành cho Chủ shop / Admin)
// =========================================================================

// POST /api/shipping/create - Chủ shop tạo vận đơn giao hàng GHN cho đơn của shop mình
router.post('/create', auth, async (req, res) => {
  try {
    const {
      orderId,
      weight,
      length,
      width,
      height,
      note,
      requiredNote,
      serviceTypeId,
      serviceId
    } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mã đơn hàng (orderId).' });
    }

    const order = await Order.findById(orderId).populate('shopId').populate('items.productId');
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần tạo vận đơn.' });
    }

    // 1. Phân quyền: Kiểm tra người dùng có quyền quản lý đơn hàng này không
    const isAdmin = req.user.role === 'admin';
    let userShopId = req.user.shopId;
    if (!userShopId) {
      const ownedShop = await Shop.findOne({ ownerId: req.user.id });
      if (ownedShop) userShopId = ownedShop._id;
    }

    const orderShopId = order.shopId ? (order.shopId._id || order.shopId) : order.shop_id;
    const isOwnerShop = userShopId && String(userShopId) === String(orderShopId);

    if (!isAdmin && !isOwnerShop) {
      return res.status(403).json({
        error: 'Từ chối truy cập: Bạn không có quyền tạo vận đơn cho đơn hàng của cửa hàng khác!'
      });
    }

    // 2. Kiểm tra trạng thái đơn: Chỉ đơn 'pending' hoặc 'confirmed' mới được tạo vận đơn
    const currentStatus = order.orderStatus || order.order_status;
    if (currentStatus === 'cancelled') {
      return res.status(400).json({ error: 'Đơn hàng này đã bị hủy, không thể tạo vận đơn giao hàng!' });
    }
    if (currentStatus === 'completed') {
      return res.status(400).json({ error: 'Đơn hàng này đã hoàn tất, không thể tạo thêm vận đơn!' });
    }

    // 3. Chống tạo trùng lặp (Idempotent): Kiểm tra xem đơn đã có vận đơn đang hoạt động chưa
    const existingShipment = await Shipment.findOne({
      order_id: order._id,
      shipping_status: { $nin: ['cancelled', 'draft'] }
    });

    if (existingShipment) {
      return res.status(400).json({
        error: `Đơn hàng đã có vận đơn GHN đang hoạt động (#${existingShipment.tracking_code}). Không được tạo trùng lặp!`,
        trackingCode: existingShipment.tracking_code,
        shipment: existingShipment
      });
    }

    // 4. Lấy thông tin người nhận
    const receiverName = order.receiver_name || order.shippingAddress?.receiverName || 'Khách hàng';
    const receiverPhone = order.phone || order.shippingAddress?.receiverPhone || '0900000000';
    const receiverAddress = order.shipping_address || order.shippingAddress?.detailAddress || 'Địa chỉ nhận hàng';

    // Xác định mã quận/phường nhận (mặc định Quận 1 Phường Bến Nghé HCM nếu chưa chỉ định)
    const toDistrictId = order.shippingAddress?.district_id || 1442;
    const toWardCode = String(order.shippingAddress?.ward_code || '20101');

    // 5. Lấy thông tin kho shop gửi (Kho Tân Bình HCM: 1455 - 21404)
    const shop = order.shopId || await Shop.findById(orderShopId);
    const shopName = shop?.name || shop?.shop_name || 'GEARTECH';
    const shopPhone = shop?.phone || req.user.phone || '0938793972';
    const shopAddress = shop?.address || '18A/1 Cộng Hòa, Phường 4, Quận Tân Bình, Hồ Chí Minh';
    const fromDistrictId = shop?.district_id || 1455;
    const fromWardCode = String(shop?.ward_code || '21404');

    // Tính toán tiền COD
    const isCOD = (order.paymentMethod || order.payment_method || 'COD').toUpperCase() === 'COD';
    const finalAmount = order.finalAmount !== undefined ? Number(order.finalAmount) : (order.totalAmount || 0);
    const codAmount = isCOD ? finalAmount : 0;

    // 6. Gọi GHN Service để tạo vận đơn
    const ghnResult = await ghnService.createShippingOrder({
      shopId: userShopId,
      clientOrderCode: String(order._id).slice(-8).toUpperCase(),
      toName: receiverName,
      toPhone: receiverPhone,
      toAddress: receiverAddress,
      toDistrictId,
      toWardCode,
      fromName: shopName,
      fromPhone: shopPhone,
      fromAddress: shopAddress,
      fromDistrictId,
      fromWardCode,
      weight: weight || 500,
      length: length || 20,
      width: width || 15,
      height: height || 10,
      serviceTypeId: serviceTypeId || 2,
      serviceId: serviceId || 0,
      codAmount,
      insuranceValue: finalAmount,
      note: note || order.note || 'Hàng linh kiện điện tử',
      requiredNote: requiredNote || 'CHOXEMHANGKHONGTHU',
      items: order.items || []
    });

    const trackingCode = ghnResult.order_code;
    const expectedDelivery = ghnResult.expected_delivery_time ? new Date(ghnResult.expected_delivery_time) : new Date(Date.now() + 3 * 86400000);

    // 7. Tạo bản ghi Shipment trong database
    const shipment = new Shipment({
      order_id: order._id,
      shop_id: orderShopId,
      user_id: order.user_id || order.userId,
      customer_id: order.customer_id || order.customerId,
      carrier: 'GHN',
      tracking_code: trackingCode,
      service_type_id: serviceTypeId || 2,
      shipping_fee: ghnResult.total_fee || order.shippingFee || 30000,
      cod_amount: codAmount,
      insurance_value: finalAmount,
      weight: weight || 500,
      length: length || 20,
      width: width || 15,
      height: height || 10,
      sender_info: {
        name: shopName,
        phone: shopPhone,
        address: shopAddress,
        district_id: fromDistrictId,
        ward_code: fromWardCode
      },
      receiver_info: {
        name: receiverName,
        phone: receiverPhone,
        address: receiverAddress,
        district_id: toDistrictId,
        ward_code: toWardCode
      },
      shipping_status: 'ready_to_pick',
      expected_delivery_date: expectedDelivery,
      timeline: [{
        status: 'ready_to_pick',
        description: 'Vận đơn GHN đã được khởi tạo thành công trên hệ thống. Đang chờ tài xế GHN đến lấy hàng.',
        updated_at: new Date()
      }],
      ghn_order_data: ghnResult.raw || ghnResult
    });

    await shipment.save();

    // 8. Cập nhật Order liên kết vận đơn và chuyển trạng thái sang 'shipping'
    order.shipment_id = shipment._id;
    order.shipmentId = shipment._id;
    order.tracking_code = trackingCode;
    order.trackingCode = trackingCode;
    order.carrier = 'GHN';
    order.orderStatus = 'shipping';
    order.order_status = 'shipping';
    await order.save();

    res.status(201).json({
      success: true,
      message: `Tạo vận đơn GHN thành công! Mã vận đơn: ${trackingCode}`,
      trackingCode,
      shipment,
      order
    });
  } catch (error) {
    console.error('Lỗi khi tạo vận đơn GHN:', error.message || error);
    res.status(400).json({
      error: process.env.NODE_ENV === 'production' ? 'Không thể tạo vận đơn.' : error.message || 'Lỗi phát sinh khi tạo vận đơn GHN.',
      ...getDevelopmentErrorDetails(error)
    });
  }
});

// =========================================================================
// 4. THEO DÕI VẬN ĐƠN (Khách hàng & Chủ shop)
// =========================================================================

// GET /api/shipping/track/:orderId - Xem hành trình và trạng thái vận chuyển
router.get('/track/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần tra cứu vận đơn.' });
    }

    // Phân quyền: Khách hàng sở hữu đơn HOẶC Chủ shop sở hữu đơn HOẶC Admin
    const isCustomer = String(order.user_id || order.userId) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    let userShopId = req.user.shopId;
    if (!userShopId) {
      const ownedShop = await Shop.findOne({ ownerId: req.user.id });
      if (ownedShop) userShopId = ownedShop._id;
    }
    const isOwnerShop = userShopId && String(userShopId) === String(order.shop_id || order.shopId);

    if (!isCustomer && !isOwnerShop && !isAdmin) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem thông tin vận chuyển của đơn hàng này.' });
    }

    const shipment = await Shipment.findOne({ order_id: order._id })
      .sort({ created_at: -1 });

    if (!shipment) {
      return res.json({
        hasShipment: false,
        message: 'Đơn hàng này hiện chưa được bàn giao tạo vận đơn vận chuyển.',
        orderStatus: order.orderStatus || order.order_status
      });
    }

    // Nếu có mã GHN thực tế, tra cứu trạng thái mới nhất từ GHN API
    let liveDetail = null;
    if (shipment.tracking_code) {
      try {
        liveDetail = await ghnService.getOrderDetail(shipment.tracking_code);
      } catch (e) {
        // Giữ nguyên dữ liệu trong DB nếu GHN API bận/timeout
      }
    }

    res.json({
      hasShipment: true,
      shipment,
      liveDetail,
      trackingCode: shipment.tracking_code,
      shippingStatus: shipment.shipping_status,
      carrier: shipment.carrier || 'GHN',
      expectedDeliveryDate: shipment.expected_delivery_date,
      timeline: shipment.timeline || []
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông tin hành trình vận đơn.', ...getDevelopmentErrorDetails(error) });
  }
});

// =========================================================================
// 5. HỦY VẬN ĐƠN (Chủ shop / Admin)
// =========================================================================

// POST /api/shipping/cancel/:orderId - Hủy vận đơn trên GHN khi hàng chưa giao
router.post('/cancel/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần hủy vận đơn.' });
    }

    const isAdmin = req.user.role === 'admin';
    let userShopId = req.user.shopId;
    if (!userShopId) {
      const ownedShop = await Shop.findOne({ ownerId: req.user.id });
      if (ownedShop) userShopId = ownedShop._id;
    }
    const isOwnerShop = userShopId && String(userShopId) === String(order.shop_id || order.shopId);

    if (!isAdmin && !isOwnerShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền hủy vận đơn của shop khác!' });
    }

    const shipment = await Shipment.findOne({
      order_id: order._id,
      shipping_status: { $ne: 'cancelled' }
    });

    if (!shipment) {
      return res.status(404).json({ error: 'Đơn hàng không có vận đơn nào đang hoạt động để hủy.' });
    }

    // Chỉ cho phép hủy khi hàng ở trạng thái chưa xuất kho giao (draft, ready_to_pick, picking)
    const cancellableStatuses = ['draft', 'ready_to_pick', 'picking'];
    if (!cancellableStatuses.includes(shipment.shipping_status)) {
      return res.status(400).json({
        error: `Không thể hủy vận đơn vì kiện hàng đã chuyển sang trạng thái "${shipment.shipping_status}". Vui lòng liên hệ hỗ trợ GHN!`
      });
    }

    // Gọi GHN hủy mã vận đơn
    await ghnService.cancelOrder({
      shopId: userShopId,
      orderCodes: [shipment.tracking_code]
    });

    // Cập nhật Shipment
    shipment.shipping_status = 'cancelled';
    shipment.cancel_reason = reason || 'Chủ shop chủ động hủy vận đơn';
    shipment.timeline.push({
      status: 'cancelled',
      description: `Đã hủy vận đơn #${shipment.tracking_code}. Lý do: ${shipment.cancel_reason}`,
      updated_at: new Date()
    });
    await shipment.save();

    // Revert Order về trạng thái 'confirmed'
    order.orderStatus = 'confirmed';
    order.order_status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: `Hủy vận đơn GHN #${shipment.tracking_code} thành công! Đơn hàng được đưa về trạng thái Đã xác nhận.`,
      shipment,
      order
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi hủy vận đơn trên GHN.', ...getDevelopmentErrorDetails(error) });
  }
});

// =========================================================================
// 6. WEBHOOK GHN (Nhận thông báo cập nhật trạng thái tự động)
// =========================================================================

// POST /api/shipping/webhook - Endpoint công khai nhận callback từ GHN
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;

    // 1. Kiểm tra tính hợp lệ của payload
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid webhook payload structure.' });
    }

    const orderCode = payload.OrderCode || payload.order_code;
    const ghnStatus = payload.Status || payload.status;

    if (!orderCode || !ghnStatus) {
      return res.status(400).json({ error: 'Thiếu trường OrderCode hoặc Status trong payload.' });
    }

    // 2. Tìm Shipment tương ứng
    const shipment = await Shipment.findOne({ tracking_code: String(orderCode).trim() });
    if (!shipment) {
      // Trả 200 cho GHN để tránh retry liên tục các đơn không thuộc hệ thống
      return res.status(200).json({ message: 'Vận đơn không thuộc hệ thống này, đã ghi nhận bỏ qua.' });
    }

    // 3. Ánh xạ trạng thái GHN sang GearTech
    const mapping = ghnService.mapGhnStatusToGearTech(ghnStatus);

    // 4. Xử lý Idempotent: Nếu trạng thái đã trùng khớp thì không ghi đè timeline lặp lại
    const isDuplicate = shipment.shipping_status === mapping.shippingStatus;

    // Ghi nhật ký sự kiện webhook
    shipment.webhook_events.push({
      event: ghnStatus,
      received_at: new Date(),
      payload: {
        OrderCode: orderCode,
        Status: ghnStatus,
        Description: payload.Description || payload.description || '',
        TotalFee: payload.TotalFee || payload.total_fee || null
      }
    });

    if (!isDuplicate) {
      shipment.shipping_status = mapping.shippingStatus;
      shipment.timeline.push({
        status: mapping.shippingStatus,
        description: payload.Description || mapping.label,
        updated_at: new Date()
      });

      await shipment.save();

      // Cập nhật trạng thái đơn hàng Order tương ứng
      const order = await Order.findById(shipment.order_id);
      if (order) {
        // Chỉ cập nhật nếu đơn chưa bị hủy
        if (order.orderStatus !== 'cancelled') {
          if (mapping.shippingStatus === 'delivered') {
            order.orderStatus = 'completed';
            order.order_status = 'completed';
            order.paymentStatus = 'paid';
            order.payment_status = 'paid';
            await Payment.updateOne(
              { order_id: order._id },
              { payment_status: 'paid', paid_at: new Date() }
            ).catch(() => {});
          } else if (mapping.shippingStatus === 'returned') {
            order.orderStatus = 'cancelled';
            order.order_status = 'cancelled';
          } else if (['picking', 'picked', 'storing', 'transporting', 'delivering'].includes(mapping.shippingStatus)) {
            order.orderStatus = 'shipping';
            order.order_status = 'shipping';
          }
          await order.save();
        }
      }
    } else {
      await shipment.save();
    }

    return res.status(200).json({
      code: 200,
      message: 'Xử lý webhook GHN thành công (Idempotent OK).',
      orderCode,
      status: mapping.shippingStatus
    });
  } catch (error) {
    console.error('❌ Lỗi xử lý Webhook GHN:', error);
    return res.status(500).json({ error: 'Lỗi nội bộ khi xử lý Webhook GHN.', ...getDevelopmentErrorDetails(error) });
  }
});

module.exports = router;
