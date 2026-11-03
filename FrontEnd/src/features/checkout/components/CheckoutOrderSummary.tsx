import React from 'react'
import {
  Package,
  Tag,
  CheckCircle,
  X,
  Warning,
  Lock,
  Info
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import type { VoucherItem } from '../../../services/voucherService'
import type { CartStoreItem } from '../../../store/cartStore'

export interface AppliedVoucher {
  code: string
  discount: number
  desc: string
}

export interface CheckoutOrderSummaryProps {
  cartItems: CartStoreItem[]
  subtotal: number
  currentShipping: number
  appliedVoucher: AppliedVoucher | null
  finalTotal: number
  voucherCode: string
  voucherError: string
  availableVouchers: VoucherItem[]
  errorMessage: string | null
  isSubmitting: boolean
  onVoucherCodeChange: (code: string) => void
  onApplyVoucher: (code?: string) => void
  onRemoveVoucher: () => void
}

export const CheckoutOrderSummary: React.FC<CheckoutOrderSummaryProps> = ({
  cartItems,
  subtotal,
  currentShipping,
  appliedVoucher,
  finalTotal,
  voucherCode,
  voucherError,
  availableVouchers,
  errorMessage,
  isSubmitting,
  onVoucherCodeChange,
  onApplyVoucher,
  onRemoveVoucher
}) => {
  return (
    <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Package size={20} className="text-[#ff4655]" weight="bold" />
          <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white">
            Giỏ hàng của bạn
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
          {cartItems.reduce((acc, i) => acc + i.quantity, 0)} món
        </span>
      </div>

      {/* Danh sách mặt hàng */}
      <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
        {cartItems.map((item) => (
          <div key={item.id} className="pt-3.5 first:pt-0 flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-2xl flex-shrink-0">
              {item.imageEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                {item.title}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] text-zinc-400">SL: x{item.quantity}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium truncate">
                  {item.variant || 'Mặc định'}
                </span>
              </div>
              <div className="text-xs font-black text-[#ff4655] mt-1">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mã ưu đãi voucher */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
          <Tag size={14} className="text-[#ff4655]" />
          Mã giảm giá / Voucher
        </label>

        {appliedVoucher ? (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <div>
              <div className="flex items-center gap-1.5 font-black text-xs">
                <CheckCircle size={14} weight="fill" />
                <span>{appliedVoucher.code}</span>
              </div>
              <p className="text-[11px] text-emerald-500/90 mt-0.5">{appliedVoucher.desc}</p>
            </div>
            <button
              type="button"
              onClick={onRemoveVoucher}
              className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-600"
            >
              <X size={14} weight="bold" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã (VD: GEARTECH50)"
              value={voucherCode}
              onChange={(e) => onVoucherCodeChange(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:border-[#ff4655]"
            />
            <button
              type="button"
              onClick={() => onApplyVoucher()}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
        )}

        {voucherError && (
          <p className="text-[11px] text-[#ff4655] font-semibold mt-1.5 flex items-center gap-1">
            <Warning size={12} weight="bold" /> {voucherError}
          </p>
        )}

        {/* Suggestion hints from real Database */}
        {availableVouchers.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            <div className="text-[10px] text-zinc-400 font-semibold uppercase">
              Voucher khả dụng:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableVouchers.slice(0, 6).map((v) => (
                <button
                  key={v._id || v.code}
                  type="button"
                  onClick={() => {
                    onVoucherCodeChange(v.code)
                    onApplyVoucher(v.code)
                  }}
                  title={`${v.name || v.description} (Đơn từ ${formatPrice(v.minOrderValue || 0)})`}
                  className="text-[10px] px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-mono font-bold cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
                >
                  +{v.code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bảng tính tổng tiền */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2.5 text-xs">
        <div className="flex justify-between text-zinc-500">
          <span>Tổng tiền hàng:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-zinc-500">
          <span>Phí vận chuyển:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(currentShipping)}</span>
        </div>
        {appliedVoucher && (
          <div className="flex justify-between text-emerald-500 font-medium">
            <span>Khuyến mãi voucher:</span>
            <span>-{formatPrice(appliedVoucher.discount)}</span>
          </div>
        )}

        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
              Tổng thanh toán
            </span>
            <span className="text-[10px] text-zinc-400 font-medium">Đã bao gồm thuế GTGT</span>
          </div>
          <span className="text-xl font-black text-[#ff4655]">
            {formatPrice(finalTotal)}
          </span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[#ff4655] text-xs font-semibold flex items-center gap-2">
          <Warning size={16} weight="bold" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Nút đặt hàng */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-2xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-70 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Lock size={16} weight="bold" />
            <span>XÁC NHẬN ĐẶT HÀNG</span>
          </>
        )}
      </button>

      {/* Cam kết của GEARTECH */}
      <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-2 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
          <Info size={14} className="text-[#ff4655]" />
          <span>Cam kết chất lượng GEARTECH</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
          <li>100% Sản phẩm chính hãng, đầy đủ CO/CQ</li>
          <li>Đổi mới trong 30 ngày nếu có lỗi phần cứng</li>
          <li>Bảo hành tận nơi cho PC & Workstation</li>
        </ul>
      </div>
    </div>
  )
}

