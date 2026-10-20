const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
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
 * - Cảnh báo nếu sản phẩm hết hàng, bị ẩn hoặc shop bị khóa
 */
async function formatCartDetails(cart) {
  const formattedItems = [];
  let calculatedSubtotal = 0;
  let hasUnavailableItems = false;

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
        unavailableReason: 'Sản phẩm đã bị xóa khỏi hệ thống'
      });
      hasUnavailableItems = true;
      continue;
    }

    const isShopActive = product.shopId && typeof product.shopId === 'object' ? product.shopId.status === 'active' : true;
    const isProductActive = product.status === 'active';
    const isOutOfStock = product.stock <= 0 || product.status === 'out_of_stock';
    const isExceedingStock = item.quantity > product.stock;

    let isAvailable = isShopActive && isProductActive && !isOutOfStock;
    let reason = '';
    if (!isShopActive) reason = 'Gian hàng sở hữu sản phẩm đang tạm dừng hoạt động';
    else if (!isProductActive) reason = 'Sản phẩm đã ngừng kinh doanh hoặc đang tạm ẩn';
    else if (isOutOfStock) reason = 'Sản phẩm hiện đang hết hàng trong kho';
    else if (isExceedingStock) reason = `Số lượng trong giỏ (${item.quantity}) vượt quá tồn kho thực tế (${product.stock} cái)`;

    // Luôn áp dụng giá bán thực tế mới nhất từ Backend (chống gian lận giá)
    const currentPrice = product.price;
    const lineTotal = currentPrice * item.quantity;

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
      currentPrice,
      oldPrice: product.oldPrice,
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

    // 4. Giá luôn được lấy từ Backend
    const backendPrice = product.price;

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity = finalQty;
      cart.items[existingIndex].price = backendPrice;
      cart.items[existingIndex].selected = true;
      if (variant) cart.items[existingIndex].variant = variant;
    } else {
      cart.items.push({
        productId: product._id,
        quantity: numQty,
        price: backendPrice,
        selected: true,
        variant
      });
    }

    await cart.save();

    // Đồng bộ sang collection CartItem (tương thích SQL)
    await CartItem.findOneAndUpdate(
      { cartId: cart._id, productId: product._id },
      { 
        $set: { 
          quantity: finalQty, 
          price: backendPrice, 
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

    // Nếu cập nhật số lượng
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (isNaN(numQty) || numQty < 1) {
        return res.status(400).json({ error: 'Số lượng sản phẩm trong giỏ hàng tối thiểu phải là 1.' });
      }

      // Kiểm tra tồn kho từ database
      const product = await Product.findById(cart.items[itemIndex].productId);
      if (product) {
        if (numQty > product.stock) {
          return res.status(400).json({ 
            error: `Số lượng cập nhật (${numQty}) vượt quá tồn kho khả dụng (${product.stock} cái).`,
            availableStock: product.stock 
          });
        }
        cart.items[itemIndex].price = product.price; // Cập nhật lại giá nếu có thay đổi
      }

      cart.items[itemIndex].quantity = numQty;
    }

    // Nếu cập nhật trạng thái chọn mua
    if (selected !== undefined) {
      cart.items[itemIndex].selected = Boolean(selected);
    }

    if (variant !== undefined) {
      cart.items[itemIndex].variant = variant;
    }

    await cart.save();

    // Đồng bộ sang CartItem
    await CartItem.findOneAndUpdate(
      { cartId: cart._id, productId: cart.items[itemIndex].productId },
      { 
        $set: { 
          quantity: cart.items[itemIndex].quantity, 
          selected: cart.items[itemIndex].selected 
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
// Chỉ xóa dòng tương ứng của giỏ hàng thuộc khách hàng hiện tại
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

    // Xóa trong collection CartItem
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
// Đồng bộ giỏ hàng offline (localStorage) lên database khi khách hàng đăng nhập
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

    for (const localItem of localItems) {
      const pId = localItem.productId || localItem.id;
      if (!pId) continue;

      const product = await Product.findById(pId);
      if (!product || product.status !== 'active' || product.stock <= 0) continue;

      const existingIndex = cart.items.findIndex(item => item.productId.toString() === pId.toString());
      const desiredQty = Math.max(1, Number(localItem.quantity || 1));
      
      if (existingIndex > -1) {
        // Hợp nhất số lượng nhưng không vượt tồn kho
        const newQty = Math.min(product.stock, cart.items[existingIndex].quantity + desiredQty);
        cart.items[existingIndex].quantity = newQty;
        cart.items[existingIndex].price = product.price;
      } else {
        const initialQty = Math.min(product.stock, desiredQty);
        cart.items.push({
          productId: product._id,
          quantity: initialQty,
          price: product.price,
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

      verifiedTotal += (product.price * item.quantity);
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
