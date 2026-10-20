import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  CaretDown,
  Check,
  Tag,
  ArrowLeft,
  Package,
  Lock,
  Info,
  Warning,
  CheckCircle,
  X,
  Bank,
  DeviceMobile,
  CurrencyCircleDollar,
  Receipt,
  Clock,
  Sparkle
} from '@phosphor-icons/react'
import { useCartStore } from '../../../store/cartStore'
import { orderService } from '../../../services/orderService'
import { voucherService, type VoucherItem } from '../../../services/voucherService'
import { customerService } from '../../../services/customerService'
import { formatPrice } from '../../../utils/format'

const shippingMethods = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    estimate: 'Dự kiến 3 - 5 ngày',
    price: 30000,
    icon: Truck,
    badge: 'Tiết kiệm'
  },
  {
    id: 'fast',
    name: 'Giao hàng hỏa tốc',
    estimate: 'Nhận trong 24h - 48h',
    price: 65000,
    icon: Clock,
    badge: 'Phổ biến'
  },
  {
    id: 'express',
    name: 'GEARTECH SuperShip (Nội thành)',
    estimate: 'Giao siêu tốc 2 giờ',
    price: 120000,
    icon: Sparkle,
    badge: 'VIP'
  }
]

const paymentMethods = [
  {
    id: 'cod',
    name: 'Thanh toán khi nhận hàng (COD)',
    description: 'Thanh toán tiền mặt khi đơn hàng được giao tới nơi',
    icon: CurrencyCircleDollar,
    popular: true
  },
  {
    id: 'bank_transfer',
    name: 'Chuyển khoản Ngân hàng (VietQR)',
    description: 'Quét mã QR tự động xác thực giao dịch trong 30 giây',
    icon: Bank,
    popular: true
  },
  {
    id: 'credit_card',
    name: 'Thẻ tín dụng / Ghi nợ quốc tế',
    description: 'Hỗ trợ Visa, MasterCard, JCB, American Express',
    icon: CreditCard,
    popular: false
  },
  {
    id: 'momo',
    name: 'Ví điện tử MoMo / ZaloPay',
    description: 'Liên kết ví thanh toán một chạm bảo mật cao',
    icon: DeviceMobile,
    popular: false
  }
]

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  // Lấy các sản phẩm đã được chọn trong giỏ hàng
  const cartItems = items.filter((item) => item.selected)

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  // Form Thông tin nhận hàng (tự động điền nếu đã đăng nhập)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    ward: 'Phường Dịch Vọng Hậu',
    address: '',
    note: '',
    isInvoiceNeeded: false,
    companyName: '',
    taxCode: '',
    companyAddress: ''
  })

  // Card details
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  })

  // Real Voucher state from Database
  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([])
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number; desc: string } | null>(null)
  const [voucherError, setVoucherError] = useState('')

  // Submit & success state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const currentShipping = shippingMethods.find((m) => m.id === shippingMethod)?.price || 0
  const discountVal = appliedVoucher ? appliedVoucher.discount : 0
  const finalTotal = Math.max(0, subtotal + currentShipping - discountVal)

  // Tự động tải thông tin khách hàng phục vụ đặt hàng và mã giảm giá thật
  useEffect(() => {
    // 1. Tải thông tin từ API Customer
    const token = localStorage.getItem('token')
    if (token) {
      customerService.getCheckoutInfo()
        .then((info) => {
          if (info) {
            setFormData((prev) => ({
              ...prev,
              fullName: info.name || prev.fullName,
              phone: info.phone || prev.phone,
              email: info.email || prev.email,
              address: info.shippingAddress?.detailAddress || prev.address,
              province: info.shippingAddress?.province || prev.province,
              district: info.shippingAddress?.district || prev.district,
              ward: info.shippingAddress?.ward || prev.ward
            }))
          }
        })
        .catch(() => {
          // Fallback sang localStorage nếu API có sự cố
          const userStr = localStorage.getItem('user')
          if (userStr) {
            try {
              const u = JSON.parse(userStr)
              setFormData((prev) => ({
                ...prev,
                fullName: u.name || prev.fullName,
                phone: u.phone || prev.phone,
                email: u.email || prev.email,
                address: u.addresses?.[0]?.detailAddress || prev.address
              }))
            } catch (e) {
              // ignore
            }
          }
        })
    } else {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const u = JSON.parse(userStr)
          setFormData((prev) => ({
            ...prev,
            fullName: u.name || prev.fullName,
            phone: u.phone || prev.phone,
            email: u.email || prev.email,
            address: u.addresses?.[0]?.detailAddress || prev.address
          }))
        } catch (e) {
          // ignore
        }
      }
    }

    // Tải voucher từ backend API
    voucherService.getVouchers()
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableVouchers(data)
          const savedCode = localStorage.getItem('geartech_applied_voucher')
          if (savedCode) {
            const found = data.find((v) => v.code.toUpperCase() === savedCode.toUpperCase())
            if (found && subtotal >= found.minOrderValue) {
              setAppliedVoucher({
                code: found.code,
                discount: found.discountValue,
                desc: found.description
              })
            }
          }
        }
      })
      .catch((err) => console.error('Lỗi tải voucher:', err))
  }, [subtotal])

  const handleApplyVoucher = (codeToApply?: string) => {
    setVoucherError('')
    const cleanCode = (codeToApply || voucherCode).trim().toUpperCase()
    if (!cleanCode) return

    const matched = availableVouchers.find((v) => v.code.toUpperCase() === cleanCode)
    if (matched) {
      const today = new Date()
      if (new Date(matched.expiryDate) < today) {
        setVoucherError('Mã voucher này đã hết hạn sử dụng!')
        return
      }
      if (matched.usesCount >= matched.maxUses) {
        setVoucherError('Mã voucher này đã hết lượt sử dụng!')
        return
      }
      if (subtotal < matched.minOrderValue) {
        setVoucherError(`Đơn hàng cần tối thiểu ${formatPrice(matched.minOrderValue)} để dùng mã này.`)
        return
      }

      setAppliedVoucher({
        code: matched.code,
        discount: matched.discountValue,
        desc: matched.description
      })
      setVoucherCode('')
    } else {
      setVoucherError('Mã ưu đãi không tồn tại hoặc đã hết hạn!')
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    localStorage.removeItem('geartech_applied_voucher')
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (cartItems.length === 0) {
      alert('Giỏ hàng chưa có sản phẩm nào được chọn để thanh toán!')
      return
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng!')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      alert('Vui lòng đăng nhập tài khoản trước khi thực hiện đặt hàng!')
      window.location.href = '/login'
      return
    }

    setIsSubmitting(true)
    try {
      const mappedPayment: 'COD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' = 
        paymentMethod === 'cod' ? 'COD' :
        paymentMethod === 'bank_transfer' ? 'BANK_TRANSFER' :
        paymentMethod === 'momo' ? 'MOMO' : 'VNPAY'

      const fullDetailAddress = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          title: item.title,
          qty: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          receiverName: formData.fullName,
          receiverPhone: formData.phone,
          detailAddress: fullDetailAddress
        },
        paymentMethod: mappedPayment,
        voucherCode: appliedVoucher?.code
      }

      const res = await orderService.createOrder(payload)

      setOrderId(res.order?._id || res.order?.id || 'GT-' + Math.floor(100000 + Math.random() * 900000))
      clearCart()
      localStorage.removeItem('geartech_applied_voucher')
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Lỗi khi đặt hàng:', err)
      const errorMsg = err.response?.data?.error || err.message || 'Lỗi xử lý đơn hàng.'
      setErrorMessage(errorMsg)
      alert(`Đặt hàng không thành công: ${errorMsg}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle size={48} weight="fill" />
          </div>

          <div>
            <span className="text-xs font-black uppercase tracking-widest text-[#ff4655]">Xác nhận hoàn tất</span>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white mt-1">
              ĐẶT HÀNG THÀNH CÔNG!
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
              Cảm ơn bạn đã lựa chọn GEARTECH. Đơn hàng của bạn đã được tiếp nhận và nhân viên chăm sóc khách hàng sẽ liên hệ xác nhận trong ít phút.
            </p>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-[#ff4655]">{orderId}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Người nhận:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formData.fullName} ({formData.phone})</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Địa chỉ giao:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[260px]">
                {formData.address}, {formData.ward}, {formData.district}, {formData.province}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Phương thức thanh toán:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {paymentMethods.find((p) => p.id === paymentMethod)?.name}
              </span>
            </div>
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-center">
              <span className="font-bold text-zinc-700 dark:text-zinc-300">Tổng thanh toán:</span>
              <span className="font-black text-lg text-[#ff4655]">{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/orders"
              className="flex-1 py-3.5 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-sm tracking-wide transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <Receipt size={18} />
              Theo dõi đơn hàng
            </Link>
            <Link
              to="/ProductPage"
              className="flex-1 py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-[#ff4655]/25 flex items-center justify-center gap-2"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 py-8 lg:py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-6">
          <Link to="/" className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link to="/ProductPage" className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Sản phẩm</Link>
          <span>/</span>
          <span className="text-[#ff4655] font-semibold">Thanh toán</span>
        </div>

        {/* Page Heading */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#ff4655] text-xs font-black uppercase tracking-widest mb-1">
              <ShieldCheck size={16} weight="bold" />
              <span>Bảo mật chuẩn quốc tế SSL 256-Bit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              TIẾN HÀNH THANH TOÁN
            </h1>
          </div>
          <Link
            to="/ProductPage"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={14} weight="bold" /> Quay lại chọn thêm linh kiện
          </Link>
        </div>

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cột trái: Thông tin giao hàng & Phương thức */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Card 1: Thông tin người nhận */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center font-bold">
                    <MapPin size={22} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      1. Thông tin giao hàng
                    </h2>
                    <p className="text-xs text-zinc-400">Vui lòng nhập địa chỉ nhận hàng chính xác</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Họ và tên người nhận <span className="text-[#ff4655]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Số điện thoại <span className="text-[#ff4655]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Địa chỉ Email (Nhận hóa đơn điện tử)
                    </label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Tỉnh / Thành phố
                    </label>
                    <div className="relative">
                      <select
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="w-full appearance-none px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors pr-10"
                      >
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Hải Phòng">Hải Phòng</option>
                        <option value="Cần Thơ">Cần Thơ</option>
                        <option value="Bình Dương">Bình Dương</option>
                      </select>
                      <CaretDown size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Quận / Huyện
                    </label>
                    <input
                      type="text"
                      placeholder="Quận / Huyện"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà) <span className="text-[#ff4655]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Tòa nhà FPT, Phố Duy Tân"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider mb-2">
                      Ghi chú đơn hàng (Tùy chọn)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655] transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Yêu cầu xuất hóa đơn đỏ VAT */}
                <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800/80">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isInvoiceNeeded}
                      onChange={(e) => setFormData({ ...formData, isInvoiceNeeded: e.target.checked })}
                      className="w-4 h-4 accent-[#ff4655] rounded"
                    />
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Yêu cầu xuất hóa đơn điện tử GTGT (VAT) cho doanh nghiệp
                    </span>
                  </label>

                  <AnimatePresence>
                    {formData.isInvoiceNeeded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-2 overflow-hidden"
                      >
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Tên công ty</label>
                          <input
                            type="text"
                            placeholder="Công ty Cổ phần Công nghệ..."
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Mã số thuế</label>
                          <input
                            type="text"
                            placeholder="010xxxxxxx"
                            value={formData.taxCode}
                            onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Địa chỉ doanh nghiệp</label>
                          <input
                            type="text"
                            placeholder="Địa chỉ đăng ký kinh doanh..."
                            value={formData.companyAddress}
                            onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                            className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Card 2: Phương thức vận chuyển */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                    <Truck size={22} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      2. Đơn vị vận chuyển
                    </h2>
                    <p className="text-xs text-zinc-400">Chọn gói giao hàng thích hợp với nhu cầu của bạn</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {shippingMethods.map((method) => {
                    const isSelected = shippingMethod === method.id
                    const Icon = method.icon
                    return (
                      <div
                        key={method.id}
                        onClick={() => setShippingMethod(method.id)}
                        className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#ff4655] bg-[#ff4655]/5 dark:bg-[#ff4655]/10 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                              isSelected ? 'border-[#ff4655] bg-[#ff4655]' : 'border-zinc-400 dark:border-zinc-600'
                            }`}
                          >
                            {isSelected && <Check size={12} weight="bold" className="text-white" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-zinc-900 dark:text-white">{method.name}</span>
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                {method.badge}
                              </span>
                            </div>
                            <span className="text-xs text-zinc-400 flex items-center gap-1.5 mt-0.5">
                              <Icon size={14} />
                              {method.estimate}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-sm font-black text-zinc-900 dark:text-white">
                            {formatPrice(method.price)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Card 3: Phương thức thanh toán */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                    <CreditCard size={22} weight="fill" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                      3. Hình thức thanh toán
                    </h2>
                    <p className="text-xs text-zinc-400">Chọn giải pháp thanh toán linh hoạt và an toàn</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {paymentMethods.map((pm) => {
                    const isSelected = paymentMethod === pm.id
                    const Icon = pm.icon
                    return (
                      <div
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#ff4655] bg-[#ff4655]/5 dark:bg-[#ff4655]/10 shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-850/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected ? 'border-[#ff4655] bg-[#ff4655]' : 'border-zinc-400 dark:border-zinc-600'
                              }`}
                            >
                              {isSelected && <Check size={12} weight="bold" className="text-white" />}
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                                <Icon size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-zinc-900 dark:text-white">{pm.name}</span>
                                  {pm.popular && (
                                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                      Khuyên dùng
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-zinc-400 mt-0.5">{pm.description}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Thẻ tín dụng input view */}
                        {isSelected && pm.id === 'credit_card' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3"
                          >
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                                Số thẻ quốc tế
                              </label>
                              <input
                                type="text"
                                placeholder="4111 2222 3333 4444"
                                value={cardData.cardNumber}
                                onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                                Tên in trên thẻ
                              </label>
                              <input
                                type="text"
                                placeholder="NGUYEN VAN A"
                                value={cardData.cardHolder}
                                onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs uppercase"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                                  Hạn (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  placeholder="12/28"
                                  value={cardData.expiryDate}
                                  onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-center"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-zinc-500 mb-1">
                                  CVV / CVC
                                </label>
                                <input
                                  type="password"
                                  maxLength={4}
                                  placeholder="•••"
                                  value={cardData.cvv}
                                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                                  className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl text-xs text-center font-mono"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}

                        {/* VietQR View */}
                        {isSelected && pm.id === 'bank_transfer' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-xl"
                          >
                            <div className="w-24 h-24 bg-white p-2 rounded-xl border border-zinc-200 flex items-center justify-center shadow-sm">
                              <span className="text-4xl">📱</span>
                            </div>
                            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300 text-center sm:text-left">
                              <div className="font-bold text-zinc-900 dark:text-white">Ngân hàng TMCP Quân Đội (MB Bank)</div>
                              <div>Số tài khoản: <strong className="font-mono text-[#ff4655]">88889999GEAR</strong></div>
                              <div>Chủ tài khoản: <strong>CONG TY CO PHAN GEARTECH VIET NAM</strong></div>
                              <div className="text-[11px] text-zinc-400">Nội dung: Họ tên + SĐT đặt hàng</div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Cột phải: Tóm tắt đơn hàng & Tổng thanh toán (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-6">
                
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <div className="flex items-center gap-2">
                    <Package size={20} className="text-[#ff4655]" weight="bold" />
                    <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white">
                      Giỏ hàng của bạn
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {cartItems.reduce((acc, i) => acc + i.quantity, 0)} món
                  </span>
                </div>

                {/* Danh sách mặt hàng */}
                <div className="max-h-72 overflow-y-auto space-y-3.5 pr-1 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {cartItems.map((item) => (
                    <div key={item.id} className="pt-3.5 first:pt-0 flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-2xl flex-shrink-0">
                        {item.imageEmoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-zinc-400">SL: x{item.quantity}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-medium truncate">
                            {item.variant || 'Mặc định'}
                          </span>
                        </div>
                        <div className="text-xs font-black text-[#ff4655] mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mã ưu đãi voucher */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                    <Tag size={14} className="text-[#ff4655]" />
                    Mã giảm giá / Voucher
                  </label>

                  {appliedVoucher ? (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <CheckCircle size={14} weight="fill" />
                          <span>{appliedVoucher.code}</span>
                        </div>
                        <p className="text-[11px] text-emerald-500/90 mt-0.5">{appliedVoucher.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-600"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nhập mã (VD: GEARTECH50)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:border-[#ff4655]"
                      />
                      <button
                        type="button"
                        onClick={() => handleApplyVoucher()}
                        className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <p className="text-[11px] text-[#ff4655] font-semibold mt-1.5 flex items-center gap-1">
                      <Warning size={12} weight="bold" /> {voucherError}
                    </p>
                  )}

                  {/* Suggestion hints */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {['GEARTECH50', 'SUPERTECH', 'FREESHIP'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setVoucherCode(code)
                        }}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-[#ff4655] hover:bg-[#ff4655]/10 transition-colors font-mono font-bold"
                      >
                        +{code}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bảng tính tổng tiền */}
                <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 space-y-2.5 text-xs">
                  <div className="flex justify-between text-zinc-500">
                    <span>Tổng tiền hàng:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-zinc-500">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(currentShipping)}</span>
                  </div>
                  {appliedVoucher && (
                    <div className="flex justify-between text-emerald-500 font-medium">
                      <span>Khuyến mãi voucher:</span>
                      <span>-{formatPrice(appliedVoucher.discount)}</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-baseline">
                    <div>
                      <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
                        Tổng thanh toán
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">Đã bao gồm thuế GTGT</span>
                    </div>
                    <span className="text-xl font-black text-[#ff4655]">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[#ff4655] text-xs font-semibold flex items-center gap-2">
                    <Warning size={16} weight="bold" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Nút đặt hàng */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-2xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-70 text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 flex items-center justify-center gap-2 group active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock size={16} weight="bold" />
                      <span>XÁC NHẬN ĐẶT HÀNG</span>
                    </>
                  )}
                </button>

                {/* Cam kết của GEARTECH */}
                <div className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 space-y-2 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-2 font-bold text-zinc-700 dark:text-zinc-300">
                    <Info size={14} className="text-[#ff4655]" />
                    <span>Cam kết chất lượng GEARTECH</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
                    <li>100% Sản phẩm chính hãng, đầy đủ CO/CQ</li>
                    <li>Đổi mới trong 30 ngày nếu có lỗi phần cứng</li>
                    <li>Bảo hành tận nơi cho PC & Workstation</li>
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
