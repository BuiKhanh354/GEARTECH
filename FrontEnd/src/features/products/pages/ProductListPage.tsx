import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { productService, type ProductItem } from '../../../services/productService'
import { categoryService } from '../../../services/categoryService'
import { brandService, type BrandItem } from '../../../services/brandService'
import { formatPrice } from '../../../utils/format'
import { 
  Funnel, 
  Star, 
  Trash, 
  CaretLeft, 
  CaretRight, 
  CaretDown,
  ArrowsDownUp,
  MagnifyingGlass
} from '@phosphor-icons/react'
import { SafeProductImage } from '../../../components/common/ProductImage'

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get('search') || ''
  const isSaleOnly = searchParams.get('sale') === 'true'

  const setIsSaleOnly = (val: boolean) => {
    setSearchParams(prev => {
      if (!val) {
        prev.delete('sale')
      } else {
        prev.set('sale', 'true')
      }
      return prev
    }, { replace: true })
    setCurrentPage(1)
  }

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
    setCurrentPage(1)
  }

  // Brand Filter State - Yêu cầu 3.4
  const brandQuery = searchParams.get('brand') || 'all'
  const selectedBrand = brandQuery
  const setSelectedBrand = (val: string) => {
    setSearchParams(prev => {
      if (val === 'all') {
        prev.delete('brand')
      } else {
        prev.set('brand', val)
      }
      return prev
    }, { replace: true })
    setCurrentPage(1)
  }
  const [brandsList, setBrandsList] = useState<BrandItem[]>([])

  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  
  // Sort State
  const [sortBy, setSortBy] = useState<string>('popular') // popular, priceAsc, priceDesc, reviews

  // Real Database Products & Pagination State
  const [products, setProducts] = useState<ProductItem[]>([])
  const [totalPages, setTotalPages] = useState<number>(1)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 9

  // Danh mục phân cấp cha - con lấy THẬT từ MongoDB (A2)
  const [categoryTree, setCategoryTree] = useState<any[]>([])
  // Quản lý trạng thái mở rộng của danh mục cha (chỉ hiện danh mục con khi bấm vào danh mục cha)
  const [expandedParents, setExpandedParents] = useState<string[]>([])

  // Fetch dynamic categories tree from Backend API
  useEffect(() => {
    categoryService.getCategories({ tree: true })
      .then(cats => {
        if (Array.isArray(cats)) {
          setCategoryTree(cats)
        }
      })
      .catch(err => console.error('Lỗi nạp cây danh mục:', err))
  }, [])

  // Tự động mở danh mục cha nếu URL query danh mục đang chọn thuộc về danh mục cha đó
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all' && categoryTree.length > 0) {
      for (const parent of categoryTree) {
        if (parent.slug === selectedCategory) {
          setExpandedParents(prev => prev.includes(parent.slug) ? prev : [...prev, parent.slug])
        } else if (parent.children && parent.children.some((c: any) => c.slug === selectedCategory)) {
          setExpandedParents(prev => prev.includes(parent.slug) ? prev : [...prev, parent.slug])
        }
      }
    }
  }, [selectedCategory, categoryTree])

  const handleParentCategoryClick = (parent: any) => {
    const isCurrentlyExpanded = expandedParents.includes(parent.slug)
    const isCurrentlyActive = selectedCategory === parent.slug

    // Cập nhật lọc sản phẩm theo danh mục cha
    setSelectedCategory(parent.slug)
    setCurrentPage(1)

    // Nếu đã mở và đang bấm lại vào chính danh mục này thì toggle thu gọn/mở rộng, ngược lại luôn mở ra
    if (isCurrentlyActive && isCurrentlyExpanded) {
      setExpandedParents(prev => prev.filter(s => s !== parent.slug))
    } else {
      setExpandedParents(prev => prev.includes(parent.slug) ? prev : [...prev, parent.slug])
    }
  }

  const handleToggleExpandOnly = (e: React.MouseEvent, parentSlug: string) => {
    e.stopPropagation()
    setExpandedParents(prev => 
      prev.includes(parentSlug) ? prev.filter(s => s !== parentSlug) : [...prev, parentSlug]
    )
  }

  // Fetch dynamic brands from Backend API - Yêu cầu 3.4
  useEffect(() => {
    brandService.getBrands()
      .then(bList => {
        if (Array.isArray(bList)) {
          setBrandsList(bList)
        }
      })
      .catch(err => console.error('Lỗi nạp danh sách thương hiệu:', err))
  }, [])

  // Fetch real data from Backend API
  useEffect(() => {
    let isMounted = true
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getProducts({
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          brand: selectedBrand !== 'all' ? selectedBrand : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          rating: selectedRating || undefined,
          sale: isSaleOnly ? true : undefined,
          sortBy,
          page: currentPage,
          limit: itemsPerPage
        })
        if (isMounted && data) {
          setProducts(data.products || [])
          setTotalPages(data.totalPages || 1)
          setTotalCount(data.total || 0)
        }
      } catch (error) {
        console.error('Lỗi tải sản phẩm từ backend:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProducts()
    return () => { isMounted = false }
  }, [searchQuery, selectedCategory, selectedBrand, minPrice, maxPrice, selectedRating, sortBy, currentPage, isSaleOnly])

  // Reset all filters
  const handleResetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedRating(null)
    setSortBy('popular')
    setCurrentPage(1)
    setSearchParams({})
  }


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
            <MagnifyingGlass size={16} /> // KẾT QUẢ TÌM KIẾM CHO: <span className="underline text-zinc-900 dark:text-white font-black">"{searchQuery}"</span> // ({totalCount || products.length} THIẾT BỊ)
          </p>
          <button 
            onClick={handleResetFilters}
            className="text-[10px] uppercase font-black tracking-widest bg-[#ff4655] text-white px-3 py-1.5 rounded hover:bg-[#e03d4b] transition-all"
          >
            Đặt lại
          </button>
        </div>
      )}

      {/* Promotion & Sale Hot Header Banner */}
      {isSaleOnly && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-red-600 via-rose-600 to-orange-600 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-red-500/15 border border-red-400/30"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0 animate-pulse">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white text-red-600 px-2 py-0.5 rounded-full shadow-sm">
                  KHUYẾN MÃI ĐẶC BIỆT
                </span>
                <span className="text-[10px] font-mono text-red-200">
                  // FLASH_SALE_LIVE
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wide mt-1">
                GIẢM GIÁ KHỦNG ĐẾN 50% — ƯU ĐÃI ĐỘC QUYỀN GEARTECH
              </h2>
              <p className="text-xs text-red-100 font-medium mt-0.5">
                Các sản phẩm công nghệ, bàn phím cơ, linh kiện gaming chính hãng được giảm giá sốc. Giữ giá 48h khi bỏ giỏ!
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSaleOnly(false)}
            className="text-[11px] font-black uppercase tracking-widest bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl border border-white/30 transition-all shrink-0 active:scale-95"
          >
            Xem tất cả thiết bị
          </button>
        </motion.div>
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
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || minPrice || maxPrice || selectedRating !== null || searchQuery || isSaleOnly) && (
              <button 
                onClick={handleResetFilters}
                className="text-[9px] font-black tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1 uppercase"
                title="Xóa bộ lọc"
              >
                <Trash size={12} /> XÓA
              </button>
            )}
          </div>

          {/* Promotional Toggle Filter */}
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-900 pl-1">
            <button
              onClick={() => setIsSaleOnly(!isSaleOnly)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                isSaleOnly
                  ? 'bg-red-500/10 border-red-500 text-red-500 dark:bg-red-950/40 dark:border-red-500/60 shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-red-400 hover:text-red-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>🔥</span>
                <span>Đang khuyến mãi</span>
              </span>
              <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${
                isSaleOnly ? 'bg-red-500 text-white' : 'border border-zinc-300 dark:border-zinc-700'
              }`}>
                {isSaleOnly ? '✓' : ''}
              </span>
            </button>
          </div>

          {/* Categories Filter (A2: Cây danh mục phân cấp cha - con) */}
          <div className="space-y-3 pl-1">
            <h4 className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">// CATEGORIES</h4>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setCurrentPage(1)
                }}
                className={`text-[9px] text-left px-3 py-2 rounded-md transition-all font-black uppercase tracking-wider border-l-2 cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#ff4655]/10 text-[#ff4655] border-l-[#ff4655]'
                    : 'border-l-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                {selectedCategory === 'all' ? '[x]' : '[ ]'} TẤT CẢ SẢN PHẨM
              </button>

              {categoryTree.map((parent) => {
                const hasChildren = parent.children && parent.children.length > 0
                const isParentActive = selectedCategory === parent.slug
                const isChildActive = hasChildren && parent.children.some((c: any) => c.slug === selectedCategory)
                const isExpanded = expandedParents.includes(parent.slug)

                return (
                  <div key={parent._id} className="space-y-0.5">
                    <button
                      onClick={() => handleParentCategoryClick(parent)}
                      className={`w-full text-[9px] text-left px-3 py-2 rounded-md transition-all font-black uppercase tracking-wider border-l-2 flex items-center justify-between cursor-pointer group ${
                        isParentActive
                          ? 'bg-[#ff4655]/10 text-[#ff4655] border-l-[#ff4655]'
                          : isChildActive
                          ? 'border-l-[#ff4655]/50 text-zinc-900 dark:text-white font-black'
                          : 'border-l-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-1.5 truncate">
                        <span>{parent.icon || '📦'}</span>
                        <span className="truncate">{parent.name}</span>
                      </span>
                      
                      <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                        {isParentActive && <span className="text-[8px] font-mono text-[#ff4655]">TẤT CẢ</span>}
                        {hasChildren && (
                          <span
                            onClick={(e) => handleToggleExpandOnly(e, parent.slug)}
                            className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            title={isExpanded ? 'Thu gọn danh mục con' : 'Xem danh mục con'}
                          >
                            <CaretDown
                              size={11}
                              weight="bold"
                              className={`transition-transform duration-200 ${isExpanded ? 'rotate-0 text-[#ff4655]' : '-rotate-90 text-zinc-400'}`}
                            />
                          </span>
                        )}
                      </div>
                    </button>

                    {/* Danh mục con (Chỉ hiển thị khi bấm vào danh mục cha mở rộng) */}
                    <AnimatePresence initial={false}>
                      {hasChildren && isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-4 space-y-0.5 border-l border-zinc-200 dark:border-zinc-800 ml-3.5 my-0.5"
                        >
                          {parent.children.map((child: any) => {
                            const isSelected = selectedCategory === child.slug
                            return (
                              <button
                                key={child._id}
                                onClick={() => {
                                  setSelectedCategory(child.slug)
                                  setCurrentPage(1)
                                }}
                                className={`w-full text-[8.5px] text-left px-2 py-1.5 rounded transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#ff4655] text-white shadow-sm'
                                    : 'text-zinc-500 hover:text-[#ff4655] hover:bg-zinc-100 dark:hover:bg-zinc-850'
                                }`}
                              >
                                <span className="opacity-50">↳</span>
                                <span>{child.icon || '•'}</span>
                                <span className="truncate">{child.name}</span>
                              </button>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Brands Filter - Yêu cầu 3.4 */}
          <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 pl-1">
            <div className="flex items-center justify-between">
              <h4 className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 uppercase tracking-widest">// BRANDS_ALLIANCE</h4>
              {selectedBrand !== 'all' && (
                <button
                  onClick={() => setSelectedBrand('all')}
                  className="text-[8px] font-mono text-red-500 hover:underline uppercase"
                >
                  [Bỏ lọc]
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`text-[8px] text-center px-2 py-2 rounded font-black uppercase tracking-wider border transition-all ${
                  selectedBrand === 'all'
                    ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-sm shadow-[#ff4655]/20'
                    : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                TẤT CẢ
              </button>
              {brandsList.map((b) => (
                <button
                  key={b._id || b.slug}
                  onClick={() => setSelectedBrand(selectedBrand === b.slug ? 'all' : b.slug)}
                  className={`text-[8px] flex items-center justify-center gap-1 px-2 py-2 rounded font-black uppercase tracking-wider border transition-all cursor-pointer ${
                    selectedBrand === b.slug
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-sm shadow-[#ff4655]/20'
                      : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                  title={b.description || b.name}
                >
                  <span>{b.logo || '🏷️'}</span>
                  <span className="truncate">{b.name}</span>
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                HIỂN THỊ {totalCount === 0 ? '0' : `${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, totalCount)}`} TRONG {totalCount} THIẾT BỊ
              </span>
              {selectedBrand !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 text-[9px] font-black uppercase shadow-xs">
                  <span>🏷️ {brandsList.find(b => b.slug === selectedBrand)?.name || selectedBrand}</span>
                  <button onClick={() => setSelectedBrand('all')} className="hover:text-red-700 font-bold ml-1 cursor-pointer">✕</button>
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/30 text-[9px] font-black uppercase shadow-xs">
                  <span>📁 {selectedCategory}</span>
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-blue-700 font-bold ml-1 cursor-pointer">✕</button>
                </span>
              )}
            </div>

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
            {loading ? (
              <div className="p-16 text-center text-xs font-bold text-zinc-400">
                Đang tải danh sách thiết bị công nghệ...
              </div>
            ) : products.length === 0 ? (
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {products.map((prod) => (
                  <motion.div
                    layout
                    key={prod._id || prod.id}
                    whileHover={{ y: -4, borderColor: 'rgba(255, 70, 85, 0.4)' }}
                    transition={{ type: 'spring' as const, stiffness: 120 }}
                    className="group bg-white dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  >
                    <Link to={`/product/${prod._id || prod.id}`}>
                      <div className="h-48 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center text-4xl relative border-b border-zinc-100 dark:border-zinc-800/80 overflow-hidden">
                        <SafeProductImage
                          src={prod.imageEmoji}
                          gallery={prod.gallery}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {prod.discount && prod.oldPrice && prod.oldPrice > prod.price && (
                          <span className="absolute top-3 right-3 bg-[#ff4655] text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                            {prod.discount}
                          </span>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase tracking-wide">
                          {prod.title}
                        </h4>
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="current-price text-sm font-extrabold text-[#ff4655]">{formatPrice(prod.price)}</span>
                            {prod.oldPrice && prod.oldPrice > prod.price && (
                              <span className="old-price text-[10px] text-zinc-400 line-through">{formatPrice(prod.oldPrice)}</span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-800/60 mt-1">
                            <div className="flex items-center gap-0.5">
                              {renderStars(prod.rating || 0)}
                              <span className={`text-[10px] font-semibold ml-1 ${Number(prod.rating) > 0 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {Number(prod.rating) > 0 ? Number(prod.rating).toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{prod.salesCount || 'Chính hãng'}</span>
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
