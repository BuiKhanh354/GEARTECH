const express = require('express');
const router = express.Router();
const Favorite = require('../models/Favorite');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

// ==========================================
// 1. GET /api/favorites - Danh sách sản phẩm yêu thích của user
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }]
    })
      .populate({
        path: 'product_id',
        populate: { path: 'shopId', select: 'shopName' }
      })
      .sort({ created_at: -1 });

    // Lọc bỏ những sản phẩm đã bị xóa hoặc không còn tồn tại
    const validFavorites = favorites.filter(f => f.product_id != null);

    return res.json(validFavorites);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách yêu thích.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/favorites/check/:productId - Kiểm tra sản phẩm đã yêu thích chưa
// ==========================================
router.get('/check/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const exists = await Favorite.findOne({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }],
      $or: [{ product_id: productId }, { productId: productId }]
    });

    return res.json({ isFavorite: !!exists });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi kiểm tra yêu thích.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/favorites/:productId - Thêm sản phẩm vào danh sách yêu thích
// ==========================================
router.post('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm tồn tại
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
    }

    // Ngăn khách hàng lưu trùng cùng sản phẩm
    let favorite = await Favorite.findOne({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }],
      $or: [{ product_id: product._id }, { productId: product._id }]
    });

    if (favorite) {
      return res.status(200).json({
        message: 'Sản phẩm đã nằm trong danh sách yêu thích của bạn từ trước.',
        favorite,
        isFavorite: true
      });
    }

    favorite = await Favorite.create({
      user_id: req.user.id,
      userId: req.user.id,
      product_id: product._id,
      productId: product._id
    });

    return res.status(201).json({
      message: 'Đã thêm sản phẩm vào danh sách yêu thích thành công!',
      favorite,
      isFavorite: true
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Sản phẩm đã được yêu thích.', isFavorite: true });
    }
    return res.status(500).json({ error: 'Lỗi thêm sản phẩm yêu thích.', details: error.message });
  }
});

// ==========================================
// 4. DELETE /api/favorites/:productId - Bỏ yêu thích sản phẩm
// ==========================================
router.delete('/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const result = await Favorite.deleteOne({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }],
      $or: [{ product_id: productId }, { productId: productId }]
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Sản phẩm chưa nằm trong danh sách yêu thích.' });
    }

    return res.json({
      message: 'Đã bỏ sản phẩm khỏi danh sách yêu thích thành công!',
      isFavorite: false
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa sản phẩm yêu thích.', details: error.message });
  }
});

module.exports = router;
