import { Images, Plus, UploadSimple } from '@phosphor-icons/react'
import type { HomepageSection, HomepageBannerItem } from '../../../../../services/homepageService'

interface BannerSliderEditorProps {
  section: HomepageSection
  onUpdateConfig: (key: string, configUpdates: any) => void
  onUploadBannerImage: (bannerIdx: number, file: File) => Promise<void>
}

export default function BannerSliderEditor({
  section,
  onUpdateConfig,
  onUploadBannerImage
}: BannerSliderEditorProps) {
  const banners: HomepageBannerItem[] = section.config.banners || []

  const handleAddBanner = () => {
    const newBanner: HomepageBannerItem = {
      title: 'BANNER CHIẾN HẠM MỚI',
      badge: 'NEW ARRIVAL',
      subtitle: 'FPS 240+ RAY TRACING',
      description: 'Trang bị cấu hình tối tân nhất đạt chuẩn thi đấu esports.',
      priceTag: 'Ưu đãi có hạn',
      ctaText: 'Khám phá ngay',
      link: '/ProductPage',
      imageUrl: '',
      bgGradient: 'from-zinc-950 via-zinc-900 to-black',
      status: 'active'
    }
    onUpdateConfig(section.sectionKey, { banners: [...banners, newBanner] })
  }

  const handleDeleteBanner = (idx: number) => {
    const filtered = banners.filter((_: HomepageBannerItem, i: number) => i !== idx)
    onUpdateConfig(section.sectionKey, { banners: filtered })
  }

  const handleUpdateBannerField = (idx: number, field: keyof HomepageBannerItem, value: any) => {
    const updated = banners.map((b: HomepageBannerItem, i: number) => (i === idx ? { ...b, [field]: value } : b))
    onUpdateConfig(section.sectionKey, { banners: updated })
  }

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
          <Images size={15} className="text-[#ff4655]" weight="bold" />
          2. Quản lý danh sách banner quảng bá
        </h3>

        <button
          onClick={handleAddBanner}
          className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <Plus size={12} weight="bold" />
          <span>Thêm banner</span>
        </button>
      </div>

      <div className="space-y-4">
        {banners.map((b: HomepageBannerItem, bIdx: number) => (
          <div
            key={bIdx}
            className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Banner #{bIdx + 1}
              </span>
              <button
                onClick={() => handleDeleteBanner(bIdx)}
                className="text-red-500 hover:text-red-600 text-xs font-bold cursor-pointer"
              >
                Xóa banner này
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Tiêu đề chính</label>
                <input
                  type="text"
                  value={b.title}
                  onChange={e => handleUpdateBannerField(bIdx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Huy hiệu góc (Badge)</label>
                <input
                  type="text"
                  value={b.badge}
                  onChange={e => handleUpdateBannerField(bIdx, 'badge', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Phụ đề (Tagline)</label>
                <input
                  type="text"
                  value={b.subtitle}
                  onChange={e => handleUpdateBannerField(bIdx, 'subtitle', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Giá / Ưu đãi (Price Tag)</label>
                <input
                  type="text"
                  value={b.priceTag}
                  onChange={e => handleUpdateBannerField(bIdx, 'priceTag', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Mô tả chi tiết</label>
                <textarea
                  rows={2}
                  value={b.description}
                  onChange={e => handleUpdateBannerField(bIdx, 'description', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Chữ nút bấm (CTA)</label>
                <input
                  type="text"
                  value={b.ctaText}
                  onChange={e => handleUpdateBannerField(bIdx, 'ctaText', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Link chuyển hướng khi click</label>
                <input
                  type="text"
                  value={b.link}
                  onChange={e => handleUpdateBannerField(bIdx, 'link', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>

              {/* Image Upload or URL */}
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">
                  Hình ảnh banner (Tải lên file hoặc nhập URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={b.imageUrl || ''}
                    onChange={e => handleUpdateBannerField(bIdx, 'imageUrl', e.target.value)}
                    placeholder="https://... hoặc tải ảnh từ máy tính"
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                  />
                  <label className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-xs font-bold text-zinc-800 dark:text-zinc-200 cursor-pointer flex items-center gap-1 transition-colors">
                    <UploadSimple size={14} weight="bold" />
                    <span>Tải ảnh</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        if (e.target.files && e.target.files[0]) {
                          onUploadBannerImage(bIdx, e.target.files[0])
                        }
                      }}
                    />
                  </label>
                </div>
                {b.imageUrl && (
                  <div className="mt-2 h-20 w-44 rounded overflow-hidden border border-zinc-300 dark:border-zinc-700">
                    <img src={b.imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
