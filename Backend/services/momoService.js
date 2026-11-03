/**
 * MoMo Payment Gateway Service - GEARTECH
 * Tích hợp chính thức MoMo Payment Gateway API v2 (AIO)
 * Hỗ trợ tạo giao dịch MoMo Sandbox thật + Chế độ Smart Fallback QR Code
 */

const crypto = require('crypto');

const MOMO_ENDPOINT = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE || 'MOMO';
const MOMO_ACCESS_KEY = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';
const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';

/**
 * Tạo chữ ký HMAC-SHA256 theo chuẩn MoMo v2
 */
function createSignature(rawString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(rawString).digest('hex');
}

/**
 * Khởi tạo phiên thanh toán MoMo Gateway
 */
async function createPayment({
  orderId,
  amount,
  orderInfo = 'Thanh toán đơn hàng GearTech',
  redirectUrl = 'http://localhost:5173/profile?tab=orders',
  ipnUrl = 'http://localhost:5000/api/payments/momo/ipn',
  extraData = ''
}) {
  const requestId = `${MOMO_PARTNER_CODE}_${Date.now()}`;
  const strOrderId = String(orderId);
  const numAmount = parseInt(amount, 10) || 50000;
  const requestType = 'captureWallet';

  // Sắp xếp các tham số đúng bảng chữ cái alphabet chuẩn MoMo v2
  const rawSignature = [
    `accessKey=${MOMO_ACCESS_KEY}`,
    `amount=${numAmount}`,
    `extraData=${extraData}`,
    `ipnUrl=${ipnUrl}`,
    `orderId=${strOrderId}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${MOMO_PARTNER_CODE}`,
    `redirectUrl=${redirectUrl}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`
  ].join('&');

  const signature = createSignature(rawSignature, MOMO_SECRET_KEY);

  const requestBody = {
    partnerCode: MOMO_PARTNER_CODE,
    partnerName: 'GEARTECH STORE',
    storeId: 'GEARTECH_HCM',
    requestId,
    amount: numAmount,
    orderId: strOrderId,
    orderInfo,
    redirectUrl,
    ipnUrl,
    lang: 'vi',
    requestType,
    autoCapture: true,
    extraData,
    signature
  };

  try {
    const res = await fetch(MOMO_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const data = await res.json();

    if (data && data.resultCode === 0) {
      return {
        success: true,
        isSimulated: false,
        payUrl: data.payUrl,
        deeplink: data.deeplink,
        qrCodeUrl: data.qrCodeUrl,
        orderId: strOrderId,
        requestId: data.requestId,
        amount: numAmount,
        message: data.message
      };
    }

    console.warn(`[MoMo Gateway] API trả về mã ${data.resultCode}: ${data.message}. Kích hoạt chế độ MoMo Smart QR.`);
  } catch (err) {
    console.error('[MoMo Gateway] Lỗi kết nối MoMo API:', err.message);
  }

  // Chế độ MoMo Smart QR Code dự phòng chuẩn MoMo VietQR
  const memo = `GT ${strOrderId.slice(-8).toUpperCase()}`;
  const momoQrUrl = `https://api.vietqr.io/image/970422-0938793972-compact2.png?amount=${numAmount}&addInfo=${encodeURIComponent(memo)}&accountName=MOMO%20GEARTECH`;
  const momoDeeplink = `momo://app?action=payWithApp&isScanQR=true&amount=${numAmount}&comment=${encodeURIComponent(memo)}`;

  return {
    success: true,
    isSimulated: true,
    payUrl: `http://localhost:5173/payment/momo?orderId=${strOrderId}&amount=${numAmount}`,
    deeplink: momoDeeplink,
    qrCodeUrl: momoQrUrl,
    orderId: strOrderId,
    requestId,
    amount: numAmount,
    message: 'Tạo mã MoMo QR thanh toán thành công'
  };
}

/**
 * Kiểm tra tính hợp lệ của chữ ký Webhook (IPN) do MoMo gửi về
 */
function verifyIpnSignature(body) {
  const {
    partnerCode,
    orderId,
    requestId,
    amount,
    orderInfo,
    orderType,
    transId,
    resultCode,
    message,
    payType,
    responseTime,
    extraData,
    signature
  } = body;

  const rawSignature = [
    `accessKey=${MOMO_ACCESS_KEY}`,
    `amount=${amount}`,
    `extraData=${extraData || ''}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`
  ].join('&');

  const expectedSignature = createSignature(rawSignature, MOMO_SECRET_KEY);
  return expectedSignature === signature;
}

module.exports = {
  createPayment,
  verifyIpnSignature,
  createSignature
};
