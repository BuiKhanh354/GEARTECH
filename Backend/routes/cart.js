const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

/**
 * Hàm tìm hoặc khởi tạo giỏ hàng cho người dùng hiện tại
 */
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    const customer = await Customer.findOne({ userId });
    cart = new Cart({
      userId,
      customerId: customer ? customer._id : undefined,
      items: []
    });
    await cart.save();
  }
  return cart;
}

/**
 * Hàm kiểm tra tính hợp lệ và định dạng giỏ hàng trả về cho client
 * - Tự động đối chiếu với giá bán hiện tại và số lượng tồn kho thực tế trong CSDL
 * - Áp dụng chính sách bảo lưu giá khuyến mãi 48 giờ (Phần E prompt.md)
 * - Cảnh báo nếu sản phẩm hết hàng, bị ẩn hoặc shop bị khóa
 */
async function formatCartDetails(cart) {
  const formattedItems = [];
  let calculatedSubtotal = 0;
  let hasUnavailableItems = false;
  let cartNeedsSave = false;
  const now = new Date();

  for (const item of cart.items) {
    const product = await Product.findById(item.productId).populate('shopId', 'name status logo');
    
    if (!product) {
      formattedItems.push({
        _id: item._id,
        productId: item.productId,
        title: 'Sản phẩm không còn tồn tại trên sàn',
        price: item.price,
        quantity: item.quantity,
        selected: false,
        variant: item.variant,
        isAvailable: false,
        unavailableReason: 'Sản phẩm đã bị xóa khỏi hệ thống',
        isPriceLocked: false
      });
      hasUnavailableItems = true;
      continue;
    }

    const isShopActive = product.shopId && typeof product.shopId === 'object' ? product.shopId.status === 'active' : true;
    const isProductActive = product.status === 'active';
    const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
    const isExceedingStock = item.quantity > product.stock;

    // =========================================================================
    // PHẦN E: CHÍNH SÁCH BẢO LƯU GIÁ KHUYẾN MÃI (48 GIỜ)
    // =========================================================================
    let isPriceLocked = false;
    let priceLockRemainingMs = 0;
    let effectivePrice = product.price;
    let originalPrice = item.originalPrice || product.oldPrice || product.price;

    if (item.priceLockExpiresAt) {
      const expiresAt = new Date(item.priceLockExpiresAt);
      if (now <= expiresAt) {
        // Vẫn còn trong 48 giờ bảo lưu
        isPriceLocked = true;
        priceLockRemainingMs = Math.max(0, expiresAt.getTime() - now.getTime());
        // Giữ giá khuyến mãi đã lưu dù giá niêm yết hiện tại có tăng hoặc hết khuyến mãi
        effectivePrice = item.price;
        originalPrice = item.originalPrice || product.oldPrice || product.price;
      } else {
        // Đã hết 48 giờ bảo lưu: Cập nhật lại giá theo giá niêm yết hiện hành
        item.price = product.price;
        item.priceLockedAt = null;
        item.priceLockExpiresAt = null;
        item.promotionNote = null;
        effectivePrice = product.price;
        originalPrice = product.oldPrice || product.price;
        isPriceLocked = false;
        cartNeedsSave = true;
      }
    } else {
      // Nếu sản phẩm đang có khuyến mãi mới và chưa được set khóa giá
      if (product.oldPrice && product.oldPrice > product.price) {
        item.originalPrice = product.oldPrice;
        item.price = product.price;
        item.priceLockedAt = now;
        item.priceLockExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        item.promotionNote = 'Giữ giá ưu đãi 48 giờ';
        isPriceLocked = true;
        priceLockRemainingMs = 48 * 60 * 60 * 1000;
        effectivePrice = product.price;
        originalPrice = product.oldPrice;
        cartNeedsSave = true;
      } else {
        effectivePrice = product.price;
        originalPrice = product.price;
      }
    }

    let isAvailable = isShopActive && isProductActive && !isOutOfStock;
    let reason = '';
    if (!isShopActive) reason = 'Gian hàng sở hữu sản phẩm đang tạm dừng hoạt động';
    else if (!isProductActive) reason = 'Sản phẩm đã ngừng kinh doanh hoặc đang tạm ẩn';
    else if (isOutOfStock) {
      reason = isPriceLocked 
        ? 'Sản phẩm tạm hết hàng trong kho (Mức giá ưu đãi vẫn được giữ khi có hàng lại nếu còn hạn)'
        : 'Sản phẩm hiện đang hết hàng trong kho';
    } else if (isExceedingStock) {
      reason = `Số lượng trong giỏ (${item.quantity}) vượt quá tồn kho thực tế (${product.stock} cái)`;
    }

    const lineTotal = effectivePrice * item.quantity;
    const savings = Math.max(0, (originalPrice - effectivePrice) * item.quantity);

    if (isAvailable && item.selected) {
      calculatedSubtotal += lineTotal;
    }

    formattedItems.push({
      _id: item._id,
      productId: product._id,
      title: product.title || product.name,
      slug: product.slug,
      sku: product.sku,
      imageEmoji: product.imageEmoji || '📦',
      currentPrice: effectivePrice,
      price: effectivePrice,
      oldPrice: originalPrice > effectivePrice ? originalPrice : undefined,
      originalPrice,
      savings,
      isPriceLocked,
      priceLockExpiresAt: item.priceLockExpiresAt,
      priceLockRemainingMs,
      promotionNote: item.promotionNote,
      stock: product.stock,
      quantity: item.quantity,
      selected: item.selected !== false,
      variant: item.variant || 'Tiêu chuẩn / Chính hãng',
      shop: {
        id: product.shopId?._id,
        name: product.shopId?.name || 'GEARTECH OFFICIAL'
      },
      category: product.category,
      categoryName: product.categoryName,
      lineTotal,
      isAvailable,
      isExceedingStock,
      unavailableReason: reason
    });
  }

  if (cartNeedsSave) {
    try {
      await cart.save();
    } catch (saveErr) {
      console.warn('Không thể tự động lưu cập nhật giỏ hàng:', saveErr.message);
    }
  }

  return {
    cartId: cart._id,
    userId: cart.userId,
    customerId: cart.customerId,
    items: formattedItems,
    subtotal: calculatedSubtotal,
    totalCount: formattedItems.reduce((acc, i) => acc + (i.isAvailable ? i.quantity : 0), 0),
    hasUnavailableItems,
    updatedAt: cart.updatedAt
  };
}

// ==========================================
// 1. XEM GIỎ HÀNG HIỆN TẠI (KÈM KIỂM TRA TỒN KHO & TẠM TÍNH)
// GET /api/cart
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const cartDetails = await formatCartDetails(cart);
    return res.json(cartDetails);
  } catch (error) {
    console.error('Lỗi khi lấy giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi tải giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 2. THÊM SẢN PHẨM VÀO GIỎ HÀNG
// POST /api/cart/items
// Kiểm tra: tồn tại, còn bán, số lượng >= 1 và không vượt tồn kho
// Thiết lập bảo lưu giá khuyến mãi 48 giờ nếu sản phẩm có ưu đãi
// ==========================================
router.post('/items', auth, async (req, res) => {
  try {
    const { productId, quantity = 1, variant = 'Tiêu chuẩn / Chính hãng' } = req.body;

    if (!productId) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mã sản phẩm (productId).' });
    }

    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty < 1) {
      return res.status(400).json({ error: 'Số lượng sản phẩm không hợp lệ (phải lớn hơn hoặc bằng 1).' });
    }

    // 1. Kiểm tra sản phẩm trong CSDL
    const product = await Product.findById(productId).populate('shopId');
    if (!product) {
      return res.status(404).json({ error: 'Sản phẩm không tồn tại trên hệ thống.' });
    }

    // 2. Kiểm tra trạng thái bán và điều kiện kinh doanh
    if (product.status === 'inactive' || product.status === 'hidden') {
      return res.status(400).json({ error: 'Sản phẩm hiện đang tạm ngừng kinh doanh, không thể thêm vào giỏ.' });
    }

    if (product.stock <= 0 || product.status === 'out_of_stock') {
      return res.status(400).json({ error: 'Sản phẩm này hiện đã hết hàng trong kho.' });
    }

    if (product.shopId && product.shopId.status !== 'active') {
      return res.status(400).json({ error: 'Gian hàng cung cấp sản phẩm này đang tạm ngưng hoạt động.' });
    }

    // 3. Kiểm tra số lượng tồn kho so với giỏ hàng
    const cart = await getOrCreateCart(req.user._id);
    const existingIndex = cart.items.findIndex(item => item.productId.toString() === productId.toString());
    const existingQty = existingIndex > -1 ? cart.items[existingIndex].quantity : 0;
    const finalQty = existingQty + numQty;

    if (finalQty > product.stock) {
      return res.status(400).json({ 
        error: `Số lượng yêu cầu (${finalQty}) vượt quá tồn kho khả dụng hiện có (${product.stock} cái).`,
        availableStock: product.stock 
      });
    }

    // 4. Thiết lập giá và chính sách bảo lưu giá khuyến mãi 48 giờ
    const backendPrice = product.price;
    const now = new Date();
    const isPromo = Boolean(product.oldPrice && product.oldPrice > backendPrice);
    const priceLockExpiresAt = isPromo ? new Date(now.getTime() + 48 * 60 * 60 * 1000) : null;
    const originalPrice = isPromo ? product.oldPrice : backendPrice;
    const promotionNote = isPromo ? 'Giữ giá ưu đãi 48 giờ' : null;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = finalQty;
      // Nếu chưa có khóa giá hoặc đã hết hạn, cập nhật theo trạng thái mới
      if (!cart.items[existingIndex].priceLockExpiresAt || new Date(cart.items[existingIndex].priceLockExpiresAt) <= now) {
        cart.items[existingIndex].price = backendPrice;
        cart.items[existingIndex].originalPrice = originalPrice;
        cart.items[existingIndex].priceLockedAt = isPromo ? now : null;
        cart.items[existingIndex].priceLockExpiresAt = priceLockExpiresAt;
        cart.items[existingIndex].promotionNote = promotionNote;
      }
      cart.items[existingIndex].selected = true;
      if (variant) cart.items[existingIndex].variant = variant;
    } else {
      cart.items.push({
        productId: product._id,
        quantity: numQty,
        price: backendPrice,
        originalPrice,
        priceLockedAt: isPromo ? now : null,
        priceLockExpiresAt,
        promotionNote,
        selected: true,
        variant
      });
    }

    await cart.save();

    // Đồng bộ sang collection CartItem
    await CartItem.findOneAndUpdate(
      { cartId: cart._id, productId: product._id },
      { 
        $set: { 
          quantity: finalQty, 
          price: backendPrice,
          originalPrice,
          priceLockedAt: isPromo ? now : null,
          priceLockExpiresAt,
          promotionNote,
          selected: true, 
          variant 
        } 
      },
      { upsert: true, new: true }
    );

    const cartDetails = await formatCartDetails(cart);
    return res.status(201).json({
      message: `Đã thêm sản phẩm "${product.title}" vào giỏ hàng thành công!`,
      cart: cartDetails
    });

  } catch (error) {
    console.error('Lỗi khi thêm vào giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi thêm sản phẩm vào giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 3. CẬP NHẬT SỐ LƯỢNG HOẶC TRẠNG THÁI CHỌN SẢN PHẨM TRONG GIỎ
// PUT /api/cart/items/:productId
// ==========================================
router.put('/items/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, selected, variant } = req.body;

    const cart = await getOrCreateCart(req.user._id);
    const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId.toString() || i._id.toString() === productId.toString());

    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Không tìm thấy sản phẩm trong giỏ hàng.' });
    }

    const currentItem = cart.items[itemIndex];
    const now = new Date();
    const isLocked = currentItem.priceLockExpiresAt && new Date(currentItem.priceLockExpiresAt) > now;

    // Nếu cập nhật số lượng
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (isNaN(numQty) || numQty < 1) {
        return res.status(400).json({ error: 'Số lượng sản phẩm trong giỏ hàng tối thiểu phải là 1.' });
      }

      // Kiểm tra tồn kho từ database
      const product = await Product.findById(currentItem.productId);
      if (product) {
        if (numQty > product.stock) {
          return res.status(400).json({ 
            error: `Số lượng cập nhật (${numQty}) vượt quá tồn kho khả dụng (${product.stock} cái).`,
            availableStock: product.stock 
          });
        }
        // Chỉ cập nhật lại giá nếu không bị khóa giá khuyến mãi
        if (!isLocked) {
          currentItem.price = product.price;
        }
      }

      currentItem.quantity = numQty;
    }

    // Nếu cập nhật trạng thái chọn mua
    if (selected !== undefined) {
      currentItem.selected = Boolean(selected);
    }

    if (variant !== undefined) {
      currentItem.variant = variant;
    }

    await cart.save();

    // Đồng bộ sang CartItem
    await CartItem.findOneAndUpdate(
      { cartId: cart._id, productId: currentItem.productId },
      { 
        $set: { 
          quantity: currentItem.quantity, 
          selected: currentItem.selected 
        } 
      }
    );

    const cartDetails = await formatCartDetails(cart);
    return res.json({
      message: 'Cập nhật giỏ hàng thành công!',
      cart: cartDetails
    });

  } catch (error) {
    console.error('Lỗi cập nhật giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi cập nhật giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 4. XÓA SẢN PHẨM KHỎI GIỎ HÀNG
// DELETE /api/cart/items/:productId
// ==========================================
router.delete('/items/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);

    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId.toString() && item._id.toString() !== productId.toString()
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ error: 'Sản phẩm không có trong giỏ hàng của bạn.' });
    }

    await cart.save();

    await CartItem.deleteOne({ 
      cartId: cart._id, 
      $or: [{ productId }, { _id: productId }] 
    });

    const cartDetails = await formatCartDetails(cart);
    return res.json({
      message: 'Đã xóa sản phẩm khỏi giỏ hàng thành công!',
      cart: cartDetails
    });

  } catch (error) {
    console.error('Lỗi khi xóa khỏi giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi xóa sản phẩm khỏi giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 5. XÓA TOÀN BỘ SẢN PHẨM HOẶC XÓA CÁC MỤC ĐÃ CHỌN
// DELETE /api/cart/clear
// ==========================================
router.delete('/clear', auth, async (req, res) => {
  try {
    const { onlySelected } = req.query;
    const cart = await getOrCreateCart(req.user._id);

    if (onlySelected === 'true') {
      const removedIds = cart.items.filter(i => i.selected).map(i => i.productId);
      cart.items = cart.items.filter(i => !i.selected);
      await cart.save();
      await CartItem.deleteMany({ cartId: cart._id, productId: { $in: removedIds } });
    } else {
      cart.items = [];
      await cart.save();
      await CartItem.deleteMany({ cartId: cart._id });
    }

    const cartDetails = await formatCartDetails(cart);
    return res.json({
      message: onlySelected === 'true' ? 'Đã xóa các sản phẩm được chọn.' : 'Đã làm sạch giỏ hàng.',
      cart: cartDetails
    });

  } catch (error) {
    console.error('Lỗi khi dọn giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi dọn sạch giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 6. ĐỒNG BỘ DỮ LIỆU GIỎ HÀNG KHI ĐĂNG NHẬP
// POST /api/cart/sync
// SỬA TRIỆT ĐỂ LỖI D6 (Tự tăng số lượng +2 khi đồng bộ):
// Tuyệt đối không cộng dồn (existingQty + desiredQty) khi đồng bộ, mà gán chính xác desiredQty!
// ==========================================
router.post('/sync', auth, async (req, res) => {
  try {
    const { localItems } = req.body;
    if (!Array.isArray(localItems) || localItems.length === 0) {
      const cart = await getOrCreateCart(req.user._id);
      const cartDetails = await formatCartDetails(cart);
      return res.json({ message: 'Không có dữ liệu giỏ hàng cần đồng bộ.', cart: cartDetails });
    }

    const cart = await getOrCreateCart(req.user._id);
    const now = new Date();

    for (const localItem of localItems) {
      const pId = localItem.productId || localItem.id;
      if (!pId) continue;

      const product = await Product.findById(pId);
      if (!product || product.status !== 'active' || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(item => item.productId.toString() === pId.toString());
      const desiredQty = Math.max(1, Number(localItem.quantity || 1));
      const isPromo = Boolean(product.oldPrice && product.oldPrice > product.price);
      const priceLockExpiresAt = isPromo ? new Date(now.getTime() + 48 * 60 * 60 * 1000) : null;
      const originalPrice = isPromo ? product.oldPrice : product.price;

      if (existingIndex > -1) {
        // KHÔNG CỘNG DỒN NỮA: Giữ số lượng chính xác người dùng mong muốn, tối đa là tồn kho
        const exactQty = Math.min(product.stock, desiredQty);
        cart.items[existingIndex].quantity = exactQty;
        // Bảo lưu giá nếu chưa hết hạn
        if (!cart.items[existingIndex].priceLockExpiresAt || new Date(cart.items[existingIndex].priceLockExpiresAt) <= now) {
          cart.items[existingIndex].price = product.price;
          cart.items[existingIndex].originalPrice = originalPrice;
          cart.items[existingIndex].priceLockedAt = isPromo ? now : null;
          cart.items[existingIndex].priceLockExpiresAt = priceLockExpiresAt;
          cart.items[existingIndex].promotionNote = isPromo ? 'Giữ giá ưu đãi 48 giờ' : null;
        }
      } else {
        const initialQty = Math.min(product.stock, desiredQty);
        cart.items.push({
          productId: product._id,
          quantity: initialQty,
          price: product.price,
          originalPrice,
          priceLockedAt: isPromo ? now : null,
          priceLockExpiresAt,
          promotionNote: isPromo ? 'Giữ giá ưu đãi 48 giờ' : null,
          selected: localItem.selected !== false,
          variant: localItem.variant || 'Tiêu chuẩn / Chính hãng'
        });
      }
    }

    await cart.save();
    const cartDetails = await formatCartDetails(cart);

    return res.json({
      message: 'Đồng bộ giỏ hàng thành công!',
      cart: cartDetails
    });

  } catch (error) {
    console.error('Lỗi đồng bộ giỏ hàng:', error);
    return res.status(500).json({ error: 'Lỗi đồng bộ giỏ hàng.', details: error.message });
  }
});

// ==========================================
// 7. KIỂM TRA LẠI GIÁ VÀ TỒN KHO TRƯỚC KHI ĐẶT HÀNG
// GET /api/cart/validate
// ==========================================
router.get('/validate', auth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    const selectedItems = cart.items.filter(item => item.selected);

    if (selectedItems.length === 0) {
      return res.status(400).json({ 
        isValid: false, 
        error: 'Vui lòng chọn ít nhất 1 sản phẩm trong giỏ hàng để tiến hành thanh toán.' 
      });
    }

    const issues = [];
    let verifiedTotal = 0;
    const now = new Date();

    // Kiểm tra trạng thái tài khoản và quyền đặt hàng của khách hàng (Section 8 cus.md)
    const currentUser = await User.findById(req.user._id);
    if (currentUser) {
      if (currentUser.status === 'locked') {
        if (!currentUser.lockExpiresAt || currentUser.lockExpiresAt > now) {
          const remainingStr = currentUser.lockExpiresAt ? ` đến ${new Date(currentUser.lockExpiresAt).toLocaleString('vi-VN')}` : '';
          issues.push({
            error: `Tài khoản của bạn đang bị khóa${remainingStr}. Lý do: ${currentUser.lockReason || 'Vi phạm chính sách'}. Không thể tiến hành đặt hàng.`
          });
        }
      } else if (currentUser.isOrderLocked) {
        if (!currentUser.orderLockExpiresAt || currentUser.orderLockExpiresAt > now) {
          const remainingStr = currentUser.orderLockExpiresAt ? ` đến ${new Date(currentUser.orderLockExpiresAt).toLocaleString('vi-VN')}` : '';
          issues.push({
            error: `Quyền đặt hàng của tài khoản đang bị tạm khóa${remainingStr}. Lý do: ${currentUser.orderLockReason || 'Tạm dừng đặt hàng theo quyết định quản trị viên'}.`
          });
        }
      }
    }

    for (const item of selectedItems) {
      const product = await Product.findById(item.productId).populate('shopId');
      
      if (!product) {
        issues.push({
          productId: item.productId,
          error: 'Sản phẩm không còn tồn tại trên sàn.'
        });
        continue;
      }

      if (product.status !== 'active') {
        issues.push({
          productId: product._id,
          title: product.title,
          error: `Sản phẩm "${product.title}" hiện không còn mở bán.`
        });
        continue;
      }

      if (product.shopId && product.shopId.status !== 'active') {
        issues.push({
          productId: product._id,
          title: product.title,
          error: `Cửa hàng cung cấp "${product.title}" hiện đang tạm ngừng hoạt động.`
        });
        continue;
      }

      if (product.stock < item.quantity) {
        issues.push({
          productId: product._id,
          title: product.title,
          error: `Sản phẩm "${product.title}" chỉ còn ${product.stock} cái trong kho (bạn đang chọn ${item.quantity}).`,
          availableStock: product.stock
        });
        continue;
      }

      // Xác định giá: nếu có khóa giá khuyến mãi còn hiệu lực thì tính theo giá khóa
      let effectivePrice = product.price;
      if (item.priceLockExpiresAt && new Date(item.priceLockExpiresAt) > now) {
        effectivePrice = item.price;
      }

      verifiedTotal += (effectivePrice * item.quantity);
    }

    const isValid = issues.length === 0;

    return res.json({
      isValid,
      issues,
      verifiedTotal,
      selectedCount: selectedItems.length
    });

  } catch (error) {
    console.error('Lỗi kiểm tra tính hợp lệ trước khi đặt hàng:', error);
    return res.status(500).json({ error: 'Không thể kiểm tra giỏ hàng.', details: error.message });
  }
});

module.exports = router;
