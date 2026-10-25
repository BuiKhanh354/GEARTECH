import { useState, useEffect, useCallback } from 'react'
import {
  SquaresFour, Eye, FloppyDisk, ArrowClockwise, Plus, Trash,
  CaretUp, CaretDown, CheckCircle, Warning, Clock,
  Images, Package, Sparkle, Storefront, Flame, Tag,
  UploadSimple, Copy, X, ArrowSquareOut, Funnel
} from '@phosphor-icons/react'
import {
  homepageService,
  type HomepageSection,
  type SectionType,
  type PopulatedSection,
  type HomepageBannerItem
} from '../../../services/homepageService'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'

const SECTION_TYPE_INFO: Record<SectionType, { label: string; icon: any; color: string; desc: string }> = {
  category_products: {
    label: 'Sản phẩm theo danh mục',
    icon: Package,
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    desc: 'Lấy sản phẩm thực tế theo danh mục MongoDB (PC, Laptop, Mac, Linh kiện...) có bộ lọc và sắp xếp.'
  },
  banner_slider: {
    label: 'Banner quảng bá',
    icon: Images,
    color: 'text-[#ff4655] bg-[#ff4655]/10 border-[#ff4655]/30',
    desc: 'Banner kép hoặc đơn phong cách Esports, hỗ trợ upload ảnh, nút CTA và hẹn giờ chiến dịch.'
  },
  flash_sale: {
    label: 'Giờ vàng Flash Deals',
    icon: Flame,
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
    desc: 'Khu vực giảm giá sốc với bộ đếm ngược thời gian thực và huy hiệu ưu đãi.'
  },
  category_grid: {
    label: 'Lưới phân khu danh mục',
    icon: SquaresFour,
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
    desc: '10 phân khu công nghệ chuyên sâu dưới dạng thẻ kính Glassmorphism.'
  },
  featured_products: {
    label: 'Bộ sưu tập Flagship',
    icon: Sparkle,
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
    desc: 'Showcase các thiết bị công nghệ hàng đầu được tuyển chọn.'
  },
  featured_shops: {
    label: 'Gian hàng đối tác',
    icon: Storefront,
    color: 'text-sky-500 bg-sky-500/10 border-sky-500/30',
    desc: 'Gian hàng chính hãng liên minh với chứng nhận huy hiệu xanh.'
  },
  service_features: {
    label: 'Trụ cột dịch vụ & Đặc quyền',
    icon: Tag,
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
    desc: '3 Trụ cột dịch vụ: Trả góp 0%, Bảo hành 1 đổi 1 30 ngày, Giao hỏa tốc 2H.'
  }
}

export default function AdminHomepageBuilderPage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [categories, setCategories] = useState<{ _id: string; name: string; slug: string; parent_id: string | null }[]>([])
  const [publishedVersion, setPublishedVersion] = useState<number>(1)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  
  // Feedback toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 3500)
  }

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [previewSections, setPreviewSections] = useState<PopulatedSection[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<HomepageSection | null>(null)

  // Category filter in search
  const [categorySearch, setCategorySearch] = useState('')

  // Load Initial Config
  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)
      const res = await homepageService.getAdminConfig()
      if (res.success) {
        const rawSections = res.draft?.sections || []
        const sorted = [...rawSections].sort((a, b) => a.order - b.order)
        setSections(sorted)
        setCategories(res.categories || [])
        if (sorted.length > 0) {
          setSelectedKey(sorted[0].sectionKey)
        }
        if (res.published) {
          setPublishedVersion(res.published.version)
          setPublishedAt(res.published.publishedAt)
        }
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi tải cấu hình trang chủ.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  const selectedSection = sections.find(s => s.sectionKey === selectedKey) || sections[0]

  // Reorder Handlers
  const handleMoveUp = (index: number) => {
    if (index <= 0) return
    const updated = [...sections]
    const temp = updated[index - 1]
    updated[index - 1] = updated[index]
    updated[index] = temp
    updated.forEach((s, idx) => { s.order = idx })
    setSections(updated)
    setHasUnsavedChanges(true)
  }

  const handleMoveDown = (index: number) => {
    if (index >= sections.length - 1) return
    const updated = [...sections]
    const temp = updated[index + 1]
    updated[index + 1] = updated[index]
    updated[index] = temp
    updated.forEach((s, idx) => { s.order = idx })
    setSections(updated)
    setHasUnsavedChanges(true)
  }

  // Toggle active/inactive
  const handleToggleStatus = (key: string) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }

  // Update Section Field
  const updateSection = (key: string, updates: Partial<HomepageSection>) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, ...updates }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }

  // Update Section Config Field
  const updateConfig = (key: string, configUpdates: any) => {
    setSections(prev =>
      prev.map(s => {
        if (s.sectionKey === key) {
          return { ...s, config: { ...s.config, ...configUpdates } }
        }
        return s
      })
    )
    setHasUnsavedChanges(true)
  }

  // Add New Section
  const handleAddSection = (type: SectionType) => {
    const typeInfo = SECTION_TYPE_INFO[type]
    const newKey = `sec_${type}_${Date.now()}`
    
    let initialConfig: any = {}
    if (type === 'category_products') {
      const firstCat = categories[0]
      initialConfig = {
        categoryId: firstCat?._id || null,
        categorySlug: firstCat?.slug || '',
        categoryName: firstCat?.name || '',
        includeChildren: true,
        limit: 8,
        sortBy: 'newest',
        showOutOfStock: false,
        showViewAll: true,
        viewAllLink: firstCat ? `/ProductPage?category=${firstCat.slug}` : '/ProductPage'
      }
    } else if (type === 'banner_slider') {
      initialConfig = {
        banners: [
          {
            title: 'KHUYẾN MÃI CÔNG NGHỆ MỚI',
            badge: 'GEARTECH EXCLUSIVE',
            subtitle: 'ƯU ĐÃI ĐỘC QUYỀN',
            description: 'Khám phá ngay các dòng sản phẩm máy tính và phụ kiện công nghệ hàng đầu.',
            priceTag: 'Giá siêu tốt',
            ctaText: 'Khám phá ngay',
            link: '/ProductPage',
            imageUrl: '',
            bgGradient: 'from-zinc-950 via-zinc-900 to-black',
            status: 'active'
          }
        ]
      }
    } else if (type === 'flash_sale') {
      initialConfig = {
        tagline: 'CẬP NHẬT GIÁ SỐC MỖI 24 GIỜ',
        countdownEnd: new Date(Date.now() + 86400000).toISOString(),
        limit: 5
      }
    } else {
      initialConfig = { limit: 8 }
    }

    const newSection: HomepageSection = {
      sectionKey: newKey,
      title: typeInfo.label,
      subtitle: typeInfo.desc.slice(0, 60),
      type,
      status: 'active',
      order: sections.length,
      schedule: { isScheduled: false, startDate: null, endDate: null },
      config: initialConfig
    }

    const updated = [...sections, newSection]
    setSections(updated)
    setSelectedKey(newKey)
    setIsAddModalOpen(false)
    setHasUnsavedChanges(true)
    showToast('success', `Đã thêm khu vực "${typeInfo.label}" vào bố cục!`)
  }

  // Duplicate Section
  const handleDuplicateSection = (sec: HomepageSection) => {
    const newKey = `${sec.sectionKey}_copy_${Date.now().toString(36)}`
    const duplicated: HomepageSection = {
      ...JSON.parse(JSON.stringify(sec)),
      sectionKey: newKey,
      title: `${sec.title} (Bản sao)`,
      order: sections.length
    }
    const updated = [...sections, duplicated]
    setSections(updated)
    setSelectedKey(newKey)
    setHasUnsavedChanges(true)
    showToast('success', `Đã nhân bản khu vực "${sec.title}"!`)
  }

  // Delete Section
  const confirmDeleteSection = () => {
    if (!sectionToDelete) return
    const updated = sections
      .filter(s => s.sectionKey !== sectionToDelete.sectionKey)
      .map((s, idx) => ({ ...s, order: idx }))
    setSections(updated)
    if (selectedKey === sectionToDelete.sectionKey && updated.length > 0) {
      setSelectedKey(updated[0].sectionKey)
    }
    setSectionToDelete(null)
    setIsDeleteModalOpen(false)
    setHasUnsavedChanges(true)
    showToast('success', `Đã xóa khu vực "${sectionToDelete.title}". Dữ liệu sản phẩm và shop gốc vẫn an toàn.`)
  }

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true)
      const res = await homepageService.saveDraft(sections)
      if (res.success) {
        setHasUnsavedChanges(false)
        showToast('success', 'Đã lưu bản nháp bố cục trang chủ thành công!')
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi lưu bản nháp.')
    } finally {
      setSaving(false)
    }
  }

  // Publish
  const handlePublish = async () => {
    try {
      setPublishing(true)
      // Tự động lưu bản nháp trước khi xuất bản
      await homepageService.saveDraft(sections)
      const res = await homepageService.publish()
      if (res.success) {
        setHasUnsavedChanges(false)
        setIsPublishModalOpen(false)
        setPublishedVersion(res.published.version)
        setPublishedAt(res.published.publishedAt)
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi xuất bản trang chủ.')
    } finally {
      setPublishing(false)
    }
  }

  // Restore Default
  const handleRestoreDefault = async () => {
    if (!window.confirm('Bạn có chắc muốn khôi phục bản nháp về bố cục chuẩn mặc định của GearTech?')) return
    try {
      setLoading(true)
      const res = await homepageService.restoreDefault()
      if (res.success) {
        setSections(res.draft.sections || [])
        if (res.draft.sections?.length > 0) {
          setSelectedKey(res.draft.sections[0].sectionKey)
        }
        setHasUnsavedChanges(false)
        showToast('success', res.message)
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi khôi phục mặc định.')
    } finally {
      setLoading(false)
    }
  }

  // Open Preview
  const handleOpenPreview = async () => {
    try {
      setPreviewLoading(true)
      setIsPreviewOpen(true)
      // Tự động lưu bản nháp trước để preview phản ánh đúng các thay đổi
      if (hasUnsavedChanges) {
        await homepageService.saveDraft(sections)
        setHasUnsavedChanges(false)
      }
      const res = await homepageService.getPreview()
      if (res.success) {
        setPreviewSections(res.sections || [])
      }
    } catch (err: any) {
      showToast('error', 'Lỗi tải giao diện xem trước.')
    } finally {
      setPreviewLoading(false)
    }
  }

  // Upload Banner Image
  const handleUploadBannerImage = async (bannerIdx: number, file: File) => {
    try {
      showToast('success', 'Đang tải ảnh banner lên...')
      const url = await homepageService.uploadBanner(file)
      if (selectedSection && selectedSection.config.banners) {
        const updatedBanners = [...selectedSection.config.banners]
        updatedBanners[bannerIdx] = { ...updatedBanners[bannerIdx], imageUrl: url }
        updateConfig(selectedSection.sectionKey, { banners: updatedBanners })
        showToast('success', 'Tải ảnh banner thành công!')
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.error || 'Lỗi tải ảnh banner.')
    }
  }

  // Helper check schedule status
  const getScheduleStatus = (sec: HomepageSection) => {
    if (sec.status === 'inactive') return { label: 'Đã tắt', color: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
    if (!sec.schedule?.isScheduled) return { label: 'Đang hiển thị', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' }
    
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
        <ArrowClockwise size={32} className="animate-spin text-[#ff4655]" />
        <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Đang nạp cấu hình Homepage Builder...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Header & Top Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-ping"></span>
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
            onClick={handleRestoreDefault}
            title="Khôi phục về bố cục chuẩn ban đầu"
            className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowClockwise size={14} weight="bold" />
            <span className="hidden sm:inline">Khôi phục mặc định</span>
          </button>

          <button
            onClick={handleOpenPreview}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Eye size={14} weight="bold" />
            <span>Xem trước</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            {saving ? <ArrowClockwise size={14} className="animate-spin" /> : <FloppyDisk size={14} weight="bold" />}
            <span>Lưu bản nháp</span>
          </button>

          <button
            onClick={() => setIsPublishModalOpen(true)}
            disabled={publishing}
            className="px-5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(255,70,85,0.4)] hover:shadow-[0_0_25px_rgba(255,70,85,0.6)] flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle size={15} weight="bold" />
            <span>Xuất bản ngay</span>
          </button>
        </div>
      </div>

      {/* 2. Main Builder Workspace: Left (List) & Right (Editor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: SECTIONS LIST & REORDERING (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <SquaresFour size={15} weight="bold" className="text-[#ff4655]" />
                Các khu vực hiển thị ({sections.length})
              </h2>
              <span className="text-[10px] text-zinc-400">Sắp xếp thứ tự từ trên xuống dưới trang chủ</span>
            </div>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
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
              const isSelected = sec.sectionKey === selectedSection?.sectionKey
              const scheduleStatus = getScheduleStatus(sec)

              return (
                <div
                  key={sec.sectionKey}
                  onClick={() => setSelectedKey(sec.sectionKey)}
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
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Di chuyển lên trên"
                        className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <CaretUp size={12} weight="bold" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
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
                      onClick={() => handleDuplicateSection(sec)}
                      title="Nhân bản khu vực này"
                      className="p-1.5 text-zinc-400 hover:text-blue-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Copy size={13} weight="bold" />
                    </button>
                    <button
                      onClick={() => {
                        setSectionToDelete(sec)
                        setIsDeleteModalOpen(true)
                      }}
                      title="Xóa khu vực"
                      className="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <Trash size={13} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleToggleStatus(sec.sectionKey)}
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

        {/* RIGHT COLUMN: SECTION EDITOR (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-6">
          {selectedSection ? (
            <>
              {/* Editor Header */}
              <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 uppercase">
                      {SECTION_TYPE_INFO[selectedSection.type]?.label || selectedSection.type}
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
                    onClick={() => handleToggleStatus(selectedSection.sectionKey)}
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
                      onChange={e => updateSection(selectedSection.sectionKey, { title: e.target.value })}
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
                      onChange={e => updateSection(selectedSection.sectionKey, { subtitle: e.target.value })}
                      placeholder="VD: Cấu hình thi đấu tối tân..."
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-medium text-zinc-900 dark:text-white focus:outline-hidden focus:border-[#ff4655]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Type-Specific Config */}
              
              {/* CASE A: CATEGORY PRODUCTS (Trọng tâm) */}
              {selectedSection.type === 'category_products' && (
                <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Package size={15} className="text-blue-500" weight="bold" />
                      2. Cấu hình chọn danh mục MongoDB & Truy vấn sản phẩm
                    </h3>
                  </div>

                  {/* Category Selector with Search */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          Chọn danh mục sản phẩm từ Database <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[10px] text-zinc-400">
                          {categories.length} danh mục khả dụng
                        </span>
                      </div>
                      
                      <div className="relative mb-2">
                        <input
                          type="text"
                          value={categorySearch}
                          onChange={e => setCategorySearch(e.target.value)}
                          placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
                          className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                        />
                        <Funnel size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
                      </div>

                      <select
                        value={selectedSection.config.categoryId || ''}
                        onChange={e => {
                          const cat = categories.find(c => c._id === e.target.value)
                          updateConfig(selectedSection.sectionKey, {
                            categoryId: cat?._id || null,
                            categorySlug: cat?.slug || '',
                            categoryName: cat?.name || '',
                            viewAllLink: cat ? `/ProductPage?category=${cat.slug}` : '/ProductPage'
                          })
                        }}
                        className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                      >
                        <option value="">-- Chọn danh mục --</option>
                        {categories
                          .filter(c => !categorySearch || c.name.toLowerCase().includes(categorySearch.toLowerCase()) || c.slug.includes(categorySearch.toLowerCase()))
                          .map(c => (
                            <option key={c._id} value={c._id}>
                              {c.parent_id ? `↳ ${c.name}` : `📁 ${c.name}`} (slug: {c.slug})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Include Children & Out of Stock Options */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSection.config.includeChildren ?? true}
                          onChange={e => updateConfig(selectedSection.sectionKey, { includeChildren: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Bao gồm cả danh mục con (Sub-categories)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedSection.config.showOutOfStock ?? false}
                          onChange={e => updateConfig(selectedSection.sectionKey, { showOutOfStock: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Hiển thị cả sản phẩm hết hàng
                        </span>
                      </label>
                    </div>

                    {/* Query Controls: Limit & Sorting */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Số lượng sản phẩm hiển thị
                        </label>
                        <select
                          value={selectedSection.config.limit || 8}
                          onChange={e => updateConfig(selectedSection.sectionKey, { limit: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                        >
                          <option value={4}>4 sản phẩm (1 hàng)</option>
                          <option value={8}>8 sản phẩm (2 hàng)</option>
                          <option value={12}>12 sản phẩm (3 hàng)</option>
                          <option value={16}>16 sản phẩm (4 hàng)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Tiêu chí sắp xếp
                        </label>
                        <select
                          value={selectedSection.config.sortBy || 'newest'}
                          onChange={e => updateConfig(selectedSection.sectionKey, { sortBy: e.target.value })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                        >
                          <option value="newest">Mới nhất (Ngày đăng)</option>
                          <option value="sold_desc">Bán chạy nhất (Số lượng bán)</option>
                          <option value="rating_desc">Đánh giá cao nhất (Sao review)</option>
                          <option value="price_asc">Giá từ thấp đến cao</option>
                          <option value="price_desc">Giá từ cao đến thấp</option>
                        </select>
                      </div>
                    </div>

                    {/* View All Button Config */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSection.config.showViewAll ?? true}
                          onChange={e => updateConfig(selectedSection.sectionKey, { showViewAll: e.target.checked })}
                          className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                        />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Hiển thị nút "Xem tất cả"
                        </span>
                      </div>

                      {selectedSection.config.showViewAll && (
                        <div className="flex-1">
                          <input
                            type="text"
                            value={selectedSection.config.viewAllLink || ''}
                            onChange={e => updateConfig(selectedSection.sectionKey, { viewAllLink: e.target.value })}
                            placeholder="Đường dẫn nút xem tất cả (/ProductPage?category=...)"
                            className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CASE B: BANNER SLIDER */}
              {selectedSection.type === 'banner_slider' && (
                <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <Images size={15} className="text-[#ff4655]" weight="bold" />
                      2. Quản lý danh sách banner quảng bá
                    </h3>
                    
                    <button
                      onClick={() => {
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
                        const cur = selectedSection.config.banners || []
                        updateConfig(selectedSection.sectionKey, { banners: [...cur, newBanner] })
                      }}
                      className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} weight="bold" />
                      <span>Thêm banner</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(selectedSection.config.banners || []).map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                          <span className="text-[11px] font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                            Banner #{bIdx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const filtered = (selectedSection.config.banners || []).filter((_, i) => i !== bIdx)
                              updateConfig(selectedSection.sectionKey, { banners: filtered })
                            }}
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
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].title = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Huy hiệu góc (Badge)</label>
                            <input
                              type="text"
                              value={b.badge}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].badge = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Phụ đề (Tagline)</label>
                            <input
                              type="text"
                              value={b.subtitle}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].subtitle = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Giá / Ưu đãi (Price Tag)</label>
                            <input
                              type="text"
                              value={b.priceTag}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].priceTag = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Mô tả chi tiết</label>
                            <textarea
                              rows={2}
                              value={b.description}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].description = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Chữ nút bấm (CTA)</label>
                            <input
                              type="text"
                              value={b.ctaText}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].ctaText = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
                              className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-zinc-500 mb-0.5">Link chuyển hướng khi click</label>
                            <input
                              type="text"
                              value={b.link}
                              onChange={e => {
                                const copy = [...(selectedSection.config.banners || [])]
                                copy[bIdx].link = e.target.value
                                updateConfig(selectedSection.sectionKey, { banners: copy })
                              }}
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
                                onChange={e => {
                                  const copy = [...(selectedSection.config.banners || [])]
                                  copy[bIdx].imageUrl = e.target.value
                                  updateConfig(selectedSection.sectionKey, { banners: copy })
                                }}
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
                                      handleUploadBannerImage(bIdx, e.target.files[0])
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
              )}

              {/* CASE C: FLASH SALE */}
              {selectedSection.type === 'flash_sale' && (
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
                          value={selectedSection.config.countdownEnd ? new Date(selectedSection.config.countdownEnd).toISOString().slice(0, 16) : ''}
                          onChange={e => updateConfig(selectedSection.sectionKey, { countdownEnd: new Date(e.target.value).toISOString() })}
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
                          value={selectedSection.config.limit || 5}
                          onChange={e => updateConfig(selectedSection.sectionKey, { limit: Number(e.target.value) })}
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Schedule Settings (Áp dụng chung cho tất cả khu vực) */}
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
                      checked={selectedSection.schedule?.isScheduled ?? false}
                      onChange={e =>
                        updateSection(selectedSection.sectionKey, {
                          schedule: {
                            isScheduled: e.target.checked,
                            startDate: selectedSection.schedule?.startDate || null,
                            endDate: selectedSection.schedule?.endDate || null
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

                {selectedSection.schedule?.isScheduled && (
                  <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                          Thời gian bắt đầu hiển thị
                        </label>
                        <input
                          type="datetime-local"
                          value={selectedSection.schedule.startDate ? new Date(selectedSection.schedule.startDate).toISOString().slice(0, 16) : ''}
                          onChange={e =>
                            updateSection(selectedSection.sectionKey, {
                              schedule: {
                                ...selectedSection.schedule,
                                startDate: e.target.value ? new Date(e.target.value).toISOString() : null
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
                          value={selectedSection.schedule.endDate ? new Date(selectedSection.schedule.endDate).toISOString().slice(0, 16) : ''}
                          onChange={e =>
                            updateSection(selectedSection.sectionKey, {
                              schedule: {
                                ...selectedSection.schedule,
                                endDate: e.target.value ? new Date(e.target.value).toISOString() : null
                              }
                            })
                          }
                          className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
                        />
                      </div>
                    </div>

                    {selectedSection.schedule.startDate && selectedSection.schedule.endDate && new Date(selectedSection.schedule.endDate) <= new Date(selectedSection.schedule.startDate) && (
                      <p className="text-[11px] font-bold text-red-500 flex items-center gap-1">
                        <Warning size={13} weight="fill" /> Thời điểm kết thúc phải sau thời điểm bắt đầu.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-zinc-400">
              Chọn một khu vực ở cột bên trái để chỉnh sửa cấu hình.
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: ADD NEW SECTION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
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
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                    onClick={() => handleAddSection(type)}
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
      )}

      {/* MODAL 2: CONFIRM DELETE SECTION */}
      {isDeleteModalOpen && sectionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash size={20} weight="bold" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                  Xác nhận xóa khu vực?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Bạn có chắc muốn xóa "{sectionToDelete.title}" khỏi bố cục?
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg leading-relaxed">
              Lưu ý: Xóa khu vực này chỉ gỡ vị trí hiển thị khỏi trang chủ, <strong>hoàn toàn không làm ảnh hưởng</strong> tới sản phẩm, danh mục hay dữ liệu của các shop đối tác.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={confirmDeleteSection}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-wider"
              >
                Xóa khu vực
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM PUBLISH */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 flex items-center justify-center shrink-0">
                <CheckCircle size={22} weight="bold" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                  Xác nhận xuất bản trang chủ?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Bản nháp hiện tại sẽ trở thành giao diện chính thức cho toàn bộ khách hàng.
                </p>
              </div>
            </div>

            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
              <p>Phiên bản tiếp theo: <strong>v{publishedVersion + 1}</strong></p>
              <p>Tổng số khu vực hoạt động: <strong>{sections.filter(s => s.status === 'active').length} / {sections.length}</strong></p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold"
              >
                Xem lại
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="px-5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                {publishing ? <ArrowClockwise size={14} className="animate-spin" /> : <CheckCircle size={14} weight="bold" />}
                <span>Đồng ý xuất bản</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: FULLSCREEN PREVIEW WITH REAL DATA */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Preview Toolbar */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Eye size={14} weight="bold" /> CHẾ ĐỘ XEM TRƯỚC BẢN NHÁP
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  (Dữ liệu sản phẩm & danh mục THẬT từ MongoDB)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsPreviewOpen(false)
                    setIsPublishModalOpen(true)
                  }}
                  className="px-4 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                >
                  <CheckCircle size={14} weight="bold" />
                  <span>Xuất bản ngay</span>
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>

            {/* Preview Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-zinc-50 dark:bg-zinc-950">
              {previewLoading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-2">
                  <ArrowClockwise size={28} className="animate-spin text-[#ff4655]" />
                  <p className="text-xs text-zinc-400">Đang truy vấn dữ liệu sản phẩm thực tế...</p>
                </div>
              ) : (
                previewSections.map((sec, idx) => (
                  <div key={sec.sectionKey || idx} className="space-y-4 relative border-l-2 border-[#ff4655]/40 pl-4">
                    {/* Section Badge in Preview */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">#{idx + 1}</span>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                            {sec.title}
                          </h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            sec._previewBadge === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : sec._previewBadge === 'scheduled'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {sec._previewBadge === 'active' ? 'Hiển thị ngay' : sec._previewBadge === 'scheduled' ? 'Đã lên lịch' : 'Tắt / Hết hạn'}
                          </span>
                        </div>
                        {sec.subtitle && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{sec.subtitle}</p>
                        )}
                      </div>

                      {sec.config.showViewAll && sec.config.viewAllLink && (
                        <a
                          href={sec.config.viewAllLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#ff4655] hover:underline flex items-center gap-1"
                        >
                          Xem tất cả <ArrowSquareOut size={12} weight="bold" />
                        </a>
                      )}
                    </div>

                    {/* Populated Data Display */}
                    {sec.type === 'category_products' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sec.populatedData?.products && sec.populatedData.products.length > 0 ? (
                          sec.populatedData.products.map(p => (
                            <div
                              key={p._id || p.id}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-3 space-y-2 shadow-sm"
                            >
                              <div className="h-32 bg-zinc-100 dark:bg-zinc-950 rounded flex items-center justify-center text-2xl overflow-hidden">
                                <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{p.title}</h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                                <span className="text-[10px] text-zinc-400">Kho: {p.stock}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            Chưa có sản phẩm nào thuộc danh mục này trong database.
                          </div>
                        )}
                      </div>
                    )}

                    {sec.type === 'banner_slider' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(sec.populatedData?.banners || []).map((b, bIdx) => (
                          <div
                            key={bIdx}
                            className={`p-6 rounded-2xl bg-gradient-to-br ${b.bgGradient || 'from-zinc-950 to-black'} text-white space-y-3 border border-zinc-800`}
                          >
                            <span className="px-2 py-0.5 rounded bg-[#ff4655] text-white text-[9px] font-black uppercase">
                              {b.badge || 'PROMO'}
                            </span>
                            <h4 className="text-base font-black uppercase">{b.title}</h4>
                            <p className="text-xs text-zinc-400 line-clamp-2">{b.description}</p>
                            <div className="pt-2 flex items-center justify-between">
                              <span className="text-xs font-black text-[#ff4655]">{b.priceTag}</span>
                              <span className="px-3 py-1 bg-white text-zinc-900 rounded text-[10px] font-black uppercase">
                                {b.ctaText}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {sec.type === 'flash_sale' && (
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center gap-2 text-[#ff4655] font-black mb-3">
                          <Flame size={18} weight="fill" />
                          <span>GIỜ VÀNG FLASH SALE (Đếm ngược: {sec.config.countdownEnd ? new Date(sec.config.countdownEnd).toLocaleTimeString('vi-VN') : '24:00:00'})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {(sec.populatedData?.products || []).slice(0, 5).map(p => (
                            <div key={p._id || p.id} className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <div className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded mb-1 overflow-hidden">
                                <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[11px] font-bold truncate">{p.title}</p>
                              <span className="text-xs font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-800'
              : 'bg-red-950 text-red-200 border-red-800'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={16} weight="fill" /> : <Warning size={16} weight="fill" />}
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  )
}
