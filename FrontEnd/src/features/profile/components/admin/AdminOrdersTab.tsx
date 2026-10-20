import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  Receipt, HourglassMedium, CheckCircle, Truck, XCircle, 
  Storefront, User, Warning, ArrowClockwise
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { orderService } from '../../../../services/orderService'

export default function AdminOrdersTab() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchAdminOrders = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const data = await orderService.getAdminOrders(
        statusFilter !== 'all' ? { status: statusFilter } : undefined
      )
      setOrders(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi tải danh sách đơn hàng toàn sàn.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminOrders()
  }, [statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
            <CheckCircle size={12} weight="bold" /> Hoàn tất
          </span>
        )
      case 'shipping':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-blue-500 bg-blue-500/10 border-blue-500/20">
            <Truck size={12} weight="bold" /> Đang giao
          </span>
        )
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-cyan-500 bg-cyan-500/10 border-cyan-500/20">
            <CheckCircle size={12} weight="bold" /> Đã xác nhận
          </span>
        )
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-red-500 bg-red-500/10 border-red-500/20">
            <XCircle size={12} weight="bold" /> Đã hủy
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-amber-500 bg-amber-500/10 border-amber-500/20">
            <HourglassMedium size={12} className="animate-spin-slow" /> Chờ xác nhận
          </span>
        )
    }
  }

  return (
    <motion.div
      key="admin-orders-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Receipt size={18} className="text-[#ff4655]" />
            GIÁM SÁT ĐƠN HÀNG TOÀN SÀN ({orders.length})
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Quyền Admin: Theo dõi tất cả giao dịch, trạng thái đơn hàng và dòng tiền trên hệ thống
          </p>
        </div>

        <button
          onClick={fetchAdminOrders}
          className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 transition-colors"
        >
          <ArrowClockwise size={13} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Tất cả trạng thái' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'shipping', label: 'Đang vận chuyển' },
          { key: 'completed', label: 'Giao thành công' },
          { key: 'cancelled', label: 'Đơn đã hủy' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
              statusFilter === tab.key
                ? 'bg-[#ff4655] text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded flex items-center gap-2 font-semibold">
          <Warning size={16} />
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-zinc-400">
          <div className="inline-block animate-spin text-xl mb-2">⏳</div>
          <div>Đang tải danh sách đơn hàng toàn hệ thống...</div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Receipt size={36} className="mx-auto text-zinc-400 mb-2 opacity-50" />
          <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">Không có đơn hàng nào khớp với điều kiện lọc</div>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((ord) => {
            const status = ord.orderStatus || ord.order_status || 'pending'
            const shopName = ord.shop_id?.shopName || ord.shopId?.shopName || 'Cửa hàng liên kết'
            const customerName = ord.receiver_name || ord.shippingAddress?.receiverName || ord.user_id?.name || 'Khách hàng'
            const phone = ord.phone || ord.shippingAddress?.receiverPhone || ord.user_id?.phone || ''
            const finalAmount = ord.finalAmount ?? ord.final_amount ?? ord.totalAmount ?? ord.total_amount ?? 0
            const itemsCount = ord.items?.length || 0

            return (
              <div
                key={ord._id}
                className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-zinc-900 dark:text-white">
                      #{String(ord._id).slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded flex items-center gap-1">
                      <Storefront size={11} /> {shopName}
                    </span>
                    <span className="text-[9px] text-zinc-400 font-mono">
                      {ord.created_at ? new Date(ord.created_at).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <User size={12} className="text-[#ff4655]" /> {customerName} {phone && `(${phone})`}
                    </span>
                    <span>•</span>
                    <span>{itemsCount} mặt hàng</span>
                    <span>•</span>
                    <span className="font-mono uppercase">{ord.paymentMethod || 'COD'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-zinc-400 block uppercase">Tổng tiền:</span>
                    <span className="text-xs font-black text-[#ff4655] text-glow">
                      {formatPrice(Number(finalAmount))}
                    </span>
                  </div>

                  <div>{getStatusBadge(status)}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
