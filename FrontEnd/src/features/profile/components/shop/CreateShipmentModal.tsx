import { AnimatePresence, motion } from 'motion/react'
import { Package, X } from '@phosphor-icons/react'
import type { Dispatch, SetStateAction } from 'react'
import { formatPrice } from '../../../../utils/format'

export interface ShipmentParams {
  weight: number
  length: number
  width: number
  height: number
  note: string
  requiredNote: 'CHOXEMHANGKHONGTHU' | 'CHOTHUHANG' | 'KHONGCHOXEMHANG'
}

interface ShipmentOrderSummary {
  _id: string
  receiver_name?: string
  shippingAddress?: { receiverName?: string; detailAddress?: string }
  phone?: string
  shipping_address?: string
  paymentMethod?: string
  finalAmount?: number
}

interface CreateShipmentModalProps {
  order: ShipmentOrderSummary | null
  params: ShipmentParams
  setParams: Dispatch<SetStateAction<ShipmentParams>>
  isSubmitting: boolean
  onClose: () => void
  onSubmit: () => void
}

export default function CreateShipmentModal({ order, params, setParams, isSubmitting, onClose, onSubmit }: CreateShipmentModalProps) {
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
                  <Package size={20} className="text-[#ff4655]" />
                  <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                    KHỞI TẠO VẬN ĐƠN GIAO HÀNG NHANH (GHN)
                  </h3>
                </div>
                <button
                  onClick={() => onClose()}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {/* Thông tin đơn */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-850/50 rounded-lg space-y-1.5 border border-zinc-100 dark:border-zinc-800">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Mã đơn hàng:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      #{String(order._id).slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Người nhận:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {order.receiver_name || order.shippingAddress?.receiverName} ({order.phone})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Địa chỉ giao:</span>
                    <span className="text-right max-w-[280px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {order.shipping_address || order.shippingAddress?.detailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700/50 pt-1.5">
                    <span className="text-zinc-500">Thu hộ COD:</span>
                    <span className="font-black text-[#ff4655]">
                      {(order.paymentMethod || 'COD').toUpperCase() === 'COD'
                        ? formatPrice(order.finalAmount || 0)
                        : '0 đ (Đã thanh toán trước)'}
                    </span>
                  </div>
                </div>

                {/* Kích thước & Khối lượng */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Khối lượng (gram) *
                    </label>
                    <input
                      type="number"
                      min={50}
                      value={params.weight}
                      onChange={(e) => setParams({ ...params, weight: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                      Kích thước D x R x C (cm)
                    </label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        title="Dài"
                        placeholder="D"
                        value={params.length}
                        onChange={(e) => setParams({ ...params, length: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-center font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        title="Rộng"
                        placeholder="R"
                        value={params.width}
                        onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-center font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        title="Cao"
                        placeholder="C"
                        value={params.height}
                        onChange={(e) => setParams({ ...params, height: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-center font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Quy định xem hàng */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Lưu ý khi giao hàng (GHN Policy)
                  </label>
                  <select
                    value={params.requiredNote}
                    onChange={(e) => setParams({ ...params, requiredNote: e.target.value as ShipmentParams['requiredNote'] })}
                    className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  >
                    <option value="CHOXEMHANGKHONGTHU">Cho xem hàng không cho thử</option>
                    <option value="CHOTHUHANG">Cho thử hàng trước khi nhận</option>
                    <option value="KHONGCHOXEMHANG">Không cho xem hàng</option>
                  </select>
                </div>

                {/* Ghi chú cho tài xế GHN */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">
                    Ghi chú chi tiết cho Shipper
                  </label>
                  <input
                    type="text"
                    value={params.note}
                    onChange={(e) => setParams({ ...params, note: e.target.value })}
                    placeholder="VD: Hàng linh kiện điện tử, giao trước 17h..."
                    className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#ff4655] hover:bg-[#e03d4b] rounded shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang kết nối GHN...
                    </>
                  ) : (
                    <>
                      <Package size={14} weight="bold" /> Xác nhận đẩy đơn sang GHN
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  )
}
