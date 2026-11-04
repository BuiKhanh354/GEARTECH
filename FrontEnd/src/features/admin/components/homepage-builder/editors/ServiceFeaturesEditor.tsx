import { Tag } from '@phosphor-icons/react'
import type { HomepageSection, ServiceFeatureItem } from '../../../../../services/homepageService'

interface ServiceFeaturesEditorProps {
  section: HomepageSection
  onUpdateConfig: (key: string, configUpdates: any) => void
  onShowToast: (type: 'success' | 'error', message: string) => void
}

const DEFAULT_SERVICE_ITEMS: ServiceFeatureItem[] = [
  {
    id: 'feat_1',
    title: 'Build PC & Cấu Hình Đồ Họa',
    description: 'Đội ngũ kỹ sư build cấu hình tối ưu hiệu năng. Hỗ trợ trả góp 0% qua thẻ tín dụng và CCCD duyệt nhanh 5 phút.',
    badge: 'LÃI SUẤT 0%',
    badgeColor: 'red',
    icon: 'wrench',
    ctaText: 'BẮT ĐẦU BUILD NGAY',
    link: '/ProductPage?category=desktops'
  },
  {
    id: 'feat_2',
    title: 'Bảo Hành 1 Đổi 1 Tận Nơi',
    description: 'Đặc quyền 1 đổi 1 trong 30 ngày nếu phát sinh lỗi phần cứng từ nhà sản xuất. Hỗ trợ mượn máy thay thế khi bảo hành.',
    badge: '30 NGÀY VIP',
    badgeColor: 'blue',
    icon: 'shield',
    ctaText: 'TRA CỨU BẢO HÀNH',
    link: '/dich-vu'
  },
  {
    id: 'feat_3',
    title: 'Giao Hàng Hỏa Tốc & Miễn Phí',
    description: 'Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000₫. Đóng gói chuyên dụng chống sốc đạt chuẩn vận chuyển đồ công nghệ.',
    badge: 'SIÊU TỐC 2H',
    badgeColor: 'emerald',
    icon: 'truck',
    ctaText: 'XEM CHÍNH SÁCH SHIP',
    link: '/about'
  }
]

export default function ServiceFeaturesEditor({
  section,
  onUpdateConfig,
  onShowToast
}: ServiceFeaturesEditorProps) {
  const currentItems: ServiceFeatureItem[] =
    section.config?.items && section.config.items.length > 0
      ? section.config.items
      : DEFAULT_SERVICE_ITEMS

  const updateItemField = (idx: number, field: keyof ServiceFeatureItem, value: any) => {
    const updated = currentItems.map((it, i) => (i === idx ? { ...it, [field]: value } : it))
    onUpdateConfig(section.sectionKey, { items: updated })
  }

  const handleResetDefaults = () => {
    onUpdateConfig(section.sectionKey, { items: DEFAULT_SERVICE_ITEMS })
    onShowToast('success', 'Đã đặt lại 3 thẻ dịch vụ về nội dung mặc định.')
  }

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
            <Tag size={15} className="text-indigo-500" weight="bold" />
            2. Chỉnh sửa nội dung 3 thẻ cam kết dịch vụ
          </h3>
          <p className="text-[10px] text-zinc-400 mt-0.5">
            Tùy biến trực tiếp tiêu đề, mô tả, huy hiệu, liên kết và màu sắc của từng thẻ
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetDefaults}
          className="text-[10px] font-bold text-indigo-500 hover:underline cursor-pointer shrink-0"
        >
          Khôi phục mẫu
        </button>
      </div>

      <div className="space-y-4">
        {currentItems.map((item, idx) => (
          <div
            key={idx}
            className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-[11px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                Thẻ dịch vụ #{idx + 1}
              </span>
              <div className="flex items-center gap-2">
                {/* Color selector */}
                <select
                  value={item.badgeColor || 'red'}
                  onChange={e => updateItemField(idx, 'badgeColor', e.target.value as any)}
                  className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  <option value="red">🔴 Tông Đỏ</option>
                  <option value="blue">🔵 Tông Xanh dương</option>
                  <option value="emerald">🟢 Tông Xanh ngọc</option>
                </select>
                {/* Icon selector */}
                <select
                  value={item.icon || 'wrench'}
                  onChange={e => updateItemField(idx, 'icon', e.target.value as any)}
                  className="px-2 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-[10px] font-bold cursor-pointer"
                >
                  <option value="wrench">🔧 Build PC / Cờ lê</option>
                  <option value="shield">🛡️ Bảo hành / Khiên</option>
                  <option value="truck">🚚 Giao hàng / Xe tải</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Tiêu đề thẻ *</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={e => updateItemField(idx, 'title', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Huy hiệu góc (Badge)</label>
                <input
                  type="text"
                  value={item.badge}
                  onChange={e => updateItemField(idx, 'badge', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Mô tả cam kết *</label>
              <textarea
                rows={2}
                value={item.description}
                onChange={e => updateItemField(idx, 'description', e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Chữ nút bấm (CTA)</label>
                <input
                  type="text"
                  value={item.ctaText}
                  onChange={e => updateItemField(idx, 'ctaText', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Link chuyển hướng khi click</label>
                <input
                  type="text"
                  value={item.link}
                  onChange={e => updateItemField(idx, 'link', e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
