import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Tag, 
  Plus, 
  PencilSimple, 
  Trash, 
  Eye, 
  EyeSlash, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  CheckCircle, 
  WarningCircle, 
  Globe, 
  X,
  Package
} from '@phosphor-icons/react'
import { brandService, type BrandItem } from '../../../../services/brandService'

export default function AdminBrandsTab() {
  const [brands, setBrands] = useState<BrandItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '🏷️',
    description: '',
    website: '',
    status: 'active' as 'active' | 'hidden' | 'inactive',
    order: 0
  })
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete Confirmation State
  const [deletingBrand, setDeletingBrand] = useState<BrandItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)

  // Auto slug helper
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  // Load danh sách thương hiệu
  const fetchBrands = async () => {
    try {
      setLoading(true)
      const data = await brandService.getAdminBrands({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100
      })
      if (data && Array.isArray(data.brands)) {
        setBrands(data.brands)
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách thương hiệu:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể tải danh sách thương hiệu.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBrands()
  }, [search, statusFilter])

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingBrand(null)
    setFormData({
      name: '',
      slug: '',
      logo: '🏷️',
      description: '',
      website: '',
      status: 'active',
      order: brands.length + 1
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (brand: BrandItem) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name || '',
      slug: brand.slug || '',
      logo: brand.logo || '🏷️',
      description: brand.description || '',
      website: brand.website || '',
      status: brand.status || 'active',
      order: brand.order ?? 0
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên thương hiệu.')
      return
    }

    setFormSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name.trim()),
        logo: formData.logo.trim() || '🏷️',
        description: formData.description.trim(),
        website: formData.website.trim(),
        status: formData.status,
        order: Number(formData.order) || 0
      }

      if (editingBrand) {
        const brandId = editingBrand._id || editingBrand.id || ''
        const res = await brandService.updateBrand(brandId, payload)
        setAlertInfo({ type: 'success', message: res.message || 'Cập nhật thương hiệu thành công!' })
      } else {
        const res = await brandService.createBrand(payload)
        setAlertInfo({ type: 'success', message: res.message || 'Thêm mới thương hiệu thành công!' })
      }

      setIsModalOpen(false)
      fetchBrands()
    } catch (err: any) {
      console.error('Lỗi khi lưu thương hiệu:', err)
      setFormError(err.response?.data?.error || err.message || 'Không thể lưu thương hiệu.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Quick Toggle Status
  const handleToggleStatus = async (brand: BrandItem) => {
    const brandId = brand._id || brand.id || ''
    if (!brandId) return

    const nextStatus = brand.status === 'active' ? 'hidden' : 'active'
    try {
      setActionLoadingId(brandId)
      await brandService.updateBrandStatus(brandId, nextStatus)
      setBrands(prev =>
        prev.map(b => ((b._id || b.id) === brandId ? { ...b, status: nextStatus } : b))
      )
      setAlertInfo({
        type: 'success',
        message: `Đã đổi trạng thái thương hiệu "${brand.name}" sang ${nextStatus === 'active' ? 'Hoạt động' : 'Đang ẩn'}.`
      })
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể cập nhật trạng thái.'
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Trigger Delete Modal
  const handlePromptDelete = (brand: BrandItem) => {
    setDeletingBrand(brand)
    setIsDeleteModalOpen(true)
  }

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingBrand) return
    const brandId = deletingBrand._id || deletingBrand.id || ''

    try {
      setActionLoadingId(brandId)
      const res = await brandService.deleteBrand(brandId)
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã xóa thương hiệu "${deletingBrand.name}" thành công!`
      })
      setIsDeleteModalOpen(false)
      setDeletingBrand(null)
      fetchBrands()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể xóa thương hiệu do ràng buộc dữ liệu.'
      })
      setIsDeleteModalOpen(false)
    } finally {
      setActionLoadingId(null)
    }
  }

  // Quick stats
  const totalCount = brands.length
  const activeCount = brands.filter(b => b.status === 'active').length
  const hiddenCount = brands.filter(b => b.status === 'hidden').length
  const totalProductsLinked = brands.reduce((acc, b) => acc + (b.productCount || 0), 0)

  return (
    <motion.div
      key="admin-brands"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Tag size={18} className="text-[#ff4655]" weight="bold" />
            QUẢN LÝ THƯƠNG HIỆU // BRANDS ALLIANCE
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            Quản trị danh sách các hãng đối tác công nghệ, logo nhận diện và bảo toàn lịch sử sản phẩm.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#ff4655]/20 self-start sm:self-auto"
        >
          <Plus size={16} weight="bold" />
          Thêm thương hiệu mới
        </button>
      </div>

      {/* Alert Notification */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-3.5 rounded-md text-xs font-bold flex items-start justify-between gap-3 ${
              alertInfo.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === 'success' ? <CheckCircle size={18} /> : <WarningCircle size={18} />}
              <span>{alertInfo.message}</span>
            </div>
            <button onClick={() => setAlertInfo(null)} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-3.5 rounded-md">
          <div className="flex items-center justify-between text-zinc-500 text-[10px] font-mono uppercase">
            <span>TỔNG THƯƠNG HIỆU</span>
            <Tag size={16} />
          </div>
          <p className="text-xl font-black text-zinc-900 dark:text-white mt-1.5 font-mono">{totalCount}</p>
        </div>

        <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-md">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-[10px] font-mono uppercase">
            <span>HOẠT ĐỘNG</span>
            <CheckCircle size={16} />
          </div>
          <p className="text-xl font-black text-emerald-500 mt-1.5 font-mono">{activeCount}</p>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 p-3.5 rounded-md">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-[10px] font-mono uppercase">
            <span>ĐANG ẨN</span>
            <EyeSlash size={16} />
          </div>
          <p className="text-xl font-black text-amber-500 mt-1.5 font-mono">{hiddenCount}</p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 p-3.5 rounded-md">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 text-[10px] font-mono uppercase">
            <span>SP THAM CHIẾU</span>
            <Package size={16} />
          </div>
          <p className="text-xl font-black text-purple-500 mt-1.5 font-mono">{totalProductsLinked}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-50 dark:bg-zinc-900/30 p-3 rounded-md border border-zinc-200 dark:border-zinc-800/60">
        <div className="relative w-full sm:w-80">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc slug thương hiệu..."
            className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động (active)</option>
            <option value="hidden">Đang ẩn (hidden)</option>
            <option value="inactive">Dừng hoạt động (inactive)</option>
          </select>

          <button
            onClick={() => fetchBrands()}
            title="Tải lại danh sách"
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655] dark:hover:text-[#ff4655] transition-colors"
          >
            <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Brands Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4">Thương Hiệu & Logo</th>
              <th className="py-3 px-4">Đường dẫn (Slug)</th>
              <th className="py-3 px-4">Website</th>
              <th className="py-3 px-4 text-center">Sản phẩm</th>
              <th className="py-3 px-4 text-center">Thứ tự</th>
              <th className="py-3 px-4 text-center">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowsClockwise size={24} className="animate-spin text-[#ff4655]" />
                    <span className="font-mono text-xs uppercase">Đang nạp dữ liệu thương hiệu...</span>
                  </div>
                </td>
              </tr>
            ) : brands.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <Tag size={32} className="opacity-40" />
                    <span>Không tìm thấy thương hiệu nào.</span>
                  </div>
                </td>
              </tr>
            ) : (
              brands.map(brand => {
                const brandId = brand._id || brand.id || ''
                return (
                  <tr
                    key={brandId}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Logo & Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-base">
                          {brand.logo || '🏷️'}
                        </span>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                            {brand.name}
                          </span>
                          {brand.description && (
                            <p className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs">{brand.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        /{brand.slug}
                      </span>
                    </td>

                    {/* Website */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {brand.website ? (
                        <a
                          href={brand.website}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:underline max-w-[150px] truncate"
                        >
                          <Globe size={13} />
                          <span className="truncate">{brand.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      ) : (
                        <span className="text-zinc-400 font-mono text-[10px]">--</span>
                      )}
                    </td>

                    {/* Product Count */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        (brand.productCount || 0) > 0 
                          ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' 
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'
                      }`}>
                        <Package size={12} />
                        {brand.productCount ?? 0}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-500">
                      {brand.order ?? 0}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          brand.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : brand.status === 'hidden'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {brand.status === 'active' ? 'Hoạt động' : brand.status === 'hidden' ? 'Đang ẩn' : 'Dừng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(brand)}
                          disabled={actionLoadingId === brandId}
                          title={brand.status === 'active' ? 'Ẩn thương hiệu' : 'Hiển thị thương hiệu'}
                          className={`p-1.5 rounded border transition-colors ${
                            brand.status === 'active'
                              ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10'
                              : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                        >
                          {brand.status === 'active' ? <EyeSlash size={14} /> : <Eye size={14} />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(brand)}
                          title="Chỉnh sửa thương hiệu"
                          className="p-1.5 rounded border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <PencilSimple size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handlePromptDelete(brand)}
                          disabled={actionLoadingId === brandId}
                          title="Xóa thương hiệu"
                          className="p-1.5 rounded border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Thêm / Chỉnh sửa Thương hiệu */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-lg w-full p-6 shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <Tag size={20} className="text-[#ff4655]" weight="bold" />
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    {editingBrand ? 'CHỈNH SỬA THƯƠNG HIỆU' : 'THÊM MỚI THƯƠNG HIỆU'}
                  </h4>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-500 rounded text-xs font-bold flex items-center gap-2">
                  <WarningCircle size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                {/* Tên Thương hiệu */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Tên Thương Hiệu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => {
                      const newName = e.target.value
                      setFormData(prev => ({
                        ...prev,
                        name: newName,
                        slug: !editingBrand ? generateSlug(newName) : prev.slug
                      }))
                    }}
                    placeholder="VD: ASUS, RAZER, APPLE, LOGITECH..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                {/* Slug & Logo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      Đường dẫn định danh (Slug) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().trim() }))}
                      placeholder="vd: asus, razer"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      Biểu tượng (Logo/Emoji)
                    </label>
                    <input
                      type="text"
                      value={formData.logo}
                      onChange={e => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                      placeholder="🏷️"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-center text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>
                </div>

                {/* Website chính thức */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Website chính thức (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://www.asus.com"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Mô tả thương hiệu
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Giới thiệu xuất xứ, thế mạnh công nghệ của hãng..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                {/* Thứ tự & Trạng thái */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      Thứ tự hiển thị
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={e => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    >
                      <option value="active">Hoạt động (Hiển thị)</option>
                      <option value="hidden">Đang ẩn</option>
                      <option value="inactive">Dừng hoạt động</option>
                    </select>
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold uppercase tracking-wider"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-5 py-2 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white rounded font-bold uppercase tracking-wider shadow-md shadow-[#ff4655]/20 flex items-center gap-2"
                  >
                    {formSubmitting && <ArrowsClockwise size={14} className="animate-spin" />}
                    {editingBrand ? 'Lưu thay đổi' : 'Tạo thương hiệu'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Xác nhận xóa an toàn */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingBrand && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-500">
                <div className="p-3 bg-red-500/10 rounded-full border border-red-500/20">
                  <WarningCircle size={24} weight="bold" />
                </div>
                <div>
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                    Xác nhận xóa thương hiệu
                  </h4>
                  <p className="text-[10px] text-zinc-400">Bảo toàn dữ liệu lịch sử sản phẩm và đơn hàng</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tên thương hiệu:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{deletingBrand.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Slug:</span>
                  <span className="font-mono text-zinc-400">/{deletingBrand.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sản phẩm tham chiếu:</span>
                  <span className={`font-mono font-bold ${
                    (deletingBrand.productCount || 0) > 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {deletingBrand.productCount || 0} sản phẩm
                  </span>
                </div>
              </div>

              {(deletingBrand.productCount || 0) > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-600 dark:text-amber-400 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <WarningCircle size={15} />
                    CẢNH BÁO TOÀN VẸN DỮ LIỆU LỊCH SỬ
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Thương hiệu này đang được tham chiếu bởi <strong>{deletingBrand.productCount}</strong> sản phẩm trên hệ thống. 
                    Việc xóa cứng sẽ làm sai lệch dữ liệu lịch sử và thông tin sản phẩm. 
                    Hệ thống yêu cầu bạn chuyển trạng thái sang <strong>"Đang ẩn"</strong> hoặc <strong>"Dừng hoạt động"</strong> thay vì xóa.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Thương hiệu này không có sản phẩm nào tham chiếu. Bạn có chắc chắn muốn xóa vĩnh viễn không?
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-bold uppercase text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={actionLoadingId === (deletingBrand._id || deletingBrand.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5"
                >
                  {actionLoadingId === (deletingBrand._id || deletingBrand.id) && (
                    <ArrowsClockwise size={14} className="animate-spin" />
                  )}
                  Xác nhận xóa
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
