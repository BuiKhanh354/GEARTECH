import { motion } from 'motion/react'
import { ChartBar } from '@phosphor-icons/react'

interface AdminOverviewTabProps {
  shopsList: any[];
  dbVouchers: any[];
  dbShowrooms: any[];
}

export default function AdminOverviewTab({ shopsList, dbVouchers, dbShowrooms }: AdminOverviewTabProps) {
  return (
    <motion.div
      key="admin-overview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex justify-between items-center">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <ChartBar size={16} className="text-[#ff4655]" />
          BẢNG ĐIỀU KHIỂN & SỐ LIỆU CHUNG HỆ THỐNG
        </h3>
        <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest font-black">
          ⚡ STATUS: ONLINE
        </span>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-1">
          <span className="text-[8px] font-mono text-zinc-450 dark:text-zinc-600 block uppercase">// TỔNG ĐỐI TÁC</span>
          <span className="text-lg font-black text-zinc-900 dark:text-white text-glow block">{shopsList.length}</span>
          <span className="text-[8px] text-zinc-450 block font-bold uppercase tracking-wider">Gian hàng đăng ký</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-1">
          <span className="text-[8px] font-mono text-zinc-450 dark:text-zinc-600 block uppercase">// MÃ VOUCHER</span>
          <span className="text-lg font-black text-yellow-500 text-glow block">{dbVouchers.length}</span>
          <span className="text-[8px] text-zinc-450 block font-bold uppercase tracking-wider">Đang hoạt động</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-1">
          <span className="text-[8px] font-mono text-zinc-450 dark:text-zinc-655 block uppercase">// SHOWROOMS</span>
          <span className="text-lg font-black text-zinc-900 dark:text-white text-glow block">{dbShowrooms.length}</span>
          <span className="text-[8px] text-zinc-450 block font-bold uppercase tracking-wider">Trải nghiệm thực tế</span>
        </div>
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-1">
          <span className="text-[8px] font-mono text-zinc-450 dark:text-zinc-655 block uppercase">// SERVER PORT</span>
          <span className="text-lg font-black text-indigo-400 text-glow block">5000</span>
          <span className="text-[8px] text-zinc-450 block font-bold uppercase tracking-wider">Express & Mongoose</span>
        </div>
      </div>

      <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-3">
        <h4 className="text-[10px] font-black tracking-widest text-zinc-500 dark:text-zinc-400 uppercase">// MODULE THÔNG TIN HỆ THỐNG MÁY CHỦ</h4>
        <ul className="space-y-1.5 font-mono text-[9px] text-zinc-500 dark:text-zinc-400">
          <li>Database Engine: <span className="text-zinc-850 dark:text-white font-bold">MongoDB 8.0 Community Edition</span></li>
          <li>JWT Cryptography: <span className="text-zinc-850 dark:text-white font-bold">HMAC-SHA256 (Expires: 7 Days)</span></li>
          <li>Hashing Salt: <span className="text-zinc-850 dark:text-white font-bold">Bcrypt 10 Rounds</span></li>
          <li>Client framework: <span className="text-zinc-850 dark:text-white font-bold">Vite 6 + React 19 + TailwindCSS</span></li>
        </ul>
      </div>
    </motion.div>
  )
}
