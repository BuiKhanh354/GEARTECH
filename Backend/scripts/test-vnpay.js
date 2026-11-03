const crypto = require('crypto');
const qs = require('qs');

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

async function testVnpayUrl() {
  const tmnCode = 'CGXZLS0Z';
  const secretKey = 'XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN';
  const vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = 'http://localhost:5173/payment/vnpay-return';

  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const createDate = `${year}${month}${day}${hours}${minutes}${seconds}`;
  const orderId = 'GT' + Date.now();
  const amount = 50000;

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: 'Thanh toan don hang GearTech #' + orderId,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '13.160.92.202',
    vnp_CreateDate: createDate
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
  console.log('Testing VNPay URL HTTP status...');
  const res = await fetch(paymentUrl);
  console.log('HTTP Status:', res.status, res.statusText);
  const html = await res.text();
  console.log('Response length:', html.length);
  if (html.includes('VNPAY') || html.includes('vnpay')) {
    console.log('>>> SUCCESS: VNPay Sandbox Gateway page loaded successfully!');
  } else {
    console.log('Page snippet:', html.slice(0, 300));
  }
}

testVnpayUrl().catch(console.error);
