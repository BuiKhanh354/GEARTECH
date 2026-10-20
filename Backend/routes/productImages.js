const express = require('express');
const router = express.Router({ mergeParams: true });
const Product = require('../models/Product');
const ProductImage = require('../models/ProductImage');
const { auth, checkRole } = require('../middleware/auth');

/**
 * Hàm hỗ trợ kiểm tra quyền sở hữu sản phẩm của shop
 */
async function verifyProductOwnership(req, res, productId) {
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm trong hệ thống.' });
    return null;
  }

  const isOwner = req.user.shopId && product.shopId.toString() === req.user.shopId.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({ 
      error: 'Từ chối truy cập: Bạn không có quyền thao tác trên hình ảnh của sản phẩm thuộc cửa hàng khác!' 
    });
    return null;
  }

  return product;
}

/**
 * Hàm đồng bộ danh sách ảnh từ collection ProductImage sang Product (imageEmoji & gallery)
 */
async function syncProductImagesToProduct(product) {
  try {
    const images = await ProductImage.find({ productId: product._id })
      .sort({ isPrimary: -1, sortOrder: 1, createdAt: 1 });

    if (images.length > 0) {
      // Tìm ảnh đại diện chính (hoặc ảnh đầu tiên)
      const primaryImage = images.find(img => img.isPrimary) || images[0];
      if (primaryImage) {
        product.imageEmoji = primaryImage.imageUrl;
      }
      product.gallery = images.map(img => img.imageUrl);
    } else {
      product.gallery = [];
    }

    await product.save();
  } catch (err) {
    console.error('Lỗi khi đồng bộ ảnh sản phẩm:', err);
  }
}

// ==========================================
// 1. LẤY DANH SÁCH ẢNH CỦA SẢN PHẨM
// GET /api/products/:productId/images
// ==========================================
router.get('/', async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm.' });
    }

    let images = await ProductImage.find({ productId })
      .sort({ isPrimary: -1, sortOrder: 1, createdAt: 1 });

    // Tương thích ngược: Nếu ProductImage rỗng nhưng product.gallery hoặc imageEmoji có ảnh, tự động chuyển đổi sang ProductImage
    if (images.length === 0) {
      const legacyUrls = [];
      if (product.imageEmoji && (product.imageEmoji.startsWith('http') || product.imageEmoji.startsWith('/'))) {
        legacyUrls.push(product.imageEmoji);
      }
      if (Array.isArray(product.gallery)) {
        for (const url of product.gallery) {
          if (url && (url.startsWith('http') || url.startsWith('/')) && !legacyUrls.includes(url)) {
            legacyUrls.push(url);
          }
        }
      }

      if (legacyUrls.length > 0) {
        const docs = legacyUrls.map((url, idx) => ({
          productId: product._id,
          imageUrl: url,
          isPrimary: idx === 0,
          sortOrder: idx
        }));
        images = await ProductImage.insertMany(docs);
      }
    }

    return res.json({
      productId,
      total: images.length,
      images
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách ảnh sản phẩm:', error);
    return res.status(500).json({ error: 'Lỗi lấy danh sách hình ảnh sản phẩm.', details: error.message });
  }
});

// ==========================================
// 2. THÊM ẢNH MỚI CHO SẢN PHẨM (CHỦ SHOP HOẶC ADMIN)
// POST /api/products/:productId/images
// ==========================================
router.post('/', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await verifyProductOwnership(req, res, productId);
    if (!product) return;

    const { imageUrl, images: multipleImages, isPrimary = false, sortOrder } = req.body;

    // Trường hợp 1: Thêm nhiều ảnh cùng lúc
    if (Array.isArray(multipleImages) && multipleImages.length > 0) {
      const existingCount = await ProductImage.countDocuments({ productId });
      const docsToInsert = [];

      for (let i = 0; i < multipleImages.length; i++) {
        const item = multipleImages[i];
        const url = typeof item === 'string' ? item : item.imageUrl;
        if (!url || !url.trim()) continue;

        const isFirst = existingCount === 0 && i === 0;
        const itemPrimary = typeof item === 'object' && item.isPrimary !== undefined ? item.isPrimary : isFirst;
        const itemOrder = typeof item === 'object' && item.sortOrder !== undefined ? Number(item.sortOrder) : (existingCount + i);

        docsToInsert.push({
          productId: product._id,
          imageUrl: url.trim(),
          isPrimary: itemPrimary,
          sortOrder: itemOrder
        });
      }

      if (docsToInsert.length === 0) {
        return res.status(400).json({ error: 'Danh sách ảnh tải lên không hợp lệ.' });
      }

      // Nếu có ảnh đánh dấu isPrimary, bỏ isPrimary của các ảnh cũ
      if (docsToInsert.some(d => d.isPrimary)) {
        await ProductImage.updateMany({ productId }, { isPrimary: false });
      }

      const createdImages = await ProductImage.insertMany(docsToInsert);
      await syncProductImagesToProduct(product);

      return res.status(201).json({
        message: `Đã thêm thành công ${createdImages.length} ảnh cho sản phẩm!`,
        images: createdImages
      });
    }

    // Trường hợp 2: Thêm 1 ảnh đơn lẻ
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đường dẫn ảnh (imageUrl).' });
    }

    const currentImagesCount = await ProductImage.countDocuments({ productId });
    const shouldBePrimary = isPrimary || currentImagesCount === 0;

    if (shouldBePrimary) {
      await ProductImage.updateMany({ productId }, { isPrimary: false });
    }

    const newImage = new ProductImage({
      productId: product._id,
      imageUrl: imageUrl.trim(),
      isPrimary: shouldBePrimary,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : currentImagesCount
    });

    await newImage.save();
    await syncProductImagesToProduct(product);

    return res.status(201).json({
      message: 'Đã thêm ảnh cho sản phẩm thành công!',
      image: newImage
    });

  } catch (error) {
    console.error('Lỗi khi thêm ảnh sản phẩm:', error);
    return res.status(500).json({ error: 'Lỗi thêm ảnh sản phẩm.', details: error.message });
  }
});

// ==========================================
// 3. SẮP XẾP THỨ TỰ NHIỀU ẢNH HÀNG LOẠT
// PUT /api/products/:productId/images/reorder
// ==========================================
router.put('/reorder', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await verifyProductOwnership(req, res, productId);
    if (!product) return;

    const { orders } = req.body;
    if (!Array.isArray(orders) || orders.length === 0) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mảng thứ tự sắp xếp ảnh (orders).' });
    }

    const bulkOps = orders.map(item => ({
      updateOne: {
        filter: { _id: item.imageId, productId: product._id },
        update: { $set: { sortOrder: Number(item.sortOrder) } }
      }
    }));

    await ProductImage.bulkWrite(bulkOps);
    await syncProductImagesToProduct(product);

    const updatedImages = await ProductImage.find({ productId: product._id })
      .sort({ isPrimary: -1, sortOrder: 1, createdAt: 1 });

    return res.json({
      message: 'Cập nhật thứ tự hiển thị ảnh thành công!',
      images: updatedImages
    });

  } catch (error) {
    console.error('Lỗi cập nhật thứ tự ảnh:', error);
    return res.status(500).json({ error: 'Lỗi sắp xếp thứ tự ảnh.', details: error.message });
  }
});

// ==========================================
// 4. CẬP NHẬT 1 ẢNH (ĐẶT LÀM ẢNH ĐẠI DIỆN HOẶC ĐỔI THỨ TỰ)
// PUT /api/products/:productId/images/:imageId
// ==========================================
router.put('/:imageId', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const product = await verifyProductOwnership(req, res, productId);
    if (!product) return;

    const image = await ProductImage.findOne({ _id: imageId, productId: product._id });
    if (!image) {
      return res.status(404).json({ error: 'Không tìm thấy hình ảnh tương ứng trong sản phẩm này.' });
    }

    const { isPrimary, sortOrder, imageUrl } = req.body;

    if (imageUrl && imageUrl.trim()) {
      image.imageUrl = imageUrl.trim();
    }

    if (sortOrder !== undefined) {
      image.sortOrder = Number(sortOrder);
    }

    if (isPrimary === true) {
      // Đặt tất cả ảnh khác cùng sản phẩm về không phải primary
      await ProductImage.updateMany(
        { productId: product._id, _id: { $ne: image._id } },
        { isPrimary: false }
      );
      image.isPrimary = true;
    } else if (isPrimary === false) {
      image.isPrimary = false;
    }

    await image.save();
    await syncProductImagesToProduct(product);

    return res.json({
      message: 'Cập nhật thông tin hình ảnh thành công!',
      image
    });

  } catch (error) {
    console.error('Lỗi cập nhật hình ảnh:', error);
    return res.status(500).json({ error: 'Lỗi cập nhật hình ảnh.', details: error.message });
  }
});

// ==========================================
// 5. XÓA ẢNH KHỎI SẢN PHẨM
// DELETE /api/products/:productId/images/:imageId
// ==========================================
router.delete('/:imageId', auth, checkRole(['shop', 'admin']), async (req, res) => {
  try {
    const { productId, imageId } = req.params;
    const product = await verifyProductOwnership(req, res, productId);
    if (!product) return;

    const image = await ProductImage.findOne({ _id: imageId, productId: product._id });
    if (!image) {
      return res.status(404).json({ error: 'Không tìm thấy hình ảnh cần xóa.' });
    }

    const wasPrimary = image.isPrimary;
    await ProductImage.deleteOne({ _id: image._id });

    // Nếu ảnh vừa bị xóa là ảnh chính, tự động phong ảnh đầu tiên còn lại làm ảnh chính mới
    if (wasPrimary) {
      const nextPrimary = await ProductImage.findOne({ productId: product._id })
        .sort({ sortOrder: 1, createdAt: 1 });
      if (nextPrimary) {
        nextPrimary.isPrimary = true;
        await nextPrimary.save();
      }
    }

    await syncProductImagesToProduct(product);

    return res.json({
      message: 'Đã xóa ảnh khỏi sản phẩm thành công!',
      deletedImageId: imageId
    });

  } catch (error) {
    console.error('Lỗi khi xóa ảnh sản phẩm:', error);
    return res.status(500).json({ error: 'Lỗi xóa ảnh sản phẩm.', details: error.message });
  }
});

module.exports = router;
