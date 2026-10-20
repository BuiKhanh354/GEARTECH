const express = require('express');
const router = express.Router();
const Showroom = require('../models/Showroom');
const { auth, checkRole } = require('../middleware/auth');

// 1. Lấy danh sách showroom (Google Map)
// GET /api/showrooms
router.get('/', async (req, res) => {
  try {
    const showrooms = await Showroom.find();
    res.json(showrooms);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách showroom.', details: error.message });
  }
});

// 2. Admin thêm showroom mới (Chỉ dành cho Admin)
// POST /api/showrooms
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, address, phone, hours, features, lat, lng, city, mapUrl } = req.body;

    const newShowroom = new Showroom({
      name,
      address,
      phone,
      hours,
      features,
      lat,
      lng,
      city,
      mapUrl
    });

    await newShowroom.save();
    res.status(201).json({ message: 'Thêm mới showroom thành công!', showroom: newShowroom });
  } catch (error) {
    res.status(500).json({ error: 'Lỗi tạo mới showroom.', details: error.message });
  }
});

module.exports = router;
