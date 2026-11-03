import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { productService, type ProductItem } from '../../../services/productService'
import { useCartStore } from '../../../store/cartStore'
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { productImageService } from '../../../services/productImageService'
import { reviewService } from '../../../services/reviewService'
import { favoriteService } from '../../../services/favoriteService'
import { shopFollowerService } from '../../../services/shopFollowerService'
import { ProductGalleryViewer } from '../components/ProductGalleryViewer'
import { ProductInfoActions } from '../components/ProductInfoActions'
import { ProductShopCard } from '../components/ProductShopCard'
import { ProductTabsContent } from '../components/ProductTabsContent'

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { addItem } = useCartStore()

  const [product, setProduct] = useState<ProductItem | null>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const productSpecsList = useMemo(() => {
    if (!product) return []
    if (product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0) {
      return product.specifications.filter(s => s && s.name && s.value && String(s.name).trim() && String(s.value).trim())
    }
    if (product.specs) {
      if (product.specs instanceof Map) {
        return Array.from(product.specs.entries())
          .filter(([k, v]) => k && v && String(k).trim() && String(v).trim())
          .map(([name, value]) => ({ name: String(name).trim(), value: String(value).trim() }))
      }
      if (typeof product.specs === 'object') {
        return Object.entries(product.specs)
          .filter(([k, v]) => k && v && String(k).trim() && String(v).trim())
          .map(([name, value]) => ({ name: String(name).trim(), value: String(value).trim() }))
      }
    }
    return []
  }, [product])

  const [isFavorite, setIsFavorite] = useState<boolean>(false)
  const [isFollowingShop, setIsFollowingShop] = useState<boolean>(false)
  const [shopFollowersCount, setShopFollowersCount] = useState<number>(0)

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
          try {
            const imgData = await productImageService.getProductImages(String(pId))
            if (imgData.images && imgData.images.length > 0) {
              setProductImages(imgData.images.map(img => img.imageUrl))
            }
          } catch {}

          loadReviews(String(pId))

          try {
            const token = localStorage.getItem('token')
            if (token) {
              const favs = await favoriteService.getMyFavorites()
              const found = favs.some((f: any) => (f.product_id?._id || f.productId?._id || f.product_id || f.productId) === pId)
              setIsFavorite(found)
            }
          } catch {}

          const sId = typeof data.shopId === 'object' ? data.shopId?._id : data.shopId
          if (sId) {
            shopFollowerService.checkFollowStatus(sId)
              .then((res: any) => {
                setShopFollowersCount(res.followersCount || res.totalFollowers || 0)
                setIsFollowingShop(res.isFollowing || false)
              })
              .catch(() => {})
          }
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const loadReviews = async (pId: string) => {
    try {
      const data = await reviewService.getProductReviews(pId)
      setReviewsData(data)
      const token = localStorage.getItem('token')
      if (token) {
        const eligible = await reviewService.checkEligibility(pId)
        setIsEligibleReview(eligible.isEligible)
      }
    } catch {}
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleIncrement = () => {
    if (product && quantity < product.stock) {
      setQuantity(q => q + 1)
    }
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1)
    }
  }

  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    if (!product) return
    setIsAdding(true)
    try {
      await addItem({
        id: product._id || product.id,
        productId: product._id || product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.oldPrice || product.price,
        imageEmoji: productImages[0] || product.imageEmoji || product.gallery?.[0] || '💻',
        brand: product.brand || 'CHÍNH HÃNG',
        discount: product.discount || '',
        category: product.categoryName || product.category || 'Phụ kiện',
        categoryName: product.categoryName || product.category || 'Phụ kiện',
        shopName: typeof product.shopId === 'object' ? (product.shopId.shopName || product.shopId.name || 'GEARTECH') : 'GEARTECH',
        shopId: typeof product.shopId === 'object' ? (product.shopId._id || product.shopId.id) : (product.shopId || ''),
        quantity: quantity,
        stock: product.stock
      })
      showToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng thành công!`)
    } catch {
      showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại!')
    } finally {
      setIsAdding(false)
    }
  }

  const handleBuyNow = async () => {
    if (!product) return
    await handleAddToCart()
    navigate('/checkout')
  }

  const handleToggleFavorite = async () => {
    if (!product) return
    const pId = product._id || product.id
    if (!pId) return
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích!')
      return
    }

    try {
      if (isFavorite) {
        await favoriteService.removeFavorite(String(pId))
        setIsFavorite(false)
        showToast('Đã xóa khỏi danh sách yêu thích!')
      } else {
        await favoriteService.addFavorite(String(pId))
        setIsFavorite(true)
        showToast('Đã thêm vào danh sách yêu thích!')
      }
    } catch {
      showToast('Lỗi khi thao tác yêu thích!')
    }
  }

  const handleToggleFollowShop = async () => {
    if (!product) return
    const sId = typeof product.shopId === 'object' ? product.shopId?._id : product.shopId
    if (!sId) return
    const token = localStorage.getItem('token')
    if (!token) {
      showToast('Vui lòng đăng nhập để theo dõi cửa hàng!')
      return
    }

    try {
      if (isFollowingShop) {
        await shopFollowerService.unfollowShop(String(sId))
        setIsFollowingShop(false)
        setShopFollowersCount(c => Math.max(0, c - 1))
        showToast('Đã hủy theo dõi cửa hàng!')
      } else {
        await shopFollowerService.followShop(String(sId))
        setIsFollowingShop(true)
        setShopFollowersCount(c => c + 1)
        showToast('Đã theo dõi cửa hàng!')
      }
    } catch {
      showToast('Lỗi khi thao tác theo dõi cửa hàng!')
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return
    const pId = product._id || product.id
    if (!pId) return

    setIsSubmittingReview(true)
    setReviewMsg(null)
    try {
      const res = await reviewService.submitReview({
        productId: String(pId),
        rating: userReviewRating,
        comment: userReviewComment
      })
      setReviewMsg({ type: 'success', text: res.message || 'Gửi đánh giá thành công!' })
      setUserReviewComment('')
      loadReviews(String(pId))
    } catch (err: any) {
      setReviewMsg({
        type: 'error',
        text: err.response?.data?.error || 'Có lỗi xảy ra khi gửi đánh giá.'
      })
    } finally {
      setIsSubmittingReview(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h2 className="text-lg font-black uppercase text-zinc-900 dark:text-white">Không tìm thấy sản phẩm</h2>
          <p className="text-xs text-zinc-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã ngừng kinh doanh.</p>
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

  const shopIdValue = typeof product.shopId === 'object' ? (product.shopId._id || product.shopId.id) : (product.shopId || '')
  const shopName = typeof product.shopId === 'object' ? (product.shopId.shopName || product.shopId.name || 'GEARTECH') : 'GEARTECH Official'
  const shopLogo = typeof product.shopId === 'object' ? (product.shopId.logoUrl || '🏬') : '🏬'
  const shopRating = typeof product.shopId === 'object' ? (product.shopId.rating || 5.0) : 5.0

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 py-8 px-4 sm:px-6 lg:px-8 relative">
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
          <div className="lg:col-span-6">
            <ProductGalleryViewer
              title={product.title}
              discount={product.discount}
              productImages={productImages}
              selectedImageIndex={selectedImageIndex}
              fallbackImage={product.imageEmoji || product.gallery?.[0]}
              isFavorite={isFavorite}
              onSelectImage={setSelectedImageIndex}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>

          {/* Right Column: Product Info, Actions, Shop Card, Tabs */}
          <div className="lg:col-span-6 space-y-6">
            <ProductInfoActions
              product={product}
              averageRating={reviewsData.averageRating || product.rating || 5.0}
              totalReviews={reviewsData.totalReviews || product.reviewsCount || 0}
              quantity={quantity}
              isAdding={isAdding}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onAddToCart={handleAddToCart}
              onBuyNow={handleBuyNow}
            />

            <ProductShopCard
              shopLogo={shopLogo}
              shopName={shopName}
              shopRating={shopRating}
              shopFollowersCount={shopFollowersCount}
              isFollowingShop={isFollowingShop}
              shopIdValue={shopIdValue || ''}
              onToggleFollowShop={handleToggleFollowShop}
            />

            <ProductTabsContent
              product={product}
              shopName={shopName}
              productSpecsList={productSpecsList}
              activeTab={activeTab}
              reviewsData={reviewsData}
              isEligibleReview={isEligibleReview}
              userReviewRating={userReviewRating}
              userReviewComment={userReviewComment}
              isSubmittingReview={isSubmittingReview}
              reviewMsg={reviewMsg}
              onTabChange={setActiveTab}
              onRatingChange={setUserReviewRating}
              onCommentChange={setUserReviewComment}
              onSubmitReview={handleSubmitReview}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
