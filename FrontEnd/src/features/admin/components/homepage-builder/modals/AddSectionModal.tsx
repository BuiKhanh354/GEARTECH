import { Plus, X } from '@phosphor-icons/react'
import { SECTION_TYPE_INFO } from '../../../config/homepageSections'
import type { SectionType } from '../../../../../services/homepageService'

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAddSection: (type: SectionType) => void
}

export default function AddSectionModal({
  isOpen,
  onClose,
  onAddSection
}: AddSectionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h3 className="text-base font-black uppercase text-zinc-900 dark:text-white">
              Thêm khu vực nội dung mới
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Chọn loại khu vực phù hợp để đưa lên trang chủ GearTech
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {(Object.keys(SECTION_TYPE_INFO) as SectionType[]).map(type => {
            const info = SECTION_TYPE_INFO[type]
            const Icon = info.icon

            return (
              <div
                key={type}
                onClick={() => onAddSection(type)}
                className="p-3.5 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 hover:border-[#ff4655] rounded-xl cursor-pointer transition-all flex items-center gap-3 group"
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${info.color}`}>
                  <Icon size={20} weight="bold" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors">
                    {info.label}
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                    {info.desc}
                  </p>
                </div>
                <Plus size={16} className="text-zinc-400 group-hover:text-[#ff4655] transition-colors" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
