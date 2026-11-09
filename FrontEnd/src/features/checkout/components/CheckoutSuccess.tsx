import React, { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { CheckCircle, Receipt, ArrowSquareOut } from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { paymentService } from '../../../services/paymentService'

export interface CheckoutSuccessProps {
  orderId: string
  formData: {
    fullName: string
    phone: string
    email: string
    address: string
    ward: string
    district: string
    province: string
  }
  paymentMethod: string
  paymentMethods: Array<{ id: string; name: string }>
  finalTotal: number
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  orderId,
  formData,
  paymentMethod,
  paymentMethods,
  finalTotal
}) => {
  const [vnpayCheckoutUrl, setVnpayCheckoutUrl] = useState<string | null>(null)

  useEffect(() => {
    if (paymentMethod === 'vnpay' || paymentMethod === 'VNPAY') {
      paymentService.createPaymentIntent({
        orderId,
        paymentMethod: 'VNPAY'
      }).then((res) => {
        if (res?.instruction?.checkoutUrl) {
          setVnpayCheckoutUrl(res.instruction.checkoutUrl)
        }
      }).catch((err) => {
        console.warn('Lỗi khởi tạo URL VNPAY:', err)
      })
    }
  }, [orderId, paymentMethod])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 text-center shadow-xl space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
          <CheckCircle size={44} weight="fill" />
        </div>

        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
            Đặt hàng thành công
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-3 uppercase tracking-tight">
            Cảm ơn bạn đã tin tưởng GEARTECH!
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống. Chúng tôi sẽ liên hệ sớm nhất để xác nhận và bàn giao cho đơn vị vận chuyển.
          </p>
        </div>

        {/* Thông tin tóm tắt đơn hàng */}
        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Mã đơn hàng:</span>
            <span className="font-mono font-bold text-[#ff4655]">{orderId}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Người nhận:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formData.fullName} ({formData.phone})</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Địa chỉ giao:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[260px]">
              {formData.address}, {formData.ward}, {formData.district}, {formData.province}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-500">Phương thức thanh toán:</span>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {paymentMethods.find((p) => p.id === paymentMethod)?.name || (paymentMethod === 'vnpay' ? 'Cổng thanh toán VNPAY' : paymentMethod)}
            </span>
          </div>
          <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-center">
            <span className="font-bold text-zinc-700 dark:text-zinc-300">Tổng thanh toán:</span>
            <span className="font-black text-lg text-[#ff4655]">{formatPrice(finalTotal)}</span>
          </div>
        </div>

        {/* Khung thanh toán VNPAY */}
        {(paymentMethod === 'vnpay' || paymentMethod === 'VNPAY') && (
          <div className="p-5 bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl text-left space-y-4">
            <div className="flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">V</span>
              Cổng thanh toán quốc gia VNPAY
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              Đơn hàng sẵn sàng thanh toán qua cổng VNPAY. Nhấn nút bên dưới để mở cổng thanh toán và hoàn tất giao dịch.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              {vnpayCheckoutUrl ? (
                <a
                  href={vnpayCheckoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all text-center"
                >
                  <span>Mở Cổng VNPAY để Thanh Toán</span>
                  <ArrowSquareOut size={16} weight="bold" />
                </a>
              ) : (
                <Link
                  to="/profile?tab=orders"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all text-center"
                >
                  <span>Vào Đơn Hàng Để Thanh Toán</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Khung thanh toán VietQR nếu chọn Chuyển khoản */}
        {paymentMethod === 'bank_transfer' && (
          <div className="p-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-center space-y-3">
            <div className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Quét mã VietQR thanh toán tự động
            </div>
            <div className="inline-block p-2 bg-white rounded-xl border border-zinc-200 shadow-sm">
              <img
                src={`https://api.vietqr.io/image/970422-999988889999-compact2.png?amount=${finalTotal}&addInfo=GT%20${String(orderId).slice(-8).toUpperCase()}&accountName=GEARTECH`}
                alt="VietQR Payment"
                className="w-44 h-44 mx-auto object-contain"
              />
            </div>
            <div className="text-xs text-zinc-600 dark:text-zinc-300 font-mono">
              STK: <strong>999988889999</strong> (MB Bank) · ND: <strong className="text-[#ff4655]">GT {String(orderId).slice(-8).toUpperCase()}</strong>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            to="/orders"
            className="flex-1 py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Receipt size={18} />
            Theo dõi đơn hàng
          </Link>
          <Link
            to="/ProductPage"
            className="flex-1 py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#ff4655]/25 flex items-center justify-center gap-2"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
