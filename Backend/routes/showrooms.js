const express = require('express');
const router = express.Router();
const Showroom = require('../models/Showroom');
const Shop = require('../models/Shop');
const { auth, checkRole } = require('../middleware/auth');

// 1. Lấy danh sách showroom (Google Map & Shop links)
// GET /api/showrooms
router.get('/', async (req, res) => {
  try {
    const showrooms = await Showroom.find()
      .populate('shopId', 'name shop_name logo category address phone rating')
      .populate('shop_id', 'name shop_name logo category address phone rating');
    res.json(showrooms);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách showroom.', details: error.message });
  }
});

// 2. Admin thêm showroom mới (Chỉ dành cho Admin)
// POST /api/showrooms
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, address, phone, hours, features, lat, lng, city, mapUrl, shopId } = req.body;

    const finalShopId = shopId && String(shopId).trim() !== '' ? shopId : null;

    const newShowroom = new Showroom({
      name,
      address,
      phone,
      hours,
      features,
      lat,
      lng,
      city,
      mapUrl,
      shopId: finalShopId,
      shop_id: finalShopId
    });

    await newShowroom.save();
    const populated = await Showroom.findById(newShowroom._id)
      .populate('shopId', 'name shop_name logo category');

    res.status(201).json({ message: 'Thêm mới showroom thành công!', showroom: populated || newShowroom });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const firstMsg = Object.values(error.errors)[0]?.message || 'Dữ liệu showroom không hợp lệ.';
      return res.status(400).json({ error: firstMsg });
    }
    res.status(500).json({ error: 'Lỗi tạo mới showroom.', details: error.message });
  }
});

// 3. Admin cập nhật showroom
// PUT /api/showrooms/:id
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id);
    if (!showroom) {
      return res.status(404).json({ error: 'Không tìm thấy showroom cần cập nhật.' });
    }

    const { name, address, phone, hours, features, lat, lng, city, mapUrl, shopId } = req.body;

    if (name !== undefined) showroom.name = String(name).trim().toUpperCase();
    if (address !== undefined) showroom.address = address;
    if (phone !== undefined) showroom.phone = phone;
    if (hours !== undefined) showroom.hours = hours;
    if (features !== undefined) showroom.features = Array.isArray(features) ? features : [];
    if (lat !== undefined) showroom.lat = Number(lat);
    if (lng !== undefined) showroom.lng = Number(lng);
    if (city !== undefined && ['hcm', 'hanoi', 'danang'].includes(city)) showroom.city = city;
    if (mapUrl !== undefined) showroom.mapUrl = mapUrl;

    if (shopId !== undefined) {
      const finalShopId = shopId && String(shopId).trim() !== '' ? shopId : null;
      showroom.shopId = finalShopId;
      showroom.shop_id = finalShopId;
    }

    await showroom.save();
    const populated = await Showroom.findById(showroom._id)
      .populate('shopId', 'name shop_name logo category');

    res.json({ message: 'Cập nhật showroom thành công!', showroom: populated || showroom });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi cập nhật showroom.', details: error.message });
  }
});

// 4. Admin xóa showroom
// DELETE /api/showrooms/:id
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const showroom = await Showroom.findById(req.params.id);
    if (!showroom) {
      return res.status(404).json({ error: 'Không tìm thấy showroom cần xóa.' });
    }

    await Showroom.findByIdAndDelete(req.params.id);
    res.json({ message: `Đã xóa showroom "${showroom.name}" thành công!` });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi xóa showroom.', details: error.message });
  }
});

module.exports = router;
