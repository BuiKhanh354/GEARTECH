import React from 'react'
import { Link } from 'react-router-dom'
import { UserCheck, UserPlus, Storefront } from '@phosphor-icons/react'

export interface ProductShopCardProps {
  shopLogo: any
  shopName: string
  shopRating: number | string
  shopFollowersCount: number
  isFollowingShop: boolean
  shopIdValue: string
  onToggleFollowShop: () => void
}

export const ProductShopCard: React.FC<ProductShopCardProps> = ({
  shopLogo,
  shopName,
  shopRating,
  shopFollowersCount,
  isFollowingShop,
  shopIdValue,
  onToggleFollowShop
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
          {shopLogo}
        </div>
        <div>
          <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-wider">
            {shopName}
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-[#ff4655] text-white">CHÍNH HÃNG</span>
          </h4>
          <div className="flex gap-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
            <span className="text-amber-500">★ {shopRating} ĐÁNH GIÁ</span>
            <span>{shopFollowersCount} FOLLOWER</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onToggleFollowShop}
          className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all cursor-pointer ${
            isFollowingShop
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
              : 'bg-[#ff4655] text-white hover:bg-[#e03d4b]'
          }`}
        >
          {isFollowingShop ? <UserCheck size={14} /> : <UserPlus size={14} />}
          {isFollowingShop ? 'Đang theo dõi' : 'Theo dõi shop'}
        </button>
        <Link
          to={shopIdValue ? `/shop/${shopIdValue}` : `/ProductPage?search=${encodeURIComponent(shopName)}`}
          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Storefront size={14} /> Xem Shop
        </Link>
      </div>
    </div>
  )
}

