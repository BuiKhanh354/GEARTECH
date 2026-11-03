import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { WarningCircle, ArrowsClockwise } from '@phosphor-icons/react'

export interface ProductDeleteModalProps {
  isOpen: boolean
  deletingProduct: any | null
  actionLoadingId: string | null
  onClose: () => void
  onConfirm: () => void
}

export const ProductDeleteModal: React.FC<ProductDeleteModalProps> = ({
  isOpen,
  deletingProduct,
  actionLoadingId,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !deletingProduct) return null

  const prodId = deletingProduct._id || deletingProduct.id
  const isDeleting = actionLoadingId === prodId

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
        >
          <div className="flex items-center gap-3 text-red-500">
            <div className="p-3 bg-red-500/10 rounded-full">
              <WarningCircle size={28} weight="bold" />
            </div>
            <div>
              <h4 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Xác nhận gỡ sản phẩm?
              </h4>
              <p className="text-xs text-zinc-500">Hành động này sẽ xóa hoặc ngừng kinh doanh sản phẩm</p>
            </div>
          </div>

          <div className="text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/60 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-2">
            <p>
              Sản phẩm: <strong className="text-zinc-900 dark:text-white">{deletingProduct.title || deletingProduct.name}</strong>
            </p>
            <p className="text-[11px] text-zinc-500 italic">
              * Theo quy tắc an toàn dữ liệu: Nếu sản phẩm đã từng có khách đặt hàng, hệ thống sẽ tự động chuyển sang trạng thái <strong>&quot;Ngừng kinh doanh&quot; (inactive)</strong> để bảo toàn toàn vẹn lịch sử đơn hàng.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded font-semibold text-xs transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded font-bold uppercase text-xs flex items-center gap-1.5 transition-colors"
            >
              {isDeleting && (
                <ArrowsClockwise size={14} className="animate-spin" />
              )}
              Xác nhận xóa
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

