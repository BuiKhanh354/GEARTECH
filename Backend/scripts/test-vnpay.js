const crypto = require('crypto');
const qs = require('qs');

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
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

async function testVnpayUrl() {
  const tmnCode = process.env.VNP_TMN_CODE || '5GWMVNEI';
  const secretKey = process.env.VNP_HASH_SECRET || 'SSNYYNZFJDFBAVMNXPAEQMWVCHXUMOHQ';
  const vnpUrl = process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  const returnUrl = process.env.VNP_RETURN_URL || 'http://localhost:5000/api/payments/vnpay/return';

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
  const parts = vnFormatter.formatToParts(new Date());
  const p = {};
  parts.forEach(({ type, value }) => { p[type] = value; });
  const createDate = `${p.year}${p.month}${p.day}${p.hour}${p.minute}${p.second}`;

  const orderId = 'GT' + Date.now();
  const amount = 50000;

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: tmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: 'Thanh toan don hang GearTech ' + orderId,
    vnp_OrderType: 'other',
    vnp_Amount: amount * 100,
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: '127.0.0.1',
    vnp_CreateDate: createDate
  };

  vnp_Params = sortObject(vnp_Params);
  const signData = qs.stringify(vnp_Params, { encode: false });
  const hmac = crypto.createHmac('sha512', secretKey);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  vnp_Params['vnp_SecureHash'] = signed;

  const paymentUrl = vnpUrl + '?' + qs.stringify(vnp_Params, { encode: false });
  console.log('Testing VNPay URL HTTP status...');
  console.log('Payment URL:', paymentUrl);

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
