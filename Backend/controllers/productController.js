const { getDevelopmentErrorDetails } = require('../utils/errorDetails')
const productService = require('../services/productService');

const productController = {
  // 1. GET /api/products
  async getProducts(req, res) {
    try {
      const data = await productService.getProducts(req.query);
      return res.json(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách sản phẩm:', error);
      return res.status(500).json({ error: 'Lỗi lấy danh sách sản phẩm.', ...getDevelopmentErrorDetails(error) });
    }
  },

  // 2. GET /api/products/shop/my-products
  async getMyProducts(req, res) {
    try {
      const data = await productService.getMyProducts(req.user, req.query);
      return res.json(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách sản phẩm của shop:', error);
      const status = error.statusCode || 500;
      return res.status(status).json({ error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message });
    }
  },

  // 3. GET /api/products/:id
  async getProductById(req, res) {
    try {
      const product = await productService.getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Không tìm thấy sản phẩm công nghệ.' });
      }
      return res.json(product);
    } catch (error) {
      return res.status(500).json({ error: 'Lỗi lấy chi tiết sản phẩm.', ...getDevelopmentErrorDetails(error) });
    }
  },

  // 4. POST /api/products
  async createProduct(req, res) {
    try {
      const newProduct = await productService.createProduct(req.user, req.body);
      return res.status(201).json({ 
        message: 'Sản phẩm đã được đăng bán thành công trên hệ thống GearTech!', 
        product: newProduct 
      });
    } catch (error) {
      console.error('Lỗi đăng bán sản phẩm:', error);
      const status = error.statusCode || 500;
      const resp = { error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message };
      if (error.shopStatus) resp.shopStatus = error.shopStatus;
      if (status === 500 && process.env.NODE_ENV !== 'production') resp.details = error.message;
      return res.status(status).json(resp);
    }
  },

  // 5. PUT /api/products/:id
  async updateProduct(req, res) {
    try {
      const product = await productService.updateProduct(req.params.id, req.user, req.body);
      return res.json({
        message: 'Cập nhật thông tin sản phẩm thành công!',
        product
      });
    } catch (error) {
      console.error('Lỗi cập nhật sản phẩm:', error);
      const status = error.statusCode || 500;
      const resp = { error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message };
      if (status === 500 && process.env.NODE_ENV !== 'production') resp.details = error.message;
      return res.status(status).json(resp);
    }
  },

  // 6. PUT /api/products/:id/status
  async updateProductStatus(req, res) {
    try {
      const product = await productService.updateProductStatus(req.params.id, req.user, req.body.status);
      return res.json({
        message: `Đã chuyển trạng thái sản phẩm sang "${req.body.status}".`,
        product
      });
    } catch (error) {
      const status = error.statusCode || 500;
      return res.status(status).json({ error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message });
    }
  },

  // 7. DELETE /api/products/:id
  async deleteProduct(req, res) {
    try {
      const result = await productService.deleteProduct(req.params.id, req.user);
      if (result.isSoftDeleted) {
        return res.json({
          message: `Sản phẩm "${result.product.title}" đã phát sinh ${result.orderCount} đơn hàng trong quá khứ nên được chuyển sang "Ngừng kinh doanh" (inactive) để bảo toàn dữ liệu lịch sử.`,
          isSoftDeleted: true,
          product: result.product
        });
      }

      return res.json({ 
        message: `Đã xóa sản phẩm "${result.product.title}" thành công!`,
        isSoftDeleted: false 
      });
    } catch (error) {
      console.error('Lỗi xóa sản phẩm:', error);
      const status = error.statusCode || 500;
      const resp = { error: status >= 500 && process.env.NODE_ENV === 'production' ? 'Lỗi máy chủ.' : error.message };
      if (status === 500 && process.env.NODE_ENV !== 'production') resp.details = error.message;
      return res.status(status).json(resp);
    }
  }
};

module.exports = productController;

