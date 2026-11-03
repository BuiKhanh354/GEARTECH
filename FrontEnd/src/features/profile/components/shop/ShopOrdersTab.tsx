import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Receipt, HourglassMedium, CheckCircle, Truck, XCircle, MapPin, 
  User, Warning, ArrowClockwise, Package, X
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { orderService } from '../../../../services/orderService'
import { shippingService, type ShipmentTrackingResponse } from '../../../../services/shippingService'

interface ShopOrdersTabProps {
  initialStatus?: string;
}

export default function ShopOrdersTab({ initialStatus }: ShopOrdersTabProps) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>(initialStatus || 'all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  // Modal tạo vận đơn GHN
  const [createModalOrder, setCreateModalOrder] = useState<any | null>(null)
  const [shipmentParams, setShipmentParams] = useState({
    weight: 500,
    length: 20,
    width: 15,
    height: 10,
    note: 'Hàng linh kiện điện tử chính hãng, xin nhẹ tay',
    requiredNote: 'CHOXEMHANGKHONGTHU' as 'CHOXEMHANGKHONGTHU' | 'CHOTHUHANG' | 'KHONGCHOXEMHANG'
  })
  const [isCreatingShipment, setIsCreatingShipment] = useState(false)

  // Modal theo dõi hành trình GHN
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null)
  const [trackingData, setTrackingData] = useState<ShipmentTrackingResponse | null>(null)
  const [isLoadingTracking, setIsLoadingTracking] = useState(false)

  // Modal xác nhận gửi hàng linh hoạt (Hỏa tốc, SuperShip, Tự giao, Hãng khác)
  const [customFulfillOrder, setCustomFulfillOrder] = useState<any | null>(null)
  const [customFulfillParams, setCustomFulfillParams] = useState({
    carrier: 'Ahamove',
    customCarrierName: '',
    trackingCode: '',
    note: ''
  })
  const [isSubmittingFulfill, setIsSubmittingFulfill] = useState(false)

  const fetchShopOrders = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const data = await orderService.getShopOrders()
      setOrders(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi tải danh sách đơn hàng của shop.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShopOrders()
  }, [])

  useEffect(() => {
    if (initialStatus) {
      setFilterStatus(initialStatus)
    }
  }, [initialStatus])

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdatingId(orderId)
      setErrorMsg(null)
      await orderService.updateOrderStatus(orderId, newStatus)
      setSuccessMsg(`Cập nhật trạng thái đơn #${orderId.slice(-6).toUpperCase()} thành "${newStatus}" thành công!`)
      await fetchShopOrders()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi cập nhật trạng thái đơn hàng.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Mở modal tạo vận đơn GHN
  const handleOpenCreateShipment = (order: any) => {
    setCreateModalOrder(order)
    setErrorMsg(null)
  }

  // Xác nhận tạo vận đơn GHN
  const handleConfirmCreateShipment = async () => {
    if (!createModalOrder) return
    try {
      setIsCreatingShipment(true)
      setErrorMsg(null)

      const res = await shippingService.createShipment({
        orderId: createModalOrder._id,
        weight: Number(shipmentParams.weight),
        length: Number(shipmentParams.length),
        width: Number(shipmentParams.width),
        height: Number(shipmentParams.height),
        note: shipmentParams.note,
        requiredNote: shipmentParams.requiredNote
      })

      setSuccessMsg(`Đã khởi tạo vận đơn GHN thành công! Mã vận đơn: ${res.trackingCode}`)
      setCreateModalOrder(null)
      await fetchShopOrders()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.details || err.response?.data?.error || 'Lỗi khi tạo vận đơn GHN.')
    } finally {
      setIsCreatingShipment(false)
    }
  }

  // Xem chi tiết hành trình GHN
  const handleOpenTrackingModal = async (order: any) => {
    setTrackingModalOrder(order)
    setIsLoadingTracking(true)
    setErrorMsg(null)
    try {
      const data = await shippingService.getTracking(order._id)
      setTrackingData(data)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Không thể tra cứu hành trình GHN.')
    } finally {
      setIsLoadingTracking(false)
    }
  }

  // Hủy vận đơn GHN
  const handleCancelShipment = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy vận đơn GHN cho đơn này không?')) return
    try {
      setUpdatingId(orderId)
      setErrorMsg(null)
      await shippingService.cancelShipment(orderId, 'Shop chủ động hủy bàn giao')
      setSuccessMsg('Hủy vận đơn GHN thành công! Trạng thái đơn được đưa về Đã xác nhận.')
      if (trackingModalOrder) setTrackingModalOrder(null)
      await fetchShopOrders()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi hủy vận đơn GHN.')
    } finally {
      setUpdatingId(null)
    }
  }

  // Mở modal xác nhận giao hàng linh hoạt
  const handleOpenCustomFulfill = (order: any) => {
    const sMethod = order.shippingMethod || order.shipping_method || 'ghn'
    let defaultCarrier = 'Ahamove'
    if (sMethod === 'express') defaultCarrier = 'GEARTECH SuperShip (Tự giao)'
    else if (sMethod === 'fast') defaultCarrier = 'GrabExpress'
    else defaultCarrier = 'Viettel Post'

    setCustomFulfillOrder(order)
    setCustomFulfillParams({
      carrier: defaultCarrier,
      customCarrierName: '',
      trackingCode: `GT-${(order.shippingMethod || 'EXP').toUpperCase()}-${Date.now().toString().slice(-6)}`,
      note: ''
    })
    setErrorMsg(null)
  }

  // Xác nhận xuất kho giao hàng linh hoạt
  const handleConfirmCustomFulfill = async () => {
    if (!customFulfillOrder) return
    try {
      setIsSubmittingFulfill(true)
      setErrorMsg(null)
      const carrierName = customFulfillParams.carrier === 'Khác'
        ? (customFulfillParams.customCarrierName.trim() || 'Đơn vị khác')
        : customFulfillParams.carrier

      await orderService.updateOrderStatus(customFulfillOrder._id, 'shipping', {
        carrier: carrierName,
        trackingCode: customFulfillParams.trackingCode.trim() || `GT-${Date.now().toString().slice(-6)}`
      })

      setSuccessMsg(`Đã xác nhận xuất kho giao hàng qua "${carrierName}" thành công!`)
      setCustomFulfillOrder(null)
      await fetchShopOrders()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi khi xác nhận giao hàng.')
    } finally {
      setIsSubmittingFulfill(false)
    }
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => (o.orderStatus || o.order_status) === filterStatus)

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
            <CheckCircle size={12} weight="bold" /> Đã hoàn tất
          </span>
        )
      case 'shipping':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-blue-500 bg-blue-500/10 border-blue-500/20">
            <Truck size={12} weight="bold" /> Đang giao hàng
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
      key="shop-orders-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Receipt size={18} className="text-[#ff4655]" />
            QUẢN LÝ ĐƠN HÀNG CỬA HÀNG ({filteredOrders.length})
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Xử lý quy trình, tạo vận đơn GHN và theo dõi lộ trình giao hàng trực tuyến
          </p>
        </div>

        <button
          onClick={fetchShopOrders}
          className="px-3 py-1.5 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded flex items-center gap-1.5 transition-colors"
        >
          <ArrowClockwise size={13} className={loading ? 'animate-spin' : ''} /> Làm mới
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'pending', label: 'Chờ duyệt' },
          { key: 'confirmed', label: 'Đã xác nhận' },
          { key: 'shipping', label: 'Đang giao' },
          { key: 'completed', label: 'Hoàn tất' },
          { key: 'cancelled', label: 'Đã hủy' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
              filterStatus === tab.key
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

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded flex items-center gap-2 font-semibold">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-zinc-400">
          <div className="inline-block animate-spin text-xl mb-2">⏳</div>
          <div>Đang tải dữ liệu đơn hàng...</div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Receipt size={36} className="mx-auto text-zinc-400 mb-2 opacity-50" />
          <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">Chưa có đơn hàng nào trong mục này</div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const status = ord.orderStatus || ord.order_status || 'pending'
            const displayItems = ord.detailedItems || ord.items || []
            const customerName = ord.receiver_name || ord.shippingAddress?.receiverName || ord.customer_id?.full_name || ord.user_id?.name || 'Khách hàng'
            const customerPhone = ord.phone || ord.shippingAddress?.receiverPhone || ord.customer_id?.phone || ord.user_id?.phone || ''
            const address = ord.shipping_address || ord.shippingAddress?.detailAddress || 'Địa chỉ nhận hàng'
            const finalAmount = ord.finalAmount ?? ord.final_amount ?? ord.totalAmount ?? ord.total_amount ?? 0
            const trackingCode = ord.trackingCode || ord.tracking_code
            const shippingMethod = ord.shippingMethod || ord.shipping_method || 'ghn'
            const shippingMethodName = ord.shippingMethodName || ord.shipping_method_name || (
              shippingMethod === 'express' ? 'GEARTECH SuperShip (Nội thành)' :
              shippingMethod === 'fast' ? 'Giao hàng hỏa tốc 24H' :
              'GHN Express'
            )

            return (
              <div
                key={ord._id}
                className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-lg space-y-4 hover:border-zinc-300 dark:hover:border-zinc-750 transition-colors"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono text-zinc-400 uppercase">// MÃ ĐƠN:</span>
                      <span className="text-xs font-black text-zinc-900 dark:text-white">#{String(ord._id).slice(-8).toUpperCase()}</span>
                      
                      {/* Badge gói vận chuyển khách hàng đã chọn */}
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border ${
                        shippingMethod === 'express'
                          ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                          : shippingMethod === 'fast'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                          : 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                      }`}>
                        <Truck size={11} weight="bold" /> {shippingMethodName}
                      </span>

                      {trackingCode && (
                        <span className="px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20 text-[9px] font-mono font-bold flex items-center gap-1">
                          <Package size={11} /> {ord.carrier || 'Vận đơn'}: {trackingCode}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-zinc-400 font-mono">
                      {ord.created_at ? new Date(ord.created_at).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                  </div>
                </div>

                {/* Thông tin khách hàng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-white dark:bg-zinc-950/50 rounded border border-zinc-100 dark:border-zinc-850 text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                    <User size={13} className="text-[#ff4655]" />
                    <span className="font-bold">{customerName}</span>
                    {customerPhone && <span className="text-zinc-400">({customerPhone})</span>}
                  </div>
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <MapPin size={13} className="text-[#ff4655]" />
                    <span className="truncate">{address}</span>
                  </div>
                </div>

                {/* Sản phẩm trong đơn */}
                <div className="space-y-2">
                  {displayItems.map((item: any, idx: number) => {
                    const itemName = item.product_name || item.title || item.product_id?.title || 'Sản phẩm'
                    const itemSku = item.sku || item.product_id?.sku || ''
                    const itemPrice = item.unitPrice ?? item.unit_price ?? item.price ?? 0
                    const itemQty = item.quantity ?? item.qty ?? 1

                    return (
                      <div key={idx} className="flex justify-between items-center text-xs py-1 border-b border-zinc-100 dark:border-zinc-900/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4655]"></span>
                          <span className="font-medium text-zinc-800 dark:text-zinc-200">{itemName}</span>
                          {itemSku && <span className="text-[9px] font-mono text-zinc-400">({itemSku})</span>}
                          <span className="text-[10px] font-bold text-zinc-500">x{itemQty}</span>
                        </div>
                        <span className="font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                          {formatPrice(Number(itemPrice) * Number(itemQty))}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Chuyển đổi trạng thái & Tác vụ vận chuyển GHN */}
                <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="text-[10px]">
                    <span className="text-zinc-400">PTTT: </span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase">{ord.paymentMethod || 'COD'}</span>
                    <span className="mx-2">•</span>
                    <span className="text-zinc-400">Phí ship: </span>
                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{formatPrice(ord.shippingFee || 30000)}</span>
                    <span className="mx-2">•</span>
                    <span className="text-zinc-400">Tổng thu: </span>
                    <span className="font-black text-[#ff4655] text-xs">{formatPrice(Number(finalAmount))}</span>
                  </div>

                  {/* Các nút hành động theo quy trình */}
                  <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
                    {/* Trạng thái PENDING: Duyệt đơn hoặc Hủy đơn */}
                    {status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(ord._id, 'confirmed')}
                          disabled={updatingId === ord._id}
                          className="px-3 py-1.5 text-[10px] font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded transition-colors disabled:opacity-50"
                        >
                          Xác nhận đơn
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(ord._id, 'cancelled')}
                          disabled={updatingId === ord._id}
                          className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded transition-colors disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      </>
                    )}

                    {/* Trạng thái CONFIRMED: Chưa xuất kho vận chuyển */}
                    {status === 'confirmed' && !trackingCode && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Nếu khách chọn GHN Express */}
                        {shippingMethod === 'ghn' ? (
                          <>
                            <button
                              onClick={() => handleOpenCreateShipment(ord)}
                              disabled={updatingId === ord._id}
                              className="px-3 py-1.5 text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-500 rounded transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                            >
                              <Package size={13} weight="bold" /> Tạo vận đơn GHN
                            </button>
                            <button
                              onClick={() => handleOpenCustomFulfill(ord)}
                              disabled={updatingId === ord._id}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors flex items-center gap-1"
                              title="Tự giao hàng hoặc chuyển qua hãng khác"
                            >
                              <Truck size={13} /> Tự giao / Hãng khác
                            </button>
                          </>
                        ) : (
                          /* Nếu khách chọn Hỏa tốc 24H hoặc GEARTECH SuperShip 2H */
                          <>
                            <button
                              onClick={() => handleOpenCustomFulfill(ord)}
                              disabled={updatingId === ord._id}
                              className={`px-3 py-1.5 text-[10px] font-bold text-white rounded transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                shippingMethod === 'express'
                                  ? 'bg-amber-600 hover:bg-amber-500'
                                  : 'bg-blue-600 hover:bg-blue-500'
                              }`}
                            >
                              <Truck size={13} weight="bold" /> Xác nhận gửi hàng ({shippingMethod === 'express' ? 'SuperShip 2H' : 'Hỏa tốc 24H'})
                            </button>
                            <button
                              onClick={() => handleOpenCreateShipment(ord)}
                              disabled={updatingId === ord._id}
                              className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 rounded transition-colors flex items-center gap-1"
                              title="Chuyển đổi sang gửi qua GHN Express"
                            >
                              <Package size={13} /> Gửi qua GHN
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Nếu đã có mã vận đơn */}
                    {trackingCode && (
                      <>
                        {ord.carrier === 'GHN' ? (
                          <button
                            onClick={() => handleOpenTrackingModal(ord)}
                            className="px-2.5 py-1.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded transition-colors flex items-center gap-1"
                          >
                            <Truck size={13} /> Hành trình GHN
                          </button>
                        ) : (
                          <span className="px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center gap-1">
                            <Truck size={13} /> {ord.carrier || 'Đang giao'}: {trackingCode}
                          </span>
                        )}
                      </>
                    )}

                    {/* Trạng thái SHIPPING: Hoàn tất đơn */}
                    {status === 'shipping' && (
                      <button
                        onClick={() => handleUpdateStatus(ord._id, 'completed')}
                        disabled={updatingId === ord._id}
                        className="px-3 py-1.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle size={13} /> Xác nhận đã giao
                      </button>
                    )}

                    {status === 'completed' && (
                      <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        <CheckCircle size={13} /> Giao dịch hoàn tất
                      </span>
                    )}

                    {status === 'cancelled' && (
                      <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                        <XCircle size={13} /> Đã hoàn kho
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: TẠO VẬN ĐƠN GHN                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {createModalOrder && (
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
                  onClick={() => setCreateModalOrder(null)}
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
                      #{String(createModalOrder._id).slice(-8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Người nhận:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {createModalOrder.receiver_name || createModalOrder.shippingAddress?.receiverName} ({createModalOrder.phone})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Địa chỉ giao:</span>
                    <span className="text-right max-w-[280px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {createModalOrder.shipping_address || createModalOrder.shippingAddress?.detailAddress}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-700/50 pt-1.5">
                    <span className="text-zinc-500">Thu hộ COD:</span>
                    <span className="font-black text-[#ff4655]">
                      {(createModalOrder.paymentMethod || 'COD').toUpperCase() === 'COD'
                        ? formatPrice(createModalOrder.finalAmount || 0)
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
                      value={shipmentParams.weight}
                      onChange={(e) => setShipmentParams({ ...shipmentParams, weight: Number(e.target.value) })}
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
                        value={shipmentParams.length}
                        onChange={(e) => setShipmentParams({ ...shipmentParams, length: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-center font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        title="Rộng"
                        placeholder="R"
                        value={shipmentParams.width}
                        onChange={(e) => setShipmentParams({ ...shipmentParams, width: Number(e.target.value) })}
                        className="w-1/3 px-2 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-center font-mono"
                      />
                      <input
                        type="number"
                        min={1}
                        title="Cao"
                        placeholder="C"
                        value={shipmentParams.height}
                        onChange={(e) => setShipmentParams({ ...shipmentParams, height: Number(e.target.value) })}
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
                    value={shipmentParams.requiredNote}
                    onChange={(e: any) => setShipmentParams({ ...shipmentParams, requiredNote: e.target.value })}
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
                    value={shipmentParams.note}
                    onChange={(e) => setShipmentParams({ ...shipmentParams, note: e.target.value })}
                    placeholder="VD: Hàng linh kiện điện tử, giao trước 17h..."
                    className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOrder(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreateShipment}
                  disabled={isCreatingShipment}
                  className="px-5 py-2 text-xs font-black uppercase tracking-wider text-white bg-[#ff4655] hover:bg-[#e03d4b] rounded shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isCreatingShipment ? (
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

      {/* ========================================================================= */}
      {/* MODAL 2: XEM HÀNH TRÌNH VẬN ĐƠN GHN                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {trackingModalOrder && (
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
                      Mã vận đơn: #{trackingData?.trackingCode || trackingModalOrder.trackingCode || '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
                {isLoadingTracking ? (
                  <div className="py-12 text-center text-zinc-400">
                    <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                    <div>Đang cập nhật hành trình từ vệ tinh GHN...</div>
                  </div>
                ) : trackingData?.hasShipment ? (
                  <>
                    {/* Thẻ tóm tắt */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500">
                          Đơn vị vận chuyển
                        </span>
                        <span className="font-black text-xs text-blue-600 dark:text-blue-400">
                          {trackingData.carrier || 'GHN Express'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500">Trạng thái hiện tại:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {trackingData.shippingStatus || 'Đang luân chuyển'}
                        </span>
                      </div>
                      {trackingData.expectedDeliveryDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-zinc-500">Dự kiến giao:</span>
                          <span className="font-mono text-zinc-700 dark:text-zinc-300">
                            {new Date(trackingData.expectedDeliveryDate).toLocaleDateString('vi-VN')}
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
                        {(trackingData.timeline || []).map((tl, i) => (
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
                {trackingData?.shippingStatus === 'ready_to_pick' && (
                  <button
                    onClick={() => handleCancelShipment(trackingModalOrder._id)}
                    className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded transition-colors"
                  >
                    Hủy vận đơn GHN
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="ml-auto px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: XÁC NHẬN GỬI HÀNG LINH HOẠT (HỎA TỐC / SUPERSHIP / TỰ GIAO / KHÁC)*/}
      {/* ========================================================================= */}
      <AnimatePresence>
        {customFulfillOrder && (
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
                      Đơn #{String(customFulfillOrder._id).slice(-8).toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCustomFulfillOrder(null)}
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
                    {customFulfillOrder.shippingMethodName || customFulfillOrder.shipping_method_name || (
                      customFulfillOrder.shippingMethod === 'express' ? 'GEARTECH SuperShip (Nội thành)' :
                      customFulfillOrder.shippingMethod === 'fast' ? 'Giao hàng hỏa tốc 24H' :
                      'Giao Hàng Nhanh (GHN Express)'
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Người nhận:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {customFulfillOrder.receiver_name || customFulfillOrder.shippingAddress?.receiverName} (
                    {customFulfillOrder.phone || customFulfillOrder.shippingAddress?.receiverPhone})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Địa chỉ:</span>
                  <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[280px]">
                    {customFulfillOrder.shipping_address || customFulfillOrder.shippingAddress?.detailAddress}
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
                    value={customFulfillParams.carrier}
                    onChange={(e) => setCustomFulfillParams({ ...customFulfillParams, carrier: e.target.value })}
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

                {customFulfillParams.carrier === 'Khác' && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 mb-1">
                      Tên đơn vị vận chuyển:
                    </label>
                    <input
                      type="text"
                      placeholder="Ví dụ: BeDelivery, Shopee Xpress..."
                      value={customFulfillParams.customCarrierName}
                      onChange={(e) => setCustomFulfillParams({ ...customFulfillParams, customCarrierName: e.target.value })}
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
                      onClick={() => setCustomFulfillParams({
                        ...customFulfillParams,
                        trackingCode: `GT-${(customFulfillOrder.shippingMethod || 'EXP').toUpperCase()}-${Date.now().toString().slice(-6)}`
                      })}
                      className="text-[9px] text-blue-500 hover:underline font-mono"
                    >
                      Tự sinh mã GEARTECH
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập mã vận đơn từ shipper hoặc bấm Tự sinh mã"
                    value={customFulfillParams.trackingCode}
                    onChange={(e) => setCustomFulfillParams({ ...customFulfillParams, trackingCode: e.target.value })}
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
                    value={customFulfillParams.note}
                    onChange={(e) => setCustomFulfillParams({ ...customFulfillParams, note: e.target.value })}
                    className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-xs focus:outline-none focus:border-[#ff4655]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setCustomFulfillOrder(null)}
                  disabled={isSubmittingFulfill}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCustomFulfill}
                  disabled={isSubmittingFulfill}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <CheckCircle size={14} weight="bold" />
                  {isSubmittingFulfill ? 'Đang xác nhận...' : 'Xác nhận xuất kho & Giao hàng'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
