import { Trash } from '@phosphor-icons/react'
import type { HomepageSection } from '../../../../../services/homepageService'

interface DeleteSectionModalProps {
  isOpen: boolean
  section: HomepageSection | null
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteSectionModal({
  isOpen,
  section,
  onClose,
  onConfirm
}: DeleteSectionModalProps) {
  if (!isOpen || !section) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
            <Trash size={20} weight="bold" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
              Xác nhận xóa khu vực?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Bạn có chắc muốn xóa "{section.title}" khỏi bố cục?
            </p>
          </div>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg leading-relaxed">
          Lưu ý: Xóa khu vực này chỉ gỡ vị trí hiển thị khỏi trang chủ, <strong>hoàn toàn không làm ảnh hưởng</strong> tới sản phẩm, danh mục hay dữ liệu của các shop đối tác.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
          >
            Xóa khu vực
          </button>
        </div>
      </div>
    </div>
  )
}
