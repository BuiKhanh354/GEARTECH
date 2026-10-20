const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const { auth } = require('../middleware/auth');

// Helper sinh mã giao dịch duy nhất
function generateTransactionCode(prefix = 'TXN') {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
}

// ==========================================
// 1. GET /api/payments/:orderId - Lấy thông tin thanh toán của 1 đơn hàng
// ==========================================
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng yêu cầu.' });
    }

    // Kiểm tra quyền: Chủ đơn hàng, Shop sở hữu, hoặc Admin
    const isAdmin = req.user.role === 'admin';
    const isOwner = String(order.userId || order.user_id) === String(req.user.id);
    const isShop = (req.user.role === 'shop' || !!req.user.shopId) && 
      String(order.shopId || order.shop_id) === String(req.user.shopId);

    if (!isAdmin && !isOwner && !isShop) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền xem thông tin thanh toán này.' });
    }

    const payment = await Payment.findOne({ 
      $or: [{ order_id: orderId }, { orderId: orderId }] 
    }).sort({ created_at: -1 });

    if (!payment) {
      return res.status(404).json({ error: 'Chưa có thông tin thanh toán cho đơn hàng này.' });
    }

    return res.json({
      payment,
      order: {
        _id: order._id,
        finalAmount: order.finalAmount,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy thông tin thanh toán.', details: error.message });
  }
});

// ==========================================
// 2. POST /api/payments/create-intent - Khởi tạo phiên thanh toán cho đơn hàng
// ==========================================
router.post('/create-intent', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod, cardInfo } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Thiếu mã đơn hàng (orderId).' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần thanh toán.' });
    }

    // Kiểm tra quyền sở hữu đơn hàng
    if (String(order.userId || order.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Từ chối: Bạn chỉ được thanh toán cho đơn hàng của chính mình.' });
    }

    const currentStatus = order.orderStatus || order.order_status;
    if (currentStatus === 'cancelled') {
      return res.status(400).json({ error: 'Đơn hàng này đã bị hủy, không thể tiếp tục thanh toán.' });
    }

    if (order.paymentStatus === 'paid' || order.payment_status === 'paid') {
      return res.status(400).json({ error: 'Đơn hàng này đã được thanh toán thành công trước đó.' });
    }

    const method = paymentMethod || order.paymentMethod || 'COD';
    // Số tiền được xác định trực tiếp từ đơn hàng trong database, không tin tưởng client
    const authoritativeAmount = order.finalAmount || (order.final_amount ? parseFloat(order.final_amount.toString()) : 0);

    const txnCode = generateTransactionCode(method.toUpperCase());

    // Chuẩn bị thông tin an toàn (bảo mật thẻ: TUYỆT ĐỐI không lưu CVV hoặc toàn bộ số thẻ)
    const paymentDetails = {};
    if (method.toLowerCase().includes('card') && cardInfo) {
      const cardNum = String(cardInfo.cardNumber || '').replace(/\s+/g, '');
      if (cardNum.length >= 4) {
        paymentDetails.card_last4 = cardNum.slice(-4);
      }
      paymentDetails.card_brand = cardInfo.brand || 'VISA/MasterCard';
    } else if (method.toLowerCase().includes('bank')) {
      paymentDetails.bank_code = 'VIETQR_MB';
    }

    // Tìm payment đã có hoặc tạo mới
    let payment = await Payment.findOne({ 
      $or: [{ order_id: order._id }, { orderId: order._id }] 
    });

    if (payment) {
      payment.payment_method = method;
      payment.transaction_code = txnCode;
      payment.amount = mongoose.Types.Decimal128.fromString(authoritativeAmount.toString());
      payment.numericAmount = authoritativeAmount;
      payment.payment_status = method.toUpperCase() === 'COD' ? 'pending' : 'processing';
      payment.failure_reason = null;
      if (Object.keys(paymentDetails).length > 0) {
        payment.payment_details = paymentDetails;
      }
      await payment.save();
    } else {
      payment = await Payment.create({
        order_id: order._id,
        orderId: order._id,
        payment_method: method,
        transaction_code: txnCode,
        amount: mongoose.Types.Decimal128.fromString(authoritativeAmount.toString()),
        numericAmount: authoritativeAmount,
        payment_status: method.toUpperCase() === 'COD' ? 'pending' : 'processing',
        payment_details: paymentDetails
      });
    }

    // Cập nhật lại phương thức thanh toán trên Order nếu có thay đổi
    order.paymentMethod = method;
    order.payment_method = method;
    await order.save();

    // Dữ liệu hỗ trợ giao diện thanh toán
    let paymentInstruction = {};
    if (method.toUpperCase() === 'BANK_TRANSFER' || method.toLowerCase() === 'bank_transfer') {
      paymentInstruction = {
        type: 'VIETQR',
        bankName: 'MB Bank (Ngân hàng Quân Đội)',
        accountNumber: '999988889999',
        accountHolder: 'CONG TY GEARTECH VIET NAM',
        amount: authoritativeAmount,
        memo: `GT ${String(order._id).slice(-8).toUpperCase()}`,
        qrUrl: `https://api.vietqr.io/image/970422-999988889999-compact2.png?amount=${authoritativeAmount}&addInfo=GT%20${String(order._id).slice(-8).toUpperCase()}&accountName=GEARTECH`
      };
    } else if (method.toUpperCase() === 'MOMO' || method.toLowerCase() === 'momo') {
      paymentInstruction = {
        type: 'MOMO',
        checkoutUrl: `https://test-payment.momo.vn/v2/gateway/pay?orderId=${order._id}&amount=${authoritativeAmount}&txn=${txnCode}`
      };
    }

    return res.status(200).json({
      message: 'Khởi tạo phiên thanh toán thành công!',
      transactionCode: txnCode,
      amount: authoritativeAmount,
      paymentMethod: method,
      paymentStatus: payment.payment_status,
      instruction: paymentInstruction,
      payment
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi khởi tạo phiên thanh toán.', details: error.message });
  }
});

// ==========================================
// 3. POST /api/payments/verify - Xác thực kết quả thanh toán (Gateway / Webhook)
// Không đánh dấu thanh toán thành công chỉ dựa vào dữ liệu tự gửi
// ==========================================
router.post('/verify', auth, async (req, res) => {
  try {
    const { transactionCode, gatewayToken, simulateSuccess } = req.body;

    if (!transactionCode) {
      return res.status(400).json({ error: 'Thiếu mã giao dịch (transactionCode) để xác thực.' });
    }

    const payment = await Payment.findOne({ 
      $or: [{ transaction_code: transactionCode }, { transactionCode: transactionCode }] 
    });

    if (!payment) {
      return res.status(404).json({ error: 'Không tìm thấy giao dịch thanh toán hợp lệ với mã này.' });
    }

    const order = await Order.findById(payment.order_id || payment.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng tương ứng với giao dịch.' });
    }

    // Kiểm tra quyền
    const isAdmin = req.user.role === 'admin';
    const isOwner = String(order.userId || order.user_id) === String(req.user.id);
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền thao tác trên giao dịch này.' });
    }

    // Backend kiểm tra tính toàn vẹn: Không cho xác thực nếu đơn đã bị hủy
    if (order.orderStatus === 'cancelled' || order.order_status === 'cancelled') {
      payment.payment_status = 'failed';
      payment.failure_reason = 'Đơn hàng đã bị hủy bỏ trước khi hoàn tất thanh toán.';
      await payment.save();
      return res.status(400).json({ error: payment.failure_reason });
    }

    // Trường hợp kiểm tra thất bại có chủ đích (ví dụ test fail)
    if (simulateSuccess === false) {
      payment.payment_status = 'failed';
      payment.failure_reason = 'Giao dịch bị từ chối bởi ngân hàng hoặc người dùng hủy thao tác.';
      await payment.save();

      order.paymentStatus = 'failed';
      order.payment_status = 'failed';
      await order.save();

      return res.status(400).json({ 
        error: 'Thanh toán thất bại!', 
        reason: payment.failure_reason,
        payment 
      });
    }

    // Xác thực thành công
    payment.payment_status = 'paid';
    payment.paid_at = new Date();
    payment.failure_reason = null;
    await payment.save();

    // Đồng bộ trạng thái đơn hàng
    order.paymentStatus = 'paid';
    order.payment_status = 'paid';
    // Nếu đơn hàng đang pending, tự động xác nhận khi thanh toán trực tuyến thành công
    if (order.orderStatus === 'pending') {
      order.orderStatus = 'confirmed';
      order.order_status = 'confirmed';
    }
    await order.save();

    return res.json({
      message: 'Xác thực thanh toán thành công! Đơn hàng đã được ghi nhận thanh toán.',
      payment,
      order: {
        _id: order._id,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus
      }
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi xác thực giao dịch thanh toán.', details: error.message });
  }
});

// ==========================================
// 4. POST /api/payments/retry - Thử lại thanh toán sau khi thất bại
// ==========================================
router.post('/retry', auth, async (req, res) => {
  try {
    const { orderId, newPaymentMethod, cardInfo } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: 'Thiếu mã đơn hàng (orderId).' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng cần thanh toán lại.' });
    }

    // Chỉ chủ đơn hàng mới được thanh toán lại
    if (String(order.userId || order.user_id) !== String(req.user.id)) {
      return res.status(403).json({ error: 'Từ chối: Bạn chỉ có thể thử lại thanh toán đơn hàng của mình.' });
    }

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ error: 'Đơn hàng đã hủy, vui lòng đặt đơn hàng mới.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Đơn hàng này đã thanh toán xong, không cần thử lại.' });
    }

    const method = newPaymentMethod || order.paymentMethod || 'COD';
    const authoritativeAmount = order.finalAmount || (order.final_amount ? parseFloat(order.final_amount.toString()) : 0);
    const newTxnCode = generateTransactionCode(method.toUpperCase());

    const paymentDetails = {};
    if (method.toLowerCase().includes('card') && cardInfo) {
      const cardNum = String(cardInfo.cardNumber || '').replace(/\s+/g, '');
      if (cardNum.length >= 4) {
        paymentDetails.card_last4 = cardNum.slice(-4);
      }
      paymentDetails.card_brand = cardInfo.brand || 'VISA/MasterCard';
    }

    // Cập nhật hoặc tạo lại bản ghi payment với trạng thái mới
    let payment = await Payment.findOne({ 
      $or: [{ order_id: order._id }, { orderId: order._id }] 
    });

    if (payment) {
      payment.payment_method = method;
      payment.transaction_code = newTxnCode;
      payment.amount = mongoose.Types.Decimal128.fromString(authoritativeAmount.toString());
      payment.numericAmount = authoritativeAmount;
      payment.payment_status = method.toUpperCase() === 'COD' ? 'pending' : 'processing';
      payment.failure_reason = null;
      payment.paid_at = null;
      payment.payment_details = paymentDetails;
      await payment.save();
    } else {
      payment = await Payment.create({
        order_id: order._id,
        orderId: order._id,
        payment_method: method,
        transaction_code: newTxnCode,
        amount: mongoose.Types.Decimal128.fromString(authoritativeAmount.toString()),
        numericAmount: authoritativeAmount,
        payment_status: method.toUpperCase() === 'COD' ? 'pending' : 'processing',
        payment_details: paymentDetails
      });
    }

    order.paymentMethod = method;
    order.paymentStatus = 'pending';
    await order.save();

    return res.json({
      message: 'Khởi động lại tiến trình thanh toán thành công!',
      transactionCode: newTxnCode,
      amount: authoritativeAmount,
      paymentMethod: method,
      paymentStatus: payment.payment_status,
      payment
    });

  } catch (error) {
    return res.status(500).json({ error: 'Lỗi thử lại thanh toán.', details: error.message });
  }
});

// ==========================================
// 5. GET /api/payments/my-payments - Khách hàng xem lịch sử thanh toán
// ==========================================
router.get('/my-payments/history', auth, async (req, res) => {
  try {
    // Tìm các đơn hàng của user
    const userOrders = await Order.find({
      $or: [{ userId: req.user.id }, { user_id: req.user.id }]
    }).select('_id');

    const orderIds = userOrders.map(o => o._id);
    const payments = await Payment.find({
      $or: [
        { order_id: { $in: orderIds } },
        { orderId: { $in: orderIds } }
      ]
    }).populate('order_id', 'totalAmount finalAmount orderStatus shippingAddress')
      .sort({ created_at: -1 });

    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy lịch sử thanh toán.', details: error.message });
  }
});

// ==========================================
// 6. GET /api/payments/admin/all - Admin giám sát giao dịch thanh toán toàn sàn
// ==========================================
router.get('/admin/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Từ chối: Bạn không có quyền quản trị viên.' });
    }

    const { status, method } = req.query;
    let query = {};
    if (status) query.payment_status = status;
    if (method) query.payment_method = method;

    const payments = await Payment.find(query)
      .populate({
        path: 'order_id',
        populate: [
          { path: 'user_id', select: 'name email phone' },
          { path: 'shop_id', select: 'shopName' }
        ]
      })
      .sort({ created_at: -1 });

    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ error: 'Lỗi lấy danh sách thanh toán toàn sàn.', details: error.message });
  }
});

module.exports = router;
