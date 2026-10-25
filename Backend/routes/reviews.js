const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

// Helper tính lại rating trung bình cho sản phẩm
async function recalculateProductRating(productId) {
  try {
    const stats = await Review.aggregate([
      { 
        $match: { 
          $or: [{ product_id: new mongoose.Types.ObjectId(productId) }, { productId: new mongoose.Types.ObjectId(productId) }],
          status: 'approved'
        } 
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const product = await Product.findById(productId);
    if (product) {
      if (stats.length > 0) {
        product.rating = Number(stats[0].avgRating.toFixed(1));
        product.reviewsCount = stats[0].count;
      } else {
        product.rating = 5.0;
        product.reviewsCount = 0;
      }
      await product.save();
    }
  } catch (err) {
    console.error('Lỗi tính lại rating sản phẩm:', err.message);
  }
}

// ==========================================
// 1. GET /api/reviews/product/:productId - Lấy danh sách đánh giá của sản phẩm
// ==========================================
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      $or: [{ product_id: productId }, { productId: productId }],
      status: 'approved'
    })
      .populate('user_id', 'name username avatar')
      .populate('userId', 'name username avatar')
      .sort({ created_at: -1 });

    // Tính thống kê sao
    let totalScore = 0;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach(r => {
      totalScore += r.rating;
      if (starCounts[r.rating] !== undefined) {
        starCounts[r.rating]++;
      }
    });

    const averageRating = reviews.length > 0 ? Number((totalScore / reviews.length).toFixed(1)) : 5.0;

    return res.json({
      reviews,
      totalReviews: reviews.length,
      averageRating,
      starCounts
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách đánh giá.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/reviews/check-eligibility/:productId - Kiểm tra điều kiện đánh giá
// ==========================================
router.get('/check-eligibility/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Kiểm tra xem người dùng đã từng đánh giá sản phẩm này chưa
    // Lưu ý: mỗi object query chỉ được có MỘT key $or, các điều kiện phải gộp chung
    const existingReview = await Review.findOne({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ product_id: productId }, { productId: productId }] }
      ]
    });

    // 2. Kiểm tra xem khách hàng có đơn hàng completed chứa sản phẩm này không
    // Tìm trong order_items
    const userOrders = await Order.find({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ orderStatus: 'completed' }, { order_status: 'completed' }] }
      ]
    }).select('_id');

    const completedOrderIds = userOrders.map(o => o._id);

    const purchasedItem = await OrderItem.findOne({
      order_id: { $in: completedOrderIds },
      product_id: productId
    });

    // Cũng kiểm tra cả mảng items nhúng trong Order
    let hasPurchased = !!purchasedItem;
    if (!hasPurchased && completedOrderIds.length > 0) {
      const embeddedCheck = await Order.findOne({
        _id: { $in: completedOrderIds },
        'items.product_id': productId
      });
      if (embeddedCheck) hasPurchased = true;
    }

    return res.json({
      eligible: hasPurchased,
      hasReviewed: !!existingReview,
      review: existingReview || null
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi kiểm tra điều kiện đánh giá.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/reviews - Gửi hoặc cập nhật đánh giá sản phẩm
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { productId, rating, comment, images } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Thiếu mã sản phẩm (productId).' });
    }

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Số sao đánh giá phải từ 1 đến 5 sao.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập nội dung đánh giá sản phẩm.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại.' });
    }

    // Nghiệp vụ 3.15: Kiểm tra điều kiện mua hàng - chỉ được đánh giá khi đơn hàng hoàn tất
    const userOrders = await Order.find({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ orderStatus: 'completed' }, { order_status: 'completed' }] }
      ]
    }).select('_id');

    const completedOrderIds = userOrders.map(o => o._id);

    let relatedOrder = await OrderItem.findOne({
      order_id: { $in: completedOrderIds },
      product_id: product._id
    });

    let orderIdRef = relatedOrder ? relatedOrder.order_id : null;

    if (!orderIdRef && completedOrderIds.length > 0) {
      const embeddedOrder = await Order.findOne({
        _id: { $in: completedOrderIds },
        'items.product_id': product._id
      });
      if (embeddedOrder) orderIdRef = embeddedOrder._id;
    }

    // Ngoại lệ: Nếu Admin hoặc môi trường test cho phép, hoặc bắt buộc phải có đơn hoàn tất
    if (!orderIdRef && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Chỉ những khách hàng đã mua và nhận hàng thành công (đơn hàng hoàn tất) mới có thể gửi đánh giá cho sản phẩm này!' 
      });
    }

    // Kiểm tra xem đã có đánh giá cũ chưa (Chỉ cho phép 1 đánh giá, cho sửa đánh giá cũ)
    let review = await Review.findOne({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ product_id: product._id }, { productId: product._id }] }
      ]
    });

    if (review) {
      // Cập nhật đánh giá cũ
      review.rating = numRating;
      review.comment = comment.trim();
      if (images) review.images = images;
      review.order_id = orderIdRef || review.order_id;
      review.orderId = orderIdRef || review.orderId;
      await review.save();

      await recalculateProductRating(product._id);

      return res.json({
        message: 'Cập nhật đánh giá của bạn thành công!',
        review
      });
    }

    // Tạo đánh giá mới
    review = await Review.create({
      user_id: req.user.id,
      userId: req.user.id,
      product_id: product._id,
      productId: product._id,
      order_id: orderIdRef,
      orderId: orderIdRef,
      rating: numRating,
      comment: comment.trim(),
      images: images || [],
      status: 'approved'
    });

    await recalculateProductRating(product._id);

    return res.status(201).json({
      message: 'Gửi đánh giá sản phẩm thành công! Cảm ơn bạn đã phản hồi.',
      review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Bạn đã đánh giá sản phẩm này rồi, vui lòng chỉnh sửa đánh giá hiện có.' });
    }
    return res.status(500).json({ error: 'Lỗi gửi đánh giá sản phẩm.', details: error.message });
  }
});

// ==========================================
// 4. PUT /api/reviews/:id - Sửa đánh giá
// ==========================================
router.put('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá cần sửa.' });
    }

    const isOwner = String(review.userId || review.user_id) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền chỉnh sửa đánh giá này.' });
    }

    const { rating, comment, images } = req.body;
    if (rating !== undefined) {
      const num = Number(rating);
      if (num < 1 || num > 5) return res.status(400).json({ error: 'Số sao đánh giá phải từ 1 đến 5.' });
      review.rating = num;
    }
    if (comment !== undefined) {
      if (!comment.trim()) return res.status(400).json({ error: 'Nội dung nhận xét không được để trống.' });
      review.comment = comment.trim();
    }
    if (images !== undefined) review.images = images;

    await review.save();
    await recalculateProductRating(review.product_id || review.productId);

    return res.json({
      message: 'Cập nhật đánh giá thành công!',
      review
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật đánh giá.', details: error.message });
  }
});

// ==========================================
// 5. DELETE /api/reviews/:id - Xóa đánh giá
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Không tìm thấy đánh giá cần xóa.' });
    }

    const isOwner = String(review.userId || review.user_id) === String(req.user.id);
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xóa đánh giá này.' });
    }

    const productId = review.product_id || review.productId;
    const shopId = review.shop_id || review.shopId;
    await Review.deleteOne({ _id: review._id });
    if (productId) await recalculateProductRating(productId);
    if (shopId) await recalculateShopRating(shopId);

    return res.json({ message: 'Xóa đánh giá thành công!' });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa đánh giá.', details: error.message });
  }
});

// Helper tính lại rating trung bình cho shop
async function recalculateShopRating(shopId) {
  try {
    const Shop = require('../models/Shop');
    const stats = await Review.aggregate([
      {
        $match: {
          $or: [{ shop_id: new mongoose.Types.ObjectId(shopId) }, { shopId: new mongoose.Types.ObjectId(shopId) }],
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    const shop = await Shop.findById(shopId);
    if (shop) {
      if (stats.length > 0) {
        shop.rating = Number(stats[0].avgRating.toFixed(1));
      } else {
        shop.rating = 5.0;
      }
      await shop.save();
    }
  } catch (err) {
    console.error('Lỗi tính lại rating shop:', err.message);
  }
}

// ==========================================
// 6. GET /api/reviews/shop/:shopId - Lấy danh sách đánh giá của gian hàng
// ==========================================
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;

    const reviews = await Review.find({
      $or: [{ shop_id: shopId }, { shopId: shopId }],
      status: 'approved'
    })
      .populate('user_id', 'name username avatar')
      .populate('userId', 'name username avatar')
      .sort({ created_at: -1 });

    let totalScore = 0;
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      totalScore += r.rating;
      if (starCounts[r.rating] !== undefined) {
        starCounts[r.rating]++;
      }
    });

    const averageRating = reviews.length > 0 ? Number((totalScore / reviews.length).toFixed(1)) : 5.0;

    return res.json({
      reviews,
      totalReviews: reviews.length,
      averageRating,
      starCounts
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy đánh giá gian hàng.', details: error.message });
  }
});

// ==========================================
// 7. POST /api/reviews/shop/:shopId - Khách hàng gửi đánh giá cho gian hàng
// ==========================================
router.post('/shop/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;
    const { rating, comment, images } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Số sao đánh giá phải từ 1 đến 5 sao.' });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({ error: 'Nội dung nhận xét không được để trống.' });
    }

    const Shop = require('../models/Shop');
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Gian hàng không tồn tại.' });
    }

    // Kiểm tra xem đã từng đánh giá shop chưa
    let review = await Review.findOne({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ shop_id: shopId }, { shopId: shopId }] }
      ]
    });

    if (review) {
      review.rating = numRating;
      review.comment = comment.trim();
      if (images) review.images = images;
      review.updated_at = new Date();
      await review.save();
    } else {
      const customer = await Customer.findOne({ $or: [{ userId: req.user.id }, { user_id: req.user.id }] });
      review = await Review.create({
        user_id: req.user.id,
        userId: req.user.id,
        customer_id: customer ? customer._id : undefined,
        customerId: customer ? customer._id : undefined,
        shop_id: shop._id,
        shopId: shop._id,
        rating: numRating,
        comment: comment.trim(),
        images: Array.isArray(images) ? images : [],
        status: 'approved'
      });
    }

    await recalculateShopRating(shop._id);

    return res.status(201).json({
      message: 'Cảm ơn bạn đã gửi đánh giá cho gian hàng!',
      review
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi gửi đánh giá gian hàng.', details: error.message });
  }
});

module.exports = router;
