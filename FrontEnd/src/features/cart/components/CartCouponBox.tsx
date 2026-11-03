import React from 'react'
import { Link } from 'react-router-dom'
import { Tag, CheckCircle, X, Warning, ArrowRight } from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import type { VoucherItem } from '../../../services/voucherService'

export interface AppliedCoupon {
  code: string
  discount: number
  desc: string
}

export interface CartCouponBoxProps {
  couponCode: string
  appliedCoupon: AppliedCoupon | null
  couponError: string
  availableVouchers: VoucherItem[]
  onCouponCodeChange: (code: string) => void
  onApplyCoupon: (code?: string) => void
  onRemoveCoupon: () => void
}

export const CartCouponBox: React.FC<CartCouponBoxProps> = ({
  couponCode,
  appliedCoupon,
  couponError,
  availableVouchers,
  onCouponCodeChange,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Tag size={18} className="text-[#ff4655]" weight="bold" />
        <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
          Mã khuyến mãi GEARTECH
        </h3>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <div>
            <div className="flex items-center gap-1.5 font-black text-xs">
              <CheckCircle size={16} weight="fill" />
              <span>{appliedCoupon.code}</span>
            </div>
            <p className="text-[11px] text-emerald-500/90 mt-0.5">{appliedCoupon.desc}</p>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-600 cursor-pointer"
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="MÃ GIẢM GIÁ"
              value={couponCode}
              onChange={(e) => onCouponCodeChange(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:border-[#ff4655]"
            />
            <button
              type="button"
              onClick={() => onApplyCoupon()}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>
          {couponError && (
            <p className="text-[11px] text-[#ff4655] font-semibold mt-1.5 flex items-center gap-1">
              <Warning size={12} weight="bold" /> {couponError}
            </p>
          )}
        </div>
      )}

      {/* Gợi ý voucher */}
      {availableVouchers.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>Gợi ý mã ưu đãi:</span>
            <Link to="/khuyen-mai" className="text-[#2563EB] hover:underline font-semibold flex items-center gap-1">
              Xem thêm voucher <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableVouchers.slice(0, 6).map((v) => (
              <button
                key={v._id}
                type="button"
                onClick={() => {
                  onCouponCodeChange(v.code)
                  onApplyCoupon(v.code)
                }}
                title={`${v.name || v.description} (Đơn từ ${formatPrice(v.minOrderValue || 0)})`}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#2563EB] hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors font-mono font-bold cursor-pointer border border-zinc-200/60 dark:border-zinc-700/60"
              >
                +{v.code}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

