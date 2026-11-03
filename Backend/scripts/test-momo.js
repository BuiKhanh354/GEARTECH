const crypto = require('crypto');

const partnerCode = 'MOMO';
const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const endpoint = 'https://test-payment.momo.vn/v2/gateway/api/create';

async function run() {
  const reqTypes = ['captureWallet', 'payWithMethod', 'payWithATM', 'payWithCC'];
  for (const rt of reqTypes) {
    const orderId = 'MOMO' + Date.now();
    const requestId = orderId;
    const amount = 50000;
    const orderInfo = 'Thanh toan don hang';
    const redirectUrl = 'https://momo.vn';
    const ipnUrl = 'https://momo.vn';
    const extraData = '';

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${rt}`;
    const signature = crypto.createHmac('sha256', secretKey).update(rawSignature).digest('hex');

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode,
        partnerName: 'Test',
        storeId: 'MomoTest',
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl,
        ipnUrl,
        lang: 'vi',
        requestType: rt,
        autoCapture: true,
        extraData,
        signature
      })
    });
    const json = await res.json();
    console.log(`Type: ${rt} => Code: ${json.resultCode}, Msg: ${json.message}`);
    if (json.payUrl) {
      console.log('SUCCESS PAY URL:', json.payUrl);
      break;
    }
  }
}

run();
