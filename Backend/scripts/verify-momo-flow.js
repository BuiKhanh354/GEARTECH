async function testMoMoFlow() {
  console.log('Testing MoMo Payment flow via Backend API...');
  
  const mongoose = require('mongoose');
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  const Order = require('../models/Order');
  const order = await Order.findOne({ finalAmount: { $gt: 0 } }).sort({ createdAt: -1 });
  
  const orderId = order ? order._id : 'GT_' + Date.now();
  const amount = order?.finalAmount || 485000;

  console.log(`Đã chọn đơn hàng #${orderId} - Số tiền: ${amount.toLocaleString('vi-VN')} đ`);
  
  const momoService = require('../services/momoService');
  const result = await momoService.createPayment({
    orderId,
    amount,
    orderInfo: `Thanh toan don hang GearTech GT${String(orderId).slice(-8).toUpperCase()}`
  });

  console.log('\n--- KẾT QUẢ TẠO PHIÊN THANH TOÁN MOMO ---');
  console.log('✓ Mã đơn hàng:', result.orderId);
  console.log('✓ Số tiền:', result.amount.toLocaleString('vi-VN'), 'VND');
  console.log('✓ Mã QR MoMo:', result.qrCodeUrl);
  console.log('✓ MoMo Deeplink App:', result.deeplink);
  console.log('✓ Trạng thái:', result.message);

  await mongoose.disconnect();
}

testMoMoFlow().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
