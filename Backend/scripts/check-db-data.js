const mongoose = require('mongoose');

async function run() {
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  const Shipment = require('../models/Shipment');
  const Order = require('../models/Order');

  const shipments = await Shipment.find().sort({ createdAt: -1 }).limit(10);
  console.log('--- SHIPMENTS (VẬN ĐƠN) TRONG MONGODB ---');
  console.log(shipments.map(s => ({
    tracking_code: s.tracking_code,
    receiver: s.receiver_info,
    sender: s.sender_info,
    status: s.shipping_status
  })));

  const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
  console.log('\n--- ORDERS (ĐƠN HÀNG) TRONG MONGODB ---');
  console.log(orders.map(o => ({
    id: o._id,
    receiver_name: o.receiver_name,
    phone: o.phone,
    address: o.shipping_address,
    tracking_code: o.tracking_code,
    orderStatus: o.orderStatus
  })));

  await mongoose.disconnect();
}

run();
