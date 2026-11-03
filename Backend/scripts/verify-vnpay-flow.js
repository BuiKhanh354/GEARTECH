const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'GEARTECH_VALORANT_EDITION_SECRET_2026';

async function verifyVNPayFlow() {
  console.log('--- KIỂM THỬ TÍCH HỢP CỔNG THANH TOÁN VNPAY CHO GEARTECH ---');
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  
  const Order = require('../models/Order');
  const Payment = require('../models/Payment');
  const User = require('../models/User');

  let user = await User.findOne();
  const token = jwt.sign({ id: user._id, role: user.role || 'customer' }, JWT_SECRET, { expiresIn: '1h' });

  // 1. Tạo 1 đơn hàng kiểm thử
  const testOrder = await Order.create({
    userId: user._id,
    totalAmount: 1500000,
    shippingFee: 30000,
    finalAmount: 1530000,
    paymentMethod: 'VNPAY',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shipping_address: '18A/1 Cộng Hòa, Tân Bình, TP.HCM',
    phone: '0938793972',
    receiver_name: 'Khách Test VNPAY',
    items: []
  });

  console.log('1. Đã tạo đơn hàng test:', testOrder._id, '| Số tiền: 1.530.000 đ');

  // 2. Khởi tạo phiên thanh toán qua API /api/payments/create-intent
  const intentRes = await fetch('http://127.0.0.1:5000/api/payments/create-intent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      orderId: testOrder._id,
      paymentMethod: 'VNPAY'
    })
  });

  const intentData = await intentRes.json();
  console.log('2. API /create-intent phản hồi:');
  console.log('   - Transaction Code:', intentData.transactionCode);
  console.log('   - Payment Method:', intentData.paymentMethod);
  console.log('   - VNPAY Gateway URL:', intentData.instruction?.checkoutUrl?.slice(0, 80) + '...');

  // 3. Kiểm tra tính hợp lệ của VNPAY Gateway URL
  const vnpayHttpRes = await fetch(intentData.instruction.checkoutUrl);
  console.log('3. Gọi trực tiếp cổng VNPAY Sandbox:');
  console.log('   - HTTP Status:', vnpayHttpRes.status, vnpayHttpRes.statusText);
  if (vnpayHttpRes.status === 200) {
    console.log('   ✓ Cổng VNPAY Sandbox hoạt động tốt 100%!');
  }

  // 4. Kiểm thử xác thực giao dịch thành công (Simulate hoặc IPN)
  const verifyRes = await fetch('http://127.0.0.1:5000/api/payments/vnpay/simulate-success', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId: testOrder._id })
  });

  const verifyData = await verifyRes.json();
  console.log('4. Xác thực kết quả thanh toán VNPAY:');
  console.log('   - Message:', verifyData.message);

  const updatedOrder = await Order.findById(testOrder._id);
  const payment = await Payment.findOne({ order_id: testOrder._id });

  console.log('\n--- KẾT QUẢ ĐƠN HÀNG SAU KHI VNPAY THANH TOÁN ---');
  console.log('✓ Payment Status:', updatedOrder.paymentStatus);
  console.log('✓ Order Status:', updatedOrder.orderStatus);
  console.log('✓ Mã giao dịch Payment:', payment?.transaction_code);
  console.log('✓ Chi tiết cổng:', payment?.payment_details);

  await mongoose.disconnect();
}

verifyVNPayFlow().then(() => process.exit(0)).catch(err => {
  console.error('Lỗi kiểm thử VNPAY:', err);
  process.exit(1);
});

