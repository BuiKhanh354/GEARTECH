const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Shop = require('./models/Shop');
const Product = require('./models/Product');
const Showroom = require('./models/Showroom');
const Voucher = require('./models/Voucher');

const seedData = async () => {
  try {
    console.log('🔄 Đang kết nối database để khởi tạo dữ liệu mẫu...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/geartech');
    console.log('✅ Đang làm sạch cơ sở dữ liệu...');

    await User.deleteMany();
    await Shop.deleteMany();
    await Product.deleteMany();
    await Showroom.deleteMany();
    await Voucher.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHashed = await bcrypt.hash('password123', salt);
    const adminPasswordHashed = await bcrypt.hash('adminpassword', salt);

    console.log('👥 Tạo tài khoản Admin & Khách hàng...');
    const adminUser = new User({
      name: 'Admin GearTech',
      email: 'admin@geartech.com',
      password: adminPasswordHashed,
      phone: '090111222',
      role: 'admin',
      memberRank: 'KIM_CUONG',
      points: 100000
    });
    await adminUser.save();

    const customerUser = new User({
      name: 'Nguyễn Văn A',
      email: 'customer@geartech.com',
      password: defaultPasswordHashed,
      phone: '0912345678',
      role: 'user',
      memberRank: 'VANG',
      points: 5200,
      addresses: [{
        title: 'Nhà riêng',
        receiverName: 'Nguyễn Văn A',
        receiverPhone: '0912345678',
        detailAddress: 'Số 45 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. HCM',
        isDefault: true
      }]
    });
    await customerUser.save();

    console.log('🏪 Tạo danh sách đối tác Shop...');
    const shopsData = [
      {
        name: 'APPLE MALL',
        logo: '🍎',
        category: 'MacBook & Apple Ecosystem',
        rating: 4.9,
        followers: '1.2M',
        bgClass: 'from-zinc-900 via-zinc-950 to-black text-white border-zinc-800',
        ownerEmail: 'partner.apple@geartech.com'
      },
      {
        name: 'ASUS ROG ZONE',
        logo: '👹',
        category: 'ROG Laptop & Gaming Hardware',
        rating: 4.9,
        followers: '450K',
        bgClass: 'from-red-950/20 via-zinc-950 to-black text-white border-red-500/20',
        ownerEmail: 'partner.asus@geartech.com'
      },
      {
        name: 'LOGITECH G LAB',
        logo: '👾',
        category: 'Lightspeed Gear & Gaming Mice',
        rating: 4.9,
        followers: '680K',
        bgClass: 'from-blue-950/20 via-zinc-950 to-black text-white border-blue-500/20',
        ownerEmail: 'partner.logitech@geartech.com'
      },
      {
        name: 'KEYCHRON LABS',
        logo: '⌨️',
        category: 'Custom Keyboards & Accessories',
        rating: 4.9,
        followers: '85K',
        bgClass: 'from-amber-950/20 via-zinc-950 to-black text-white border-amber-500/20',
        ownerEmail: 'partner.keychron@geartech.com'
      },
      {
        name: 'SONY PREMIUM AUDIO',
        logo: '🎵',
        category: 'Hi-Res Audio & Noise Cancelling',
        rating: 4.8,
        followers: '420K',
        bgClass: 'from-purple-950/20 via-zinc-950 to-black text-white border-purple-500/20',
        ownerEmail: 'partner.sony@geartech.com'
      },
      {
        name: 'GEARTECH OFFICIAL',
        logo: '⚡',
        category: 'Hệ sinh thái Gaming & Tech',
        rating: 5.0,
        followers: '2.5M',
        bgClass: 'from-zinc-900 to-black',
        ownerEmail: 'admin@geartech.com'
      }
    ];

    const shopMap = {};

    for (const s of shopsData) {
      let ownerId = adminUser._id;
      if (s.ownerEmail !== 'admin@geartech.com') {
        const shopUser = new User({
          name: `Quản Lý ${s.name}`,
          email: s.ownerEmail,
          password: defaultPasswordHashed,
          phone: '0988776655',
          role: 'shop',
          memberRank: 'KIM_CUONG',
          points: 20000
        });
        await shopUser.save();
        ownerId = shopUser._id;
      }

      const shop = new Shop({
        name: s.name,
        logo: s.logo,
        category: s.category,
        rating: s.rating,
        followers: s.followers,
        bgClass: s.bgClass,
        ownerId: ownerId
      });
      await shop.save();

      // Cập nhật shopId cho user
      await User.findByIdAndUpdate(ownerId, { shopId: shop._id });
      shopMap[s.name] = shop._id;
    }

    // Gán admin với shop GearTech
    adminUser.shopId = shopMap['GEARTECH OFFICIAL'];
    await adminUser.save();

    console.log('📦 Khởi tạo danh sách sản phẩm thực tế...');
    const productsData = [
      {
        title: 'Apple MacBook Pro 14" M3 Max (36GB RAM / 1TB SSD)',
        category: 'laptops',
        categoryName: 'LAPTOP & MACBOOK',
        price: 79990000,
        oldPrice: 84990000,
        discount: '-6%',
        rating: 4.9,
        reviewsCount: 42,
        salesCount: 'ĐÃ BÁN 120',
        imageEmoji: '💻',
        gallery: ['💻', '🖥️', '⚡', '🔋'],
        description: 'MacBook Pro 14 inch trang bị chip M3 Max tối tân mang lại hiệu năng cực khủng cho lập trình viên, nhà sáng tạo nội dung và nhà thiết kế 3D. Màn hình Liquid Retina XDR độ sáng 1600 nits siêu nét, tần số quét 120Hz ProMotion. Thời lượng pin lên tới 18 giờ liên tục.',
        stock: 15,
        shopId: shopMap['APPLE MALL'],
        specs: {
          'CPU': 'Apple M3 Max 14-core',
          'RAM': '36GB Unified Memory',
          'SSD': '1TB NVMe SSD',
          'Màn hình': '14.2 inch Liquid Retina XDR'
        }
      },
      {
        title: 'PC Gaming Asus ROG Strix (Core i9-14900KF / RTX 4090 / 64GB RAM)',
        category: 'desktops',
        categoryName: 'PC & WORKSTATION',
        price: 119990000,
        oldPrice: 129990000,
        discount: '-7%',
        rating: 5.0,
        reviewsCount: 18,
        salesCount: 'ĐÃ BÁN 35',
        imageEmoji: '🖥️',
        gallery: ['🖥️', '🌀', '🎮', '💡'],
        description: 'Cỗ máy chiến game tối thượng trang bị CPU Intel Core i9 thế hệ 14 mới nhất cùng card đồ họa NVIDIA GeForce RTX 4090 24GB. Tản nhiệt nước AIO 360mm mát mẻ, case kính cường lực kèm led ARGB đồng bộ độc đáo. Cân mượt mọi tựa game AAA ở độ phân giải 4K Max Setting.',
        stock: 5,
        shopId: shopMap['ASUS ROG ZONE'],
        specs: {
          'CPU': 'Intel Core i9-14900KF',
          'VGA': 'NVIDIA GeForce RTX 4090 24GB',
          'RAM': '64GB DDR5 6000MHz',
          'SSD': '2TB PCIe Gen4 SSD'
        }
      },
      {
        title: 'Màn hình chuyên đồ họa ASUS ProArt 27" 4K IPS HDR400',
        category: 'monitors',
        categoryName: 'MÀN HÌNH ĐỒ HỌA',
        price: 10490000,
        oldPrice: 12000000,
        discount: '-12%',
        rating: 4.8,
        reviewsCount: 56,
        salesCount: 'ĐÃ BÁN 280',
        imageEmoji: '📺',
        gallery: ['📺', '🎨', '🔌', '⚙️'],
        description: 'Màn hình thiết kế đồ họa ASUS ProArt PA279CV kích thước 27 inch độ phân giải 4K UHD siêu sắc nét. Đạt chứng nhận Calman Verified về độ chính xác màu Delta E < 2, bao phủ 100% sRGB và 100% Rec. 709. Cổng kết nối USB-C hỗ trợ truyền dữ liệu và sạc nhanh 65W.',
        stock: 20,
        shopId: shopMap['ASUS ROG ZONE'],
        specs: {
          'Kích thước': '27 inch IPS',
          'Độ phân giải': '4K UHD (3840 x 2160)',
          'Độ chính xác màu': 'Delta E < 2',
          'Cổng kết nối': 'USB-C, DisplayPort, HDMI'
        }
      },
      {
        title: 'Bàn phím cơ Custom Keychron Q1 Pro Knob RGB Hotswap',
        category: 'peripherals',
        categoryName: 'BÀN PHÍM CƠ',
        price: 4590000,
        oldPrice: 4990000,
        discount: '-8%',
        rating: 4.9,
        reviewsCount: 94,
        salesCount: 'ĐÃ BÁN 310',
        imageEmoji: '⌨️',
        gallery: ['⌨️', '⚙️', '🔋', '📦'],
        description: 'Bàn phím cơ full-nhôm CNC cao cấp với kết nối không dây Bluetooth 5.1 và cắm cáp. Thiết kế dạng Gasket Mount êm ái, switch Gateron Jupiter được lube sẵn cho âm thanh trầm ấm cực đã tai. Hỗ trợ hotswap 3-pin/5-pin và núm xoay đa chức năng tiện lợi.',
        stock: 30,
        shopId: shopMap['KEYCHRON LABS'],
        specs: {
          'Layout': '75%',
          'Chất liệu vỏ': 'Nhôm CNC nguyên khối',
          'Kết nối': 'Bluetooth 5.1 / Type-C',
          'Hỗ trợ Switch': '3-pin/5-pin Hotswap'
        }
      },
      {
        title: 'Chuột Gaming không dây Logitech G Pro X Superlight 2',
        category: 'peripherals',
        categoryName: 'CHUỘT GAMING',
        price: 3690000,
        oldPrice: 3990000,
        discount: '-7%',
        rating: 4.8,
        reviewsCount: 142,
        salesCount: 'ĐÃ BÁN 750',
        imageEmoji: '🖱️',
        gallery: ['🖱️', '⚡', '🔋', '🛡️'],
        description: 'Huyền thoại chuột gaming siêu nhẹ thế hệ thứ 2 từ Logitech. Trọng lượng chỉ 60g, trang bị cảm biến HERO 2 độ phân giải 32.000 DPI cho độ chính xác tuyệt đối. Switch lai Quang học-Cơ học LIGHTFORCE phản hồi siêu nhanh và bền bỉ. Pin dùng đến 95 giờ.',
        stock: 45,
        shopId: shopMap['LOGITECH G LAB'],
        specs: {
          'Cảm biến': 'HERO 2 (32.000 DPI)',
          'Trọng lượng': '60 gram',
          'Thời lượng pin': 'Lên tới 95 giờ',
          'Kết nối': 'LIGHTSPEED Wireless 2.4GHz'
        }
      },
      {
        title: 'Tai nghe chống ồn Sony WH-1000XM5 Premium Audio',
        category: 'audio',
        categoryName: 'TAI NGHE CHỤP TAI',
        price: 7290000,
        oldPrice: 8490000,
        discount: '-14%',
        rating: 4.7,
        reviewsCount: 310,
        salesCount: 'ĐÃ BÁN 1.1K',
        imageEmoji: '🎧',
        gallery: ['🎧', '🔇', '🔋', '🎙️'],
        description: 'Tai nghe chụp tai Over-ear cao cấp với công nghệ chống ồn chủ động ANC hàng đầu thế giới nhờ bộ xử lý tích hợp V1 và HD QN1. Hỗ trợ âm thanh độ phân giải cao Hi-Res Audio và mã hóa LDAC truyền tải âm thanh không dây đỉnh cao. Thời lượng pin 30 giờ.',
        stock: 25,
        shopId: shopMap['SONY PREMIUM AUDIO'],
        specs: {
          'Chống ồn': 'Active Noise Cancelling (ANC)',
          'Codec hỗ trợ': 'LDAC, AAC, SBC',
          'Pin': '30 giờ (bật ANC)',
          'Driver': '30mm màng sợi carbon'
        }
      },
      {
        title: 'Card màn hình ASUS ROG Strix GeForce RTX 4080 Super OC 16GB',
        category: 'components',
        categoryName: 'LINH KIỆN MÁY TÍNH',
        price: 33990000,
        oldPrice: 35990000,
        discount: '-5%',
        rating: 4.9,
        reviewsCount: 22,
        salesCount: 'ĐÃ BÁN 88',
        imageEmoji: '🔌',
        gallery: ['🔌', '🌀', '💡', '🛡️'],
        description: 'Card đồ họa NVIDIA GeForce RTX 4080 Super phiên bản ép xung sẵn OC mạnh mẽ từ ASUS ROG. Thiết kế tản nhiệt 3 quạt Axial-tech hầm hố, khung kim loại đúc siêu cứng cáp và hệ thống led Aura Sync RGB rực rỡ. Đáp ứng hoàn hảo các tác vụ render đồ họa và gaming 4K.',
        stock: 12,
        shopId: shopMap['ASUS ROG ZONE'],
        specs: {
          'VRAM': '16GB GDDR6X',
          'Bus Width': '256-bit',
          'Cổng kết nối': '2x HDMI 2.1a, 3x DisplayPort 1.4a',
          'Nguồn yêu cầu': '750W (đầu cắm 16-pin 12VHPWR)'
        }
      },
      {
        title: 'CPU Intel Core i9-14900K (3.2GHz Turbo 6.0GHz / 24 Nhân 32 Luồng)',
        category: 'components',
        categoryName: 'LINH KIỆN MÁY TÍNH',
        price: 15490000,
        oldPrice: 16500000,
        discount: '-6%',
        rating: 4.8,
        reviewsCount: 65,
        salesCount: 'ĐÃ BÁN 190',
        imageEmoji: '🧠',
        gallery: ['🧠', '⚡', '⚙️', '📦'],
        description: 'Bộ vi xử lý Intel Core thế hệ 14 Raptor Lake Refresh cao cấp nhất dành cho máy tính để bàn. Sở hữu cấu trúc lai 24 nhân (8 hiệu năng cao P-core & 16 tiết kiệm điện E-core), xung nhịp tối đa đạt mức kỷ lục 6.0 GHz cho khả năng xử lý đơn nhân và đa nhân vượt trội.',
        stock: 18,
        shopId: shopMap['GEARTECH OFFICIAL'],
        specs: {
          'Số nhân / luồng': '24 Cores (8P + 16E) / 32 Threads',
          'Xung nhịp': '3.2 GHz cơ bản (Turbo 6.0 GHz)',
          'Socket': 'LGA1700',
          'Bộ nhớ đệm': '36MB Intel Smart Cache'
        }
      },
      {
        title: 'Đồng hồ thông minh Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
        category: 'smart-devices',
        categoryName: 'SMARTWATCH',
        price: 21490000,
        oldPrice: 22990000,
        discount: '-6%',
        rating: 4.9,
        reviewsCount: 78,
        salesCount: 'ĐÃ BÁN 210',
        imageEmoji: '⌚',
        gallery: ['⌚', '🏔️', '🌊', '🔋'],
        description: 'Đồng hồ thể thao chuyên nghiệp bền bỉ nhất của Apple với vỏ ngoài Titanium chuẩn hàng không vũ trụ siêu bền, mặt kính Sapphire chống xước tuyệt đối. Màn hình Retina có độ sáng kỷ lục 3000 nits giúp đọc rõ dưới nắng gắt. Tích hợp GPS tần số kép chính xác cao.',
        stock: 14,
        shopId: shopMap['APPLE MALL'],
        specs: {
          'Chất liệu vỏ': 'Titanium 49mm',
          'Màn hình': 'Retina LTPO OLED 3000 nits',
          'Chống nước': '100m (chứng nhận lặn EN13319)',
          'Pin': 'Lên tới 36 giờ (72 giờ chế độ tiết kiệm)'
        }
      },
      {
        title: 'Cáp sạc kiêm Hub chuyển đổi HyperDrive 9-in-1 USB-C Power Hub',
        category: 'accessories',
        categoryName: 'CỦ SẠC & DÂY CÁP',
        price: 2290000,
        oldPrice: 2600000,
        discount: '-11%',
        rating: 4.7,
        reviewsCount: 112,
        salesCount: 'ĐÃ BÁN 450',
        imageEmoji: '🔌',
        gallery: ['🔌', '📺', '⚡', '📦'],
        description: 'Cáp chuyển đổi đa năng 9 cổng mở rộng kết nối từ USB-C ra các cổng thông dụng: HDMI 4K30Hz, Gigabit Ethernet, 3 x USB-A, khe đọc thẻ SD/MicroSD và hỗ trợ sạc ngược Power Delivery 100W. Chất liệu nhôm nguyên khối tản nhiệt tốt, thiết kế thanh lịch gọn nhẹ.',
        stock: 60,
        shopId: shopMap['GEARTECH OFFICIAL'],
        specs: {
          'Cổng xuất hình': 'HDMI 4K @ 30Hz',
          'Sạc nhanh': 'Power Delivery 100W Pass-through',
          'Cổng USB': '3x USB-A 3.0 (5Gbps)',
          'Cổng mạng': 'Gigabit Ethernet RJ45'
        }
      }
    ];

    for (const prod of productsData) {
      const newProd = new Product(prod);
      await newProd.save();
    }

    console.log('📍 Khởi tạo hệ thống Showroom...');
    const showroomsList = [
      {
        name: 'GEARTECH FLAGSHIP STORE - TP. HCM',
        address: '123 Đường Ba Tháng Hai, Phường 11, Quận 10, Thành phố Hồ Chí Minh',
        phone: '1900 6868 (Phím 1)',
        hours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
        features: [
          'Khu Trải Nghiệm Virtual Reality (VR)',
          'Độc Quyền Ghế Secretlab Valorant Ed.',
          'Trung Tâm Bảo Hành & Nâng Cấp Tốc Hành'
        ],
        lat: 10.7766023,
        lng: 106.6780075,
        city: 'hcm',
        mapUrl: 'https://maps.google.com/maps?q=123%20%C4%90%C6%B0%E1%BB%9Dng%20Ba%20Th%C3%A1ng%20Hai%2C%20Ph%C6%B0%E1%BB%9Dng%2011%2C%20Qu%E1%BA%ADn%2010%2C%20TP.HCM&t=&z=16&ie=UTF8&iwloc=&output=embed'
      },
      {
        name: 'GEARTECH ZONE - ĐỐNG ĐA, HÀ NỘI',
        address: '18 Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
        phone: '1900 6868 (Phím 2)',
        hours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
        features: [
          'Không Gian Build Phím Cơ Custom chuyên sâu',
          'Khu Vực Benchmark Workstation đồ họa',
          'Trải Nghiệm Tản Nhiệt Nước Custom'
        ],
        lat: 21.0076935,
        lng: 105.8260799,
        city: 'hanoi',
        mapUrl: 'https://maps.google.com/maps?q=18%20Ph%E1%BB%91%20Ch%C3%B9a%20B%E1%BB%99c%2C%20Quang%20Trung%2C%20%C4%90%E1%BB%91ng%20%C4%90a%2C%20H%C3%A0%20N%E1%BB%99i&t=&z=16&ie=UTF8&iwloc=&output=embed'
      },
      {
        name: 'GEARTECH ESPORT HUB - HẢI CHÂU, ĐÀ NẴNG',
        address: '52 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng',
        phone: '1900 6868 (Phím 3)',
        hours: '08:30 - 21:30 (Thứ 2 - Chủ Nhật)',
        features: [
          'Khu Vực Thi Đấu Esport 5v5 Chuẩn Gear',
          'Trải Nghiệm Chuột & Tai Nghe Siêu Nhẹ',
          'Bàn Trải Nghiệm Tay Cầm Console'
        ],
        lat: 16.0601955,
        lng: 108.2145322,
        city: 'danang',
        mapUrl: 'https://maps.google.com/maps?q=52%20Nguy%E1%BB%85n%20V%C4%83n%20Linh%2C%20Nam%20D%C6%B0%C6%A1ng%2C%20H%E1%BA%A3i%20Ch%C3%A2u%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&t=&z=16&ie=UTF8&iwloc=&output=embed'
      }
    ];

    for (const sr of showroomsList) {
      const newSr = new Showroom(sr);
      await newSr.save();
    }

    console.log('🎟️ Khởi tạo danh sách Voucher...');
    const vouchersList = [
      { code: 'GEARTECH50', description: 'Giảm 50.000₫ cho đơn hàng từ 300.000₫', discountValue: 50000, minOrderValue: 300000, expiryDate: new Date('2026-12-31'), maxUses: 500 },
      { code: 'SUPERTECH', description: 'Giảm 100.000₫ cho đơn hàng từ 1.000.000₫', discountValue: 100000, minOrderValue: 1000000, expiryDate: new Date('2026-12-31'), maxUses: 300 },
      { code: 'FREESHIP', description: 'Hỗ trợ 30.000₫ phí vận chuyển cho đơn từ 200.000₫', discountValue: 30000, minOrderValue: 200000, expiryDate: new Date('2026-12-31'), maxUses: 1000 }
    ];

    for (const v of vouchersList) {
      const newV = new Voucher(v);
      await newV.save();
    }

    console.log('✅ Khởi tạo cơ sở dữ liệu thật thành công!');
    console.log(`🔑 ADMIN: email: admin@geartech.com | pass: adminpassword`);
    console.log(`🔑 KHÁCH HÀNG: email: customer@geartech.com | pass: password123`);
    console.log(`🔑 CHỦ SHOP ASUS: email: partner.asus@geartech.com | pass: password123`);
    console.log(`🔑 CHỦ SHOP APPLE: email: partner.apple@geartech.com | pass: password123`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Lỗi khởi tạo dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
