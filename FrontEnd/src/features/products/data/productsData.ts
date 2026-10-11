export interface Product {
  id: string;
  title: string;
  category: string;
  categoryName: string;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviewsCount: number;
  salesCount: string;
  imageEmoji: string;
  gallery: string[];
  description: string;
  shop: {
    name: string;
    logo: string;
    rating: string;
    responseRate: string;
    followers: string;
  };
}

export const mockProducts: Product[] = [
  {
    id: 'tech-1',
    title: 'Apple MacBook Pro 14" M3 Max (36GB RAM / 1TB SSD)',
    category: 'laptops',
    categoryName: 'Laptop & MacBook',
    price: 79990000,
    oldPrice: 84990000,
    discount: '-6%',
    rating: 4.9,
    reviewsCount: 42,
    salesCount: 'Đã bán 120',
    imageEmoji: '💻',
    gallery: ['💻', '🖥️', '⚡', '🔋'],
    description: 'MacBook Pro 14 inch trang bị chip M3 Max tối tân mang lại hiệu năng cực khủng cho lập trình viên, nhà sáng tạo nội dung và nhà thiết kế 3D. Màn hình Liquid Retina XDR độ sáng 1600 nits siêu nét, tần số quét 120Hz ProMotion. Thời lượng pin lên tới 18 giờ liên tục.',
    shop: {
      name: 'Apple Flagship Store',
      logo: '🍎',
      rating: '4.9',
      responseRate: '98%',
      followers: '1.2M'
    }
  },
  {
    id: 'tech-2',
    title: 'PC Gaming Asus ROG Strix (Core i9-14900KF / RTX 4090 / 64GB RAM)',
    category: 'desktops',
    categoryName: 'PC Gaming & Workstation',
    price: 119990000,
    oldPrice: 129990000,
    discount: '-7%',
    rating: 5.0,
    reviewsCount: 18,
    salesCount: 'Đã bán 35',
    imageEmoji: '🖥️',
    gallery: ['🖥️', '🌀', '🎮', '💡'],
    description: 'Cỗ máy chiến game tối thượng trang bị CPU Intel Core i9 thế hệ 14 mới nhất cùng card đồ họa NVIDIA GeForce RTX 4090 24GB. Tản nhiệt nước AIO 360mm mát mẻ, case kính cường lực kèm led ARGB đồng bộ độc đáo. Cân mượt mọi tựa game AAA ở độ phân giải 4K Max Setting.',
    shop: {
      name: 'ASUS ROG Store',
      logo: '👹',
      rating: '4.9',
      responseRate: '97%',
      followers: '450K'
    }
  },
  {
    id: 'tech-3',
    title: 'Màn hình chuyên đồ họa ASUS ProArt 27" 4K IPS HDR400',
    category: 'monitors',
    categoryName: 'Màn hình Máy tính',
    price: 10490000,
    oldPrice: 12000000,
    discount: '-12%',
    rating: 4.8,
    reviewsCount: 56,
    salesCount: 'Đã bán 280',
    imageEmoji: '📺',
    gallery: ['📺', '🎨', '🔌', '⚙️'],
    description: 'Màn hình thiết kế đồ họa ASUS ProArt PA279CV kích thước 27 inch độ phân giải 4K UHD siêu sắc nét. Đạt chứng nhận Calman Verified về độ chính xác màu Delta E < 2, bao phủ 100% sRGB và 100% Rec. 709. Cổng kết nối USB-C hỗ trợ truyền dữ liệu và sạc nhanh 65W.',
    shop: {
      name: 'ASUS Pro Store',
      logo: '🌟',
      rating: '4.8',
      responseRate: '96%',
      followers: '120K'
    }
  },
  {
    id: 'tech-4',
    title: 'Bàn phím cơ Custom Keychron Q1 Pro Knob RGB Hotswap',
    category: 'peripherals',
    categoryName: 'Bàn phím & Chuột',
    price: 4590000,
    oldPrice: 4990000,
    discount: '-8%',
    rating: 4.9,
    reviewsCount: 94,
    salesCount: 'Đã bán 310',
    imageEmoji: '⌨️',
    gallery: ['⌨️', '⚙️', '🔋', '📦'],
    description: 'Bàn phím cơ full-nhôm CNC cao cấp với kết nối không dây Bluetooth 5.1 và cắm cáp. Thiết kế dạng Gasket Mount êm ái, switch Gateron Jupiter được lube sẵn cho âm thanh trầm ấm cực đã tai. Hỗ trợ hotswap 3-pin/5-pin và núm xoay đa chức năng tiện lợi.',
    shop: {
      name: 'Keychron Vietnam',
      logo: '⌨️',
      rating: '4.9',
      responseRate: '99%',
      followers: '85K'
    }
  },
  {
    id: 'tech-5',
    title: 'Chuột Gaming không dây Logitech G Pro X Superlight 2',
    category: 'peripherals',
    categoryName: 'Bàn phím & Chuột',
    price: 3690000,
    oldPrice: 3990000,
    discount: '-7%',
    rating: 4.8,
    reviewsCount: 142,
    salesCount: 'Đã bán 750',
    imageEmoji: '🖱️',
    gallery: ['🖱️', '⚡', '🔋', '🛡️'],
    description: 'Huyền thoại chuột gaming siêu nhẹ thế hệ thứ 2 từ Logitech. Trọng lượng chỉ 60g, trang bị cảm biến HERO 2 độ phân giải 32.000 DPI cho độ chính xác tuyệt đối. Switch lai Quang học-Cơ học LIGHTFORCE phản hồi siêu nhanh và bền bỉ. Pin dùng đến 95 giờ.',
    shop: {
      name: 'Logitech G Official',
      logo: '👾',
      rating: '4.9',
      responseRate: '98%',
      followers: '680K'
    }
  },
  {
    id: 'tech-6',
    title: 'Tai nghe chống ồn Sony WH-1000XM5 Premium Audio',
    category: 'audio',
    categoryName: 'Tai nghe & Âm thanh',
    price: 7290000,
    oldPrice: 8490000,
    discount: '-14%',
    rating: 4.7,
    reviewsCount: 310,
    salesCount: 'Đã bán 1.1k',
    imageEmoji: '🎧',
    gallery: ['🎧', '🔇', '🔋', '🎙️'],
    description: 'Tai nghe chụp tai Over-ear cao cấp với công nghệ chống ồn chủ động ANC hàng đầu thế giới nhờ bộ xử lý tích hợp V1 và HD QN1. Hỗ trợ âm thanh độ phân giải cao Hi-Res Audio và mã hóa LDAC truyền tải âm thanh không dây đỉnh cao. Thời lượng pin 30 giờ.',
    shop: {
      name: 'Sony Store Online',
      logo: '🎵',
      rating: '4.8',
      responseRate: '95%',
      followers: '420K'
    }
  },
  {
    id: 'tech-7',
    title: 'Card màn hình ASUS ROG Strix GeForce RTX 4080 Super OC 16GB',
    category: 'components',
    categoryName: 'Linh kiện Máy tính',
    price: 33990000,
    oldPrice: 35990000,
    discount: '-5%',
    rating: 4.9,
    reviewsCount: 22,
    salesCount: 'Đã bán 88',
    imageEmoji: '🔌',
    gallery: ['🔌', '🌀', '💡', '🛡️'],
    description: 'Card đồ họa NVIDIA GeForce RTX 4080 Super phiên bản ép xung sẵn OC mạnh mẽ từ ASUS ROG. Thiết kế tản nhiệt 3 quạt Axial-tech hầm hố, khung kim loại đúc siêu cứng cáp và hệ thống led Aura Sync RGB rực rỡ. Đáp ứng hoàn hảo các tác vụ render đồ họa và gaming 4K.',
    shop: {
      name: 'ASUS ROG Store',
      logo: '👹',
      rating: '4.9',
      responseRate: '97%',
      followers: '450K'
    }
  },
  {
    id: 'tech-8',
    title: 'CPU Intel Core i9-14900K (3.2GHz Turbo 6.0GHz / 24 Nhân 32 Luồng)',
    category: 'components',
    categoryName: 'Linh kiện Máy tính',
    price: 15490000,
    oldPrice: 16500000,
    discount: '-6%',
    rating: 4.8,
    reviewsCount: 65,
    salesCount: 'Đã bán 190',
    imageEmoji: '🧠',
    gallery: ['🧠', '⚡', '⚙️', '📦'],
    description: 'Bộ vi xử lý Intel Core thế hệ 14 Raptor Lake Refresh cao cấp nhất dành cho máy tính để bàn. Sở hữu cấu trúc lai 24 nhân (8 hiệu năng cao P-core & 16 tiết kiệm điện E-core), xung nhịp tối đa đạt mức kỷ lục 6.0 GHz cho khả năng xử lý đơn nhân và đa nhân vượt trội.',
    shop: {
      name: 'Intel Partner Store',
      logo: '💎',
      rating: '4.8',
      responseRate: '94%',
      followers: '130K'
    }
  },
  {
    id: 'tech-9',
    title: 'Đồng hồ thông minh Apple Watch Ultra 2 GPS + Cellular 49mm Titanium',
    category: 'smart-devices',
    categoryName: 'Thiết bị Thông minh',
    price: 21490000,
    oldPrice: 22990000,
    discount: '-6%',
    rating: 4.9,
    reviewsCount: 78,
    salesCount: 'Đã bán 210',
    imageEmoji: '⌚',
    gallery: ['⌚', '🏔️', '🌊', '🔋'],
    description: 'Đồng hồ thể thao chuyên nghiệp bền bỉ nhất của Apple với vỏ ngoài Titanium chuẩn hàng không vũ trụ siêu bền, mặt kính Sapphire chống xước tuyệt đối. Màn hình Retina có độ sáng kỷ lục 3000 nits giúp đọc rõ dưới nắng gắt. Tích hợp GPS tần số kép chính xác cao.',
    shop: {
      name: 'Apple Flagship Store',
      logo: '🍎',
      rating: '4.9',
      responseRate: '98%',
      followers: '1.2M'
    }
  },
  {
    id: 'tech-10',
    title: 'Cáp sạc kiêm Hub chuyển đổi HyperDrive 9-in-1 USB-C Power Hub',
    category: 'accessories',
    categoryName: 'Phụ kiện Công nghệ',
    price: 2290000,
    oldPrice: 2600000,
    discount: '-11%',
    rating: 4.7,
    reviewsCount: 112,
    salesCount: 'Đã bán 450',
    imageEmoji: '🔌',
    gallery: ['🔌', '📺', '⚡', '📦'],
    description: 'Cáp chuyển đổi đa năng 9 cổng mở rộng kết nối từ USB-C ra các cổng thông dụng: HDMI 4K30Hz, Gigabit Ethernet, 3 x USB-A, khe đọc thẻ SD/MicroSD và hỗ trợ sạc ngược Power Delivery 100W. Chất liệu nhôm nguyên khối tản nhiệt tốt, thiết kế thanh lịch gọn nhẹ.',
    shop: {
      name: 'HyperDrive VN',
      logo: '⚡',
      rating: '4.8',
      responseRate: '96%',
      followers: '54K'
    }
  }
];
