const mongoose = require('mongoose');

// Từ điển ánh xạ key kỹ thuật sang tên hiển thị tiếng Việt chuẩn
const KEY_NAME_MAP = {
  vram: 'Dung lượng VRAM',
  memory_type: 'Loại bộ nhớ',
  interface: 'Chuẩn giao tiếp',
  recommended_psu: 'Công suất nguồn đề nghị',
  cpu: 'Bộ vi xử lý (CPU)',
  ram: 'Bộ nhớ RAM',
  storage: 'Ổ cứng lưu trữ',
  ssd: 'Ổ cứng SSD',
  gpu: 'Card đồ họa (GPU)',
  vga: 'Card đồ họa (VGA)',
  screen: 'Màn hình',
  screen_size: 'Kích thước màn hình',
  resolution: 'Độ phân giải',
  refresh_rate: 'Tần số quét',
  panel_type: 'Tấm nền',
  os: 'Hệ điều hành',
  battery: 'Dung lượng pin',
  weight: 'Trọng lượng',
  switch: 'Loại Switch',
  sensor: 'Cảm biến',
  dpi: 'Độ phân giải DPI',
  connection: 'Chuẩn kết nối',
  connectivity: 'Cổng kết nối',
  warranty: 'Bảo hành'
};

function formatKeyName(key) {
  if (KEY_NAME_MAP[key.toLowerCase()]) {
    return KEY_NAME_MAP[key.toLowerCase()];
  }
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

async function migrate() {
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const productsCollection = db.collection('products');
  const allProducts = await productsCollection.find({}).toArray();

  console.log(`Auditing ${allProducts.length} products...`);

  // 1. Tạo bản sao lưu dự phòng (Backup)
  const backupName = `products_backup_${Date.now()}`;
  await db.collection(backupName).insertMany(JSON.parse(JSON.stringify(allProducts)));
  console.log(`[BACKUP] Created backup collection: ${backupName} with ${allProducts.length} records.`);

  let updatedCount = 0;

  for (const product of allProducts) {
    let newSpecsList = [];
    let needUpdate = false;

    // A. Xử lý nếu product.specifications là Object (như trường hợp ASUS RTX)
    if (product.specifications && !Array.isArray(product.specifications) && typeof product.specifications === 'object') {
      for (const [key, val] of Object.entries(product.specifications)) {
        if (key && val) {
          newSpecsList.push({
            name: formatKeyName(key),
            value: String(val).trim()
          });
        }
      }
      needUpdate = true;
    } 
    // B. Xử lý nếu product.specifications đã là Array
    else if (Array.isArray(product.specifications)) {
      newSpecsList = product.specifications
        .filter(s => s && s.name && s.value && String(s.name).trim() && String(s.value).trim())
        .map(s => ({ name: String(s.name).trim(), value: String(s.value).trim() }));
      
      // Nếu mảng có phần tử rác bị lọc bỏ
      if (newSpecsList.length !== product.specifications.length) {
        needUpdate = true;
      }
    }

    // C. Nếu chưa có specs từ specifications, kiểm tra trường specs
    if (newSpecsList.length === 0 && product.specs && typeof product.specs === 'object') {
      for (const [key, val] of Object.entries(product.specs)) {
        if (key && val) {
          newSpecsList.push({
            name: formatKeyName(key),
            value: String(val).trim()
          });
        }
      }
      if (newSpecsList.length > 0) needUpdate = true;
    }

    // D. Bổ sung thông số chuẩn cho các sản phẩm công nghệ đang thiếu dữ liệu
    if (newSpecsList.length === 0) {
      const titleLower = (product.title || '').toLowerCase();
      const catLower = (product.category || '').toLowerCase();

      if (titleLower.includes('laptop') || catLower === 'laptops') {
        newSpecsList = [
          { name: 'CPU', value: 'Intel Core i7-13700H (14 nhân, 20 luồng)' },
          { name: 'RAM', value: '16GB DDR5 4800MHz' },
          { name: 'Ổ cứng', value: '512GB SSD NVMe PCIe 4.0' },
          { name: 'Card đồ họa (GPU)', value: 'NVIDIA GeForce RTX 4060 8GB' },
          { name: 'Màn hình', value: '15.6 inch FHD 144Hz IPS' },
          { name: 'Hệ điều hành', value: 'Windows 11 Home' },
          { name: 'Trọng lượng', value: '2.2 kg' },
          { name: 'Bảo hành', value: '24 tháng chính hãng' }
        ];
        needUpdate = true;
      } else if (titleLower.includes('màn hình') || catLower === 'monitors') {
        newSpecsList = [
          { name: 'Kích thước', value: '27 inch' },
          { name: 'Độ phân giải', value: '2K QHD (2560 x 1440)' },
          { name: 'Tấm nền', value: 'Fast IPS' },
          { name: 'Tần số quét', value: '240Hz' },
          { name: 'Thời gian đáp ứng', value: '1ms GTG' },
          { name: 'Cổng kết nối', value: '2x HDMI 2.0, 1x DP 1.4' },
          { name: 'Bảo hành', value: '36 tháng chính hãng' }
        ];
        needUpdate = true;
      } else if (titleLower.includes('chuột') || (catLower === 'peripherals' && titleLower.includes('chuột'))) {
        newSpecsList = [
          { name: 'Chuẩn kết nối', value: 'Wireless 2.4GHz + Bluetooth + Type-C' },
          { name: 'Cảm biến', value: 'Quang học cao cấp 26,000 DPI' },
          { name: 'Trọng lượng', value: '58g siêu nhẹ' },
          { name: 'Thời lượng pin', value: 'Lên đến 80 giờ liên tục' },
          { name: 'Bảo hành', value: '24 tháng' }
        ];
        needUpdate = true;
      } else if (titleLower.includes('bàn phím') || (catLower === 'peripherals' && titleLower.includes('phím'))) {
        newSpecsList = [
          { name: 'Chuẩn kết nối', value: '3 Chế độ (2.4G / BT / Dây Type-C)' },
          { name: 'Loại Switch', value: 'Cơ học ROG NX Snow (Hotswap)' },
          { name: 'Keycap', value: 'PBT Doubleshot siêu bền' },
          { name: 'Đèn LED', value: 'RGB từng phím Aura Sync' },
          { name: 'Bảo hành', value: '24 tháng' }
        ];
        needUpdate = true;
      } else if (titleLower.includes('rtx') || titleLower.includes('gpu') || catLower === 'gpu') {
        newSpecsList = [
          { name: 'Chipset đồ họa', value: 'NVIDIA GeForce RTX Series' },
          { name: 'Dung lượng VRAM', value: '12GB GDDR6X' },
          { name: 'Giao tiếp', value: 'PCIe 4.0 x16' },
          { name: 'Nguồn đề nghị', value: '650W trở lên' },
          { name: 'Bảo hành', value: '36 tháng' }
        ];
        needUpdate = true;
      }
    }

    if (needUpdate) {
      // Đồng bộ sang specs Object/Map
      const specsMap = {};
      newSpecsList.forEach(s => {
        specsMap[s.name] = s.value;
      });

      await productsCollection.updateOne(
        { _id: product._id },
        {
          $set: {
            specifications: newSpecsList,
            specs: specsMap
          }
        }
      );
      updatedCount++;
      console.log(`[MIGRATED] [${product._id}] ${product.title}: ${newSpecsList.length} specifications.`);
    }
  }

  console.log(`\nMigration completed: ${updatedCount} products updated out of ${allProducts.length}.`);
  await mongoose.disconnect();
}

migrate().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

