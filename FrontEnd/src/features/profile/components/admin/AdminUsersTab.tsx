import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Users, 
  MagnifyingGlass, 
  Lock, 
  LockOpen, 
  ShieldCheck, 
  Storefront, 
  User, 
  CheckCircle,
  WarningCircle,
  ArrowsClockwise,
  Plus,
  X,
  Clock,
  Info
} from '@phosphor-icons/react'
import { userService, type UserItem } from '../../../../services/userService'

function formatLockRemaining(expiresAt?: string) {
  if (!expiresAt) return 'Khóa vĩnh viễn'
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return 'Đã hết hạn khóa'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return `còn ${days} ngày ${hours}h`
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `còn ${hours}h ${minutes}m`
}

interface AdminUsersTabProps {
  initialRole?: string;
}

export default function AdminUsersTab({ initialRole }: AdminUsersTabProps) {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>(initialRole || 'all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // D2: Admin tạo tài khoản mới khi người dùng không thể tự đăng ký
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' })

  // D1: Khóa tài khoản có thời hạn
  const [lockModalUser, setLockModalUser] = useState<UserItem | null>(null)
  const [lockDurationType, setLockDurationType] = useState<'24h' | '3d' | '7d' | '30d' | 'custom' | 'permanent'>('24h')
  const [customLockDate, setCustomLockDate] = useState<string>('')
  const [lockReason, setLockReason] = useState<string>('')
  const [lockSubmitting, setLockSubmitting] = useState<boolean>(false)

  // Current logged in admin from localStorage
  const currentAdmin = (() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })()

  // Load danh sách người dùng
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await userService.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        limit: 10
      })
      if (data && Array.isArray(data.users)) {
        setUsers(data.users)
        setTotalPages(data.totalPages || 1)
        setTotalCount(data.total || 0)
      }
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách người dùng:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể tải danh sách tài khoản người dùng.'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [search, roleFilter, statusFilter, page])

  // Xử lý mở khóa tài khoản
  const handleUnlockUser = async (user: UserItem) => {
    const targetId = user._id || user.id
    if (!targetId) return

    if (!window.confirm(`Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${user.email}?`)) return

    try {
      setActionLoadingId(targetId)
      const res = await userService.updateUserStatus(targetId, 'active')
      setAlertInfo({
        type: 'success',
        message: res.message || 'Đã mở khóa tài khoản thành công!'
      })
      await fetchUsers()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Lỗi khi mở khóa tài khoản.'
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  // D1: Xử lý xác nhận Khóa tài khoản có thời hạn
  const handleConfirmLock = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lockModalUser) return
    const targetId = lockModalUser._id || lockModalUser.id
    if (!targetId) return

    setLockSubmitting(true)
    try {
      let lockDurationHours: number | undefined
      let lockExpiresAt: string | undefined

      if (lockDurationType === '24h') lockDurationHours = 24
      else if (lockDurationType === '3d') lockDurationHours = 72
      else if (lockDurationType === '7d') lockDurationHours = 168
      else if (lockDurationType === '30d') lockDurationHours = 720
      else if (lockDurationType === 'custom' && customLockDate) {
        lockExpiresAt = new Date(customLockDate).toISOString()
      } else if (lockDurationType === 'permanent') {
        lockDurationHours = undefined
        lockExpiresAt = undefined
      }

      const res = await userService.updateUserStatus(targetId, 'locked', {
        lockDurationHours,
        lockExpiresAt,
        lockReason: lockReason.trim() || undefined
      })

      setAlertInfo({ type: 'success', message: res.message || 'Đã khóa tài khoản thành công!' })
      setLockModalUser(null)
      setLockReason('')
      await fetchUsers()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Có lỗi khi khóa tài khoản.'
      })
    } finally {
      setLockSubmitting(false)
    }
  }

  // D2: Gửi yêu cầu tạo tài khoản tới backend (POST /api/auth/users)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAlertInfo(null)
    setCreateSubmitting(true)
    try {
      const res = await userService.createUser({
        name: createForm.name.trim(),
        email: createForm.email.trim(),
        phone: createForm.phone.trim(),
        password: createForm.password,
        role: createForm.role
      })
      setAlertInfo({ type: 'success', message: res.message || 'Tạo tài khoản thành công!' })
      setShowCreateModal(false)
      setCreateForm({ name: '', email: '', phone: '', password: '', role: 'user' })
      setPage(1)
      await fetchUsers()
    } catch (err: any) {
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Không thể tạo tài khoản. Vui lòng kiểm tra lại dữ liệu.'
      })
    } finally {
      setCreateSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alert notification */}
      <AnimatePresence>
        {alertInfo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
              alertInfo.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                : 'bg-red-500/10 border-red-500/30 text-[#ff4655]'
            }`}
          >
            <div className="flex items-center gap-2">
              {alertInfo.type === 'success' ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
              <span>{alertInfo.message}</span>
            </div>
            <button 
              onClick={() => setAlertInfo(null)}
              className="text-[10px] uppercase underline hover:opacity-80 ml-4 cursor-pointer"
            >
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats Overview */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ff4655]">
                Quản lý Người Dùng
              </span>
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mt-1 flex items-center gap-2">
              <Users size={22} className="text-[#ff4655]" />
              Danh Sách Tài Khoản Hệ Thống
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Tra cứu, quản lý phân quyền và kiểm soát trạng thái hoạt động của khách hàng, gian hàng và quản trị viên.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#ff4655]/20 cursor-pointer"
            >
              <Plus size={16} weight="bold" />
              <span>Thêm tài khoản</span>
            </button>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <ArrowsClockwise size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-6">
          <div className="sm:col-span-6 relative">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, số điện thoại..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#ff4655]"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Khách hàng (User)</option>
              <option value="shop">Chủ cửa hàng (Shop)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-[#ff4655]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="locked">Bị khóa</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase font-black text-zinc-400 tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Người dùng</th>
                <th className="px-5 py-3.5">Số điện thoại</th>
                <th className="px-5 py-3.5">Vai trò</th>
                <th className="px-5 py-3.5">Trạng thái & Thời hạn khóa</th>
                <th className="px-5 py-3.5">Ngày tạo</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Đang tải danh sách người dùng...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Không tìm thấy tài khoản người dùng nào phù hợp</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const targetId = u._id || u.id || ''
                  const isSelf = currentAdmin && (currentAdmin.id === targetId || currentAdmin._id === targetId)
                  const isLocked = u.status === 'locked'

                  return (
                    <tr 
                      key={targetId}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                          />
                          <div>
                            <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                              {u.name}
                              {isSelf && (
                                <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-500 font-mono">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4 text-zinc-500 font-mono">
                        {u.phone || '—'}
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-4">
                        {u.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-[#ff4655] border border-red-500/20">
                            <ShieldCheck size={12} weight="fill" /> Admin
                          </span>
                        ) : u.role === 'shop' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            <Storefront size={12} weight="fill" /> Shop Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <User size={12} weight="fill" /> Khách hàng
                          </span>
                        )}
                      </td>

                      {/* Status & Lock Info (D1) */}
                      <td className="px-5 py-4">
                        {isLocked ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30">
                              <Lock size={12} weight="fill" /> Bị khóa
                            </span>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-semibold">
                              <Clock size={11} className="text-amber-500" />
                              <span>{formatLockRemaining(u.lockExpiresAt)}</span>
                            </div>
                            {u.lockReason && (
                              <div className="text-[10px] text-zinc-500 italic max-w-xs truncate" title={u.lockReason}>
                                Lý do: {u.lockReason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                            <CheckCircle size={12} weight="fill" /> Hoạt động
                          </span>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="px-5 py-4 text-zinc-400 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {isSelf ? (
                          <span className="text-[10px] text-zinc-400 italic">Không thể thao tác</span>
                        ) : isLocked ? (
                          <button
                            onClick={() => handleUnlockUser(u)}
                            disabled={actionLoadingId === targetId}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto border bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30 shadow-sm cursor-pointer"
                          >
                            {actionLoadingId === targetId ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <>
                                <LockOpen size={12} weight="bold" />
                                <span>Mở khóa</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setLockModalUser(u)
                              setLockDurationType('24h')
                              setLockReason('')
                            }}
                            className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto border bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border-red-500/30 shadow-sm cursor-pointer"
                          >
                            <Lock size={12} weight="bold" />
                            <span>Khóa tài khoản</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between text-xs">
            <span className="text-zinc-500">
              Tổng số <strong className="text-zinc-900 dark:text-white">{totalCount}</strong> tài khoản (Trang {page} / {totalPages})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 font-bold cursor-pointer"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 font-bold cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* D1: Modal Khóa tài khoản có thời hạn */}
      <AnimatePresence>
        {lockModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                  <Lock size={18} className="text-[#ff4655]" weight="bold" />
                  KHÓA TÀI KHOẢN CÓ THỜI HẠN
                </h4>
                <button onClick={() => setLockModalUser(null)} className="text-zinc-400 hover:text-white p-1 rounded-xl cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl text-xs space-y-1 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="font-bold text-zinc-900 dark:text-white">{lockModalUser.name}</div>
                <div className="text-[11px] text-zinc-400 font-mono">{lockModalUser.email}</div>
              </div>

              <form onSubmit={handleConfirmLock} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                    Thời hạn khóa tài khoản *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '24h', label: '1 Ngày (24h)' },
                      { id: '3d', label: '3 Ngày' },
                      { id: '7d', label: '7 Ngày' },
                      { id: '30d', label: '30 Ngày' },
                      { id: 'custom', label: 'Tùy chọn' },
                      { id: 'permanent', label: 'Vĩnh viễn' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setLockDurationType(opt.id as any)}
                        className={`py-2 px-2.5 rounded-xl text-center font-bold text-[11px] border transition-all cursor-pointer ${
                          lockDurationType === opt.id
                            ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-sm'
                            : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {lockDurationType === 'custom' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Chọn thời điểm mở khóa cụ thể *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={customLockDate}
                      onChange={(e) => setCustomLockDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Lý do khóa (sẽ hiển thị cho khách hàng khi đăng nhập)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VD: Vi phạm điều khoản đánh giá, nghi vấn gian lận..."
                    value={lockReason}
                    onChange={(e) => setLockReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-500 flex items-start gap-2">
                  <Info size={16} className="shrink-0 mt-0.5" weight="bold" />
                  <span>Khi hết thời gian khóa, hệ thống sẽ tự động kích hoạt lại tài khoản của khách hàng khi họ đăng nhập lại.</span>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setLockModalUser(null)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={lockSubmitting}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black uppercase tracking-wider cursor-pointer"
                  >
                    {lockSubmitting ? 'Đang xử lý...' : 'Xác nhận khóa'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* D2: Modal tạo tài khoản mới */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                  <Plus size={18} className="text-[#ff4655]" weight="bold" />
                  TẠO TÀI KHOẢN MỚI
                </h4>
                <button onClick={() => setShowCreateModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-xl cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Mật khẩu tạm * (tối thiểu 6 ký tự)
                  </label>
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Vai trò *</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="user">Khách hàng (Customer)</option>
                    <option value="shop">Chủ cửa hàng (Shop Owner - Tự động liên kết Shop)</option>
                  </select>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black uppercase tracking-wider cursor-pointer"
                  >
                    {createSubmitting ? 'Đang tạo...' : 'Tạo tài khoản'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
