const mongoose = require('mongoose');
require('dotenv').config();

async function alignDatabase() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/gear_tech');
  console.log('Connected to MongoDB.');

  const Category = require('../models/Category');
  const Product = require('../models/Product');
  const Shop = require('../models/Shop');

  // 1. Tìm các category
  const [catDesktops, catLaptops, catComponents, catMonitors, catPeripherals] = await Promise.all([
    Category.findOne({ slug: 'desktops' }),
    Category.findOne({ slug: 'laptops' }),
    Category.findOne({ slug: 'components' }),
    Category.findOne({ slug: 'monitors' }),
    Category.findOne({ slug: 'peripherals' })
  ]);

  console.log('Categories found:', {
    desktops: catDesktops?._id,
    laptops: catLaptops?._id,
    components: catComponents?._id,
    monitors: catMonitors?._id,
    peripherals: catPeripherals?._id
  });

  // Tìm shop chính thức Gear Tech Store
  let officialShop = await Shop.findOne({ name: 'Gear Tech Store' });
  if (!officialShop) {
    officialShop = await Shop.findOne({ status: 'active' });
  }

  // 2. Chuẩn hóa các sản phẩm hiện có
  // Monitors
  if (catMonitors) {
    await Product.updateMany(
      { $or: [{ category: 'monitors' }, { title: /Màn hình|ROG Swift|VG259Q/i }] },
      {
        $set: {
          categoryId: catMonitors._id,
          category_id: catMonitors._id,
          category: 'monitors',
          categoryName: catMonitors.name,
          status: 'active'
        }
      }
    );
  }

  // Components
  if (catComponents) {
    await Product.updateMany(
      { $or: [{ category: 'components' }, { title: /RTX|GPU|Linh kiện/i }] },
      {
        $set: {
          categoryId: catComponents._id,
          category_id: catComponents._id,
          category: 'components',
          categoryName: catComponents.name,
          status: 'active'
        }
      }
    );
  }

  // Peripherals (Bàn phím, chuột)
  if (catPeripherals) {
    await Product.updateMany(
      { $or: [{ category: 'keyboards' }, { category: 'gaming gear' }, { title: /Bàn phím|Chuột/i }] },
      {
        $set: {
          categoryId: catPeripherals._id,
          category_id: catPeripherals._id,
          category: 'peripherals',
          categoryName: catPeripherals.name,
          status: 'active'
        }
      }
    );
  }

  // 3. Đảm bảo có sản phẩm PC Gaming thực tế trong MongoDB
  if (catDesktops && officialShop) {
    const pcCount = await Product.countDocuments({
      $or: [{ categoryId: catDesktops._id }, { category: 'desktops' }]
    });

    if (pcCount === 0) {
      console.log('Thêm các sản phẩm PC Gaming & Workstation vào MongoDB...');
      await Product.create([
        {
          title: 'PC Gaming ROG Hyperion GR701 Intel i9-14900K / RTX 4090 / 64GB DDR5',
          description: 'Cỗ máy chiến hạm đỉnh cao Esports với vỏ ROG Hyperion GR701, tản nhiệt nước Custom EKWB, card đồ họa ROG Strix GeForce RTX 4090 OC 24GB và vi xử lý Intel Core i9-14900K thế hệ 14.',
          price: 125990000,
          oldPrice: 139000000,
          discount: '-9%',
          imageEmoji: '🖥️',
          category: 'desktops',
          categoryId: catDesktops._id,
          category_id: catDesktops._id,
          categoryName: catDesktops.name,
          brand: 'asus rog',
          rating: 5.0,
          reviewsCount: 18,
          salesCount: 'ĐÃ BÁN 24',
          soldCount: 24,
          stock: 6,
          warehouseStock: 10,
          listedQty: 6,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'PC Gaming MSI Meg Trident X2 Intel i7-14700KF / RTX 4080 Super / 32GB',
          description: 'Thiết kế HMI cảm ứng độc quyền phía trước máy, tản nhiệt Silent Storm Cooling 3 riêng biệt, card đồ họa MSI GeForce RTX 4080 Super 16GB mạnh mẽ đáp ứng game 4K Ray Tracing mượt mà.',
          price: 79990000,
          oldPrice: 88500000,
          discount: '-10%',
          imageEmoji: '⚡',
          category: 'desktops',
          categoryId: catDesktops._id,
          category_id: catDesktops._id,
          categoryName: catDesktops.name,
          brand: 'msi',
          rating: 4.9,
          reviewsCount: 14,
          salesCount: 'ĐÃ BÁN 19',
          soldCount: 19,
          stock: 8,
          warehouseStock: 12,
          listedQty: 8,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'PC Workstation ASUS ProArt PA602 Dual RTX 4090 / AMD Threadripper 7970X',
          description: 'Hệ thống máy trạm chuyên nghiệp dành cho đồ họa 3D, Render 8K, đào tạo AI Machine Learning với vi xử lý AMD Threadripper 7970X 32 nhân 64 luồng và 128GB RAM ECC.',
          price: 215000000,
          oldPrice: 230000000,
          discount: '-7%',
          imageEmoji: '🎛️',
          category: 'desktops',
          categoryId: catDesktops._id,
          category_id: catDesktops._id,
          categoryName: catDesktops.name,
          brand: 'asus proart',
          rating: 5.0,
          reviewsCount: 9,
          salesCount: 'ĐÃ BÁN 12',
          soldCount: 12,
          stock: 3,
          warehouseStock: 5,
          listedQty: 3,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'PC Gaming GearTech Battle Station Core i5-14400F / RTX 4060 Ti 8GB',
          description: 'Cấu hình quốc dân tối ưu cho game thủ Esports, chiến mượt mà Valorant 400+ FPS, CS2, LMHT, PUBG ở độ phân giải Full HD & 2K. Bảo hành 1 đổi 1 trong 30 ngày.',
          price: 23990000,
          oldPrice: 26500000,
          discount: '-9%',
          imageEmoji: '🎯',
          category: 'desktops',
          categoryId: catDesktops._id,
          category_id: catDesktops._id,
          categoryName: catDesktops.name,
          brand: 'geartech',
          rating: 4.8,
          reviewsCount: 36,
          salesCount: 'ĐÃ BÁN 85',
          soldCount: 85,
          stock: 15,
          warehouseStock: 25,
          listedQty: 15,
          status: 'active',
          shopId: officialShop._id
        }
      ]);
    }
  }

  // 4. Đảm bảo có sản phẩm Laptop & MacBook thực tế trong MongoDB
  if (catLaptops && officialShop) {
    const laptopCount = await Product.countDocuments({
      $or: [{ categoryId: catLaptops._id }, { category: 'laptops' }]
    });

    if (laptopCount === 0) {
      console.log('Thêm các sản phẩm Laptop Gaming & MacBook vào MongoDB...');
      await Product.create([
        {
          title: 'Laptop ASUS ROG Zephyrus G16 OLED (2024) Intel Core Ultra 9 / RTX 4080 / 32GB',
          description: 'Đỉnh cao laptop gaming mỏng nhẹ với màn hình ROG Nebula OLED 2.5K 240Hz 0.2ms chuẩn màu DCI-P3 100%, khung nhôm CNC nguyên khối với dải đèn Slash Lighting độc đáo.',
          price: 79990000,
          oldPrice: 85000000,
          discount: '-6%',
          imageEmoji: '💻',
          category: 'laptops',
          categoryId: catLaptops._id,
          category_id: catLaptops._id,
          categoryName: catLaptops.name,
          brand: 'asus rog',
          rating: 4.9,
          reviewsCount: 22,
          salesCount: 'ĐÃ BÁN 45',
          soldCount: 45,
          stock: 7,
          warehouseStock: 10,
          listedQty: 7,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'MacBook Pro 16 inch M3 Max (16 CPU / 40 GPU / 48GB Unified Memory / 1TB SSD)',
          description: 'Sức mạnh quái vật từ chip Apple M3 Max, màn hình Liquid Retina XDR 120Hz ProMotion 1600 nits, thời lượng pin 22 giờ liên tục. Lựa chọn số 1 cho lập trình viên và dựng phim chuyên nghiệp.',
          price: 99990000,
          oldPrice: 105000000,
          discount: '-5%',
          imageEmoji: '🍎',
          category: 'laptops',
          categoryId: catLaptops._id,
          category_id: catLaptops._id,
          categoryName: catLaptops.name,
          brand: 'apple',
          rating: 5.0,
          reviewsCount: 31,
          salesCount: 'ĐÃ BÁN 62',
          soldCount: 62,
          stock: 5,
          warehouseStock: 8,
          listedQty: 5,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'Laptop Gaming Lenovo Legion Pro 7i Gen 9 Intel i9-14900HX / RTX 4090 / 32GB',
          description: 'Hệ thống tản nhiệt buồng hơi Legion Coldfront Vapor kết hợp chip AI Lenovo LA-2Q tối ưu hóa FPS tự động theo thời gian thực. Bàn phím Legion TrueStrike RGB từng phím.',
          price: 88990000,
          oldPrice: 94000000,
          discount: '-5%',
          imageEmoji: '🔥',
          category: 'laptops',
          categoryId: catLaptops._id,
          category_id: catLaptops._id,
          categoryName: catLaptops.name,
          brand: 'lenovo',
          rating: 4.9,
          reviewsCount: 16,
          salesCount: 'ĐÃ BÁN 28',
          soldCount: 28,
          stock: 4,
          warehouseStock: 6,
          listedQty: 4,
          status: 'active',
          shopId: officialShop._id
        },
        {
          title: 'Laptop Acer Predator Helios 16 Intel Core i7-14700HX / RTX 4070 8GB / 16GB DDR5',
          description: 'Màn hình 16 inch WQXGA 240Hz 500 nits G-Sync, 2 quạt AeroBlade 3D thế hệ 5 kim loại và keo tản nhiệt kim loại lỏng. Đạt chứng chỉ GearTech Esports Certified.',
          price: 49990000,
          oldPrice: 54990000,
          discount: '-9%',
          imageEmoji: '🚀',
          category: 'laptops',
          categoryId: catLaptops._id,
          category_id: catLaptops._id,
          categoryName: catLaptops.name,
          brand: 'acer predator',
          rating: 4.8,
          reviewsCount: 19,
          salesCount: 'ĐÃ BÁN 40',
          soldCount: 40,
          stock: 12,
          warehouseStock: 18,
          listedQty: 12,
          status: 'active',
          shopId: officialShop._id
        }
      ]);
    }
  }

  // 5. Kiểm tra lại toàn bộ số lượng sản phẩm mỗi danh mục
  const allCats = await Category.find({}).lean();
  console.log('\n=== KẾT QUẢ DANH MỤC SAU KHI ĐỒNG BỘ ===');
  for (const c of allCats) {
    const count = await Product.countDocuments({
      $or: [
        { categoryId: c._id },
        { category_id: c._id },
        { category: c.slug },
        { category: c.name },
        { categoryName: c.name }
      ]
    });
    console.log(`- ${c.name} (${c.slug}): ${count} sản phẩm thực tế`);
  }

  process.exit(0);
}

alignDatabase().catch(err => {
  console.error('Lỗi đồng bộ:', err);
  process.exit(1);
});
