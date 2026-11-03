import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  CurrencyDollar, 
  Wallet, 
  HourglassMedium, 
  CheckCircle, 
  Bank, 
  CreditCard, 
  ArrowsClockwise, 
  MagnifyingGlass, 
  Funnel, 
  Clock, 
  X, 
  WarningCircle,
  FileText
} from '@phosphor-icons/react'
import { 
  financeService, 
  type ShopWallet, 
  type FinancialStats, 
  type FinancialTransactionItem, 
  type WithdrawalRequestItem 
} from '../../../services/financeService'
import { formatPrice } from '../../../utils/format'

export default function SellerFinancePage() {
  const [wallet, setWallet] = useState<ShopWallet | null>(null)
  const [stats, setStats] = useState<FinancialStats | null>(null)
  const [transactions, setTransactions] = useState<FinancialTransactionItem[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions')

  // Bộ lọc giao dịch
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  // Modal rút tiền & cập nhật tài khoản
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showBankModal, setShowBankModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Form tài khoản ngân hàng
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [bankCode, setBankCode] = useState('')

  const loadOverview = async () => {
    try {
      const data = await financeService.getShopOverview()
      setWallet(data.wallet)
      setStats(data.stats)
      if (data.wallet?.payoutAccount) {
        setBankName(data.wallet.payoutAccount.bankName || '')
        setAccountNumber(data.wallet.payoutAccount.accountNumber || '')
        setAccountHolder(data.wallet.payoutAccount.accountHolder || '')
        setBankCode(data.wallet.payoutAccount.bankCode || '')
      }
    } catch (err: any) {
      console.error('Lỗi tải tài chính shop:', err)
    }
  }

  const loadTransactions = async () => {
    try {
      const data = await financeService.getShopTransactions({
        type: filterType,
        search: searchQuery,
        page: currentPage,
        limit: 15
      })
      setTransactions(data.transactions || [])
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.total || 0)
    } catch (err) {
      console.error('Lỗi tải giao dịch:', err)
    }
  }

  const loadWithdrawals = async () => {
    try {
      const list = await financeService.getShopWithdrawals()
      setWithdrawals(list || [])
    } catch (err) {
      console.error('Lỗi tải yêu cầu rút tiền:', err)
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([loadOverview(), loadTransactions(), loadWithdrawals()])
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    loadTransactions()
  }, [filterType, searchQuery, currentPage])

  // Xử lý tạo yêu cầu rút tiền
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    setActionSuccess('')

    const num = Number(withdrawAmount)
    if (!num || num < 50000) {
      setActionError('Số tiền rút tối thiểu là 50.000 VNĐ')
      return
    }

    if (!wallet || wallet.availableBalance < num) {
      setActionError('Số dư khả dụng không đủ để thực hiện yêu cầu này')
      return
    }

    if (!bankName || !accountNumber || !accountHolder) {
      setActionError('Vui lòng hoàn tất thông tin tài khoản ngân hàng nhận tiền')
      return
    }

    try {
      setSubmittingWithdraw(true)
      const res = await financeService.requestWithdrawal({
        amount: num,
        bankName,
        accountNumber,
        accountHolder,
        bankCode
      })
      setActionSuccess(res.message)
      setWithdrawAmount('')
      setShowWithdrawModal(false)
      await Promise.all([loadOverview(), loadTransactions(), loadWithdrawals()])
    } catch (err: any) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi tạo yêu cầu rút tiền')
    } finally {
      setSubmittingWithdraw(false)
    }
  }

  // Xử lý cập nhật thông tin tài khoản ngân hàng
  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError('')
    try {
      const res = await financeService.updatePayoutAccount({
        bankName,
        accountNumber,
        accountHolder,
        bankCode
      })
      setActionSuccess(res.message)
      setShowBankModal(false)
      await loadOverview()
    } catch (err: any) {
      setActionError(err.response?.data?.error || err.message || 'Lỗi cập nhật tài khoản')
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'ORDER_REVENUE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">DOANH THU ĐƠN</span>
      case 'ORDER_SETTLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">ĐÃ ĐỐI SOÁT</span>
      case 'WITHDRAWAL_REQUEST':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">LỆNH RÚT TIỀN</span>
      case 'WITHDRAWAL_SUCCESS':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-green-500/10 text-green-500 border border-green-500/20">GIẢI NGÂN XONG</span>
      case 'WITHDRAWAL_REJECT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20">RÚT BỊ TỪ CHỐI</span>
      case 'ORDER_CANCELLED':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">HỦY ĐƠN HÀNG</span>
      case 'ORDER_REFUND':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500/10 text-red-500 border border-red-500/20">HOÀN TIỀN</span>
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-black bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">{type}</span>
    }
  }

  const getWithdrawalStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/30">⏳ Chờ Admin duyệt</span>
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/30">✓ Đã duyệt (Đang chuyển)</span>
      case 'PAID_OUT':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">🎉 Đã giải ngân thành công</span>
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/30">✕ Đã bị từ chối</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-zinc-500/10 text-zinc-400">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-zinc-400 uppercase tracking-widest animate-pulse">
        // Đang nạp dữ liệu ví tiền & sổ cái...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950/60 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">// FINANCIAL_LEDGER_MODULE</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">LIVE ACTIVE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
            <Wallet size={24} className="text-[#ff4655]" />
            Quản Lý Tài Chính & Ví Tiền Shop
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Theo dõi chi tiết dòng tiền doanh thu, đối soát tự động khi hoàn tất đơn và giải ngân về tài khoản ngân hàng.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!wallet || wallet.availableBalance < 50000}
            className="px-4 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#ff4655]/20 flex items-center gap-2 cursor-pointer"
          >
            <Bank size={16} />
            Rút tiền về ngân hàng
          </button>
          <button
            onClick={() => {
              loadOverview()
              loadTransactions()
              loadWithdrawals()
            }}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-colors"
            title="Làm mới dữ liệu"
          >
            <ArrowsClockwise size={18} />
          </button>
        </div>
      </div>

      {/* Thông báo thao tác */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle size={18} /> {actionSuccess}
          </span>
          <button onClick={() => setActionSuccess('')} className="font-bold">✕</button>
        </div>
      )}
      {actionError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <WarningCircle size={18} /> {actionError}
          </span>
          <button onClick={() => setActionError('')} className="font-bold">✕</button>
        </div>
      )}

      {/* 4 Thẻ Số Dư Cốt Lõi */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-zinc-900/5 to-transparent border border-emerald-500/30 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black">// AVAILABLE_BALANCE</span>
            <CheckCircle size={20} />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatPrice(wallet?.availableBalance || 0)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
            <span>✓ Đủ điều kiện rút ngay lập tức</span>
          </p>
        </div>

        {/* Pending Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-zinc-900/5 to-transparent border border-amber-500/30 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black">// PENDING_RECONCILIATION</span>
            <HourglassMedium size={20} />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatPrice(wallet?.pendingBalance || 0)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
            <span>⏳ Đang chờ giao hàng & đối soát đơn</span>
          </p>
        </div>

        {/* Locked Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 via-zinc-900/5 to-transparent border border-blue-500/30 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black">// LOCKED_PAYOUT</span>
            <Clock size={20} />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatPrice(wallet?.lockedBalance || 0)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
            <span>🔒 Đang trong lệnh rút chờ Admin duyệt</span>
          </p>
        </div>

        {/* Withdrawn Balance */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 via-zinc-900/5 to-transparent border border-purple-500/30 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest font-black">// TOTAL_WITHDRAWN</span>
            <Bank size={20} />
          </div>
          <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            {formatPrice(wallet?.withdrawnBalance || 0)}
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center gap-1">
            <span>🏦 Tổng tiền đã giải ngân về ngân hàng</span>
          </p>
        </div>
      </div>

      {/* Thẻ phụ: Thống kê doanh thu & Tài khoản ngân hàng nhận tiền */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Card Doanh thu & Phí sàn */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
            <CurrencyDollar size={18} className="text-[#ff4655]" />
            Thống Kê Doanh Thu & Chính Sách Phí Nền Tảng
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">Hôm nay</span>
              <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">{formatPrice(stats?.revenueToday || 0)}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">Tháng này</span>
              <p className="text-sm font-black text-zinc-900 dark:text-white mt-1">{formatPrice(stats?.revenueMonth || 0)}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">Tổng phí sàn (5%)</span>
              <p className="text-sm font-black text-rose-500 mt-1">{formatPrice(wallet?.totalPlatformFee || 0)}</p>
            </div>
            <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
              <span className="text-[9px] font-mono text-zinc-400 uppercase">Phí sàn hiện hành</span>
              <p className="text-sm font-black text-emerald-500 mt-1">{stats?.currentFeeRate || 5}% / đơn</p>
            </div>
          </div>
        </div>

        {/* Card Tài khoản ngân hàng nhận tiền */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <CreditCard size={18} className="text-[#ff4655]" />
                Tài Khoản Nhận Tiền
              </h3>
              {wallet?.payoutAccount?.accountNumber ? (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">ĐÃ XÁC THỰC</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20">CHƯA CẬP NHẬT</span>
              )}
            </div>
            {wallet?.payoutAccount?.accountNumber ? (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs space-y-1">
                <p className="font-bold text-zinc-900 dark:text-white uppercase">{wallet.payoutAccount.bankName}</p>
                <p className="font-mono text-sm tracking-wider text-zinc-700 dark:text-zinc-300 font-bold">{wallet.payoutAccount.accountNumber}</p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-semibold">{wallet.payoutAccount.accountHolder}</p>
              </div>
            ) : (
              <p className="text-xs text-zinc-400">Chưa thiết lập tài khoản ngân hàng để nhận giải ngân.</p>
            )}
          </div>
          <button
            onClick={() => setShowBankModal(true)}
            className="mt-3 w-full py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:border-[#ff4655] text-zinc-700 dark:text-zinc-300 hover:text-[#ff4655] text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {wallet?.payoutAccount?.accountNumber ? 'Thay đổi tài khoản' : 'Thêm tài khoản nhận tiền'}
          </button>
        </div>
      </div>

      {/* Tab Điều Hướng Sổ Cái vs Lịch Sử Rút Tiền */}
      <div className="bg-white dark:bg-zinc-950/60 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <FileText size={16} /> Sổ cái giao dịch tài chính ({totalCount})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`pb-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'withdrawals'
                ? 'border-[#ff4655] text-[#ff4655]'
                : 'border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Bank size={16} /> Lịch sử yêu cầu rút tiền ({withdrawals.length})
          </button>
        </div>

        {/* Nội dung Tab 1: Sổ cái Giao dịch */}
        {activeTab === 'transactions' && (
          <div className="p-6 space-y-4">
            {/* Bộ lọc */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1">
                  <Funnel size={12} /> Loại:
                </span>
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 font-bold focus:outline-none focus:border-[#ff4655]"
                >
                  <option value="all">Tất cả loại giao dịch</option>
                  <option value="ORDER_REVENUE">Doanh thu tạm giữ (Đơn mới)</option>
                  <option value="ORDER_SETTLED">Giải ngân khả dụng (Đơn hoàn tất)</option>
                  <option value="WITHDRAWAL_REQUEST">Tạo lệnh rút tiền</option>
                  <option value="WITHDRAWAL_SUCCESS">Giải ngân thành công</option>
                  <option value="WITHDRAWAL_REJECT">Lệnh rút bị từ chối</option>
                  <option value="ORDER_CANCELLED">Hủy đơn hàng</option>
                  <option value="ORDER_REFUND">Hoàn tiền đơn hàng</option>
                </select>
              </div>

              <div className="relative w-full sm:w-64">
                <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm mã FT hoặc mô tả..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-[#ff4655]"
                />
              </div>
            </div>

            {/* Bảng sổ cái */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">MÃ GIAO DỊCH</th>
                    <th className="py-3 px-3">PHÂN LOẠI</th>
                    <th className="py-3 px-3 text-right">BIẾN ĐỘNG</th>
                    <th className="py-3 px-3 text-right">SỐ DƯ KHẢ DỤNG</th>
                    <th className="py-3 px-3">CHI TIẾT DIỄN GIẢI</th>
                    <th className="py-3 px-3 text-right">THỜI GIAN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-medium">
                        Chưa có bản ghi giao dịch nào.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                          {tx.transactionCode}
                        </td>
                        <td className="py-3.5 px-3">
                          {getTypeBadge(tx.type)}
                        </td>
                        <td className={`py-3.5 px-3 text-right font-black ${
                          tx.type === 'ORDER_SETTLED' || tx.type === 'WITHDRAWAL_REJECT' || tx.amount > 0
                            ? 'text-emerald-500' 
                            : tx.amount < 0 
                            ? 'text-rose-500' 
                            : 'text-zinc-400'
                        }`}>
                          {tx.type === 'ORDER_SETTLED' ? `+${formatPrice(tx.amount)}` : tx.amount > 0 ? `+${formatPrice(tx.amount)}` : formatPrice(tx.amount)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          {formatPrice(tx.balanceAfter)}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-600 dark:text-zinc-400 max-w-xs truncate" title={tx.description}>
                          {tx.description}
                          {tx.platformFeeAmount > 0 && (
                            <span className="block text-[10px] text-zinc-400">
                              (Tiền hàng: {formatPrice(tx.orderAmount)} | Phí sàn: -{formatPrice(tx.platformFeeAmount)})
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-[11px] text-zinc-400">
                          {new Date(tx.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                <span className="text-zinc-400">Trang {currentPage} / {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Trước
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="px-3 py-1 rounded border border-zinc-200 dark:border-zinc-800 disabled:opacity-30"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nội dung Tab 2: Lịch sử Rút tiền */}
        {activeTab === 'withdrawals' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    <th className="py-3 px-3">MÃ LỆNH RÚT</th>
                    <th className="py-3 px-3 text-right">SỐ TIỀN RÚT</th>
                    <th className="py-3 px-3">TÀI KHOẢN NHẬN TIỀN</th>
                    <th className="py-3 px-3">TRẠNG THÁI</th>
                    <th className="py-3 px-3">THÔNG TIN XỬ LÝ</th>
                    <th className="py-3 px-3 text-right">NGÀY TẠO</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-zinc-400 font-medium">
                        Chưa có yêu cầu rút tiền nào được tạo.
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w._id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3.5 px-3 font-mono font-bold text-zinc-900 dark:text-zinc-200">
                          {w.requestCode}
                        </td>
                        <td className="py-3.5 px-3 text-right font-black text-rose-500 font-mono">
                          {formatPrice(w.amount)}
                        </td>
                        <td className="py-3.5 px-3">
                          <p className="font-bold text-zinc-800 dark:text-zinc-200">{w.bankInfo?.bankName}</p>
                          <p className="font-mono text-zinc-500">{w.bankInfo?.accountNumber} ({w.bankInfo?.accountHolder})</p>
                        </td>
                        <td className="py-3.5 px-3">
                          {getWithdrawalStatusBadge(w.status)}
                        </td>
                        <td className="py-3.5 px-3 text-zinc-500 max-w-xs">
                          {w.status === 'REJECTED' && (
                            <span className="text-rose-500 font-bold">Lý do: {w.rejectReason}</span>
                          )}
                          {w.status === 'PAID_OUT' && (
                            <span className="text-emerald-500 font-mono">Mã GD NH: {w.payoutReference}</span>
                          )}
                          {w.status === 'PENDING' && (
                            <span>Đang đợi Admin chuyển khoản đối soát</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-[11px] text-zinc-400">
                          {new Date(w.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tạo Yêu Cầu Rút Tiền */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Bank size={20} className="text-[#ff4655]" />
                  Rút Tiền Về Tài Khoản Ngân Hàng
                </h3>
                <button onClick={() => setShowWithdrawModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleWithdrawSubmit} className="space-y-4 pt-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-[10px] font-mono uppercase text-zinc-400">Số dư khả dụng hiện có</span>
                  <p className="text-xl font-black text-emerald-500 mt-0.5">{formatPrice(wallet?.availableBalance || 0)}</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Số tiền muốn rút (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50000}
                      max={wallet?.availableBalance || 0}
                      step={1000}
                      placeholder="Tối thiểu 50.000 VNĐ"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      required
                      className="w-full text-sm font-bold pl-3 pr-20 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-[#ff4655]"
                    />
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(wallet?.availableBalance || 0))}
                      className="absolute right-2 top-2 px-2.5 py-1 text-[10px] font-black uppercase rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-[#ff4655] hover:text-white transition-colors"
                    >
                      Rút hết
                    </button>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Tài khoản nhận tiền đã lưu</span>
                  {bankName && accountNumber ? (
                    <div>
                      <p className="font-bold text-zinc-900 dark:text-white uppercase">{bankName}</p>
                      <p className="font-mono">{accountNumber} - <span className="uppercase">{accountHolder}</span></p>
                    </div>
                  ) : (
                    <p className="text-rose-500 font-bold">Chưa cấu hình tài khoản ngân hàng. Vui lòng bấm cập nhật!</p>
                  )}
                </div>

                {actionError && (
                  <p className="text-xs text-rose-500 font-bold">{actionError}</p>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submittingWithdraw || !bankName || !accountNumber}
                    className="flex-1 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider transition-all"
                  >
                    {submittingWithdraw ? 'Đang gửi...' : 'Gửi yêu cầu rút'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Cập Nhật Tài Khoản Ngân Hàng */}
      <AnimatePresence>
        {showBankModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-[#ff4655]" />
                  Tài Khoản Ngân Hàng Nhận Tiền
                </h3>
                <button onClick={() => setShowBankModal(false)} className="text-zinc-400 hover:text-zinc-600">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBankSubmit} className="space-y-3.5 pt-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Tên ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Vietcombank, Techcombank, MB Bank, VPBank..."
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Số tài khoản ngân hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập số tài khoản ngân hàng"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    required
                    className="w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    Họ và tên chủ tài khoản (Viết in hoa không dấu) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="VD: NGUYEN VAN A"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                    required
                    className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 uppercase focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBankModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold uppercase"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Lưu thông tin
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
