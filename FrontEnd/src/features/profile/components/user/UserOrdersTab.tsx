import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  HourglassMedium, CheckCircle, Truck, XCircle, MapPin, Receipt, Warning, 
  CreditCard, Bank, X, ArrowClockwise, CurrencyCircleDollar, DeviceMobile
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { orderService } from '../../../../services/orderService'
import { paymentService } from '../../../../services/paymentService'
import { shippingService, type ShipmentTrackingResponse } from '../../../../services/shippingService'

interface UserOrdersTabProps {
  userOrders: any[];
  onRefreshOrders?: () => void;
}

export default function UserOrdersTab({ userOrders, onRefreshOrders }: UserOrdersTabProps) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // E1: Loc don hang theo trang thai xu ly
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const STATUS_FILTERS = [
    { key: 'all', label: 'Tất cả' },
    { key: 'pending', label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping', label: 'Đang vận chuyển' },
    { key: 'completed', label: 'Hoàn tất' },
    { key: 'cancelled', label: 'Đã hủy' }
  ]

  // Payment Modal State
  const [paymentModalOrder, setPaymentModalOrder] = useState<any | null>(null)
  const [paymentIntentData, setPaymentIntentData] = useState<any | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'credit_card'>('BANK_TRANSFER')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // GHN Tracking Modal State
  const [trackingModalOrder, setTrackingModalOrder] = useState<any | null>(null)
  const [trackingData, setTrackingData] = useState<ShipmentTrackingResponse | null>(null)
  const [isLoadingTracking, setIsLoadingTracking] = useState(false)

  const handleOpenTrackingModal = async (order: any) => {
    setTrackingModalOrder(order)
    setIsLoadingTracking(true)
    setErrorMsg(null)
    try {
      const data = await shippingService.getTracking(order._id)
      setTrackingData(data)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Không thể lấy thông tin hành trình GHN.')
    } finally {
      setIsLoadingTracking(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không? Số lượng sản phẩm sẽ được hoàn lại kho.')) {
      return
    }

    try {
      setCancellingId(orderId)
      setErrorMsg(null)
      await orderService.cancelOrder(orderId)
      setSuccessMsg(`Hủy đơn hàng #${orderId.slice(-6).toUpperCase()} thành công!`)
      if (onRefreshOrders) {
        onRefreshOrders()
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Không thể hủy đơn hàng vào lúc này.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleOpenPaymentModal = async (order: any) => {
    try {
      setPaymentModalOrder(order)
      setErrorMsg(null)
      setIsProcessingPayment(true)

      const initialMethod = order.paymentMethod || order.payment_method || 'BANK_TRANSFER'
      setSelectedMethod(initialMethod as any)

      const res = await paymentService.createPaymentIntent({
        orderId: order._id,
        paymentMethod: initialMethod
      })
      setPaymentIntentData(res)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi khởi tạo cổng thanh toán.')
      setPaymentModalOrder(null)
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleChangePaymentMethod = async (method: 'COD' | 'BANK_TRANSFER' | 'MOMO' | 'VNPAY' | 'credit_card') => {
    if (!paymentModalOrder) return
    try {
      setSelectedMethod(method)
      setIsProcessingPayment(true)
      const res = await paymentService.retryPayment({
        orderId: paymentModalOrder._id,
        newPaymentMethod: method
      })
      setPaymentIntentData(res)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi đổi phương thức thanh toán.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleVerifyPayment = async () => {
    if (!paymentIntentData?.transactionCode) return
    try {
      setIsProcessingPayment(true)
      setErrorMsg(null)
      const res = await paymentService.verifyPayment({
        transactionCode: paymentIntentData.transactionCode,
        simulateSuccess: true
      })
      setSuccessMsg(res.message || 'Thanh toán thành công!')
      setPaymentModalOrder(null)
      if (onRefreshOrders) onRefreshOrders()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Xác thực thanh toán thất bại.')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 border-emerald-500/20">
            <CheckCircle size={12} weight="bold" /> Đã giao thành công
          </span>
        )
      case 'shipping':
        return (
          <span className="px-2.5 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 text-blue-500 bg-blue-500/10 border-blue-500/20">
            <Truck size={12} weight="bold" /> Đang vận chuyển
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

  const getPaymentBadge = (paymentStatus: string, paymentMethod: string) => {
    const isPaid = paymentStatus?.toLowerCase() === 'paid'
    const isFailed = paymentStatus?.toLowerCase() === 'failed'

    if (isPaid) {
      return (
        <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
          ✓ Đã thanh toán
        </span>
      )
    }
    if (isFailed) {
      return (
        <span className="text-[9px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded">
          ✗ Thanh toán thất bại
        </span>
      )
    }
    if (paymentMethod?.toUpperCase() === 'COD') {
      return (
        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded">
          Thanh toán khi nhận hàng
        </span>
      )
    }
    return (
      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
        ⏳ Chờ thanh toán
      </span>
    )
  }

  return (
    <motion.div
      key="orders-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 pl-1 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Receipt size={16} className="text-[#ff4655]" />
            LỊCH SỬ ĐƠN HÀNG CHIẾN ĐẤU ({userOrders.length})
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Theo dõi hành trình đơn hàng, lịch sử giá và thanh toán bảo mật</p>
        </div>
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

      {/* E1: Bộ lọc theo trạng thái đơn hàng */}
      {userOrders.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const count = f.key === 'all'
              ? userOrders.length
              : userOrders.filter((o) => (o.orderStatus || o.order_status || 'pending') === f.key).length
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                  statusFilter === f.key
                    ? 'bg-[#ff4655] text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {f.label} ({count})
              </button>
            )
          })}
        </div>
      )}

      <div className="space-y-4">
        {userOrders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <Receipt size={40} className="mx-auto text-zinc-400 mb-2 opacity-50" />
            <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">// BẠN CHƯA CÓ ĐƠN HÀNG NÀO</div>
            <p className="text-[10px] text-zinc-400 mt-1">Các thiết bị công nghệ bạn đặt mua sẽ hiển thị chi tiết tại đây</p>
          </div>
        ) : (
          userOrders
            .filter((ord) => statusFilter === 'all' || (ord.orderStatus || ord.order_status || 'pending') === statusFilter)
            .map((ord) => {
            const status = ord.orderStatus || ord.order_status || 'pending'
            const paymentStatus = ord.paymentStatus || ord.payment_status || 'pending'
            const paymentMethod = ord.paymentMethod || ord.payment_method || 'COD'
            const isPending = status === 'pending'
            const isCancelled = status === 'cancelled'
            const isPaid = paymentStatus.toLowerCase() === 'paid'
            const shippingMethod = ord.shippingMethod || ord.shipping_method || 'ghn'
            const shippingMethodName = ord.shippingMethodName || ord.shipping_method_name || (
              shippingMethod === 'express' ? 'GEARTECH SuperShip (Nội thành)' :
              shippingMethod === 'fast' ? 'Giao hàng hỏa tốc 24H' :
              'GHN Express'
            )

            const displayItems = (ord.detailedItems && ord.detailedItems.length > 0)
              ? ord.detailedItems
              : (ord.items || [])
            const finalAmount = ord.finalAmount ?? ord.final_amount ?? ord.totalAmount ?? ord.total_amount ?? 0
            const shopName = ord.shop_id?.shopName || ord.shopId?.shopName || 'GEARTECH Official'

            return (
              <div key={ord._id} className="p-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-lg space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-zinc-455 uppercase">// ĐƠN HÀNG</span>
                      <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded">
                        {shopName}
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black text-zinc-900 dark:text-white tracking-wider mt-0.5">
                      #{String(ord._id).slice(-8).toUpperCase()}
                    </h4>
                    <span className="text-[9px] text-zinc-400 font-mono">
                      {ord.created_at ? new Date(ord.created_at).toLocaleString('vi-VN') : 'Mới đặt'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Badge phương thức giao hàng */}
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border ${
                      shippingMethod === 'express'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                        : shippingMethod === 'fast'
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/30'
                        : 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                    }`}>
                      <Truck size={11} weight="bold" /> {shippingMethodName}
                    </span>

                    {getStatusBadge(status)}
                    {getPaymentBadge(paymentStatus, paymentMethod)}
                    
                    {(ord.trackingCode || ord.tracking_code) && (
                      <button
                        onClick={() => handleOpenTrackingModal(ord)}
                        className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border border-blue-500/30 text-[9px] font-mono font-bold flex items-center gap-1 transition-colors"
                      >
                        <Truck size={11} /> {ord.carrier || 'GHN'}: {ord.trackingCode || ord.tracking_code}
                      </button>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleCancelOrder(ord._id)}
                        disabled={cancellingId === ord._id}
                        className="px-2.5 py-1 text-[9px] font-bold text-red-500 hover:bg-red-500/10 border border-red-500/30 rounded transition-colors disabled:opacity-50"
                      >
                        {cancellingId === ord._id ? 'Đang hủy...' : 'Hủy đơn'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="space-y-3">
                  {displayItems.map((item: any, idx: number) => {
                    const itemName = item.product_name || item.title || item.product_id?.title || 'Sản phẩm'
                    const itemSku = item.sku || item.product_id?.sku || ''
                    const itemPrice = item.unitPrice ?? item.unit_price ?? item.price ?? 0
                    const itemQty = item.quantity ?? item.qty ?? 1
                    const itemImg = item.product_id?.imageUrl || (item.product_id?.images && item.product_id?.images[0])

                    return (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden flex items-center justify-center text-xl shrink-0">
                          {itemImg ? (
                            <img src={itemImg} alt={itemName} className="w-full h-full object-cover" />
                          ) : (
                            '📦'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate tracking-wide">
                            {itemName}
                          </h5>
                          <div className="flex items-center gap-2 text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">
                            {itemSku && <span className="font-mono text-zinc-400">SKU: {itemSku}</span>}
                            <span>Số lượng: {itemQty}</span>
                            <span>•</span>
                            <span className="text-[#ff4655] font-bold">{formatPrice(Number(itemPrice))}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                            {formatPrice(Number(itemPrice) * Number(itemQty))}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Thông tin giao nhận và thanh toán */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5 text-zinc-500">
                    <MapPin size={13} className="text-[#ff4655] shrink-0" />
                    <span className="truncate max-w-xs">{ord.shipping_address || ord.shippingAddress?.detailAddress || 'Địa chỉ nhận hàng'}</span>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    {!isPaid && !isCancelled && (
                      <button
                        onClick={() => handleOpenPaymentModal(ord)}
                        className="px-3 py-1 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-bold rounded text-[10px] flex items-center gap-1 shadow-sm transition-all"
                      >
                        <CreditCard size={13} /> {paymentMethod === 'COD' ? 'Đổi PTTT' : 'Thanh toán ngay'}
                      </button>
                    )}
                    <span className="text-[9px] font-mono text-zinc-455 uppercase">
                      PTTT: {paymentMethod}
                    </span>
                    <div className="text-right">
                      <span className="text-[8px] font-mono text-zinc-455 block">TỔNG THANH TOÁN:</span>
                      <span className="text-sm font-black text-[#ff4655] text-glow block">
                        {formatPrice(Number(finalAmount))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal Thanh toán trực tuyến / Thử lại thanh toán */}
      <AnimatePresence>
        {paymentModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                  <CreditCard size={18} className="text-[#ff4655]" />
                  CỔNG THANH TOÁN GEARTECH
                </h4>
                <button
                  onClick={() => setPaymentModalOrder(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-950/60 rounded border border-zinc-200 dark:border-zinc-800 text-xs flex justify-between items-center">
                <span className="text-zinc-500 font-medium">Số tiền thanh toán:</span>
                <span className="text-base font-black text-[#ff4655]">
                  {formatPrice(Number(paymentModalOrder.finalAmount || paymentModalOrder.totalAmount || 0))}
                </span>
              </div>

              {/* Lựa chọn phương thức */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Chọn phương thức thanh toán:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => handleChangePaymentMethod('BANK_TRANSFER')}
                    className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'BANK_TRANSFER'
                        ? 'border-[#ff4655] bg-[#ff4655]/10 text-[#ff4655]'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Bank size={15} /> VietQR
                  </button>
                  <button
                    onClick={() => handleChangePaymentMethod('MOMO')}
                    className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'MOMO'
                        ? 'border-[#d82d8b] bg-[#d82d8b]/10 text-[#d82d8b]'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <DeviceMobile size={15} /> Ví MoMo
                  </button>
                  <button
                    onClick={() => handleChangePaymentMethod('VNPAY')}
                    className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'VNPAY'
                        ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <CreditCard size={15} /> VNPAY
                  </button>
                  <button
                    onClick={() => handleChangePaymentMethod('COD')}
                    className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      selectedMethod === 'COD'
                        ? 'border-[#ff4655] bg-[#ff4655]/10 text-[#ff4655]'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <CurrencyCircleDollar size={15} /> Tiền mặt COD
                  </button>
                </div>
              </div>

              {/* VNPAY Display */}
              {selectedMethod === 'VNPAY' && (
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/50 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">V</span>
                    Cổng thanh toán quốc gia VNPAY
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Hỗ trợ quét mã VNPAY-QR, thẻ ATM nội địa 40+ ngân hàng, Visa, Mastercard, JCB
                  </p>
                  {paymentIntentData?.instruction?.checkoutUrl && (
                    <a
                      href={paymentIntentData.instruction.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      Mở cổng thanh toán VNPAY Gateway ➔
                    </a>
                  )}
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300">
                    Số tiền: <strong className="text-blue-600 dark:text-blue-400 font-bold text-sm">{formatPrice(paymentModalOrder.finalAmount || paymentModalOrder.totalAmount)}</strong>
                  </div>
                </div>
              )}

              {/* MoMo QR Display */}
              {selectedMethod === 'MOMO' && (
                <div className="p-4 bg-pink-50/50 dark:bg-pink-950/20 rounded-xl border border-pink-200 dark:border-pink-900/50 text-center space-y-3">
                  <div className="flex items-center justify-center gap-2 text-xs font-black text-[#d82d8b] uppercase tracking-wider">
                    <span className="w-5 h-5 rounded-full bg-[#d82d8b] text-white flex items-center justify-center text-[10px] font-bold">M</span>
                    Thanh toán qua Ví điện tử MoMo
                  </div>
                  <div className="inline-block p-2.5 bg-white rounded-xl border border-pink-200 shadow-md">
                    <img
                      src={`https://api.vietqr.io/image/970422-0938793972-compact2.png?amount=${paymentModalOrder.finalAmount || paymentModalOrder.totalAmount}&addInfo=GT%20${String(paymentModalOrder._id).slice(-8).toUpperCase()}&accountName=MOMO%20GEARTECH`}
                      alt="MoMo Payment QR"
                      className="w-48 h-48 mx-auto object-contain rounded-lg"
                    />
                  </div>
                  <div className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1">
                    <div>Người nhận: <strong>GEARTECH VIETNAM (MoMo)</strong></div>
                    <div>Số tiền: <strong className="text-[#d82d8b] font-bold text-sm">{formatPrice(paymentModalOrder.finalAmount || paymentModalOrder.totalAmount)}</strong></div>
                    <div>Nội dung: <strong className="text-[#d82d8b] font-mono bg-pink-100 dark:bg-pink-900/40 px-2 py-0.5 rounded">GT {String(paymentModalOrder._id).slice(-8).toUpperCase()}</strong></div>
                  </div>
                </div>
              )}

              {/* VietQR Display */}
              {selectedMethod === 'BANK_TRANSFER' && (
                <div className="p-4 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Quét mã VietQR tự động khớp giao dịch
                  </div>
                  <div className="inline-block p-2 bg-white rounded-lg border border-zinc-200 shadow-inner">
                    <img
                      src={`https://api.vietqr.io/image/970422-999988889999-compact2.png?amount=${paymentModalOrder.finalAmount || paymentModalOrder.totalAmount}&addInfo=GT%20${String(paymentModalOrder._id).slice(-8).toUpperCase()}&accountName=GEARTECH`}
                      alt="VietQR Payment"
                      className="w-48 h-48 mx-auto object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-zinc-600 dark:text-zinc-300 space-y-0.5">
                    <div>Ngân hàng: <strong>MB Bank (Quân Đội)</strong></div>
                    <div>STK: <strong>999988889999</strong></div>
                    <div>Nội dung CK: <strong className="text-[#ff4655]">GT {String(paymentModalOrder._id).slice(-8).toUpperCase()}</strong></div>
                  </div>
                </div>
              )}

              {/* Xác nhận kết quả */}
              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setPaymentModalOrder(null)}
                  className="flex-1 py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold text-xs"
                >
                  Đóng
                </button>
                <button
                  onClick={handleVerifyPayment}
                  disabled={isProcessingPayment}
                  className={`flex-1 py-2.5 px-3 rounded-lg disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5 ${
                    selectedMethod === 'MOMO' ? 'bg-[#d82d8b] hover:bg-[#b02270]' : 'bg-[#ff4655] hover:bg-[#e03d4b]'
                  }`}
                >
                  {isProcessingPayment ? (
                    <ArrowClockwise size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} weight="bold" />
                  )}
                  {selectedMethod === 'COD' 
                    ? 'Xác nhận chọn COD' 
                    : selectedMethod === 'MOMO' 
                      ? 'Xác nhận đã thanh toán MoMo' 
                      : selectedMethod === 'VNPAY'
                        ? 'Xác nhận đã thanh toán VNPAY'
                        : 'Tôi đã chuyển khoản'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Theo dõi hành trình GHN */}
      <AnimatePresence>
        {trackingModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Truck size={20} className="text-[#ff4655]" />
                  <div>
                    <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                      HÀNH TRÌNH VẬN ĐƠN GHN
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      Mã vận đơn: #{trackingData?.trackingCode || trackingModalOrder.trackingCode || trackingModalOrder.tracking_code || '—'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackingModalOrder(null)}
                  className="text-zinc-400 hover:text-white p-1 rounded"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto space-y-3 text-xs">
                {isLoadingTracking ? (
                  <div className="py-10 text-center text-zinc-400">
                    <div className="inline-block animate-spin text-xl mb-2">⏳</div>
                    <div>Đang cập nhật hành trình từ GHN...</div>
                  </div>
                ) : trackingData?.hasShipment ? (
                  <>
                    <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase text-blue-500">Đơn vị giao hàng:</span>
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                          {trackingData.carrier || 'GHN Express'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-500">Trạng thái:</span>
                        <span className="font-bold text-zinc-900 dark:text-white">
                          {trackingData.shippingStatus || 'Đang giao'}
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

                    <div className="space-y-3 pt-2">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                        Các mốc thời gian giao hàng
                      </span>
                      <div className="space-y-3 border-l-2 border-zinc-200 dark:border-zinc-800 ml-2 pl-4">
                        {(trackingData.timeline || []).map((tl, idx) => (
                          <div key={idx} className="relative">
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
                    Chưa có thông tin vận đơn chi tiết từ nhà xe.
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="w-full py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition-colors"
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
