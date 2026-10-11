import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Storefront, PlusCircle, Users } from '@phosphor-icons/react'

interface AdminShopsTabProps {
  token: string | null;
  shopsList: any[];
  onRefresh: () => void;
}

export default function AdminShopsTab({ token, shopsList, onRefresh }: AdminShopsTabProps) {
  const [shopForm, setShopForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    shopName: '',
    logo: '🏬',
    category: 'ROG Laptop & Gaming Hardware'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
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

      setSuccess(`Cấp tài khoản doanh nghiệp "${data.shop.name}" thành công!`)
      setShopForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        shopName: '',
        logo: '🏬',
        category: 'ROG Laptop & Gaming Hardware'
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
      key="admin-shops"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <Storefront size={16} className="text-[#ff4655]" />
          QUẢN LÝ GIAN HÀNG & CẤP TÀI KHOẢN DOANH NGHIỆP
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

      <form onSubmit={handleCreateShop} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <PlusCircle size={14} /> // CẤP TÀI KHOẢN DOANH NGHIỆP MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-650 tracking-wider">TÊN SHOP (VD: ASUS, RAZER...)</span>
            <input
              type="text"
              required
              value={shopForm.shopName}
              onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
              placeholder="ASUS ROG"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] uppercase"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">EMOJI LOGO</span>
            <input
              type="text"
              required
              value={shopForm.logo}
              onChange={(e) => setShopForm({ ...shopForm, logo: e.target.value })}
              placeholder="👹"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">PHÂN KHÚC ĐĂNG BÁN</span>
            <input
              type="text"
              required
              value={shopForm.category}
              onChange={(e) => setShopForm({ ...shopForm, category: e.target.value })}
              placeholder="MacBook & Apple Ecosystem"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">HỌ VÀ TÊN QUẢN LÝ</span>
            <input
              type="text"
              required
              value={shopForm.name}
              onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
              placeholder="Nguyễn Văn A"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] uppercase"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">SỐ ĐIỆN THOẠI LIÊN HỆ</span>
            <input
              type="text"
              required
              value={shopForm.phone}
              onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
              placeholder="090123456"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">EMAIL ĐĂNG NHẬP</span>
            <input
              type="email"
              required
              value={shopForm.email}
              onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
              placeholder="partner@asus.com"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-650 tracking-wider">MẬT KHẨU</span>
            <input
              type="password"
              required
              value={shopForm.password}
              onChange={(e) => setShopForm({ ...shopForm, password: e.target.value })}
              placeholder="••••••••"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] cursor-pointer"
        >
          {submitting ? 'ĐANG TẠO...' : 'XÁC NHẬN CẤP TÀI KHOẢN'}
        </button>
      </form>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest flex items-center gap-1.5">
          <Users size={14} /> // DANH SÁCH GIAN HÀNG ĐỐI TÁC ({shopsList.length})
        </h4>

        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-900 rounded-md">
          <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-900 text-[10px]">
            <thead className="bg-zinc-100 dark:bg-zinc-900/60 font-black uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-4 py-3 text-left">Gian hàng</th>
                <th className="px-4 py-3 text-left">Phân khúc</th>
                <th className="px-4 py-3 text-left">Quản trị viên</th>
                <th className="px-4 py-3 text-left">Đánh giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-250 dark:divide-zinc-900/70 font-semibold text-zinc-700 dark:text-zinc-300">
              {shopsList.map((shop) => (
                <tr key={shop._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/20">
                  <td className="px-4 py-3 flex items-center gap-2 font-bold text-zinc-900 dark:text-white uppercase">
                    <span className="text-lg">{shop.logo}</span>
                    {shop.name}
                  </td>
                  <td className="px-4 py-3">{shop.category}</td>
                  <td className="px-4 py-3 font-mono">{shop.ownerId?.email || 'N/A'}</td>
                  <td className="px-4 py-3 text-amber-500 font-extrabold">⭐ {shop.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
