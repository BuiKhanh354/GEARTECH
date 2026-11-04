import { ArrowClockwise, CheckCircle } from '@phosphor-icons/react'

interface PublishSectionModalProps {
  isOpen: boolean
  publishing: boolean
  publishedVersion: number
  activeCount: number
  totalCount: number
  onClose: () => void
  onConfirm: () => void
}

export default function PublishSectionModal({
  isOpen,
  publishing,
  publishedVersion,
  activeCount,
  totalCount,
  onClose,
  onConfirm
}: PublishSectionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 flex items-center justify-center shrink-0">
            <CheckCircle size={22} weight="bold" />
          </span>
          <div>
            <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
              Xác nhận xuất bản trang chủ?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Bản nháp hiện tại sẽ trở thành giao diện chính thức cho toàn bộ khách hàng.
            </p>
          </div>
        </div>

        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
          <p>Phiên bản tiếp theo: <strong>v{publishedVersion + 1}</strong></p>
          <p>Tổng số khu vực hoạt động: <strong>{activeCount} / {totalCount}</strong></p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={publishing}
            className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold cursor-pointer"
          >
            Xem lại
          </button>
          <button
            onClick={onConfirm}
            disabled={publishing}
            className="px-5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
          >
            {publishing ? (
              <ArrowClockwise size={14} className="animate-spin" />
            ) : (
              <CheckCircle size={14} weight="bold" />
            )}
            <span>Đồng ý xuất bản</span>
          </button>
        </div>
      </div>
    </div>
  )
}

