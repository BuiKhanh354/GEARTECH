import { motion } from 'motion/react'
import { Storefront, Info } from '@phosphor-icons/react'

interface ShopOverviewTabProps {
  currentUser: any;
  currentShop: any;
  allProducts: any[];
}

export default function ShopOverviewTab({ currentUser, currentShop, allProducts }: ShopOverviewTabProps) {
  return (
    <motion.div
      key="shop-overview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Storefront size={16} className="text-[#ff4655]" />
          QUẢN LÝ THÔNG TIN GIAN HÀNG DOANH NGHIỆP
        </h3>
        <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20 uppercase tracking-widest font-black">
          🏬 GIAN HÀNG ĐỐI TÁC
        </span>
      </div>

      {/* Shop detail presentation */}
      <div className={`p-6 rounded-lg bg-gradient-to-r ${currentShop?.bgClass || 'from-zinc-900 to-black'} text-white space-y-4 shadow-xl border border-zinc-800`}>
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-md bg-white/10 backdrop-blur-md text-4xl flex items-center justify-center border border-white/20 shadow-inner">
            {currentShop?.logo}
          </span>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest leading-none">{currentShop?.name}</h4>
            <p className="text-[10px] text-zinc-300 font-semibold mt-1.5">{currentShop?.category}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
          <div>
            <span className="text-[8px] text-white/40 block uppercase tracking-wider">ĐÁNH GIÁ SHOP</span>
            <span className="text-xs font-black text-amber-400 mt-1 block">⭐ {currentShop?.rating || '5.0'} / 5.0</span>
          </div>
          <div>
            <span className="text-[8px] text-white/40 block uppercase tracking-wider">NGƯỜI THEO DÕI</span>
            <span className="text-xs font-black mt-1 block">{currentShop?.followers || '1.2K'}</span>
          </div>
          <div>
            <span className="text-[8px] text-white/40 block uppercase tracking-wider">THIẾT BỊ ĐĂNG BÁN</span>
            <span className="text-xs font-black text-yellow-500 mt-1 block">{allProducts.length} SẢN PHẨM</span>
          </div>
        </div>
      </div>

      <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-3">
        <h4 className="text-[10px] font-black tracking-widest text-zinc-500 dark:text-zinc-400 uppercase flex items-center gap-1">
          <Info size={14} /> // CƠ CHẾ ĐĂNG BÁN TỰ ĐỘNG BẢO MẬT
        </h4>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Mã liên kết cửa hàng **(ShopID: {currentUser?.shopId})** của bạn đã được gắn cứng vào tài khoản. Khi bạn đăng bán sản phẩm mới ở tab tiếp theo, hệ thống API Backend sẽ tự động đọc Token và gán sản phẩm đó cho thương hiệu **{currentShop?.name}** để đảm bảo bảo mật dữ liệu.
        </p>
      </div>
    </motion.div>
  )
}
