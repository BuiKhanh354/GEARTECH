import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Storefront, 
  Star, 
  MapPin, 
  Phone, 
  Envelope, 
  Package, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkle,
  Heart,
  ChatCircleText,
  User,
  X,
  PaperPlaneRight
} from '@phosphor-icons/react'
import { storefrontService, type StorefrontConfig, type StorefrontShopInfo } from '../../../services/storefrontService'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'
import apiClient from '../../../api/client'

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [shop, setShop] = useState<StorefrontShopInfo | null>(null)
  const [storefront, setStorefront] = useState<StorefrontConfig | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // C2: Real Follower Count & Following Status
  const [followerCount, setFollowerCount] = useState<number>(0)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const [followLoading, setFollowLoading] = useState<boolean>(false)

  // C2: Shop Reviews State
  const [shopReviews, setShopReviews] = useState<any[]>([])
  const [reviewsLoading, setReviewsLoading] = useState<boolean>(false)
  const [averageRating, setAverageRating] = useState<number>(5.0)
  const [showReviewModal, setShowReviewModal] = useState<boolean>(false)
  const [ratingInput, setRatingInput] = useState<number>(5)
  const [commentInput, setCommentInput] = useState<string>('')
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false)
  const [reviewAlert, setReviewAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchFollowerStatus = async (shopId: string) => {
    try {
      const res = await apiClient.get(`/shop-followers/check/${shopId}`)
      if (res.data) {
        setFollowerCount(res.data.followersCount || 0)
        setIsFollowing(Boolean(res.data.isFollowing))
      }
    } catch (err) {
      console.warn('Lỗi kiểm tra followers:', err)
    }
  }

  const fetchShopReviews = async (shopId: string) => {
    try {
      setReviewsLoading(true)
      const res = await apiClient.get(`/reviews/shop/${shopId}`)
      if (res.data) {
        setShopReviews(res.data.reviews || [])
        if (res.data.averageRating) setAverageRating(res.data.averageRating)
      }
    } catch (err) {
      console.warn('Lỗi tải đánh giá shop:', err)
    } finally {
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const fetchShopStorefront = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await storefrontService.getPublicStorefront(id)
        if (data && data.shop) {
          setShop(data.shop)
          setStorefront(data.storefront)
          const prods = (data.allProducts && data.allProducts.length > 0)
            ? data.allProducts 
            : (data.products && data.products.length > 0)
              ? data.products 
              : data.sectionsData?.catalog || []
          const feat = (data.featuredProducts && data.featuredProducts.length > 0)
            ? data.featuredProducts 
            : data.sectionsData?.featured || prods.slice(0, 8)
          setAllProducts(prods)
          setFeaturedProducts(feat)

          // C2: Tải follower count thật và đánh giá thật
          await fetchFollowerStatus(id)
          await fetchShopReviews(id)
        } else {
          setError('Không tìm thấy gian hàng đối tác này.')
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Không thể tải thông tin gian hàng.')
      } finally {
        setLoading(false)
      }
    }
    fetchShopStorefront()
  }, [id])

  // C2: Bấm Theo dõi / Bỏ theo dõi gian hàng
  const handleToggleFollow = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    if (!id) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        const res = await apiClient.delete(`/shop-followers/${id}`)
        setIsFollowing(false)
        setFollowerCount(res.data.followersCount !== undefined ? res.data.followersCount : Math.max(0, followerCount - 1))
      } else {
        const res = await apiClient.post(`/shop-followers/${id}`)
        setIsFollowing(true)
        setFollowerCount(res.data.followersCount !== undefined ? res.data.followersCount : followerCount + 1)
      }
    } catch (err: any) {
      console.error('Lỗi theo dõi shop:', err)
    } finally {
      setFollowLoading(false)
    }
  }

  // C2: Gửi đánh giá cho gian hàng
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    if (!id || !commentInput.trim()) return

    setReviewSubmitting(true)
    setReviewAlert(null)
    try {
      const res = await apiClient.post(`/reviews/shop/${id}`, {
        rating: ratingInput,
        comment: commentInput.trim()
      })
      setReviewAlert({ type: 'success', message: res.data.message || 'Cảm ơn bạn đã gửi đánh giá cho gian hàng!' })
      setShowReviewModal(false)
      setCommentInput('')
      await fetchShopReviews(id)
    } catch (err: any) {
      setReviewAlert({ type: 'error', message: err.response?.data?.error || 'Lỗi gửi đánh giá cho gian hàng.' })
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen py-16 px-6 max-w-7xl mx-auto space-y-6">
        <div className="h-56 bg-zinc-100 dark:bg-zinc-900 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <Storefront size={48} className="text-[#ff4655] opacity-60" />
        <h3 className="text-lg font-black text-zinc-900 dark:text-white uppercase">
          {error || 'Gian hàng không tồn tại'}
        </h3>
        <p className="text-xs text-zinc-500 max-w-md">
          Gian hàng này có thể đang trong quá trình bảo trì hoặc chưa được phê duyệt hoạt động.
        </p>
        <button
          onClick={() => navigate('/Cua-hang')}
          className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#ff4655] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} weight="bold" />
          Quay lại danh sách đối tác
        </button>
      </div>
    )
  }

  const primaryColor = storefront?.primaryColor || '#ff4655'
  const textColor = storefront?.textColor || '#ffffff'
  const template = storefront?.template || 'modern-tech'
  const columns = storefront?.columns || 4
  const sections = (storefront?.sections || [
    { id: 'banner', title: 'Banner & Thương hiệu', enabled: true, order: 1 },
    { id: 'intro', title: 'Thông điệp chào mừng', enabled: true, order: 2 },
    { id: 'featured', title: 'Sản phẩm nổi bật', enabled: true, order: 3 },
    { id: 'catalog', title: 'Tất cả thiết bị', enabled: true, order: 4 }
  ]).filter(s => s.enabled !== false).sort((a, b) => a.order - b.order)

  const gridColsClass = columns === 3 
    ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3' 
    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'

  return (
    <div className="min-h-screen py-8 px-6 lg:px-12 max-w-7xl mx-auto space-y-8 bg-grid-pattern">
      {/* Alert toast for review */}
      <AnimatePresence>
        {reviewAlert && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className={`p-4 rounded-2xl text-xs font-bold border flex items-center justify-between ${
              reviewAlert.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : 'bg-red-500/10 text-red-500 border-red-500/20'
            }`}
          >
            <span>{reviewAlert.message}</span>
            <button onClick={() => setReviewAlert(null)} className="text-xs uppercase underline cursor-pointer">
              Đóng
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} weight="bold" />
        <span>Trang chủ GEARTECH</span>
      </Link>

      {/* Render Dynamic Storefront Sections in Configured Order */}
      {sections.map((sec) => {
        // 1. SECTION BANNER & HERO (C1: Styled with primaryColor and textColor)
        if (sec.id === 'banner') {
          return (
            <div
              key={sec.id}
              style={{ color: textColor }}
              className={`p-6 sm:p-8 rounded-3xl shadow-2xl relative overflow-hidden transition-all ${
                template === 'gaming'
                  ? 'bg-zinc-950 border-2 border-red-500/30 shadow-red-500/10'
                  : template === 'minimal'
                    ? 'bg-zinc-900 border border-zinc-800'
                    : 'bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-zinc-800'
              }`}
            >
              {/* Optional Storefront Banner Image */}
              {storefront?.bannerUrl && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
                  style={{ backgroundImage: `url(${storefront.bannerUrl})` }}
                />
              )}

              {/* Ambient Glow */}
              <div 
                className="absolute right-0 top-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-20"
                style={{ backgroundColor: primaryColor }}
              />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <span className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white/10 backdrop-blur-md text-5xl flex items-center justify-center border border-white/20 shadow-inner shrink-0">
                    {shop.logo || '🏬'}
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider" style={{ color: textColor }}>
                        {shop.name}
                      </h1>
                      <span 
                        style={{ backgroundColor: `${primaryColor}25`, color: primaryColor, borderColor: `${primaryColor}50` }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm"
                      >
                        <ShieldCheck size={12} weight="fill" /> Đối tác xác minh
                      </span>
                    </div>
                    <p className="text-xs font-semibold opacity-90">{shop.category || 'Gian hàng phần cứng chính hãng'}</p>
                    {shop.description && (
                      <p className="text-[11px] opacity-75 max-w-xl leading-relaxed">{shop.description}</p>
                    )}
                  </div>
                </div>

                {/* Shop Meta Stats & Follow Button (C2) */}
                <div className="flex flex-col sm:flex-row items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-center shrink-0">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[9px] opacity-60 block uppercase tracking-wider">ĐÁNH GIÁ</span>
                      <span className="text-sm font-black text-amber-400 mt-1 block flex items-center justify-center gap-1">
                        <Star size={14} weight="fill" /> {averageRating.toFixed(1)} / 5.0
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] opacity-60 block uppercase tracking-wider">SẢN PHẨM</span>
                      <span className="text-sm font-black mt-1 block">
                        {allProducts.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] opacity-60 block uppercase tracking-wider">THEO DÕI</span>
                      <span className="text-sm font-black mt-1 block" style={{ color: primaryColor }}>
                        {followerCount} người
                      </span>
                    </div>
                  </div>

                  {/* C2: Nút Theo dõi / Bỏ theo dõi & Nút Đánh giá */}
                  <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button
                      type="button"
                      disabled={followLoading}
                      onClick={handleToggleFollow}
                      style={{
                        backgroundColor: isFollowing ? 'transparent' : primaryColor,
                        borderColor: primaryColor,
                        color: isFollowing ? primaryColor : '#ffffff'
                      }}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
                    >
                      <Heart size={14} weight={isFollowing ? 'fill' : 'bold'} />
                      <span>{isFollowing ? 'Đang theo dõi' : 'Theo dõi shop'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Đánh giá gian hàng"
                    >
                      <Star size={14} weight="fill" className="text-amber-400" />
                      <span>Đánh giá</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shop Contact details */}
              {(shop.address || shop.phone || shop.email) && (
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs relative z-10 opacity-80">
                  {shop.address && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} style={{ color: primaryColor }} /> {shop.address}
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} style={{ color: primaryColor }} /> {shop.phone}
                    </span>
                  )}
                  {shop.email && (
                    <span className="flex items-center gap-1.5 font-mono">
                      <Envelope size={14} style={{ color: primaryColor }} /> {shop.email}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        }

        // 2. SECTION INTRO / ANNOUNCEMENT
        if (sec.id === 'intro') {
          return (
            <div
              key={sec.id}
              style={{ borderLeftColor: primaryColor }}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-950/70 border-l-4 border-t border-r border-b border-zinc-200 dark:border-zinc-800 shadow-sm"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2 mb-1.5">
                <Sparkle size={15} style={{ color: primaryColor }} />
                {sec.title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                {storefront?.introText || 'Chào mừng quý khách đến với gian hàng chính hãng. Cam kết linh kiện chuẩn quốc tế, bảo hành đổi trả nhanh chóng!'}
              </p>
            </div>
          )
        }

        // 3. SECTION FEATURED PRODUCTS
        if (sec.id === 'featured') {
          if (featuredProducts.length === 0) return null
          return (
            <div key={sec.id} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-4 rounded-xs" style={{ backgroundColor: primaryColor }} />
                  {sec.title}
                </h2>
                <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                  <Sparkle size={14} weight="fill" /> BÁN CHẠY NHẤT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {featuredProducts.map((prod) => (
                  <motion.div
                    key={prod._id || prod.id}
                    whileHover={{ y: -4 }}
                    onClick={() => navigate(`/product/${prod._id || prod.id}`)}
                    className="group bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <div className="h-44 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center p-3 relative border-b border-zinc-100 dark:border-zinc-900 overflow-hidden">
                      <SafeProductImage
                        src={prod.imageEmoji || prod.gallery?.[0]}
                        alt={prod.title || prod.name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <span 
                        style={{ backgroundColor: primaryColor }}
                        className="absolute top-3 left-3 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow"
                      >
                        Nổi bật
                      </span>
                      {prod.discount && (
                        <span className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow">
                          {prod.discount}
                        </span>
                      )}
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase">
                        {prod.title || prod.name}
                      </h3>
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-extrabold" style={{ color: primaryColor }}>
                            {formatPrice(prod.price)}
                          </span>
                          {prod.oldPrice && (
                            <span className="text-[10px] text-zinc-400 line-through">
                              {formatPrice(prod.oldPrice)}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                          {prod.salesCount || 'Chính hãng'}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        }

        // 4. SECTION CATALOG (ALL PRODUCTS)
        if (sec.id === 'catalog') {
          return (
            <div key={sec.id} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Package size={18} style={{ color: primaryColor }} />
                  {sec.title} ({allProducts.length})
                </h2>
              </div>

              {allProducts.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 text-xs">
                  <Package size={32} className="mx-auto mb-2 opacity-40" />
                  <span>Gian hàng hiện chưa có sản phẩm nào được bày bán.</span>
                </div>
              ) : (
                <div className={`grid ${gridColsClass} gap-4`}>
                  {allProducts.map((prod) => (
                    <motion.div
                      key={prod._id || prod.id}
                      whileHover={{ y: -4 }}
                      onClick={() => navigate(`/product/${prod._id || prod.id}`)}
                      className="group bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                    >
                      <div className="h-44 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center p-3 relative border-b border-zinc-100 dark:border-zinc-900 overflow-hidden">
                        <SafeProductImage
                          src={prod.imageEmoji || prod.gallery?.[0]}
                          alt={prod.title || prod.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.discount && (
                          <span className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded shadow">
                            {prod.discount}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3">
                        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase">
                          {prod.title || prod.name}
                        </h3>
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-sm font-extrabold" style={{ color: primaryColor }}>
                              {formatPrice(prod.price)}
                            </span>
                            {prod.oldPrice && (
                              <span className="text-[10px] text-zinc-400 line-through">
                                {formatPrice(prod.oldPrice)}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-zinc-400 block uppercase">
                            {prod.salesCount || 'Chính hãng'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return null
      })}

      {/* C2: SECTION SHOP REVIEWS & FEEDBACK */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ChatCircleText size={20} className="text-[#ff4655]" weight="bold" />
            <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
              ĐÁNH GIÁ TỪ KHÁCH HÀNG ({shopReviews.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#ff4655] hover:bg-[#e03d4b] text-white flex items-center gap-1.5 shadow-md shadow-[#ff4655]/20 cursor-pointer"
          >
            <Star size={14} weight="fill" />
            <span>Viết đánh giá</span>
          </button>
        </div>

        {reviewsLoading ? (
          <div className="py-8 text-center text-xs text-zinc-400">Đang tải đánh giá gian hàng...</div>
        ) : shopReviews.length === 0 ? (
          <div className="py-10 text-center text-zinc-400 text-xs bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
            <Star size={28} className="mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="font-bold text-zinc-700 dark:text-zinc-300">Chưa có đánh giá nào cho gian hàng này.</p>
            <p className="text-[11px] text-zinc-400 mt-1">Hãy là người đầu tiên trải nghiệm và chia sẻ nhận xét của bạn!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopReviews.map((rev) => {
              const u = rev.user_id || rev.userId || {}
              return (
                <div key={rev._id} className="p-4 bg-white dark:bg-zinc-950/60 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                          <User size={14} />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-zinc-900 dark:text-white">{u.name || 'Khách hàng'}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-amber-400 text-xs gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={13} weight={i < rev.rating ? 'fill' : 'regular'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                    {rev.comment}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* C2: Review Modal for Customers */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                  <Star size={18} className="text-amber-400" weight="fill" />
                  ĐÁNH GIÁ GIAN HÀNG {shop.name}
                </h4>
                <button onClick={() => setShowReviewModal(false)} className="text-zinc-400 hover:text-white p-1 rounded-xl cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                    Mức độ hài lòng của bạn *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1 text-2xl transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={28}
                          weight={star <= ratingInput ? 'fill' : 'regular'}
                          className={star <= ratingInput ? 'text-amber-400' : 'text-zinc-300 dark:text-zinc-700'}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-500 ml-2">
                      {ratingInput === 5 ? 'Tuyệt vời' : ratingInput === 4 ? 'Hài lòng' : ratingInput === 3 ? 'Bình thường' : ratingInput === 2 ? 'Không hài lòng' : 'Rất tệ'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-1.5">
                    Nội dung nhận xét & góp ý *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Hãy chia sẻ cảm nhận của bạn về chất lượng dịch vụ, tốc độ phản hồi và uy tín của gian hàng..."
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    className="w-full p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting || !commentInput.trim()}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PaperPlaneRight size={14} weight="bold" />
                    <span>{reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
