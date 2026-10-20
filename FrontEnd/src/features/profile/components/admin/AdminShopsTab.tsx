import React, { useState, useEffect } from 'react'
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
  MapPin
} from '@phosphor-icons/react'
import { shopService, type ShopItem } from '../../../../services/shopService'

interface AdminShopsTabProps {
  token: string | null;
  shopsList: any[];
  onRefresh: () => void;
}

export default function AdminShopsTab({ token, onRefresh }: AdminShopsTabProps) {
  const [shops, setShops] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'locked' | 'rejected'>('all')
  const [search, setSearch] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form cấp tài khoản đối tác doanh nghiệp chủ động từ Admin
  const [shopForm, setShopForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    logo: '🏬',
    category: 'Gaming Hardware & Gear',
    bgClass: 'from-zinc-900 to-black'
  })
  const [submitting, setSubmitting] = useState(false)

  // Load danh sách shop từ Backend
  const fetchShops = async () => {
    try {
      setLoading(true)
      const data = await shopService.getAdminShops({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
        limit: 50
      })
      if (data && Array.isArray(data.shops)) {
        setShops(data.shops)
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
  }

  useEffect(() => {
    fetchShops()
  }, [statusFilter, search])

  // Xử lý Duyệt, Từ chối, Khóa, Mở khóa shop
  const handleUpdateStatus = async (shop: ShopItem, newStatus: 'active' | 'rejected' | 'locked') => {
    const shopId = shop._id || shop.id
    if (!shopId) return

    let rejectReason: string | undefined = undefined
    if (newStatus === 'rejected') {
      const reason = window.prompt(`Vui lòng nhập lý do từ chối gian hàng "${shop.name || shop.shop_name}":`)
      if (reason === null) return // Người dùng bấm Hủy
      if (!reason.trim()) {
        alert('Vui lòng nhập lý do từ chối để thông báo cho đối tác!')
        return
      }
      rejectReason = reason.trim()
    } else if (newStatus === 'locked') {
      if (!window.confirm(`Bạn có chắc chắn muốn KHÓA gian hàng "${shop.name || shop.shop_name}"? Mọi sản phẩm của shop sẽ tạm dừng hiển thị.`)) {
        return
      }
    } else if (newStatus === 'active') {
      if (!window.confirm(`Xác nhận PHÊ DUYỆT gian hàng "${shop.name || shop.shop_name}"? Đối tác sẽ được phép đăng bán sản phẩm và xử lý đơn hàng.`)) {
        return
      }
    }

    try {
      setActionLoadingId(shopId)
      const res = await shopService.updateShopStatus(shopId, newStatus, rejectReason)
      setAlertInfo({
        type: 'success',
        message: res.message || 'Cập nhật trạng thái gian hàng thành công!'
      })
      // Cập nhật state cục bộ
      setShops(prev => prev.map(s => (s._id === shopId || s.id === shopId) ? { ...s, status: newStatus, rejectReason } : s))
      onRefresh()
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái shop:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái gian hàng.'
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // Xử lý tạo shop mới chủ động từ Admin
  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('http://localhost:5000/api/auth/register-shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(shopForm)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setAlertInfo({
        type: 'success',
        message: `Cấp tài khoản doanh nghiệp "${data.shop?.name || shopForm.shopName}" thành công!`
      })
      setShopForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        shopName: '',
        logo: '🏬',
        category: 'Gaming Hardware & Gear',
        bgClass: 'from-zinc-900 to-black'
      })
      setShowCreateModal(false)
      fetchShops()
      onRefresh()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.message || 'Lỗi cấp tài khoản doanh nghiệp.'
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Đếm số lượng shop theo từng trạng thái
  const counts = {
    all: shops.length,
    pending: shops.filter(s => s.status === 'pending').length,
    active: shops.filter(s => s.status === 'active').length,
    locked: shops.filter(s => s.status === 'locked').length,
    rejected: shops.filter(s => s.status === 'rejected').length
  }

  return (
    <motion.div
      key="admin-shops"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="space-y-6"
    >
      {/* Alert Notification */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded border flex items-center justify-between text-xs font-bold ${
              alertInfo.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-red-500/10 border-red-500/30 text-[#ff4655]'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === 'success' ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
              <span>{alertInfo.message}</span>
            </div>
            <button onClick={() => setAlertInfo(null)} className="text-[10px] uppercase underline hover:opacity-80 ml-4">
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Controls */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-850">
          <div>
            <div className="flex items-center gap-2">
              <Storefront size={22} className="text-[#ff4655]" />
              <h2 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                QUẢN LÝ GIAN HÀNG & PHÊ DUYỆT ĐỐI TÁC
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Xét duyệt hồ sơ mở shop, kích hoạt quyền đăng bán và khóa gian hàng vi phạm
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchShops()}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-[#ff4655] border border-zinc-200 dark:border-zinc-800 transition-colors"
            >
              <ArrowsClockwise size={14} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </button>

            <button
              onClick={() => setShowCreateModal(!showCreateModal)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase rounded bg-[#ff4655] hover:bg-[#e03d4b] text-white shadow-md shadow-[#ff4655]/20 transition-all cursor-pointer"
            >
              <PlusCircle size={16} weight="bold" />
              Cấp shop mới
            </button>
          </div>
        </div>

        {/* Status Tabs and Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-2">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ duyệt', count: counts.pending, badgeColor: 'bg-amber-500 text-black' },
              { id: 'active', label: 'Đang hoạt động' },
              { id: 'locked', label: 'Bị khóa' },
              { id: 'rejected', label: 'Đã từ chối' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  statusFilter === tab.id
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${tab.badgeColor || 'bg-white/20'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <MagnifyingGlass size={16} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo tên shop, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655]"
            />
          </div>
        </div>
      </div>

      {/* Modal / Form cấp shop mới */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateShop} 
            className="p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4 shadow-inner"
          >
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h4 className="text-xs font-black text-[#ff4655] uppercase tracking-wider flex items-center gap-2">
                <PlusCircle size={16} /> CẤP TÀI KHOẢN GIAN HÀNG DOANH NGHIỆP TRỰC TIẾP
              </h4>
              <button 
                type="button" 
                onClick={() => setShowCreateModal(false)}
                className="text-xs text-zinc-400 hover:text-zinc-600 uppercase font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Tên gian hàng</label>
                <input
                  type="text"
                  required
                  value={shopForm.shopName}
                  onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                  placeholder="VD: ASUS ROG OFFICIAL"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Emoji / Logo</label>
                <input
                  type="text"
                  required
                  value={shopForm.logo}
                  onChange={(e) => setShopForm({ ...shopForm, logo: e.target.value })}
                  placeholder="👹 hoặc link ảnh"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Phân khúc sản phẩm</label>
                <input
                  type="text"
                  required
                  value={shopForm.category}
                  onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
                  placeholder="Laptop Gaming & Phần cứng PC cao cấp"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Họ tên chủ sở hữu</label>
                <input
                  type="text"
                  required
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Số điện thoại liên hệ</label>
                <input
                  type="text"
                  required
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                  placeholder="0901234567"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Email đăng nhập</label>
                <input
                  type="email"
                  required
                  value={shopForm.email}
                  onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                  placeholder="partner@asus.com"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Mật khẩu khởi tạo</label>
                <input
                  type="password"
                  required
                  value={shopForm.password}
                  onChange={(e) => setShopForm({ ...shopForm, password: e.target.value })}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'ĐANG KHỞI TẠO...' : 'XÁC NHẬN CẤP TÀI KHOẢN'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Shops Table */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="px-5 py-3">Gian hàng</th>
                <th className="px-5 py-3">Phân khúc</th>
                <th className="px-5 py-3">Chủ sở hữu & Liên hệ</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-36" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : shops.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-zinc-400">
                    <Storefront size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Không tìm thấy gian hàng nào trong danh mục này.</p>
                  </td>
                </tr>
              ) : (
                shops.map((s) => {
                  const shopId = s._id || s.id || ''
                  const isPending = s.status === 'pending'
                  const isActive = s.status === 'active'
                  const isLocked = s.status === 'locked'
                  const isRejected = s.status === 'rejected'

                  return (
                    <tr key={shopId} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                      {/* Logo and Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-xl shrink-0">
                            {s.logo || '🏬'}
                          </span>
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                              <span>{s.name || s.shop_name}</span>
                              <span className="text-[10px] text-amber-500 font-extrabold">⭐ {s.rating || 5.0}</span>
                            </div>
                            {s.address && (
                              <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <MapPin size={10} /> {s.address}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 text-zinc-600 dark:text-zinc-300">
                        {s.category || 'Phần cứng & Thiết bị'}
                      </td>

                      {/* Owner & Contact */}
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                            {s.ownerId?.name || 'Đối tác GearTech'}
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
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
                            <Clock size={12} weight="fill" /> Chờ duyệt
                          </span>
                        )}
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle size={12} weight="fill" /> Đang hoạt động
                          </span>
                        )}
                        {isLocked && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30">
                            <Lock size={12} weight="fill" /> Bị khóa
                          </span>
                        )}
                        {isRejected && (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-zinc-500/10 text-zinc-400 border border-zinc-500/30">
                              <XCircle size={12} weight="fill" /> Bị từ chối
                            </span>
                            {s.rejectReason && (
                              <p className="text-[10px] text-red-400 italic mt-1 max-w-[150px] truncate" title={s.rejectReason}>
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
                                onClick={() => handleUpdateStatus(s, 'active')}
                                disabled={actionLoadingId === shopId}
                                className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <CheckCircle size={12} weight="bold" />
                                <span>Duyệt</span>
                              </button>

                              <button
                                onClick={() => handleUpdateStatus(s, 'rejected')}
                                disabled={actionLoadingId === shopId}
                                className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <XCircle size={12} weight="bold" />
                                <span>Từ chối</span>
                              </button>
                            </>
                          )}

                          {isActive && (
                            <button
                              onClick={() => handleUpdateStatus(s, 'locked')}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Lock size={12} weight="bold" />
                              <span>Khóa</span>
                            </button>
                          )}

                          {isLocked && (
                            <button
                              onClick={() => handleUpdateStatus(s, 'active')}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <LockOpen size={12} weight="bold" />
                              <span>Mở khóa</span>
                            </button>
                          )}

                          {isRejected && (
                            <button
                              onClick={() => handleUpdateStatus(s, 'active')}
                              disabled={actionLoadingId === shopId}
                              className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle size={12} weight="bold" />
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
    </motion.div>
  )
}
