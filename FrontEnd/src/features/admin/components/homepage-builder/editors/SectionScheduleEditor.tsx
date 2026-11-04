import { Clock, Warning } from '@phosphor-icons/react'
import type { HomepageSection } from '../../../../../services/homepageService'

interface SectionScheduleEditorProps {
  section: HomepageSection
  onUpdateSection: (key: string, updates: Partial<HomepageSection>) => void
}

export default function SectionScheduleEditor({
  section,
  onUpdateSection
}: SectionScheduleEditorProps) {
  const isScheduled = section.schedule?.isScheduled ?? false
  const startDate = section.schedule?.startDate
  const endDate = section.schedule?.endDate

  const isInvalidRange =
    startDate &&
    endDate &&
    new Date(endDate) <= new Date(startDate)

  return (
    <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Clock size={15} className="text-amber-500" weight="bold" />
            3. Lên lịch hiển thị theo thời gian (Schedule)
          </h3>
          <span className="text-[10px] text-zinc-400">
            Tự động hiển thị và kết thúc theo ngày giờ chỉ định. Qua giờ kết thúc sẽ tự động ẩn khỏi trang chủ.
          </span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={e =>
              onUpdateSection(section.sectionKey, {
                schedule: {
                  isScheduled: e.target.checked,
                  startDate: startDate || null,
                  endDate: endDate || null
                }
              })
            }
            className="rounded text-[#ff4655] focus:ring-0 w-4 h-4 cursor-pointer"
          />
          <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
            Bật hẹn giờ
          </span>
        </label>
      </div>

      {isScheduled && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Thời gian bắt đầu hiển thị
              </label>
              <input
                type="datetime-local"
                value={startDate ? new Date(startDate).toISOString().slice(0, 16) : ''}
                onChange={e =>
                  onUpdateSection(section.sectionKey, {
                    schedule: {
                      isScheduled: true,
                      startDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                      endDate: endDate || null
                    }
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Thời gian kết thúc hiển thị
              </label>
              <input
                type="datetime-local"
                value={endDate ? new Date(endDate).toISOString().slice(0, 16) : ''}
                onChange={e =>
                  onUpdateSection(section.sectionKey, {
                    schedule: {
                      isScheduled: true,
                      startDate: startDate || null,
                      endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                    }
                  })
                }
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {isInvalidRange && (
            <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
              <Warning size={13} weight="fill" /> Thời điểm kết thúc phải sau thời điểm bắt đầu.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
