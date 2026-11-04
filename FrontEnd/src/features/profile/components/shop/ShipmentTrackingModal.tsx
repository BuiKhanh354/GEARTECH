import { AnimatePresence, motion } from 'motion/react'
import { Truck, X } from '@phosphor-icons/react'
import type { ShipmentTrackingResponse } from '../../../../services/shippingService'

interface TrackingOrderSummary {
  _id: string
  trackingCode?: string
}

interface ShipmentTrackingModalProps {
  order: TrackingOrderSummary | null
  data: ShipmentTrackingResponse | null
  loading: boolean
  onClose: () => void
  onCancel: (orderId: string) => void
}

export default function ShipmentTrackingModal({ order, data, loading, onClose, onCancel }: ShipmentTrackingModalProps) {
  return (
      <AnimatePresence>
        {order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex items-center gap-2">
                  <Truck size={20} className="text-[#ff4655]" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                      HÀNH TRÌNH GIAO VẬN GHN
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Mã vận đơn: #{data?.trackingCode || order.trackingCode || '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onClose()}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {loading ? (
                  <div className="py-12 text-center text-zinc-400">
                    <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                    <div>Đang cập nhật hành trình từ vệ tinh GHN...</div>
                  </div>
                ) : data?.hasShipment ? (
                  <>
                    {/* Thẻ tóm tắt */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                          Đơn vị vận chuyển
                        </span>
                        <span className="font-black text-xs text-blue-600 dark:text-blue-400">
                          {data.carrier || 'GHN Express'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500">Trạng thái hiện tại:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {data.shippingStatus || 'Đang luân chuyển'}
                        </span>
                      </div>
                      {data.expectedDeliveryDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-500">Dự kiến giao:</span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {new Date(data.expectedDeliveryDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lịch sử các mốc timeline */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Các mốc sự kiện vận chuyển
                      </h4>
                      <div className="space-y-3 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2 pl-4">
                        {(data.timeline || []).map((tl, i) => (
                          <div key={i} className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#ff4655] ring-4 ring-white dark:ring-zinc-900" />
                            <div className="text-[10px] text-zinc-400 font-mono">
                              {new Date(tl.updated_at).toLocaleString('vi-VN')}
                            </div>
                            <div className="font-bold text-zinc-800 dark:text-zinc-200 mt-0.5">
                              {tl.description || tl.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-zinc-400">
                    Chưa có thông tin vận đơn được ghi nhận.
                  </div>
                )}
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                {/* Nút hủy nếu kiện hàng chưa xuất kho */}
                {data?.shippingStatus === 'ready_to_pick' && (
                  <button
                    onClick={() => onCancel(order._id)}
                    className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded transition-colors"
                  >
                    Hủy vận đơn GHN
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="ml-auto px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  )
}
