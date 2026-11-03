const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'GEARTECH_VALORANT_EDITION_SECRET_2026';

async function testSimulate() {
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  const Order = require('../models/Order');
  const Payment = require('../models/Payment');
  const User = require('../models/User');

  let user = await User.findOne();
  const token = jwt.sign({ id: user._id, role: user.role || 'customer' }, JWT_SECRET, { expiresIn: '1h' });

  const testOrder = await Order.create({
    userId: user._id,
    totalAmount: 200000,
    shippingFee: 30000,
    finalAmount: 230000,
    paymentMethod: 'MOMO',
    paymentStatus: 'pending',
    orderStatus: 'pending',
    shipping_address: '123 Đường Test MoMo, Quận 1, TP.HCM',
    phone: '0901234567',
    receiver_name: 'Khách Test MoMo',
    items: []
  });

  console.log('Tạo đơn hàng test:', testOrder._id, 'Trạng thái ban đầu:', testOrder.paymentStatus, testOrder.orderStatus);

  const res = await fetch('http://127.0.0.1:5000/api/payments/momo/simulate-success', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ orderId: testOrder._id })
  });

  const resJson = await res.json();
  console.log('API Response:', resJson.message);

  const updatedOrder = await Order.findById(testOrder._id);
  const payment = await Payment.findOne({ order_id: testOrder._id });

  console.log('\n--- KẾT QUẢ XÁC THỰC THANH TOÁN MOMO ---');
  console.log('✓ Payment Status:', updatedOrder.paymentStatus);
  console.log('✓ Order Status:', updatedOrder.orderStatus);
  console.log('✓ Giao dịch:', payment?.transaction_code);
  console.log('✓ MoMo TransID:', payment?.payment_details?.momoTransId);

  await mongoose.disconnect();
}

testSimulate().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
