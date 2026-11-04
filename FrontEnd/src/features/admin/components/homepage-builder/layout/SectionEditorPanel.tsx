import { SECTION_TYPE_INFO, type HomepageCategoryOption } from '../../../config/homepageSections'
import type { HomepageSection } from '../../../../../services/homepageService'
import CategoryProductsEditor from '../editors/CategoryProductsEditor'
import BannerSliderEditor from '../editors/BannerSliderEditor'
import FlashSaleEditor from '../editors/FlashSaleEditor'
import ServiceFeaturesEditor from '../editors/ServiceFeaturesEditor'
import SectionScheduleEditor from '../editors/SectionScheduleEditor'

interface SectionEditorPanelProps {
  selectedSection: HomepageSection | null
  categories: HomepageCategoryOption[]
  onToggleStatus: (key: string) => void
  onUpdateSection: (key: string, updates: Partial<HomepageSection>) => void
  onUpdateConfig: (key: string, configUpdates: any) => void
  onUploadBannerImage: (bannerIdx: number, file: File) => Promise<void>
  onShowToast: (type: 'success' | 'error', message: string) => void
  className?: string
}

export default function SectionEditorPanel({
  selectedSection,
  categories,
  onToggleStatus,
  onUpdateSection,
  onUpdateConfig,
  onUploadBannerImage,
  onShowToast,
  className = ''
}: SectionEditorPanelProps) {
  if (!selectedSection) {
    return (
      <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 ${className}`}>
        Chọn một khu vực ở cột bên trái để chỉnh sửa cấu hình.
      </div>
    )
  }

  const typeInfo = SECTION_TYPE_INFO[selectedSection.type]

  return (
    <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-6 ${className}`}>
      {/* Editor Header */}
      <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 uppercase">
              {typeInfo?.label || selectedSection.type}
            </span>
            <span className="text-xs font-mono text-zinc-400">Key: {selectedSection.sectionKey}</span>
          </div>
          <h2 className="text-sm font-black uppercase text-zinc-900 dark:text-white mt-1">
            Cấu hình chi tiết khu vực
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-zinc-500">Trạng thái:</span>
          <button
            onClick={() => onToggleStatus(selectedSection.sectionKey)}
            className={`px-3 py-1 rounded text-xs font-bold uppercase transition-colors cursor-pointer ${
              selectedSection.status === 'active'
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/30'
            }`}
          >
            {selectedSection.status === 'active' ? 'Đang bật' : 'Đang tắt'}
          </button>
        </div>
      </div>

      {/* 1. General Fields (Tiêu đề, Phụ đề) */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">
          1. Thông tin chung khu vực
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Tiêu đề hiển thị trên trang chủ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={selectedSection.title}
              onChange={e => onUpdateSection(selectedSection.sectionKey, { title: e.target.value })}
              placeholder="VD: PC Gaming Chiến Hạm, Laptop..."
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#ff4655]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Mô tả / Phụ đề ngắn
            </label>
            <input
              type="text"
              value={selectedSection.subtitle || ''}
              onChange={e => onUpdateSection(selectedSection.sectionKey, { subtitle: e.target.value })}
              placeholder="VD: Cấu hình thi đấu tối tân..."
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#ff4655]"
            />
          </div>
        </div>
      </div>

      {/* 2. Type-Specific Config Form Router */}
      {selectedSection.type === 'category_products' && (
        <CategoryProductsEditor
          section={selectedSection}
          categories={categories}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {selectedSection.type === 'banner_slider' && (
        <BannerSliderEditor
          section={selectedSection}
          onUpdateConfig={onUpdateConfig}
          onUploadBannerImage={onUploadBannerImage}
        />
      )}

      {selectedSection.type === 'flash_sale' && (
        <FlashSaleEditor
          section={selectedSection}
          onUpdateConfig={onUpdateConfig}
        />
      )}

      {selectedSection.type === 'service_features' && (
        <ServiceFeaturesEditor
          section={selectedSection}
          onUpdateConfig={onUpdateConfig}
          onShowToast={onShowToast}
        />
      )}

      {/* 3. Schedule Settings */}
      <SectionScheduleEditor
        section={selectedSection}
        onUpdateSection={onUpdateSection}
      />
    </div>
  )
}
