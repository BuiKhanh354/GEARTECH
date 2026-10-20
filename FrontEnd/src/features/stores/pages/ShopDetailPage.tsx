import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  Storefront, 
  Star, 
  MapPin, 
  Phone, 
  Envelope, 
  Package, 
  ArrowLeft, 
  ShieldCheck, 
  Sparkle 
} from '@phosphor-icons/react'
import { storefrontService, type StorefrontConfig, type StorefrontShopInfo } from '../../../services/storefrontService'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'

export default function ShopDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [shop, setShop] = useState<StorefrontShopInfo | null>(null)
  const [storefront, setStorefront] = useState<StorefrontConfig | null>(null)
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
          className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#ff4655] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          Quay lại danh sách đối tác
        </button>
      </div>
    )
  }

  const primaryColor = storefront?.primaryColor || '#ff4655'
  const template = storefront?.template || 'modern-tech'
  const viewMode = storefront?.viewMode || 'grid'
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
        // 1. SECTION BANNER & HERO
        if (sec.id === 'banner') {
          return (
            <div
              key={sec.id}
              className={`p-6 sm:p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden transition-all ${
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
                      <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider">
                        {shop.name}
                      </h1>
                      <span 
                        style={{ backgroundColor: `${primaryColor}25`, color: primaryColor, borderColor: `${primaryColor}50` }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm"
                      >
                        <ShieldCheck size={12} weight="fill" /> Đối tác xác minh
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-semibold">{shop.category || 'Gian hàng phần cứng chính hãng'}</p>
                    {shop.description && (
                      <p className="text-[11px] text-zinc-400 max-w-xl leading-relaxed">{shop.description}</p>
                    )}
                  </div>
                </div>

                {/* Shop Meta Stats */}
                <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-center shrink-0">
                  <div>
                    <span className="text-[9px] text-white/50 block uppercase tracking-wider">ĐÁNH GIÁ</span>
                    <span className="text-sm font-black text-amber-400 mt-1 block flex items-center justify-center gap-1">
                      <Star size={14} weight="fill" /> {shop.rating || 5.0}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block uppercase tracking-wider">SẢN PHẨM</span>
                    <span className="text-sm font-black text-white mt-1 block">
                      {allProducts.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/50 block uppercase tracking-wider">THEO DÕI</span>
                    <span className="text-sm font-black mt-1 block" style={{ color: primaryColor }}>
                      {shop.followers || '1.5K'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shop Contact details */}
              {(shop.address || shop.phone || shop.email) && (
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-300 relative z-10">
                  {shop.address && (
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <MapPin size={14} style={{ color: primaryColor }} /> {shop.address}
                    </span>
                  )}
                  {shop.phone && (
                    <span className="flex items-center gap-1.5 text-zinc-400">
                      <Phone size={14} style={{ color: primaryColor }} /> {shop.phone}
                    </span>
                  )}
                  {shop.email && (
                    <span className="flex items-center gap-1.5 text-zinc-400 font-mono">
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

        // 4. SECTION MAIN CATALOG
        if (sec.id === 'catalog') {
          return (
            <div key={sec.id} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Package size={18} style={{ color: primaryColor }} />
                  {sec.title} ({allProducts.length})
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1">
                    <Sparkle size={12} style={{ color: primaryColor }} /> Hàng chính hãng 100%
                  </span>
                </div>
              </div>

              {allProducts.length === 0 ? (
                <div className="py-16 text-center text-zinc-400 space-y-2 bg-white dark:bg-zinc-950/40 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <Package size={40} className="mx-auto opacity-30" />
                  <p className="text-xs font-semibold">Gian hàng này chưa đăng tải thiết bị nào.</p>
                </div>
              ) : viewMode === 'list' ? (
                /* List View Rendering */
                <div className="space-y-3">
                  {allProducts.map((prod) => (
                    <motion.div
                      key={prod._id || prod.id}
                      whileHover={{ x: 4 }}
                      onClick={() => navigate(`/product/${prod._id || prod.id}`)}
                      className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 shadow-sm flex items-center justify-between gap-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <span className="w-16 h-16 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-3xl shrink-0 overflow-hidden border border-zinc-100 dark:border-zinc-800">
                          {prod.imageEmoji?.startsWith('http') || prod.imageEmoji?.startsWith('/') ? (
                            <img src={prod.imageEmoji} alt="" className="w-full h-full object-cover" />
                          ) : (
                            prod.imageEmoji || '💻'
                          )}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase truncate">
                            {prod.title || prod.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-zinc-500 font-medium">{prod.category || 'Phần cứng'}</span>
                            {prod.brand && (
                              <>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-[10px] text-zinc-400 font-semibold">{prod.brand}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold block" style={{ color: primaryColor }}>
                          {formatPrice(prod.price)}
                        </span>
                        {prod.oldPrice && (
                          <span className="text-[10px] text-zinc-400 line-through block">
                            {formatPrice(prod.oldPrice)}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Grid View Rendering */
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
    </div>
  )
}
