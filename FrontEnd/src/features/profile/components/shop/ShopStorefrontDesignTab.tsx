import { useState, useEffect } from 'react'
import { 
  Palette, 
  FloppyDisk, 
  RocketLaunch, 
  ArrowCounterClockwise, 
  Eye, 
  Desktop, 
  DeviceMobile, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  GridFour, 
  ListBullets, 
  Sparkle,
  ShieldCheck,
  Star,
  Package,
  Storefront
} from '@phosphor-icons/react'
import { storefrontService, type StorefrontConfig } from '../../../../services/storefrontService'
import { formatPrice } from '../../../../utils/format'

interface ShopStorefrontDesignTabProps {
  currentShop: any
  allProducts: any[]
}

const PRESET_BANNERS = [
  {
    name: 'Cyberpunk Neon Studio',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Clean Minimalist Setup',
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Esports Arena Red',
    url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80'
  },
  {
    name: 'Modern Tech Hardware',
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1920&q=80'
  }
]

const COLOR_PRESETS = [
  { name: 'Valorant Red', hex: '#ff4655' },
  { name: 'Cyberpunk Cyan', hex: '#00ffcc' },
  { name: 'Electric Purple', hex: '#a855f7' },
  { name: 'Gaming Amber', hex: '#f59e0b' },
  { name: 'Emerald Razer', hex: '#10b981' },
  { name: 'Minimal Dark', hex: '#3f3f46' }
]

export default function ShopStorefrontDesignTab({ currentShop, allProducts }: ShopStorefrontDesignTabProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [publishedAt, setPublishedAt] = useState<string | null>(null)

  // Current draft config being edited
  const [config, setConfig] = useState<StorefrontConfig>({
    template: 'modern-tech',
    primaryColor: '#ff4655',
    secondaryColor: '#09090b',
    bannerUrl: '',
    introText: '',
    viewMode: 'grid',
    columns: 4,
    sections: [
      { id: 'banner', title: 'Banner thương hiệu & Giới thiệu', enabled: true, order: 1 },
      { id: 'intro', title: 'Thông điệp chào mừng & Cam kết', enabled: true, order: 2 },
      { id: 'featured', title: 'Sản phẩm nổi bật / Bán chạy', enabled: true, order: 3 },
      { id: 'catalog', title: 'Toàn bộ thiết bị của gian hàng', enabled: true, order: 4 }
    ]
  })

  // Load initial storefront config from Backend
  useEffect(() => {
    const fetchStorefront = async () => {
      try {
        setLoading(true)
        const data = await storefrontService.getMyStorefront()
        if (data.storefrontDraft) {
          setConfig(data.storefrontDraft)
        }
        if (data.publishedAt) {
          setPublishedAt(data.publishedAt)
        }
      } catch (err: any) {
        console.error('Lỗi tải cấu hình storefront:', err)
        setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Không thể tải cấu hình storefront' })
      } finally {
        setLoading(false)
      }
    }
    fetchStorefront()
  }, [])

  // Auto clear status message after 4s
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [statusMsg])

  // Save Draft handler
  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      setStatusMsg(null)
      const res = await storefrontService.saveDraft(config)
      setStatusMsg({ type: 'success', text: res.message || 'Lưu bản nháp thiết kế thành công!' })
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Lỗi khi lưu bản nháp.' })
    } finally {
      setSaving(false)
    }
  }

  // Publish handler
  const handlePublish = async () => {
    try {
      setPublishing(true)
      setStatusMsg(null)
      // Save draft first then publish
      await storefrontService.saveDraft(config)
      const res = await storefrontService.publish()
      setPublishedAt(res.publishedAt)
      setStatusMsg({ 
        type: 'success', 
        text: '🚀 Xuất bản gian hàng thành công! Khách hàng đã có thể nhìn thấy giao diện mới nhất.' 
      })
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Lỗi khi xuất bản gian hàng.' })
    } finally {
      setPublishing(false)
    }
  }

  // Reset to default
  const handleReset = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn khôi phục thiết kế gian hàng về mặc định không?')) return
    try {
      setSaving(true)
      const res = await storefrontService.reset()
      if (res.storefrontDraft) {
        setConfig(res.storefrontDraft)
      }
      setStatusMsg({ type: 'success', text: 'Đã khôi phục thiết kế bản nháp về mặc định thành công!' })
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Lỗi khôi phục mặc định.' })
    } finally {
      setSaving(false)
    }
  }

  // Section reordering
  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sorted = [...config.sections].sort((a, b) => a.order - b.order)
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= sorted.length) return

    const temp = sorted[index]
    sorted[index] = sorted[targetIndex]
    sorted[targetIndex] = temp

    const updated = sorted.map((sec, idx) => ({ ...sec, order: idx + 1 }))
    setConfig({ ...config, sections: updated })
  }

  // Section toggle enable/disable
  const toggleSection = (id: string) => {
    const updated = config.sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    setConfig({ ...config, sections: updated })
  }

  // Section title rename
  const renameSection = (id: string, newTitle: string) => {
    const updated = config.sections.map(s => s.id === id ? { ...s, title: newTitle } : s)
    setConfig({ ...config, sections: updated })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Đang tải cấu hình thiết kế gian hàng...</p>
      </div>
    )
  }

  // Sorted sections for rendering preview
  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      {/* Top Banner Control Header */}
      <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded bg-[#ff4655]/10 text-[#ff4655]">
                <Palette size={20} weight="bold" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                  THIẾT KẾ & TRANG TRÍ GIAN HÀNG CỦA SHOP
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tự do phối màu, chọn template, điều chỉnh banner và phân đoạn hiển thị để tạo dấu ấn thương hiệu riêng biệt.
                </p>
              </div>
            </div>
            {publishedAt && (
              <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-1">
                <CheckCircle size={14} weight="fill" />
                Đã xuất bản lần cuối: {new Date(publishedAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleReset}
              disabled={saving || publishing}
              className="px-3 py-2 rounded text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-red-500/10 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5"
              title="Khôi phục mặc định"
            >
              <ArrowCounterClockwise size={15} />
              <span>Khôi phục</span>
            </button>

            <button
              onClick={handleSaveDraft}
              disabled={saving || publishing}
              className="px-4 py-2 rounded text-xs font-black uppercase tracking-wider bg-zinc-800 dark:bg-zinc-800 hover:bg-zinc-700 text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <FloppyDisk size={15} weight="bold" />
              <span>{saving ? 'Đang lưu...' : 'Lưu bản nháp'}</span>
            </button>

            <button
              onClick={handlePublish}
              disabled={saving || publishing}
              style={{ backgroundColor: config.primaryColor || '#ff4655' }}
              className="px-5 py-2 rounded text-xs font-black uppercase tracking-wider text-white hover:brightness-110 transition-all flex items-center gap-1.5 shadow-md"
            >
              <RocketLaunch size={15} weight="bold" />
              <span>{publishing ? 'Đang xuất bản...' : 'Xuất bản giao diện'}</span>
            </button>
          </div>
        </div>

        {/* Status Notification Toast */}
        {statusMsg && (
          <div className={`mt-4 p-3 rounded-md text-xs font-bold flex items-center gap-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            <Sparkle size={16} />
            <span>{statusMsg.text}</span>
          </div>
        )}
      </div>

      {/* Main Studio Grid: Left Studio Controls, Right Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ========================================================
            LEFT COLUMN: DESIGN CONTROLS (Tùy chỉnh các thông số)
           ======================================================== */}
        <div className="xl:col-span-5 space-y-5">
          {/* 1. Template Selection */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Sparkle size={15} className="text-[#ff4655]" />
              1. Phong cách giao diện (Template)
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'modern-tech', name: 'Modern Tech', desc: 'Sắc sảo, bo cong hiện đại' },
                { id: 'minimal', name: 'Minimalist', desc: 'Thanh lịch, đường nét tinh giản' },
                { id: 'gaming', name: 'Cyber Gaming', desc: 'Đậm chất esports, góc cạnh LED' }
              ].map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setConfig({ ...config, template: tpl.id as any })}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    config.template === tpl.id
                      ? 'border-[#ff4655] bg-[#ff4655]/5 ring-1 ring-[#ff4655]'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                  }`}
                >
                  <span className="text-xs font-black text-zinc-900 dark:text-white block">{tpl.name}</span>
                  <span className="text-[10px] text-zinc-500 mt-1 block leading-tight">{tpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Scheme */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Palette size={15} className="text-[#ff4655]" />
              2. Màu sắc nhận diện thương hiệu
            </h4>

            <div>
              <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1.5">
                Màu chủ đạo (Primary Accent)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={config.primaryColor || '#ff4655'}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700 bg-transparent p-0.5"
                />
                <input
                  type="text"
                  value={config.primaryColor}
                  onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                  className="flex-1 px-3 py-2 text-xs font-mono rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                  placeholder="#ff4655"
                />
              </div>

              {/* Quick color preset chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {COLOR_PRESETS.map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setConfig({ ...config, primaryColor: color.hex })}
                    className="flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                    <span className="text-zinc-600 dark:text-zinc-400">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Banner & Announcement */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Storefront size={15} className="text-[#ff4655]" />
              3. Ảnh Banner & Giới thiệu gian hàng
            </h4>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-500 uppercase block">
                Link ảnh Banner (URL)
              </label>
              <input
                type="text"
                value={config.bannerUrl || ''}
                onChange={(e) => setConfig({ ...config, bannerUrl: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                placeholder="https://example.com/banner.jpg"
              />

              {/* Banner Presets */}
              <div className="space-y-1 pt-1">
                <span className="text-[10px] font-semibold text-zinc-400 block">Hoặc chọn mẫu có sẵn:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_BANNERS.map((b) => (
                    <button
                      key={b.name}
                      type="button"
                      onClick={() => setConfig({ ...config, bannerUrl: b.url })}
                      className="px-2 py-1.5 text-[10px] text-left truncate rounded bg-zinc-100 dark:bg-zinc-900 hover:bg-[#ff4655]/10 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-500 uppercase block">
                Thông điệp chào mừng / Cam kết chất lượng
              </label>
              <textarea
                rows={3}
                value={config.introText || ''}
                onChange={(e) => setConfig({ ...config, introText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                placeholder="Nhập cam kết của shop, chính sách bảo hành, lời chào mừng quý khách..."
              />
            </div>
          </div>

          {/* 4. Display Layout & Columns */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <GridFour size={15} className="text-[#ff4655]" />
              4. Kiểu hiển thị danh mục sản phẩm
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">
                  Chế độ hiển thị
                </label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded">
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, viewMode: 'grid' })}
                    className={`py-1.5 text-[10px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${
                      config.viewMode === 'grid'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <GridFour size={13} /> Lưới
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, viewMode: 'list' })}
                    className={`py-1.5 text-[10px] font-black uppercase rounded flex items-center justify-center gap-1 transition-all ${
                      config.viewMode === 'list'
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <ListBullets size={13} /> Danh sách
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-500 uppercase block mb-1">
                  Số cột (Chế độ lưới)
                </label>
                <div className="grid grid-cols-2 gap-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded">
                  {[3, 4].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setConfig({ ...config, columns: col as any })}
                      className={`py-1.5 text-[10px] font-black uppercase rounded transition-all ${
                        config.columns === col
                          ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm'
                          : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {col} Cột
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 5. Sections Manager & Reorder */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center justify-between">
              <span>5. Sắp xếp & Bật/Tắt phân đoạn</span>
              <span className="text-[10px] font-normal text-zinc-400">({config.sections.filter(s => s.enabled).length}/4 hiển thị)</span>
            </h4>

            <div className="space-y-2">
              {sortedSections.map((sec, idx) => (
                <div
                  key={sec.id}
                  className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                    sec.enabled
                      ? 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
                      : 'bg-zinc-100/50 dark:bg-zinc-900/20 border-dashed border-zinc-300 dark:border-zinc-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={sec.enabled}
                      onChange={() => toggleSection(sec.id)}
                      className="w-4 h-4 rounded text-[#ff4655] accent-[#ff4655] cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={sec.title}
                        onChange={(e) => renameSection(sec.id, e.target.value)}
                        className="text-xs font-bold bg-transparent border-b border-transparent hover:border-zinc-400 focus:border-[#ff4655] focus:outline-none w-full text-zinc-900 dark:text-white py-0.5"
                      />
                      <span className="text-[9px] text-zinc-400 block">Mã: {sec.id} • Thứ tự: #{sec.order}</span>
                    </div>
                  </div>

                  {/* Up / Down Order buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSection(idx, 'up')}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-white disabled:opacity-20"
                      title="Di chuyển lên"
                    >
                      <ArrowUp size={14} weight="bold" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === sortedSections.length - 1}
                      onClick={() => moveSection(idx, 'down')}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-800 dark:hover:text-white disabled:opacity-20"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown size={14} weight="bold" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: REAL-TIME INTERACTIVE LIVE PREVIEW PANE
           ======================================================== */}
        <div className="xl:col-span-7 space-y-4 sticky top-6">
          <div className="flex items-center justify-between bg-zinc-900 text-white px-4 py-2.5 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Eye size={16} className="text-[#ff4655]" />
              <span className="text-xs font-black uppercase tracking-wider">
                XEM TRƯỚC GIAO DIỆN THỰC TẾ (REAL-TIME PREVIEW)
              </span>
            </div>

            {/* Device Switcher */}
            <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded">
              <button
                type="button"
                onClick={() => setPreviewMode('desktop')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  previewMode === 'desktop' ? 'bg-[#ff4655] text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Desktop View"
              >
                <Desktop size={14} /> Desktop
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('mobile')}
                className={`p-1.5 rounded text-xs flex items-center gap-1 ${
                  previewMode === 'mobile' ? 'bg-[#ff4655] text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Mobile View"
              >
                <DeviceMobile size={14} /> Mobile
              </button>
            </div>
          </div>

          {/* Mock Browser/Device Container */}
          <div className={`mx-auto transition-all duration-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-b-xl shadow-2xl overflow-hidden ${
            previewMode === 'mobile' ? 'max-w-sm border-x-4 border-zinc-700' : 'w-full'
          }`}>
            <div className="p-4 sm:p-6 space-y-6 max-h-[820px] overflow-y-auto">
              {/* Dynamic Sections rendering based on user's order & enabled flag */}
              {sortedSections.map((sec) => {
                if (!sec.enabled) return null

                // Section 1: BANNER
                if (sec.id === 'banner') {
                  return (
                    <div
                      key={sec.id}
                      className={`relative overflow-hidden rounded-2xl text-white shadow-lg ${
                        config.template === 'gaming'
                          ? 'border-2 border-red-500/40 bg-zinc-950 shadow-red-500/10'
                          : config.template === 'minimal'
                            ? 'border border-zinc-800 bg-zinc-900'
                            : 'border border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black'
                      }`}
                    >
                      {/* Banner Background Image */}
                      {config.bannerUrl && (
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                          style={{ backgroundImage: `url(${config.bannerUrl})` }}
                        />
                      )}

                      <div className="relative p-5 sm:p-6 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 backdrop-blur-md text-3xl sm:text-4xl flex items-center justify-center border border-white/20 shrink-0">
                            {currentShop?.logo || '🏬'}
                          </span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-base sm:text-lg font-black uppercase tracking-wider">
                                {currentShop?.name || currentShop?.shop_name || 'Gear Tech Store'}
                              </h3>
                              <span
                                style={{ backgroundColor: `${config.primaryColor}25`, color: config.primaryColor, borderColor: `${config.primaryColor}50` }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border"
                              >
                                <ShieldCheck size={11} weight="fill" /> Đối tác xác minh
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 font-medium mt-0.5">
                              {currentShop?.category || 'Phần cứng & Gaming Gear'}
                            </p>
                          </div>
                        </div>

                        {/* Quick stats */}
                        <div className="flex items-center gap-4 border-t sm:border-t-0 sm:border-l border-white/10 pt-3 sm:pt-0 sm:pl-4 text-center shrink-0">
                          <div>
                            <span className="text-[8px] text-zinc-400 block uppercase">ĐÁNH GIÁ</span>
                            <span className="text-xs font-black text-amber-400 flex items-center justify-center gap-0.5">
                              <Star size={12} weight="fill" /> {currentShop?.rating || 5.0}
                            </span>
                          </div>
                          <div>
                            <span className="text-[8px] text-zinc-400 block uppercase">SẢN PHẨM</span>
                            <span className="text-xs font-black text-white">
                              {allProducts?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                // Section 2: INTRO
                if (sec.id === 'intro') {
                  return (
                    <div
                      key={sec.id}
                      style={{ borderLeftColor: config.primaryColor }}
                      className="p-4 rounded-r-xl bg-zinc-50 dark:bg-zinc-900/60 border-l-4 border-t border-r border-b border-zinc-200 dark:border-zinc-800"
                    >
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white mb-1">
                        {sec.title}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {config.introText || 'Chào mừng quý khách đến với gian hàng chính hãng. Cam kết linh kiện chuẩn quốc tế, bảo hành đổi trả nhanh chóng!'}
                      </p>
                    </div>
                  )
                }

                // Section 3: FEATURED PRODUCTS
                if (sec.id === 'featured') {
                  const featuredList = (allProducts || []).slice(0, 3)
                  return (
                    <div key={sec.id} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-1.5 h-3.5" style={{ backgroundColor: config.primaryColor }} />
                          {sec.title}
                        </h4>
                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">
                          <Sparkle size={12} weight="fill" /> HOT
                        </span>
                      </div>

                      {featuredList.length === 0 ? (
                        <p className="text-[11px] text-zinc-400 text-center py-4">Chưa có sản phẩm nổi bật</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {featuredList.map((prod) => (
                            <div
                              key={prod._id || prod.id}
                              className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:shadow-md transition-shadow"
                            >
                              <div className="h-28 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-2">
                                {prod.imageEmoji?.startsWith('http') ? (
                                  <img src={prod.imageEmoji} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  prod.imageEmoji || '💻'
                                )}
                              </div>
                              <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate uppercase">
                                {prod.title || prod.name}
                              </p>
                              <p className="text-xs font-black mt-1" style={{ color: config.primaryColor }}>
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                // Section 4: ALL PRODUCTS CATALOG
                if (sec.id === 'catalog') {
                  const colsClass = config.columns === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-4'
                  return (
                    <div key={sec.id} className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                        <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                          <Package size={15} style={{ color: config.primaryColor }} />
                          {sec.title} ({allProducts?.length || 0})
                        </h4>
                        <span className="text-[10px] font-semibold text-zinc-400 uppercase">
                          {config.viewMode === 'grid' ? 'Lưới sản phẩm' : 'Danh sách'}
                        </span>
                      </div>

                      {(!allProducts || allProducts.length === 0) ? (
                        <p className="text-[11px] text-zinc-400 text-center py-6">Gian hàng chưa có sản phẩm nào.</p>
                      ) : config.viewMode === 'list' ? (
                        <div className="space-y-2">
                          {allProducts.slice(0, 5).map((prod) => (
                            <div
                              key={prod._id || prod.id}
                              className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                                  {prod.imageEmoji?.startsWith('http') ? (
                                    <img src={prod.imageEmoji} alt="" className="w-full h-full object-cover rounded" />
                                  ) : (
                                    prod.imageEmoji || '💻'
                                  )}
                                </span>
                                <div>
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase line-clamp-1">
                                    {prod.title || prod.name}
                                  </p>
                                  <span className="text-[10px] text-zinc-400 font-semibold">{prod.category || 'Phần cứng'}</span>
                                </div>
                              </div>
                              <span className="text-xs font-black shrink-0" style={{ color: config.primaryColor }}>
                                {formatPrice(prod.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={`grid grid-cols-2 ${colsClass} gap-3`}>
                          {allProducts.slice(0, 6).map((prod) => (
                            <div
                              key={prod._id || prod.id}
                              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
                            >
                              <div className="h-24 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mb-2">
                                {prod.imageEmoji?.startsWith('http') ? (
                                  <img src={prod.imageEmoji} alt="" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                  prod.imageEmoji || '💻'
                                )}
                              </div>
                              <p className="text-[10px] font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1 uppercase">
                                {prod.title || prod.name}
                              </p>
                              <p className="text-xs font-black mt-1" style={{ color: config.primaryColor }}>
                                {formatPrice(prod.price)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }

                return null
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
