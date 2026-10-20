require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');

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
  console.log('========================================================');
  console.log('🚀 KIỂM THỬ SECTION 3.17 - QUẢN LÝ VOUCHER & MÃ GIẢM GIÁ');
  console.log('========================================================');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');
  const adminUser = await User.findOne({ role: 'admin' });
  if (!adminUser) {
    console.error('Không tìm thấy tài khoản admin trong database!');
    process.exit(1);
  }

  // Token cho Admin
  const adminToken = jwt.sign(
    { id: adminUser._id.toString(), email: adminUser.email, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  let testVoucherId = null;
  const testCode = 'TESTPCT_' + Date.now().toString().slice(-4);

  // 1. Admin tạo voucher dạng phần trăm (%)
  try {
    const res = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: testCode,
        name: 'Voucher giảm 15%',
        description: 'Giảm 15% tối đa 150.000 VND cho đơn từ 500.000 VND',
        discountType: 'percentage',
        discountValue: 15,
        minOrderValue: 500000,
        maxDiscount: 150000,
        maxUses: 10,
        expiryDate: '2026-12-31'
      })
    });
    const data = await res.json();
    testVoucherId = data.voucher?._id;
    assert(res.status === 201 && data.voucher?.code === testCode, '1. Admin tạo voucher phần trăm thành công');
  } catch (err) {
    assert(false, `1. Admin tạo voucher phần trăm thất bại: ${err.message}`);
  }

  // 2. Chống tạo voucher trùng mã code
  try {
    const res = await fetch(`${BASE_URL}/vouchers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        code: testCode,
        description: 'Trùng mã code',
        discountValue: 50000
      })
    });
    assert(res.status === 400, '2. Ngăn tạo trùng mã code: Bị từ chối chính xác');
  } catch (err) {
    assert(false, `2. Ngăn tạo trùng mã code thất bại: ${err.message}`);
  }

  // 3. Khách hàng validate voucher phần trăm (dưới đơn tối thiểu => phải lỗi)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCode,
        orderValue: 300000 // Thấp hơn 500k
      })
    });
    assert(res.status === 400, '3. Kiểm tra đơn tối thiểu: Từ chối đơn chưa đạt giá trị tối thiểu');
  } catch (err) {
    assert(false, `3. Kiểm tra đơn tối thiểu thất bại: ${err.message}`);
  }

  // 4. Khách hàng validate voucher phần trăm (đạt điều kiện => tính đúng số tiền và áp trần maxDiscount)
  try {
    // 2.000.000 VND * 15% = 300.000 VND -> Bị khống chế trần maxDiscount 150.000 VND
    const res = await fetch(`${BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCode,
        orderValue: 2000000
      })
    });
    const data = await res.json();
    assert(
      data.discountValue === 150000,
      `4. Tính toán mức giảm phần trăm chính xác theo trần maxDiscount: Giảm ${data.discountValue} VND (Kỳ vọng 150.000 VND)`
    );
  } catch (err) {
    assert(false, `4. Tính toán mức giảm phần trăm thất bại: ${err.message}`);
  }

  // 5. Admin đổi trạng thái voucher (active -> inactive)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'inactive' })
    });
    const data = await res.json();
    assert(data.voucher?.status === 'inactive', '5. Admin chuyển trạng thái voucher sang "inactive" thành công');
  } catch (err) {
    assert(false, `5. Admin chuyển trạng thái thất bại: ${err.message}`);
  }

  // 6. Khách hàng validate voucher đã bị tạm khóa (inactive => phải từ chối)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: testCode,
        orderValue: 1000000
      })
    });
    assert(res.status === 400, '6. Kiểm tra trạng thái tạm khóa: Từ chối áp dụng voucher inactive thành công');
  } catch (err) {
    assert(false, `6. Kiểm tra trạng thái tạm khóa thất bại: ${err.message}`);
  }

  // 7. Admin kích hoạt lại voucher (inactive -> active)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/${testVoucherId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'active' })
    });
    const data = await res.json();
    assert(data.voucher?.status === 'active', '7. Admin kích hoạt lại voucher thành công');
  } catch (err) {
    assert(false, `7. Admin kích hoạt lại thất bại: ${err.message}`);
  }

  // 8. Admin cập nhật chi tiết voucher (PUT)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/${testVoucherId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        description: 'Voucher cập nhật siêu ưu đãi',
        maxUses: 50
      })
    });
    const data = await res.json();
    assert(
      data.voucher?.description === 'Voucher cập nhật siêu ưu đãi' && data.voucher?.maxUses === 50,
      '8. Admin cập nhật thông tin voucher thành công'
    );
  } catch (err) {
    assert(false, `8. Admin cập nhật voucher thất bại: ${err.message}`);
  }

  // 9. Admin lấy danh sách toàn bộ voucher quản trị (GET /admin)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert(Array.isArray(data) && data.length > 0, `9. Admin lấy danh sách toàn bộ voucher thành công (${data.length} mã)`);
  } catch (err) {
    assert(false, `9. Admin lấy danh sách voucher thất bại: ${err.message}`);
  }

  // 10. Admin xóa voucher an toàn (DELETE /:id)
  try {
    const res = await fetch(`${BASE_URL}/vouchers/${testVoucherId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(res.status === 200, '10. Admin xóa voucher thành công');
  } catch (err) {
    assert(false, `10. Admin xóa voucher thất bại: ${err.message}`);
  }

  console.log('--------------------------------------------------------');
  console.log(`🎯 KẾT QUẢ: ${passed}/${total} TESTS ĐẠT YÊU CẦU`);
  console.log('========================================================');
  process.exit(0);
}

runTests();
