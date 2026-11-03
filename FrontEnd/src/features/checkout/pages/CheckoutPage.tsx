import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowLeft
} from '@phosphor-icons/react'
import { useCartStore } from '../../../store/cartStore'
import { orderService } from '../../../services/orderService'
import { voucherService, type VoucherItem } from '../../../services/voucherService'
import { customerService } from '../../../services/customerService'
import { CheckoutSuccess } from '../components/CheckoutSuccess'
import { CheckoutAddressForm, type CheckoutFormData } from '../components/CheckoutAddressForm'
import { CheckoutShippingMethods, defaultShippingMethods } from '../components/CheckoutShippingMethods'
import { CheckoutPaymentMethods, defaultPaymentMethods, type CardData } from '../components/CheckoutPaymentMethods'
import { CheckoutOrderSummary, type AppliedVoucher } from '../components/CheckoutOrderSummary'

export default function CheckoutPage() {
  const { items, removeSelected } = useCartStore()
  const cartItems = items.filter((item) => item.selected)

  const [shippingMethod, setShippingMethod] = useState('ghn')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const [formData, setFormData] = useState<CheckoutFormData>({
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

  const [cardData, setCardData] = useState<CardData>({
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  })

  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([])
  const [voucherCode, setVoucherCode] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<AppliedVoucher | null>(null)
  const [voucherError, setVoucherError] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const selectedShippingItem = defaultShippingMethods.find((m) => m.id === shippingMethod) || defaultShippingMethods[0]
  const currentShipping = selectedShippingItem?.price || 0
  const discountVal = appliedVoucher ? appliedVoucher.discount : 0
  const finalTotal = Math.max(0, subtotal + currentShipping - discountVal)

  useEffect(() => {
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
            } catch {
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
        } catch {
          // ignore
        }
      }
    }

    voucherService.getVouchers()
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableVouchers(data)
          const savedCode = localStorage.getItem('geartech_applied_voucher')
          if (savedCode && subtotal > 0) {
            voucherService.validateVoucher(savedCode, subtotal, cartItems)
              .then((res) => {
                setAppliedVoucher({
                  code: res.code,
                  discount: res.discountValue,
                  desc: res.description
                })
              })
              .catch(() => {
                localStorage.removeItem('geartech_applied_voucher')
              })
          }
        }
      })
      .catch((err) => console.error('Lỗi tải voucher:', err))
  }, [subtotal, cartItems])

  const handleApplyVoucher = async (codeToApply?: string) => {
    setVoucherError('')
    const cleanCode = (codeToApply || voucherCode).trim().toUpperCase()
    if (!cleanCode) return

    try {
      const res = await voucherService.validateVoucher(cleanCode, subtotal, cartItems)
      setAppliedVoucher({
        code: res.code,
        discount: res.discountValue,
        desc: res.description
      })
      setVoucherCode('')
      localStorage.setItem('geartech_applied_voucher', res.code)
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Mã ưu đãi không hợp lệ.'
      setVoucherError(errMsg)
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
      setErrorMessage('Giỏ hàng chưa có sản phẩm nào được chọn để thanh toán.')
      return
    }

    if (!formData.fullName || !formData.phone || !formData.address) {
      setErrorMessage('Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc (*)')
      return
    }

    try {
      setIsSubmitting(true)

      const payload = {
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          title: item.title,
          quantity: item.quantity,
          price: item.price
        })),
        shippingAddress: {
          receiverName: formData.fullName,
          receiverPhone: formData.phone,
          detailAddress: formData.address,
          ward: formData.ward,
          district: formData.district,
          province: formData.province
        },
        shippingMethod: selectedShippingItem.id,
        shippingMethodName: selectedShippingItem.name,
        shippingFee: currentShipping,
        carrier: selectedShippingItem.id === 'ghn' ? 'GHN' : (selectedShippingItem.id === 'express' ? 'SuperShip' : 'Hỏa tốc'),
        paymentMethod: paymentMethod as any,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
        note: formData.note
      }

      const res = await orderService.createOrder(payload)
      const createdId = res.order?._id || res.order?.id || (res.orders && res.orders[0]?._id) || 'GT' + Date.now().toString().slice(-6)
      setOrderId(createdId)
      setIsSuccess(true)
      removeSelected()
      localStorage.removeItem('geartech_applied_voucher')
    } catch (err: any) {
      console.error('Lỗi đặt hàng:', err)
      setErrorMessage(
        err.response?.data?.error || err.message || 'Không thể tạo đơn hàng. Vui lòng thử lại sau ít phút!'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <CheckoutSuccess
        orderId={orderId}
        formData={formData}
        paymentMethod={paymentMethod}
        paymentMethods={defaultPaymentMethods}
        finalTotal={finalTotal}
      />
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
              <CheckoutAddressForm
                formData={formData}
                onChange={setFormData}
              />

              <CheckoutShippingMethods
                shippingMethod={shippingMethod}
                onSelect={setShippingMethod}
              />

              <CheckoutPaymentMethods
                paymentMethod={paymentMethod}
                cardData={cardData}
                onSelectPayment={setPaymentMethod}
                onCardDataChange={setCardData}
              />
            </div>

            {/* Cột phải: Tóm tắt đơn hàng & Tổng thanh toán (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <CheckoutOrderSummary
                cartItems={cartItems}
                subtotal={subtotal}
                currentShipping={currentShipping}
                appliedVoucher={appliedVoucher}
                finalTotal={finalTotal}
                voucherCode={voucherCode}
                voucherError={voucherError}
                availableVouchers={availableVouchers}
                errorMessage={errorMessage}
                isSubmitting={isSubmitting}
                onVoucherCodeChange={setVoucherCode}
                onApplyVoucher={handleApplyVoucher}
                onRemoveVoucher={handleRemoveVoucher}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
