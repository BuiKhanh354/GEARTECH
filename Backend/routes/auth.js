const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { auth, checkRole } = require('../middleware/auth');

// ==========================================
// 1. ĐĂNG KÝ TÀI KHOẢN KHÁCH HÀNG
// POST /api/auth/register
// ==========================================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Kiểm tra dữ liệu đầu vào cơ bản
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp họ và tên.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được sử dụng trên hệ thống.' });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yêu cầu Prompt 3.1: Không cho người dùng tự nâng quyền lên Admin hoặc Chủ shop
    // Luôn cố định role là 'user' và status là 'active'
    const newUser = new User({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'user',
      status: 'active',
      memberRank: 'THUONG',
      points: 0
    });

    await newUser.save();

    // Tự động tạo bản ghi Customer liên kết 1-1 (Section 3.7: customers)
    try {
      const Customer = require('../models/Customer');
      await Customer.create({
        userId: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '',
        status: 'active'
      });
    } catch (err) {
      console.error('Lỗi tự động tạo Customer cho user mới:', err);
    }

    // Không trả mật khẩu hoặc thông tin xác thực nhạy cảm trong response
    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        memberRank: newUser.memberRank
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi đăng ký tài khoản.', details: error.message });
  }
});

// ==========================================
// 2. ĐĂNG NHẬP HỆ THỐNG
// POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ email và mật khẩu.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Tìm user theo email, nếu chưa có thì kiểm tra trong collection Customer (Section 3.7)
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const Customer = require('../models/Customer');
      const customer = await Customer.findOne({ email: cleanEmail });
      if (customer && customer.password) {
        let isCustMatch = false;
        if (customer.password.startsWith('$2a$') || customer.password.startsWith('$2b$')) {
          isCustMatch = await bcrypt.compare(password, customer.password);
        } else {
          isCustMatch = (password === customer.password);
        }

        if (isCustMatch) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          user = await User.create({
            name: customer.name || 'Khách hàng',
            email: customer.email,
            password: hashedPassword,
            phone: customer.phone || '',
            avatar: customer.avatar || '/images/avatar/default.png',
            role: 'user',
            status: customer.status === 'inactive' ? 'locked' : 'active'
          });
          customer.userId = user._id;
          await customer.save();
        }
      }
    }

    if (!user) {
      return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    // So khớp mật khẩu (Hỗ trợ bcrypt hash và tự động băm nâng cấp nếu tài khoản được import thô)
    let isMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = (password === user.password);
      if (isMatch) {
        // Tự động băm lại mật khẩu theo chuẩn bảo mật
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
      }
    }

    if (!isMatch) {
      return res.status(400).json({ error: 'Tài khoản hoặc mật khẩu không chính xác.' });
    }

    // Yêu cầu Prompt 3.1: Không cho tài khoản bị khóa thực hiện đăng nhập và thao tác
    if (user.status === 'locked') {
      return res.status(403).json({
        error: 'Tài khoản của bạn đã bị khóa bởi Quản trị viên. Vui lòng liên hệ CSKH để được hỗ trợ.',
        isLocked: true
      });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role, shopId: user.shopId },
      process.env.JWT_SECRET || 'GEARTECH_VALORANT_EDITION_SECRET_2026',
      { expiresIn: '7d' }
    );

    // Trả về dữ liệu sạch (loại bỏ mật khẩu)
    return res.json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
        shopId: user.shopId,
        memberRank: user.memberRank,
        points: user.points
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xử lý đăng nhập.', details: error.message });
  }
});

// ==========================================
// 3. ĐĂNG XUẤT HỆ THỐNG
// POST /api/auth/logout
// ==========================================
router.post('/logout', auth, async (req, res) => {
  // Với JWT không lưu session ở DB, endpoint này thông báo hoàn tất đăng xuất
  return res.json({ message: 'Đăng xuất khỏi hệ thống thành công!' });
});

// ==========================================
// 4. LẤY THÔNG TIN TÀI KHOẢN ĐANG ĐĂNG NHẬP
// GET /api/auth/profile
// ==========================================
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người dùng.' });
    }

    // Nếu là tài khoản đối tác shop, bổ sung dữ liệu gian hàng
    if (user.role === 'shop' && user.shopId) {
      const shop = await Shop.findById(user.shopId);
      return res.json({ user, shop });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy thông tin tài khoản.', details: error.message });
  }
});

// ==========================================
// 5. CẬP NHẬT THÔNG TIN TÀI KHOẢN
// PUT /api/auth/profile
// ==========================================
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, gender, birthday } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    }

    // Chỉ cho phép cập nhật thông tin cá nhân, tuyệt đối không cho phép tự đổi role hoặc status
    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (gender) user.gender = gender;
    if (birthday) user.birthday = birthday;

    if (address) {
      const defaultAddr = user.addresses.find(addr => addr.isDefault);
      if (defaultAddr) {
        defaultAddr.detailAddress = address;
        defaultAddr.receiverName = name || user.name;
        defaultAddr.receiverPhone = phone || user.phone || '000000000';
      } else {
        user.addresses.push({
          title: 'Mặc định',
          receiverName: name || user.name,
          receiverPhone: phone || user.phone || '000000000',
          detailAddress: address,
          isDefault: true
        });
      }
    }

    await user.save();

    // Tự động đồng bộ hồ sơ sang Customer (Section 3.7: customers)
    try {
      const Customer = require('../models/Customer');
      const updateFields = {
        name: user.name,
        phone: user.phone
      };
      if (address) {
        updateFields.shippingAddress = {
          receiverName: user.name,
          receiverPhone: user.phone,
          detailAddress: address
        };
      }
      await Customer.findOneAndUpdate(
        { $or: [{ userId: user._id }, { email: user.email }] },
        { $set: updateFields },
        { upsert: true }
      );
    } catch (err) {
      console.error('Lỗi đồng bộ hồ sơ sang Customer:', err);
    }

    return res.json({ message: 'Cập nhật hồ sơ tài khoản thành công!', user });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật hồ sơ.', details: error.message });
  }
});

// ==========================================
// 6. ADMIN LẤY DANH SÁCH NGƯỜI DÙNG (KÈM TÌM KIẾM, LỌC & PHÂN TRANG)
// GET /api/auth/users
// ==========================================
router.get('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { search, role, status, page = 1, limit = 10 } = req.query;

    const query = {};

    // Lọc theo từ khóa tìm kiếm (Tên, Email hoặc Số điện thoại)
    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    // Lọc theo vai trò (Role)
    if (role && role !== 'all') {
      query.role = role;
    }

    // Lọc theo trạng thái tài khoản (Status)
    if (status && status !== 'all') {
      query.status = status;
    }

    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * itemsPerPage;

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('shopId', 'name logo category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      User.countDocuments(query)
    ]);

    return res.json({
      users,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / itemsPerPage)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải danh sách người dùng.', details: error.message });
  }
});

// ==========================================
// 7. ADMIN KHÓA HOẶC MỞ KHÓA TÀI KHOẢN
// PUT /api/auth/users/:id/status
// ==========================================
router.put('/users/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, lockDurationHours, lockExpiresAt: customExpiresAt, lockReason, scope = 'all' } = req.body;

    if (!['active', 'locked'].includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ. Chỉ chấp nhận 'active' hoặc 'locked'." });
    }

    // Không cho phép Admin tự khóa tài khoản của chính mình
    if (req.user._id.toString() === id) {
      return res.status(400).json({ error: 'Quản trị viên không thể tự khóa tài khoản của chính mình!' });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng cần thao tác.' });
    }

    // Không cho tự khóa tài khoản Admin khác
    if (targetUser.role === 'admin' && status === 'locked') {
      return res.status(400).json({ error: 'Không thể khóa tài khoản quản trị viên!' });
    }

    if (scope === 'order') {
      // Khóa riêng quyền đặt hàng (Section 8 cus.md: không chặn quyền truy cập website)
      if (status === 'locked') {
        targetUser.isOrderLocked = true;
        targetUser.orderLockedAt = new Date();
        targetUser.orderLockReason = lockReason ? lockReason.trim() : 'Khóa quyền đặt hàng bởi Quản trị viên';

        if (customExpiresAt) {
          targetUser.orderLockExpiresAt = new Date(customExpiresAt);
        } else if (lockDurationHours && Number(lockDurationHours) > 0) {
          targetUser.orderLockExpiresAt = new Date(Date.now() + Number(lockDurationHours) * 3600 * 1000);
        } else {
          targetUser.orderLockExpiresAt = null;
        }
      } else {
        targetUser.isOrderLocked = false;
        targetUser.orderLockedAt = null;
        targetUser.orderLockExpiresAt = null;
        targetUser.orderLockReason = '';
      }
    } else {
      targetUser.status = status;

      if (status === 'locked') {
        targetUser.lockedAt = new Date();
        targetUser.lockReason = lockReason ? lockReason.trim() : 'Khóa bởi Quản trị viên';

        if (customExpiresAt) {
          targetUser.lockExpiresAt = new Date(customExpiresAt);
        } else if (lockDurationHours && Number(lockDurationHours) > 0) {
          targetUser.lockExpiresAt = new Date(Date.now() + Number(lockDurationHours) * 3600 * 1000);
        } else {
          targetUser.lockExpiresAt = null; // Khóa vô thời hạn
        }
      } else {
        targetUser.lockedAt = null;
        targetUser.lockExpiresAt = null;
        targetUser.lockReason = '';
      }
    }

    await targetUser.save();

    // Đồng bộ trạng thái sang hồ sơ Customer liên kết để dữ liệu nhất quán
    try {
      const Customer = require('../models/Customer');
      await Customer.findOneAndUpdate(
        { $or: [{ userId: targetUser._id }, { email: targetUser.email }] },
        { $set: { status: status === 'locked' ? 'inactive' : 'active' } }
      );
    } catch (syncErr) {
      console.error('Lỗi đồng bộ trạng thái Customer:', syncErr.message);
    }

    const actionText = status === 'locked' 
      ? (targetUser.lockExpiresAt 
          ? `Đã khóa tài khoản đến ${new Date(targetUser.lockExpiresAt).toLocaleString('vi-VN')}` 
          : 'Đã khóa tài khoản vĩnh viễn')
      : 'Đã mở khóa tài khoản';

    return res.json({
      message: `${actionText} thành công!`,
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        status: targetUser.status,
        lockedAt: targetUser.lockedAt,
        lockExpiresAt: targetUser.lockExpiresAt,
        lockReason: targetUser.lockReason
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật trạng thái tài khoản.', details: error.message });
  }
});

// ==========================================
// 7B. ADMIN DASHBOARD: THỐNG KÊ TỔNG QUAN TOÀN SÀN (dữ liệu thật MongoDB)
// GET /api/auth/admin/overview?days=7|30
// Phân biệt rõ: Tổng giá trị đơn hàng (toàn bộ đơn) và Giá trị đơn hoàn tất
// (doanh thu bán hàng của các shop). Nền tảng CHƯA có quy tắc tính phí/hoa hồng
// (Shop.commission_rate chỉ là tham số chưa có luồng ghi nhận) nên KHÔNG
// trình bày "doanh thu nền tảng" — chỉ báo cáo giá trị đơn theo trạng thái.
// ==========================================
router.get('/admin/overview', auth, checkRole(['admin']), async (req, res) => {
  try {
    const days = [7, 30].includes(Number(req.query.days)) ? Number(req.query.days) : 7;
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    since.setDate(since.getDate() - (days - 1));

    const Order = require('../models/Order');
    const Product = require('../models/Product');
    const ShopModel = require('../models/Shop');
    const CustomerModel = require('../models/Customer');

    const orderAmount = (o) =>
      Number(o.finalAmount ?? (o.final_amount ? parseFloat(o.final_amount.toString()) : 0)) || 0;
    const normStatus = (o) => (o.orderStatus || o.order_status || 'pending').toLowerCase();

    // ---- 1. Đếm tổng thể (chạy song song) ----
    const [
      totalUsers, totalCustomers, totalShopOwners, totalShops, totalProducts,
      totalOrders, lockedUsers, pendingShopsCount, activeShopsCount
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'shop' }),
      ShopModel.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
      User.countDocuments({ status: 'locked' }),
      ShopModel.countDocuments({ status: 'pending' }),
      ShopModel.countDocuments({ status: 'active' })
    ]);

    // ---- 2. Giá trị đơn hàng theo trạng thái (toàn sàn, mọi thời gian) ----
    const valueAgg = await Order.aggregate([
      { $group: {
          _id: { $ifNull: ['$orderStatus', '$order_status'] },
          count: { $sum: 1 },
          value: { $sum: { $ifNull: ['$finalAmount', { $toDouble: { $ifNull: ['$final_amount', 0] } }] } }
      } }
    ]);
    const orderStatus = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
    const statusValue = { ...orderStatus };
    let totalOrderValueAll = 0;
    for (const row of valueAgg) {
      const k = String(row._id || 'pending').toLowerCase();
      if (orderStatus[k] === undefined) continue;
      orderStatus[k] = row.count;
      statusValue[k] = Math.round(row.value || 0);
      totalOrderValueAll += Math.round(row.value || 0);
    }
    const completedOrderValue = statusValue.completed; // doanh thu bán hàng của các shop

    // ---- 3. Chuỗi theo ngày: đơn mới + giá trị đơn hoàn tất + tài khoản mới ----
    const periodOrders = await Order.find({ created_at: { $gte: since } })
      .select('order_status orderStatus final_amount finalAmount created_at').lean();
    const newUsers = await User.find({ createdAt: { $gte: since } })
      .select('createdAt role').lean();

    const seriesMap = new Map();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      seriesMap.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), revenue: 0, orders: 0, newUsers: 0 });
    }
    for (const o of periodOrders) {
      const bucket = seriesMap.get(new Date(o.created_at).toISOString().slice(0, 10));
      if (!bucket) continue;
      bucket.orders += 1;
      if (normStatus(o) === 'completed') bucket.revenue += orderAmount(o);
    }
    for (const u of newUsers) {
      const bucket = seriesMap.get(new Date(u.createdAt).toISOString().slice(0, 10));
      if (bucket) bucket.newUsers += 1;
    }
    const series = Array.from(seriesMap.values());

    // ---- 4. Cảnh báo nghiệp vụ ----
    const pendingShops = await ShopModel.find({ status: 'pending' })
      .select('name shop_name createdAt ownerId').populate('ownerId', 'name email').lean();

    // ---- 5. Bảng dữ liệu nhanh ----
    const [recentOrders, recentShops, recentUsers, recentProducts] = await Promise.all([
      Order.find({}).sort({ created_at: -1 }).limit(6)
        .select('created_at order_status orderStatus final_amount finalAmount items').lean(),
      ShopModel.find({}).sort({ createdAt: -1 }).limit(5)
        .select('name shop_name status createdAt total_products').lean(),
      User.find({}).sort({ createdAt: -1 }).limit(6)
        .select('name email role status createdAt').lean(),
      Product.find({}).sort({ createdAt: -1 }).limit(5)
        .select('title price stock status createdAt shopId').populate('shopId', 'name').lean()
    ]);

    return res.json({
      counts: {
        totalUsers, totalCustomers, totalShopOwners, totalShops, totalProducts, totalOrders,
        lockedUsers, pendingShops: pendingShopsCount, activeShops: activeShopsCount
      },
      orderStatus,
      orderValue: {
        totalAll: totalOrderValueAll,
        completed: completedOrderValue,
        note: 'Nền tảng chưa có quy tắc tính phí/hoa hồng nên không hiển thị doanh thu nền tảng'
      },
      period: { days, since },
      series,
      alerts: { pendingShops },
      recent: {
        orders: recentOrders.map(o => ({
          _id: o._id, createdAt: o.created_at, status: normStatus(o), total: orderAmount(o),
          itemCount: (o.items || []).length
        })),
        shops: recentShops,
        users: recentUsers,
        products: recentProducts
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy thống kê tổng quan.', details: error.message });
  }
});

// ==========================================
// 8. ADMIN TẠO TÀI KHOẢN NGƯỜI DÙNG MỚI (D2)
// POST /api/auth/users
// Dùng khi khách hàng không thể tự đăng ký. Mật khẩu tạm được cấp một lần,
// bắt buộc thay đổi sau khi đăng nhập lần đầu (chức năng đổi mật khẩu đã có ở SecurityTab).
// ==========================================
router.post('/users', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp họ tên người dùng.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ email.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Mật khẩu tạm phải có độ dài tối thiểu 6 ký tự.' });
    }

    const finalRole = ['user', 'shop'].includes(role) ? role : 'user';

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'Email này đã được sử dụng trên hệ thống.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tuyệt đối không cho tạo tài khoản Admin qua API này
    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: finalRole,
      status: 'active'
    });

    // Tự động tạo hồ sơ Customer liên kết cho tài khoản khách hàng
    if (finalRole === 'user') {
      try {
        const Customer = require('../models/Customer');
        await Customer.create({
          userId: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone || '',
          status: 'active'
        });
      } catch (custErr) {
        console.error('Lỗi tạo Customer cho tài khoản admin tạo mới:', custErr.message);
      }
    }

    // Tự động khởi tạo Shop khi tạo tài khoản Chủ Shop (D2)
    if (finalRole === 'shop') {
      try {
        const newShop = await Shop.create({
          name: `${newUser.name} Store`,
          shop_name: `${newUser.name} Store`,
          ownerId: newUser._id,
          user_id: newUser._id,
          category: 'Cửa hàng máy tính & linh kiện công nghệ',
          phone: newUser.phone || '',
          email: newUser.email,
          status: 'active'
        });
        newUser.shopId = newShop._id;
        await newUser.save();
      } catch (shopErr) {
        console.error('Lỗi tạo Shop cho tài khoản shop mới:', shopErr.message);
      }
    }

    return res.status(201).json({
      message: `Đã tạo tài khoản "${newUser.email}" (${finalRole === 'shop' ? 'Chủ Shop' : 'Khách hàng'}) thành công!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        shopId: newUser.shopId
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tạo tài khoản người dùng.', details: error.message });
  }
});

// ==========================================
// 9. ADMIN CẤP TÀI KHOẢN CHO ĐỐI TÁC DOANH NGHIỆP
// POST /api/auth/register-shop
// ==========================================
router.post('/register-shop', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, password, phone, shopName, logo, category, bgClass } = req.body;

    let existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email đối tác đã được sử dụng.' });
    }

    let existingShop = await Shop.findOne({ name: shopName.toUpperCase().trim() });
    if (existingShop) {
      return res.status(400).json({ error: 'Tên cửa hàng (Shop) này đã tồn tại.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newShop = new Shop({
      name: shopName.trim(),
      logo: logo || '🏬',
      category: category || 'Đối tác phân phối thiết bị',
      bgClass: bgClass || 'from-zinc-900 to-black'
    });

    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'shop',
      status: 'active',
      shopId: newShop._id
    });

    await newUser.save();

    newShop.ownerId = newUser._id;
    await newShop.save();

    return res.status(201).json({
      message: 'Cấp tài khoản doanh nghiệp thành công!',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
        shopId: newUser.shopId
      },
      shop: newShop
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tạo tài khoản doanh nghiệp.', details: error.message });
  }
});

module.exports = router;
