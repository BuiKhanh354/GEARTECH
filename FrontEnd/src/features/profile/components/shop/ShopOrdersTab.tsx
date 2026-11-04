import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { 
  Receipt, HourglassMedium, CheckCircle, Truck, XCircle, MapPin, 
  User, Warning, ArrowClockwise, Package
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { orderService } from '../../../../services/orderService'
import { shippingService, type ShipmentTrackingResponse } from '../../../../services/shippingService'
import ShipmentTrackingModal from './ShipmentTrackingModal'
import CreateShipmentModal, { type ShipmentParams } from './CreateShipmentModal'
import CustomFulfillmentModal, { type CustomFulfillmentParams } from './CustomFulfillmentModal'

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
  const [shipmentParams, setShipmentParams] = useState<ShipmentParams>({
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
  const [customFulfillParams, setCustomFulfillParams] = useState<CustomFulfillmentParams>({
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
      <CreateShipmentModal
        order={createModalOrder}
        params={shipmentParams}
        setParams={setShipmentParams}
        isSubmitting={isCreatingShipment}
        onClose={() => setCreateModalOrder(null)}
        onSubmit={handleConfirmCreateShipment}
      />

      {/* ========================================================================= */}
      {/* MODAL 2: XEM HÀNH TRÌNH VẬN ĐƠN GHN                                     */}
      {/* ========================================================================= */}
      <ShipmentTrackingModal
        order={trackingModalOrder}
        data={trackingData}
        loading={isLoadingTracking}
        onClose={() => setTrackingModalOrder(null)}
        onCancel={handleCancelShipment}
      />

      {/* ========================================================================= */}
      {/* MODAL 3: XÁC NHẬN GỬI HÀNG LINH HOẠT (HỎA TỐC / SUPERSHIP / TỰ GIAO / KHÁC)*/}
      {/* ========================================================================= */}
      <CustomFulfillmentModal
        order={customFulfillOrder}
        params={customFulfillParams}
        setParams={setCustomFulfillParams}
        isSubmitting={isSubmittingFulfill}
        onClose={() => setCustomFulfillOrder(null)}
        onSubmit={handleConfirmCustomFulfill}
      />
    </motion.div>
  )
}
