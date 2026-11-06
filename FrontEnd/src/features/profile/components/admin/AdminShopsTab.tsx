import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Storefront,
  PlusCircle,
  CheckCircle,
  XCircle,
  Lock,
  LockOpen,
  Clock,
  WarningCircle,
  MagnifyingGlass,
  ArrowsClockwise,
  Envelope,
  Phone,
  MapPin,
  X,
  User,
  Eye
} from '@phosphor-icons/react'
import { shopService, type ShopItem } from '../../../../services/shopService'

interface AdminShopsTabProps {
  initialStatus?: string
  token?: string | null
  shopsList?: any[]
  onRefresh?: () => void
}

function getSafeNumber(val: any, fallback = 0): number {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'number') return isNaN(val) ? fallback : val
  if (typeof val === 'object' && val.$numberDecimal) {
    const n = parseFloat(val.$numberDecimal)
    return isNaN(n) ? fallback : n
  }
  const n = parseFloat(String(val))
  return isNaN(n) ? fallback : n
}

function getSafeCommission(val: any): string {
  if (val === null || val === undefined) return '5'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'object' && val.$numberDecimal) return String(val.$numberDecimal)
  if (typeof val === 'object') return '5'
  return String(val)
}

export default function AdminShopsTab({
  initialStatus,
  onRefresh
}: AdminShopsTabProps) {
  const [shops, setShops] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'locked' | 'rejected'>(
    ['all', 'pending', 'active', 'locked', 'rejected'].includes(initialStatus as any)
      ? (initialStatus as any)
      : 'all'
  )
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Counts across all statuses
  const [counts, setCounts] = useState<{ all: number; pending: number; active: number; locked: number; rejected: number }>({
    all: 0,
    pending: 0,
    active: 0,
    locked: 0,
    rejected: 0
  })

  // Review Modal State (Xét duyệt hồ sơ shop)
  const [reviewShop, setReviewShop] = useState<ShopItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [reviewingLoading, setReviewingLoading] = useState(false)

  // Lock Shop Confirmation Modal
  const [lockTargetShop, setLockTargetShop] = useState<ShopItem | null>(null)

  // Manual Shop Creation Modal State (Tạo shop thủ công)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createMode, setCreateMode] = useState<'new_owner' | 'existing_owner'>('new_owner')
  const [submittingCreate, setSubmittingCreate] = useState(false)

  // Candidate Users for assigning shop
  const [candidateUsers, setCandidateUsers] = useState<
    { _id: string; name: string; email: string; phone?: string; role: string; status: string }[]
  >([])
  const [candidateLoading, setCandidateLoading] = useState(false)

  // Form tạo shop thủ công
  const [createForm, setCreateForm] = useState({
    // Mode new_owner
    ownerName: '',
    ownerEmail: '',
    ownerPassword: '',
    ownerPhone: '',
    // Mode existing_owner
    userId: '',
    userEmail: '',
    // Shop fields
    shopName: '',
    category: 'Gaming Hardware & Gear',
    logo: '🏬',
    description: '',
    phone: '',
    email: '',
    address: '',
    commission_rate: 5.0,
    status: 'active' as 'active' | 'pending' | 'locked'
  })

  // Load danh sách shop từ Backend
  const fetchShops = useCallback(async () => {
    try {
      setLoading(true)
      const data = await shopService.getAdminShops({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        limit: 100
      })
      if (data && Array.isArray(data.shops)) {
        setShops(data.shops)
      }
      if (data.counts) {
        setCounts(data.counts)
      } else {
        // Fallback tự tính nếu backend không trả
        setCounts({
          all: data.total || data.shops.length,
          pending: data.shops.filter(s => s.status === 'pending').length,
          active: data.shops.filter(s => s.status === 'active').length,
          locked: data.shops.filter(s => s.status === 'locked').length,
          rejected: data.shops.filter(s => s.status === 'rejected').length
        })
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách gian hàng:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể tải danh sách gian hàng.'
      })
    } finally {
      setLoading(false)
    }
  }, [statusFilter, search])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  // Tải danh sách người dùng khả dụng khi chọn mode existing_owner
  const loadCandidates = useCallback(async () => {
    try {
      setCandidateLoading(true)
      const res = await shopService.getCandidateUsers()
      if (res && res.users) {
        setCandidateUsers(res.users)
      }
    } catch (err) {
      console.error('Lỗi tải candidate users:', err)
    } finally {
      setCandidateLoading(false)
    }
  }, [])

  useEffect(() => {
    if (showCreateModal && createMode === 'existing_owner') {
      loadCandidates()
    }
  }, [showCreateModal, createMode, loadCandidates])

  // ============================================================
  // XỬ LÝ PHÊ DUYỆT / TỪ CHỐI / KHÓA GIAN HÀNG
  // ============================================================

  // 1. Phê duyệt gian hàng
  const handleApprove = async (shop: ShopItem) => {
    const shopId = shop._id || shop.id
    if (!shopId) return

    try {
      setReviewingLoading(true)
      setActionLoadingId(shopId)
      const res = await shopService.updateShopStatus(shopId, 'active')
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã phê duyệt gian hàng "${shop.name || shop.shop_name}" thành công!`
      })
      setReviewShop(null)
      setShowRejectForm(false)
      setRejectReason('')
      fetchShops()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Lỗi khi phê duyệt gian hàng.'
      })
    } finally {
      setReviewingLoading(false)
      setActionLoadingId(null)
    }
  }

  // 2. Từ chối hồ sơ đăng ký gian hàng
  const handleReject = async (shop: ShopItem) => {
    const shopId = shop._id || shop.id
    if (!shopId) return

    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối để thông báo cho đối tác!')
      return
    }

    try {
      setReviewingLoading(true)
      setActionLoadingId(shopId)
      const res = await shopService.updateShopStatus(shopId, 'rejected', rejectReason.trim())
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã từ chối gian hàng "${shop.name || shop.shop_name}".`
      })
      setReviewShop(null)
      setShowRejectForm(false)
      setRejectReason('')
      fetchShops()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Lỗi khi từ chối gian hàng.'
      })
    } finally {
      setReviewingLoading(false)
      setActionLoadingId(null)
    }
  }

  // 3. Khóa gian hàng
  const handleConfirmLock = async () => {
    if (!lockTargetShop) return
    const shopId = lockTargetShop._id || lockTargetShop.id
    if (!shopId) return

    try {
      setActionLoadingId(shopId)
      const res = await shopService.updateShopStatus(shopId, 'locked')
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã khóa gian hàng "${lockTargetShop.name || lockTargetShop.shop_name}".`
      })
      setLockTargetShop(null)
      fetchShops()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Lỗi khi khóa gian hàng.'
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // 4. Mở khóa / Kích hoạt lại gian hàng
  const handleUnlock = async (shop: ShopItem) => {
    const shopId = shop._id || shop.id
    if (!shopId) return

    try {
      setActionLoadingId(shopId)
      const res = await shopService.updateShopStatus(shopId, 'active')
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã kích hoạt lại gian hàng "${shop.name || shop.shop_name}".`
      })
      fetchShops()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Lỗi khi kích hoạt lại gian hàng.'
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // ============================================================
  // XỬ LÝ TẠO GIAN HÀNG THỦ CÔNG TỪ ADMIN
  // ============================================================
  const handleCreateShopSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!createForm.shopName.trim()) {
      setAlertInfo({ type: 'error', message: 'Vui lòng nhập tên gian hàng.' })
      return
    }

    if (createMode === 'new_owner') {
      if (!createForm.ownerName.trim() || !createForm.ownerEmail.trim() || !createForm.ownerPassword) {
        setAlertInfo({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin chủ sở hữu và mật khẩu.' })
        return
      }
    } else {
      if (!createForm.userId && !createForm.userEmail.trim()) {
        setAlertInfo({ type: 'error', message: 'Vui lòng chọn hoặc nhập email người dùng để gán gian hàng.' })
        return
      }
    }

    setSubmittingCreate(true)
    try {
      const payload: any = {
        mode: createMode,
        name: createForm.shopName.trim(),
        shopName: createForm.shopName.trim(),
        category: createForm.category.trim(),
        logo: createForm.logo.trim() || '🏬',
        description: createForm.description.trim(),
        phone: createForm.phone.trim() || (createMode === 'new_owner' ? createForm.ownerPhone.trim() : undefined),
        email: createForm.email.trim() || (createMode === 'new_owner' ? createForm.ownerEmail.trim() : undefined),
        address: createForm.address.trim(),
        commission_rate: Number(createForm.commission_rate) || 5.0,
        status: createForm.status
      }

      if (createMode === 'new_owner') {
        payload.ownerName = createForm.ownerName.trim()
        payload.ownerEmail = createForm.ownerEmail.trim().toLowerCase()
        payload.ownerPassword = createForm.ownerPassword
        payload.ownerPhone = createForm.ownerPhone.trim()
      } else {
        payload.userId = createForm.userId || undefined
        payload.userEmail = createForm.userEmail.trim().toLowerCase() || undefined
      }

      const res = await shopService.adminCreateShop(payload)

      setAlertInfo({
        type: 'success',
        message: res.message || `Đã tạo gian hàng "${res.shop?.name || createForm.shopName}" thành công!`
      })

      // Đặt lại form
      setCreateForm({
        ownerName: '',
        ownerEmail: '',
        ownerPassword: '',
        ownerPhone: '',
        userId: '',
        userEmail: '',
        shopName: '',
        category: 'Gaming Hardware & Gear',
        logo: '🏬',
        description: '',
        phone: '',
        email: '',
        address: '',
        commission_rate: 5.0,
        status: 'active'
      })
      setShowCreateModal(false)
      fetchShops()
      if (onRefresh) onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || err.message || 'Lỗi khi tạo gian hàng thủ công.'
      })
    } finally {
      setSubmittingCreate(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Thông báo Alert */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold shadow-sm ${
              alertInfo.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border-red-500/30 text-[#ff4655]'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === 'success' ? (
                <CheckCircle size={18} weight="fill" />
              ) : (
                <WarningCircle size={18} weight="fill" />
              )}
              <span>{alertInfo.message}</span>
            </div>
            <button
              onClick={() => setAlertInfo(null)}
              className="text-[10px] uppercase font-black hover:opacity-80 ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header và Thanh điều khiển */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center">
                <Storefront size={20} weight="bold" />
              </span>
              <h2 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                QUẢN LÝ GIAN HÀNG & PHÊ DUYỆT ĐỐI TÁC
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Xét duyệt hồ sơ mở shop người dùng nộp lên, cấp tài khoản shop thủ công và giám sát đối tác toàn sàn.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchShops()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#ff4655] border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <ArrowsClockwise size={14} className={loading ? 'animate-spin' : ''} weight="bold" />
              <span>Làm mới</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase rounded-lg bg-[#ff4655] hover:bg-[#e03d4b] text-white shadow-md shadow-[#ff4655]/20 transition-all cursor-pointer"
            >
              <PlusCircle size={16} weight="bold" />
              <span>Tạo shop thủ công</span>
            </button>
          </div>
        </div>

        {/* Status Tabs and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-2">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả', count: counts.all },
              {
                id: 'pending',
                label: 'Chờ duyệt',
                count: counts.pending,
                badgeColor: 'bg-amber-500 text-white animate-pulse'
              },
              { id: 'active', label: 'Đang hoạt động', count: counts.active },
              { id: 'locked', label: 'Bị khóa', count: counts.locked },
              { id: 'rejected', label: 'Đã từ chối', count: counts.rejected }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      statusFilter === tab.id
                        ? 'bg-white/20 text-white'
                        : tab.badgeColor || 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, email, sđt..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655]"
            />
          </div>
        </div>
      </div>

      {/* Banner thông báo nếu có shop đang chờ duyệt */}
      {counts.pending > 0 && statusFilter !== 'pending' && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
            <Clock size={18} weight="fill" className="text-amber-500 shrink-0" />
            <span>
              Hệ thống đang có <strong>{counts.pending}</strong> hồ sơ mở gian hàng từ người dùng đang chờ quản trị viên xét duyệt.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('pending')}
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-black uppercase tracking-wider shrink-0 cursor-pointer shadow-sm"
          >
            Xem và duyệt ngay
          </button>
        </div>
      )}

      {/* Bảng danh sách Cửa hàng */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Gian hàng</th>
                <th className="px-5 py-3.5">Phân khúc</th>
                <th className="px-5 py-3.5">Chủ sở hữu & Liên hệ</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-medium">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-40" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-28 ml-auto" /></td>
                  </tr>
                ))
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                    <Storefront size={36} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">
                      {statusFilter === 'pending'
                        ? 'Tuyệt vời! Hiện không có hồ sơ gian hàng nào đang chờ duyệt.'
                        : 'Không tìm thấy gian hàng nào trong danh mục này.'}
                    </p>
                  </td>
                </tr>
              ) : (
                shops.map(s => {
                  const shopId = s._id || s.id || ''
                  const isPending = s.status === 'pending'
                  const isActive = s.status === 'active'
                  const isLocked = s.status === 'locked'
                  const isRejected = s.status === 'rejected'

                  return (
                    <tr
                      key={shopId}
                      className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors ${
                        isPending ? 'bg-amber-500/5 dark:bg-amber-500/5' : ''
                      }`}
                    >
                      {/* Logo and Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-xl shrink-0">
                            {s.logo || '🏬'}
                          </span>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                              <span>{s.name || s.shop_name}</span>
                              <span
                                className={`text-[10px] font-extrabold ${
                                  getSafeNumber(s.rating) > 0 ? 'text-amber-500' : 'text-zinc-400'
                                }`}
                              >
                                ⭐ {getSafeNumber(s.rating) > 0 ? getSafeNumber(s.rating).toFixed(1) : '0.0'}
                              </span>
                            </div>
                            {s.address && (
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {s.address}
                              </div>
                            )}
                            {s.createdAt && (
                              <div className="text-[9px] text-zinc-400 font-mono mt-0.5">
                                Tạo ngày: {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category & Commission */}
                      <td className="px-5 py-4">
                        <div className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {s.category || 'Phần cứng & Thiết bị'}
                        </div>
                        {s.commission_rate !== undefined && s.commission_rate !== null && (
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                            Phí sàn: {getSafeCommission(s.commission_rate)}%
                          </div>
                        )}
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                            <User size={12} className="text-zinc-400" />
                            <span>{s.ownerId?.name || 'Đối tác GearTech'}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                            <Envelope size={10} /> {s.email || s.ownerId?.email || '—'}
                          </div>
                          {(s.phone || s.ownerId?.phone) && (
                            <div className="text-[10px] text-zinc-400 font-mono flex items-center gap-1">
                              <Phone size={10} /> {s.phone || s.ownerId?.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30 animate-pulse">
                            <Clock size={12} weight="fill" /> Chờ duyệt
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle size={12} weight="fill" /> Đang hoạt động
                          </span>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30">
                            <Lock size={12} weight="fill" /> Bị khóa
                          </span>
                        )}
                        {isRejected && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                              <XCircle size={12} weight="fill" /> Bị từ chối
                            </span>
                            {s.rejectReason && (
                              <p className="text-[10px] text-red-400 italic mt-1 max-w-[160px] truncate" title={s.rejectReason}>
                                Lý do: {s.rejectReason}
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setReviewShop(s)
                                  setShowRejectForm(false)
                                  setRejectReason('')
                                }}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/30 transition-all flex items-center gap-1 cursor-pointer"
                                title="Xem hồ sơ và xét duyệt"
                              >
                                <Eye size={13} weight="bold" />
                                <span>Xem & Duyệt</span>
                              </button>

                              <button
                                onClick={() => handleApprove(s)}
                                disabled={actionLoadingId === shopId}
                                className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                                title="Phê duyệt nhanh"
                              >
                                <CheckCircle size={13} weight="bold" />
                                <span>Duyệt nhanh</span>
                              </button>
                            </>
                          )}

                          {isActive && (
                            <button
                              onClick={() => setLockTargetShop(s)}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Khóa gian hàng"
                            >
                              <Lock size={13} weight="bold" />
                              <span>Khóa</span>
                            </button>
                          )}

                          {isLocked && (
                            <button
                              onClick={() => handleUnlock(s)}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Mở khóa gian hàng"
                            >
                              <LockOpen size={13} weight="bold" />
                              <span>Mở khóa</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleApprove(s)}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              title="Xem xét và duyệt lại"
                            >
                              <CheckCircle size={13} weight="bold" />
                              <span>Duyệt lại</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODAL 1: XÉT DUYỆT HỒ SƠ GIAN HÀNG CHI TIẾT */}
      {/* ============================================================ */}
      {reviewShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-5 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Storefront size={20} className="text-[#ff4655]" weight="bold" />
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                  XÉT DUYỆT HỒ SƠ GIAN HÀNG ĐỐI TÁC
                </h3>
              </div>
              <button
                onClick={() => {
                  setReviewShop(null)
                  setShowRejectForm(false)
                  setRejectReason('')
                }}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Thông tin chi tiết Shop */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                  {reviewShop.logo || '🏬'}
                </span>
                <div>
                  <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                    {reviewShop.name || reviewShop.shop_name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30 uppercase">
                    {reviewShop.category || 'Gaming Hardware & Gear'}
                  </span>
                </div>
              </div>

              {reviewShop.description && (
                <div className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <span className="font-bold text-zinc-400 text-[10px] uppercase block mb-1">Mô tả giới thiệu:</span>
                  {reviewShop.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Chủ tài khoản:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {reviewShop.ownerId?.name || 'Chưa liên kết'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Email liên hệ:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {reviewShop.email || reviewShop.ownerId?.email || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Số điện thoại:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {reviewShop.phone || reviewShop.ownerId?.phone || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Trụ sở / Địa chỉ:</span>
                  <span className="text-zinc-700 dark:text-zinc-300 truncate block">
                    {reviewShop.address || 'Việt Nam'}
                  </span>
                </div>
              </div>
            </div>

            {/* Khung nhập lý do từ chối nếu bấm nút Từ chối */}
            {showRejectForm ? (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl space-y-3 animate-in fade-in">
                <label className="block text-xs font-bold text-red-500 uppercase">
                  Nhập lý do từ chối hồ sơ này:
                </label>
                <textarea
                  rows={2}
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  placeholder="VD: Tên gian hàng không phù hợp quy định, vui lòng cập nhật lại thông tin giấy tờ hoặc số điện thoại..."
                  className="w-full text-xs p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
                <div className="flex gap-2">
                  {['Tên shop không hợp lệ', 'Thiếu thông tin liên hệ', 'Trùng thương hiệu đã đăng ký'].map(sample => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => setRejectReason(sample)}
                      className="px-2 py-1 text-[10px] rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-red-500 cursor-pointer"
                    >
                      + {sample}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 text-xs font-bold rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    disabled={reviewingLoading}
                    onClick={() => handleReject(reviewShop)}
                    className="px-4 py-1.5 text-xs font-black uppercase rounded bg-red-600 hover:bg-red-500 text-white cursor-pointer transition-colors"
                  >
                    {reviewingLoading ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle size={15} weight="bold" />
                  <span>Từ chối hồ sơ</span>
                </button>

                <button
                  type="button"
                  disabled={reviewingLoading}
                  onClick={() => handleApprove(reviewShop)}
                  className="px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={16} weight="bold" />
                  <span>{reviewingLoading ? 'Đang phê duyệt...' : 'Phê duyệt gian hàng'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 2: XÁC NHẬN KHÓA GIAN HÀNG */}
      {/* ============================================================ */}
      {lockTargetShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center shrink-0">
                <Lock size={20} weight="bold" />
              </span>
              <div>
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white">
                  Xác nhận khóa gian hàng?
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {lockTargetShop.name || lockTargetShop.shop_name}
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg leading-relaxed">
              Khi bị khóa, gian hàng và toàn bộ sản phẩm của đối tác này sẽ <strong>tạm dừng hiển thị</strong> đối với khách hàng trên toàn sàn GearTech.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setLockTargetShop(null)}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmLock}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                Đồng ý khóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL 3: TẠO GIAN HÀNG THỦ CÔNG TỪ ADMIN */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle size={20} className="text-[#ff4655]" weight="bold" />
                <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                  TẠO GIAN HÀNG ĐỐI TÁC THỦ CÔNG
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 border border-zinc-200 dark:border-zinc-700">
              <button
                type="button"
                onClick={() => setCreateMode('new_owner')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  createMode === 'new_owner'
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                1. Cấp tài khoản mới kèm gian hàng
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('existing_owner')}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all cursor-pointer ${
                  createMode === 'existing_owner'
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                2. Gán gian hàng cho tài khoản đã có
              </button>
            </div>

            <form onSubmit={handleCreateShopSubmit} className="space-y-4">
              {/* MODE 1: CHỦ SỞ HỮU MỚI */}
              {createMode === 'new_owner' && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <User size={14} weight="bold" className="text-[#ff4655]" />
                    Thông tin tài khoản chủ sở hữu mới
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Họ tên chủ shop *</label>
                      <input
                        type="text"
                        required
                        value={createForm.ownerName}
                        onChange={e => setCreateForm({ ...createForm, ownerName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Số điện thoại</label>
                      <input
                        type="text"
                        value={createForm.ownerPhone}
                        onChange={e => setCreateForm({ ...createForm, ownerPhone: e.target.value })}
                        placeholder="0901234567"
                        className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Email đăng nhập *</label>
                      <input
                        type="email"
                        required
                        value={createForm.ownerEmail}
                        onChange={e => setCreateForm({ ...createForm, ownerEmail: e.target.value })}
                        placeholder="partner@asus.com"
                        className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mật khẩu khởi tạo * (≥ 6 ký tự)</label>
                      <input
                        type="password"
                        required
                        value={createForm.ownerPassword}
                        onChange={e => setCreateForm({ ...createForm, ownerPassword: e.target.value })}
                        placeholder="••••••••"
                        className="w-full text-xs font-medium px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* MODE 2: CHỌN USER CÓ SẴN */}
              {createMode === 'existing_owner' && (
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                  <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <User size={14} weight="bold" className="text-blue-500" />
                    Chọn tài khoản người dùng có sẵn trên sàn
                  </h4>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase">
                      Tìm kiếm và chọn người dùng:
                    </label>
                    <select
                      value={createForm.userId}
                      onChange={e => {
                        const u = candidateUsers.find(item => item._id === e.target.value)
                        setCreateForm({
                          ...createForm,
                          userId: e.target.value,
                          userEmail: u?.email || ''
                        })
                      }}
                      className="w-full text-xs font-bold px-3 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="">
                        {candidateLoading ? '-- Đang tải danh sách tài khoản... --' : '-- Chọn tài khoản từ danh sách --'}
                      </option>
                      {candidateUsers.map(u => (
                        <option key={u._id} value={u._id}>
                          👤 {u.name} — {u.email} {u.phone ? `(${u.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Hoặc nhập chính xác Email người dùng:
                    </label>
                    <input
                      type="email"
                      value={createForm.userEmail}
                      onChange={e => setCreateForm({ ...createForm, userEmail: e.target.value })}
                      placeholder="user@example.com"
                      className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* THÔNG TIN GIAN HÀNG CHUNG */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-200 dark:border-zinc-700/80 space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Storefront size={14} weight="bold" className="text-emerald-500" />
                  Thông tin gian hàng đối tác
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tên gian hàng *</label>
                    <input
                      type="text"
                      required
                      value={createForm.shopName}
                      onChange={e => setCreateForm({ ...createForm, shopName: e.target.value })}
                      placeholder="VD: ASUS ROG OFFICIAL, LOGITECH G..."
                      className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Logo / Emoji đại diện</label>
                    <input
                      type="text"
                      value={createForm.logo}
                      onChange={e => setCreateForm({ ...createForm, logo: e.target.value })}
                      placeholder="🏬 hoặc link ảnh https://..."
                      className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Phân khúc sản phẩm</label>
                    <input
                      type="text"
                      value={createForm.category}
                      onChange={e => setCreateForm({ ...createForm, category: e.target.value })}
                      placeholder="Laptop Gaming & Linh kiện PC cao cấp"
                      className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Tỷ lệ phí sàn (% hoa hồng)</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      step={0.5}
                      value={createForm.commission_rate}
                      onChange={e => setCreateForm({ ...createForm, commission_rate: Number(e.target.value) })}
                      className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Số điện thoại shop</label>
                    <input
                      type="text"
                      value={createForm.phone}
                      onChange={e => setCreateForm({ ...createForm, phone: e.target.value })}
                      placeholder="0901234567"
                      className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Địa chỉ trụ sở</label>
                    <input
                      type="text"
                      value={createForm.address}
                      onChange={e => setCreateForm({ ...createForm, address: e.target.value })}
                      placeholder="Hà Nội, TP.HCM..."
                      className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mô tả giới thiệu cửa hàng</label>
                    <textarea
                      rows={2}
                      value={createForm.description}
                      onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Mô tả tóm tắt về nguồn gốc hàng hóa, chính sách bảo hành, cam kết dịch vụ..."
                      className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>
                </div>
              </div>

              {/* Nút gửi */}
              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="px-6 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider shadow-md shadow-[#ff4655]/20 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {submittingCreate ? 'Đang khởi tạo...' : 'Xác nhận tạo gian hàng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
