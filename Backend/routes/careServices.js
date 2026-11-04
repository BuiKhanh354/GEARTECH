const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth, checkRole } = require('../middleware/auth');
const careController = require('../controllers/careController');

// Middleware xác thực không bắt buộc: Gán req.user nếu có token hợp lệ
const optionalAuth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next();
  }
  try {
    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (user && user.status === 'active') {
      req.user = user;
    }
  } catch (err) {
    // Bỏ qua lỗi token với optional auth
  }
  next();
};

// Route công khai / khách hàng đặt lịch
router.post('/bookings', optionalAuth, careController.createBooking);

// Route khách hàng xem lịch sử đặt của mình
router.get('/bookings/my', auth, careController.getMyBookings);

// Route Quản trị viên (Admin) - GearTech Care là dịch vụ kiếm lời trực tiếp của sàn
router.get('/admin/stats', auth, checkRole(['admin']), careController.getAdminStats);
router.get('/admin/bookings', auth, checkRole(['admin']), careController.getAdminBookings);
router.put('/admin/bookings/:id', auth, checkRole(['admin']), careController.updateBooking);

module.exports = router;

