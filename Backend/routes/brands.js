const express = require('express');
const router = express.Router();
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Hàm tạo slug chuẩn tiếng Việt
function createSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ==========================================
// 1. LẤY DANH SÁCH THƯƠNG HIỆU CÔNG KHAI
// GET /api/brands
// Phục vụ khách hàng và chủ shop
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const filter = { status: 'active' };

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const brands = await Brand.find(filter).sort({ order: 1, name: 1 });
    res.json(brands);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thương hiệu:', error);
    res.status(500).json({ error: 'Không thể tải danh sách thương hiệu.' });
  }
});

// ==========================================
// 2. ADMIN LẤY TOÀN BỘ THƯƠNG HIỆU KÈM SỐ SẢN PHẨM
// GET /api/brands/admin/all
// ==========================================
router.get('/admin/all', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Brand.countDocuments(filter);
    const rawBrands = await Brand.find(filter)
      .sort({ order: 1, created_at: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Đếm số lượng sản phẩm đang tham chiếu thương hiệu
    const brandsWithCounts = await Promise.all(
      rawBrands.map(async (brand) => {
        const brandObj = brand.toObject();
        const productCount = await Product.countDocuments({
          $or: [
            { brand: brand.slug },
            { brandId: brand._id },
            { brand_id: brand._id },
            { title: { $regex: `\\b${brand.name}\\b`, $options: 'i' } }
          ]
        });
        brandObj.productCount = productCount;
        return brandObj;
      })
    );

    res.json({
      brands: brandsWithCounts,
      total,
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thương hiệu cho admin:', error);
    res.status(500).json({ error: 'Không thể tải danh sách thương hiệu quản trị.' });
  }
});

// ==========================================
// 3. LẤY CHI TIẾT THƯƠNG HIỆU THEO ID HOẶC SLUG
// GET /api/brands/:id
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let brand = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      brand = await Brand.findById(id);
    }
    if (!brand) {
      brand = await Brand.findOne({ slug: id });
    }

    if (!brand) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu.' });
    }

    res.json(brand);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết thương hiệu:', error);
    res.status(500).json({ error: 'Lỗi máy chủ khi lấy chi tiết thương hiệu.' });
  }
});

// ==========================================
// 4. ADMIN TẠO MỚI THƯƠNG HIỆU
// POST /api/brands
// Yêu cầu: Kiểm tra tên thương hiệu trùng lặp
// ==========================================
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, slug, logo, description, website, status, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Tên thương hiệu không được để trống.' });
    }

    const cleanName = name.trim();
    const cleanSlug = (slug && slug.trim()) ? createSlug(slug) : createSlug(cleanName);

    // Kiểm tra tên trùng lặp (không phân biệt hoa thường)
    const existingName = await Brand.findOne({
      name: { $regex: new RegExp(`^${cleanName}$`, 'i') }
    });
    if (existingName) {
      return res.status(400).json({
        error: `Tên thương hiệu "${cleanName}" đã tồn tại trên hệ thống. Vui lòng chọn tên khác!`
      });
    }

    // Kiểm tra slug trùng lặp
    const existingSlug = await Brand.findOne({ slug: cleanSlug });
    if (existingSlug) {
      return res.status(400).json({
        error: `Đường dẫn định danh slug "/${cleanSlug}" đã được sử dụng. Vui lòng chọn slug khác!`
      });
    }

    const newBrand = new Brand({
      name: cleanName,
      slug: cleanSlug,
      logo: logo && logo.trim() ? logo.trim() : '🏷️',
      description: description ? description.trim() : '',
      website: website ? website.trim() : '',
      status: status || 'active',
      order: Number(order) || 0
    });

    await newBrand.save();
    res.status(201).json({
      message: `Thêm thương hiệu "${newBrand.name}" thành công!`,
      brand: newBrand
    });
  } catch (error) {
    console.error('Lỗi khi tạo thương hiệu:', error);
    res.status(500).json({ error: 'Không thể tạo thương hiệu mới: ' + error.message });
  }
});

// ==========================================
// 5. ADMIN CHỈNH SỬA THƯƠNG HIỆU
// PUT /api/brands/:id
// ==========================================
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, logo, description, website, status, order } = req.body;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu để cập nhật.' });
    }

    if (name && name.trim()) {
      const cleanName = name.trim();
      // Kiểm tra trùng tên với thương hiệu khác
      const existingName = await Brand.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${cleanName}$`, 'i') }
      });
      if (existingName) {
        return res.status(400).json({
          error: `Tên thương hiệu "${cleanName}" đã tồn tại ở bản ghi khác. Vui lòng chọn tên khác!`
        });
      }
      brand.name = cleanName;
    }

    if (slug && slug.trim()) {
      const cleanSlug = createSlug(slug);
      const existingSlug = await Brand.findOne({
        _id: { $ne: id },
        slug: cleanSlug
      });
      if (existingSlug) {
        return res.status(400).json({
          error: `Đường dẫn định danh slug "/${cleanSlug}" đã bị trùng lặp.`
        });
      }
      brand.slug = cleanSlug;
    }

    if (logo !== undefined) brand.logo = logo;
    if (description !== undefined) brand.description = description.trim();
    if (website !== undefined) brand.website = website.trim();
    if (status !== undefined) brand.status = status;
    if (order !== undefined) brand.order = Number(order) || 0;

    await brand.save();
    res.json({
      message: `Cập nhật thương hiệu "${brand.name}" thành công!`,
      brand
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật thương hiệu:', error);
    res.status(500).json({ error: 'Không thể cập nhật thương hiệu: ' + error.message });
  }
});

// ==========================================
// 6. ADMIN ĐỔI NHANH TRẠNG THÁI THƯƠNG HIỆU
// PUT /api/brands/:id/status
// ==========================================
router.put('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'hidden', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Trạng thái không hợp lệ.' });
    }

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu.' });
    }

    brand.status = status;
    await brand.save();

    res.json({
      message: `Đã đổi trạng thái thương hiệu "${brand.name}" sang ${status}.`,
      brand
    });
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái thương hiệu:', error);
    res.status(500).json({ error: 'Không thể cập nhật trạng thái thương hiệu.' });
  }
});

// ==========================================
// 7. ADMIN XÓA THƯƠNG HIỆU
// DELETE /api/brands/:id
// Yêu cầu: Không xóa cứng nếu đang có sản phẩm tham chiếu để bảo toàn dữ liệu lịch sử
// ==========================================
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);
    if (!brand) {
      return res.status(404).json({ error: 'Không tìm thấy thương hiệu để xóa.' });
    }

    // 1. Kiểm tra xem có sản phẩm nào đang tham chiếu thương hiệu này không
    const productCount = await Product.countDocuments({
      $or: [
        { brand: brand.slug },
        { brandId: brand._id },
        { brand_id: brand._id },
        { title: { $regex: `\\b${brand.name}\\b`, $options: 'i' } }
      ]
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: `Không thể xóa thương hiệu "${brand.name}" vì đang có ${productCount} sản phẩm trực tiếp tham chiếu. Vui lòng chuyển trạng thái sang "Ẩn" (hidden) hoặc "Dừng hoạt động" để bảo toàn dữ liệu lịch sử sàn!`
      });
    }

    await Brand.findByIdAndDelete(id);
    res.json({
      message: `Đã xóa thương hiệu "${brand.name}" thành công!`
    });
  } catch (error) {
    console.error('Lỗi khi xóa thương hiệu:', error);
    res.status(500).json({ error: 'Không thể xóa thương hiệu: ' + error.message });
  }
});

module.exports = router;
