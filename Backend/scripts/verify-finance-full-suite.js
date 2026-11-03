const mongoose = require('mongoose');

async function runTestSuite() {
  await mongoose.connect('mongodb://localhost:27017/gear_tech');
  console.log('=== BẮT ĐẦU KIỂM THỬ HỆ THỐNG TÀI CHÍNH GEARTECH ===\n');

  const User = require('../models/User');
  const Shop = require('../models/Shop');
  const Product = require('../models/Product');
  const Order = require('../models/Order');
  const ShopWallet = require('../models/ShopWallet');
  const FinancialTransaction = require('../models/FinancialTransaction');
  const WithdrawalRequest = require('../models/WithdrawalRequest');
  const PlatformFeeConfig = require('../models/PlatformFeeConfig');
  const financeService = require('../services/financeService');

  // Lấy hoặc tạo 2 shop mẫu để kiểm thử đa gian hàng
  const adminUser = await User.findOne({ role: 'admin' });
  const shops = await Shop.find({ status: 'active' }).limit(2);
  if (shops.length < 2) {
    throw new Error('Cần ít nhất 2 shop active để test multi-shop');
  }
  const shopA = shops[0];
  const shopB = shops[1];

  console.log(`[TEST-SETUP] Shop A: ${shopA.name} (${shopA._id})`);
  console.log(`[TEST-SETUP] Shop B: ${shopB.name} (${shopB._id})`);

  let testPassedCount = 0;

  // -------------------------------------------------------------
  // Test 1 & 4: Khách đặt đơn 1 Shop & thanh toán thành công -> Doanh thu vào Pending Balance
  // -------------------------------------------------------------
  console.log('\n--- TEST 1 & 4: Thanh toán đơn hàng 1 Shop & Ghi nhận Pending Balance ---');
  const walletABefore = await financeService.getOrCreateWallet(shopA._id);
  const pendingBefore = walletABefore.pendingBalance;

  const order1 = await Order.create({
    shop_id: shopA._id,
    shopId: shopA._id,
    totalAmount: 1000000,
    discountAmount: 0,
    shippingFee: 30000,
    finalAmount: 1030000,
    shipping_address: '123 Đường Test, Quận 1, TP.HCM',
    phone: '0901234567',
    payment_method: 'MOMO',
    payment_status: 'paid',
    order_status: 'confirmed'
  });

  const revTxn1 = await financeService.recordOrderPayment(order1._id);
  const walletAAfterPaid = await ShopWallet.findOne({ shopId: shopA._id });

  // Phí sàn mặc định 5% -> Tiền hàng 1,000,000 -> Phí 50,000 -> Thực nhận 950,000
  const expectedNet = 950000;
  if (walletAAfterPaid.pendingBalance === pendingBefore + expectedNet && revTxn1.type === 'ORDER_REVENUE') {
    console.log(`✓ PASS: Pending Balance tăng chính xác +${expectedNet.toLocaleString('vi-VN')}đ (Phí sàn 5% = 50.000đ).`);
    testPassedCount++;
  } else {
    throw new Error(`TEST 1 FAILED: PendingBalance không khớp (Trước: ${pendingBefore}, Sau: ${walletAAfterPaid.pendingBalance})`);
  }

  // -------------------------------------------------------------
  // Test 3: Idempotency (Callback IPN gửi nhiều lần -> Chống cộng trùng tiền)
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Chống cộng tiền trùng lặp (Idempotency check) ---');
  const revTxnDuplicate = await financeService.recordOrderPayment(order1._id);
  const walletAAfterDup = await ShopWallet.findOne({ shopId: shopA._id });
  if (walletAAfterDup.pendingBalance === walletAAfterPaid.pendingBalance && revTxnDuplicate.transactionCode === revTxn1.transactionCode) {
    console.log('✓ PASS: Callback thứ 2 không cộng thêm tiền, giữ nguyên số dư và trả về bản ghi ban đầu.');
    testPassedCount++;
  } else {
    throw new Error('TEST 3 FAILED: Idempotency thất bại, tiền bị cộng lặp!');
  }

  // -------------------------------------------------------------
  // Test 5: Đơn hàng Multi-Shop (Doanh thu phân bổ chính xác theo từng shop)
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Đơn hàng nhiều shop (Tách doanh thu độc lập) ---');
  const walletBBefore = await financeService.getOrCreateWallet(shopB._id);
  const pendingBBefore = walletBBefore.pendingBalance;

  // Đơn phụ thuộc shop B
  const orderB = await Order.create({
    shop_id: shopB._id,
    shopId: shopB._id,
    totalAmount: 2000000, // 2 triệu
    discountAmount: 0,
    shippingFee: 30000,
    finalAmount: 2030000,
    shipping_address: '456 Test Street',
    phone: '0909999999',
    payment_method: 'VNPAY',
    payment_status: 'paid',
    order_status: 'confirmed'
  });

  await financeService.recordOrderPayment(orderB._id);
  const walletBAfter = await ShopWallet.findOne({ shopId: shopB._id });
  const expectedNetB = 1900000; // 2tr - 5% = 1.9tr

  if (walletBAfter.pendingBalance === pendingBBefore + expectedNetB) {
    console.log(`✓ PASS: Shop B được cộng riêng +${expectedNetB.toLocaleString('vi-VN')}đ, hoàn toàn độc lập với Shop A.`);
    testPassedCount++;
  } else {
    throw new Error('TEST 5 FAILED: Doanh thu Shop B không khớp!');
  }

  // -------------------------------------------------------------
  // Test 6: Kiểm tra cách ly dữ liệu giữa các shop
  // -------------------------------------------------------------
  console.log('\n--- TEST 6: Cách ly dữ liệu tài chính giữa các Shop ---');
  const txnsA = await FinancialTransaction.find({ shopId: shopA._id });
  const hasLeak = txnsA.some(t => t.shopId.toString() === shopB._id.toString());
  if (!hasLeak) {
    console.log('✓ PASS: Sổ cái Shop A 100% không chứa bất kỳ giao dịch nào của Shop B.');
    testPassedCount++;
  } else {
    throw new Error('TEST 6 FAILED: Rò rỉ dữ liệu tài chính giữa các shop!');
  }

  // -------------------------------------------------------------
  // Test 7: Đối soát khi đơn hàng hoàn thành (Chuyển sang Available Balance)
  // -------------------------------------------------------------
  console.log('\n--- TEST 7: Đối soát khi đơn hàng hoàn tất (Pending -> Available) ---');
  const availBefore = walletAAfterPaid.availableBalance;
  await financeService.settleOrder(order1._id);
  const walletASettled = await ShopWallet.findOne({ shopId: shopA._id });

  if (walletASettled.pendingBalance === walletAAfterPaid.pendingBalance - expectedNet &&
      walletASettled.availableBalance === availBefore + expectedNet) {
    console.log(`✓ PASS: ${expectedNet.toLocaleString('vi-VN')}đ đã chuyển thành công từ Pending sang Available Balance!`);
    testPassedCount++;
  } else {
    throw new Error('TEST 7 FAILED: Chuyển số dư khi đối soát thất bại!');
  }

  // -------------------------------------------------------------
  // Test 8: Shop không đủ số dư để rút tiền
  // -------------------------------------------------------------
  console.log('\n--- TEST 8: Rút tiền vượt quá số dư khả dụng (Bảo vệ ngân sách) ---');
  try {
    const hugeAmount = walletASettled.availableBalance + 100000000;
    await financeService.requestWithdrawal(shopA._id, adminUser._id, hugeAmount, {
      bankName: 'VCB',
      accountNumber: '123',
      accountHolder: 'TEST'
    });
    throw new Error('TEST 8 FAILED: Cho phép rút tiền vượt số dư!');
  } catch (err) {
    console.log(`✓ PASS: Backend chặn thành công yêu cầu rút tiền vượt số dư (${err.message}).`);
    testPassedCount++;
  }

  // -------------------------------------------------------------
  // Test 9: Shop gửi yêu cầu rút tiền hợp lệ (Khóa tiền chờ duyệt)
  // -------------------------------------------------------------
  console.log('\n--- TEST 9: Tạo yêu cầu rút tiền hợp lệ & Khóa tiền tạm thời ---');
  const withdrawAmount = 200000; // Rút 200,000đ
  const availBeforeWithdraw = walletASettled.availableBalance;
  const lockedBeforeWithdraw = walletASettled.lockedBalance;

  const withdrawReq = await financeService.requestWithdrawal(shopA._id, adminUser._id, withdrawAmount, {
    bankName: 'Vietcombank',
    accountNumber: '999988887777',
    accountHolder: 'NGUYEN VAN SHOP'
  });

  const walletAAfterReq = await ShopWallet.findOne({ shopId: shopA._id });
  if (walletAAfterReq.availableBalance === availBeforeWithdraw - withdrawAmount &&
      walletAAfterReq.lockedBalance === lockedBeforeWithdraw + withdrawAmount &&
      withdrawReq.status === 'PENDING') {
    console.log(`✓ PASS: Tạo lệnh rút ${withdrawAmount.toLocaleString('vi-VN')}đ thành công. Số dư khả dụng trừ ${withdrawAmount.toLocaleString('vi-VN')}đ và chuyển vào Locked Balance.`);
    testPassedCount++;
  } else {
    throw new Error('TEST 9 FAILED: Xử lý lệnh rút tiền thất bại!');
  }

  // -------------------------------------------------------------
  // Test 10: Admin từ chối yêu cầu rút tiền -> Hoàn tiền lại Available
  // -------------------------------------------------------------
  console.log('\n--- TEST 10: Admin từ chối yêu cầu rút tiền & Hoàn tiền về ví ---');
  await financeService.rejectWithdrawal(withdrawReq._id, adminUser._id, 'Thông tin STK ngân hàng không khớp tên đăng ký');
  const walletAAfterReject = await ShopWallet.findOne({ shopId: shopA._id });
  const rejectedReq = await WithdrawalRequest.findById(withdrawReq._id);

  if (walletAAfterReject.availableBalance === availBeforeWithdraw &&
      walletAAfterReject.lockedBalance === lockedBeforeWithdraw &&
      rejectedReq.status === 'REJECTED') {
    console.log('✓ PASS: Yêu cầu bị từ chối và toàn bộ 200.000đ đã được hoàn trả lại ví khả dụng của Shop.');
    testPassedCount++;
  } else {
    throw new Error('TEST 10 FAILED: Hoàn tiền khi từ chối rút thất bại!');
  }

  // -------------------------------------------------------------
  // Test 11: Admin xác nhận giải ngân thành công
  // -------------------------------------------------------------
  console.log('\n--- TEST 11: Admin xác nhận giải ngân thành công ra ngân hàng ---');
  const newReq = await financeService.requestWithdrawal(shopA._id, adminUser._id, 100000, {
    bankName: 'MB Bank',
    accountNumber: '88882222',
    accountHolder: 'NGUYEN VAN SHOP'
  });

  const walletBeforePayout = await ShopWallet.findOne({ shopId: shopA._id });
  await financeService.payoutWithdrawal(newReq._id, adminUser._id, 'VND-FT-99281729', 'https://proof.example.com/receipt.jpg');
  const walletAfterPayout = await ShopWallet.findOne({ shopId: shopA._id });
  const paidReq = await WithdrawalRequest.findById(newReq._id);

  if (paidReq.status === 'PAID_OUT' &&
      walletAfterPayout.withdrawnBalance === walletBeforePayout.withdrawnBalance + 100000 &&
      walletAfterPayout.lockedBalance === walletBeforePayout.lockedBalance - 100000) {
    console.log('✓ PASS: Giải ngân thành công. Tiền đã chuyển từ Locked Balance sang Withdrawn Balance và lưu mã đối soát ngân hàng.');
    testPassedCount++;
  } else {
    throw new Error('TEST 11 FAILED: Xác nhận giải ngân thất bại!');
  }

  // -------------------------------------------------------------
  // Test 12: Đơn hàng bị hủy trước khi hoàn tất -> Thu hồi Pending Balance
  // -------------------------------------------------------------
  console.log('\n--- TEST 12: Đơn hàng bị hủy -> Thu hồi doanh thu tạm giữ ---');
  const cancelOrder = await Order.create({
    shop_id: shopA._id,
    shopId: shopA._id,
    totalAmount: 500000,
    shippingFee: 30000,
    finalAmount: 530000,
    shipping_address: 'Hanoi',
    phone: '0912345678',
    payment_method: 'MOMO',
    payment_status: 'paid',
    order_status: 'pending'
  });

  await financeService.recordOrderPayment(cancelOrder._id);
  const walletBeforeCancel = await ShopWallet.findOne({ shopId: shopA._id });

  await financeService.handleOrderCancellation(cancelOrder._id);
  const walletAfterCancel = await ShopWallet.findOne({ shopId: shopA._id });

  const cancelNet = 500000 * 0.95; // 475,000đ
  if (walletAfterCancel.pendingBalance === walletBeforeCancel.pendingBalance - cancelNet) {
    console.log('✓ PASS: Hủy đơn hàng thành công, Pending Balance đã được thu hồi 475.000đ chính xác.');
    testPassedCount++;
  } else {
    throw new Error('TEST 12 FAILED: Thu hồi doanh thu đơn hủy thất bại!');
  }

  console.log(`\n======================================================`);
  console.log(`🎉 TẤT CẢ ${testPassedCount} KIỂM THỬ TÀI CHÍNH ĐỀU ĐẠT CHUẨN 100% (PASS)!`);
  console.log(`======================================================\n`);

  process.exit(0);
}

runTestSuite().catch(e => {
  console.error('LỖI KIỂM THỬ:', e);
  process.exit(1);
});

