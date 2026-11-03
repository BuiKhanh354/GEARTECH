import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkle, Plus } from '@phosphor-icons/react'
import { SafeProductImage } from '../../../components/common/ProductImage'
import { formatPrice } from '../../../utils/format'
import type { ProductItem } from '../../../services/productService'

export interface CartSuggestionsProps {
  suggestions: ProductItem[]
  onAddSuggestion: (product: ProductItem) => void
}

export const CartSuggestions: React.FC<CartSuggestionsProps> = ({
  suggestions,
  onAddSuggestion
}) => {
  if (suggestions.length === 0) return null

  return (
    <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#ff4655] mb-1">
            <Sparkle size={14} weight="fill" />
            <span>PHỤ KIỆN HOT MUA KÈM</span>
          </div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">
            GỢI Ý DÀNH RIÊNG CHO BẠN
          </h2>
        </div>
        <Link
          to="/ProductPage"
          className="text-xs font-bold text-[#ff4655] hover:underline flex items-center gap-1"
        >
          Xem tất cả &raquo;
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {suggestions.map((p) => (
          <div
            key={p._id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-[#ff4655]/40 transition-all hover:shadow-lg shadow-sm"
          >
            <div>
              <Link
                to={`/product/${p._id || p.id}`}
                className="block w-full h-36 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden mb-3 p-2 relative group hover:scale-[1.02] transition-transform"
              >
                <SafeProductImage
                  src={(p.gallery && p.gallery.length > 0) ? p.gallery[0] : (p.image || p.imageEmoji)}
                  alt={p.name || p.title}
                  className="w-full h-full object-contain"
                  containerClassName="w-full h-full flex items-center justify-center"
                  fallbackIcon={p.imageEmoji || '📦'}
                />
              </Link>
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                {p.categoryName}
              </span>
              <Link
                to={`/product/${p._id || p.id}`}
                className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 hover:text-[#ff4655] transition-colors mt-0.5 block"
              >
                {p.name || p.title}
              </Link>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
              <div className="text-xs font-black text-[#ff4655]">
                {formatPrice(p.price)}
              </div>
              <button
                type="button"
                onClick={() => onAddSuggestion(p)}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus size={12} weight="bold" /> Thêm
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

