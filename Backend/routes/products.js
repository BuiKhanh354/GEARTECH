const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, checkRole } = require('../middleware/auth');

// 1. LẤY DANH SÁCH SẢN PHẨM (PUBLIC CHO KHÁCH HÀNG & BỘ LỌC TOÀN DIỆN)
// GET /api/products
router.get('/', productController.getProducts);

// 2. CHỦ SHOP LẤY TOÀN BỘ SẢN PHẨM CỦA GIAN HÀNG MÌNH
// GET /api/products/shop/my-products
router.get('/shop/my-products', auth, checkRole(['shop', 'admin']), productController.getMyProducts);

// 3. LẤY CHI TIẾT SẢN PHẨM BẰNG ID HOẶC SLUG
// GET /api/products/:id
router.get('/:id', productController.getProductById);

// 4. ĐĂNG BÁN SẢN PHẨM MỚI (CHỦ SHOP HOẶC ADMIN)
// POST /api/products
router.post('/', auth, checkRole(['shop', 'admin']), productController.createProduct);

// 5. CHỈNH SỬA SẢN PHẨM (CHỈ CHỦ SHOP HOẶC ADMIN)
// PUT /api/products/:id
router.put('/:id', auth, checkRole(['shop', 'admin']), productController.updateProduct);

// 6. ĐỔI NHANH TRẠNG THÁI SẢN PHẨM (ẨN / HIỆN / HẾT HÀNG)
// PUT /api/products/:id/status
router.put('/:id/status', auth, checkRole(['shop', 'admin']), productController.updateProductStatus);

// 7. XÓA SẢN PHẨM (CHỈ CHỦ SHOP HOẶC ADMIN)
// DELETE /api/products/:id
router.delete('/:id', auth, checkRole(['shop', 'admin']), productController.deleteProduct);

// 8. QUẢN LÝ HÌNH ẢNH SẢN PHẨM (Section 3.6 - product_images)
router.use('/:productId/images', require('./productImages'));

module.exports = router;
