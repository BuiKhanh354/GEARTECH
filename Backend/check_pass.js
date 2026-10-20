require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Shop = require('./models/Shop');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');
  const users = await User.find({});
  console.log('Total users:', users.length);
  for (const u of users) {
    let matchedPass = 'unknown';
    const testList = ['123456', 'password123', 'adminpassword', 'admin123', 'admin', 'password'];
    for (const p of testList) {
      if (await bcrypt.compare(p, u.password)) {
        matchedPass = p;
        break;
      }
    }
    const shop = await Shop.findOne({ ownerId: u._id });
    console.log(`Email: ${u.email} | Role: ${u.role} | Pass: ${matchedPass} | Shop: ${shop ? shop.shopName : 'None'}`);
  }
  process.exit(0);
}
check();
