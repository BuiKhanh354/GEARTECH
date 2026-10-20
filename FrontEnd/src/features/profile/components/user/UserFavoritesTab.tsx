import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Heart, ShoppingCart, Trash, ArrowRight } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { favoriteService } from '../../../../services/favoriteService'
import { useCartStore } from '../../../../store/cartStore'
import { formatPrice } from '../../../../utils/format'
import { SafeProductImage } from '../../../../components/common/ProductImage'

export default function UserFavoritesTab() {
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const { addItem } = useCartStore()

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await favoriteService.getMyFavorites()
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Lỗi tải danh sách yêu thích:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFavorites()
  }, [])

  const handleRemove = async (productId: string, title: string) => {
    try {
      await favoriteService.removeFavorite(productId)
      setFavorites(prev => prev.filter(f => (f.product_id?._id || f.product_id?.id || f.productId) !== productId))
      setToastMsg(`Đã bỏ "${title}" khỏi danh sách yêu thích.`)
    } catch (err) {
      console.error('Lỗi xóa yêu thích:', err)
    }
  }

  const handleAddToCart = (product: any) => {
    addItem({
      id: product._id || product.id,
      productId: product._id || product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.oldPrice,
      image: product.imageUrl || product.images?.[0] || '📦',
      quantity: 1,
      shop: product.shopId?.shopName || 'GEARTECH',
      brand: product.brand || 'CHÍNH HÃNG'
    })
    setToastMsg(`Đã thêm "${product.title}" vào giỏ hàng!`)
  }

  return (
    <motion.div
      key="favorites-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Heart size={16} weight="fill" className="text-[#ff4655]" />
            DANH SÁCH SẢN PHẨM YÊU THÍCH ({favorites.length})
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">Các thiết bị công nghệ bạn đã lưu lại để theo dõi</p>
        </div>
      </div>

      {toastMsg && (
        <div className="p-3 bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] text-xs rounded font-semibold flex justify-between items-center">
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)}>✕</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-zinc-400">
          <div className="inline-block animate-spin text-xl mb-2">⏳</div>
          <div>Đang tải danh sách yêu thích...</div>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Heart size={36} className="mx-auto text-zinc-400 mb-2 opacity-50" />
          <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">// DANH SÁCH YÊU THÍCH ĐANG TRỐNG</div>
          <p className="text-[10px] text-zinc-400 mt-1">Bấm biểu tượng trái tim ở trang chi tiết sản phẩm để lưu lại</p>
          <Link
            to="/ProductPage"
            className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 bg-[#ff4655] text-white text-[10px] font-black uppercase rounded shadow-sm"
          >
            Khám phá thiết bị <ArrowRight size={12} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((fav) => {
            const p = fav.product_id || {}
            const pId = p._id || p.id || fav.productId

            return (
              <div
                key={fav._id}
                className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden p-3.5 space-y-3 flex flex-col justify-between group hover:border-[#ff4655]/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="relative aspect-square bg-white dark:bg-zinc-950 rounded-lg overflow-hidden flex items-center justify-center p-2 border border-zinc-100 dark:border-zinc-800">
                    <SafeProductImage
                      src={p.imageUrl || p.images?.[0] || p.imageEmoji}
                      alt={p.title || 'Sản phẩm'}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => handleRemove(pId, p.title)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow"
                      title="Xóa khỏi yêu thích"
                    >
                      <Trash size={13} />
                    </button>
                  </div>

                  <div>
                    <span className="text-[9px] font-mono text-zinc-400 block uppercase">
                      {p.brand || 'CHÍNH HÃNG'}
                    </span>
                    <Link
                      to={`/product/${pId}`}
                      className="text-xs font-bold text-zinc-900 dark:text-white hover:text-[#ff4655] line-clamp-2 transition-colors"
                    >
                      {p.title}
                    </Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200/80 dark:border-zinc-800 flex justify-between items-center">
                  <span className="text-xs font-black text-[#ff4655]">
                    {formatPrice(p.price || 0)}
                  </span>

                  <button
                    onClick={() => handleAddToCart(p)}
                    className="p-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 hover:bg-[#ff4655] hover:text-white text-zinc-700 dark:text-zinc-300 transition-colors"
                    title="Thêm vào giỏ hàng"
                  >
                    <ShoppingCart size={14} weight="bold" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
