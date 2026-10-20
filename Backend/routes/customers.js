const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');

/**
 * Hàm hỗ trợ tìm hoặc tự động khởi tạo hồ sơ Customer từ User đã đăng nhập
 * Đảm bảo không tạo dữ liệu trùng lặp và liên kết chặt chẽ quan hệ giữa Customer và User
 */
async function findOrCreateCustomer(user) {
  let customer = await Customer.findOne({ 
    $or: [
      { userId: user._id }, 
      { email: user.email.toLowerCase().trim() }
    ] 
  });

  if (!customer) {
    const defaultAddr = user.addresses?.find(a => a.isDefault) || user.addresses?.[0];
    customer = new Customer({
      userId: user._id,
      name: user.name || user.username || 'Khách hàng GearTech',
      email: user.email.toLowerCase().trim(),
      phone: user.phone || '',
      avatar: user.avatar || '/images/avatar/default.png',
      status: user.status === 'locked' ? 'inactive' : 'active',
      shippingAddress: defaultAddr ? {
        receiverName: defaultAddr.receiverName || user.name,
        receiverPhone: defaultAddr.receiverPhone || user.phone,
        detailAddress: defaultAddr.detailAddress,
        province: defaultAddr.province || '',
        district: defaultAddr.district || '',
        ward: defaultAddr.ward || ''
      } : undefined,
      addresses: user.addresses || []
    });
    await customer.save();
  } else if (!customer.userId) {
    // Nếu có hồ sơ cũ từ SQL import chưa gán userId, tiến hành liên kết
    customer.userId = user._id;
    await customer.save();
  }

  return customer;
}

// ==========================================
// 1. KHÁCH HÀNG XEM HỒ SƠ CỦA CHÍNH MÌNH
// GET /api/customers/me
// ==========================================
router.get('/me', auth, async (req, res) => {
  try {
    const customer = await findOrCreateCustomer(req.user);
    return res.json({
      message: 'Lấy thông tin hồ sơ khách hàng thành công.',
      customer
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin khách hàng:', error);
    return res.status(500).json({ error: 'Lỗi lấy thông tin khách hàng.', details: error.message });
  }
});

// Alias: GET /api/customers/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const customer = await findOrCreateCustomer(req.user);
    return res.json({ customer });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy hồ sơ khách hàng.', details: error.message });
  }
});

// ==========================================
// 2. KHÁCH HÀNG CẬP NHẬT HỒ SƠ CỦA CHÍNH MÌNH
// PUT /api/customers/me
// Tự động đồng bộ với User để đảm bảo tính nhất quán của hệ thống
// ==========================================
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, avatar, shippingAddress, address } = req.body;
    const customer = await findOrCreateCustomer(req.user);
    const user = await User.findById(req.user._id);

    // Cập nhật Customer
    if (name && name.trim()) {
      customer.name = name.trim();
      if (user) user.name = name.trim();
    }

    if (phone !== undefined) {
      customer.phone = phone.trim();
      if (user) user.phone = phone.trim();
    }

    if (avatar && avatar.trim()) {
      customer.avatar = avatar.trim();
      if (user) user.avatar = avatar.trim();
    }

    // Cập nhật địa chỉ nhận hàng
    if (shippingAddress && typeof shippingAddress === 'object') {
      customer.shippingAddress = {
        receiverName: shippingAddress.receiverName || customer.name,
        receiverPhone: shippingAddress.receiverPhone || customer.phone,
        detailAddress: shippingAddress.detailAddress || customer.shippingAddress?.detailAddress || '',
        province: shippingAddress.province || customer.shippingAddress?.province || '',
        district: shippingAddress.district || customer.shippingAddress?.district || '',
        ward: shippingAddress.ward || customer.shippingAddress?.ward || ''
      };
    } else if (address && typeof address === 'string') {
      customer.shippingAddress = {
        receiverName: customer.name,
        receiverPhone: customer.phone,
        detailAddress: address.trim(),
        province: '',
        district: '',
        ward: ''
      };
    }

    await customer.save();

    // Đồng bộ lại địa chỉ mặc định trong User nếu có
    if (user && customer.shippingAddress?.detailAddress) {
      const defaultAddr = user.addresses?.find(a => a.isDefault);
      if (defaultAddr) {
        defaultAddr.detailAddress = customer.shippingAddress.detailAddress;
        defaultAddr.receiverName = customer.shippingAddress.receiverName || user.name;
        defaultAddr.receiverPhone = customer.shippingAddress.receiverPhone || user.phone;
      } else {
        user.addresses = user.addresses || [];
        user.addresses.push({
          title: 'Địa chỉ mặc định',
          receiverName: customer.shippingAddress.receiverName || user.name,
          receiverPhone: customer.shippingAddress.receiverPhone || user.phone,
          detailAddress: customer.shippingAddress.detailAddress,
          isDefault: true
        });
      }
      await user.save();
    }

    return res.json({
      message: 'Cập nhật thông tin khách hàng thành công!',
      customer,
      user
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật hồ sơ khách hàng:', error);
    return res.status(500).json({ error: 'Lỗi cập nhật hồ sơ khách hàng.', details: error.message });
  }
});

// Alias: PUT /api/customers/profile
router.put('/profile', auth, async (req, res) => {
  return router.handle(Object.assign(req, { url: '/me' }), res);
});

// ==========================================
// 3. LẤY THÔNG TIN KHÁCH HÀNG PHỤC VỤ ĐẶT HÀNG & CHECKOUT
// GET /api/customers/checkout-info
// ==========================================
router.get('/checkout-info', auth, async (req, res) => {
  try {
    const customer = await findOrCreateCustomer(req.user);
    
    // Ưu tiên địa chỉ giao hàng đã lưu, nếu chưa có thì lấy từ địa chỉ đầu tiên trong danh bạ
    const defaultAddr = customer.shippingAddress?.detailAddress 
      ? customer.shippingAddress 
      : (customer.addresses?.[0] || {});

    return res.json({
      customerId: customer._id,
      userId: customer.userId,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      shippingAddress: {
        receiverName: defaultAddr.receiverName || customer.name,
        receiverPhone: defaultAddr.receiverPhone || customer.phone,
        detailAddress: defaultAddr.detailAddress || '',
        province: defaultAddr.province || '',
        district: defaultAddr.district || '',
        ward: defaultAddr.ward || ''
      }
    });

  } catch (error) {
    console.error('Lỗi lấy thông tin đặt hàng:', error);
    return res.status(500).json({ error: 'Không thể lấy thông tin đặt hàng.', details: error.message });
  }
});

// ==========================================
// 4. ADMIN XEM DANH SÁCH TOÀN BỘ KHÁCH HÀNG (KÈM TÌM KIẾM & PHÂN TRANG)
// GET /api/customers
// ==========================================
router.get('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(query)
        .populate('userId', 'role status memberRank points')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Customer.countDocuments(query)
    ]);

    return res.json({
      customers,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('Lỗi lấy danh sách khách hàng:', error);
    return res.status(500).json({ error: 'Lỗi lấy danh sách khách hàng.', details: error.message });
  }
});

// ==========================================
// 5. XEM CHI TIẾT HỒ SƠ KHÁCH HÀNG BẰNG ID
// GET /api/customers/:id
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let customer = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      customer = await Customer.findById(id).populate('userId', 'role status memberRank points');
    }
    if (!customer) {
      customer = await Customer.findOne({ userId: id }).populate('userId', 'role status memberRank points');
    }

    if (!customer) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ khách hàng.' });
    }

    // Kiểm tra quyền xem: Chính chủ, Admin hoặc Chủ shop xem để xử lý đơn hàng
    const isSelf = customer.userId && customer.userId._id 
      ? customer.userId._id.toString() === req.user._id.toString()
      : customer.userId?.toString() === req.user._id.toString();
    const isAllowed = isSelf || req.user.role === 'admin' || req.user.role === 'shop';

    if (!isAllowed) {
      return res.status(403).json({ error: 'Từ chối truy cập: Bạn không có quyền xem thông tin khách hàng này.' });
    }

    return res.json(customer);

  } catch (error) {
    console.error('Lỗi lấy chi tiết khách hàng:', error);
    return res.status(500).json({ error: 'Lỗi lấy chi tiết khách hàng.', details: error.message });
  }
});

// ==========================================
// 6. ADMIN THÊM MỚI KHÁCH HÀNG THỦ CÔNG
// POST /api/customers
// ==========================================
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, email, phone, avatar, shippingAddress, status = 'active' } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp họ tên khách hàng.' });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email khách hàng.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Customer.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email khách hàng này đã tồn tại trong hệ thống.' });
    }

    const newCustomer = new Customer({
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      avatar: avatar || '/images/avatar/default.png',
      status,
      shippingAddress
    });

    await newCustomer.save();

    return res.status(201).json({
      message: 'Đã thêm hồ sơ khách hàng mới thành công!',
      customer: newCustomer
    });

  } catch (error) {
    console.error('Lỗi thêm khách hàng mới:', error);
    return res.status(500).json({ error: 'Lỗi thêm khách hàng mới.', details: error.message });
  }
});

module.exports = router;
