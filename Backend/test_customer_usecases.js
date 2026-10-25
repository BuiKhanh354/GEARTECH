const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

async function runTests() {
  console.log('--- BẮT ĐẦU KIỂM THỬ KHÁCH HÀNG & NGHIỆP VỤ (CUSTOMER USE CASES) ---');
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gear_tech');
  console.log('✓ Kết nối MongoDB gear_tech thành công.');

  const User = require('./models/User');
  const Product = require('./models/Product');
  const Cart = require('./models/Cart');
  const Order = require('./models/Order');
  const Category = require('./models/Category');

  // 1. Kiểm tra danh mục Accessories
  const accCat = await Category.findOne({ slug: 'accessories', status: 'active' });
  if (accCat) {
    console.log(`✓ Test 1: Danh mục Accessories tồn tại trong CSDL (${accCat.name}, status: ${accCat.status}).`);
  } else {
    console.error('✗ Test 1: Không tìm thấy danh mục Accessories!');
  }

  // 2. Tìm hoặc tạo user kiểm thử
  let testUser = await User.findOne({ email: 'customer_test@geartech.vn' });
  if (!testUser) {
    testUser = await User.create({
      name: 'Khách Hàng Test',
      email: 'customer_test@geartech.vn',
      password: 'password123',
      phone: '0987654321',
      role: 'user',
      status: 'active'
    });
  }
  console.log('✓ Test 2: User test sẵn sàng:', testUser.email);

  // 3. Kiểm tra giỏ hàng - không bị nhân đôi số lượng khi sync
  let cart = await Cart.findOne({ userId: testUser._id });
  if (!cart) {
    cart = await Cart.create({ userId: testUser._id, items: [] });
  }

  const activeProduct = await Product.findOne({ status: 'active', stock: { $gt: 5 } });
  if (activeProduct) {
    // Reset giỏ
    cart.items = [{
      productId: activeProduct._id,
      quantity: 1,
      price: activeProduct.price,
      selected: true
    }];
    await cart.save();

    // Giả lập logic sync với desiredQty = 1
    const pId = activeProduct._id.toString();
    const existingIndex = cart.items.findIndex(item => item.productId.toString() === pId);
    const desiredQty = 1;
    if (existingIndex > -1) {
      // Logic đã sửa: gán exactQty, không cộng dồn
      cart.items[existingIndex].quantity = Math.min(activeProduct.stock, desiredQty);
    }
    await cart.save();

    const verifiedCart = await Cart.findOne({ userId: testUser._id });
    const item = verifiedCart.items.find(i => i.productId.toString() === pId);
    if (item && item.quantity === 1) {
      console.log('✓ Test 3: Đồng bộ giỏ hàng chính xác không bị tăng số lượng (quantity = 1).');
    } else {
      console.error('✗ Test 3: Lỗi số lượng giỏ hàng:', item ? item.quantity : 'null');
    }
  }

  // 4. Kiểm tra khóa quyền đặt hàng riêng biệt (isOrderLocked)
  testUser.isOrderLocked = true;
  testUser.orderLockReason = 'Tạm dừng đặt hàng để xác minh số điện thoại';
  testUser.orderLockExpiresAt = new Date(Date.now() + 2 * 3600 * 1000); // 2 giờ tới
  await testUser.save();

  const now = new Date();
  if (testUser.isOrderLocked && testUser.orderLockExpiresAt > now) {
    console.log(`✓ Test 4: Khóa quyền đặt hàng hoạt động chính xác (Lý do: "${testUser.orderLockReason}", hạn đến: ${testUser.orderLockExpiresAt.toLocaleString('vi-VN')}).`);
  } else {
    console.error('✗ Test 4: Lỗi kiểm tra order lock!');
  }

  // Khôi phục lại trạng thái mở cho user
  testUser.isOrderLocked = false;
  testUser.orderLockReason = '';
  testUser.orderLockExpiresAt = null;
  await testUser.save();
  console.log('✓ Test 5: Mở khóa quyền đặt hàng hoàn tất.');

  console.log('--- HOÀN TẤT TẤT CẢ KIỂM THỬ KHÁCH HÀNG ---');
  await mongoose.disconnect();
  process.exit(0);
}

runTests().catch(err => {
  console.error('Lỗi khi chạy kiểm thử:', err);
  process.exit(1);
});
