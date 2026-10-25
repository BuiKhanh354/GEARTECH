import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Ticket, PlusCircle, CheckCircle, XCircle, Trash, Percent, CurrencyDollar, CalendarBlank, Tag } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { voucherService, type VoucherItem } from '../../../../services/voucherService'

interface ShopVouchersTabProps {
  currentShop: any;
}

export default function ShopVouchersTab({ currentShop }: ShopVouchersTabProps) {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'fixed' as 'fixed' | 'percentage',
    discountValue: 50000,
    minOrderValue: 200000,
    maxDiscount: 100000,
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: 50,
    emoji: '🏷️'
  })

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const data = await voucherService.getShopVouchers()
      if (data && Array.isArray(data.vouchers)) {
        setVouchers(data.vouchers)
      }
    } catch (err: any) {
      console.error('Lỗi tải vouchers của shop:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
  }, [])

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!form.code.trim()) {
      setError('Vui lòng nhập mã voucher.')
      return
    }

    if (new Date(form.expiryDate) <= new Date(form.startDate)) {
      setError('Ngày kết thúc phải diễn ra sau ngày bắt đầu áp dụng.')
      return
    }

    if (form.discountType === 'percentage' && (form.discountValue < 1 || form.discountValue > 100)) {
      setError('Tỷ lệ giảm giá theo % phải nằm trong khoảng từ 1% đến 100%.')
      return
    }

    setSubmitting(true)
    try {
      const res = await voucherService.createShopVoucher({
        ...form,
        code: form.code.trim().toUpperCase()
      })
      setSuccess(`Phát hành thành công voucher "${res.voucher?.code || form.code.toUpperCase()}" cho gian hàng!`)
      setForm({
        code: '',
        name: '',
        description: '',
        discountType: 'fixed',
        discountValue: 50000,
        minOrderValue: 200000,
        maxDiscount: 100000,
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxUses: 50,
        emoji: '🏷️'
      })
      fetchVouchers()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi khi tạo mã voucher cho gian hàng.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleStatus = async (v: VoucherItem) => {
    try {
      const newStatus = v.status === 'active' ? 'inactive' : 'active'
      await voucherService.updateShopVoucherStatus(v._id, newStatus)
      fetchVouchers()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi cập nhật trạng thái voucher.')
    }
  }

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hoặc vô hiệu hóa voucher "${code}"?`)) return
    try {
      await voucherService.deleteShopVoucher(id)
      fetchVouchers()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Lỗi xóa voucher.')
    }
  }

  const filteredVouchers = vouchers.filter(v => {
    if (filterStatus === 'all') return true
    const currentStatus = v.status || 'active'
    return currentStatus === filterStatus
  })

  return (
    <motion.div
      key="shop-vouchers"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Ticket size={16} className="text-[#ff4655]" />
            MÃ GIẢM GIÁ GIAN HÀNG ({currentShop?.shopName || currentShop?.name || 'Shop Của Bạn'})
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Tạo và cấu hình các mã khuyến mãi độc quyền dành riêng cho khách hàng mua sắm tại gian hàng của bạn.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-zinc-400">Lọc:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-medium focus:outline-none focus:border-[#ff4655]"
          >
            <option value="all">Tất cả ({vouchers.length})</option>
            <option value="active">Đang kích hoạt</option>
            <option value="inactive">Đã vô hiệu hóa</option>
          </select>
        </div>
      </div>

      {/* Thông báo lỗi / thành công */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 text-xs bg-red-500/10 border border-red-500/20 text-[#ff4655] rounded-md font-semibold flex items-center gap-2"
          >
            <XCircle size={16} />
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md font-semibold flex items-center gap-2"
          >
            <CheckCircle size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form tạo Voucher mới */}
      <form onSubmit={handleCreateVoucher} className="bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h4 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <PlusCircle size={15} className="text-[#ff4655]" />
          Tạo mã giảm giá mới cho gian hàng
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Mã Voucher (Code) *</label>
            <input
              type="text"
              required
              placeholder="VD: SHOPVIP50, GEAR2026"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
              className="w-full text-xs font-mono font-bold px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white uppercase focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Tên chương trình / Khuyến mãi</label>
            <input
              type="text"
              placeholder="VD: Tri ân khách hàng thân thiết"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Biểu tượng (Emoji)</label>
            <input
              type="text"
              maxLength={4}
              value={form.emoji}
              onChange={(e) => setForm({ ...form, emoji: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-center focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Mô tả chi tiết quyền lợi</label>
            <input
              type="text"
              placeholder="VD: Giảm ngay 50.000đ cho đơn hàng từ 200.000đ tại shop"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Loại giảm giá</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, discountType: 'fixed' })}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded border transition-all ${
                  form.discountType === 'fixed'
                    ? 'bg-[#ff4655] text-white border-[#ff4655]'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <CurrencyDollar size={14} /> Tiền mặt (VND)
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, discountType: 'percentage' })}
                className={`flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold rounded border transition-all ${
                  form.discountType === 'percentage'
                    ? 'bg-[#ff4655] text-white border-[#ff4655]'
                    : 'bg-white dark:bg-zinc-900 text-zinc-500 border-zinc-200 dark:border-zinc-800'
                }`}
              >
                <Percent size={14} /> Phần trăm (%)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
              {form.discountType === 'percentage' ? 'Tỷ lệ giảm (%) *' : 'Số tiền giảm (VND) *'}
            </label>
            <input
              type="number"
              required
              min={1}
              max={form.discountType === 'percentage' ? 100 : 100000000}
              value={form.discountValue}
              onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
              className="w-full text-xs font-bold px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          {form.discountType === 'percentage' && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Giảm tối đa (0 = không giới hạn)</label>
              <input
                type="number"
                min={0}
                step={10000}
                value={form.maxDiscount}
                onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
                className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Đơn tối thiểu áp dụng (VND)</label>
            <input
              type="number"
              min={0}
              step={10000}
              value={form.minOrderValue}
              onChange={(e) => setForm({ ...form, minOrderValue: Number(e.target.value) })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Số lượt sử dụng tối đa</label>
            <input
              type="number"
              min={1}
              value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: Number(e.target.value) })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Ngày bắt đầu</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">Ngày kết thúc (Hết hạn)</label>
            <input
              type="date"
              required
              value={form.expiryDate}
              onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              className="w-full text-xs px-3 py-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:border-[#ff4655] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white rounded text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#ff4655]/20"
          >
            <PlusCircle size={15} />
            {submitting ? 'ĐANG TẠO VOUCHER...' : 'PHÁT HÀNH VOUCHER GIAN HÀNG'}
          </button>
        </div>
      </form>

      {/* Danh sách Voucher hiện có của Shop */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Tag size={15} className="text-[#ff4655]" />
          Danh sách voucher của shop ({filteredVouchers.length})
        </h4>

        {loading ? (
          <div className="text-center py-8 text-xs text-zinc-400 font-bold uppercase">
            ĐANG TẢI VOUCHER GIAN HÀNG...
          </div>
        ) : filteredVouchers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-500 uppercase font-semibold">
            Chưa có voucher nào phù hợp. Hãy tạo voucher đầu tiên cho gian hàng của bạn phía trên!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredVouchers.map((v) => {
              const isActive = (v.status || 'active') === 'active'
              const isExpired = new Date(v.expiryDate) < new Date()
              const isPercent = v.discountType === 'percentage'

              return (
                <div
                  key={v._id}
                  className={`border rounded-lg p-4 flex flex-col justify-between transition-all ${
                    !isActive
                      ? 'bg-zinc-100/50 dark:bg-zinc-900/20 border-zinc-200 dark:border-zinc-800 opacity-60'
                      : isExpired
                      ? 'bg-zinc-50 dark:bg-zinc-900/30 border-amber-500/20'
                      : 'bg-white dark:bg-zinc-900/70 border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{v.emoji || '🏷️'}</span>
                        <span className="font-mono font-black text-sm text-[#ff4655] tracking-wider px-2 py-0.5 rounded bg-[#ff4655]/10 border border-[#ff4655]/20">
                          {v.code}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                          !isActive
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                            : isExpired
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        }`}
                      >
                        {!isActive ? 'Đã tắt' : isExpired ? 'Đã hết hạn' : 'Đang kích hoạt'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">
                      {v.name || v.description}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1">
                      {v.description}
                    </p>

                    <div className="text-[10px] space-y-1 text-zinc-500 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex justify-between">
                        <span>Mức giảm:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {isPercent ? `${v.discountValue}%` : formatPrice(v.discountValue)}
                          {isPercent && v.maxDiscount ? ` (Tối đa ${formatPrice(v.maxDiscount)})` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đơn tối thiểu:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {formatPrice(v.minOrderValue || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Đã dùng:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {v.usesCount || 0} / {v.maxUses || 100} lượt
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hạn dùng:</span>
                        <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                          <CalendarBlank size={12} />
                          {new Date(v.expiryDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <button
                      onClick={() => handleToggleStatus(v)}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded transition-all flex items-center gap-1 ${
                        isActive
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500'
                      }`}
                    >
                      {isActive ? <XCircle size={13} /> : <CheckCircle size={13} />}
                      {isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </button>
                    <button
                      onClick={() => handleDelete(v._id, v.code)}
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-[#ff4655] transition-all flex items-center gap-1"
                    >
                      <Trash size={13} />
                      Xóa
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
