import { motion } from 'motion/react'
import { formatPrice } from '../../../../utils/format'

interface UserVouchersTabProps {
  dbVouchers: any[];
}

export default function UserVouchersTab({ dbVouchers }: UserVouchersTabProps) {
  return (
    <motion.div
      key="vouchers-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 pl-1">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
          VOUCHER ƯU ĐÃI THÀNH VIÊN
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbVouchers.length === 0 ? (
          <div className="text-center py-10 font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600 col-span-2">// KHÔNG CÓ VOUCHER NÀO ĐANG HOẠT ĐỘNG</div>
        ) : (
          dbVouchers.map((v) => (
            <div key={v.code} className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-md relative overflow-hidden flex flex-col justify-between">
              <span className="absolute top-2 right-2 text-2xl opacity-10">{v.emoji || '🎫'}</span>
              <div className="space-y-2">
                <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-black bg-yellow-400/10 border border-yellow-400/30 text-yellow-500 tracking-widest uppercase">
                  CODE: {v.code}
                </span>
                <h4 className="text-xs font-bold text-zinc-800 dark:text-white leading-normal uppercase pt-1">{v.description}</h4>
                <p className="text-[9px] text-zinc-400 dark:text-zinc-550 font-semibold pt-1">Đơn tối thiểu: {formatPrice(v.minOrderValue)}</p>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-900/60 mt-4">
                <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-550">Hạn dùng: {v.expiryDate ? v.expiryDate.split('T')[0] : 'N/A'}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(v.code)
                    alert(`Đã copy mã voucher: ${v.code}`)
                  }}
                  className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-3.5 py-2.5 rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-[#ff4655] hover:text-white dark:hover:bg-[#ff4655] dark:hover:text-white transition-all shadow-sm"
                >
                  Sao chép mã
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
