import { Eye, SquaresFour } from '@phosphor-icons/react'

interface WorkspaceTabSwitcherProps {
  activeTab: 'builder' | 'live_preview'
  onTabChange: (tab: 'builder' | 'live_preview') => void
  activeSectionsCount: number
}

export default function WorkspaceTabSwitcher({
  activeTab,
  onTabChange,
  activeSectionsCount
}: WorkspaceTabSwitcherProps) {
  return (
    <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
      <button
        onClick={() => onTabChange('builder')}
        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
          activeTab === 'builder'
            ? 'bg-[#ff4655] text-white shadow-md'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800'
        }`}
      >
        <SquaresFour size={15} weight="bold" />
        <span>1. Bộ dựng bố cục (Builder)</span>
      </button>

      <button
        onClick={() => onTabChange('live_preview')}
        className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
          activeTab === 'live_preview'
            ? 'bg-blue-600 text-white shadow-md'
            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800'
        }`}
      >
        <Eye size={15} weight="bold" />
        <span>2. Xem trước trực quan toàn trang ({activeSectionsCount} khu vực hoạt động)</span>
      </button>
    </div>
  )
}

