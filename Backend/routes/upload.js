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

// ==========================================================================
// C1: UPLOAD ẢNH GIAO DIỆN CỬA HÀNG (BANNER / LOGO)
// POST /api/upload/shop-images (field: 'image', 1 ảnh, max 5MB)
// Chủ shop hoặc Admin. Ảnh lưu vào Backend/public/uploads/shops và trả về
// URL tĩnh ổn định (không phải blob: tạm thời của trình duyệt).
// ==========================================================================
const shopUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'shops');
if (!fs.existsSync(shopUploadDir)) {
  fs.mkdirSync(shopUploadDir, { recursive: true });
}

const shopStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, shopUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `shop-${uniqueSuffix}${ext}`);
  }
});

const shopUpload = multer({
  storage: shopStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  }
});

router.post('/shop-images', auth, shopUpload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 ảnh để tải lên.' });
    }

    const url = `http://localhost:5000/uploads/shops/${req.file.filename}`;

    res.json({
      message: 'Tải lên ảnh cửa hàng thành công!',
      url
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải lên ảnh cửa hàng.', details: error.message });
  }
});

// ==========================================================================
// D3: UPLOAD ICON DANH MỤC TRỰC TIẾP TỪ MÁY TÍNH
// POST /api/upload/category-icon (field: 'icon', 1 file, max 2MB, .png, .jpg, .svg, .webp)
// ==========================================================================
const categoryUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'categories');
if (!fs.existsSync(categoryUploadDir)) {
  fs.mkdirSync(categoryUploadDir, { recursive: true });
}

const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, categoryUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cat-icon-${uniqueSuffix}${ext}`);
  }
});

const categoryFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'];
  if (allowedTypes.includes(file.mimetype) || (file.originalname && file.originalname.toLowerCase().endsWith('.svg'))) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file icon (PNG, JPG, SVG, WEBP).'), false);
  }
};

const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter: categoryFileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  }
});

router.post('/category-icon', auth, categoryUpload.single('icon'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 file icon để tải lên.' });
    }

    const url = `http://localhost:5000/uploads/categories/${req.file.filename}`;

    res.json({
      message: 'Tải lên icon danh mục thành công!',
      url
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải lên icon danh mục.', details: error.message });
  }
});

// ==========================================================================
// HOMEPAGE BUILDER: UPLOAD BANNER QUẢNG BÁ TRANG CHỦ
// POST /api/upload/homepage-banner (field: 'banner', 1 file, max 10MB)
// ==========================================================================
const bannerUploadDir = path.join(__dirname, '..', 'public', 'uploads', 'banners');
if (!fs.existsSync(bannerUploadDir)) {
  fs.mkdirSync(bannerUploadDir, { recursive: true });
}

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bannerUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `banner-${uniqueSuffix}${ext}`);
  }
});

const bannerUpload = multer({
  storage: bannerStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
});

router.post('/homepage-banner', auth, bannerUpload.single('banner'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 ảnh banner để tải lên.' });
    }

    const url = `http://localhost:5000/uploads/banners/${req.file.filename}`;
    res.json({
      message: 'Tải lên ảnh banner trang chủ thành công!',
      url
    });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tải lên ảnh banner trang chủ.', details: error.message });
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
