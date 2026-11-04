import { Flame } from '@phosphor-icons/react'
import type { HomepageSection } from '../../../../../services/homepageService'

interface FlashSaleEditorProps {
  section: HomepageSection
  onUpdateConfig: (key: string, configUpdates: any) => void
}

export default function FlashSaleEditor({
  section,
  onUpdateConfig
}: FlashSaleEditorProps) {
  const countdownEndValue = section.config.countdownEnd
    ? new Date(section.config.countdownEnd).toISOString().slice(0, 16)
    : ''

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
        <Flame size={15} className="text-amber-500" weight="bold" />
        2. Cấu hình chương trình Giờ Vàng Flash Deals
      </h3>

      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Thời điểm kết thúc đếm ngược (Countdown End)
            </label>
            <input
              type="datetime-local"
              value={countdownEndValue}
              onChange={e =>
                onUpdateConfig(section.sectionKey, {
                  countdownEnd: e.target.value ? new Date(e.target.value).toISOString() : null
                })
              }
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Số lượng deal flash sale (Tối đa 10)
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={section.config.limit || 5}
              onChange={e => onUpdateConfig(section.sectionKey, { limit: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
