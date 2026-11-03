import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  CurrencyDollar, 
  Bank, 
  CheckCircle, 
  XCircle, 
  Gear, 
  MagnifyingGlass, 
  ArrowsClockwise, 
  FileText, 
  Storefront, 
  X, 
  WarningCircle
} from '@phosphor-icons/react'
import { 
  financeService, 
  type AdminFinanceOverview, 
  type WithdrawalRequestItem, 
  type FinancialTransactionItem, 
  type PlatformFeeConfigData 
} from '../../../services/financeService'
import { formatPrice } from '../../../utils/format'

export default function AdminFinancePage() {
  const [overview, setOverview] = useState<AdminFinanceOverview | null>(null)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestItem[]>([])
  const [transactions, setTransactions] = useState<FinancialTransactionItem[]>([])
  const [feeConfig, setFeeConfig] = useState<PlatformFeeConfigData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'transactions' | 'wallets' | 'config'>('withdrawals')

  // Bộ lọc yêu cầu rút tiền
  const [withdrawalStatus, setWithdrawalStatus] = useState('PENDING')
  
  // Bộ lọc sổ cái
  const [transactionType, setTransactionType] = useState('all')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [txPage, setTxPage] = useState(1)
  const [txTotalPages, setTxTotalPages] = useState(1)

  // Modal xử lý rút tiền
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequestItem | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [payoutRef, setPayoutRef] = useState('')
  const [payoutProofUrl, setPayoutProofUrl] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [processingAction, setProcessingAction] = useState(false)

  // Form cấu hình phí
  const [newFeeRate, setNewFeeRate] = useState('5.0')
  const [feeNotes, setFeeNotes] = useState('')
  const [updatingFee, setUpdatingFee] = useState(false)

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const loadOverview = async () => {
    try {
      const data = await financeService.getAdminOverview()
      setOverview(data)
    } catch (err) {
      console.error('Lỗi tải tổng quan tài chính admin:', err)
    }
  }

  const loadWithdrawals = async () => {
    try {
      const data = await financeService.getAdminWithdrawals({ status: withdrawalStatus })
      setWithdrawals(data.withdrawals || [])
    } catch (err) {
      console.error('Lỗi tải yêu cầu rút tiền:', err)
    }
  }

  const loadTransactions = async () => {
    try {
      const data = await financeService.getAdminTransactions({
        type: transactionType,
        search: transactionSearch,
        page: txPage,
        limit: 20
      })
      setTransactions(data.transactions || [])
      setTxTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error('Lỗi tải sổ cái tài chính toàn sàn:', err)
    }
  }

  const loadFeeConfig = async () => {
    try {
      const data = await financeService.getAdminFeeConfig()
      setFeeConfig(data)
      if (data) {
        setNewFeeRate(String(data.defaultRate))
      }
    } catch (err) {
      console.error('Lỗi tải cấu hình phí:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadOverview(), loadWithdrawals(), loadTransactions(), loadFeeConfig()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    loadWithdrawals()
  }, [withdrawalStatus])

  useEffect(() => {
    loadTransactions()
  }, [transactionType, transactionSearch, txPage])

  // Xử lý từ chối yêu cầu rút tiền
  const handleReject = async () => {
    if (!selectedWithdrawal || !rejectReason.trim()) {
      setErrorMessage('Vui lòng nhập lý do từ chối.')
      return
    }

    try {
      setProcessingAction(true)
      const res = await financeService.rejectWithdrawal(selectedWithdrawal._id, rejectReason.trim())
      setMessage(res.message)
      setShowRejectModal(false)
      setSelectedWithdrawal(null)
      setRejectReason('')
      await Promise.all([loadOverview(), loadWithdrawals()])
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Lỗi khi từ chối yêu cầu')
    } finally {
      setProcessingAction(false)
    }
  }

  // Xử lý xác nhận giải ngân thành công
  const handlePayout = async () => {
    if (!selectedWithdrawal) return

    try {
      setProcessingAction(true)
      const res = await financeService.payoutWithdrawal(selectedWithdrawal._id, {
        payoutReference: payoutRef.trim() || undefined,
        payoutProofUrl: payoutProofUrl.trim() || undefined
      })
      setMessage(res.message)
      setShowPayoutModal(false)
      setSelectedWithdrawal(null)
      setPayoutRef('')
      setPayoutProofUrl('')
      await Promise.all([loadOverview(), loadWithdrawals()])
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Lỗi khi giải ngân')
    } finally {
      setProcessingAction(false)
    }
  }

  // Cập nhật cấu hình phí nền tảng
  const handleUpdateFee = async (e: React.FormEvent) => {
    e.preventDefault()
    const rate = Number(newFeeRate)
    if (isNaN(rate) || rate < 0 || rate > 100) {
      setErrorMessage('Tỷ lệ phí phải từ 0% đến 100%')
      return
    }

    try {
      setUpdatingFee(true)
      const res = await financeService.updateAdminFeeConfig({
        defaultRate: rate,
        notes: feeNotes.trim()
      })
      setMessage(res.message)
      await loadFeeConfig()
      await loadOverview()
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || 'Lỗi cập nhật cấu hình phí')
    } finally {
      setUpdatingFee(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
        // Đang tải dữ liệu tài chính & kiểm toán toàn sàn...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950/60 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">// ADMIN_FINANCE_CONSOLE</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">GEARTECH PLATFORM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <CurrencyDollar size={24} className="text-[#ff4655]" />
            Quản Trị Tài Chính Sàn & Kiểm Duyệt Giải Ngân
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Giám sát toàn bộ dòng tiền, doanh thu các gian hàng, thu phí nền tảng và phê duyệt giải ngân an toàn.
          </p>
        </div>

        <button
          onClick={() => {
            loadOverview()
            loadWithdrawals()
            loadTransactions()
          }}
          className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors flex items-center gap-2 text-xs font-bold uppercase self-start sm:self-auto"
        >
          <ArrowsClockwise size={16} /> Làm mới số liệu
        </button>
      </div>

      {/* Thông báo */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle size={18} /> {message}
          </span>
          <button onClick={() => setMessage('')} className="font-bold">✕</button>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <WarningCircle size={18} /> {errorMessage}
          </span>
          <button onClick={() => setErrorMessage('')} className="font-bold">✕</button>
        </div>
      )}

      {/* 5 Thẻ Chỉ Số Tài Chính Toàn Sàn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">// TỔNG_DOANH_THU</span>
          <p className="text-lg font-black text-zinc-900 dark:text-white mt-1">
            {formatPrice(overview?.metrics?.totalRevenue || 0)}
          </p>
          <span className="text-[10px] text-zinc-400">Doanh số toàn bộ gian hàng</span>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#ff4655]/10 via-zinc-900/5 to-transparent border border-[#ff4655]/30 shadow-sm">
          <span className="text-[9px] font-mono text-[#ff4655] uppercase font-black">// THU_PHÍ_NỀN_TẢNG</span>
          <p className="text-lg font-black text-[#ff4655] mt-1">
            {formatPrice(overview?.metrics?.totalPlatformFee || 0)}
          </p>
          <span className="text-[10px] text-zinc-400">Lợi nhuận sàn ({overview?.metrics?.currentFeeRate || 5}%)</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-mono text-amber-500 uppercase font-black">// TIỀN_CHỜ_ĐỐI_SOÁT</span>
          <p className="text-lg font-black text-amber-500 mt-1">
            {formatPrice(overview?.metrics?.totalPendingBalance || 0)}
          </p>
          <span className="text-[10px] text-zinc-400">Đơn hàng đang xử lý/vận chuyển</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-mono text-emerald-500 uppercase font-black">// CÓ_THỂ_GIẢI_NGÂN</span>
          <p className="text-lg font-black text-emerald-500 mt-1">
            {formatPrice(overview?.metrics?.totalAvailableBalance || 0)}
          </p>
          <span className="text-[10px] text-zinc-400">Số dư khả dụng của các shop</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <span className="text-[9px] font-mono text-blue-500 uppercase font-black">// ĐÃ_GIẢI_NGÂN_XONG</span>
          <p className="text-lg font-black text-blue-500 mt-1">
            {formatPrice(overview?.metrics?.totalWithdrawnBalance || 0)}
          </p>
          <span className="text-[10px] text-zinc-400">Tiền đã chi trả thành công</span>
        </div>
      </div>

      {/* Tabs Phân Hệ Admin */}
      <div className="bg-white dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-4 gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'withdrawals'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Bank size={16} /> 
            Duyệt yêu cầu rút tiền 
            {overview?.metrics?.pendingWithdrawalsCount ? (
              <span className="px-1.5 py-0.5 rounded-full text-[9px] bg-red-500 text-white font-black animate-pulse">
                {overview.metrics.pendingWithdrawalsCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'transactions'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <FileText size={16} /> Sổ cái tài chính toàn sàn
          </button>

          <button
            onClick={() => setActiveTab('wallets')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'wallets'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Storefront size={16} /> Danh sách ví các shop ({overview?.shopWallets?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'config'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Gear size={16} /> Cấu hình phí sàn ({feeConfig?.defaultRate || 5}%)
          </button>
        </div>

        {/* Tab 1: Duyệt Yêu Cầu Rút Tiền */}
        {activeTab === 'withdrawals' && (
          <div className="p-6 space-y-4">
            <div className="flex gap-2">
              {['PENDING', 'PAID_OUT', 'REJECTED', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setWithdrawalStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    withdrawalStatus === st
                      ? 'bg-[#ff4655] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {st === 'PENDING' ? '⏳ Chờ phê duyệt' : st === 'PAID_OUT' ? '✓ Đã giải ngân' : st === 'REJECTED' ? '✕ Đã từ chối' : 'Tất cả'}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">MÃ LỆNH</th>
                    <th className="py-3 px-3">GIAN HÀNG (SHOP)</th>
                    <th className="py-3 px-3 text-right">SỐ TIỀN YÊU CẦU</th>
                    <th className="py-3 px-3">TÀI KHOẢN NGÂN HÀNG</th>
                    <th className="py-3 px-3">TRẠNG THÁI</th>
                    <th className="py-3 px-3 text-right">THAO TÁC DUYỆT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-medium">
                        Không có yêu cầu rút tiền nào trong mục này.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                          {w.requestCode}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-zinc-900 dark:text-white">{w.shopId?.name || 'Cửa hàng'}</p>
                          <p className="text-[11px] text-zinc-400">{w.requestedBy?.name} ({w.requestedBy?.email})</p>
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-rose-500 font-mono text-sm">
                          {formatPrice(w.amount)}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200 uppercase">{w.bankInfo?.bankName}</p>
                          <p className="font-mono text-zinc-500 font-bold">{w.bankInfo?.accountNumber}</p>
                          <p className="text-[10px] text-zinc-400 uppercase">{w.bankInfo?.accountHolder}</p>
                        </td>
                        <td className="py-3.5 px-3">
                          {w.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/30">Chờ duyệt</span>
                          )}
                          {w.status === 'PAID_OUT' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">Đã giải ngân ({w.payoutReference})</span>
                          )}
                          {w.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/30">Bị từ chối: {w.rejectReason}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {w.status === 'PENDING' && (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w)
                                  setPayoutRef(`VCB-${Date.now()}`)
                                  setShowPayoutModal(true)
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase transition-colors"
                              >
                                Giải ngân
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedWithdrawal(w)
                                  setShowRejectModal(true)
                                }}
                                className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 font-bold text-xs uppercase transition-colors"
                              >
                                Từ chối
                              </button>
                            </div>
                          )}
                          {w.status !== 'PENDING' && (
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {new Date(w.createdAt).toLocaleString('vi-VN')}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {txTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-400">Trang {txPage} / {txTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={txPage === 1}
                    onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Trước
                  </button>
                  <button
                    disabled={txPage === txTotalPages}
                    onClick={() => setTxPage(prev => Math.min(txTotalPages, prev + 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Sổ Cái Tài Chính Toàn Sàn */}
        {activeTab === 'transactions' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-zinc-400">Loại GD:</span>
                <select
                  value={transactionType}
                  onChange={(e) => {
                    setTransactionType(e.target.value)
                    setTxPage(1)
                  }}
                  className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 font-bold"
                >
                  <option value="all">Tất cả giao dịch</option>
                  <option value="ORDER_REVENUE">Doanh thu tạm giữ (ORDER_REVENUE)</option>
                  <option value="ORDER_SETTLED">Giải ngân khả dụng (ORDER_SETTLED)</option>
                  <option value="WITHDRAWAL_REQUEST">Yêu cầu rút tiền (WITHDRAWAL_REQUEST)</option>
                  <option value="WITHDRAWAL_SUCCESS">Giải ngân thành công (WITHDRAWAL_SUCCESS)</option>
                  <option value="ORDER_CANCELLED">Hủy đơn hàng (ORDER_CANCELLED)</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm mã FT hoặc mô tả..."
                  value={transactionSearch}
                  onChange={(e) => {
                    setTransactionSearch(e.target.value)
                    setTxPage(1)
                  }}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">MÃ GD</th>
                    <th className="py-3 px-3">GIAN HÀNG</th>
                    <th className="py-3 px-3">PHÂN LOẠI</th>
                    <th className="py-3 px-3 text-right">TIỀN HÀNG</th>
                    <th className="py-3 px-3 text-right">PHÍ SÀN</th>
                    <th className="py-3 px-3 text-right">THỰC NHẬN</th>
                    <th className="py-3 px-3">DIỄN GIẢI</th>
                    <th className="py-3 px-3 text-right">THỜI GIAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {transactions.map((t) => (
                    <tr key={t._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3 px-3 font-mono font-bold">{t.transactionCode}</td>
                      <td className="py-3 px-3 font-bold">{t.shopId?.name || 'Gian hàng'}</td>
                      <td className="py-3 px-3 font-mono text-[10px]">{t.type}</td>
                      <td className="py-3 px-3 text-right font-mono">{formatPrice(t.orderAmount || 0)}</td>
                      <td className="py-3 px-3 text-right font-mono text-rose-500">-{formatPrice(t.platformFeeAmount || 0)}</td>
                      <td className="py-3 px-3 text-right font-mono font-black text-emerald-500">+{formatPrice(t.netAmount || t.amount)}</td>
                      <td className="py-3 px-3 text-zinc-500 max-w-xs truncate">{t.description}</td>
                      <td className="py-3 px-3 text-right font-mono text-[10px] text-zinc-400">
                        {new Date(t.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {txTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-400">Trang {txPage} / {txTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={txPage === 1}
                    onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Trước
                  </button>
                  <button
                    disabled={txPage === txTotalPages}
                    onClick={() => setTxPage(prev => Math.min(txTotalPages, prev + 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Danh Sách Ví Các Shop */}
        {activeTab === 'wallets' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">TÊN CỬA HÀNG</th>
                    <th className="py-3 px-3 text-right">SỐ DƯ KHẢ DỤNG</th>
                    <th className="py-3 px-3 text-right">CHỜ ĐỐI SOÁT</th>
                    <th className="py-3 px-3 text-right">ĐANG RÚT</th>
                    <th className="py-3 px-3 text-right">ĐÃ GIẢI NGÂN</th>
                    <th className="py-3 px-3 text-right">TỔNG DOANH SỐ</th>
                    <th className="py-3 px-3">TÀI KHOẢN NHẬN TIỀN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {overview?.shopWallets?.map((w) => (
                    <tr key={w._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                      <td className="py-3.5 px-3 font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{w.shopId?.logo || '🏬'}</span>
                        <span>{w.shopId?.name || 'Shop'}</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-500">
                        {formatPrice(w.availableBalance || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-amber-500">
                        {formatPrice(w.pendingBalance || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-blue-500">
                        {formatPrice(w.lockedBalance || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-purple-500">
                        {formatPrice(w.withdrawnBalance || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-black text-zinc-800 dark:text-zinc-200">
                        {formatPrice(w.totalRevenue || 0)}
                      </td>
                      <td className="py-3.5 px-3 text-zinc-500">
                        {w.payoutAccount?.accountNumber ? (
                          <span className="font-mono">{w.payoutAccount.bankName} - {w.payoutAccount.accountNumber}</span>
                        ) : (
                          <span className="text-zinc-400 italic">Chưa thiết lập</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {txTotalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-400">Trang {txPage} / {txTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={txPage === 1}
                    onClick={() => setTxPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Trước
                  </button>
                  <button
                    disabled={txPage === txTotalPages}
                    onClick={() => setTxPage(prev => Math.min(txTotalPages, prev + 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Cấu Hình Phí Nền Tảng */}
        {activeTab === 'config' && (
          <div className="p-6 max-w-xl space-y-6">
            <div>
              <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                <Gear size={18} className="text-[#ff4655]" />
                Cấu Hình Chính Sách Phí Toàn Sàn
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Tỷ lệ phí thu trên mỗi đơn hàng hoàn tất. Không làm thay đổi lịch sử các đơn hàng đã chốt trước đây.
              </p>
            </div>

            <form onSubmit={handleUpdateFee} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Tỷ lệ phí nền tảng chuẩn (%) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={newFeeRate}
                    onChange={(e) => setNewFeeRate(e.target.value)}
                    required
                    className="w-full text-base font-black px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-mono"
                  />
                  <span className="absolute right-4 top-2.5 font-bold text-zinc-400">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Ghi chú thay đổi (Lưu vào lịch sử kiểm toán)
                </label>
                <textarea
                  rows={3}
                  value={feeNotes}
                  onChange={(e) => setFeeNotes(e.target.value)}
                  placeholder="Lý do điều chỉnh chính sách phí..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-400 space-y-1">
                <p><span className="font-bold text-zinc-300">Áp dụng từ:</span> {feeConfig ? new Date(feeConfig.effectiveFrom).toLocaleString('vi-VN') : 'Mặc định ban đầu'}</p>
                <p><span className="font-bold text-zinc-300">Tên chính sách:</span> {feeConfig?.name || 'Tiêu chuẩn GearTech'}</p>
              </div>

              <button
                type="submit"
                disabled={updatingFee}
                className="px-6 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-wider transition-all"
              >
                {updatingFee ? 'Đang lưu...' : 'Lưu chính sách phí mới'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Modal Duyệt & Giải Ngân */}
      <AnimatePresence>
        {showPayoutModal && selectedWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase text-emerald-500 flex items-center gap-2">
                  <Bank size={20} /> Xác Nhận Đã Giải Ngân Cho Shop
                </h3>
                <button onClick={() => setShowPayoutModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                <p className="text-xs text-zinc-400">Số tiền giải ngân:</p>
                <p className="text-xl font-black text-emerald-500 font-mono">{formatPrice(selectedWithdrawal.amount)}</p>
                <p className="text-xs text-zinc-300 font-bold uppercase mt-1">
                  Đến: {selectedWithdrawal.bankInfo?.bankName} - {selectedWithdrawal.bankInfo?.accountNumber} ({selectedWithdrawal.bankInfo?.accountHolder})
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Mã giao dịch ngân hàng / Tham chiếu chuyển khoản <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={payoutRef}
                    onChange={(e) => setPayoutRef(e.target.value)}
                    required
                    placeholder="VD: FT2409817293817 hoặc IBFT_19283"
                    className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Đường dẫn biên lai chuyển khoản (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={payoutProofUrl}
                    onChange={(e) => setPayoutProofUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handlePayout}
                  disabled={processingAction}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase"
                >
                  {processingAction ? 'Đang xử lý...' : 'Xác nhận giải ngân'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Từ Chối Yêu Cầu Rút */}
      <AnimatePresence>
        {showRejectModal && selectedWithdrawal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase text-rose-500 flex items-center gap-2">
                  <XCircle size={20} /> Từ Chối Yêu Cầu Rút Tiền
                </h3>
                <button onClick={() => setShowRejectModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-zinc-400">
                Khi từ chối, số tiền <span className="font-bold text-white">{formatPrice(selectedWithdrawal.amount)}</span> sẽ được tự động hoàn trả lại số dư khả dụng (Available Balance) của Shop.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Lý do từ chối <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                  placeholder="VD: Thông tin số tài khoản và tên chủ tài khoản không khớp với hồ sơ đăng ký..."
                  className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={processingAction || !rejectReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-black text-xs uppercase"
                >
                  {processingAction ? 'Đang xử lý...' : 'Xác nhận từ chối'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
