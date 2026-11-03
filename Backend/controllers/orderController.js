const orderService = require('../services/orderService');

const orderController = {
  // 1. GET /api/orders
  async getMyOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.user.id || req.user._id);
      return res.json(orders);
    } catch (error) {
      console.error('Lỗi lấy lịch sử đơn hàng:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: 'Lỗi lấy lịch sử đơn hàng.', details: error.message });
    }
  },

  // 2. GET /api/orders/shop
  async getShopOrders(req, res) {
    try {
      const orders = await orderService.getShopOrders(req.user);
      return res.json(orders);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng của shop:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message });
    }
  },

  // 3. GET /api/orders/admin
  async getAdminOrders(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Từ chối: Bạn không có quyền quản trị viên.' });
      }
      const orders = await orderService.getAdminOrders(req.query);
      return res.json(orders);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng toàn hệ thống:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: 'Lỗi lấy danh sách đơn hàng toàn hệ thống.', details: error.message });
    }
  },

  // 4. GET /api/orders/:id
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return res.json(order);
    } catch (error) {
      console.error('Lỗi lấy thông tin chi tiết đơn hàng:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message, details: error.message });
    }
  },

  // 5. POST /api/orders
  async createOrder(req, res) {
    try {
      const result = await orderService.createOrder(req.user, req.body);
      return res.status(201).json({
        message: 'Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
        orders: result.orders,
        order: result.order,
        pointsEarned: result.pointsEarned,
        newMemberPoints: result.newMemberPoints,
        newMemberRank: result.newMemberRank
      });
    } catch (error) {
      console.error('Lỗi đặt hàng:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message, details: error.message });
    }
  },

  // 6. PUT /api/orders/:id/status
  async updateOrderStatus(req, res) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.user, req.body.orderStatus, req.body);
      return res.json({
        message: `Đã cập nhật trạng thái đơn hàng thành "${req.body.orderStatus}"!`,
        order
      });
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message, details: error.message });
    }
  },

  // 7. PUT /api/orders/:id/cancel
  async cancelOrder(req, res) {
    try {
      const order = await orderService.cancelOrder(req.params.id, req.user);
      return res.json({
        message: 'Hủy đơn hàng thành công! Số lượng sản phẩm đã được hoàn lại vào kho.',
        order
      });
    } catch (error) {
      console.error('Lỗi hủy đơn hàng:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: error.message, details: error.message });
    }
  }
};

module.exports = orderController;

