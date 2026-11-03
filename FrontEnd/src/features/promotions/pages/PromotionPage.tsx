import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Link } from 'react-router-dom'
import { 
  Ticket, 
  Tag, 
  Percent, 
  Truck, 
  Sparkle, 
  Storefront, 
  Copy, 
  Check, 
  CheckCircle, 
  Clock, 
  Fire, 
  MagnifyingGlass, 
  Info, 
  X, 
  ArrowRight, 
  ShieldCheck, 
  BookmarkSimple, 
  ShoppingBag
} from '@phosphor-icons/react'
import { voucherService, type VoucherItem } from '../../../services/voucherService'
import { productService, type ProductItem } from '../../../services/productService'
import { useCartStore } from '../../../store/cartStore'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'

type FilterTab = 'all' | 'system' | 'shop' | 'percentage' | 'freeship' | 'saved'
type SortOption = 'default' | 'discount_desc' | 'min_order_asc' | 'expiring_soon'

export default function PromotionPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([])
  const [discountedProducts, setDiscountedProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('default')
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Local storage for saved vouchers
  const [savedCodes, setSavedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geartech_saved_vouchers')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Flash sale countdown timer state (counts down to midnight)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const { addItem } = useCartStore()

  // 1. Fetch real active vouchers from Backend API
  const fetchVouchers = async () => {
    try {
      setLoading(true)
      const data = await voucherService.getVouchers()
      if (Array.isArray(data)) {
        setVouchers(data)
      }
    } catch (err) {
      console.error('Lỗi tải danh sách khuyến mãi:', err)
    } finally {
      setLoading(false)
    }
  }

  // 2. Fetch discounted products for Flash Sale
  const fetchProducts = async () => {
    try {
      setProductsLoading(true)
      const res = await productService.getProducts({ sale: true, limit: 8 })
      if (res && Array.isArray(res.products)) {
        // Filter products with actual discount or oldPrice
        const validDiscounted = res.products.filter(
          p => (p.oldPrice && p.oldPrice > p.price) || (p.discount && parseInt(p.discount) > 0)
        )
        setDiscountedProducts(validDiscounted.length > 0 ? validDiscounted : res.products.slice(0, 8))
      }
    } catch (err) {
      console.error('Lỗi tải sản phẩm khuyến mãi:', err)
    } finally {
      setProductsLoading(false)
    }
  }

  useEffect(() => {
    fetchVouchers()
    fetchProducts()
  }, [])

  // Flash sale live countdown calculation
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      const diff = endOfDay.getTime() - now.getTime()
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft({ hours, minutes, seconds })
      }
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    showToast(`Đã sao chép mã voucher: ${code}`)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleSaveVoucher = (code: string) => {
    let updated: string[]
    if (savedCodes.includes(code)) {
      updated = savedCodes.filter(c => c !== code)
      showToast(`Đã bỏ lưu mã ${code}`)
    } else {
      updated = [...savedCodes, code]
      showToast(`Đã lưu mã ${code} vào Voucher của tôi!`)
    }
    setSavedCodes(updated)
    localStorage.setItem('geartech_saved_vouchers', JSON.stringify(updated))
  }

  // Filter and sort vouchers based on user interaction
  const filteredVouchers = useMemo(() => {
    let result = [...vouchers]

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(v => 
        v.code.toLowerCase().includes(q) ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.description && v.description.toLowerCase().includes(q))
      )
    }

    // Tab filter
    if (activeTab === 'system') {
      result = result.filter(v => !v.shopId)
    } else if (activeTab === 'shop') {
      result = result.filter(v => !!v.shopId)
    } else if (activeTab === 'percentage') {
      result = result.filter(v => v.discountType === 'percentage')
    } else if (activeTab === 'freeship') {
      result = result.filter(v => v.code.toLowerCase().includes('ship') || (v.description && v.description.toLowerCase().includes('vận chuyển')))
    } else if (activeTab === 'saved') {
      result = result.filter(v => savedCodes.includes(v.code))
    }

    // Sort
    if (sortBy === 'discount_desc') {
      result.sort((a, b) => (b.discountValue || 0) - (a.discountValue || 0))
    } else if (sortBy === 'min_order_asc') {
      result.sort((a, b) => (a.minOrderValue || 0) - (b.minOrderValue || 0))
    } else if (sortBy === 'expiring_soon') {
      result.sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
    }

    return result
  }, [vouchers, activeTab, searchQuery, sortBy, savedCodes])

  // Helper: get shop name
  const getShopName = (v: VoucherItem) => {
    if (!v.shopId) return null
    if (typeof v.shopId === 'object') {
      return v.shopId.shopName || v.shopId.name || 'Shop đối tác'
    }
    return 'Shop đối tác'
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#08090c] text-zinc-800 dark:text-zinc-200 transition-colors duration-200 pb-16">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold border border-zinc-700 dark:border-zinc-300"
          >
            <CheckCircle size={18} weight="fill" className="text-emerald-400 dark:text-emerald-600" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================
          A1. HERO BANNER - GEARTECH SIGNATURE RED TECH AESTHETIC
      ============================================================ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white py-12 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 shadow-lg">
        {/* Decorative background red glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff4655]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-bold uppercase tracking-wider">
                <Sparkle size={14} weight="fill" className="text-[#ff4655]" />
                <span>GEARTECH MEGA PROMOTION 2026</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
                Ưu đãi công nghệ <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-rose-400 to-amber-300">
                  Nâng cấp trải nghiệm
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                Khám phá hàng loạt mã voucher toàn sàn độc quyền, deal giảm giá chớp nhoáng và ưu đãi freeship hấp dẫn dành riêng cho cộng đồng công nghệ GearTech.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#voucher-section"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 cursor-pointer active:scale-98"
                >
                  <Ticket size={16} weight="bold" />
                  <span>Khám phá voucher</span>
                </a>
                <button
                  onClick={() => {
                    setActiveTab('saved')
                    const el = document.getElementById('voucher-section')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition backdrop-blur-sm cursor-pointer"
                >
                  <BookmarkSimple size={16} weight="bold" />
                  <span>Voucher của tôi ({savedCodes.length})</span>
                </button>
              </div>
            </div>

            {/* Banner Quick Highlights / Badges */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-80">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#ff4655]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-[#ff4655]/20 flex items-center justify-center text-[#ff4655] mb-2">
                  <Percent size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Giảm đến 500K</div>
                <div className="text-[11px] text-zinc-400">Cho đơn hàng Laptop & PC</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-amber-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  <Truck size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Freeship 30K</div>
                <div className="text-[11px] text-zinc-400">Đơn hàng từ 300.000đ</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Chính Hãng</div>
                <div className="text-[11px] text-zinc-400">100% bảo hành tiêu chuẩn</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-rose-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
                  <Storefront size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Shop Mall</div>
                <div className="text-[11px] text-zinc-400">Voucher riêng từng gian hàng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        
        {/* ============================================================
            A4. FLASH SALE & SẢN PHẨM KHUYẾN MÃI NỔI BẬT
        ============================================================ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center">
                <Fire size={24} weight="fill" className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                    Flash Sale Công Nghệ
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20 uppercase tracking-wider">
                    HOT DEAL
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Số lượng có hạn – Ưu đãi tự động kết thúc khi hết thời gian
                </p>
              </div>
            </div>

            {/* Live Real Countdown Timer with GearTech Signature Red */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 uppercase font-mono">
                <Clock size={16} weight="bold" className="text-[#ff4655]" />
                Kết thúc trong:
              </span>
              <div className="flex items-center gap-1">
                <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-800 font-mono text-xs font-bold flex items-center justify-center shadow-inner">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="font-bold text-[#ff4655]">:</span>
                <span className="w-8 h-8 rounded-lg bg-zinc-900 text-white dark:bg-zinc-800 font-mono text-xs font-bold flex items-center justify-center shadow-inner">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="font-bold text-[#ff4655]">:</span>
                <span className="w-8 h-8 rounded-lg bg-[#ff4655] text-white font-mono text-xs font-black flex items-center justify-center shadow-lg shadow-[#ff4655]/40 animate-pulse">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : discountedProducts.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 text-xs font-medium">
              Hiện chưa có sản phẩm Flash Sale nào đang kích hoạt.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
              {discountedProducts.slice(0, 4).map((p) => {
                const discountPercent = p.oldPrice && p.oldPrice > p.price
                  ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100)
                  : (p.discount ? parseInt(p.discount) : 0)

                return (
                  <div
                    key={p._id || p.id}
                    className="group bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4 flex flex-col justify-between hover:border-[#ff4655]/60 hover:shadow-md transition relative"
                  >
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md text-[10px] font-black bg-[#ff4655] text-white shadow-sm tracking-wider">
                        -{discountPercent}%
                      </span>
                    )}

                    <div>
                      {/* Product Image */}
                      <Link to={`/product/${p._id || p.id}`} className="block overflow-hidden rounded-lg aspect-square bg-white dark:bg-zinc-900 mb-3 p-2 relative group-hover:scale-105 transition-transform duration-300">
                        <SafeProductImage
                          src={(p.gallery && p.gallery.length > 0) ? p.gallery[0] : (p.image || p.imageEmoji)}
                          alt={p.name || p.title}
                          className="w-full h-full object-contain"
                          containerClassName="w-full h-full flex items-center justify-center"
                          fallbackIcon={p.imageEmoji || '💻'}
                        />
                      </Link>

                      {/* Product Info */}
                      <span className="text-[10px] font-bold text-[#ff4655] uppercase tracking-wider block mb-1">
                        {p.categoryName || p.category || 'Công nghệ'}
                      </span>
                      <Link to={`/product/${p._id || p.id}`} className="block">
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-2 group-hover:text-[#ff4655] transition mb-2">
                          {p.name || p.title}
                        </h3>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-sm sm:text-base font-black text-[#ff4655]">
                          {formatPrice(p.price)}
                        </span>
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="text-[11px] text-zinc-400 line-through">
                            {formatPrice(p.oldPrice)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={async () => {
                          await addItem(p, 1)
                          showToast(`Đã thêm ${p.name || p.title} vào giỏ hàng!`)
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-[#ff4655] dark:bg-zinc-800 dark:hover:bg-[#ff4655] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm active:scale-98"
                      >
                        <ShoppingBag size={14} weight="bold" />
                        <span>Thêm vào giỏ</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link
              to="/ProductPage?sale=true"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#ff4655] hover:underline uppercase tracking-wider"
            >
              <span>Xem tất cả sản phẩm đang giảm giá</span>
              <ArrowRight size={14} weight="bold" />
            </Link>
          </div>
        </div>

        {/* ============================================================
            A2 & A5. TÌM KIẾM, BỘ LỌC DANH MỤC VÀ SẮP XẾP
        ============================================================ */}
        <div id="voucher-section" className="scroll-mt-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Ticket size={24} weight="fill" className="text-[#ff4655]" />
                Kho Voucher & Mã Khuyến Mãi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Thu thập mã giảm giá để áp dụng trực tiếp tại bước giỏ hàng hoặc thanh toán
              </p>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72">
                <MagnifyingGlass size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Tìm mã hoặc tên chương trình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Sắp xếp danh sách mã giảm giá"
                className="px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
              >
                <option value="default">Sắp xếp mặc định</option>
                <option value="discount_desc">Mức giảm cao nhất</option>
                <option value="min_order_asc">Đơn tối thiểu thấp nhất</option>
                <option value="expiring_soon">Sắp hết hạn</option>
              </select>
            </div>
          </div>

          {/* Filter Tabs (A2) with GearTech Red Accent */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {[
              { id: 'all', label: 'Tất cả ưu đãi', icon: Tag, count: vouchers.length },
              { id: 'system', label: 'Toàn sàn GearTech', icon: ShieldCheck, count: vouchers.filter(v => !v.shopId).length },
              { id: 'shop', label: 'Voucher Shop', icon: Storefront, count: vouchers.filter(v => !!v.shopId).length },
              { id: 'percentage', label: 'Giảm theo %', icon: Percent, count: vouchers.filter(v => v.discountType === 'percentage').length },
              { id: 'freeship', label: 'Vận chuyển Freeship', icon: Truck, count: vouchers.filter(v => v.code.toLowerCase().includes('ship') || (v.description && v.description.toLowerCase().includes('vận chuyển'))).length },
              { id: 'saved', label: 'Voucher của tôi', icon: BookmarkSimple, count: savedCodes.length }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as FilterTab)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-[#ff4655] text-white shadow-md shadow-[#ff4655]/30'
                      : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-[#ff4655]'
                  }`}
                >
                  <Icon size={14} weight={isActive ? 'fill' : 'bold'} />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ============================================================
              A3. DANH SÁCH VOUCHER CARDS
          ============================================================ */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
              ))}
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
              <Ticket size={48} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
              <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-200 uppercase">
                {activeTab === 'saved' ? 'Bạn chưa lưu mã giảm giá nào' : 'Không tìm thấy voucher phù hợp'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
                {activeTab === 'saved'
                  ? 'Hãy nhấn "Lưu mã" trên các thẻ voucher để dễ dàng tìm kiếm và sử dụng khi thanh toán.'
                  : 'Hãy thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục ưu đãi khác.'}
              </p>
              {activeTab === 'saved' && (
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#ff4655]/20"
                >
                  Khám phá voucher ngay
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVouchers.map((v) => {
                const isSaved = savedCodes.includes(v.code)
                const isPercentage = v.discountType === 'percentage'
                const shopName = getShopName(v)
                const isExpiringSoon = new Date(v.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000

                // Remaining uses indicator
                const max = v.maxUses || 100
                const used = v.usesCount || 0
                const remaining = Math.max(0, max - used)
                const percentageUsed = Math.min(100, Math.round((used / max) * 100))

                return (
                  <div
                    key={v._id || v.code}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between hover:shadow-lg hover:border-[#ff4655]/60 dark:hover:border-[#ff4655]/60 transition relative overflow-hidden group"
                  >
                    {/* Top edge badge row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {shopName ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <Storefront size={12} weight="bold" />
                          <span className="truncate max-w-[140px]">{shopName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20">
                          <ShieldCheck size={12} weight="bold" />
                          <span>Toàn sàn GearTech</span>
                        </span>
                      )}

                      {isExpiringSoon && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Sắp hết hạn
                        </span>
                      )}
                    </div>

                    {/* Voucher Discount Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-[#ff4655] tracking-tight">
                          {isPercentage ? `Giảm ${v.discountValue}%` : `Giảm ${formatPrice(v.discountValue)}`}
                        </span>
                        {isPercentage && v.maxDiscount && v.maxDiscount > 0 && (
                          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                            (Tối đa {formatPrice(v.maxDiscount)})
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-100 line-clamp-1 group-hover:text-[#ff4655] transition">
                        {v.name || v.description}
                      </h3>

                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2">
                        {v.description}
                      </p>

                      <div className="pt-2 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 space-y-0.5">
                        <div>
                          Đơn tối thiểu: <span className="font-bold text-zinc-800 dark:text-zinc-200">{formatPrice(v.minOrderValue || 0)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                          <Clock size={12} />
                          <span>Hạn dùng: {new Date(v.expiryDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>

                      {/* Usage bar */}
                      <div className="pt-2">
                        <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                          <span>Đã dùng {percentageUsed}%</span>
                          <span>Còn {remaining} lượt</span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#ff4655] to-amber-500 rounded-full"
                            style={{ width: `${percentageUsed}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Voucher Code Box & Actions */}
                    <div className="pt-4 mt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/80 border border-dashed border-zinc-300 dark:border-zinc-700 px-3 py-1.5 rounded-xl group-hover:border-[#ff4655]/40 transition">
                        <div className="font-mono text-xs font-black text-zinc-900 dark:text-white tracking-wider">
                          {v.code}
                        </div>
                        <button
                          onClick={() => handleCopyCode(v.code)}
                          className="text-[11px] font-bold text-[#ff4655] hover:text-[#e03d4b] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedCode === v.code ? (
                            <>
                              <Check size={14} weight="bold" className="text-emerald-500" />
                              <span className="text-emerald-500">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} weight="bold" />
                              <span>Sao chép</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleSaveVoucher(v.code)}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border ${
                            isSaved
                              ? 'bg-[#ff4655]/10 text-[#ff4655] border-[#ff4655]/30'
                              : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-[#ff4655]'
                          }`}
                        >
                          <BookmarkSimple size={14} weight={isSaved ? 'fill' : 'bold'} />
                          <span>{isSaved ? 'Đã lưu' : 'Lưu mã'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedVoucher(v)}
                          className="py-1.5 px-3 rounded-lg text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-[#ff4655] hover:bg-[#ff4655]/10 transition cursor-pointer flex items-center gap-1"
                        >
                          <Info size={14} />
                          <span>Chi tiết</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      {/* ============================================================
          A6. MODAL CHI TIẾT KHUYẾN MÃI & ĐIỀU KIỆN
      ============================================================ */}
      <AnimatePresence>
        {selectedVoucher && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVoucher(null)}
                aria-label="Đóng cửa sổ chi tiết mã giảm giá"
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center text-2xl border border-[#ff4655]/20">
                  {selectedVoucher.emoji || '🎫'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ff4655]">
                    {selectedVoucher.shopId ? 'Voucher Gian hàng' : 'Voucher Toàn sàn'}
                  </span>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {selectedVoucher.name || selectedVoucher.description}
                  </h3>
                </div>
              </div>

              {/* Code display banner */}
              <div className="bg-zinc-50 dark:bg-zinc-950 border border-dashed border-[#ff4655]/50 rounded-xl p-3 flex items-center justify-between mb-4">
                <div>
                  <div className="text-[10px] text-zinc-400 font-semibold uppercase">Mã khuyến mãi:</div>
                  <div className="font-mono text-base font-black text-[#ff4655]">
                    {selectedVoucher.code}
                  </div>
                </div>
                <button
                  onClick={() => handleCopyCode(selectedVoucher.code)}
                  className="px-3 py-1.5 rounded-lg bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer shadow-sm active:scale-98"
                >
                  <Copy size={14} weight="bold" />
                  <span>Sao chép</span>
                </button>
              </div>

              {/* Conditions List */}
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-400">Mức giảm:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {selectedVoucher.discountType === 'percentage'
                      ? `Giảm ${selectedVoucher.discountValue}% (Tối đa ${formatPrice(selectedVoucher.maxDiscount || 0)})`
                      : `Giảm ${formatPrice(selectedVoucher.discountValue)}`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-400">Đơn hàng tối thiểu:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {formatPrice(selectedVoucher.minOrderValue || 0)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-400">Phạm vi áp dụng:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {getShopName(selectedVoucher) || 'Tất cả sản phẩm trên toàn sàn GearTech'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800/60">
                  <span className="text-zinc-400">Hạn sử dụng:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">
                    {new Date(selectedVoucher.expiryDate).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Step instructions */}
              <div className="mt-4 bg-zinc-50 dark:bg-zinc-950/60 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Info size={14} weight="bold" className="text-[#ff4655]" />
                  <span>Cách sử dụng voucher:</span>
                </div>
                <ol className="list-decimal pl-4 space-y-0.5 text-zinc-500 dark:text-zinc-400">
                  <li>Nhấn "Sao chép" mã voucher trên.</li>
                  <li>Chọn các sản phẩm phù hợp điều kiện vào giỏ hàng.</li>
                  <li>Tại trang Giỏ hàng hoặc Thanh toán, dán mã vào ô Voucher và nhấn "Áp dụng".</li>
                </ol>
              </div>

              {/* Action */}
              <div className="mt-5 flex gap-2">
                <button
                  onClick={() => setSelectedVoucher(null)}
                  className="flex-1 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-200 transition cursor-pointer"
                >
                  Đóng
                </button>
                <Link
                  to="/ProductPage"
                  onClick={() => {
                    localStorage.setItem('geartech_applied_voucher', selectedVoucher.code)
                    setSelectedVoucher(null)
                  }}
                  className="flex-1 py-2 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition shadow-md shadow-[#ff4655]/30 text-center active:scale-98"
                >
                  <span>Dùng mã ngay</span>
                  <ArrowRight size={14} weight="bold" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
