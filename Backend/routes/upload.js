const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file duy nhất: timestamp + random + extension gốc
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

// Bộ lọc chỉ cho phép file ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF, WEBP, AVIF).'), false);
  }
};

// Giới hạn: tối đa 6 ảnh, mỗi ảnh tối đa 5MB
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB mỗi file
    files: 6 // Tối đa 6 file
  }
});

// POST /api/upload/product-images
// Upload nhiều ảnh sản phẩm cùng lúc (max 6)
router.post('/product-images', auth, upload.array('images', 6), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Vui lòng chọn ít nhất 1 ảnh để tải lên.' });
    }

    // Trả về danh sách URL của các ảnh vừa upload
    const imageUrls = req.files.map(file => {
      return `http://localhost:5000/uploads/products/${file.filename}`;
    });

    res.json({
      message: `Tải lên thành công ${imageUrls.length} ảnh sản phẩm!`,
      urls: imageUrls
    });

  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải lên ảnh sản phẩm.', details: error.message });
  }
});

// Middleware xử lý lỗi Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dung lượng ảnh vượt quá giới hạn 5MB cho phép.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Số lượng ảnh vượt quá giới hạn 6 ảnh cho phép.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
