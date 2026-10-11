import { motion } from 'motion/react'
import { HourglassMedium } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'

interface UserOrdersTabProps {
  userOrders: any[];
}

export default function UserOrdersTab({ userOrders }: UserOrdersTabProps) {
  return (
    <motion.div
      key="orders-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 pl-1">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
          LỊCH SỬ ĐƠN HÀNG CHIẾN ĐẤU
        </h3>
      </div>

      <div className="space-y-4">
        {userOrders.length === 0 ? (
          <div className="text-center py-10 font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">// BẠN CHƯA CÓ ĐƠN HÀNG NÀO</div>
        ) : (
          userOrders.map((ord) => (
            <div key={ord._id} className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div>
                  <span className="text-[8px] font-mono text-zinc-455 block uppercase">// MÃ ĐƠN HÀNG</span>
                  <h4 className="text-[10px] font-black text-zinc-900 dark:text-white tracking-wider mt-0.5">{ord._id}</h4>
                </div>
                
                <span className={`px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${
                  ord.orderStatus === 'completed'
                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                    : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                }`}>
                  <HourglassMedium size={12} className={ord.orderStatus !== 'completed' ? 'animate-spin-slow' : ''} />
                  {ord.orderStatus === 'completed' ? 'Đã giao thành công' : 'Đang xử lý'}
                </span>
              </div>

              <div className="space-y-3">
                {ord.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-sm flex items-center justify-center text-xl">
                      📦
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white uppercase truncate tracking-wide">{item.title}</h5>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold mt-1">Số lượng: {item.qty} | Giá: {formatPrice(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                <span className="text-[9px] font-mono text-zinc-455 dark:text-zinc-555 uppercase">Hình thức: {ord.paymentMethod}</span>
                <div className="text-right">
                  <span className="text-[8px] font-mono text-zinc-455 block">TỔNG THANH TOÁN:</span>
                  <span className="text-xs font-black text-[#ff4655] text-glow mt-0.5 block">{formatPrice(ord.totalAmount)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  )
}
