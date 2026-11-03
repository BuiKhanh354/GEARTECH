const CareBooking = require('../models/CareBooking');

const PACKAGE_INFO = {
  'deep-clean': {
    name: 'Bảo Dưỡng & Vệ Sinh Chuyên Sâu',
    price: 250000
  },
  'hardware-repair': {
    name: 'Sửa Chữa Phần Cứng & Linh Kiện',
    price: 350000
  },
  'data-recovery': {
    name: 'Cứu Hộ Dữ Liệu & Nâng Cấp Tốc Độ',
    price: 450000
  },
  'care-plus': {
    name: 'Gói Bảo Hành Vàng (GearTech Care+)',
    price: 990000
  }
};

// 1. Khách hàng tạo phiếu đặt dịch vụ GearTech Care
exports.createBooking = async (req, res) => {
  try {
    const { fullName, phone, address, deviceType, servicePackage, issueDescription } = req.body;

    if (!fullName || !phone || !servicePackage) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Chọn gói dịch vụ.' });
    }

    const pkg = PACKAGE_INFO[servicePackage] || {
      name: 'Dịch vụ Kỹ thuật GearTech Care',
      price: 250000
    };

    // Tạo mã phiếu duy nhất định dạng: GC-YYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(2, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `GC-${dateStr}-${randomSuffix}`;

    const newBooking = new CareBooking({
      bookingCode,
      userId: req.user ? req.user._id : null,
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address ? address.trim() : '',
      deviceType: deviceType || 'laptop',
      servicePackage,
      servicePackageName: pkg.name,
      price: pkg.price,
      issueDescription: issueDescription ? issueDescription.trim() : '',
      status: 'pending'
    });

    await newBooking.save();

    return res.status(201).json({
      message: 'Đặt lịch dịch vụ GearTech Care thành công!',
      booking: newBooking
    });
  } catch (error) {
    console.error('Lỗi khi tạo lịch GearTech Care:', error);
    return res.status(500).json({ error: 'Không thể tạo lịch dịch vụ lúc này. Vui lòng thử lại sau.' });
  }
};

// 2. Lấy danh sách phiếu đặt dịch vụ của người dùng hiện tại
exports.getMyBookings = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Yêu cầu đăng nhập để xem lịch sử đặt dịch vụ.' });
    }

    const bookings = await CareBooking.find({
      $or: [
        { userId: req.user._id },
        { phone: req.user.phone }
      ]
    }).sort({ createdAt: -1 });

    return res.json(bookings);
  } catch (error) {
    console.error('Lỗi getMyBookings:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách lịch sử.' });
  }
};

// 3. Admin: Lấy danh sách tất cả phiếu dịch vụ kèm lọc, tìm kiếm và phân trang
exports.getAdminBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { bookingCode: { $regex: s, $options: 'i' } },
        { fullName: { $regex: s, $options: 'i' } },
        { phone: { $regex: s, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [bookings, total] = await Promise.all([
      CareBooking.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email phone avatar'),
      CareBooking.countDocuments(query)
    ]);

    return res.json({
      bookings,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    console.error('Lỗi getAdminBookings:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi lấy danh sách phiếu dịch vụ.' });
  }
};

// 4. Admin: Cập nhật trạng thái phiếu, phân công kỹ thuật viên, ghi chú
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technicianName, adminNote, price } = req.body;

    const booking = await CareBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ error: 'Không tìm thấy phiếu dịch vụ này.' });
    }

    if (status) {
      booking.status = status;
      if (status === 'completed' && !booking.completedAt) {
        booking.completedAt = new Date();
      }
    }

    if (technicianName !== undefined) {
      booking.technicianName = technicianName.trim();
    }

    if (adminNote !== undefined) {
      booking.adminNote = adminNote.trim();
    }

    if (price !== undefined && !isNaN(price)) {
      booking.price = Number(price);
    }

    await booking.save();

    return res.json({
      message: 'Cập nhật phiếu dịch vụ GearTech Care thành công!',
      booking
    });
  } catch (error) {
    console.error('Lỗi updateBooking:', error);
    return res.status(500).json({ error: 'Lỗi cập nhật phiếu dịch vụ.' });
  }
};

// 5. Admin: Báo cáo số liệu và doanh thu trực tiếp từ GearTech Care
exports.getAdminStats = async (req, res) => {
  try {
    const [total, pending, confirmed, inProgress, completed, cancelled, revenueResult] = await Promise.all([
      CareBooking.countDocuments(),
      CareBooking.countDocuments({ status: 'pending' }),
      CareBooking.countDocuments({ status: 'confirmed' }),
      CareBooking.countDocuments({ status: 'in_progress' }),
      CareBooking.countDocuments({ status: 'completed' }),
      CareBooking.countDocuments({ status: 'cancelled' }),
      CareBooking.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$price' } } }
      ])
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return res.json({
      total,
      pending,
      confirmed,
      inProgress,
      completed,
      cancelled,
      totalRevenue
    });
  } catch (error) {
    console.error('Lỗi getAdminStats:', error);
    return res.status(500).json({ error: 'Lỗi thống kê dịch vụ GearTech Care.' });
  }
};

