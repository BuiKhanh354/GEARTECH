/**
 * VNPay Payment Gateway Service - GEARTECH
 * Tích hợp chuẩn Cổng thanh toán VNPAY API v2.1.0
 * Đặc tả kỹ thuật VPG_DTKN_TMDT (Bảo mật HMAC-SHA512)
 */

const crypto = require('crypto');
const qs = require('qs');

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || '5GWMVNEI';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'SSNYYNZFJDFBAVMNXPAEQMWVCHXUMOHQ';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/vnpay/return';

/**
 * Định dạng thời gian GMT+7 theo chuẩn VNPAY: yyyyMMddHHmmss
 */
function getVietnamTimeString(date = new Date()) {
  const vnFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const parts = vnFormatter.formatToParts(date);
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  return `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;
}

/**
 * Sắp xếp các tham số theo thứ tự alphabet bắt buộc theo chuẩn VNPAY
 */
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
  }
  return sorted;
}

/**
 * Tạo URL chuyển hướng tới cổng thanh toán VNPAY
 */
function buildPaymentUrl({
  orderId,
  amount,
  orderInfo = 'Thanh toan don hang GearTech',
  ipAddr = '127.0.0.1',
  bankCode = '',
  returnUrl = VNP_RETURN_URL
}) {
  const createDate = getVietnamTimeString();
  const numAmount = parseInt(amount, 10) || 50000;
  const strOrderId = String(orderId);

  // Lọc ký tự tiếng Việt có dấu sang không dấu cho orderInfo theo đặc tả VNPAY
  const safeOrderInfo = orderInfo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .slice(0, 255);

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: strOrderId,
    vnp_OrderInfo: safeOrderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: numAmount * 100, // VNPAY yêu cầu nhân 100 khử phần thập phân
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr || '127.0.0.1',
    vnp_CreateDate: createDate
  };

  if (bankCode) {
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnp_Params['vnp_SecureHash'] = signed;
  const paymentUrl = VNP_URL + '?' + qs.stringify(vnp_Params, { encode: false });

  return {
    paymentUrl,
    orderId: strOrderId,
    amount: numAmount,
    tmnCode: VNP_TMN_CODE,
    createDate
  };
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu phản hồi từ VNPAY (Return URL hoặc IPN Webhook)
 */
function verifyReturnUrl(query) {
  let vnp_Params = { ...query };
  const secureHash = vnp_Params['vnp_SecureHash'];

  delete vnp_Params['vnp_SecureHash'];
  delete vnp_Params['vnp_SecureHashType'];

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  const isValidSignature = String(secureHash).toLowerCase() === String(signed).toLowerCase();
  const responseCode = query['vnp_ResponseCode'];
  const transactionStatus = query['vnp_TransactionStatus'];
  const isSuccess = isValidSignature && responseCode === '00' && (!transactionStatus || transactionStatus === '00');

  return {
    isSuccess,
    isValidSignature,
    responseCode,
    transactionStatus,
    orderId: query['vnp_TxnRef'],
    amount: query['vnp_Amount'] ? parseInt(query['vnp_Amount'], 10) / 100 : 0,
    bankCode: query['vnp_BankCode'],
    transNo: query['vnp_TransactionNo'],
    cardType: query['vnp_CardType'],
    payDate: query['vnp_PayDate']
  };
}

module.exports = {
  buildPaymentUrl,
  verifyReturnUrl,
  sortObject,
  VNP_TMN_CODE,
  VNP_HASH_SECRET,
  VNP_URL,
  VNP_RETURN_URL
};
