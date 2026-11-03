import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  CurrencyDollar, 
  User, 
  Phone, 
  MapPin, 
  Laptop, 
  Desktop, 
  Cpu, 
  Sparkle, 
  X,
  WarningCircle,
  UserCheck
} from '@phosphor-icons/react'
import { 
  careService, 
  type CareBookingItem, 
  type CareStats 
} from '../../../services/careService'
import { formatPrice } from '../../../utils/format'

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  pending: {
    label: 'Chờ tiếp nhận',
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    border: 'border-amber-500/20'
  },
  confirmed: {
    label: 'Đã tiếp nhận',
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    border: 'border-blue-500/20'
  },
  in_progress: {
    label: 'Đang xử lý kỹ thuật',
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    border: 'border-purple-500/20'
  },
  completed: {
    label: 'Đã hoàn tất & Thu tiền',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    border: 'border-emerald-500/20'
  },
  cancelled: {
    label: 'Đã hủy',
    bg: 'bg-rose-500/10',
    text: 'text-rose-500',
    border: 'border-rose-500/20'
  }
}

export default function AdminCareServicesPage() {
  const [stats, setStats] = useState<CareStats | null>(null)
  const [bookings, setBookings] = useState<CareBookingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Modal xử lý chi tiết phiếu
  const [selectedBooking, setSelectedBooking] = useState<CareBookingItem | null>(null)
  const [editStatus, setEditStatus] = useState<string>('pending')
  const [editTechnician, setEditTechnician] = useState<string>('')
  const [editNote, setEditNote] = useState<string>('')
  const [editPrice, setEditPrice] = useState<number>(0)
  const [savingAction, setSavingAction] = useState(false)

  const [toastMessage, setToastMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 4000)
  }

  const showError = (msg: string) => {
    setErrorMessage(msg)
    setTimeout(() => setErrorMessage(''), 5000)
  }

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true)
      const [statsRes, bookingsRes] = await Promise.all([
        careService.getAdminStats(),
        careService.getAdminBookings({
          status: activeTab,
          search,
          page,
          limit: 15
        })
      ])
      setStats(statsRes)
      setBookings(bookingsRes.bookings)
      setTotalPages(bookingsRes.totalPages || 1)
    } catch (err: any) {
      showError(err.response?.data?.error || 'Không thể tải dữ liệu GearTech Care.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTab, search, page])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openEditModal = (item: CareBookingItem) => {
    setSelectedBooking(item)
    setEditStatus(item.status)
    setEditTechnician(item.technicianName || '')
    setEditNote(item.adminNote || '')
    setEditPrice(item.price || 0)
  }

  const handleSaveModal = async () => {
    if (!selectedBooking) return
    setSavingAction(true)
    try {
      const res = await careService.updateBooking(selectedBooking._id, {
        status: editStatus,
        technicianName: editTechnician,
        adminNote: editNote,
        price: editPrice
      })
      showToast(res.message || 'Cập nhật phiếu thành công!')
      setSelectedBooking(null)
      fetchData()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Có lỗi khi cập nhật phiếu.')
    } finally {
      setSavingAction(false)
    }
  }

  // Quick Action chuyển trạng thái trực tiếp trên dòng
  const handleQuickStatusChange = async (item: CareBookingItem, newStatus: string) => {
    try {
      await careService.updateBooking(item._id, { status: newStatus })
      showToast(`Đã chuyển phiếu ${item.bookingCode} sang: ${STATUS_CONFIG[newStatus]?.label || newStatus}`)
      fetchData()
    } catch (err: any) {
      showError(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái nhanh.')
    }
  }

  const renderDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'desktop':
        return <Desktop size={14} className="text-blue-400" />
      case 'vga':
        return <Cpu size={14} className="text-amber-400" />
      case 'other':
        return <Sparkle size={14} className="text-purple-400" />
      default:
        return <Laptop size={14} className="text-[#ff4655]" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold"
          >
            <CheckCircle size={18} weight="fill" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-rose-500 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-bold"
          >
            <WarningCircle size={18} weight="fill" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} weight="fill" />
            <span>Dịch Vụ Độc Quyền Sàn GEARTECH</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
            Quản Lý Dịch Vụ GEARTECH CARE
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
            Toàn bộ nguồn thu từ dịch vụ kỹ thuật, sửa chữa và bảo dưỡng GearTech Care trực thuộc 100% tài khoản Admin sàn và không chịu chiết khấu từ Shop đối tác.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowsClockwise size={16} className={refreshing ? 'animate-spin text-[#ff4655]' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Doanh thu độc quyền của sàn */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-zinc-900/50 border border-emerald-500/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">
              Doanh Thu GearTech Care
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <CurrencyDollar size={18} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
            {stats ? formatPrice(stats.totalRevenue) : '0 ₫'}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            100% doanh thu thuần thu về ví Admin
          </p>
        </div>

        {/* Tổng ca tiếp nhận */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              Tổng Phiếu Dịch Vụ
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center">
              <Wrench size={18} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
            {stats?.total ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            Gồm tất cả các lượt khách đặt
          </p>
        </div>

        {/* Chờ tiếp nhận */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Chờ Tiếp Nhận
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock size={18} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-500 font-mono">
            {stats?.pending ?? 0}
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            Cần KTV gọi điện xác nhận trong 15p
          </p>
        </div>

        {/* Đang sửa chữa & Hoàn tất */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-500">
              Đang Xử Lý / Hoàn Tất
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShieldCheck size={18} weight="bold" />
            </div>
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white font-mono">
            {(stats?.confirmed || 0) + (stats?.inProgress || 0)} <span className="text-xs font-normal text-zinc-400">/ {stats?.completed ?? 0} xong</span>
          </div>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
            Đang kỹ thuật viên sửa tại Lab
          </p>
        </div>
      </div>

      {/* FILTER TABS & SEARCH */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'pending', label: 'Chờ tiếp nhận' },
              { id: 'confirmed', label: 'Đã xác nhận' },
              { id: 'in_progress', label: 'Đang xử lý' },
              { id: 'completed', label: 'Hoàn tất & Thu tiền' },
              { id: 'cancelled', label: 'Đã hủy' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setPage(1)
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, khách, SĐT..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full pl-9 pr-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition"
            />
          </div>
        </div>

        {/* BOOKINGS TABLE */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-3">
              <ArrowsClockwise size={24} className="animate-spin text-[#ff4655]" />
              <span>Đang tải danh sách phiếu dịch vụ...</span>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-16 text-center text-zinc-500 text-xs flex flex-col items-center gap-2">
              <Wrench size={32} className="text-zinc-400" />
              <span>Chưa có phiếu dịch vụ nào trong mục này.</span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                  <th className="py-3 px-3">Mã Phiếu</th>
                  <th className="py-3 px-3">Khách Hàng</th>
                  <th className="py-3 px-3">Thiết Bị & Dịch Vụ</th>
                  <th className="py-3 px-3">Chi Phí (Admin thu)</th>
                  <th className="py-3 px-3">Kỹ Thuật Viên</th>
                  <th className="py-3 px-3">Trạng Thái</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60">
                {bookings.map((item) => {
                  const statusConf = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending
                  return (
                    <tr key={item._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                      {/* Booking Code & Time */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-mono font-black text-sm text-[#ff4655]">
                          {item.bookingCode}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                          <User size={13} className="text-zinc-400" />
                          <span>{item.fullName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} className="text-zinc-400" />
                          <span>{item.phone}</span>
                        </div>
                        {item.address && (
                          <div className="text-[10px] text-zinc-400 flex items-start gap-1 mt-0.5 max-w-[200px] truncate" title={item.address}>
                            <MapPin size={11} className="shrink-0 mt-0.5 text-zinc-400" />
                            <span>{item.address}</span>
                          </div>
                        )}
                      </td>

                      {/* Device & Service */}
                      <td className="py-3 px-3 align-top">
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                          {renderDeviceIcon(item.deviceType)}
                          <span className="capitalize">{item.deviceType}</span>
                        </div>
                        <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-1">
                          {item.servicePackageName}
                        </div>
                        {item.issueDescription && (
                          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-[240px] line-clamp-2 italic">
                            "{item.issueDescription}"
                          </div>
                        )}
                      </td>

                      {/* Price / Platform Revenue */}
                      <td className="py-3 px-3 align-top">
                        <div className="font-bold font-mono text-[#ff4655] text-sm">
                          {formatPrice(item.price)}
                        </div>
                        <div className="text-[10px] text-emerald-500 font-medium">
                          100% Sàn thu
                        </div>
                      </td>

                      {/* Technician */}
                      <td className="py-3 px-3 align-top">
                        {item.technicianName ? (
                          <div className="flex items-center gap-1 font-medium text-zinc-800 dark:text-zinc-200">
                            <UserCheck size={14} className="text-blue-500" />
                            <span>{item.technicianName}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 text-[11px] italic">Chưa phân công</span>
                        )}
                        {item.adminNote && (
                          <div className="text-[10px] text-zinc-400 mt-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded max-w-[150px] truncate" title={item.adminNote}>
                            Ghi chú: {item.adminNote}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 align-top">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}>
                          {item.status === 'completed' && <CheckCircle size={12} weight="fill" />}
                          {item.status === 'pending' && <Clock size={12} weight="bold" />}
                          {item.status === 'cancelled' && <XCircle size={12} weight="bold" />}
                          <span>{statusConf.label}</span>
                        </span>
                        {item.completedAt && (
                          <div className="text-[10px] text-emerald-500 mt-1">
                            Xong: {new Date(item.completedAt).toLocaleDateString('vi-VN')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 align-top text-right space-y-1">
                        <button
                          onClick={() => openEditModal(item)}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-[#ff4655] text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] text-[11px] font-bold transition cursor-pointer shadow-sm"
                        >
                          Xử lý phiếu
                        </button>

                        {/* Quick Action Buttons */}
                        {item.status === 'pending' && (
                          <div>
                            <button
                              onClick={() => handleQuickStatusChange(item, 'confirmed')}
                              className="px-2 py-1 text-[10px] text-blue-500 hover:underline block ml-auto font-semibold"
                            >
                              + Tiếp nhận ngay
                            </button>
                          </div>
                        )}

                        {item.status === 'confirmed' && (
                          <div>
                            <button
                              onClick={() => handleQuickStatusChange(item, 'in_progress')}
                              className="px-2 py-1 text-[10px] text-purple-500 hover:underline block ml-auto font-semibold"
                            >
                              + Bắt đầu xử lý
                            </button>
                          </div>
                        )}

                        {item.status === 'in_progress' && (
                          <div>
                            <button
                              onClick={() => handleQuickStatusChange(item, 'completed')}
                              className="px-2 py-1 text-[10px] text-emerald-500 hover:underline block ml-auto font-bold"
                            >
                              ✓ Nghiệm thu & Thu tiền
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-zinc-500">
              Trang {page} / {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Trước
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800 disabled:opacity-40 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL XỬ LÝ PHIẾU DỊCH VỤ */}
      <AnimatePresence>
        {selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center">
                    <Wrench size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Xử Lý Phiếu: {selectedBooking.bookingCode}
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      Gói: {selectedBooking.servicePackageName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 text-xs">
                {/* Customer summary */}
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Khách hàng:</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{selectedBooking.fullName} - {selectedBooking.phone}</span>
                  </div>
                  {selectedBooking.address && (
                    <div className="flex justify-between gap-2">
                      <span className="text-zinc-500 shrink-0">Địa chỉ:</span>
                      <span className="text-right text-zinc-600 dark:text-zinc-300">{selectedBooking.address}</span>
                    </div>
                  )}
                  {selectedBooking.issueDescription && (
                    <div className="pt-1 text-zinc-500">
                      <strong>Mô tả sự cố:</strong> {selectedBooking.issueDescription}
                    </div>
                  )}
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Trạng thái tiến độ *
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition"
                  >
                    <option value="pending">Chờ tiếp nhận</option>
                    <option value="confirmed">Đã tiếp nhận & hẹn lịch</option>
                    <option value="in_progress">Đang sửa chữa / bảo dưỡng tại Lab</option>
                    <option value="completed">Đã hoàn tất & Đã thu tiền (Tính doanh thu)</option>
                    <option value="cancelled">Hủy phiếu dịch vụ</option>
                  </select>
                </div>

                {/* Technician assignment */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Kỹ thuật viên phụ trách
                  </label>
                  <input
                    type="text"
                    placeholder="VD: KTV Hoàng Nam (0901234567)"
                    value={editTechnician}
                    onChange={(e) => setEditTechnician(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition"
                  />
                </div>

                {/* Price modification */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Giá dịch vụ thu về (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-mono font-bold text-[#ff4655] focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">
                    * Khoản tiền này sẽ ghi nhận vào doanh thu trực tiếp của sàn khi chuyển trạng thái sang "Đã hoàn tất".
                  </p>
                </div>

                {/* Admin Note */}
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Ghi chú nội bộ Admin / Kết quả kiểm tra
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú kết quả đo đạc, linh kiện đã thay thế..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 p-4 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  disabled={savingAction}
                  onClick={handleSaveModal}
                  className="px-5 py-2 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-md shadow-[#ff4655]/20 cursor-pointer disabled:opacity-50"
                >
                  {savingAction ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
