import React from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from '@phosphor-icons/react'

export const CartEmptyState: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm my-8"
    >
      <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-6 text-4xl">
        🛒
      </div>
      <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">
        Giỏ hàng của bạn đang trống!
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
        Bạn chưa thêm thiết bị công nghệ nào vào giỏ. Hãy dạo quanh cửa hàng và chọn những món phụ kiện hoặc PC ưng ý nhất nhé!
      </p>
      <Link
        to="/ProductPage"
        className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-[#ff4655]/25 transition-all active:scale-95"
      >
        <ArrowLeft size={16} weight="bold" /> Khám phá sản phẩm ngay
      </Link>
    </motion.div>
  )
}

