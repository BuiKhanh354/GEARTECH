const mongoose = require('mongoose');
const Category = require('../models/Category');
const CategorySpecification = require('../models/CategorySpecification');

const DEFAULT_SPECS = [
  {
    categorySlug: 'laptops',
    categoryName: 'LAPTOP & MACBOOK',
    attributes: [
      { name: 'CPU', key: 'cpu', placeholder: 'VD: Intel Core i7-13700H / Apple M3' },
      { name: 'RAM', key: 'ram', placeholder: 'VD: 16GB DDR5 4800MHz' },
      { name: 'Ổ cứng', key: 'storage', placeholder: 'VD: 512GB SSD NVMe PCIe' },
      { name: 'Card đồ họa (GPU)', key: 'gpu', placeholder: 'VD: NVIDIA GeForce RTX 4060 8GB' },
      { name: 'Màn hình', key: 'screen', placeholder: 'VD: 15.6 inch FHD (1920x1080) 144Hz IPS' },
      { name: 'Hệ điều hành', key: 'os', placeholder: 'VD: Windows 11 Home / macOS' },
      { name: 'Dung lượng pin', key: 'battery', placeholder: 'VD: 4-cell 70Whr' },
      { name: 'Trọng lượng', key: 'weight', placeholder: 'VD: 2.1 kg' },
      { name: 'Cổng kết nối', key: 'ports', placeholder: 'VD: 1x USB-C Thunderbolt 4, 2x USB-A 3.2, HDMI 2.1' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 24 tháng chính hãng' }
    ]
  },
  {
    categorySlug: 'desktops',
    categoryName: 'PC & WORKSTATION',
    attributes: [
      { name: 'CPU', key: 'cpu', placeholder: 'VD: Intel Core i5-13400F / AMD Ryzen 5 7600' },
      { name: 'Mainboard', key: 'mainboard', placeholder: 'VD: B760M Gaming DDR5' },
      { name: 'RAM', key: 'ram', placeholder: 'VD: 32GB (2x16GB) DDR5 6000MHz' },
      { name: 'Card đồ họa (VGA)', key: 'vga', placeholder: 'VD: NVIDIA RTX 4070 SUPER 12GB' },
      { name: 'Ổ cứng lưu trữ', key: 'storage', placeholder: 'VD: 1TB SSD NVMe Gen 4' },
      { name: 'Nguồn (PSU)', key: 'psu', placeholder: 'VD: 750W 80 Plus Gold' },
      { name: 'Tản nhiệt', key: 'cooler', placeholder: 'VD: Tản nhiệt nước AIO 240 ARGB' },
      { name: 'Vỏ Case', key: 'case', placeholder: 'VD: Mid Tower Kính cường lực' },
      { name: 'Hệ điều hành', key: 'os', placeholder: 'VD: Windows 11 Pro 64-bit' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 36 tháng' }
    ]
  },
  {
    categorySlug: 'components',
    categoryName: 'LINH KIỆN MÁY TÍNH',
    attributes: [
      { name: 'Loại linh kiện', key: 'component_type', placeholder: 'VD: CPU / Mainboard / RAM / VGA / Nguồn' },
      { name: 'Nhà sản xuất', key: 'manufacturer', placeholder: 'VD: ASUS, MSI, Gigabyte, Corsair' },
      { name: 'Model / Dòng sản phẩm', key: 'model', placeholder: 'VD: TUF Gaming Series' },
      { name: 'Chuẩn tương thích / Socket', key: 'socket_compatibility', placeholder: 'VD: LGA 1700 / AM5 / ATX' },
      { name: 'Công suất tiêu thụ / TDP', key: 'power_tdp', placeholder: 'VD: 65W / 650W' },
      { name: 'Kích thước', key: 'dimensions', placeholder: 'VD: Chuẩn ATX / Micro-ATX' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 36 tháng chính hãng' }
    ]
  },
  {
    categorySlug: 'gpu',
    categoryName: 'GPU - CARD MÀN HÌNH',
    attributes: [
      { name: 'Chipset đồ họa', key: 'gpu_chipset', placeholder: 'VD: NVIDIA GeForce RTX 4070 Ti / AMD RX 7800 XT' },
      { name: 'Dung lượng VRAM', key: 'vram', placeholder: 'VD: 12GB GDDR6X' },
      { name: 'Băng thông bộ nhớ', key: 'memory_bus', placeholder: 'VD: 192-bit' },
      { name: 'Xung nhịp Boost', key: 'boost_clock', placeholder: 'VD: 2610 MHz' },
      { name: 'Chuẩn giao tiếp', key: 'interface', placeholder: 'VD: PCIe 4.0 x16' },
      { name: 'Cổng xuất hình', key: 'output_ports', placeholder: 'VD: 3x DisplayPort 1.4a, 1x HDMI 2.1a' },
      { name: 'Công suất nguồn đề nghị', key: 'recommended_psu', placeholder: 'VD: 700W trở lên' },
      { name: 'Đầu cấp nguồn', key: 'power_connectors', placeholder: 'VD: 1x 16-pin (12VHPWR)' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 36 tháng' }
    ]
  },
  {
    categorySlug: 'monitors',
    categoryName: 'MÀN HÌNH MÁY TÍNH',
    attributes: [
      { name: 'Kích thước màn hình', key: 'screen_size', placeholder: 'VD: 27 inch' },
      { name: 'Độ phân giải', key: 'resolution', placeholder: 'VD: 2K QHD (2560 x 1440)' },
      { name: 'Tấm nền', key: 'panel_type', placeholder: 'VD: Fast IPS / OLED / VA' },
      { name: 'Tần số quét', key: 'refresh_rate', placeholder: 'VD: 165Hz / 180Hz / 240Hz' },
      { name: 'Thời gian đáp ứng', key: 'response_time', placeholder: 'VD: 1ms (GTG)' },
      { name: 'Độ sáng', key: 'brightness', placeholder: 'VD: 400 cd/m² (HDR400)' },
      { name: 'Độ bao phủ màu', key: 'color_gamut', placeholder: 'VD: 99% sRGB, 95% DCI-P3' },
      { name: 'Cổng kết nối', key: 'connectivity', placeholder: 'VD: 2x HDMI 2.0, 1x DisplayPort 1.4, Audio Out' },
      { name: 'Tính năng đặc biệt', key: 'features', placeholder: 'VD: G-Sync Compatible, Chân đế nâng hạ xoay' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 36 tháng' }
    ]
  },
  {
    categorySlug: 'peripherals',
    categoryName: 'BÀN PHÍM & CHUỘT',
    attributes: [
      { name: 'Loại phụ kiện', key: 'accessory_type', placeholder: 'VD: Bàn phím cơ / Chuột gaming / Lót chuột' },
      { name: 'Chuẩn kết nối', key: 'connection_type', placeholder: 'VD: Không dây 2.4GHz + Bluetooth 5.1 + Type-C' },
      { name: 'Loại Switch / Cảm biến', key: 'switch_sensor', placeholder: 'VD: ROG NX Snow Switch / Cảm biến AimPoint 36K DPI' },
      { name: 'Độ phân giải DPI', key: 'dpi', placeholder: 'VD: Lên đến 36,000 DPI (nếu là chuột)' },
      { name: 'Đèn LED hiển thị', key: 'led', placeholder: 'VD: RGB 16.8 triệu màu sync Aura' },
      { name: 'Thời lượng pin', key: 'battery_life', placeholder: 'VD: Lên đến 90 giờ khi tắt LED' },
      { name: 'Trọng lượng', key: 'weight', placeholder: 'VD: 54g' },
      { name: 'Tương thích', key: 'compatibility', placeholder: 'VD: Windows, macOS, Android' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 24 tháng' }
    ]
  },
  {
    categorySlug: 'audio',
    categoryName: 'TAI NGHE & LOA',
    attributes: [
      { name: 'Loại sản phẩm', key: 'audio_type', placeholder: 'VD: Tai nghe chụp tai Gaming (Over-ear) / Loa soundbar' },
      { name: 'Chuẩn kết nối', key: 'connection', placeholder: 'VD: Wireless 2.4GHz / Jack 3.5mm / Bluetooth' },
      { name: 'Kích thước củ loa (Driver)', key: 'driver_size', placeholder: 'VD: 50mm Neodymium' },
      { name: 'Dải tần số đáp ứng', key: 'frequency_range', placeholder: 'VD: 20Hz - 40,000Hz (Hi-Res Audio)' },
      { name: 'Microphone', key: 'mic', placeholder: 'VD: Mic lọc ồn AI có thể tháo rời' },
      { name: 'Thời lượng pin', key: 'battery', placeholder: 'VD: Khoảng 38 giờ liên tục' },
      { name: 'Công nghệ âm thanh', key: 'sound_tech', placeholder: 'VD: Âm thanh vòm 7.1 Virtual Surround' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 24 tháng' }
    ]
  },
  {
    categorySlug: 'smart-devices',
    categoryName: 'THIẾT BỊ THÔNG MINH',
    attributes: [
      { name: 'Loại thiết bị', key: 'device_type', placeholder: 'VD: Đồng hồ thông minh / Vòng đeo tay / Stream Deck' },
      { name: 'Kết nối không dây', key: 'wireless', placeholder: 'VD: Wi-Fi 2.4GHz, Bluetooth 5.3' },
      { name: 'Màn hình hiển thị', key: 'display', placeholder: 'VD: 1.43 inch AMOLED 466x466' },
      { name: 'Chuẩn chống nước', key: 'waterproof', placeholder: 'VD: 5ATM / IP68' },
      { name: 'Thời lượng pin', key: 'battery', placeholder: 'VD: 7-14 ngày sử dụng bình thường' },
      { name: 'Hệ điều hành tương thích', key: 'os_compat', placeholder: 'VD: Android 8.0+ / iOS 12.0+' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 12 tháng' }
    ]
  },
  {
    categorySlug: 'accessories',
    categoryName: 'PHỤ KIỆN CÔNG NGHỆ',
    attributes: [
      { name: 'Loại phụ kiện', key: 'type', placeholder: 'VD: Giá đỡ laptop / Hub chuyển đổi Type-C / Cáp HDMI 2.1' },
      { name: 'Chất liệu cấu tạo', key: 'material', placeholder: 'VD: Hợp kim nhôm nguyên khối / Nhựa ABS chống cháy' },
      { name: 'Cổng giao tiếp / Tốc độ', key: 'interface_speed', placeholder: 'VD: USB 3.2 Gen 2 (10Gbps) / 4K@60Hz' },
      { name: 'Chiều dài cáp / Kích thước', key: 'size', placeholder: 'VD: Chiều dài 1.5m' },
      { name: 'Tương thích thiết bị', key: 'compatibility', placeholder: 'VD: Laptop, PC, MacBook, iPad, Điện thoại' },
      { name: 'Bảo hành', key: 'warranty', placeholder: 'VD: 12 tháng 1 đổi 1' }
    ]
  }
];

async function seedCategorySpecs() {
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  console.log('Connected to MongoDB.');

  const existingCategories = await Category.find({});
  const catMapBySlug = {};
  existingCategories.forEach(c => {
    catMapBySlug[c.slug] = c;
  });

  for (const item of DEFAULT_SPECS) {
    const matchedCategory = catMapBySlug[item.categorySlug];
    const categoryId = matchedCategory ? matchedCategory._id : null;
    const categoryName = matchedCategory ? matchedCategory.name : item.categoryName;

    const attributesWithOrder = item.attributes.map((attr, idx) => ({
      ...attr,
      order: idx + 1,
      isRequired: false
    }));

    await CategorySpecification.findOneAndUpdate(
      { categorySlug: item.categorySlug },
      {
        categoryId,
        categorySlug: item.categorySlug,
        categoryName,
        attributes: attributesWithOrder
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded specs template for category: [${item.categorySlug}] ${categoryName} (${attributesWithOrder.length} attributes)`);
  }

  console.log('Seeding category specifications completed successfully!');
  await mongoose.disconnect();
}

seedCategorySpecs().catch(err => {
  console.error('Error seeding category specs:', err);
  process.exit(1);
});

