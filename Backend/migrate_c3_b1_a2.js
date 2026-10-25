/**
 * Script migration an toàn (chạy 1 lần):
 * 1. B1: Tính lại soldCount cho toàn bộ sản phẩm từ dữ liệu đơn hàng COMPLETED thực tế.
 * 2. C3: Backfill warehouseStock = 0 và listedQty = stock cho sản phẩm cũ
 *    (coi như toàn bộ tồn kho hiện tại đã được đăng bán — đúng với dữ liệu cũ).
 * 3. A2: Tạo danh mục "Accessories" nếu chưa tồn tại (không tạo trùng).
 *
 * Script KHÔNG xóa bất kỳ dữ liệu nào, chỉ cập nhật bổ sung.
 * Cách chạy: node migrate_c3_b1_a2.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Order = require('./models/Order');
const Category = require('./models/Category');

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/geartech';
  console.log('🔄 Kết nối MongoDB:', uri);
  await mongoose.connect(uri);
  console.log('✅ Đã kết nối database.');

  // ---------- 1. B1: soldCount từ đơn hàng COMPLETED ----------
  console.log('\n📈 [B1] Đang tính số lượng đã bán từ đơn hàng hoàn tất...');
  const soldAgg = await Order.aggregate([
    { $match: { $or: [{ order_status: 'completed' }, { orderStatus: 'completed' }] } },
    { $unwind: '$items' },
    {
      $group: {
        _id: { $ifNull: ['$items.productId', '$items.product_id'] },
        totalQty: { $sum: { $ifNull: ['$items.quantity', '$items.qty'] } }
      }
    }
  ]);

  let updatedSold = 0;
  for (const row of soldAgg) {
    if (!row._id) continue;
    const qty = Number(row.totalQty) || 0;
    const res = await Product.updateOne(
      { _id: row._id },
      { $set: { soldCount: qty, salesCount: `ĐÃ BÁN ${qty}` } }
    );
    updatedSold += res.matchedCount;
  }
  // Sản phẩm không có đơn hoàn tất nào -> soldCount = 0 (nếu chưa từng có giá trị)
  const zeroRes = await Product.updateMany(
    { soldCount: { $exists: false } },
    { $set: { soldCount: 0, salesCount: 'ĐÃ BÁN 0' } }
  );
  console.log(`   -> Cập nhật soldCount cho ${updatedSold} sản phẩm có đơn hoàn tất; khởi tạo ${zeroRes.modifiedCount} sản phẩm còn lại về 0.`);

  // ---------- 2. C3: Backfill warehouseStock / listedQty ----------
  console.log('\n📦 [C3] Đang backfill trường phân bổ kho cho dữ liệu cũ...');
  const backfill = await Product.updateMany(
    { $or: [{ warehouseStock: { $exists: false } }, { warehouseStock: null }] },
    [
      {
        $set: {
          warehouseStock: 0,
          listedQty: { $ifNull: ['$stock', 0] }
        }
      }
    ],
    { updatePipeline: true }
  );
  console.log(`   -> Đã backfill ${backfill.modifiedCount} sản phẩm (warehouseStock=0, listedQty=stock).`);

  // ---------- 3. A2: Danh mục Accessories ----------
  console.log('\n🛍️ [A2] Kiểm tra danh mục Accessories...');
  const slug = 'accessories';
  const existing = await Category.findOne({ slug });
  if (existing) {
    console.log(`   -> Danh mục "${existing.name}" (slug: ${slug}) đã tồn tại, không tạo trùng.`);
    if (existing.status !== 'active') {
      existing.status = 'active';
      await existing.save();
      console.log('   -> Đã bật trạng thái active để hiển thị trên navbar.');
    }
  } else {
    const created = await Category.create({
      name: 'PHỤ KIỆN CÔNG NGHỆ (ACCESSORIES)',
      slug,
      description: 'Phụ kiện máy tính & công nghệ: cáp, hub, chuột, bàn phím, túi chống sốc...',
      icon: '🔌',
      image: '',
      status: 'active',
      order: 8
    });
    console.log(`   -> Đã tạo danh mục mới: ${created.name} (_id: ${created._id}).`);
  }

  console.log('\n✅ Migration hoàn tất! Không có dữ liệu nào bị xóa.');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Lỗi migration:', err);
  process.exit(1);
});
