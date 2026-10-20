require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Customer = require('./models/Customer');

async function seedStandardAccounts() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');
  console.log('Connected to MongoDB');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('123456', salt);

  // 1. ADMIN
  let admin = await User.findOne({ email: 'admin@geartech.vn' });
  if (!admin) {
    admin = new User({
      name: 'Quản Trị Viên GearTech',
      email: 'admin@geartech.vn',
      phone: '0901234567',
      role: 'admin',
      status: 'active'
    });
  }
  admin.password = hashedPassword;
  admin.role = 'admin';
  admin.status = 'active';
  await admin.save();
  console.log('✅ Admin account: admin@geartech.vn / 123456');

  // 2. SHOP OWNER
  let shopOwner = await User.findOne({ email: 'shop@geartech.vn' });
  if (!shopOwner) {
    shopOwner = new User({
      name: 'Chủ Gian Hàng GearTech',
      email: 'shop@geartech.vn',
      phone: '0988776655',
      role: 'shop',
      status: 'active'
    });
  }
  shopOwner.password = hashedPassword;
  shopOwner.role = 'shop';
  shopOwner.status = 'active';

  // Liên kết với Shop chính (Gear Tech Store)
  let mainShop = await Shop.findById('6ac11efa2de58adcc60f3c56');
  if (!mainShop) {
    mainShop = await Shop.findOne({ status: 'active' });
  }
  if (mainShop) {
    shopOwner.shopId = mainShop._id;
    await shopOwner.save();
    mainShop.ownerId = shopOwner._id;
    await mainShop.save();
    console.log(`✅ Shop Owner account: shop@geartech.vn / 123456 (Cửa hàng: ${mainShop.name || mainShop.shopName})`);
  } else {
    await shopOwner.save();
    console.log('✅ Shop Owner account: shop@geartech.vn / 123456');
  }

  // 3. KHÁCH HÀNG (CUSTOMER)
  let customer = await User.findOne({ email: 'customer@geartech.vn' });
  if (!customer) {
    customer = new User({
      name: 'Nguyễn Văn Khách',
      email: 'customer@geartech.vn',
      phone: '0912345678',
      role: 'user',
      status: 'active',
      memberRank: 'VANG',
      points: 2500,
      addresses: [{
        title: 'Nhà riêng',
        receiverName: 'Nguyễn Văn Khách',
        receiverPhone: '0912345678',
        detailAddress: 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội',
        isDefault: true
      }]
    });
  }
  customer.password = hashedPassword;
  customer.role = 'user';
  customer.status = 'active';
  await customer.save();

  // Đồng bộ sang Customer model
  await Customer.findOneAndUpdate(
    { userId: customer._id },
    {
      userId: customer._id,
      user_id: customer._id,
      full_name: 'Nguyễn Văn Khách',
      name: 'Nguyễn Văn Khách',
      email: 'customer@geartech.vn',
      phone: '0912345678',
      address: 'Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội'
    },
    { upsert: true, new: true }
  );
  console.log('✅ Customer account: customer@geartech.vn / 123456');

  // Đảm bảo cả customer@gmail.com cũng có mật khẩu 123456
  const oldCustomer = await User.findOne({ email: 'customer@gmail.com' });
  if (oldCustomer) {
    oldCustomer.password = hashedPassword;
    await oldCustomer.save();
    console.log('✅ Secondary customer: customer@gmail.com / 123456');
  }

  process.exit(0);
}

seedStandardAccounts().catch(console.error);
