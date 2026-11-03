import React from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  Trash,
  Plus,
  Minus,
  ShieldCheck,
  Warning,
  Storefront
} from '@phosphor-icons/react'
import { SafeProductImage } from '../../../components/common/ProductImage'
import { formatPrice } from '../../../utils/format'
import type { CartStoreItem } from '../../../store/cartStore'

function formatRemainingTime(ms?: number) {
  if (!ms || ms <= 0) return 'sắp hết hạn'
  const totalMinutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`
  }
  return `${minutes} phút`
}

export interface CartItemRowProps {
  item: CartStoreItem
  onToggleSelect: (productId: string) => void
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveItem: (productId: string, title: string) => void
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onToggleSelect,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const pId = item.productId || item.id

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
        item.selected
          ? 'border-[#ff4655]/40 shadow-[0_0_15px_rgba(255,70,85,0.06)]'
          : 'border-zinc-200/80 dark:border-zinc-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Checkbox & Ảnh */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <input
            type="checkbox"
            checked={item.selected}
            onChange={() => onToggleSelect(pId)}
            className="w-4 h-4 accent-[#ff4655] rounded cursor-pointer"
          />
          <Link
            to={`/product/${pId}`}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 hover:scale-105 transition-transform overflow-hidden"
          >
            <SafeProductImage
              src={item.imageEmoji}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </Link>
          
          {/* Info on Mobile */}
          <div className="flex-1 sm:hidden">
            <Link
              to={`/product/${pId}`}
              className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 hover:text-[#ff4655] transition-colors"
            >
              {item.title}
            </Link>
            {item.isPriceLocked && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  <ShieldCheck size={10} weight="bold" /> Giữ giá: còn {formatRemainingTime(item.priceLockRemainingMs)}
                </span>
              </div>
            )}
            {item.unavailableReason && (
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-0.5">
                <Warning size={10} weight="bold" /> {item.unavailableReason}
              </span>
            )}
            <span className="text-[10px] text-zinc-400 block mt-0.5">{item.variant}</span>
            <div className="text-xs font-black text-[#ff4655] mt-1">
              {formatPrice(item.price)}
            </div>
          </div>
        </div>

        {/* Info on Desktop */}
        <div className="hidden sm:block flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              {item.categoryName}
            </span>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
              <Storefront size={12} /> {item.shopName}
            </span>
          </div>
          <Link
            to={`/product/${pId}`}
            className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 hover:text-[#ff4655] transition-colors mt-1 block"
          >
            {item.title}
          </Link>
          {item.isPriceLocked && (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <ShieldCheck size={12} weight="bold" /> Giữ giá ưu đãi: còn {formatRemainingTime(item.priceLockRemainingMs)}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-[10px] font-bold text-emerald-500">
                  Tiết kiệm {formatPrice(item.originalPrice - item.price)}/sp
                </span>
              )}
            </div>
          )}
          {item.unavailableReason && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
              <Warning size={12} weight="bold" /> {item.unavailableReason}
            </span>
          )}
          <span className="text-xs text-zinc-400 block mt-0.5 font-medium">
            Cấu hình: {item.variant}
          </span>
        </div>

        {/* Đơn giá */}
        <div className="hidden sm:block text-right w-28">
          {item.oldPrice && (
            <div className="text-xs font-bold text-zinc-400 line-through">
              {formatPrice(item.oldPrice)}
            </div>
          )}
          <div className="text-sm font-black text-zinc-900 dark:text-white">
            {formatPrice(item.price)}
          </div>
        </div>

        {/* Bộ tăng giảm số lượng & Thành tiền */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-1">
            <button
              type="button"
              onClick={() => onUpdateQuantity(pId, -1)}
              className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Minus size={12} weight="bold" />
            </button>
            <span className="w-9 text-center text-xs font-black text-zinc-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(pId, 1)}
              className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              <Plus size={12} weight="bold" />
            </button>
          </div>

          <div className="text-right sm:w-28">
            <span className="text-[10px] text-zinc-400 block sm:hidden">Thành tiền:</span>
            <span className="text-sm font-black text-[#ff4655]">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>

          {/* Nút xóa */}
          <button
            type="button"
            onClick={() => onRemoveItem(pId, item.title)}
            className="p-2 text-zinc-400 hover:text-[#ff4655] hover:bg-[#ff4655]/10 rounded-xl transition-all cursor-pointer"
            title="Xóa khỏi giỏ hàng"
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

