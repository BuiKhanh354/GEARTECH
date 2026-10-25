const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Payment = require('../models/Payment');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Voucher = require('../models/Voucher');
const { auth } = require('../middleware/auth');

// Helper: Tìm customer tương ứng với user
async function getCustomerForUser(userId) {
  let customer = await Customer.findOne({ $or: [{ userId: userId }, { user_id: userId }] });
  if (!customer) {
    const user = await User.findById(userId);
    if (user) {
      customer = await Customer.create({
        user_id: user._id,
        userId: user._id,
        name: user.name || user.username || 'Khách hàng',
        full_name: user.name || user.username || 'Khách hàng',
        email: user.email,
        phone: user.phone || '0900000000',
        address: user.address || 'Chưa cập nhật'
      });
    }
  }
  return customer;
}

// ==========================================
// 1. GET /api/orders - Lịch sử đơn hàng của người dùng hiện tại
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const customer = await getCustomerForUser(req.user.id);
    const customerId = customer ? customer._id : null;

    const query = {
      $or: [
        { userId: req.user.id },
        { user_id: req.user.id }
      ]
    };
    if (customerId) {
      query.$or.push({ customerId: customerId }, { customer_id: customerId });
    }

    const orders = await Order.find(query)
      .populate('shop_id', 'shopName logoUrl status')
      .populate('shopId', 'shopName logoUrl status')
      .sort({ created_at: -1, createdAt: -1 });

    // Đảm bảo mỗi đơn hàng có kèm chi tiết order_items nếu cần
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      let orderItems = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'title imageUrl images sku price');
      
      const ordObj = order.toObject ? order.toObject() : order;
      if (orderItems.length > 0) {
        ordObj.detailedItems = orderItems;
      }
      return ordObj;
    }));

    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy lịch sử đơn hàng.', details: error.message });
  }
});

// ==========================================
// 2. GET /api/orders/shop - Chủ shop xem đơn hàng thuộc shop mình
// ==========================================
router.get('/shop', auth, async (req, res) => {
  try {
    let shopId = req.user.shopId;
    if (!shopId) {
      const ownedShop = await Shop.findOne({ ownerId: req.user.id });
      if (ownedShop) shopId = ownedShop._id;
    }

    if (!shopId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Bạn không sở hữu cửa hàng nào để xem đơn hàng.' });
    }

    const filter = shopId ? { $or: [{ shopId }, { shop_id: shopId }] } : {};
    const orders = await Order.find(filter)
      .populate('user_id', 'name email phone avatar')
      .populate('customer_id', 'full_name email phone address')
      .sort({ created_at: -1, createdAt: -1 });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const items = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'title imageUrl images sku price');
      const ordObj = order.toObject ? order.toObject() : order;
      ordObj.detailedItems = items;
      return ordObj;
    }));

    res.json(enrichedOrders);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn hàng cho cửa hàng.', details: error.message });
  }
});

// ==========================================
// 3. GET /api/orders/admin - Admin giám sát toàn bộ đơn hàng
// ==========================================
router.get('/admin', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền quản trị viên.' });
    }

    const { status, search } = req.query;
    let query = {};
    if (status) {
      query.$or = [{ orderStatus: status }, { order_status: status }];
    }

    const orders = await Order.find(query)
      .populate('shop_id', 'shopName logoUrl status')
      .populate('user_id', 'name email phone')
      .sort({ created_at: -1, createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy danh sách đơn hàng toàn hệ thống.', details: error.message });
  }
});

// ==========================================
// 4. GET /api/orders/:id - Xem chi tiết 1 đơn hàng cụ thể
// ==========================================
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shop_id', 'shopName logoUrl phone email status')
      .populate('user_id', 'name email phone')
      .populate('customer_id', 'full_name phone email address');

    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng yêu cầu.' });
    }

    // Kiểm tra quyền truy cập:
    // 1. Admin: Xem được tất cả
    // 2. Chủ sở hữu đơn hàng (userId == req.user.id)
    // 3. Chủ shop của đơn hàng (shopId == req.user.shopId)
    const isAdmin = req.user.role === 'admin';
    const isOwner = String(order.userId || order.user_id) === String(req.user.id);
    
    let isShopOwner = false;
    if (req.user.shopId && String(order.shopId || order.shop_id) === String(req.user.shopId)) {
      isShopOwner = true;
    } else {
      const ownedShop = await Shop.findOne({ ownerId: req.user.id });
      if (ownedShop && String(order.shopId || order.shop_id) === String(ownedShop._id)) {
        isShopOwner = true;
      }
    }

    if (!isAdmin && !isOwner && !isShopOwner) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem thông tin đơn hàng này.' });
    }

    // Lấy danh sách order_items và payment
    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'title imageUrl images sku price stock');
    const payment = await Payment.findOne({ order_id: order._id });

    const ordObj = order.toObject ? order.toObject() : order;
    ordObj.detailedItems = orderItems;
    ordObj.paymentInfo = payment;

    res.json(ordObj);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi lấy thông tin chi tiết đơn hàng.', details: error.message });
  }
});

// ==========================================
// 5. POST /api/orders - Tạo đơn hàng từ giỏ hàng (Checkout)
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, voucherCode, note } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Giỏ hàng của bạn đang trống hoặc không có sản phẩm nào được chọn.' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ error: 'Vui lòng cung cấp địa chỉ nhận hàng và số điện thoại liên lạc.' });
    }

    // 1. Kiểm tra trạng thái tài khoản người dùng (Phần D1 prompt.md & Section 8 cus.md)
    const currentUser = await User.findById(req.user.id || req.user._id);
    if (!currentUser) {
      return res.status(404).json({ error: 'Người dùng không tồn tại.' });
    }
    const now = new Date();

    // 1.1 Khóa tài khoản chung
    if (currentUser.status === 'locked') {
      if (currentUser.lockExpiresAt && currentUser.lockExpiresAt <= now) {
        currentUser.status = 'active';
        currentUser.lockExpiresAt = null;
        currentUser.lockReason = null;
        await currentUser.save();
      } else {
        const remainingStr = currentUser.lockExpiresAt ? ` đến ${new Date(currentUser.lockExpiresAt).toLocaleString('vi-VN')}` : '';
        return res.status(403).json({
          error: `Tài khoản của bạn đang bị khóa${remainingStr}. Lý do: ${currentUser.lockReason || 'Vi phạm điều khoản chính sách'}. Không thể thực hiện mua hàng hoặc thanh toán.`
        });
      }
    }

    // 1.2 Khóa riêng quyền đặt hàng (khách hàng vẫn xem được web nhưng không được checkout)
    if (currentUser.isOrderLocked) {
      if (currentUser.orderLockExpiresAt && currentUser.orderLockExpiresAt <= now) {
        currentUser.isOrderLocked = false;
        currentUser.orderLockExpiresAt = null;
        currentUser.orderLockReason = '';
        await currentUser.save();
      } else {
        const remainingStr = currentUser.orderLockExpiresAt ? ` đến ${new Date(currentUser.orderLockExpiresAt).toLocaleString('vi-VN')}` : '';
        return res.status(403).json({
          error: `Quyền đặt hàng của tài khoản đang bị tạm khóa${remainingStr}. Lý do: ${currentUser.orderLockReason || 'Tạm dừng đặt hàng theo quyết định quản trị viên'}. Bạn vẫn có thể xem sản phẩm và cập nhật giỏ hàng nhưng chưa thể đặt hàng lúc này.`
        });
      }
    }

    // Chuẩn bị thông tin khách hàng
    const customer = await getCustomerForUser(req.user.id);
    const customerId = customer ? customer._id : null;

    // Tải giỏ hàng để kiểm tra chính sách bảo lưu giá khuyến mãi 48 giờ (Phần E prompt.md)
    const userCart = await Cart.findOne({ userId: req.user.id || req.user._id });

    // Phân tích và nhóm sản phẩm theo shop_id để hỗ trợ mô hình Multi-Shop
    // Mỗi shop sẽ có 1 đơn hàng độc lập, giúp chủ shop chỉ quản lý đơn của mình
    const shopGroupMap = new Map(); // shopId -> { shop, items: [{ product, qty, price, subtotal }] }

    for (const item of items) {
      const pId = item.productId || item.product_id;
      const qty = Number(item.quantity || item.qty || 1);

      if (qty < 1) {
        return res.status(400).json({ error: 'Số lượng mua tối thiểu cho mỗi sản phẩm phải là 1.' });
      }

      const product = await Product.findById(pId).populate('shopId');
      if (!product) {
        return res.status(404).json({ error: `Sản phẩm với ID ${pId} không còn tồn tại trên hệ thống.` });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          error: `Sản phẩm "${product.title}" hiện đã ngừng kinh doanh hoặc đang tạm khóa.`
        });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          error: `Sản phẩm "${product.title}" không đủ tồn kho (chỉ còn ${product.stock} cái, bạn chọn ${qty} cái).`
        });
      }

      // Xác định shop sở hữu
      const shopIdStr = product.shopId ? String(product.shopId._id || product.shopId) : 'DEFAULT_SHOP';
      
      // Kiểm tra trạng thái shop
      if (product.shopId && product.shopId.status && product.shopId.status !== 'active') {
        return res.status(400).json({
          error: `Cửa hàng "${product.shopId.shopName || product.shopId.name || 'Bán lẻ'}" hiện đang tạm ngừng hoạt động.`
        });
      }

      if (!shopGroupMap.has(shopIdStr)) {
        shopGroupMap.set(shopIdStr, {
          shopId: product.shopId ? (product.shopId._id || product.shopId) : null,
          items: []
        });
      }

      // Giá được lấy trực tiếp từ database hoặc bảo lưu từ giỏ hàng nếu còn trong 48 giờ
      let authoritativePrice = product.price;
      if (userCart && Array.isArray(userCart.items)) {
        const cartItem = userCart.items.find(ci => ci.productId.toString() === pId.toString());
        if (cartItem && cartItem.priceLockExpiresAt && new Date(cartItem.priceLockExpiresAt) > new Date()) {
          if (cartItem.price && cartItem.price < authoritativePrice) {
            authoritativePrice = cartItem.price;
          }
        }
      }

      const subtotal = authoritativePrice * qty;

      shopGroupMap.get(shopIdStr).items.push({
        product,
        qty,
        authoritativePrice,
        subtotal
      });
    }

    // Xử lý mã voucher nếu có (Section 3.17 & C3 Shop Vouchers)
    let totalDiscount = 0;
    let appliedVoucher = null;
    if (voucherCode) {
      const v = await Voucher.findOne({ code: voucherCode.toUpperCase().trim() });
      if (v) {
        const now = new Date();
        const expiry = v.expiryDate || v.end_date;
        const start = v.startDate || v.start_date;
        const status = v.status || 'active';
        const currentUses = Number(v.usesCount || v.used_count || 0);
        const max = Number(v.maxUses || v.quantity || 100);
        const minOrder = Number(v.minOrderValue || (v.min_order_amount ? v.min_order_amount.toString() : 0));

        // Tính tổng tiền khả dụng áp dụng mã (nếu voucher của shop thì chỉ tính sản phẩm của shop đó)
        let eligibleCartTotal = 0;
        for (const g of shopGroupMap.values()) {
          const isEligibleShop = !v.shopId || String(g.shopId) === String(v.shopId);
          if (isEligibleShop) {
            for (const it of g.items) {
              eligibleCartTotal += it.subtotal;
            }
          }
        }

        const isValid = status === 'active' &&
                        (!start || start <= now) &&
                        (!expiry || expiry >= now) &&
                        (currentUses < max) &&
                        (eligibleCartTotal >= minOrder && eligibleCartTotal > 0);

        if (isValid) {
          appliedVoucher = v;
          const isPct = (v.discount_type || v.discountType) === 'percentage';
          const val = Number(v.discountValue || (v.discount_value ? v.discount_value.toString() : 0));
          const maxCap = Number(v.maxDiscount || (v.max_discount ? v.max_discount.toString() : 0));

          if (isPct) {
            totalDiscount = Math.round((eligibleCartTotal * val) / 100);
            if (maxCap > 0 && totalDiscount > maxCap) {
              totalDiscount = maxCap;
            }
          } else {
            totalDiscount = val;
          }

          if (totalDiscount > eligibleCartTotal) {
            totalDiscount = eligibleCartTotal;
          }

          v.usesCount = currentUses + 1;
          v.used_count = (v.used_count || 0) + 1;
          await v.save();
        }
      }
    }

    // Duyệt từng nhóm shop để tạo đơn hàng
    const createdOrders = [];
    const orderedProductIds = [];

    // Phân bổ mã giảm giá cho từng đơn hàng (nếu có nhiều shop)
    const numShops = shopGroupMap.size;
    const discountPerShop = numShops > 0 ? Math.floor(totalDiscount / numShops) : 0;

    for (const [shopKey, group] of shopGroupMap.entries()) {
      let shopSubtotal = 0;
      const embeddedItems = [];
      const orderItemDocs = [];

      // Xác định mức giảm giá cho shop này
      let shopDiscount = 0;
      if (appliedVoucher) {
        if (appliedVoucher.shopId) {
          // Voucher riêng của shop: toàn bộ giảm giá thuộc về shop này nếu trùng khớp
          if (String(group.shopId) === String(appliedVoucher.shopId)) {
            shopDiscount = totalDiscount;
          }
        } else {
          // Voucher toàn sàn: phân bổ theo số lượng shop
          shopDiscount = discountPerShop;
        }
      }

      for (const entry of group.items) {
        const { product, qty, authoritativePrice, subtotal } = entry;
        shopSubtotal += subtotal;
        orderedProductIds.push(product._id);

        // Snapshot chi tiết
        embeddedItems.push({
          product_id: product._id,
          productId: product._id,
          product_name: product.title,
          title: product.title,
          sku: product.sku || '',
          quantity: qty,
          qty: qty,
          unit_price: authoritativePrice,
          price: authoritativePrice,
          subtotal: subtotal,
          shop_id: group.shopId,
          shopId: group.shopId
        });

        // Trừ tồn kho NGUYÊN TỬ: chỉ trừ khi còn đủ hàng trong kho khả dụng.
        // Điều kiện stock >= qty trong chính câu update giúp chống bán vượt tồn
        // khi nhiều đơn hàng đặt cùng lúc (race condition).
        const decremented = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!decremented) {
          // Đơn này không thể tạo vì đã có đơn khác "chớp" mất hàng -> hủy toàn bộ phiên đặt
          for (const ord of createdOrders) {
            for (const it of ord.items) {
              await Product.updateOne(
                { _id: it.productId || it.product_id },
                { $inc: { stock: it.quantity || it.qty || 1 } }
              );
            }
            await Order.findByIdAndDelete(ord._id);
          }
          return res.status(400).json({
            error: `Sản phẩm "${product.title}" vừa hết hàng do một đơn hàng khác đã đặt trước. Vui lòng thử lại!`
          });
        }

        // Ghi nhận biến động xuất kho (3.14 stock_movements)
        if (group.shopId) {
          await StockMovement.create({
            shop_id: group.shopId,
            product_id: product._id,
            type: 'sale',
            quantity: qty,
            unit_cost: authoritativePrice,
            note: 'Xuất kho bán hàng qua đơn đặt hàng mới'
          }).catch(() => {});
        }
      }

      // Tính phí vận chuyển (mặc định 30,000 VND / shop hoặc tuỳ chỉnh)
      const shippingFee = 30000;
      const actualShopDiscount = Math.min(shopSubtotal, shopDiscount);
      const finalAmount = Math.max(0, shopSubtotal - actualShopDiscount + shippingFee);

      // Địa chỉ giao hàng
      let addressString = '';
      if (typeof shippingAddress === 'string') {
        addressString = shippingAddress;
      } else {
        addressString = [
          shippingAddress.detailAddress || shippingAddress.address,
          shippingAddress.ward,
          shippingAddress.district,
          shippingAddress.province
        ].filter(Boolean).join(', ');
      }

      const phone = typeof shippingAddress === 'object' && shippingAddress.receiverPhone
        ? shippingAddress.receiverPhone
        : (req.user.phone || '0900000000');
      
      const receiverName = typeof shippingAddress === 'object' && shippingAddress.receiverName
        ? shippingAddress.receiverName
        : (req.user.name || 'Khách hàng');

      // Tạo Order
      const newOrder = new Order({
        customer_id: customerId,
        customerId: customerId,
        user_id: req.user.id,
        userId: req.user.id,
        shop_id: group.shopId,
        shopId: group.shopId,
        voucher_id: appliedVoucher ? appliedVoucher._id : null,
        voucherId: appliedVoucher ? appliedVoucher._id : null,
        voucher_code: voucherCode || null,
        voucherCode: voucherCode || null,

        totalAmount: shopSubtotal,
        discountAmount: actualShopDiscount,
        shippingFee: shippingFee,
        finalAmount: finalAmount,

        shipping_address: addressString,
        phone: phone,
        receiver_name: receiverName,
        shippingAddress: {
          receiverName: receiverName,
          receiverPhone: phone,
          detailAddress: addressString
        },

        payment_method: paymentMethod || 'COD',
        paymentMethod: paymentMethod || 'COD',
        payment_status: (paymentMethod === 'COD' || paymentMethod === 'cod') ? 'pending' : 'paid',
        paymentStatus: (paymentMethod === 'COD' || paymentMethod === 'cod') ? 'pending' : 'paid',
        order_status: 'pending',
        orderStatus: 'pending',
        items: embeddedItems,
        note: note || ''
      });

      await newOrder.save();

      // Lưu các dòng OrderItem độc lập tương thích gear_tech.order_items.json
      for (const entry of group.items) {
        await OrderItem.create({
          order_id: newOrder._id,
          product_id: entry.product._id,
          shop_id: group.shopId,
          product_name: entry.product.title,
          sku: entry.product.sku || '',
          quantity: entry.qty,
          unit_price: mongoose.Types.Decimal128.fromString(entry.authoritativePrice.toString()),
          subtotal: mongoose.Types.Decimal128.fromString(entry.subtotal.toString())
        });
      }

      // Tạo bản ghi thanh toán (Payment) tương thích gear_tech.payments.json
      await Payment.create({
        order_id: newOrder._id,
        payment_method: paymentMethod || 'COD',
        amount: mongoose.Types.Decimal128.fromString(finalAmount.toString()),
        payment_status: (paymentMethod === 'COD' || paymentMethod === 'cod') ? 'pending' : 'paid',
        paid_at: (paymentMethod === 'COD' || paymentMethod === 'cod') ? null : new Date()
      }).catch(() => {});

      createdOrders.push(newOrder);
    }

    // Xóa các sản phẩm đã đặt khỏi Giỏ hàng của khách hàng (Carts & CartItems)
    try {
      const userCart = await Cart.findOne({
        $or: [
          { userId: req.user.id },
          { user_id: req.user.id },
          { customer_id: customerId }
        ]
      });

      if (userCart) {
        // Lọc bỏ những sản phẩm đã được đặt
        const pIdSet = new Set(orderedProductIds.map(id => String(id)));
        userCart.items = userCart.items.filter(item => !pIdSet.has(String(item.productId || item.product_id)));
        await userCart.save();

        // Xóa khỏi bảng CartItem
        await CartItem.deleteMany({
          cart_id: userCart._id,
          product_id: { $in: orderedProductIds }
        });
      }
    } catch (cartErr) {
      console.warn('Lưu ý: Không thể dọn giỏ hàng tự động:', cartErr.message);
    }

    // Tích điểm thành viên
    const totalPaid = createdOrders.reduce((sum, ord) => sum + (ord.finalAmount || 0), 0);
    const pointsEarned = Math.floor(totalPaid / 10000);
    const user = await User.findById(req.user.id);
    if (user) {
      user.points = (user.points || 0) + pointsEarned;
      if (user.points >= 10000) user.memberRank = 'KIM_CUONG';
      else if (user.points >= 5000) user.memberRank = 'VANG';
      else if (user.points >= 3000) user.memberRank = 'BAC';
      else if (user.points >= 1000) user.memberRank = 'DONG';
      else user.memberRank = 'THUONG';
      await user.save();
    }

    return res.status(201).json({
      message: 'Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
      orders: createdOrders,
      order: createdOrders[0], // Hỗ trợ backward compatibility với frontend cũ
      pointsEarned,
      newMemberPoints: user ? user.points : 0,
      newMemberRank: user ? user.memberRank : 'THUONG'
    });

  } catch (error) {
    console.error('Lỗi đặt hàng:', error);
    return res.status(500).json({ error: 'Lỗi máy chủ khi xử lý đặt hàng.', details: error.message });
  }
});

// ==========================================
// 6. PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng (Chủ shop / Admin)
// ==========================================
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ 
        error: `Trạng thái không hợp lệ. Chỉ chấp nhận các trạng thái: ${allowedStatuses.join(', ')}` 
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần xử lý.' });
    }

    const isAdmin = req.user.role === 'admin';
    const isShop = req.user.role === 'shop' || !!req.user.shopId;

    if (!isAdmin && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền quản lý đơn hàng này.' });
    }

    // Nếu là Shop, kiểm tra quyền sở hữu đơn hàng
    if (isShop && !isAdmin) {
      let userShopId = req.user.shopId;
      if (!userShopId) {
        const ownedShop = await Shop.findOne({ ownerId: req.user.id });
        if (ownedShop) userShopId = ownedShop._id;
      }

      if (!userShopId || String(order.shopId || order.shop_id) !== String(userShopId)) {
        return res.status(403).json({ 
          error: 'Từ chối: Bạn chỉ có quyền xử lý các đơn hàng thuộc cửa hàng của chính mình!' 
        });
      }

      // Shop phải đang active
      const shop = await Shop.findById(userShopId);
      if (!shop || shop.status !== 'active') {
        return res.status(403).json({ 
          error: 'Cửa hàng của bạn hiện đang bị khóa hoặc chưa được duyệt, không thể xử lý đơn hàng!' 
        });
      }
    }

    const previousStatus = order.orderStatus || order.order_status;

    // Không cho phép thay đổi nếu đơn đã hoàn tất hoặc đã hủy
    if (previousStatus === 'completed' && orderStatus !== 'completed') {
      return res.status(400).json({ error: 'Đơn hàng đã hoàn tất thành công, không thể thay đổi trạng thái!' });
    }

    if (previousStatus === 'cancelled') {
      return res.status(400).json({ error: 'Đơn hàng này đã bị hủy, không thể cập nhật trạng thái khác!' });
    }

    // Nếu chuyển sang 'cancelled' (Hủy đơn hàng): Hoàn lại tồn kho cho từng sản phẩm
    if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
      for (const it of order.items) {
        const pId = it.productId || it.product_id;
        const q = it.quantity || it.qty || 1;
        const prod = await Product.findById(pId);
        if (prod) {
          prod.stock += q;
          await prod.save();

          // Ghi nhận lịch sử hoàn kho
          if (order.shop_id || order.shopId) {
            await StockMovement.create({
              shop_id: order.shop_id || order.shopId,
              product_id: prod._id,
              type: 'return',
              quantity: q,
              note: `Hoàn kho do hủy đơn hàng ${order._id}`
            }).catch(() => {});
          }
        }
      }
    }

    // Cập nhật trạng thái
    order.orderStatus = orderStatus;
    order.order_status = orderStatus;

    if (orderStatus === 'completed') {
      order.paymentStatus = 'paid';
      order.payment_status = 'paid';
      await Payment.updateOne({ order_id: order._id }, { payment_status: 'paid', paid_at: new Date() });

      // B1: Cập nhật số lượng ĐÃ BÁN thực tế cho từng sản phẩm trong đơn.
      // Chỉ chạy khi đơn chuyển SANG completed (previousStatus khác completed
      // đã được chặn ở trên), nên không bao giờ cộng trùng lặp.
      const soldProducts = new Set();
      for (const it of order.items) {
        const pId = it.productId || it.product_id;
        const q = it.quantity || it.qty || 1;
        if (!pId || soldProducts.has(String(pId))) continue;
        soldProducts.add(String(pId));

        const prod = await Product.findById(pId);
        if (prod) {
          prod.soldCount = (prod.soldCount || 0) + q;
          prod.salesCount = `ĐÃ BÁN ${prod.soldCount}`;
          await prod.save();
        }
      }
    }

    await order.save();

    return res.json({
      message: `Đã cập nhật trạng thái đơn hàng thành "${orderStatus}"!`,
      order
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi cập nhật trạng thái đơn hàng.', details: error.message });
  }
});

// ==========================================
// 7. PUT /api/orders/:id/cancel - Khách hàng tự hủy đơn hàng khi đang chờ
// ==========================================
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần hủy.' });
    }

    // Chỉ khách hàng sở hữu đơn mới được hủy
    const isOwner = String(order.userId || order.user_id) === String(req.user.id);
    if (!isOwner) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền hủy đơn hàng của người khác.' });
    }

    const currentStatus = order.orderStatus || order.order_status;
    if (currentStatus !== 'pending') {
      return res.status(400).json({ 
        error: `Không thể hủy đơn hàng vì đơn đã chuyển sang trạng thái "${currentStatus}". Vui lòng liên hệ shop để được hỗ trợ!` 
      });
    }

    // Hoàn lại tồn kho
    for (const it of order.items) {
      const pId = it.productId || it.product_id;
      const q = it.quantity || it.qty || 1;
      const prod = await Product.findById(pId);
      if (prod) {
        prod.stock += q;
        await prod.save();

        if (order.shop_id || order.shopId) {
          await StockMovement.create({
            shop_id: order.shop_id || order.shopId,
            product_id: prod._id,
            type: 'return',
            quantity: q,
            note: `Khách hàng hủy đơn hàng chờ xác nhận ${order._id}`
          }).catch(() => {});
        }
      }
    }

    order.orderStatus = 'cancelled';
    order.order_status = 'cancelled';
    await order.save();

    return res.json({
      message: 'Hủy đơn hàng thành công! Số lượng sản phẩm đã được hoàn lại vào kho.',
      order
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi hủy đơn hàng.', details: error.message });
  }
});

module.exports = router;
