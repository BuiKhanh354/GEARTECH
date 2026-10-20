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
  Funnel,
  CheckCircle,
  WarningCircle,
  ArrowsClockwise
} from '@phosphor-icons/react'
import { userService, type UserItem } from '../../../../services/userService'

export default function AdminUsersTab() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [alertInfo, setAlertInfo] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

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

  // Xử lý Khóa / Mở khóa tài khoản
  const handleToggleStatus = async (user: UserItem) => {
    const targetId = user._id || user.id
    if (!targetId) return

    if (currentAdmin && (currentAdmin.id === targetId || currentAdmin._id === targetId)) {
      setAlertInfo({
        type: 'error',
        message: 'Bạn không thể tự khóa tài khoản của chính mình!'
      })
      return
    }

    const nextStatus: 'active' | 'locked' = user.status === 'locked' ? 'active' : 'locked'
    const confirmText = nextStatus === 'locked' 
      ? `Bạn có chắc chắn muốn KHÓA tài khoản ${user.email}? Người dùng này sẽ không thể đăng nhập hoặc mua hàng.`
      : `Bạn có chắc chắn muốn MỞ KHÓA tài khoản ${user.email}?`

    if (!window.confirm(confirmText)) return

    try {
      setActionLoadingId(targetId)
      const res = await userService.updateUserStatus(targetId, nextStatus)
      setAlertInfo({
        type: 'success',
        message: res.message || `Đã cập nhật trạng thái người dùng thành công!`
      })
      // Cập nhật state cục bộ
      setUsers(prev => prev.map(u => (u._id === targetId || u.id === targetId) ? { ...u, status: nextStatus } : u))
    } catch (err: any) {
      console.error('Lỗi cập nhật trạng thái:', err)
      setAlertInfo({
        type: 'error',
        message: err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật trạng thái tài khoản.'
      })
    } finally {
      setActionLoadingId(null)
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
            <button 
              onClick={() => setAlertInfo(null)}
              className="text-[10px] uppercase underline hover:opacity-80 ml-4"
            >
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Stats Overview */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-850">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff4655] animate-ping" />
              <h2 className="text-base font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-[#ff4655]" />
                QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Kiểm soát trạng thái tài khoản, phân quyền quản trị viên, chủ shop và khách hàng
            </p>
          </div>

          <button
            onClick={() => fetchUsers()}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-[#ff4655] border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            <ArrowsClockwise size={14} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>

        {/* Filters and search row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {/* Search box */}
          <div className="relative">
            <MagnifyingGlass size={16} className="absolute left-3 top-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, SĐT..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:border-[#ff4655]"
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase shrink-0 flex items-center gap-1">
              <Funnel size={12} /> Vai trò:
            </span>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Khách hàng (Customer)</option>
              <option value="shop">Chủ cửa hàng (Shop Owner)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-zinc-400 uppercase shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động (Active)</option>
              <option value="locked">Bị khóa (Locked)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-900/80 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="px-5 py-3">Người dùng</th>
                <th className="px-5 py-3">Liên hệ</th>
                <th className="px-5 py-3">Vai trò</th>
                <th className="px-5 py-3">Trạng thái</th>
                <th className="px-5 py-3">Ngày tham gia</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 font-medium">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-32" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-28" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-16" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-20" /></td>
                    <td className="px-5 py-4"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-24" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-semibold">Không tìm thấy tài khoản người dùng nào phù hợp.</p>
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

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isLocked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30">
                            <Lock size={12} weight="fill" /> Bị khóa
                          </span>
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
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={actionLoadingId === targetId}
                            className={`px-3 py-1.5 rounded text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ml-auto border ${
                              isLocked
                                ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30 shadow-sm'
                                : 'bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] border-red-500/30 shadow-sm'
                            }`}
                          >
                            {actionLoadingId === targetId ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : isLocked ? (
                              <>
                                <LockOpen size={12} weight="bold" />
                                <span>Mở khóa</span>
                              </>
                            ) : (
                              <>
                                <Lock size={12} weight="bold" />
                                <span>Khóa tài khoản</span>
                              </>
                            )}
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
                className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Trước
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
