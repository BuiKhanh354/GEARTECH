import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { mockProducts } from '../data/productsData'
import { formatPrice } from '../../../utils/format'
import { 
  Star, 
  ShoppingCart, 
  ShoppingBag,
  ArrowLeft,
  Storefront,
  ChatCircleText,
  Plus,
  Minus
} from '@phosphor-icons/react'

const isImageUrl = (str: string) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('data:image/')
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()

  // Find product by id
  const product = useMemo(() => {
    return mockProducts.find(p => p.id === id)
  }, [id])

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [quantity, setQuantity] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<'desc' | 'specs'>('desc')

  if (!product) {
    return (
      <div className="w-full text-center py-20 space-y-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-850 dark:text-zinc-300 min-h-screen bg-grid-pattern">
        <span className="text-6xl block">⚠️</span>
        <h2 className="text-lg font-black uppercase tracking-widest text-zinc-800 dark:text-white">// THIẾT BỊ KHÔNG TỒN TẠI</h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto font-semibold">
          Thiết bị bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi hệ thống.
        </p>
        <Link 
          to="/ProductPage"
          className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.5)] active:scale-98"
        >
          <ArrowLeft size={14} weight="bold" /> Quay lại danh sách
        </Link>
      </div>
    )
  }


  const handleIncrement = () => {
    setQuantity(prev => prev + 1)
  }

  const handleDecrement = () => {
    setQuantity(prev => Math.max(prev - 1, 1))
  }

  const renderStars = (rating: number) => {
    const stars = []
    const floor = Math.floor(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={14} 
          weight={i <= floor ? 'fill' : 'regular'} 
          className={i <= floor ? 'text-amber-500' : 'text-zinc-300 dark:text-zinc-700'} 
        />
      )
    }
    return stars
  }

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 space-y-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Breadcrumbs */}
      <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
        <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
        <span>/</span>
        <Link to="/ProductPage" className="hover:text-zinc-900 dark:hover:text-white transition-colors">DANH MỤC THIẾT BỊ</Link>
        <span>/</span>
        <span className="text-[#ff4655] truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Product Detail Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery (Grid-col 5) */}
        <div className="lg:col-span-5 space-y-4 bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>

          {/* Main Large Image Box */}
          <div className="h-80 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl flex items-center justify-center text-7xl select-none relative overflow-hidden border border-zinc-150 dark:border-zinc-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedImageIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                className="w-full h-full flex items-center justify-center"
              >
                {isImageUrl(product.gallery[selectedImageIndex] || product.imageEmoji) ? (
                  <img src={product.gallery[selectedImageIndex] || product.imageEmoji} alt={product.title} className="w-full h-full object-contain max-h-72" />
                ) : (
                  <span className="text-7xl">{product.gallery[selectedImageIndex] || product.imageEmoji}</span>
                )}
              </motion.div>
            </AnimatePresence>
            {product.discount && (
              <span className="absolute top-4 right-4 bg-[#ff4655] text-white text-[10px] font-black px-2.5 py-1 rounded shadow-[0_0_10px_rgba(255,70,85,0.4)]">
                {product.discount}
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          <div className="grid grid-cols-4 gap-3">
            {product.gallery.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`h-16 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl flex items-center justify-center text-3xl border-2 transition-all duration-200 hover:scale-102 overflow-hidden ${
                  selectedImageIndex === index 
                    ? 'border-[#ff4655] ring-2 ring-[#ff4655]/10' 
                    : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-800'
                }`}
              >
                {isImageUrl(img) ? (
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                ) : (
                  img
                )}
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Product Specs & Buy Panel (Grid-col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Info Card */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-mono text-[9px] tracking-widest text-zinc-400 dark:text-zinc-600 select-none">
              SYSTEM CODE // {product.id.toUpperCase()}
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded bg-[#ff4655]/10 text-[#ff4655] text-[9px] font-black uppercase tracking-widest border border-[#ff4655]/20">
              {product.categoryName}
            </span>

            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight uppercase">
              {product.title}
            </h1>

            {/* Ratings & Sales Info */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-155 dark:border-zinc-900 pb-4">
              <div className="flex items-center gap-1">
                <span className="text-amber-500 font-extrabold">{product.rating}</span>
                <div className="flex items-center mr-1">{renderStars(product.rating)}</div>
                <span className="text-zinc-300 dark:text-zinc-800">|</span>
                <span className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors">{product.reviewsCount} ĐÁNH GIÁ</span>
              </div>
              <span className="text-zinc-300 dark:text-zinc-800">|</span>
              <span>{product.salesCount}</span>
            </div>

            {/* Price Box */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 rounded-2xl flex flex-wrap items-baseline gap-3 border border-zinc-150 dark:border-zinc-900">
              <span className="text-2xl sm:text-3xl font-black text-[#ff4655] text-glow">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-sm font-semibold text-zinc-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="text-[10px] font-black bg-red-50 dark:bg-[#ff4655]/10 text-[#ff4655] px-2 py-0.5 rounded border border-red-100 dark:border-[#ff4655]/20">
                    GIẢM {product.discount}
                  </span>
                </>
              )}
            </div>

            {/* Shipping & Quantity selection */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest w-20">// SỐ LƯỢNG:</span>
                <div className="flex items-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-1">
                  <button 
                    onClick={handleDecrement}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-white transition-colors"
                  >
                    <Minus size={12} weight="bold" />
                  </button>
                  <span className="w-12 text-center text-xs font-black text-zinc-800 dark:text-white">
                    {quantity}
                  </span>
                  <button 
                    onClick={handleIncrement}
                    className="p-1.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-850 dark:hover:text-white transition-colors"
                  >
                    <Plus size={12} weight="bold" />
                  </button>
                </div>
              </div>
            </div>

            {/* Buy / Cart Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white text-zinc-650 dark:text-zinc-300 font-bold text-xs uppercase tracking-widest px-6 py-4 rounded transition-all flex items-center justify-center gap-2 group"
              >
                <ShoppingCart size={16} weight="bold" className="text-[#ff4655]" /> THÊM VÀO GIỎ
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.01, boxShadow: '0 0 25px rgba(255, 70, 85, 0.4)' }}
                whileTap={{ scale: 0.99 }}
                className="flex-1 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-6 py-4 rounded transition-all shadow-[0_0_15px_rgba(255, 70, 85, 0.3)] flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} weight="bold" /> MUA NGAY THIẾT BỊ
              </motion.button>
            </div>

          </div>

          {/* Shop Owner Info Card */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-2xl shrink-0">
                {product.shop.logo}
              </div>
              <div>
                <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white flex items-center gap-1.5 tracking-wider">
                  {product.shop.name}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-[#ff4655] text-white">MALL</span>
                </h4>
                <div className="flex gap-3 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                  <span className="text-amber-500">★ {product.shop.rating} ĐÁNH GIÁ</span>
                  <span>{product.shop.followers} FOLLOWER</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded text-zinc-650 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <ChatCircleText size={14} /> Chat ngay
              </button>
              <button className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest border border-zinc-200 dark:border-zinc-800 px-3.5 py-2.5 rounded text-zinc-650 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <Storefront size={14} /> Xem Shop
              </button>
            </div>
          </div>

          {/* Tabs Details Card (Description) */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded border border-zinc-200 dark:border-zinc-850 self-start w-fit">
              <button
                onClick={() => setActiveTab('desc')}
                className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all ${
                  activeTab === 'desc'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                Mô tả sản phẩm
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all ${
                  activeTab === 'specs'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
                    : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                }`}
              >
                Thông số kỹ thuật
              </button>
            </div>

            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2">
              {activeTab === 'desc' ? (
                <p className="whitespace-pre-line font-semibold leading-relaxed tracking-wide">{product.description}</p>
              ) : (
                <table className="w-full border-collapse text-xs font-semibold uppercase tracking-wider">
                  <tbody>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-3.5 font-bold text-zinc-400 dark:text-zinc-500 w-1/3">// PHÂN LOẠI</td>
                      <td className="py-3.5 text-zinc-800 dark:text-white">{product.categoryName}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-3.5 font-bold text-zinc-400 dark:text-zinc-500">// THƯƠNG HIỆU</td>
                      <td className="py-3.5 text-zinc-800 dark:text-white">{product.shop.name}</td>
                    </tr>
                    <tr className="border-b border-zinc-100 dark:border-zinc-900">
                      <td className="py-3.5 font-bold text-zinc-400 dark:text-zinc-500">// MÃ THIẾT BỊ</td>
                      <td className="py-3.5 text-zinc-800 dark:text-white">{product.id.toUpperCase()}</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 font-bold text-zinc-400 dark:text-zinc-500">// TRẠNG THÁI KHU</td>
                      <td className="py-3.5 text-emerald-600 dark:text-emerald-500 font-extrabold">CÒN HÀNG</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
