import { ArrowClockwise, CheckCircle, Eye, FloppyDisk, Warning } from '@phosphor-icons/react'

interface BuilderHeaderProps {
  publishedVersion: number
  publishedAt: string | null
  hasUnsavedChanges: boolean
  saving: boolean
  publishing: boolean
  onRestoreDefault: () => void
  onOpenPreview: () => void
  onSaveDraft: () => void
  onOpenPublishModal: () => void
}

export default function BuilderHeader({
  publishedVersion,
  publishedAt,
  hasUnsavedChanges,
  saving,
  publishing,
  onRestoreDefault,
  onOpenPreview,
  onSaveDraft,
  onOpenPublishModal
}: BuilderHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-ping" />
          <h1 className="text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-white flex items-center gap-2">
            Homepage Builder // Quản Lý Bố Cục Trang Chủ
          </h1>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
            v{publishedVersion}
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Tự do cấu hình, sắp xếp khu vực PC, Laptop, Mac hoặc các danh mục thực tế từ database. Xuất bản an toàn không sửa source code.
        </p>
        {publishedAt && (
          <p className="text-[10px] text-zinc-400 font-mono">
            Phiên bản hiện tại xuất bản lúc: {new Date(publishedAt).toLocaleString('vi-VN')}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        {hasUnsavedChanges && (
          <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
            <Warning size={13} weight="fill" /> Có thay đổi chưa lưu
          </span>
        )}

        <button
          onClick={onRestoreDefault}
          title="Khôi phục về bố cục chuẩn ban đầu"
          className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowClockwise size={14} weight="bold" />
          <span className="hidden sm:inline">Khôi phục mặc định</span>
        </button>

        <button
          onClick={onOpenPreview}
          className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Eye size={14} weight="bold" />
          <span>Xem trước</span>
        </button>

        <button
          onClick={onSaveDraft}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          {saving ? <ArrowClockwise size={14} className="animate-spin" /> : <FloppyDisk size={14} weight="bold" />}
          <span>Lưu bản nháp</span>
        </button>

        <button
          onClick={onOpenPublishModal}
          disabled={publishing}
          className="px-5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,70,85,0.4)] hover:shadow-[0_0_25px_rgba(255,70,85,0.6)] flex items-center gap-1.5 cursor-pointer"
        >
          <CheckCircle size={15} weight="bold" />
          <span>Xuất bản ngay</span>
        </button>
      </div>
    </div>
  )
}

