import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Trash,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  Truck,
  CheckCircle,
  Warning,
  X,
  Storefront,
  Sparkle
} from '@phosphor-icons/react'
import { useCartStore } from '../../../store/cartStore'
import { voucherService, type VoucherItem } from '../../../services/voucherService'
import { productService, type ProductItem } from '../../../services/productService'
import { cartService } from '../../../services/cartService'
import { SafeProductImage } from '../../../components/common/ProductImage'
import { formatPrice } from '../../../utils/format'

function formatRemainingTime(ms?: number) {
  if (!ms || ms <= 0) return 'sắp hết hạn'
  const totalMinutes = Math.floor(ms / (1000 * 60))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút`
  }
  return `${minutes} phút`
}

export default function CartPage() {
  const navigate = useNavigate()
  
  // Real persistent cart store
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
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; desc: string } | null>(null)
  const [couponError, setCouponError] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validating, setValidating] = useState<boolean>(false)

  // Real Database Vouchers & Suggested Products
  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([])
  const [suggestions, setSuggestions] = useState<ProductItem[]>([])

  useEffect(() => {
    // 1. Đồng bộ giỏ hàng với Backend
    syncWithBackend()

    // 2. Tải danh sách Voucher thật từ Backend
    voucherService.getVouchers()
      .then(data => {
        if (Array.isArray(data)) setAvailableVouchers(data)
      })
      .catch(err => console.error('Lỗi tải vouchers:', err))

    // 3. Tải sản phẩm gợi ý mua kèm từ Backend
    productService.getProducts({ limit: 4, sortBy: 'popular' })
      .then(res => {
        if (res && Array.isArray(res.products)) setSuggestions(res.products)
      })
      .catch(err => console.error('Lỗi tải sản phẩm gợi ý:', err))
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  // Toggle Select All
  const isAllSelected = cart.length > 0 && cart.every((item) => item.selected)

  // Calculate totals
  const selectedItems = cart.filter((item) => item.selected)
  const selectedCount = selectedItems.reduce((acc, i) => acc + i.quantity, 0)
  const subtotal = selectedItems.reduce((acc, item) => acc + item.price * item.quantity, 0)

  // Real Voucher calculation from API data
  const handleApplyCoupon = (codeToApply?: string) => {
    setCouponError('')
    const clean = (codeToApply || couponCode).trim().toUpperCase()
    if (!clean) return

    const match = availableVouchers.find((v) => v.code.toUpperCase() === clean)
    if (match) {
      const today = new Date()
      const expiry = new Date(match.expiryDate)
      if (expiry < today) {
        setCouponError('Mã giảm giá này đã hết hạn sử dụng.')
        return
      }
      if (match.usesCount >= match.maxUses) {
        setCouponError('Mã giảm giá này đã hết lượt sử dụng.')
        return
      }
      if (subtotal < match.minOrderValue) {
        setCouponError(`Đơn hàng tối thiểu cần ${formatPrice(match.minOrderValue)} để áp dụng mã này.`)
        return
      }

      setAppliedCoupon({
        code: match.code,
        discount: match.discountValue,
        desc: match.description
      })
      setCouponCode('')
      showToast(`Áp dụng mã ${match.code} thành công!`)
    } else {
      setCouponError('Mã khuyến mãi không tồn tại hoặc không hợp lệ.')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
  }

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0
  const estimatedShipping = selectedItems.length > 0 ? (subtotal >= 2000000 ? 0 : 30000) : 0
  const finalTotal = Math.max(0, subtotal + estimatedShipping - discountAmount)

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-sm my-8"
          >
            <div className="w-24 h-24 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-6 text-4xl">
              🛒
            </div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white mb-2 uppercase tracking-wide">
              Giỏ hàng của bạn đang trống!
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto leading-relaxed">
              Bạn chưa thêm thiết bị công nghệ nào vào giỏ. Hãy dạo quanh cửa hàng và chọn những món phụ kiện hoặc PC ưng ý nhất nhé!
            </p>
            <Link
              to="/ProductPage"
              className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-2xl shadow-lg shadow-[#ff4655]/25 transition-all active:scale-95"
            >
              <ArrowLeft size={16} weight="bold" /> Khám phá sản phẩm ngay
            </Link>
          </motion.div>
        ) : (
          /* Giao diện chính của giỏ hàng */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cột trái (8 cols): Danh sách sản phẩm trong giỏ */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              
              {/* Header điều khiển Chọn tất cả */}
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
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, height: 0 }}
                      className={`bg-white dark:bg-zinc-900 border rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
                        item.selected
                          ? 'border-[#ff4655]/40 shadow-[0_0_15px_rgba(255,70,85,0.06)]'
                          : 'border-zinc-200/80 dark:border-zinc-800'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        
                        {/* Checkbox & Ảnh */}
                        <div className="flex items-center gap-3.5 w-full sm:w-auto">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelect(item.productId || item.id)}
                            className="w-4 h-4 accent-[#ff4655] rounded cursor-pointer"
                          />
                          <Link
                            to={`/product/${item.productId || item.id}`}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center text-3xl sm:text-4xl flex-shrink-0 hover:scale-105 transition-transform overflow-hidden"
                          >
                            <SafeProductImage
                              src={item.imageEmoji}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </Link>
                          
                          {/* Info on Mobile */}
                          <div className="flex-1 sm:hidden">
                            <Link
                              to={`/product/${item.productId || item.id}`}
                              className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1 hover:text-[#ff4655] transition-colors"
                            >
                              {item.title}
                            </Link>
                            {item.isPriceLocked && (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                  <ShieldCheck size={10} weight="bold" /> Giữ giá: còn {formatRemainingTime(item.priceLockRemainingMs)}
                                </span>
                              </div>
                            )}
                            {item.unavailableReason && (
                              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 mt-0.5">
                                <Warning size={10} weight="bold" /> {item.unavailableReason}
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 block mt-0.5">{item.variant}</span>
                            <div className="text-xs font-black text-[#ff4655] mt-1">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        </div>

                        {/* Info on Desktop */}
                        <div className="hidden sm:block flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                              {item.categoryName}
                            </span>
                            <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                              <Storefront size={12} /> {item.shopName}
                            </span>
                          </div>
                          <Link
                            to={`/product/${item.productId || item.id}`}
                            className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 hover:text-[#ff4655] transition-colors mt-1 block"
                          >
                            {item.title}
                          </Link>
                          {item.isPriceLocked && (
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                <ShieldCheck size={12} weight="bold" /> Giữ giá ưu đãi: còn {formatRemainingTime(item.priceLockRemainingMs)}
                              </span>
                              {item.originalPrice && item.originalPrice > item.price && (
                                <span className="text-[10px] font-bold text-emerald-500">
                                  Tiết kiệm {formatPrice(item.originalPrice - item.price)}/sp
                                </span>
                              )}
                            </div>
                          )}
                          {item.unavailableReason && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                              <Warning size={12} weight="bold" /> {item.unavailableReason}
                            </span>
                          )}
                          <span className="text-xs text-zinc-400 block mt-0.5 font-medium">
                            Cấu hình: {item.variant}
                          </span>
                        </div>

                        {/* Đơn giá */}
                        <div className="hidden sm:block text-right w-28">
                          {item.oldPrice && (
                            <div className="text-xs font-bold text-zinc-400 line-through">
                              {formatPrice(item.oldPrice)}
                            </div>
                          )}
                          <div className="text-sm font-black text-zinc-900 dark:text-white">
                            {formatPrice(item.price)}
                          </div>
                        </div>

                        {/* Bộ tăng giảm số lượng & Thành tiền */}
                        <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-xl p-1">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId || item.id, -1)}
                              className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            >
                              <Minus size={12} weight="bold" />
                            </button>
                            <span className="w-9 text-center text-xs font-black text-zinc-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.productId || item.id, 1)}
                              className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer"
                            >
                              <Plus size={12} weight="bold" />
                            </button>
                          </div>

                          <div className="text-right sm:w-28">
                            <span className="text-[10px] text-zinc-400 block sm:hidden">Thành tiền:</span>
                            <span className="text-sm font-black text-[#ff4655]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>

                          {/* Nút xóa */}
                          <button
                            type="button"
                            onClick={() => {
                              removeItem(item.productId || item.id)
                              showToast(`Đã xóa "${item.title.slice(0, 20)}..." khỏi giỏ hàng`)
                            }}
                            className="p-2 text-zinc-400 hover:text-[#ff4655] hover:bg-[#ff4655]/10 rounded-xl transition-all cursor-pointer"
                            title="Xóa khỏi giỏ hàng"
                          >
                            <Trash size={16} />
                          </button>
                        </div>

                      </div>
                    </motion.div>
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
                
                {/* Box Coupon / Voucher */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={18} className="text-[#ff4655]" weight="bold" />
                    <h3 className="font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
                      Mã khuyến mãi GEARTECH
                    </h3>
                  </div>

                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <CheckCircle size={16} weight="fill" />
                          <span>{appliedCoupon.code}</span>
                        </div>
                        <p className="text-[11px] text-emerald-500/90 mt-0.5">{appliedCoupon.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1.5 hover:bg-emerald-500/20 rounded-lg transition-colors text-emerald-600 cursor-pointer"
                      >
                        <X size={14} weight="bold" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="MÃ GIẢM GIÁ"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs uppercase tracking-wider focus:outline-none focus:border-[#ff4655]"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon()}
                          className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                        >
                          Áp dụng
                        </button>
                      </div>
                      {couponError && (
                        <p className="text-[11px] text-[#ff4655] font-semibold mt-1.5 flex items-center gap-1">
                          <Warning size={12} weight="bold" /> {couponError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quick voucher buttons from Real Database */}
                  {availableVouchers.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {availableVouchers.map((v) => (
                        <button
                          key={v._id}
                          type="button"
                          onClick={() => {
                            setCouponCode(v.code)
                            handleApplyCoupon(v.code)
                          }}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655] hover:bg-[#ff4655]/10 transition-colors font-mono font-bold cursor-pointer"
                        >
                          +{v.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Box Tính toán tổng tiền & Nút Mua */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 shadow-xl shadow-zinc-200/40 dark:shadow-none space-y-4">
                  
                  <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
                    <span className="font-black text-xs uppercase tracking-wider text-zinc-900 dark:text-white">
                      Tóm tắt giỏ hàng
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">
                      Đã chọn: <strong className="text-zinc-900 dark:text-white">{selectedCount}</strong> món
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Tạm tính hàng:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">{formatPrice(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-zinc-500">
                      <span>Phí vận chuyển ước tính:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        {estimatedShipping === 0 ? (
                          <span className="text-emerald-500 font-bold">Miễn phí</span>
                        ) : (
                          formatPrice(estimatedShipping)
                        )}
                      </span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-emerald-500 font-medium">
                        <span>Voucher giảm giá:</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    {validationError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-500 flex items-start gap-2">
                        <Warning size={16} weight="bold" className="shrink-0 mt-0.5" />
                        <span>{validationError}</span>
                      </div>
                    )}

                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between items-baseline">
                      <div>
                        <span className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider block">
                          Tổng thanh toán
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">Đã bao gồm VAT 10%</span>
                      </div>
                      <span className="text-xl font-black text-[#ff4655]">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Nút sang trang Checkout kèm kiểm tra lại tồn kho và giá ở backend */}
                  <button
                    type="button"
                    disabled={selectedCount === 0 || validating}
                    onClick={async () => {
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
                    }}
                    className="w-full py-4 px-6 rounded-2xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 flex items-center justify-center gap-2 group active:scale-[0.99] cursor-pointer"
                  >
                    <span>{validating ? 'ĐANG KIỂM TRA TỒN KHO...' : 'TIẾN HÀNH THANH TOÁN'}</span>
                    <ArrowRight size={16} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  {selectedCount === 0 && (
                    <p className="text-[11px] text-amber-500 text-center font-medium">
                      Vui lòng tích chọn ít nhất 1 sản phẩm để thanh toán
                    </p>
                  )}

                  {/* Thông tin hỗ trợ */}
                  <div className="pt-2 text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    <span>Cam kết bảo mật & Đổi trả trong 30 ngày</span>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* Sản phẩm gợi ý mua kèm từ Real Database */}
        {suggestions.length > 0 && (
          <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#ff4655] mb-1">
                  <Sparkle size={14} weight="fill" />
                  <span>PHỤ KIỆN HOT MUA KÈM</span>
                </div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-wide">
                  GỢI Ý DÀNH RIÊNG CHO BẠN
                </h2>
              </div>
              <Link
                to="/ProductPage"
                className="text-xs font-bold text-[#ff4655] hover:underline flex items-center gap-1"
              >
                Xem tất cả &raquo;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {suggestions.map((p) => (
                <div
                  key={p._id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:border-[#ff4655]/40 transition-all hover:shadow-lg shadow-sm"
                >
                  <div>
                    <div className="w-full h-32 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 flex items-center justify-center text-4xl mb-3">
                      {p.imageEmoji}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                      {p.categoryName}
                    </span>
                    <Link
                      to={`/product/${p._id}`}
                      className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-2 hover:text-[#ff4655] transition-colors mt-0.5 block"
                    >
                      {p.title}
                    </Link>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                    <div className="text-xs font-black text-[#ff4655]">
                      {formatPrice(p.price)}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleAddSuggestion(p)
                        showToast(`Đã thêm "${p.title.slice(0, 20)}..." vào giỏ!`)
                      }}
                      className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] text-zinc-700 dark:text-zinc-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} weight="bold" /> Thêm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
