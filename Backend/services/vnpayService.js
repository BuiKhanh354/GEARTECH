/**
 * VNPay Payment Gateway Service - GEARTECH
 * Tích hợp chính thức cổng thanh toán VNPAY API v2.1.0
 * Hỗ trợ Sandbox Test (40+ ngân hàng Việt Nam, thẻ ATM, Visa/Master, VNPay-QR)
 */

const crypto = require('crypto');
const qs = require('qs');

const VNP_TMN_CODE = process.env.VNP_TMN_CODE || 'CGXZLS0Z';
const VNP_HASH_SECRET = process.env.VNP_HASH_SECRET || 'XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN';
const VNP_URL = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
const VNP_RETURN_URL = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/vnpay/return';

/**
 * Sắp xếp các trường theo đúng thứ tự alphabet bắt buộc của VNPAY
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
  ipAddr = '13.160.92.202',
  bankCode = '',
  returnUrl = VNP_RETURN_URL
}) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;

  const numAmount = parseInt(amount, 10) || 50000;
  const strOrderId = String(orderId);

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNP_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: strOrderId,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: numAmount * 100, // VNPAY yêu cầu nhân 100
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
    amount: numAmount
  };
}

/**
 * Kiểm tra tính hợp lệ của dữ liệu phản hồi từ VNPAY (Return URL hoặc IPN)
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

  const isValidSignature = secureHash === signed;
  const responseCode = query['vnp_ResponseCode'];
  const isSuccess = isValidSignature && responseCode === '00';

  return {
    isSuccess,
    isValidSignature,
    responseCode,
    orderId: query['vnp_TxnRef'],
    amount: query['vnp_Amount'] ? parseInt(query['vnp_Amount'], 10) / 100 : 0,
    bankCode: query['vnp_BankCode'],
    transNo: query['vnp_TransactionNo']
  };
}

module.exports = {
  buildPaymentUrl,
  verifyReturnUrl
};

