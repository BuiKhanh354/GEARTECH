const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware xác thực JWT Token và kiểm tra trạng thái tài khoản
const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Không tìm thấy token xác thực. Truy cập bị từ chối.' });
  }

  const token = authHeader.replace('Bearer ', '').trim();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'GEARTECH_VALORANT_EDITION_SECRET_2026');
    
    // Kiểm tra tài khoản trong cơ sở dữ liệu để đảm bảo tài khoản tồn tại và không bị khóa
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Người dùng không còn tồn tại trên hệ thống.' });
    }

    // D1: Kiểm tra trạng thái khóa và thời hạn khóa
    if (user.status === 'locked') {
      const now = new Date();
      // Nếu đã hết thời hạn khóa, tự động phục hồi tài khoản
      if (user.lockExpiresAt && new Date(user.lockExpiresAt) <= now) {
        user.status = 'active';
        user.lockedAt = null;
        user.lockExpiresAt = null;
        user.lockReason = '';
        await user.save();
      } else {
        const expireInfo = user.lockExpiresAt 
          ? `Thời hạn khóa đến: ${new Date(user.lockExpiresAt).toLocaleString('vi-VN')}.`
          : 'Thời hạn: Vô thời hạn.';
        const reasonInfo = user.lockReason ? ` Lý do: ${user.lockReason}.` : '';

        return res.status(403).json({ 
          error: `Tài khoản của bạn đã bị khóa bởi Quản trị viên. ${expireInfo}${reasonInfo}`,
          isLocked: true,
          lockExpiresAt: user.lockExpiresAt,
          lockReason: user.lockReason
        });
      }
    }

    // Gán đối tượng user an toàn vào request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn.' });
  }
};

// Middleware kiểm tra quyền truy cập (Role Authorization)
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực người dùng.' });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Từ chối truy cập: Bạn không có quyền thực hiện hành động này.' });
    }
    
    next();
  };
};

module.exports = { auth, checkRole };
