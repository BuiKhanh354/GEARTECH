const express = require('express');
const router = express.Router();
const ShopFollower = require('../models/ShopFollower');
const Shop = require('../models/Shop');
const { auth } = require('../middleware/auth');

// ==========================================
// 1. GET /api/shop-followers/my-followed - Danh sách shop user đang theo dõi
// ==========================================
router.get('/my-followed', auth, async (req, res) => {
  try {
    const followed = await ShopFollower.find({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }]
    })
      .populate('shop_id', 'shopName logoUrl address rating status')
      .sort({ created_at: -1 });

    const validFollowed = followed.filter(f => f.shop_id != null);
    return res.json(validFollowed);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách shop đang theo dõi.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/shop-followers/check/:shopId - Kiểm tra trạng thái & số lượng followers
// ==========================================
router.get('/check/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    let isFollowing = false;

    // Lấy token nếu có
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = require('jsonwebtoken');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'GEARTECH_VALORANT_EDITION_SECRET_2026');
        if (decoded && decoded.id) {
          const exists = await ShopFollower.findOne({
            $and: [
              { $or: [{ user_id: decoded.id }, { userId: decoded.id }] },
              { $or: [{ shop_id: shopId }, { shopId: shopId }] }
            ]
          });
          isFollowing = !!exists;
        }
      } catch {
        // ignore token error for public check
      }
    }

    const followersCount = await ShopFollower.countDocuments({
      $or: [{ shop_id: shopId }, { shopId: shopId }]
    });

    return res.json({
      isFollowing,
      followersCount
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi kiểm tra trạng thái theo dõi shop.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/shop-followers/:shopId - Theo dõi shop
// ==========================================
router.post('/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Cửa hàng không tồn tại.' });
    }

    // Ngăn theo dõi cùng 1 shop nhiều lần
    let follower = await ShopFollower.findOne({
      $and: [
        { $or: [{ user_id: req.user.id }, { userId: req.user.id }] },
        { $or: [{ shop_id: shop._id }, { shopId: shop._id }] }
      ]
    });

    if (follower) {
      const count = await ShopFollower.countDocuments({ $or: [{ shop_id: shop._id }, { shopId: shop._id }] });
      return res.status(200).json({
        message: 'Bạn đã theo dõi cửa hàng này từ trước.',
        isFollowing: true,
        followersCount: count
      });
    }

    follower = await ShopFollower.create({
      user_id: req.user.id,
      userId: req.user.id,
      shop_id: shop._id,
      shopId: shop._id
    });

    const count = await ShopFollower.countDocuments({ $or: [{ shop_id: shop._id }, { shopId: shop._id }] });

    return res.status(201).json({
      message: `Đã theo dõi cửa hàng "${shop.shopName || shop.name}" thành công!`,
      isFollowing: true,
      followersCount: count
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ message: 'Đã theo dõi shop.', isFollowing: true });
    }
    return res.status(500).json({ error: 'Lỗi theo dõi cửa hàng.', details: error.message });
  }
});

// ==========================================
// 4. DELETE /api/shop-followers/:shopId - Bỏ theo dõi shop
// ==========================================
router.delete('/:shopId', auth, async (req, res) => {
  try {
    const { shopId } = req.params;

    const result = await ShopFollower.deleteOne({
      $or: [{ user_id: req.user.id }, { userId: req.user.id }],
      $or: [{ shop_id: shopId }, { shopId: shopId }]
    });

    const count = await ShopFollower.countDocuments({ $or: [{ shop_id: shopId }, { shopId: shopId }] });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Bạn chưa từng theo dõi cửa hàng này.', followersCount: count });
    }

    return res.json({
      message: 'Đã bỏ theo dõi cửa hàng thành công!',
      isFollowing: false,
      followersCount: count
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi bỏ theo dõi cửa hàng.', details: error.message });
  }
});

// Alias routes theo yêu cầu prompt C2
router.post('/follow/:shopId', auth, async (req, res, next) => {
  req.url = `/${req.params.shopId}`;
  return router.handle(req, res, next);
});

router.post('/follow', auth, async (req, res, next) => {
  const shopId = req.body.shopId || req.body.shop_id;
  if (!shopId) return res.status(400).json({ error: 'Vui lòng cung cấp shopId.' });
  req.params.shopId = shopId;
  req.url = `/${shopId}`;
  return router.handle(req, res, next);
});

router.post('/unfollow/:shopId', auth, async (req, res, next) => {
  req.method = 'DELETE';
  req.url = `/${req.params.shopId}`;
  return router.handle(req, res, next);
});

router.post('/unfollow', auth, async (req, res, next) => {
  const shopId = req.body.shopId || req.body.shop_id;
  if (!shopId) return res.status(400).json({ error: 'Vui lòng cung cấp shopId.' });
  req.method = 'DELETE';
  req.params.shopId = shopId;
  req.url = `/${shopId}`;
  return router.handle(req, res, next);
});

module.exports = router;
