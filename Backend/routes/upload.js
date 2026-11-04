const { getDevelopmentErrorDetails } = require('../utils/errorDetails')
const express = require('express');
const multer = require('multer');
const path = require('path');
const { auth } = require('../middleware/auth');
const { saveImage } = require('../services/storageService');

const router = express.Router();

// Sử dụng memoryStorage để nhận buffer trực tiếp phục vụ tải lên Firebase / Local
const memoryStorage = multer.memoryStorage();

// Bộ lọc chỉ cho phép file ảnh
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype) || (file.originalname && file.originalname.toLowerCase().endsWith('.svg'))) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF, WEBP, AVIF, SVG).'), false);
  }
};

// Cấu hình Multer cho các loại ảnh khác nhau
const uploadProducts = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 } // Tối đa 6 ảnh, mỗi ảnh 5MB
});

const uploadSingle = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 } // Tối đa 1 ảnh 5MB
});

const uploadBanner = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 } // Tối đa 1 ảnh 10MB
});

// ==========================================================================
// 1. UPLOAD ẢNH SẢN PHẨM (Nhiều ảnh, tối đa 6)
// POST /api/upload/product-images
// ==========================================================================
router.post('/product-images', auth, uploadProducts.array('images', 6), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Vui lòng chọn ít nhất 1 ảnh để tải lên.' });
    }

    // Tải từng ảnh lên Firebase (hoặc fallback Local)
    const uploadPromises = req.files.map(file => 
      saveImage(file.buffer, file.originalname, file.mimetype, 'products')
    );

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(r => r.url);
    const storageProvider = results[0]?.storage || 'local';

    res.json({
      message: `Tải lên thành công ${imageUrls.length} ảnh sản phẩm! (${storageProvider})`,
      urls: imageUrls,
      storage: storageProvider
    });
  } catch (error) {
    console.error('Lỗi upload ảnh sản phẩm:', error);
    res.status(500).json({ error: 'Lỗi tải lên ảnh sản phẩm.', ...getDevelopmentErrorDetails(error) });
  }
});

// ==========================================================================
// 2. UPLOAD ẢNH GIAO DIỆN CỬA HÀNG (LOGO / BANNER SHOP)
// POST /api/upload/shop-images (field: 'image')
// ==========================================================================
router.post('/shop-images', auth, uploadSingle.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 ảnh để tải lên.' });
    }

    const result = await saveImage(req.file.buffer, req.file.originalname, req.file.mimetype, 'shops');

    res.json({
      message: `Tải lên ảnh cửa hàng thành công! (${result.storage})`,
      url: result.url,
      storage: result.storage
    });
  } catch (error) {
    console.error('Lỗi upload ảnh cửa hàng:', error);
    res.status(500).json({ error: 'Lỗi tải lên ảnh cửa hàng.', ...getDevelopmentErrorDetails(error) });
  }
});

// ==========================================================================
// 3. UPLOAD ICON DANH MỤC
// POST /api/upload/category-icon (field: 'icon')
// ==========================================================================
router.post('/category-icon', auth, uploadSingle.single('icon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 file icon để tải lên.' });
    }

    const result = await saveImage(req.file.buffer, req.file.originalname, req.file.mimetype, 'categories');

    res.json({
      message: `Tải lên icon danh mục thành công! (${result.storage})`,
      url: result.url,
      storage: result.storage
    });
  } catch (error) {
    console.error('Lỗi upload icon danh mục:', error);
    res.status(500).json({ error: 'Lỗi tải lên icon danh mục.', ...getDevelopmentErrorDetails(error) });
  }
});

// ==========================================================================
// 4. UPLOAD BANNER TRANG CHỦ
// POST /api/upload/homepage-banner (field: 'banner')
// ==========================================================================
router.post('/homepage-banner', auth, uploadBanner.single('banner'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Vui lòng chọn 1 ảnh banner để tải lên.' });
    }

    const result = await saveImage(req.file.buffer, req.file.originalname, req.file.mimetype, 'banners');

    res.json({
      message: `Tải lên ảnh banner trang chủ thành công! (${result.storage})`,
      url: result.url,
      storage: result.storage
    });
  } catch (error) {
    console.error('Lỗi upload banner:', error);
    res.status(500).json({ error: 'Lỗi tải lên ảnh banner trang chủ.', ...getDevelopmentErrorDetails(error) });
  }
});

// Middleware xử lý lỗi Multer
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Dung lượng ảnh vượt quá giới hạn cho phép.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Số lượng ảnh vượt quá giới hạn cho phép.' });
    }
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

module.exports = router;
