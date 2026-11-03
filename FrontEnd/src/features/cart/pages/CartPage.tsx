import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash,
  ArrowLeft,
  ShieldCheck,
  Truck,
  CheckCircle
} from '@phosphor-icons/react'
import { useCartStore } from '../../../store/cartStore'
import { voucherService, type VoucherItem } from '../../../services/voucherService'
import { productService, type ProductItem } from '../../../services/productService'
import { cartService } from '../../../services/cartService'
import { formatPrice } from '../../../utils/format'
import { CartEmptyState } from '../components/CartEmptyState'
import { CartItemRow } from '../components/CartItemRow'
import { CartCouponBox, type AppliedCoupon } from '../components/CartCouponBox'
import { CartOrderSummary } from '../components/CartOrderSummary'
import { CartSuggestions } from '../components/CartSuggestions'

export default function CartPage() {
  const navigate = useNavigate()
  
  const {
    items: cart,
    syncWithBackend,
    updateQuantity,
    toggleSelect,
    toggleSelectAll,
    removeItem,
    removeSelected: removeSelectedItems,
    addItem: handleAddSuggestion
  } = useCartStore()

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validating, setValidating] = useState<boolean>(false)

  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([])
  const [suggestions, setSuggestions] = useState<ProductItem[]>([])

  useEffect(() => {
    syncWithBackend()

    voucherService.getVouchers()
      .then(data => {
        if (Array.isArray(data)) setAvailableVouchers(data)
      })
      .catch(err => console.error('Lỗi tải vouchers:', err))

    productService.getProducts({ limit: 4, sortBy: 'popular' })
      .then(res => {
        if (res && Array.isArray(res.products)) setSuggestions(res.products)
      })
      .catch(err => console.error('Lỗi tải sản phẩm gợi ý:', err))
  }, [syncWithBackend])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const isAllSelected = cart.length > 0 && cart.every((item) => item.selected)
  const selectedItems = cart.filter((item) => item.selected)
  const selectedCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const handleApplyCoupon = async (codeToApply?: string) => {
    setCouponError('')
    const clean = (codeToApply || couponCode).trim().toUpperCase()
    if (!clean) return

    try {
      setValidating(true)
      const res = await voucherService.validateVoucher(clean, subtotal, selectedItems)
      setAppliedCoupon({
        code: res.code,
        discount: res.discountValue,
        desc: res.description
      })
      setCouponCode('')
      localStorage.setItem('geartech_applied_voucher', res.code)
      showToast(`Áp dụng mã ${res.code} thành công: -${formatPrice(res.discountValue)}`)
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.message || 'Mã khuyến mãi không hợp lệ hoặc chưa đủ điều kiện.'
      setCouponError(errMsg)
    } finally {
      setValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    localStorage.removeItem('geartech_applied_voucher')
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0
  const estimatedShipping = selectedItems.length > 0 ? (subtotal >= 2000000 ? 0 : 30000) : 0
  const finalTotal = Math.max(0, subtotal + estimatedShipping - discountAmount)

  const handleProceedToCheckout = async () => {
    setValidationError(null)
    const token = localStorage.getItem('token')
    if (token) {
      setValidating(true)
      try {
        const valRes = await cartService.validateCart()
        if (!valRes.isValid) {
          const issueMsg = valRes.issues.map(i => i.error).join(' | ')
          setValidationError(issueMsg || 'Có sản phẩm trong giỏ hàng không đủ tồn kho hoặc đã hết hàng.')
          await syncWithBackend()
          return
        }
      } catch (err: any) {
        setValidationError(err.response?.data?.error || 'Lỗi kiểm tra tính hợp lệ của giỏ hàng trước khi đặt hàng.')
        return
      } finally {
        setValidating(false)
      }
    }

    if (appliedCoupon) {
      localStorage.setItem('geartech_applied_voucher', appliedCoupon.code)
    } else {
      localStorage.removeItem('geartech_applied_voucher')
    }
    navigate('/checkout')
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 py-8 lg:py-12 transition-colors duration-200">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-zinc-900 text-white border border-zinc-700 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold"
          >
            <CheckCircle size={18} weight="fill" className="text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 mb-6">
          <Link to="/" className="hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-[#ff4655] font-semibold">Giỏ hàng ({cart.length})</span>
        </div>

        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 border-b border-zinc-200 dark:border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#ff4655] text-xs font-black uppercase tracking-widest mb-1">
              <ShoppingCart size={16} weight="bold" />
              <span>Hệ thống đơn hàng GEARTECH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
              GIỎ HÀNG CỦA BẠN
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-500" weight="bold" />
              Chính hãng 100%
            </span>
            <span className="flex items-center gap-1.5">
              <Truck size={16} className="text-indigo-500" weight="bold" />
              Giao nhanh toàn quốc
            </span>
          </div>
        </div>

        {/* Khi giỏ hàng trống */}
        {cart.length === 0 ? (
          <CartEmptyState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cột trái (8 cols): Danh sách sản phẩm trong giỏ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {/* Header Chọn tất cả */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={() => toggleSelectAll()}
                    className="w-4 h-4 accent-[#ff4655] rounded cursor-pointer"
                  />
                  <span>Chọn tất cả ({cart.length} sản phẩm)</span>
                </label>

                {cart.some((i) => i.selected) && (
                  <button
                    onClick={removeSelectedItems}
                    className="flex items-center gap-1.5 text-zinc-400 hover:text-[#ff4655] transition-colors cursor-pointer"
                  >
                    <Trash size={14} />
                    <span>Xóa các mục đã chọn</span>
                  </button>
                )}
              </div>

              {/* Danh sách items */}
              <div className="space-y-3">
                <AnimatePresence>
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onToggleSelect={toggleSelect}
                      onUpdateQuantity={updateQuantity}
                      onRemoveItem={(id, title) => {
                        removeItem(id)
                        showToast(`Đã xóa "${title.slice(0, 20)}..." khỏi giỏ hàng`)
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Tiếp tục mua sắm link */}
              <div className="pt-2">
                <Link
                  to="/ProductPage"
                  className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} weight="bold" /> Tiếp tục chọn thêm linh kiện khác
                </Link>
              </div>
            </div>

            {/* Cột phải (4 cols): Voucher & Tóm tắt đơn hàng (Sticky) */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-4">
                <CartCouponBox
                  couponCode={couponCode}
                  appliedCoupon={appliedCoupon}
                  couponError={couponError}
                  availableVouchers={availableVouchers}
                  onCouponCodeChange={setCouponCode}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={handleRemoveCoupon}
                />

                <CartOrderSummary
                  selectedCount={selectedCount}
                  subtotal={subtotal}
                  estimatedShipping={estimatedShipping}
                  discountAmount={discountAmount}
                  finalTotal={finalTotal}
                  appliedCoupon={appliedCoupon}
                  validationError={validationError}
                  validating={validating}
                  onProceedToCheckout={handleProceedToCheckout}
                />
              </div>
            </div>
          </div>
        )}

        {/* Sản phẩm gợi ý mua kèm từ Real Database */}
        <CartSuggestions
          suggestions={suggestions}
          onAddSuggestion={(p) => {
            handleAddSuggestion(p)
            showToast(`Đã thêm "${(p.title || p.name || '').slice(0, 20)}..." vào giỏ!`)
          }}
        />
      </div>
    </div>
  )
}
