const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { auth, checkRole } = require('../middleware/auth');

// Helper chuẩn hóa slug
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// ==========================================
// 1. LẤY DANH SÁCH DANH MỤC CHO KHÁCH HÀNG & CHỦ SHOP (PUBLIC)
// GET /api/categories
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { tree, parent_id, search } = req.query;

    const query = { status: 'active' };

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { slug: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    if (parent_id !== undefined) {
      query.parent_id = parent_id === 'null' || parent_id === '' ? null : parent_id;
    }

    const categories = await Category.find(query)
      .populate('parent_id', 'name slug')
      .sort({ order: 1, createdAt: 1 });

    // Nếu client yêu cầu dạng cây phân cấp cha/con
    if (tree === 'true') {
      const topLevel = categories.filter(c => !c.parent_id);
      const categoryTree = topLevel.map(parent => {
        const children = categories.filter(c => c.parent_id && c.parent_id._id.toString() === parent._id.toString());
        return {
          ...parent.toObject(),
          children
        };
      });
      return res.json(categoryTree);
    }

    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải danh sách danh mục.', details: error.message });
  }
});

// ==========================================
// 2. ADMIN LẤY TOÀN BỘ DANH MỤC (KÈM BỘ LỌC STATUS & TÌM KIẾM)
// GET /api/categories/admin/all
// ==========================================
router.get('/admin/all', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim()) {
      const q = search.trim();
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { slug: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    const currentPage = Math.max(1, Number(page));
    const itemsPerPage = Math.max(1, Number(limit));
    const skip = (currentPage - 1) * itemsPerPage;

    const [categories, total] = await Promise.all([
      Category.find(query)
        .populate('parent_id', 'name slug')
        .sort({ order: 1, createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage),
      Category.countDocuments(query)
    ]);

    // Thống kê số sản phẩm của từng danh mục
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({
          $or: [
            { category: cat.slug },
            { categoryId: cat._id },
            { category_id: cat._id }
          ]
        });
        return {
          ...cat.toObject(),
          productCount
        };
      })
    );

    return res.json({
      categories: categoriesWithCount,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / itemsPerPage)
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi tải danh mục cho Admin.', details: error.message });
  }
});

// ==========================================
// 3. LẤY CHI TIẾT DANH MỤC THEO ID HOẶC SLUG
// GET /api/categories/:id
// ==========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let category = null;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id).populate('parent_id', 'name slug');
    }
    if (!category) {
      category = await Category.findOne({ slug: id }).populate('parent_id', 'name slug');
    }

    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục này.' });
    }

    // Lấy các danh mục con nếu có
    const children = await Category.find({
      $or: [{ parent_id: category._id }, { parent_category_id: category._id }],
      status: 'active'
    });

    return res.json({ category, children });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy chi tiết danh mục.', details: error.message });
  }
});

// ==========================================
// 4. ADMIN THÊM DANH MỤC MỚI
// POST /api/categories
// ==========================================
router.post('/', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { name, slug, description, image, icon, parent_id, status, order } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Vui lòng nhập tên danh mục.' });
    }

    const cleanName = name.trim();
    const finalSlug = slug && slug.trim() ? slugify(slug) : slugify(cleanName);

    if (!finalSlug) {
      return res.status(400).json({ error: 'Không thể tạo slug hợp lệ từ tên danh mục.' });
    }

    // Yêu cầu Prompt 3.3: Kiểm tra tên hoặc slug trùng lặp
    const existing = await Category.findOne({
      $or: [
        { name: { $regex: `^${cleanName}$`, $options: 'i' } },
        { slug: finalSlug }
      ]
    });

    if (existing) {
      const field = existing.name.toLowerCase() === cleanName.toLowerCase() ? 'Tên danh mục' : 'Slug';
      return res.status(400).json({ error: `${field} "${cleanName}" (${finalSlug}) đã tồn tại trên hệ thống. Vui lòng chọn tên khác!` });
    }

    // Kiểm tra danh mục cha nếu có
    let validParentId = null;
    if (parent_id) {
      const parentCat = await Category.findById(parent_id);
      if (!parentCat) {
        return res.status(400).json({ error: 'Danh mục cha đã chọn không tồn tại.' });
      }
      validParentId = parentCat._id;
    }

    const newCategory = new Category({
      name: cleanName,
      slug: finalSlug,
      description: description ? description.trim() : '',
      image: image || '',
      icon: icon || '💻',
      parent_id: validParentId,
      parent_category_id: validParentId,
      status: status || 'active',
      order: Number(order) || 0
    });

    await newCategory.save();

    return res.status(201).json({
      message: 'Thêm danh mục sản phẩm mới thành công!',
      category: newCategory
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thêm danh mục sản phẩm.', details: error.message });
  }
});

// ==========================================
// 5. ADMIN CHỈNH SỬA DANH MỤC
// PUT /api/categories/:id
// ==========================================
router.put('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục cần chỉnh sửa.' });
    }

    const { name, slug, description, image, icon, parent_id, status, order } = req.body;

    const cleanName = name ? name.trim() : category.name;
    const finalSlug = slug ? slugify(slug) : (name ? slugify(cleanName) : category.slug);

    // Yêu cầu Prompt 3.3: Kiểm tra tên hoặc slug trùng lặp với danh mục khác
    const duplicate = await Category.findOne({
      _id: { $ne: category._id },
      $or: [
        { name: { $regex: `^${cleanName}$`, $options: 'i' } },
        { slug: finalSlug }
      ]
    });

    if (duplicate) {
      const field = duplicate.name.toLowerCase() === cleanName.toLowerCase() ? 'Tên danh mục' : 'Slug';
      return res.status(400).json({ error: `${field} "${cleanName}" (${finalSlug}) đã bị trùng với một danh mục khác.` });
    }

    // Kiểm tra không cho phép tự làm cha của chính mình
    if (parent_id) {
      if (parent_id.toString() === category._id.toString()) {
        return res.status(400).json({ error: 'Danh mục không thể tự làm danh mục cha của chính nó!' });
      }
      const parentCat = await Category.findById(parent_id);
      if (!parentCat) {
        return res.status(400).json({ error: 'Danh mục cha đã chọn không tồn tại.' });
      }
      category.parent_id = parentCat._id;
      category.parent_category_id = parentCat._id;
    } else if (parent_id === null || parent_id === '') {
      category.parent_id = null;
      category.parent_category_id = null;
    }

    category.name = cleanName;
    category.slug = finalSlug;
    if (description !== undefined) category.description = description.trim();
    if (image !== undefined) category.image = image;
    if (icon !== undefined) category.icon = icon;
    if (status) category.status = status;
    if (order !== undefined) category.order = Number(order);

    await category.save();

    return res.json({
      message: 'Cập nhật danh mục thành công!',
      category
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật danh mục.', details: error.message });
  }
});

// ==========================================
// 6. ADMIN ẨN HOẶC ĐỔI TRẠNG THÁI DANH MỤC
// PUT /api/categories/:id/status
// ==========================================
router.put('/:id/status', auth, checkRole(['admin']), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'hidden', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Trạng thái không hợp lệ. Chọn 'active', 'hidden' hoặc 'inactive'." });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục.' });
    }

    category.status = status;
    await category.save();

    const actionText = status === 'active' ? 'Hiển thị' : status === 'hidden' ? 'Ẩn' : 'Ngừng hoạt động';

    return res.json({
      message: `Đã ${actionText} danh mục "${category.name}" thành công!`,
      category
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thay đổi trạng thái danh mục.', details: error.message });
  }
});

// ==========================================
// 7. ADMIN XÓA DANH MỤC (BẢO TOÀN DỮ LIỆU)
// DELETE /api/categories/:id
// ==========================================
router.delete('/:id', auth, checkRole(['admin']), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Không tìm thấy danh mục cần xóa.' });
    }

    // Yêu cầu Prompt 3.3: Không xóa cứng danh mục đang được sản phẩm sử dụng nếu việc đó làm mất tính toàn vẹn dữ liệu
    const productCount = await Product.countDocuments({
      $or: [
        { category: category.slug },
        { categoryId: category._id },
        { category_id: category._id }
      ]
    });

    if (productCount > 0) {
      return res.status(400).json({
        error: `Không thể xóa danh mục "${category.name}" vì đang có ${productCount} sản phẩm trực thuộc. Vui lòng chuyển sản phẩm sang danh mục khác hoặc chuyển trạng thái sang "Ẩn" (hidden)!`,
        productCount
      });
    }

    // Kiểm tra danh mục con
    const childCount = await Category.countDocuments({
      $or: [{ parent_id: category._id }, { parent_category_id: category._id }]
    });

    if (childCount > 0) {
      return res.status(400).json({
        error: `Không thể xóa danh mục "${category.name}" vì đang chứa ${childCount} danh mục con. Vui lòng xóa hoặc chuyển các danh mục con trước!`,
        childCount
      });
    }

    await Category.findByIdAndDelete(category._id);

    return res.json({
      message: `Xóa danh mục "${category.name}" thành công!`
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xóa danh mục.', details: error.message });
  }
});

module.exports = router;
