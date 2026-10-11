import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { 
  mockProducts 
} from '../data/productsData'
import { formatPrice } from '../../../utils/format'
import { 
  Funnel, 
  Star, 
  Trash, 
  CaretLeft, 
  CaretRight,
  ArrowsDownUp,
  MagnifyingGlass
} from '@phosphor-icons/react'

const isImageUrl = (str: string) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('data:image/')
}

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''

  // Filters State (Linked to URL query search params)
  const categoryQuery = searchParams.get('category') || 'all'
  const selectedCategory = categoryQuery
  const setSelectedCategory = (val: string) => {
    setSearchParams(prev => {
      if (val === 'all') {
        prev.delete('category')
      } else {
        prev.set('category', val)
      }
      return prev
    }, { replace: true })
  }
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  
  // Sort State
  const [sortBy, setSortBy] = useState<string>('popular') // popular, priceAsc, priceDesc, reviews

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 6

  // Categories list
  const categoriesList = [
    { value: 'all', label: 'TẤT CẢ SẢN PHẨM' },
    {value : 'brand', label: 'Hãng máy'},
    { value: 'laptops', label: 'LAPTOP & MACBOOK' },
    { value: 'desktops', label: 'PC & WORKSTATION' },
    { value: 'components', label: 'LINH KIỆN MÁY TÍNH' },
    { value: 'monitors', label: 'MÀN HÌNH MÁY TÍNH' },
    { value: 'peripherals', label: 'BÀN PHÍM & CHUỘT' },
    { value: 'audio', label: 'TAI NGHE & LOA' },
    { value: 'smart-devices', label: 'THIẾT BỊ THÔNG MINH' },
    { value: 'accessories', label: 'PHỤ KIỆN CÔNG NGHỆ' }
  ]

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...mockProducts]

    // 1. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.categoryName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      )
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory)
    }

    // 3. Price Filter
    if (minPrice) {
      result = result.filter(p => p.price >= Number(minPrice))
    }
    if (maxPrice) {
      result = result.filter(p => p.price <= Number(maxPrice))
    }

    // 4. Rating Filter
    if (selectedRating !== null) {
      result = result.filter(p => p.rating >= selectedRating)
    }

    // 5. Sorting Logic
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewsCount - a.reviewsCount)
    } else {
      // popular / rating
      result.sort((a, b) => b.rating - a.rating)
    }

    return result
  }, [selectedCategory, minPrice, maxPrice, selectedRating, sortBy, searchQuery])

  // Reset all filters
  const handleResetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedRating(null)
    setSortBy('popular')
    setCurrentPage(1)
    setSearchParams({})
  }

  // Pagination Logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredProducts.slice(start, start + itemsPerPage)
  }, [filteredProducts, currentPage])


  const renderStars = (rating: number) => {
    const stars = []
    const floor = Math.floor(rating)
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={12} 
          weight={i <= floor ? 'fill' : 'regular'} 
          className={i <= floor ? 'text-amber-500' : 'text-zinc-305 dark:text-zinc-700'} 
        />
      )
    }
    return stars
  }

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 space-y-6 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Search status header */}
      {searchQuery && (
        <div className="bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] p-4 rounded flex items-center justify-between shadow-[0_0_15px_rgba(255,70,85,0.05)]">
          <p className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
            <MagnifyingGlass size={16} /> // KẾT QUẢ TÌM KIẾM CHO: <span className="underline text-zinc-900 dark:text-white font-black">"{searchQuery}"</span> // ({filteredProducts.length} THIẾT BỊ)
          </p>
          <button 
            onClick={handleResetFilters}
            className="text-[10px] uppercase font-black tracking-widest bg-[#ff4655] text-white px-3 py-1.5 rounded hover:bg-[#e03d4b] transition-all"
          >
            Đặt lại
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Left Column: Filter Sidebar (Minimalist High-Tech Console Style) */}
        <aside className="w-full md:w-64 shrink-0 bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-900 rounded-2xl p-5 space-y-6 relative overflow-hidden shadow-sm dark:shadow-2xl">
          
          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900/60 pb-3.5 pl-1">
            <div className="flex flex-col">
              {/* <span className="text-[7px] font-mono text-zinc-450 dark:text-zinc-650 uppercase tracking-[0.25em] leading-none">// CONFIG_LOCATOR</span> */}
              <h3 className="text-xs font-black tracking-widest text-zinc-900 dark:text-white uppercase flex items-center gap-1.5 mt-1.5">
                <Funnel size={12} className="text-[#ff4655]" /> BỘ LỌC THIẾT BỊ
              </h3>
            </div>
            {(selectedCategory !== 'all' || minPrice || maxPrice || selectedRating !== null || searchQuery) && (
              <button 
                onClick={handleResetFilters}
                className="text-[9px] font-black tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 uppercase"
                title="Xóa bộ lọc"
              >
                <Trash size={12} /> XÓA
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-3 pl-1">
            <h4 className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">// CATEGORIES</h4>
            <div className="flex flex-col space-y-1">
              {categoriesList.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => {
                    setSelectedCategory(cat.value)
                    setCurrentPage(1)
                  }}
                  className={`text-[9px] text-left px-3 py-2.5 rounded-md transition-all duration-150 font-black uppercase tracking-wider border-l-2 ${
                    selectedCategory === cat.value
                      ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655] border-y-zinc-900/5 dark:border-y-zinc-800/10 border-r-transparent text-glow'
                      : 'border-l-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white hover:border-l-zinc-300 dark:hover:border-l-zinc-850'
                  }`}
                >
                  {selectedCategory === cat.value ? `[x] ${cat.label}` : `[ ] ${cat.label}`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 pl-1">
            <h4 className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">// VALUE_RANGE</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider">MIN_VND</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="TỪ"
                  className="w-full text-[10px] font-mono pl-2.5 pr-2.5 pt-4 pb-2 border border-zinc-200 dark:border-zinc-850 rounded bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655]"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2.5 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-600 tracking-wider">MAX_VND</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value)
                    setCurrentPage(1)
                  }}
                  placeholder="ĐẾN"
                  className="w-full text-[10px] font-mono pl-2.5 pr-2.5 pt-4 pb-2 border border-zinc-200 dark:border-zinc-850 rounded bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white placeholder-zinc-300 dark:placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655]"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 pl-1">
            <h4 className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">// QUALITY_RATING</h4>
            <div className="flex flex-col space-y-1">
              {[5, 4, 3].map((stars) => (
                <button
                  key={stars}
                  onClick={() => {
                    setSelectedRating(selectedRating === stars ? null : stars)
                    setCurrentPage(1)
                  }}
                  className={`flex items-center justify-between text-[9px] font-black uppercase tracking-wider px-3.5 py-2.5 rounded-md transition-all border-l-2 ${
                    selectedRating === stars
                      ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655] border-y-zinc-900/5 dark:border-y-zinc-800/10 border-r-transparent text-glow'
                      : 'border-l-transparent text-zinc-500 dark:text-zinc-450 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white hover:border-l-zinc-300 dark:hover:border-l-zinc-850'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {renderStars(stars)}
                    <span className="text-[8px] font-bold text-zinc-450 dark:text-zinc-550 ml-1">{stars === 5 ? 'S_RANK' : 'UP'}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* System Check Footer */}
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-between text-[7px] font-mono text-zinc-400 dark:text-zinc-650 uppercase tracking-widest pl-1">
            <span>STATUS: READY</span>
            <span>FILTER_MOD_V1</span>
          </div>

        </aside>

        {/* Right Column: Sort and Products Grid */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Sorting / Meta Header */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm dark:shadow-xl">
            <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
              HIỂN THỊ {filteredProducts.length === 0 ? '0' : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, filteredProducts.length)}`} TRONG {filteredProducts.length} THIẾT BỊ
            </span>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <ArrowsDownUp size={12} /> SẮP XẾP:
              </span>
              <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded border border-zinc-200 dark:border-zinc-850">
                <button
                  onClick={() => setSortBy('popular')}
                  className={`text-[9px] px-3 py-1.5 rounded font-black uppercase tracking-widest transition-all ${
                    sortBy === 'popular'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                  }`}
                >
                  Đánh giá cao
                </button>
                <button
                  onClick={() => setSortBy('priceAsc')}
                  className={`text-[9px] px-3 py-1.5 rounded font-black uppercase tracking-widest transition-all ${
                    sortBy === 'priceAsc'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                  }`}
                >
                  Giá tăng dần
                </button>
                <button
                  onClick={() => setSortBy('priceDesc')}
                  className={`text-[9px] px-3 py-1.5 rounded font-black uppercase tracking-widest transition-all ${
                    sortBy === 'priceDesc'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-250 dark:border-zinc-800'
                      : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                  }`}
                >
                  Giá giảm dần
                </button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <AnimatePresence mode="popLayout">
            {paginatedProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-4 shadow-sm dark:shadow-xl"
              >
                <span className="text-5xl block">⚙️</span>
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-widest">// KHÔNG TÌM THẤY THIẾT BỊ NÀO KHỚP</h3>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-sm mx-auto font-semibold">Hãy thử thay đổi danh mục chọn, xóa khoảng giá hoặc bấm nút đặt lại bộ lọc bên dưới để tải lại dữ liệu.</p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)]"
                >
                  Đặt lại bộ lọc
                </button>
              </motion.div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {paginatedProducts.map((prod) => (
                  <motion.div
                    layout
                    key={prod.id}
                    whileHover={{ y: -6, borderColor: 'rgba(255, 70, 85, 0.3)' }}
                    transition={{ type: 'spring' as const, stiffness: 100 }}
                    className="group bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-neon transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <Link to={`/product/${prod.id}`}>
                      <div className="h-44 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-4xl relative border-b border-zinc-150 dark:border-zinc-900 overflow-hidden">
                        {isImageUrl(prod.imageEmoji) ? (
                          <img src={prod.imageEmoji} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                        ) : (
                          prod.imageEmoji
                        )}
                        {prod.discount && (
                          <span className="absolute top-3 right-3 bg-[#ff4655] text-white text-[10px] font-black px-2 py-0.5 rounded shadow-[0_0_10px_rgba(255,70,85,0.4)]">
                            {prod.discount}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-300 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase tracking-wide">
                          {prod.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="current-price text-sm font-extrabold text-[#ff4655] text-glow">{formatPrice(prod.price)}</span>
                            {prod.oldPrice && (
                              <span className="old-price text-[10px] text-zinc-400 line-through">{formatPrice(prod.oldPrice)}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900/40 mt-1">
                            <div className="flex items-center gap-0.5">
                              {renderStars(prod.rating)}
                              <span className="text-[10px] font-semibold text-amber-500 ml-1">{prod.rating}</span>
                            </div>
                            <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{prod.salesCount}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination Component */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2.5 rounded border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                title="Trang trước"
              >
                <CaretLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded font-black text-xs transition-all border ${
                    currentPage === page
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-[0_0_15px_rgba(255,70,85,0.25)]'
                      : 'border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2.5 rounded border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors"
                title="Trang sau"
              >
                <CaretRight size={16} />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
