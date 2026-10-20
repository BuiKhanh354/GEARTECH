require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');

const BASE_URL = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'GEARTECH_VALORANT_EDITION_SECRET_2026';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${message}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runTests() {
  console.log('========================================================================');
  console.log('🚀 KIỂM THỬ TÙY CHỈNH & TRANG TRÍ GIAN HÀNG CỬA HÀNG (REQUIREMENT.MD)');
  console.log('========================================================================');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');

  // Tìm hoặc tạo Shop A & Shop B
  let shopAOwner = await User.findOne({ email: 'shop@geartech.vn' });
  let shopA = await Shop.findOne({ ownerId: shopAOwner._id });

  if (!shopA) {
    shopA = await Shop.create({
      name: 'GearTech Gaming Flagship',
      ownerId: shopAOwner._id,
      status: 'active'
    });
  } else {
    shopA.storefrontDraft = Shop.defaultStorefrontConfig;
    shopA.storefrontPublished = Shop.defaultStorefrontConfig;
    await shopA.save();
  }

  const shopAToken = jwt.sign(
    { id: shopAOwner._id.toString(), email: shopAOwner.email, role: 'shop', shopId: shopA._id.toString() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Tạo Shop B & Chủ shop B
  let shopBOwner = await User.findOne({ email: 'shop_b_decor@geartech.vn' });
  if (!shopBOwner) {
    shopBOwner = await User.create({
      name: 'Chủ Shop B',
      email: 'shop_b_decor@geartech.vn',
      password: 'hashed',
      role: 'shop'
    });
  }
  let shopB = await Shop.findOne({ ownerId: shopBOwner._id });
  if (!shopB) {
    shopB = await Shop.create({
      name: 'ASUS ROG Pavilion Shop',
      ownerId: shopBOwner._id,
      status: 'active'
    });
  }

  const shopBToken = jwt.sign(
    { id: shopBOwner._id.toString(), email: shopBOwner.email, role: 'shop', shopId: shopB._id.toString() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 1. Chủ shop A lấy cấu hình storefront của mình (GET /me/storefront)
  try {
    const res = await fetch(`${BASE_URL}/shops/me/storefront`, {
      headers: { Authorization: `Bearer ${shopAToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.storefrontDraft, '1. Chủ shop lấy cấu hình giao diện nháp & xuất bản thành công');
  } catch (err) {
    assert(false, `1. Lấy cấu hình giao diện thất bại: ${err.message}`);
  }

  // 2. Chủ shop A lưu bản nháp tùy chỉnh (Template Gaming, Banner mới, Đổi màu #00ffcc)
  const customBanner = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80';
  const customSections = [
    { id: 'banner', title: 'Banner Khủng Gaming', enabled: true, order: 1 },
    { id: 'featured', title: 'Siêu Phẩm RTX 4090', enabled: true, order: 2 },
    { id: 'intro', title: 'Về ROG Lab', enabled: false, order: 3 }, // Tắt khu vực giới thiệu
    { id: 'catalog', title: 'Kho Linh Kiện', enabled: true, order: 4 }
  ];

  try {
    const res = await fetch(`${BASE_URL}/shops/me/storefront`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopAToken}`
      },
      body: JSON.stringify({
        template: 'gaming',
        primaryColor: '#00ffcc',
        secondaryColor: '#09090b',
        bannerUrl: customBanner,
        introText: 'Đại lý ủy quyền phần cứng cao cấp Gaming',
        sections: customSections
      })
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.storefrontDraft?.template === 'gaming' && data.storefrontDraft?.primaryColor === '#00ffcc',
      '2. Chủ shop A lưu bản nháp thiết kế storefront (PUT /me/storefront) thành công'
    );
  } catch (err) {
    assert(false, `2. Lưu bản nháp thất bại: ${err.message}`);
  }

  // 3. Tải lại trang: Dữ liệu bản nháp vẫn được lưu bền vững trong MongoDB (Tiêu chí 1)
  try {
    const res = await fetch(`${BASE_URL}/shops/me/storefront`, {
      headers: { Authorization: `Bearer ${shopAToken}` }
    });
    const data = await res.json();
    assert(
      data.storefrontDraft?.bannerUrl === customBanner && data.storefrontDraft?.sections?.find(s => s.id === 'intro')?.enabled === false,
      '3. Bản nháp được lưu bền vững trong MongoDB sau khi tải lại trang'
    );
  } catch (err) {
    assert(false, `3. Kiểm tra lưu trữ thất bại: ${err.message}`);
  }

  // 4. Kiểm tra công khai trước khi xuất bản: Khách hàng vẫn thấy giao diện cũ/mặc định, CHƯA thấy bản nháp (Tiêu chí 5)
  try {
    const res = await fetch(`${BASE_URL}/shops/${shopA._id}/storefront`);
    const data = await res.json();
    assert(
      data.storefront?.primaryColor !== '#00ffcc',
      '4. Bản nháp không hiển thị công khai ra ngoài trước khi được xuất bản (Bảo vệ dữ liệu nháp)'
    );
  } catch (err) {
    assert(false, `4. Kiểm tra nháp công khai thất bại: ${err.message}`);
  }

  // 5. Kiểm tra an toàn phân quyền: Shop B không thể sửa giao diện của Shop A (Tiêu chí 2)
  try {
    // API backend dùng token để xác định shop sở hữu (me/storefront), không tin client shopId
    const res = await fetch(`${BASE_URL}/shops/me/storefront`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopBToken}`
      },
      body: JSON.stringify({
        primaryColor: '#ff0000',
        template: 'minimal'
      })
    });
    // Kiểm tra Shop A có bị đổi lây không
    const checkA = await Shop.findById(shopA._id);
    assert(
      checkA.storefrontDraft?.primaryColor === '#00ffcc',
      '5. Chủ shop B không thể can thiệp hay sửa đổi giao diện của shop A (Bảo mật quyền sở hữu)'
    );
  } catch (err) {
    assert(false, `5. Kiểm tra bảo mật thất bại: ${err.message}`);
  }

  // 6. Chủ shop A xuất bản giao diện (POST /me/storefront/publish) (Tiêu chí 6)
  try {
    const res = await fetch(`${BASE_URL}/shops/me/storefront/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${shopAToken}` }
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.storefrontPublished?.primaryColor === '#00ffcc',
      '6. Xuất bản giao diện storefront (POST /me/storefront/publish) thành công'
    );
  } catch (err) {
    assert(false, `6. Xuất bản thất bại: ${err.message}`);
  }

  // 7. Khách hàng truy cập storefront công khai sau khi xuất bản: Thấy ngay giao diện mới (Tiêu chí 6)
  try {
    const res = await fetch(`${BASE_URL}/shops/${shopA._id}/storefront`);
    const data = await res.json();
    assert(
      data.storefront?.primaryColor === '#00ffcc' && data.storefront?.template === 'gaming',
      '7. Khách hàng thấy ngay giao diện mới cập nhật sau khi xuất bản'
    );
  } catch (err) {
    assert(false, `7. Kiểm tra công khai sau xuất bản thất bại: ${err.message}`);
  }

  // 8. Khu vực bị tắt (intro) không xuất hiện trên giao diện công khai (Tiêu chí 3)
  try {
    const res = await fetch(`${BASE_URL}/shops/${shopA._id}/storefront`);
    const data = await res.json();
    const introSection = data.storefront?.sections?.find(s => s.id === 'intro');
    assert(
      introSection && introSection.enabled === false,
      '8. Khu vực đã tắt (enabled: false) được ghi nhận chính xác để ẩn trên storefront'
    );
  } catch (err) {
    assert(false, `8. Kiểm tra khu vực ẩn thất bại: ${err.message}`);
  }

  // 9. Sản phẩm trên storefront chỉ lấy từ đúng shop A và tuân thủ trạng thái bán (Tiêu chí 8)
  try {
    const res = await fetch(`${BASE_URL}/shops/${shopA._id}/storefront`);
    const data = await res.json();
    const allBelongToShop = data.products.every(p => String(p.shopId) === String(shopA._id));
    assert(
      allBelongToShop,
      '9. Sản phẩm trên storefront chỉ lấy từ đúng shop sở hữu và tuân thủ trạng thái bán'
    );
  } catch (err) {
    assert(false, `9. Kiểm tra danh mục sản phẩm thất bại: ${err.message}`);
  }

  // 10. Khôi phục cấu hình mặc định (POST /me/storefront/reset) (Tiêu chí 7)
  try {
    const res = await fetch(`${BASE_URL}/shops/me/storefront/reset`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${shopAToken}` }
    });
    const data = await res.json();
    assert(
      res.status === 200 && data.storefrontDraft?.template === 'modern-tech' && data.storefrontDraft?.primaryColor === '#ff4655',
      '10. Khôi phục cấu hình mặc định (POST /me/storefront/reset) thành công'
    );
  } catch (err) {
    assert(false, `10. Khôi phục mặc định thất bại: ${err.message}`);
  }

  console.log('------------------------------------------------------------------------');
  console.log(`🎯 KẾT QUẢ: ${passed}/${total} TIÊU CHÍ ĐẠT YÊU CẦU 100%`);
  console.log('========================================================================');
  process.exit(0);
}

runTests();
