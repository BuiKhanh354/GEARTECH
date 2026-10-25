import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { productService, type ProductItem } from '../../../services/productService'
import { useCartStore } from '../../../store/cartStore'
import { formatPrice } from '../../../utils/format'
import { 
  Star, 
  ShoppingCart, 
  ShoppingBag, 
  ArrowLeft, 
  Storefront, 
  Plus, 
  Minus,
  CheckCircle,
  Heart,
  UserCheck,
  UserPlus,
  ChatCircleDots,
  Warning,
  PaperPlaneTilt
} from '@phosphor-icons/react'
import { productImageService } from '../../../services/productImageService'
import { SafeProductImage } from '../../../components/common/ProductImage'
import { reviewService } from '../../../services/reviewService'
import { favoriteService } from '../../../services/favoriteService'
import { shopFollowerService } from '../../../services/shopFollowerService'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  // Real Database Product State
  const [product, setProduct] = useState<ProductItem | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // 3.16 Favorites State
  const [isFavorite, setIsFavorite] = useState<boolean>(false)

  // 3.18 Shop Follower State
  const [isFollowingShop, setIsFollowingShop] = useState<boolean>(false)
  const [shopFollowersCount, setShopFollowersCount] = useState<number>(0)

  // 3.15 Reviews State
  const [reviewsData, setReviewsData] = useState<any>({ reviews: [], totalReviews: 0, averageRating: 5.0, starCounts: {} })
  const [isEligibleReview, setIsEligibleReview] = useState<boolean>(false)
  const [userReviewRating, setUserReviewRating] = useState<number>(5)
  const [userReviewComment, setUserReviewComment] = useState<string>('')
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false)
  const [reviewMsg, setReviewMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    productService.getProductById(id)
      .then(async data => {
        setProduct(data)
        const pId = data._id || data.id
        if (pId) {
          // 1. Tải ảnh gallery
          try {
            const imgData = await productImageService.getProductImages(String(pId))
            if (imgData.images && imgData.images.length > 0) {
              setProductImages(imgData.images.map(img => img.imageUrl))
            }
          } catch {}

          // 2. Tải reviews
          loadReviews(String(pId))

          // 3. Kiểm tra favorite
          favoriteService.checkFavorite(String(pId))
            .then(res => setIsFavorite(res.isFavorite))
            .catch(() => {})

          // 4. Kiểm tra shop follow
          const sId = typeof data.shopId === 'object' ? data.shopId._id : data.shopId
          if (sId) {
            shopFollowerService.checkFollowStatus(String(sId))
              .then(res => {
                setIsFollowingShop(res.isFollowing)
                setShopFollowersCount(res.followersCount)
              })
              .catch(() => {})
          }
        }
      })
      .catch(err => {
        console.error('Lỗi khi tải chi tiết sản phẩm:', err)
      })
      .finally(() => setLoading(false))
  }, [id])

  const loadReviews = async (productId: string) => {
    try {
      const data = await reviewService.getProductReviews(productId)
      setReviewsData(data)
      const elig = await reviewService.checkEligibility(productId)
      setIsEligibleReview(elig.eligible)
      if (elig.review) {
        setUserReviewRating(elig.review.rating)
        setUserReviewComment(elig.review.comment)
      }
    } catch {}
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    const pId = String(product._id || product.id)
    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(pId)
        setIsFavorite(false)
        setToastMessage('Đã bỏ sản phẩm khỏi danh sách yêu thích.')
      } else {
        await favoriteService.addFavorite(pId)
        setIsFavorite(true)
        setToastMessage('Đã thêm sản phẩm vào danh sách yêu thích!')
      }
    } catch {
      setToastMessage('Vui lòng đăng nhập để lưu sản phẩm yêu thích!')
    }
  }

  const handleToggleFollowShop = async () => {
    if (!product) return
    const sId = String(typeof product.shopId === 'object' ? product.shopId._id : product.shopId)
    if (!sId) return
    try {
      if (isFollowingShop) {
        const res = await shopFollowerService.unfollowShop(sId)
        setIsFollowingShop(false)
        setShopFollowersCount(res.followersCount)
        setToastMessage('Đã bỏ theo dõi cửa hàng.')
      } else {
        const res = await shopFollowerService.followShop(sId)
        setIsFollowingShop(true)
        setShopFollowersCount(res.followersCount)
        setToastMessage('Đã theo dõi cửa hàng thành công!')
      }
    } catch {
      setToastMessage('Vui lòng đăng nhập để theo dõi cửa hàng!')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    const pId = String(product._id || product.id)
    try {
      setIsSubmittingReview(true)
      setReviewMsg(null)
      const res = await reviewService.submitReview({
        productId: pId,
        rating: userReviewRating,
        comment: userReviewComment
      })
      setReviewMsg({ type: 'success', text: res.message || 'Gửi đánh giá thành công!' })
      await loadReviews(pId)
    } catch (err: any) {
      setReviewMsg({ type: 'error', text: err.response?.data?.error || 'Lỗi gửi đánh giá.' })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const handleIncrement = () => {
    setQuantity(prev => prev + 1)
  }

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!product || isAdding) return
    if (product.status !== 'active' || product.stock <= 0) {
      setToastMessage('Sản phẩm hiện không thể đặt mua.')
      return
    }
    const finalPrice = product.price
    const imageUrl = productImages.length > 0 ? productImages[0] : (product.imageEmoji || '📦')
    const finalQty = Math.min(product.stock || 999, Math.max(1, quantity))

    setIsAdding(true)
    try {
      await addItem({
        id: product._id || product.id,
        productId: product._id || product.id,
        title: product.title,
        price: finalPrice,
        oldPrice: product.oldPrice,
        originalPrice: product.oldPrice,
        imageEmoji: imageUrl,
        quantity: finalQty,
        shop: typeof product.shopId === 'object' ? (product.shopId.shopName || product.shopId.name || 'GEARTECH') : 'GEARTECH',
        brand: product.brand || 'CHÍNH HÃNG',
        stock: product.stock,
        status: product.status
      }, finalQty, 'Tiêu chuẩn / Chính hãng')

      setToastMessage(`Đã thêm ${finalQty} sản phẩm vào giỏ hàng!`)
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (isAdding) return
    await handleAddToCart()
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-black uppercase text-zinc-600 dark:text-zinc-400 tracking-widest">// ĐANG TẢI DỮ LIỆU THIẾT BỊ TỪ DATABASE...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center space-y-4 shadow-xl">
          <div className="text-4xl">⚠️</div>
          <h2 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-widest">Không tìm thấy sản phẩm</h2>
          <p className="text-xs text-zinc-500">Sản phẩm này có thể đã bị xóa hoặc tạm dừng hiển thị từ cửa hàng.</p>
          <Link
            to="/ProductPage"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff4655] text-white text-xs font-black uppercase tracking-wider rounded transition-transform active:scale-95"
          >
            <ArrowLeft size={16} /> Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  // Shop details
  const shopIdValue = typeof product.shopId === 'object' ? (product.shopId._id || product.shopId.id) : (product.shopId || '')
  const shopName = typeof product.shopId === 'object' ? (product.shopId.shopName || product.shopId.name || 'GEARTECH') : 'GEARTECH Official'
  const shopLogo = typeof product.shopId === 'object' ? (product.shopId.logoUrl || '🏬') : '🏬'
  const shopRating = typeof product.shopId === 'object' ? (product.shopId.rating || 5.0) : 5.0

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-[#ff4655] text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-black uppercase tracking-wider"
          >
            <CheckCircle size={20} weight="bold" />
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage(null)} className="ml-2 hover:opacity-75">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <Link to="/ProductPage" className="hover:text-[#ff4655] flex items-center gap-1 transition-colors">
            <ArrowLeft size={12} /> Sản phẩm
          </Link>
          <span>/</span>
          <span className="text-zinc-500">{product.categoryName || product.category}</span>
          <span>/</span>
          <span className="text-zinc-800 dark:text-white truncate max-w-xs">{product.title}</span>
        </div>

        {/* Main Product Layout: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Gallery Images */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Showcase Image */}
            <div className="relative aspect-square bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex items-center justify-center p-6 shadow-sm dark:shadow-xl group">
              <SafeProductImage
                src={productImages[selectedImageIndex] || product.imageEmoji || product.gallery?.[0]}
                alt={product.title}
                className="w-full h-full object-contain filter group-hover:scale-105 transition-transform duration-500"
              />

              {product.discount && (
                <div className="absolute top-4 left-4 bg-[#ff4655] text-white font-black text-[10px] uppercase px-3 py-1 rounded shadow-md tracking-wider">
                  GIẢM {product.discount}
                </div>
              )}

              {/* 3.16 Nút Yêu thích (Heart) */}
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-4 right-4 p-2.5 rounded-full border transition-all shadow-md ${
                  isFavorite
                    ? 'bg-[#ff4655] border-[#ff4655] text-white'
                    : 'bg-white/80 dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-[#ff4655]'
                }`}
                title={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích sản phẩm'}
              >
                <Heart size={18} weight={isFavorite ? 'fill' : 'regular'} />
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-white dark:bg-zinc-900 shrink-0 p-1 transition-all ${
                      selectedImageIndex === idx 
                        ? 'border-[#ff4655] shadow-md scale-105' 
                        : 'border-zinc-200 dark:border-zinc-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <SafeProductImage src={img} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Product Info & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 tracking-wider">
                  {product.brand || 'CHÍNH HÃNG'}
                </span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[#ff4655] tracking-wider">
                  {product.categoryName}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-zinc-900 dark:text-white leading-tight">
                {product.title}
              </h1>

              {/* Rating & Sales */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star size={14} weight="fill" />
                  <span>{reviewsData.averageRating || product.rating || 5.0}</span>
                </div>
                <span className="text-zinc-400">|</span>
                <span className="text-zinc-500 font-medium">{reviewsData.totalReviews || product.reviewsCount || 0} Đánh giá</span>
                <span className="text-zinc-400">|</span>
                <span className="text-emerald-500 font-bold font-mono">{product.salesCount || 'ĐÃ BÁN 0'}</span>
              </div>
            </div>

            {/* Price Showcase */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-baseline gap-4 shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-[#ff4655]">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="bg-red-500/10 text-[#ff4655] border border-red-500/20 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                    Tiết kiệm {formatPrice(product.oldPrice - product.price)}
                  </span>
                </div>
              )}
            </div>

            {/* Quantity Selector */}
            {product.status === 'active' && product.stock > 0 && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Số lượng:</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 p-1">
                    <button
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center text-xs font-black">{quantity}</span>
                    <button
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    (Còn <strong className="text-emerald-500 font-bold">{product.stock}</strong> thiết bị trong kho)
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons (Add to Cart / Buy Now) */}
            {product.status === 'hidden' || product.status === 'inactive' ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center text-xs font-bold text-amber-500 uppercase tracking-wider">
                <span>⚠️ SẢN PHẨM HIỆN ĐANG TẠM NGỪNG KINH DOANH</span>
              </div>
            ) : product.status === 'out_of_stock' || product.stock <= 0 ? (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-center text-xs font-bold text-rose-500 uppercase tracking-wider">
                <span>✕ SẢN PHẨM TẠM THỜI HẾT HÀNG TRONG KHO</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isAdding}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 text-zinc-800 dark:text-zinc-200 font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-98 shadow-sm cursor-pointer"
                >
                  <ShoppingCart size={17} weight="bold" className="text-[#ff4655]" /> {isAdding ? 'ĐANG THÊM...' : 'THÊM VÀO GIỎ'}
                </button>
                
                <button 
                  type="button"
                  onClick={handleBuyNow}
                  disabled={isAdding}
                  className="flex-1 bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded-xl transition-all shadow-lg shadow-[#ff4655]/25 hover:shadow-xl hover:shadow-[#ff4655]/40 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <ShoppingBag size={17} weight="bold" /> {isAdding ? 'ĐANG XỬ LÝ...' : 'MUA NGAY'}
                </button>
              </div>
            )}

            {/* 3.18 Shop Owner Info Card */}
            <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                  {shopLogo}
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-wider">
                    {shopName}
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-[#ff4655] text-white">CHÍNH HÃNG</span>
                  </h4>
                  <div className="flex gap-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                    <span className="text-amber-500">★ {shopRating} ĐÁNH GIÁ</span>
                    <span>{shopFollowersCount} FOLLOWER</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleFollowShop}
                  className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all ${
                    isFollowingShop
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      : 'bg-[#ff4655] text-white'
                  }`}
                >
                  {isFollowingShop ? <UserCheck size={14} /> : <UserPlus size={14} />}
                  {isFollowingShop ? 'Đang theo dõi' : 'Theo dõi shop'}
                </button>
                <Link
                  to={shopIdValue ? `/shop/${shopIdValue}` : `/ProductPage?search=${encodeURIComponent(shopName)}`}
                  className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded text-zinc-600 dark:text-zinc-400 hover:text-white transition-colors"
                >
                  <Storefront size={14} /> Xem Shop
                </Link>
              </div>
            </div>

            {/* Tabs Details Card (Description / Specs / 3.15 Reviews) */}
            <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded border border-zinc-200 dark:border-zinc-850 self-start w-fit">
                <button
                  onClick={() => setActiveTab('desc')}
                  className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all ${
                    activeTab === 'desc'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Mô tả sản phẩm
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all ${
                    activeTab === 'specs'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  Thông số kỹ thuật
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'bg-white dark:bg-zinc-900 text-[#ff4655] shadow-sm border border-zinc-200 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <ChatCircleDots size={13} />
                  Đánh giá ({reviewsData.totalReviews || 0})
                </button>
              </div>

              {/* Tab 1: Description */}
              {activeTab === 'desc' && (
                <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2">
                  <p className="whitespace-pre-line font-semibold leading-relaxed tracking-wide">{product.description}</p>
                </div>
              )}

              {/* Tab 2: Specs */}
              {activeTab === 'specs' && (
                <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-2">
                  <table className="w-full border-collapse text-xs font-semibold uppercase tracking-wider">
                    <tbody>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-bold text-zinc-400 w-1/3">// PHÂN LOẠI</td>
                        <td className="py-3 text-zinc-800 dark:text-white">{product.categoryName}</td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-bold text-zinc-400">// GIAN HÀNG</td>
                        <td className="py-3 text-zinc-800 dark:text-white">{shopName}</td>
                      </tr>
                      <tr className="border-b border-zinc-100 dark:border-zinc-900">
                        <td className="py-3 font-bold text-zinc-400">// MÃ SKU</td>
                        <td className="py-3 text-zinc-800 dark:text-white">{product.sku || product._id?.slice(-8).toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-bold text-zinc-400">// TỒN KHO</td>
                        <td className="py-3 text-emerald-500 font-extrabold">{product.stock > 0 ? `CÒN HÀNG (${product.stock})` : 'HẾT HÀNG'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab 3: Reviews (3.15) */}
              {activeTab === 'reviews' && (
                <div className="space-y-6 pt-2">
                  {/* Rating Summary */}
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-[#ff4655]">
                        {reviewsData.averageRating} <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
                      </div>
                      <div className="flex gap-1 text-amber-500 text-sm mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            size={14} 
                            weight={star <= Math.round(reviewsData.averageRating) ? 'fill' : 'regular'} 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block">Dựa trên {reviewsData.totalReviews} đánh giá thực tế</span>
                    </div>

                    <div className="text-right text-[10px] text-zinc-400 space-y-0.5">
                      <div>5★: {reviewsData.starCounts?.[5] || 0}</div>
                      <div>4★: {reviewsData.starCounts?.[4] || 0}</div>
                      <div>3★: {reviewsData.starCounts?.[3] || 0}</div>
                    </div>
                  </div>

                  {/* Form Viết đánh giá (Nếu đủ điều kiện mua hàng) */}
                  {isEligibleReview ? (
                    <form onSubmit={handleSubmitReview} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                      <div className="text-xs font-bold uppercase text-zinc-900 dark:text-white">
                        Viết đánh giá của bạn (Khách hàng đã mua hàng)
                      </div>

                      {reviewMsg && (
                        <div className={`p-2.5 rounded text-xs font-semibold ${
                          reviewMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                        }`}>
                          {reviewMsg.text}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 font-bold uppercase">Đánh giá sao:</span>
                        <div className="flex gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setUserReviewRating(s)}
                              className="hover:scale-125 transition-transform"
                            >
                              <Star size={18} weight={s <= userReviewRating ? 'fill' : 'regular'} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={userReviewComment}
                        onChange={(e) => setUserReviewComment(e.target.value)}
                        placeholder="Chia sẻ trải nghiệm sử dụng thiết bị của bạn..."
                        className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white resize-none h-20"
                        required
                      />

                      <button
                        type="submit"
                        disabled={isSubmittingReview}
                        className="px-4 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 shadow-sm"
                      >
                        <PaperPlaneTilt size={13} weight="bold" />
                        {isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded text-[11px] text-zinc-500 flex items-center gap-2">
                      <Warning size={14} className="text-amber-500 shrink-0" />
                      <span>Chỉ những khách hàng đã mua sản phẩm này trong đơn hàng đã hoàn tất mới có thể gửi đánh giá.</span>
                    </div>
                  )}

                  {/* Danh sách đánh giá */}
                  <div className="space-y-3">
                    {reviewsData.reviews?.length === 0 ? (
                      <div className="text-center py-8 text-xs text-zinc-500">
                        Chưa có nhận xét nào cho thiết bị này. Hãy là người đầu tiên trải nghiệm!
                      </div>
                    ) : (
                      reviewsData.reviews?.map((rev: any) => (
                        <div key={rev._id} className="p-3.5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-zinc-900 dark:text-white">
                              {rev.user_id?.name || rev.userId?.name || 'Khách hàng GearTech'}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}
                            </span>
                          </div>

                          <div className="flex text-amber-500 text-xs gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} weight={s <= rev.rating ? 'fill' : 'regular'} />
                            ))}
                          </div>

                          <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                            {rev.comment}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
