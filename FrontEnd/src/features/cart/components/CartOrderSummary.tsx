import React from 'react'
import { ArrowRight, Warning, ShieldCheck } from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import type { AppliedCoupon } from './CartCouponBox'

export interface CartOrderSummaryProps {
  selectedCount: number
  subtotal: number
  estimatedShipping: number
  discountAmount: number
  finalTotal: number
  appliedCoupon: AppliedCoupon | null
  validationError: string | null
  validating: boolean
  onProceedToCheckout: () => void
}

export const CartOrderSummary: React.FC<CartOrderSummaryProps> = ({
  selectedCount,
  subtotal,
  estimatedShipping,
  discountAmount,
  finalTotal,
  appliedCoupon,
  validationError,
  validating,
  onProceedToCheckout
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <span className="font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
          Tóm tắt giỏ hàng
        </span>
        <span className="text-xs font-semibold text-zinc-500">
          Đã chọn: <strong className="text-zinc-900 dark:text-white">{selectedCount}</strong> món
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between text-zinc-500">
          <span>Tạm tính hàng:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-zinc-500">
          <span>Phí vận chuyển ước tính:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
            {estimatedShipping === 0 ? (
              <span className="text-emerald-500 font-bold">Miễn phí</span>
            ) : (
              formatPrice(estimatedShipping)
            )}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-500 font-medium">
            <span>Voucher giảm giá:</span>
            <span>-{formatPrice(discountAmount)}</span>
          </div>
        )}

        {validationError && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-500 flex items-start gap-2">
            <Warning size={16} weight="bold" className="shrink-0 mt-0.5" />
            <span>{validationError}</span>
          </div>
        )}

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
              Tổng thanh toán
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Đã bao gồm VAT 10%</span>
          </div>
          <span className="text-xl font-black text-[#ff4655]">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {/* Nút sang trang Checkout */}
      <button
        type="button"
        disabled={selectedCount === 0 || validating}
        onClick={onProceedToCheckout}
        className="w-full py-4 px-6 rounded-2xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
      >
        <span>{validating ? 'ĐANG KIỂM TRA TỒN KHO...' : 'TIẾN HÀNH THANH TOÁN'}</span>
        <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
      </button>

      {selectedCount === 0 && (
        <p className="text-[11px] text-amber-500 text-center font-medium">
          Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán
        </p>
      )}

      {/* Thông tin hỗ trợ */}
      <div className="pt-2 text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
        <ShieldCheck size={14} className="text-emerald-500" />
        <span>Cam kết bảo mật & Đổi trả trong 30 ngày</span>
      </div>
    </div>
  )
}

