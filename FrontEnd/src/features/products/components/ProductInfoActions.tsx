import React from 'react'
import {
  Star,
  ShoppingCart,
  ShoppingBag,
  Plus,
  Minus
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import type { ProductItem } from '../../../services/productService'

export interface ProductInfoActionsProps {
  product: ProductItem
  averageRating: number | string
  totalReviews: number
  quantity: number
  isAdding: boolean
  onIncrement: () => void
  onDecrement: () => void
  onAddToCart: () => void
  onBuyNow: () => void
}

export const ProductInfoActions: React.FC<ProductInfoActionsProps> = ({
  product,
  averageRating,
  totalReviews,
  quantity,
  isAdding,
  onIncrement,
  onDecrement,
  onAddToCart,
  onBuyNow
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 tracking-wider">
            {product.brand || 'CHÍNH HÃNG'}
          </span>
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[#ff4655] tracking-wider">
            {product.categoryName}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-white leading-tight">
          {product.title}
        </h1>

        {/* Rating & Sales */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs flex-wrap">
          <div className={`flex items-center gap-1 font-bold ${Number(averageRating) > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>
            <Star size={14} weight={Number(averageRating) > 0 ? 'fill' : 'regular'} />
            <span>{Number(averageRating) > 0 ? Number(averageRating).toFixed(1) : '0.0'}</span>
          </div>
          <span className="text-zinc-400">|</span>
          <span className="text-zinc-500 font-medium">
            {totalReviews > 0 ? `${totalReviews} Đánh giá` : 'Chưa có đánh giá'}
          </span>
          <span className="text-zinc-400">|</span>
          <span className="text-emerald-500 font-bold font-mono">{product.salesCount || 'ĐÃ BÁN 0'}</span>
        </div>
      </div>

      {/* Price Showcase */}
      <div className="p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-baseline gap-4 shadow-sm">
        <span className="text-2xl sm:text-3xl font-black text-[#ff4655]">
          {formatPrice(product.price)}
        </span>
        {product.oldPrice && product.oldPrice > product.price && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-zinc-400 line-through">
              {formatPrice(product.oldPrice)}
            </span>
            <span className="bg-red-500/10 text-[#ff4655] border border-red-500/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">
              Tiết kiệm {formatPrice(product.oldPrice - product.price)}
            </span>
          </div>
        )}
      </div>

      {/* Quantity Selector */}
      {product.status === 'active' && product.stock > 0 && (
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Số lượng:</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={onDecrement}
                disabled={quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="w-12 text-center text-xs font-black">{quantity}</span>
              <button
                type="button"
                onClick={onIncrement}
                disabled={quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-xs text-zinc-400 font-medium">
              (Còn <strong className="text-emerald-500 font-bold">{product.stock}</strong> thiết bị trong kho)
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {product.status === 'hidden' || product.status === 'inactive' ? (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs font-bold text-amber-500 uppercase tracking-wider">
          <span>⚠️ SẢN PHẨM HIỆN ĐANG TẠM NGỪNG KINH DOANH</span>
        </div>
      ) : product.status === 'out_of_stock' || product.stock <= 0 ? (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center text-xs font-bold text-rose-500 uppercase tracking-wider">
          <span>✕ SẢN PHẨM TẠM THỜI HẾT HÀNG TRONG KHO</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button 
            type="button"
            onClick={onAddToCart}
            disabled={isAdding}
            className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 text-zinc-800 dark:text-zinc-200 font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-98 shadow-sm cursor-pointer"
          >
            <ShoppingCart size={17} weight="bold" className="text-[#ff4655]" /> {isAdding ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ'}
          </button>
          
          <button 
            type="button"
            onClick={onBuyNow}
            disabled={isAdding}
            className="flex-1 bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-lg shadow-[#ff4655]/25 hover:shadow-xl hover:shadow-[#ff4655]/40 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <ShoppingBag size={17} weight="bold" /> {isAdding ? 'ĐANG XỬ LÝ...' : 'MUA NGAY'}
          </button>
        </div>
      )}
    </div>
  )
}

