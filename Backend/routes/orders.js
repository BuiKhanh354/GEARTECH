const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth } = require('../middleware/auth');

// 1. GET /api/orders - Lịch sử đơn hàng của người dùng hiện tại
router.get('/', auth, orderController.getMyOrders);

// 2. GET /api/orders/shop - Chủ shop xem đơn hàng thuộc shop mình
router.get('/shop', auth, orderController.getShopOrders);

// 3. GET /api/orders/admin - Admin xem danh sách đơn hàng toàn hệ thống
router.get('/admin', auth, orderController.getAdminOrders);

// 4. GET /api/orders/:id - Xem chi tiết 1 đơn hàng cụ thể
router.get('/:id', auth, orderController.getOrderById);

// 5. POST /api/orders - Tạo đơn hàng từ giỏ hàng (Checkout)
router.post('/', auth, orderController.createOrder);

// 6. PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Chủ shop / Admin)
router.put('/:id/status', auth, orderController.updateOrderStatus);

// 7. PUT /api/orders/:id/cancel - Khách hàng tự hủy đơn hàng khi đang chờ
router.put('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;
