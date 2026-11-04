import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle, Truck, X } from '@phosphor-icons/react'
import type { Dispatch, SetStateAction } from 'react'

export interface CustomFulfillmentParams {
  carrier: string
  customCarrierName: string
  trackingCode: string
  note: string
}

interface CustomFulfillmentOrder {
  _id: string
  shippingMethodName?: string
  shipping_method_name?: string
  shippingMethod?: string
  receiver_name?: string
  shippingAddress?: { receiverName?: string; receiverPhone?: string; detailAddress?: string }
  phone?: string
  shipping_address?: string
}

interface CustomFulfillmentModalProps {
  order: CustomFulfillmentOrder | null
  params: CustomFulfillmentParams
  setParams: Dispatch<SetStateAction<CustomFulfillmentParams>>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function CustomFulfillmentModal({ order, params, setParams, isSubmitting, onClose, onSubmit }: CustomFulfillmentModalProps) {
  return (
      <AnimatePresence>
        {order && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Truck size={20} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">
                      XÁC NHẬN GỬI HÀNG / ĐIỀU PHỐI VẬN CHUYỂN
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Đơn #{String(order._id).slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onClose()}
                  className="text-zinc-400 hover:text-white p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Thông tin phương thức khách chọn */}
              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Khách chọn vận chuyển:</span>
                  <span className="font-bold text-[#ff4655]">
                    {order.shippingMethodName || order.shipping_method_name || (
                      order.shippingMethod === 'express' ? 'GEARTECH SuperShip (Nội thành)' :
                      order.shippingMethod === 'fast' ? 'Giao hàng hỏa tốc 24H' :
                      'Giao Hàng Nhanh (GHN Express)'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Người nhận:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {order.receiver_name || order.shippingAddress?.receiverName} (
                    {order.phone || order.shippingAddress?.receiverPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Địa chỉ:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[280px]">
                    {order.shipping_address || order.shippingAddress?.detailAddress}
                  </span>
                </div>
              </div>

              {/* Form chọn hãng & nhập mã */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                    Đơn vị vận chuyển / Hình thức giao:
                  </label>
                  <select
                    value={params.carrier}
                    onChange={(e) => setParams({ ...params, carrier: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#ff4655]"
                  >
                    <option value="Ahamove">Ahamove (Giao hỏa tốc xe máy)</option>
                    <option value="GrabExpress">GrabExpress (Giao siêu tốc 1-2H)</option>
                    <option value="GEARTECH SuperShip (Tự giao)">GEARTECH SuperShip (Shop tự giao nội bộ)</option>
                    <option value="Viettel Post">Viettel Post</option>
                    <option value="J&T Express">J&T Express</option>
                    <option value="Khác">Đơn vị khác (Tự nhập)</option>
                  </select>
                </div>

                {params.carrier === 'Khác' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Tên đơn vị vận chuyển:
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: BeDelivery, Shopee Xpress..."
                      value={params.customCarrierName}
                      onChange={(e) => setParams({ ...params, customCarrierName: e.target.value })}
                      className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff4655]"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold uppercase text-zinc-500">
                      Mã vận đơn / Số theo dõi:
                    </label>
                    <button
                      type="button"
                      onClick={() => setParams({
                        ...params,
                        trackingCode: `GT-${(order.shippingMethod || 'EXP').toUpperCase()}-${Date.now().toString().slice(-6)}`
                      })}
                      className="text-[9px] text-blue-500 hover:underline font-mono"
                    >
                      Tự sinh mã GEARTECH
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập mã vận đơn từ shipper hoặc bấm Tự sinh mã"
                    value={params.trackingCode}
                    onChange={(e) => setParams({ ...params, trackingCode: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-[#ff4655]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                    Ghi chú giao hàng (Tùy chọn):
                  </label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Đã bàn giao shipper Ahamove lúc 14h30"
                    value={params.note}
                    onChange={(e) => setParams({ ...params, note: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff4655]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => onClose()}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle size={14} weight="bold" />
                  {isSubmitting ? 'Đang xác nhận...' : 'Xác nhận xuất kho & Giao hàng'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  )
}
