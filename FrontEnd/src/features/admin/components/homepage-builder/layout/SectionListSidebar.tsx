import { CaretDown, CaretUp, Copy, Plus, SquaresFour, Trash } from '@phosphor-icons/react'
import { SECTION_TYPE_INFO } from '../../../config/homepageSections'
import type { HomepageSection } from '../../../../../services/homepageService'

interface SectionListSidebarProps {
  sections: HomepageSection[]
  selectedKey: string | null
  onSelectKey: (key: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onToggleStatus: (key: string) => void
  onDuplicateSection: (sec: HomepageSection) => void
  onRequestDeleteSection: (sec: HomepageSection) => void
  onOpenAddModal: () => void
  className?: string
}

function getScheduleStatus(sec: HomepageSection) {
  if (sec.status === 'inactive') {
    return { label: 'Đã tắt', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
  }
  if (!sec.schedule?.isScheduled) {
    return { label: 'Đang hiển thị', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
  }

  const now = new Date()
  const { startDate, endDate } = sec.schedule
  if (startDate && new Date(startDate) > now) {
    return { label: 'Đã lên lịch', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
  }
  if (endDate && new Date(endDate) < now) {
    return { label: 'Đã kết thúc', color: 'bg-red-500/10 text-red-500 border-red-500/20' }
  }
  return { label: 'Đang diễn ra', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
}

export default function SectionListSidebar({
  sections,
  selectedKey,
  onSelectKey,
  onMoveUp,
  onMoveDown,
  onToggleStatus,
  onDuplicateSection,
  onRequestDeleteSection,
  onOpenAddModal,
  className = ''
}: SectionListSidebarProps) {
  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
            <SquaresFour size={15} weight="bold" className="text-[#ff4655]" />
            Các khu vực hiển thị ({sections.length})
          </h2>
          <span className="text-[10px] text-zinc-400">Sắp xếp thứ tự từ trên xuống dưới trang chủ</span>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-2.5 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded text-[11px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all shadow-sm"
        >
          <Plus size={13} weight="bold" />
          <span>Thêm khu vực</span>
        </button>
      </div>

      {/* Section Items List */}
      <div className="space-y-2">
        {sections.map((sec, idx) => {
          const typeInfo = SECTION_TYPE_INFO[sec.type] || SECTION_TYPE_INFO.category_products
          const TypeIcon = typeInfo.icon
          const isSelected = sec.sectionKey === selectedKey
          const scheduleStatus = getScheduleStatus(sec)

          return (
            <div
              key={sec.sectionKey}
              onClick={() => onSelectKey(sec.sectionKey)}
              className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-zinc-50 dark:bg-zinc-800/90 border-[#ff4655] shadow-sm'
                  : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Reorder Buttons (Move Up / Down) */}
                <div className="flex flex-col gap-0.5 shrink-0" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => onMoveUp(idx)}
                    disabled={idx === 0}
                    title="Di chuyển lên trên"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <CaretUp size={12} weight="bold" />
                  </button>
                  <button
                    onClick={() => onMoveDown(idx)}
                    disabled={idx === sections.length - 1}
                    title="Di chuyển xuống dưới"
                    className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    <CaretDown size={12} weight="bold" />
                  </button>
                </div>

                {/* Type Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${typeInfo.color}`}>
                  <TypeIcon size={16} weight="bold" />
                </div>

                {/* Section Title & Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-zinc-400">#{idx + 1}</span>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {sec.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[9px] font-mono text-zinc-400 uppercase">
                      {typeInfo.label}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${scheduleStatus.color}`}>
                      {scheduleStatus.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions (Toggle & Delete) */}
              <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => onDuplicateSection(sec)}
                  title="Nhân bản khu vực này"
                  className="p-1.5 text-zinc-400 hover:text-blue-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Copy size={13} weight="bold" />
                </button>
                <button
                  onClick={() => onRequestDeleteSection(sec)}
                  title="Xóa khu vực"
                  className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <Trash size={13} weight="bold" />
                </button>
                <button
                  onClick={() => onToggleStatus(sec.sectionKey)}
                  title={sec.status === 'active' ? 'Đang bật (bấm để tắt)' : 'Đang tắt (bấm để bật)'}
                  className={`w-7 h-4 rounded-full transition-colors relative cursor-pointer ${
                    sec.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                      sec.status === 'active' ? 'left-3.5' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
