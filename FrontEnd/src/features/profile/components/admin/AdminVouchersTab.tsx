import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Ticket, PlusCircle } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'

interface AdminVouchersTabProps {
  token: string | null;
  dbVouchers: any[];
  onRefresh: () => void;
}

export default function AdminVouchersTab({ token, dbVouchers, onRefresh }: AdminVouchersTabProps) {
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    description: '',
    discountValue: 100000,
    minOrderValue: 1000000,
    expiryDate: '2026-12-31',
    maxUses: 100,
    emoji: '🎫'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    try {
      const res = await fetch('http://localhost:5000/api/vouchers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(voucherForm)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(`Tạo thành công mã giảm giá ${data.voucher.code}!`)
      setVoucherForm({
        code: '',
        description: '',
        discountValue: 100000,
        minOrderValue: 1000000,
        expiryDate: '2026-12-31',
        maxUses: 100,
        emoji: '🎫'
      })
      onRefresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      key="admin-vouchers"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Ticket size={16} className="text-[#ff4655]" />
          QUẢN LÝ & PHÁT HÀNH MÃ GIẢM GIÁ (VOUCHER)
        </h3>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">MÃ CODE (IN HOA)</span>
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
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">GIẢM GIÁ (VND)</span>
            <input
              type="number"
              required
              value={voucherForm.discountValue}
              onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })}
              placeholder="100000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">ĐƠN TỐI THIỂU</span>
            <input
              type="number"
              required
              value={voucherForm.minOrderValue}
              onChange={(e) => setVoucherForm({ ...voucherForm, minOrderValue: Number(e.target.value) })}
              placeholder="500000"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">MÔ TẢ VOUCHER</span>
            <input
              type="text"
              required
              value={voucherForm.description}
              onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
              placeholder="Giảm 100K cho đơn hàng Laptop GearTech từ 10 Triệu"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">EMOJI</span>
            <input
              type="text"
              required
              value={voucherForm.emoji}
              onChange={(e) => setVoucherForm({ ...voucherForm, emoji: e.target.value })}
              placeholder="🎫"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">HẠN SỬ DỤNG</span>
            <input
              type="date"
              required
              value={voucherForm.expiryDate}
              onChange={(e) => setVoucherForm({ ...voucherForm, expiryDate: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">LƯỢT SỬ DỤNG TỐI ĐA</span>
            <input
              type="number"
              required
              value={voucherForm.maxUses}
              onChange={(e) => setVoucherForm({ ...voucherForm, maxUses: Number(e.target.value) })}
              placeholder="100"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
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
        {dbVouchers.map((v) => (
          <div key={v._id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-md relative overflow-hidden flex flex-col justify-between">
            <span className="absolute top-2 right-2 text-2xl opacity-10">{v.emoji}</span>
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/30 text-yellow-500 tracking-widest uppercase">
                CODE: {v.code}
              </span>
              <h4 className="text-[10px] font-bold text-zinc-900 dark:text-white uppercase leading-normal pt-1">{v.description}</h4>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-550">Giảm: <span className="text-zinc-900 dark:text-white font-bold">{formatPrice(v.discountValue)}</span> | Đơn tối thiểu: <span className="text-zinc-900 dark:text-white font-bold">{formatPrice(v.minOrderValue)}</span></p>
            </div>
            <div className="pt-2 border-t border-zinc-155 dark:border-zinc-900/50 mt-3 flex justify-between items-center text-[9px] font-mono text-zinc-400 dark:text-zinc-650">
              <span>ĐÃ DÙNG: {v.usesCount} / {v.maxUses} LƯỢT</span>
              <span>Hạn dùng: {v.expiryDate ? v.expiryDate.split('T')[0] : 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
