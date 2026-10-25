import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  FolderSimple, 
  Plus, 
  PencilSimple, 
  Trash, 
  Eye, 
  EyeSlash, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  CheckCircle, 
  WarningCircle, 
  TreeStructure, 
  X,
  Package,
  UploadSimple
} from '@phosphor-icons/react'
import { categoryService, type CategoryItem } from '../../../../services/categoryService'
import apiClient from '../../../../api/client'

export default function AdminCategoriesTab() {
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Icon upload state (D3)
  const iconFileInputRef = useRef<HTMLInputElement>(null)
  const [iconUploading, setIconUploading] = useState<boolean>(false)
  const [iconUploadError, setIconUploadError] = useState<string | null>(null)

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '💻',
    image: '',
    parent_id: '',
    status: 'active' as 'active' | 'hidden' | 'inactive',
    order: 0
  })
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false)
  const [formError, setFormError] = useState<string | null>(null)

  // Delete Confirmation State
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(null)
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

  // D3: Tải ảnh icon từ máy tính
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIconUploadError(null)

    // Giới hạn dung lượng tối đa 2MB
    if (file.size > 2 * 1024 * 1024) {
      setIconUploadError('Dung lượng file icon không được vượt quá 2MB.')
      return
    }

    // Kiểm tra định dạng (PNG, JPG, SVG, WEBP)
    const allowed = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowed.includes(file.type) && !file.name.toLowerCase().endsWith('.svg')) {
      setIconUploadError('Chỉ hỗ trợ file icon PNG, SVG, WEBP hoặc JPG.')
      return
    }

    const uploadData = new FormData()
    uploadData.append('icon', file)

    try {
      setIconUploading(true)
      const res = await apiClient.post<{ message: string; url: string }>('/upload/category-icon', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      if (res.data?.url) {
        setFormData(prev => ({ ...prev, icon: res.data.url }))
      }
    } catch (err: any) {
      setIconUploadError(err.response?.data?.error || 'Lỗi khi tải ảnh icon lên.')
    } finally {
      setIconUploading(false)
      if (iconFileInputRef.current) iconFileInputRef.current.value = ''
    }
  }

  // Load danh sách danh mục (gọi endpoint admin)
  const fetchCategories = async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAdminCategories({
        search: search.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 100
      })
      if (data && Array.isArray(data.categories)) {
        setCategories(data.categories)
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh mục:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể tải danh sách danh mục.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [search, statusFilter])

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '💻',
      image: '',
      parent_id: '',
      status: 'active',
      order: categories.length + 1
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat)
    const parentIdVal = typeof cat.parent_id === 'object' && cat.parent_id !== null
      ? cat.parent_id._id
      : (cat.parent_id || '')

    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      icon: cat.icon || '💻',
      image: cat.image || '',
      parent_id: parentIdVal,
      status: cat.status || 'active',
      order: cat.order ?? 0
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.name.trim()) {
      setFormError('Vui lòng nhập tên danh mục.')
      return
    }

    setFormSubmitting(true)
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || generateSlug(formData.name.trim()),
        description: formData.description.trim(),
        icon: formData.icon.trim() || '💻',
        image: formData.image.trim(),
        parent_id: formData.parent_id ? formData.parent_id : null,
        status: formData.status,
        order: Number(formData.order) || 0
      }

      if (editingCategory) {
        const catId = editingCategory._id || editingCategory.id || ''
        const res = await categoryService.updateCategory(catId, payload)
        setAlertInfo({ type: 'success', message: res.message || 'Cập nhật danh mục thành công!' })
      } else {
        const res = await categoryService.createCategory(payload)
        setAlertInfo({ type: 'success', message: res.message || 'Thêm mới danh mục thành công!' })
      }

      setIsModalOpen(false)
      fetchCategories()
    } catch (err: any) {
      console.error('Lỗi khi lưu danh mục:', err)
      setFormError(err.response?.data?.error || err.message || 'Không thể lưu danh mục.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Quick Toggle Status
  const handleToggleStatus = async (cat: CategoryItem) => {
    const catId = cat._id || cat.id || ''
    if (!catId) return

    const nextStatus = cat.status === 'active' ? 'hidden' : 'active'
    try {
      setActionLoadingId(catId)
      await categoryService.updateCategoryStatus(catId, nextStatus)
      setCategories(prev =>
        prev.map(c => ((c._id || c.id) === catId ? { ...c, status: nextStatus } : c))
      )
      setAlertInfo({
        type: 'success',
        message: `Đã chuyển trạng thái danh mục "${cat.name}" sang ${nextStatus === 'active' ? 'Hoạt động' : 'Đang ẩn'}.`
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
  const handlePromptDelete = (cat: CategoryItem) => {
    setDeletingCategory(cat)
    setIsDeleteModalOpen(true)
  }

  // Execute Safe Delete
  const handleConfirmDelete = async () => {
    if (!deletingCategory) return
    const catId = deletingCategory._id || deletingCategory.id || ''
    
    try {
      setActionLoadingId(catId)
      const res = await categoryService.deleteCategory(catId)
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã xóa danh mục "${deletingCategory.name}" thành công!`
      })
      setIsDeleteModalOpen(false)
      setDeletingCategory(null)
      fetchCategories()
    } catch (err: any) {
      // Backend error rejects if productCount > 0 or has children
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể xóa danh mục này do ràng buộc dữ liệu.'
      })
      setIsDeleteModalOpen(false)
    } finally {
      setActionLoadingId(null)
    }
  }

  // List of potential parent categories (excluding the one currently being edited)
  const availableParents = categories.filter(c => {
    const cId = c._id || c.id
    const editId = editingCategory ? (editingCategory._id || editingCategory.id) : null
    // Don't allow picking itself as parent
    if (editId && cId === editId) return false
    // Don't allow picking another child as parent to keep simple 2-level hierarchy
    const hasParent = Boolean(c.parent_id)
    return !hasParent
  })

  // Quick stats
  const totalCount = categories.length
  const activeCount = categories.filter(c => c.status === 'active').length
  const hiddenCount = categories.filter(c => c.status === 'hidden').length
  const childCount = categories.filter(c => Boolean(c.parent_id)).length

  return (
    <motion.div
      key="admin-categories"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <FolderSimple size={18} className="text-[#ff4655]" weight="bold" />
            QUẢN LÝ DANH MỤC THIẾT BỊ // CATEGORIES CONTROL
          </h3>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            Quản trị cấu trúc danh mục sản phẩm, phân cấp cha - con và kiểm soát trạng thái hiển thị toàn sàn.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white rounded-md text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#ff4655]/20 self-start sm:self-auto"
        >
          <Plus size={16} weight="bold" />
          Thêm danh mục mới
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
            <span>TỔNG DANH MỤC</span>
            <FolderSimple size={16} />
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

        <div className="bg-cyan-500/5 border border-cyan-500/20 p-3.5 rounded-md">
          <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 text-[10px] font-mono uppercase">
            <span>NHÁNH CON</span>
            <TreeStructure size={16} />
          </div>
          <p className="text-xl font-black text-cyan-500 mt-1.5 font-mono">{childCount}</p>
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
            placeholder="Tìm theo tên hoặc slug danh mục..."
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
            onClick={() => fetchCategories()}
            title="Tải lại danh sách"
            className="p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655] dark:hover:text-[#ff4655] transition-colors"
          >
            <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800/80 rounded-md">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              <th className="py-3 px-4">Tên Danh Mục & Biểu Tượng</th>
              <th className="py-3 px-4">Đường dẫn (Slug)</th>
              <th className="py-3 px-4">Phân Cấp</th>
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
                    <span className="font-mono text-xs uppercase">Đang nạp dữ liệu danh mục...</span>
                  </div>
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-zinc-500">
                  <div className="flex flex-col items-center gap-2">
                    <FolderSimple size={32} className="opacity-40" />
                    <span>Không tìm thấy danh mục nào phù hợp.</span>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map(cat => {
                const catId = cat._id || cat.id || ''
                const isChild = Boolean(cat.parent_id)
                const parentObj = typeof cat.parent_id === 'object' && cat.parent_id !== null ? cat.parent_id : null

                return (
                  <tr
                    key={catId}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/30 transition-colors"
                  >
                    {/* Name & Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-sm overflow-hidden shrink-0">
                          {cat.icon && (cat.icon.startsWith('http') || cat.icon.startsWith('/uploads')) ? (
                            <img src={cat.icon} alt={cat.name} className="w-5 h-5 object-contain" />
                          ) : (
                            cat.icon || '💻'
                          )}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wide">
                              {cat.name}
                            </span>
                            {isChild && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                                Nhánh con
                              </span>
                            )}
                          </div>
                          {cat.description && (
                            <p className="text-[10px] text-zinc-400 line-clamp-1 max-w-xs">{cat.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3.5 px-4 font-mono text-zinc-500 dark:text-zinc-400 text-[11px]">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                        /{cat.slug}
                      </span>
                    </td>

                    {/* Hierarchy (Cha / Con) */}
                    <td className="py-3.5 px-4 text-[11px]">
                      {isChild ? (
                        <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                          <TreeStructure size={13} className="text-cyan-500" />
                          <span className="font-semibold">{parentObj?.name || 'Danh mục cha'}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-mono text-zinc-400 uppercase">
                          // Gốc (Root)
                        </span>
                      )}
                    </td>

                    {/* Product Count */}
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        (cat.productCount || 0) > 0 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400'
                      }`}>
                        <Package size={12} />
                        {cat.productCount ?? 0}
                      </span>
                    </td>

                    {/* Order */}
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-500">
                      {cat.order ?? 0}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cat.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : cat.status === 'hidden'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}
                      >
                        {cat.status === 'active' ? 'Hoạt động' : cat.status === 'hidden' ? 'Đang ẩn' : 'Dừng'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Quick Toggle Status */}
                        <button
                          onClick={() => handleToggleStatus(cat)}
                          disabled={actionLoadingId === catId}
                          title={cat.status === 'active' ? 'Ẩn danh mục' : 'Hiển thị danh mục'}
                          className={`p-1.5 rounded border transition-colors ${
                            cat.status === 'active'
                              ? 'border-amber-500/20 text-amber-500 hover:bg-amber-500/10'
                              : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10'
                          }`}
                        >
                          {cat.status === 'active' ? <EyeSlash size={14} /> : <Eye size={14} />}
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Chỉnh sửa danh mục"
                          className="p-1.5 rounded border border-blue-500/20 text-blue-500 hover:bg-blue-500/10 transition-colors"
                        >
                          <PencilSimple size={14} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handlePromptDelete(cat)}
                          disabled={actionLoadingId === catId}
                          title="Xóa danh mục"
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

      {/* MODAL: Thêm / Chỉnh sửa danh mục */}
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
                  <FolderSimple size={20} className="text-[#ff4655]" weight="bold" />
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    {editingCategory ? 'CHỈNH SỬA DANH MỤC' : 'THÊM MỚI DANH MỤC'}
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
                {/* Tên Danh Mục */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Tên Danh Mục <span className="text-red-500">*</span>
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
                        // Tự động gợi ý slug nếu chưa sửa tay hoặc đang thêm mới
                        slug: !editingCategory ? generateSlug(newName) : prev.slug
                      }))
                    }}
                    placeholder="VD: LAPTOP & MACBOOK, BÀN PHÍM CƠ, CARD ĐỒ HỌA..."
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Đường dẫn định danh (Slug) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().trim() }))}
                    placeholder="vd: laptops, ban-phim-co"
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-mono text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                {/* Biểu tượng (Icon / Tải từ máy tính - D3) */}
                <div className="bg-zinc-100/60 dark:bg-zinc-900/60 p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono uppercase text-zinc-500 font-bold">
                      Biểu tượng danh mục (Icon / Emoji / Tải từ máy tính)
                    </label>
                    {formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/uploads')) && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: '💻' }))}
                        className="text-[10px] text-zinc-400 hover:text-[#ff4655] underline cursor-pointer"
                      >
                        Đặt lại icon mặc định
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3.5">
                    {/* Live Preview Box */}
                    <div className="w-12 h-12 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
                      {formData.icon && (formData.icon.startsWith('http') || formData.icon.startsWith('/uploads')) ? (
                        <img src={formData.icon} alt="preview" className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">{formData.icon || '💻'}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      {/* Nút Upload từ máy tính */}
                      <input
                        type="file"
                        ref={iconFileInputRef}
                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={handleIconUpload}
                        className="hidden"
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled={iconUploading}
                          onClick={() => iconFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          <UploadSimple size={14} className={iconUploading ? 'animate-bounce text-[#ff4655]' : ''} />
                          {iconUploading ? 'Đang tải lên...' : 'Chọn ảnh icon từ máy tính (PNG, SVG, WEBP)'}
                        </button>

                        <input
                          type="text"
                          value={formData.icon}
                          onChange={e => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                          placeholder="Hoặc nhập emoji / URL..."
                          className="flex-1 min-w-[130px] px-2.5 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                        />
                      </div>

                      {iconUploadError && (
                        <p className="text-[10px] text-[#ff4655] font-semibold">{iconUploadError}</p>
                      )}
                    </div>
                  </div>

                  {/* Preset Library Emojis */}
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                    <span className="text-[9px] font-mono text-zinc-400 block mb-1.5">Gợi ý biểu tượng công nghệ phổ biến:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['💻', '⌨️', '🖱️', '🎧', '🖥️', '⚡', '🎮', '🔌', '📦', '🔊', '📱', '💾', '🔧', '🛡️'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: emoji }))}
                          className={`w-7 h-7 rounded text-sm flex items-center justify-center border transition-all cursor-pointer ${
                            formData.icon === emoji
                              ? 'bg-[#ff4655]/20 border-[#ff4655] text-white scale-110'
                              : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-[#ff4655]/50'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Danh mục cha (Parent Hierarchy) */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Danh mục cha (Phân cấp bậc)
                  </label>
                  <select
                    value={formData.parent_id}
                    onChange={e => setFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  >
                    <option value="">-- Là danh mục cấp 1 (Danh mục gốc) --</option>
                    {availableParents.map(p => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.icon} {p.name} (/{p.slug})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-zinc-400 mt-1">
                    Chọn danh mục cha nếu đây là nhánh sản phẩm con (VD: 'Laptop Gaming' con của 'Laptop').
                  </p>
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-[10px] font-mono uppercase text-zinc-500 mb-1">
                    Mô tả danh mục
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả ngắn gọn về nhóm danh mục này..."
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
                    {editingCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Xác nhận xóa an toàn */}
      <AnimatePresence>
        {isDeleteModalOpen && deletingCategory && (
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
                    Xác nhận xóa danh mục
                  </h4>
                  <p className="text-[10px] text-zinc-400">Kiểm tra an toàn tính toàn vẹn dữ liệu hệ thống</p>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tên danh mục:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">{deletingCategory.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Slug:</span>
                  <span className="font-mono text-zinc-400">/{deletingCategory.slug}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Sản phẩm đang dùng:</span>
                  <span className={`font-mono font-bold ${
                    (deletingCategory.productCount || 0) > 0 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {deletingCategory.productCount || 0} sản phẩm
                  </span>
                </div>
              </div>

              {(deletingCategory.productCount || 0) > 0 ? (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-amber-600 dark:text-amber-400 text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <WarningCircle size={15} />
                    CẢNH BÁO TOÀN VẸN DỮ LIỆU
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Danh mục này đang được gán cho <strong>{deletingCategory.productCount}</strong> sản phẩm trên sàn.
                    Hệ thống sẽ từ chối xóa để tránh sản phẩm bị mất liên kết danh mục. Bạn nên chuyển trạng thái sang <strong>"Đang ẩn"</strong> hoặc <strong>"Dừng hoạt động"</strong> thay vì xóa cứng.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-zinc-500">
                  Danh mục này không có sản phẩm nào đang sử dụng. Bạn có chắc chắn muốn xóa vĩnh viễn không?
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
                  disabled={actionLoadingId === (deletingCategory._id || deletingCategory.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5"
                >
                  {actionLoadingId === (deletingCategory._id || deletingCategory.id) && (
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
