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
const financeService = require('./financeService');

// Helper: Tìm customer tương ứng với user
async function getCustomerForUser(userId) {
  let customer = await Customer.findOne({ $or: [{ userId }, { user_id: userId }] });
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

const orderService = {
  getCustomerForUser,

  // 1. Lịch sử đơn hàng của người dùng hiện tại
  async getUserOrders(userId) {
    const customer = await getCustomerForUser(userId);
    const customerId = customer ? customer._id : null;

    const query = {
      $or: [
        { userId: userId },
        { user_id: userId }
      ]
    };
    if (customerId) {
      query.$or.push({ customerId: customerId }, { customer_id: customerId });
    }

    const orders = await Order.find(query)
      .populate('shop_id', 'shopName logoUrl status')
      .populate('shopId', 'shopName logoUrl status')
      .sort({ created_at: -1, createdAt: -1 });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'title imageUrl images sku price');
      
      const ordObj = order.toObject ? order.toObject() : order;
      if (orderItems.length > 0) {
        ordObj.detailedItems = orderItems;
      }
      return ordObj;
    }));

    return enrichedOrders;
  },

  // 2. Chủ shop xem đơn hàng thuộc shop mình
  async getShopOrders(user) {
    let shopId = user.shopId;
    if (!shopId) {
      const ownedShop = await Shop.findOne({ ownerId: user.id || user._id });
      if (ownedShop) shopId = ownedShop._id;
    }

    if (!shopId && user.role !== 'admin') {
      const error = new Error('Từ chối: Bạn không sở hữu cửa hàng nào để xem đơn hàng.');
      error.statusCode = 403;
      throw error;
    }

    const filter = shopId ? { $or: [{ shopId }, { shop_id: shopId }] } : {};
    const orders = await Order.find(filter)
      .populate('user_id', 'name email phone avatar')
      .populate('customer_id', 'full_name email phone address')
      .sort({ created_at: -1, createdAt: -1 });

    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const orderItems = await OrderItem.find({ order_id: order._id })
        .populate('product_id', 'title imageUrl images sku price');
      
      const ordObj = order.toObject ? order.toObject() : order;
      if (orderItems.length > 0) {
        ordObj.detailedItems = orderItems;
      }
      return ordObj;
    }));

    return enrichedOrders;
  },

  // 3. Admin xem danh sách đơn hàng toàn hệ thống
  async getAdminOrders(queryParams) {
    const { status } = queryParams || {};
    let query = {};
    if (status) {
      query.$or = [{ orderStatus: status }, { order_status: status }];
    }

    const orders = await Order.find(query)
      .populate('shop_id', 'shopName logoUrl status')
      .populate('user_id', 'name email phone')
      .sort({ created_at: -1, createdAt: -1 });

    return orders;
  },

  // 4. Xem chi tiết 1 đơn hàng cụ thể
  async getOrderById(orderId, user) {
    const order = await Order.findById(orderId)
      .populate('shop_id', 'shopName logoUrl phone email status')
      .populate('user_id', 'name email phone')
      .populate('customer_id', 'full_name phone email address');

    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng yêu cầu.');
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = user.role === 'admin';
    const isOwner = String(order.userId || order.user_id) === String(user.id || user._id);
    
    let isShopOwner = false;
    if (user.shopId && String(order.shopId || order.shop_id) === String(user.shopId)) {
      isShopOwner = true;
    } else {
      const ownedShop = await Shop.findOne({ ownerId: user.id || user._id });
      if (ownedShop && String(order.shopId || order.shop_id) === String(ownedShop._id)) {
        isShopOwner = true;
      }
    }

    if (!isAdmin && !isOwner && !isShopOwner) {
      const error = new Error('Từ chối: Bạn không có quyền xem thông tin đơn hàng này.');
      error.statusCode = 403;
      throw error;
    }

    const orderItems = await OrderItem.find({ order_id: order._id })
      .populate('product_id', 'title imageUrl images sku price stock');
    const payment = await Payment.findOne({ order_id: order._id });

    const ordObj = order.toObject ? order.toObject() : order;
    ordObj.detailedItems = orderItems;
    ordObj.paymentInfo = payment;

    return ordObj;
  },

  // 5. Tạo đơn hàng (Checkout)
  async createOrder(user, payload) {
    const { items, shippingAddress, paymentMethod, voucherCode, note } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Giỏ hàng của bạn đang trống hoặc không có sản phẩm nào được chọn.');
      error.statusCode = 400;
      throw error;
    }

    if (!shippingAddress) {
      const error = new Error('Vui lòng cung cấp địa chỉ nhận hàng và số điện thoại liên lạc.');
      error.statusCode = 400;
      throw error;
    }

    const userId = user.id || user._id;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      const error = new Error('Người dùng không tồn tại.');
      error.statusCode = 404;
      throw error;
    }
    const now = new Date();

    if (currentUser.status === 'locked') {
      if (currentUser.lockExpiresAt && currentUser.lockExpiresAt <= now) {
        currentUser.status = 'active';
        currentUser.lockExpiresAt = null;
        currentUser.lockReason = null;
        await currentUser.save();
      } else {
        const remainingStr = currentUser.lockExpiresAt ? ` đến ${new Date(currentUser.lockExpiresAt).toLocaleString('vi-VN')}` : '';
        const error = new Error(`Tài khoản của bạn đang bị khóa${remainingStr}. Lý do: ${currentUser.lockReason || 'Vi phạm điều khoản chính sách'}. Không thể thực hiện mua hàng hoặc thanh toán.`);
        error.statusCode = 403;
        throw error;
      }
    }

    if (currentUser.isOrderLocked) {
      if (currentUser.orderLockExpiresAt && currentUser.orderLockExpiresAt <= now) {
        currentUser.isOrderLocked = false;
        currentUser.orderLockExpiresAt = null;
        currentUser.orderLockReason = '';
        await currentUser.save();
      } else {
        const remainingStr = currentUser.orderLockExpiresAt ? ` đến ${new Date(currentUser.orderLockExpiresAt).toLocaleString('vi-VN')}` : '';
        const error = new Error(`Quyền đặt hàng của tài khoản đang bị tạm khóa${remainingStr}. Lý do: ${currentUser.orderLockReason || 'Tạm dừng đặt hàng theo quyết định quản trị viên'}. Bạn vẫn có thể xem sản phẩm và cập nhật giỏ hàng nhưng chưa thể đặt hàng lúc này.`);
        error.statusCode = 403;
        throw error;
      }
    }

    const customer = await getCustomerForUser(userId);
    const customerId = customer ? customer._id : null;
    const userCart = await Cart.findOne({ userId });

    const shopGroupMap = new Map();

    for (const item of items) {
      const pId = item.productId || item.product_id;
      const qty = Number(item.quantity || item.qty || 1);

      if (qty < 1) {
        const error = new Error('Số lượng mua tối thiểu cho mỗi sản phẩm phải là 1.');
        error.statusCode = 400;
        throw error;
      }

      const product = await Product.findById(pId).populate('shopId');
      if (!product) {
        const error = new Error(`Sản phẩm với ID ${pId} không còn tồn tại trên hệ thống.`);
        error.statusCode = 404;
        throw error;
      }

      if (product.status !== 'active') {
        const error = new Error(`Sản phẩm "${product.title}" hiện đã ngừng kinh doanh hoặc đang tạm khóa.`);
        error.statusCode = 400;
        throw error;
      }

      if (product.stock < qty) {
        const error = new Error(`Sản phẩm "${product.title}" không đủ tồn kho (chỉ còn ${product.stock} cái, bạn chọn ${qty} cái).`);
        error.statusCode = 400;
        throw error;
      }

      const shopIdStr = product.shopId ? String(product.shopId._id || product.shopId) : 'DEFAULT_SHOP';
      
      if (product.shopId && product.shopId.status && product.shopId.status !== 'active') {
        const error = new Error(`Cửa hàng "${product.shopId.shopName || product.shopId.name || 'Bán lẻ'}" hiện đang tạm ngừng hoạt động.`);
        error.statusCode = 400;
        throw error;
      }

      if (!shopGroupMap.has(shopIdStr)) {
        shopGroupMap.set(shopIdStr, {
          shopId: product.shopId ? (product.shopId._id || product.shopId) : null,
          items: []
        });
      }

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

    let totalDiscount = 0;
    let appliedVoucher = null;
    if (voucherCode) {
      const v = await Voucher.findOne({ code: voucherCode.toUpperCase().trim() });
      if (v) {
        const expiry = v.expiryDate || v.end_date;
        const start = v.startDate || v.start_date;
        const status = v.status || 'active';
        const currentUses = Number(v.usesCount || v.used_count || 0);
        const max = Number(v.maxUses || v.quantity || 100);
        const minOrder = Number(v.minOrderValue || (v.min_order_amount ? v.min_order_amount.toString() : 0));

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

    const createdOrders = [];
    const orderedProductIds = [];
    const numShops = shopGroupMap.size;
    const discountPerShop = numShops > 0 ? Math.floor(totalDiscount / numShops) : 0;

    for (const [, group] of shopGroupMap.entries()) {
      let shopSubtotal = 0;
      const embeddedItems = [];

      let shopDiscount = 0;
      if (appliedVoucher) {
        if (appliedVoucher.shopId) {
          if (String(group.shopId) === String(appliedVoucher.shopId)) {
            shopDiscount = totalDiscount;
          }
        } else {
          shopDiscount = discountPerShop;
        }
      }

      for (const entry of group.items) {
        const { product, qty, authoritativePrice, subtotal } = entry;
        shopSubtotal += subtotal;
        orderedProductIds.push(product._id);

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

        // Trừ tồn kho NGUYÊN TỬ
        const decremented = await Product.findOneAndUpdate(
          { _id: product._id, stock: { $gte: qty } },
          { $inc: { stock: -qty } },
          { new: true }
        );

        if (!decremented) {
          // Hủy và hoàn kho các đơn đã tạo trong cùng phiên nếu hết hàng
          for (const ord of createdOrders) {
            for (const it of ord.items) {
              await Product.updateOne(
                { _id: it.productId || it.product_id },
                { $inc: { stock: it.quantity || it.qty || 1 } }
              );
            }
            await Order.findByIdAndDelete(ord._id);
          }
          const error = new Error(`Sản phẩm "${product.title}" vừa hết hàng do một đơn hàng khác đã đặt trước. Vui lòng thử lại!`);
          error.statusCode = 400;
          throw error;
        }

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

      const selectedShippingMethod = payload.shippingMethod || payload.shipping_method || 'ghn';
      const selectedShippingName = payload.shippingMethodName || payload.shipping_method_name || (
        selectedShippingMethod === 'fast' ? 'Giao hàng hỏa tốc 24H' :
        selectedShippingMethod === 'express' ? 'GEARTECH SuperShip (Nội thành)' :
        'Giao Hàng Nhanh (GHN Express)'
      );
      const shippingFee = Number(payload.shippingFee) >= 0 ? Number(payload.shippingFee) : (
        selectedShippingMethod === 'fast' ? 65000 :
        selectedShippingMethod === 'express' ? 120000 :
        30000
      );
      const carrier = payload.carrier || (
        selectedShippingMethod === 'express' ? 'SuperShip' :
        selectedShippingMethod === 'fast' ? 'Hỏa tốc' :
        'GHN'
      );

      const actualShopDiscount = Math.min(shopSubtotal, shopDiscount);
      const finalAmount = Math.max(0, shopSubtotal - actualShopDiscount + shippingFee);

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
        : (currentUser.phone || '0900000000');
      
      const receiverName = typeof shippingAddress === 'object' && shippingAddress.receiverName
        ? shippingAddress.receiverName
        : (currentUser.name || 'Khách hàng');

      const isCod = paymentMethod === 'COD' || paymentMethod === 'cod';
      // COD: cho thanh toan khi nhan hang; cac phuong thuc online (VNPAY, MoMo, chuyen khoan): de 'pending' cho den khi cong thanh toan xac nhan
      const initialPayStatus = 'pending';

      const newOrder = new Order({
        customer_id: customerId,
        customerId: customerId,
        user_id: userId,
        userId: userId,
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
        shipping_method: selectedShippingMethod,
        shippingMethod: selectedShippingMethod,
        shipping_method_name: selectedShippingName,
        shippingMethodName: selectedShippingName,
        carrier: carrier,

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
        payment_status: initialPayStatus,
        paymentStatus: initialPayStatus,
        order_status: 'pending',
        orderStatus: 'pending',
        items: embeddedItems,
        note: note || ''
      });

      await newOrder.save();

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

      await Payment.create({
        order_id: newOrder._id,
        payment_method: paymentMethod || 'COD',
        amount: mongoose.Types.Decimal128.fromString(finalAmount.toString()),
        payment_status: initialPayStatus,
        paid_at: null
      }).catch(() => {});

      createdOrders.push(newOrder);
    }

    try {
      const uCart = await Cart.findOne({
        $or: [
          { userId },
          { user_id: userId },
          { customer_id: customerId }
        ]
      });

      if (uCart) {
        const pIdSet = new Set(orderedProductIds.map(id => String(id)));
        uCart.items = uCart.items.filter(item => !pIdSet.has(String(item.productId || item.product_id)));
        await uCart.save();

        await CartItem.deleteMany({
          cart_id: uCart._id,
          product_id: { $in: orderedProductIds }
        });
      }
    } catch (cartErr) {
      console.warn('Lưu ý: Không thể dọn giỏ hàng tự động:', cartErr.message);
    }

    const totalPaid = createdOrders.reduce((sum, ord) => sum + (ord.finalAmount || 0), 0);
    const pointsEarned = Math.floor(totalPaid / 10000);
    if (currentUser) {
      currentUser.points = (currentUser.points || 0) + pointsEarned;
      if (currentUser.points >= 10000) currentUser.memberRank = 'KIM_CUONG';
      else if (currentUser.points >= 5000) currentUser.memberRank = 'VANG';
      else if (currentUser.points >= 3000) currentUser.memberRank = 'BAC';
      else if (currentUser.points >= 1000) currentUser.memberRank = 'DONG';
      else currentUser.memberRank = 'THUONG';
      await currentUser.save();
    }

    return {
      orders: createdOrders,
      order: createdOrders[0],
      pointsEarned,
      newMemberPoints: currentUser ? currentUser.points : 0,
      newMemberRank: currentUser ? currentUser.memberRank : 'THUONG'
    };
  },

  // 6. Cập nhật trạng thái đơn hàng (Chủ shop / Admin)
  async updateOrderStatus(orderId, user, orderStatus, extraData = {}) {
    const allowedStatuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

    if (!allowedStatuses.includes(orderStatus)) {
      const error = new Error(`Trạng thái không hợp lệ. Chỉ chấp nhận các trạng thái: ${allowedStatuses.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng cần xử lý.');
      error.statusCode = 404;
      throw error;
    }

    const isAdmin = user.role === 'admin';
    const isShop = user.role === 'shop' || !!user.shopId;

    if (!isAdmin && !isShop) {
      const error = new Error('Từ chối: Bạn không có quyền quản lý đơn hàng này.');
      error.statusCode = 403;
      throw error;
    }

    if (isShop && !isAdmin) {
      let userShopId = user.shopId;
      if (!userShopId) {
        const ownedShop = await Shop.findOne({ ownerId: user.id || user._id });
        if (ownedShop) userShopId = ownedShop._id;
      }

      if (!userShopId || String(order.shopId || order.shop_id) !== String(userShopId)) {
        const error = new Error('Từ chối: Bạn chỉ có quyền xử lý các đơn hàng thuộc cửa hàng của chính mình!');
        error.statusCode = 403;
        throw error;
      }

      const shop = await Shop.findById(userShopId);
      if (!shop || shop.status !== 'active') {
        const error = new Error('Cửa hàng của bạn hiện đang bị khóa hoặc chưa được duyệt, không thể xử lý đơn hàng!');
        error.statusCode = 403;
        throw error;
      }
    }

    const previousStatus = order.orderStatus || order.order_status;

    if (previousStatus === 'completed' && orderStatus !== 'completed') {
      const error = new Error('Đơn hàng đã hoàn tất thành công, không thể thay đổi trạng thái!');
      error.statusCode = 400;
      throw error;
    }

    if (previousStatus === 'cancelled') {
      const error = new Error('Đơn hàng này đã bị hủy, không thể cập nhật trạng thái khác!');
      error.statusCode = 400;
      throw error;
    }

    if (orderStatus === 'cancelled' && previousStatus !== 'cancelled') {
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
              note: `Hoàn kho do hủy đơn hàng ${order._id}`
            }).catch(() => {});
          }
        }
      }
    }

    order.orderStatus = orderStatus;
    order.order_status = orderStatus;

    if (extraData && (extraData.trackingCode || extraData.tracking_code)) {
      order.trackingCode = extraData.trackingCode || extraData.tracking_code;
      order.tracking_code = order.trackingCode;
    }
    if (extraData && extraData.carrier) {
      order.carrier = extraData.carrier;
    }
    if (extraData && (extraData.shippingMethod || extraData.shipping_method)) {
      order.shippingMethod = extraData.shippingMethod || extraData.shipping_method;
      order.shipping_method = order.shippingMethod;
    }

    if (orderStatus === 'completed') {
      order.paymentStatus = 'paid';
      order.payment_status = 'paid';
      await Payment.updateOne({ order_id: order._id }, { payment_status: 'paid', paid_at: new Date() });

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

    if (orderStatus === 'completed') {
      await financeService.settleOrder(order._id).catch(err => console.error('Lỗi đối soát ví:', err));
    } else if (orderStatus === 'cancelled') {
      await financeService.handleOrderCancellation(order._id).catch(err => console.error('Lỗi thu hồi doanh thu hủy đơn:', err));
    }

    return order;
  },

  // 7. Khách hàng tự hủy đơn hàng khi trạng thái còn pending
  async cancelOrder(orderId, user) {
    const order = await Order.findById(orderId);
    if (!order) {
      const error = new Error('Không tìm thấy đơn hàng cần hủy.');
      error.statusCode = 404;
      throw error;
    }

    const userId = user.id || user._id;
    const isOwner = String(order.userId || order.user_id) === String(userId);
    if (!isOwner) {
      const error = new Error('Từ chối: Bạn không có quyền hủy đơn hàng của người khác.');
      error.statusCode = 403;
      throw error;
    }

    const currentStatus = order.orderStatus || order.order_status;
    if (currentStatus !== 'pending') {
      const error = new Error(`Không thể hủy đơn hàng vì đơn đã chuyển sang trạng thái "${currentStatus}". Vui lòng liên hệ shop để được hỗ trợ!`);
      error.statusCode = 400;
      throw error;
    }

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

    await financeService.handleOrderCancellation(order._id).catch(err => console.error('Lỗi thu hồi doanh thu hủy đơn:', err));

    return order;
  }
};

module.exports = orderService;

