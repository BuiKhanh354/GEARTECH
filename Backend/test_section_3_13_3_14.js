require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const Supplier = require('./models/Supplier');
const StockMovement = require('./models/StockMovement');

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
  console.log('================================================================');
  console.log('🚀 KIỂM THỬ SECTION 3.13 (SUPPLIERS) & 3.14 (STOCK MOVEMENTS)');
  console.log('================================================================');

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');

  // Tìm hoặc tạo Shop Owner
  let shopOwner = await User.findOne({ role: 'shop' });
  let shop = null;
  if (shopOwner) {
    shop = await Shop.findOne({ ownerId: shopOwner._id });
  }

  if (!shopOwner || !shop) {
    console.log('Tạo mới Shop & Shop Owner phục vụ kiểm thử...');
    shopOwner = await User.create({
      name: 'Test Shop Owner',
      email: `shop_owner_${Date.now()}@geartech.vn`,
      password: 'hashedpassword',
      role: 'shop',
      phone: '0988776655'
    });
    shop = await Shop.create({
      ownerId: shopOwner._id,
      shopName: 'GearTech Kho Vận Lab',
      description: 'Chuyên cung ứng linh kiện PC',
      status: 'active',
      phone: '0988776655',
      email: shopOwner.email,
      address: 'Hà Nội'
    });
  }

  const shopToken = jwt.sign(
    { id: shopOwner._id.toString(), email: shopOwner.email, role: 'shop', shopId: shop._id.toString() },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Tạo sản phẩm thử nghiệm kho
  const initialStock = 10;
  const testProduct = await Product.create({
    title: 'Intel Core i9-14900KS Box ' + Date.now().toString().slice(-4),
    slug: 'intel-i9-14900ks-' + Date.now(),
    price: 15500000,
    stock: initialStock,
    shopId: shop._id,
    status: 'active',
    category: 'cpu',
    description: 'CPU cao cấp phục vụ kiểm thử kho'
  });

  let testSupplierId = null;
  const supplierName = 'ASUS ROG Distributor ' + Date.now().toString().slice(-4);

  // 1. Thêm mới nhà cung cấp
  try {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        name: supplierName,
        contactName: 'Trưởng phòng cung ứng',
        phone: '0912345678',
        email: `contact_${Date.now()}@asusdist.vn`,
        address: 'Quận 1, TP. Hồ Chí Minh'
      })
    });
    const data = await res.json();
    testSupplierId = data.supplier?._id;
    assert(res.status === 201 && data.supplier?.name === supplierName, '1. Thêm mới nhà cung cấp thành công');
  } catch (err) {
    assert(false, `1. Thêm nhà cung cấp thất bại: ${err.message}`);
  }

  // 2. Chống trùng lặp tên nhà cung cấp trong cùng shop
  try {
    const res = await fetch(`${BASE_URL}/suppliers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        name: supplierName,
        phone: '0999999999',
        email: 'dup@asus.vn'
      })
    });
    assert(res.status === 400, '2. Chống trùng lặp nhà cung cấp trong cùng shop: Bị từ chối chính xác');
  } catch (err) {
    assert(false, `2. Chống trùng lặp thất bại: ${err.message}`);
  }

  // 3. Nhập kho từ nhà cung cấp (Import Stock)
  const importQty = 25;
  const refCode = `IMP-${Date.now().toString().slice(-6)}`;
  try {
    const res = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        type: 'import',
        quantity: importQty,
        supplierId: testSupplierId,
        unitCost: 14000000,
        reference: refCode,
        note: 'Nhập lô hàng chính hãng từ NPP'
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.newStock === (initialStock + importQty), '3. Nhập kho thành công & tồn kho cập nhật chính xác');
  } catch (err) {
    assert(false, `3. Nhập kho thất bại: ${err.message}`);
  }

  // 4. Kiểm tra sản phẩm trong CSDL sau khi nhập
  const updatedProdAfterImport = await Product.findById(testProduct._id);
  assert(updatedProdAfterImport.stock === (initialStock + importQty), `4. Tồn kho trong CSDL phản ánh đúng số lượng (${updatedProdAfterImport.stock} cái)`);

  // 5. Ngăn chặn xuất kho âm (Export vượt quá tồn kho hiện tại)
  try {
    const excessiveQty = updatedProdAfterImport.stock + 50;
    const res = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        type: 'export',
        quantity: excessiveQty,
        note: 'Cố tình xuất vượt tồn kho'
      })
    });
    assert(res.status === 400, '5. Ngăn chặn xuất kho âm: Từ chối xuất vượt tồn kho khả dụng thành công');
  } catch (err) {
    assert(false, `5. Ngăn chặn xuất kho âm thất bại: ${err.message}`);
  }

  // 6. Xuất kho hợp lệ (Hủy hàng hỏng/chuyển kho)
  const exportQty = 5;
  try {
    const res = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        type: 'export',
        quantity: exportQty,
        note: 'Xuất demo showroom'
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.newStock === (initialStock + importQty - exportQty), '6. Xuất kho hợp lệ thành công');
  } catch (err) {
    assert(false, `6. Xuất kho hợp lệ thất bại: ${err.message}`);
  }

  // 7. Chống ghi nhận trùng biến động do gọi lặp lại (Duplicate Reference Protection)
  try {
    const res = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        type: 'import',
        quantity: 10,
        reference: refCode // Gửi lại refCode vừa xử lý
      })
    });
    assert(res.status === 400, '7. Chống ghi nhận trùng mã tham chiếu (Anti-duplicate ref): Ngăn chặn thành công');
  } catch (err) {
    assert(false, `7. Anti-duplicate thất bại: ${err.message}`);
  }

  // 8. Kiểm kê điều chỉnh tồn kho (Adjustment)
  const auditedStock = 40;
  try {
    const res = await fetch(`${BASE_URL}/stock-movements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${shopToken}`
      },
      body: JSON.stringify({
        productId: testProduct._id.toString(),
        type: 'adjustment',
        actualStock: auditedStock,
        note: 'Kiểm kê định kỳ cuối tháng'
      })
    });
    const data = await res.json();
    assert(res.status === 201 && data.newStock === auditedStock, '8. Kiểm kê điều chỉnh kho (Adjustment) thành công');
  } catch (err) {
    assert(false, `8. Kiểm kê thất bại: ${err.message}`);
  }

  // 9. Lấy tóm tắt báo cáo tổng hợp kho của shop (GET /summary)
  try {
    const res = await fetch(`${BASE_URL}/stock-movements/summary`, {
      headers: { Authorization: `Bearer ${shopToken}` }
    });
    const data = await res.json();
    assert(res.status === 200 && data.totalImported >= importQty, `9. Báo cáo tổng hợp kho hoạt động chính xác (Tổng nhập: ${data.totalImported}, Tồn hiện tại: ${data.currentTotalStock})`);
  } catch (err) {
    assert(false, `9. Báo cáo kho thất bại: ${err.message}`);
  }

  // 10. Xóa nhà cung cấp đã có lịch sử nhập kho -> Phải tự động chuyển inactive để bảo toàn dữ liệu
  try {
    const res = await fetch(`${BASE_URL}/suppliers/${testSupplierId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${shopToken}` }
    });
    const data = await res.json();
    const supInDb = await Supplier.findById(testSupplierId);
    assert(
      supInDb && supInDb.status === 'inactive',
      '10. Bảo vệ toàn vẹn dữ liệu: Nhà cung cấp có biến động kho được tự động chuyển sang "inactive" thay vì xóa cứng'
    );
  } catch (err) {
    assert(false, `10. Bảo vệ toàn vẹn thất bại: ${err.message}`);
  }

  // Dọn dẹp dữ liệu kiểm thử
  await StockMovement.deleteMany({ product_id: testProduct._id });
  await Product.deleteOne({ _id: testProduct._id });
  await Supplier.deleteOne({ _id: testSupplierId });

  console.log('----------------------------------------------------------------');
  console.log(`🎯 KẾT QUẢ: ${passed}/${total} TESTS ĐẠT YÊU CẦU`);
  console.log('================================================================');
  process.exit(0);
}

runTests();
