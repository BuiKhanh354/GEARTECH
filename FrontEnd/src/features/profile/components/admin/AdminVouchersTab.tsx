import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Ticket, PlusCircle, CheckCircle, XCircle, Trash, Percent, CurrencyDollar } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { voucherService } from '../../../../services/voucherService'

interface AdminVouchersTabProps {
  token: string | null;
  dbVouchers: any[];
  onRefresh: () => void;
}

export default function AdminVouchersTab({ dbVouchers, onRefresh }: AdminVouchersTabProps) {
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    description: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    discountValue: 100000,
    minOrderValue: 500000,
    maxDiscount: 200000,
    expiryDate: '2026-12-31',
    maxUses: 100,
    emoji: '🎫'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const data = await voucherService.createVoucher({
        ...voucherForm,
        code: voucherForm.code.trim().toUpperCase()
      })

      setSuccess(`Tạo thành công mã giảm giá ${data.voucher?.code || voucherForm.code}!`)
      setVoucherForm({
        code: '',
        description: '',
        discountType: 'fixed',
        discountValue: 100000,
        minOrderValue: 500000,
        maxDiscount: 200000,
        expiryDate: '2026-12-31',
        maxUses: 100,
        emoji: '🎫'
      })
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi tạo mã giảm giá.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (voucher: any) => {
    try {
      const newStatus = voucher.status === 'active' ? 'inactive' : 'active'
      await voucherService.updateStatus(voucher._id, newStatus)
      onRefresh()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi thay đổi trạng thái')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}"?`)) return
    try {
      await voucherService.deleteVoucher(id)
      onRefresh()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi xóa mã giảm giá')
    }
  }

  const filteredVouchers = dbVouchers.filter(v => {
    if (filterStatus === 'all') return true
    const currentStatus = v.status || 'active'
    return currentStatus === filterStatus
  })

  return (
    <motion.div
      key="admin-vouchers"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Ticket size={16} className="text-[#ff4655]" />
          QUẢN LÝ & PHÁT HÀNH MÃ GIẢM GIÁ (VOUCHER)
        </h3>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 text-[9px] font-mono font-bold uppercase rounded-sm border cursor-pointer transition-all ${
                filterStatus === st 
                  ? 'bg-[#ff4655] text-white border-[#ff4655]' 
                  : 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {st === 'all' ? 'TẤT CẢ' : st === 'active' ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-bold">
            ⚠️ {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-sm text-xs font-bold">
            ✅ {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleCreateVoucher} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <PlusCircle size={14} /> // TẠO VOUCHER KHUYẾN MÃI MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">MÃ CODE (IN HOA)</span>
            <input
              type="text"
              required
              value={voucherForm.code}
              onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value })}
              placeholder="GEARTECH150"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] uppercase"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">LOẠI GIẢM GIÁ</span>
            <select
              value={voucherForm.discountType}
              onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value as any })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              <option value="fixed">Cố định (VND)</option>
              <option value="percentage">Phần trăm (%)</option>
            </select>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              {voucherForm.discountType === 'percentage' ? 'MỨC GIẢM (%)' : 'GIẢM GIÁ (VND)'}
            </span>
            <input
              type="number"
              required
              min={1}
              max={voucherForm.discountType === 'percentage' ? 100 : 100000000}
              value={voucherForm.discountValue}
              onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })}
              placeholder={voucherForm.discountType === 'percentage' ? "10" : "100000"}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">
              {voucherForm.discountType === 'percentage' ? 'GIẢM TỐI ĐA (VND)' : 'ĐƠN TỐI THIỂU (VND)'}
            </span>
            <input
              type="number"
              required
              value={voucherForm.discountType === 'percentage' ? voucherForm.maxDiscount : voucherForm.minOrderValue}
              onChange={(e) => {
                if (voucherForm.discountType === 'percentage') {
                  setVoucherForm({ ...voucherForm, maxDiscount: Number(e.target.value) })
                } else {
                  setVoucherForm({ ...voucherForm, minOrderValue: Number(e.target.value) })
                }
              }}
              placeholder="100000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>

          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">MÔ TẢ CHI TIẾT</span>
            <input
              type="text"
              required
              value={voucherForm.description}
              onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
              placeholder="Giảm 10% tối đa 200k cho đơn từ 500k"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">HẠN SỬ DỤNG</span>
            <input
              type="date"
              required
              value={voucherForm.expiryDate}
              onChange={(e) => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">LƯỢT SỬ DỤNG TỐI ĐA</span>
            <input
              type="number"
              required
              value={voucherForm.maxUses}
              onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: Number(e.target.value) })}
              placeholder="100"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] cursor-pointer"
        >
          {submitting ? 'ĐANG TẠO...' : 'TẠO MÃ KHUYẾN MÃI'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredVouchers.map((v) => {
          const isPct = (v.discount_type || v.discountType) === 'percentage'
          const isActive = (v.status || 'active') === 'active'
          const expiryStr = v.expiryDate ? String(v.expiryDate).split('T')[0] : 'N/A'
          const used = v.usesCount || v.used_count || 0
          const max = v.maxUses || v.quantity || 100

          return (
            <div key={v._id} className={`p-4 border rounded-md relative overflow-hidden flex flex-col justify-between transition-all ${
              isActive 
                ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-850' 
                : 'bg-zinc-100/50 dark:bg-zinc-950/80 border-dashed border-zinc-300 dark:border-zinc-800 opacity-75'
            }`}>
              <span className="absolute top-2 right-2 text-2xl opacity-10">{v.emoji || '🎫'}</span>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/30 text-yellow-500 tracking-widest uppercase">
                      CODE: {v.code}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-xs text-[7px] font-mono font-bold uppercase ${
                      isActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-500 border border-zinc-500/20'
                    }`}>
                      {isActive ? 'HOẠT ĐỘNG' : 'TẠM KHÓA'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 z-10">
                    <button
                      onClick={() => handleToggleStatus(v)}
                      title={isActive ? 'Vô hiệu hóa voucher' : 'Kích hoạt voucher'}
                      className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                    >
                      {isActive ? <CheckCircle size={15} className="text-emerald-500" /> : <XCircle size={15} className="text-zinc-500" />}
                    </button>
                    <button
                      onClick={() => handleDelete(v._id, v.code)}
                      title="Xóa voucher"
                      className="p-1 rounded text-zinc-400 hover:text-red-500 cursor-pointer"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                <h4 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase leading-normal pt-1">
                  {v.description || v.name}
                </h4>

                <div className="flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500">
                  {isPct ? (
                    <span className="flex items-center gap-1 text-[#ff4655] font-bold">
                      <Percent size={12} /> Giảm {v.discountValue}% (Tối đa {formatPrice(v.maxDiscount || 0)})
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-500 font-bold">
                      <CurrencyDollar size={12} /> Giảm {formatPrice(v.discountValue)}
                    </span>
                  )}
                  <span>•</span>
                  <span>Đơn tối thiểu: {formatPrice(v.minOrderValue || 0)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-150 dark:border-zinc-900/50 mt-3 flex justify-between items-center text-[9px] font-mono text-zinc-400 dark:text-zinc-500">
                <span>ĐÃ DÙNG: {used} / {max} LƯỢT</span>
                <span>HẠN DÙNG: {expiryStr}</span>
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
