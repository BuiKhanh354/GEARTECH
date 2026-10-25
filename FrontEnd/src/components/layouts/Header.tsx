import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { formatPrice } from '../../utils/format'
import { useCartStore } from '../../store/cartStore'
import { categoryService, type CategoryItem } from '../../services/categoryService'
import { brandService, type BrandItem } from '../../services/brandService'
import {
  MagnifyingGlass,
  ShoppingCart,
  List,
  X,
  CaretDown,
  User,
  Receipt,
  Gear,
  SignOut,
  GameController,
  Lightning,
  Sun,
  Moon,
  ShieldCheck,
  Storefront
} from '@phosphor-icons/react'

export default function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [categoryHovered, setCategoryHovered] = useState(false)
  const [activeCategoryTab, setActiveCategoryTab] = useState('all')
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null)
  const categoryHoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleCategoryMouseEnter = () => {
    if (categoryHoverTimeoutRef.current) {
      clearTimeout(categoryHoverTimeoutRef.current)
      categoryHoverTimeoutRef.current = null
    }
    setCategoryHovered(true)
  }

  const handleCategoryMouseLeave = () => {
    if (categoryHoverTimeoutRef.current) {
      clearTimeout(categoryHoverTimeoutRef.current)
    }
    categoryHoverTimeoutRef.current = setTimeout(() => {
      setCategoryHovered(false)
    }, 200)
  }

  // ==========================================================================
  // A1: DANH MỤC ĐỘNG TỪ MONGODB — lấy qua API thay cho dữ liệu hardcode.
  // Admin thêm/sửa/vô hiệu hóa danh mục sẽ tự động phản ánh lên navbar.
  // ==========================================================================
  const [dbCategories, setDbCategories] = useState<CategoryItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError(false)
        // tree=true: backend dựng cây cha/con, chỉ trả danh mục status=active (công khai)
        const tree = await categoryService.getCategories({ tree: true })
        if (!cancelled) setDbCategories(tree)
      } catch {
        if (!cancelled) setCategoriesError(true)
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    }
    fetchCategories()
    return () => { cancelled = true }
  }, [])

  const renderCatIcon = (iconStr: string | undefined, fallback = '💻') => {
    const icon = iconStr || fallback
    if (typeof icon === 'string' && (icon.startsWith('http://') || icon.startsWith('https://') || icon.startsWith('/uploads'))) {
      return <img src={icon} alt="icon" className="w-4 h-4 object-contain inline-block" />
    }
    return icon
  }

  // Map danh mục động: value là slug để lọc sản phẩm, icon dùng icon do Admin cấu hình
  const dynamicCategories: { value: string; label: string; desc: string; icon: React.ReactNode; category?: CategoryItem }[] = [
    { value: 'all', label: 'TẤT CẢ SẢN PHẨM', desc: 'Xem toàn bộ thiết bị đang có tại GearTech', icon: <Lightning size={18} /> },
    ...dbCategories.map((cat) => ({
      value: cat.slug,
      label: cat.name,
      desc: cat.description || `Sản phẩm thuộc danh mục ${cat.name}`,
      icon: <span className="text-base leading-none flex items-center justify-center">{renderCatIcon(cat.icon)}</span>,
      category: cat
    })),
    { value: 'brand', label: 'THƯƠNG HIỆU NỔI TIẾNG', desc: 'Các hãng công nghệ liên minh hàng đầu', icon: <GameController size={18} /> }
  ]

  // Danh sách danh mục con hiển thị ở khung phải (chỉ tab động có children mới sinh card)
  const dynamicSubItems = (cat: CategoryItem | undefined) => {
    if (!cat) return []
    const children = (cat.children || []).filter((c) => c.status === 'active')
    if (children.length > 0) {
      return children.map((child) => ({
        label: child.name,
        to: `/ProductPage?category=${child.slug}`,
        icon: renderCatIcon(child.icon, '📦')
      }))
    }
    // Danh mục lá: hiển thị một card dẫn tới toàn bộ sản phẩm của danh mục
    return [{
      label: `Xem tất cả ${cat.name}`,
      to: `/ProductPage?category=${cat.slug}`,
      icon: renderCatIcon(cat.icon, '💻')
    }]
  }

  const [currentUser, setCurrentUser] = useState<any>(() => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  })

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setUserMenuOpen(false)
    window.location.href = '/Trang-chu'
  }

  // Danh sách thương hiệu hợp tác hiển thị ở tab "Thương hiệu nổi tiếng"
  // được lấy THẬT từ MongoDB qua /api/brands (Admin quản lý tại tab Thương hiệu)
  const [dbBrands, setDbBrands] = useState<BrandItem[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [brandsError, setBrandsError] = useState(false)

  useEffect(() => {
    let cancelled = false
    brandService.getBrands()
      .then((list) => {
        if (cancelled) return
        setDbBrands(Array.isArray(list) ? list.filter(b => b.status === 'active') : [])
        setBrandsError(false)
      })
      .catch(() => { if (!cancelled) setBrandsError(true) })
      .finally(() => { if (!cancelled) setBrandsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Các liên kết nhanh của tab "TẤT CẢ SẢN PHẨM" (tab đặc biệt, không phải danh mục DB)
  const categorySubItems: Record<string, { label: string; to: string; icon: string; brands?: { name: string; to: string }[] }[]> = {
    all: [
      { label: 'TẤT CẢ THIẾT BỊ', to: '/ProductPage', icon: '⚡' },
      { label: 'SẢN PHẨM KHUYẾN MÃI', to: '/ProductPage?search=giảm', icon: '🏷️' },
      { label: 'ĐÁNH GIÁ 5 SAO', to: '/ProductPage?sortBy=popular', icon: '⭐' },
      { label: 'GIÁ TỐT NHẤT', to: '/ProductPage?sortBy=priceAsc', icon: '💸' }
    ]
  }

  const searchRef = useRef<HTMLDivElement>(null)

  // Load and apply theme from localStorage
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  // Close search suggestions on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setIsSearchFocused(false)
      navigate(`/ProductPage?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Popular searches
  const popularSearches = [
    'MacBook Pro M3',
    'RTX 4090 PC',
    'Keychron Q1 Pro',
    'Logitech G Pro X 2',
    'Sony WH-1000XM5'
  ]

  // Real cart items from persistent Zustand store
  const { items: cartItems, getTotalCount, getSubtotal } = useCartStore()
  const totalCartCount = getTotalCount()
  const totalCartPrice = getSubtotal()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md transition-colors duration-300 shadow-sm dark:shadow-xl">
      <div className="max-w-full px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>

            <Link 
              to="/Trang-chu" 
              className="group flex items-center gap-3 tracking-widest text-lg font-black uppercase text-zinc-900 dark:text-white hover:opacity-95 transition-opacity"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.45)] group-hover:scale-105 transition-transform duration-300">
                <GameController size={20} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-[0.22em] leading-none text-zinc-900 dark:text-white">GEARTECH</span>
                <span className="text-[8px] font-bold tracking-[0.35em] text-[#ff4655] mt-1">VALORANT ED.</span>
              </div>
            </Link>
          </div>

          {/* Search bar wrapper with suggestions dropdown */}
          <div ref={searchRef} className="flex-1 max-w-md relative hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative z-20">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thiết bị công nghệ, laptop, linh kiện..."
                className="w-full pl-5 pr-11 py-2.5 rounded bg-zinc-100/90 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 text-xs tracking-wider text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:bg-white dark:focus:bg-zinc-950 focus:ring-2 focus:ring-[#ff4655]/40 focus:border-[#ff4655] transition-all duration-200"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-3 text-zinc-400 hover:text-[#ff4655] transition-colors"
              >
                <MagnifyingGlass size={16} weight="bold" />
              </button>
            </form>

            {/* Suggestions dropdown */}
            <AnimatePresence>
              {isSearchFocused && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl z-30 py-3"
                >
                  <div className="px-4 py-1.5 text-[9px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
                    <Lightning size={12} weight="fill" /> Tìm kiếm phổ biến
                  </div>
                  <div className="mt-1">
                    {popularSearches.map((term, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchQuery(term)
                          setIsSearchFocused(false)
                          navigate(`/ProductPage?search=${encodeURIComponent(term)}`)
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 transition-colors uppercase tracking-wider"
                      >
                        <MagnifyingGlass size={12} className="text-zinc-400 dark:text-zinc-500" />
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop Right actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 mr-2">
              <Link to="/Trang-chu" className="text-zinc-600 hover:text-[#ff4655] dark:text-zinc-300 dark:hover:text-[#ff4655] font-bold text-xs uppercase tracking-widest transition-colors">
                Trang chủ
              </Link>
              
              {/* Dropdown-enabled Categories Link (D4 Fixed: Hover bridge & debounce) */}
              <div 
                className="relative py-2"
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
              >
                <Link to="/ProductPage" className="text-zinc-600 hover:text-[#ff4655] dark:text-zinc-300 dark:hover:text-[#ff4655] font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1">
                  Danh Mục <CaretDown size={10} className={`transition-transform duration-200 ${categoryHovered ? 'rotate-180 text-[#ff4655]' : ''}`} />
                </Link>

                <AnimatePresence>
                  {categoryHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      onMouseEnter={handleCategoryMouseEnter}
                      onMouseLeave={handleCategoryMouseLeave}
                      className="fixed top-16 left-0 w-full bg-white/98 dark:bg-zinc-950/98 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 shadow-2xl z-40 py-8 px-6 lg:px-12 before:content-[''] before:absolute before:-top-6 before:left-0 before:w-full before:h-6 before:pointer-events-auto"
                    >
                      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
                        {/* Left Pane: Vertical Categories List (3 cols) */}
                        <div className="col-span-3 border-r border-zinc-200 dark:border-zinc-800 pr-6 space-y-1">
                          <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.25em] pl-2 block mb-2">// CATEGORIES</span>
                          {categoriesLoading && (
                            <div className="px-3.5 py-3 space-y-2.5">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-7 rounded-lg bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                              ))}
                              <span className="block text-[9px] text-zinc-400 font-mono pl-1">ĐANG TẢI DANH MỤC...</span>
                            </div>
                          )}
                          {!categoriesLoading && categoriesError && (
                            <div className="px-3.5 py-3 text-[9px] font-bold text-red-500 uppercase tracking-wider">
                              ⚠️ Không tải được danh mục.
                              <button
                                onClick={() => {
                                  setCategoriesError(false)
                                  setCategoriesLoading(true)
                                  categoryService.getCategories({ tree: true })
                                    .then((tree) => { setDbCategories(tree); setCategoriesError(false) })
                                    .catch(() => setCategoriesError(true))
                                    .finally(() => setCategoriesLoading(false))
                                }}
                                className="block mt-1.5 underline hover:text-[#ff4655] cursor-pointer"
                              >
                                Thử lại
                              </button>
                            </div>
                          )}
                          {!categoriesLoading && !categoriesError && dynamicCategories.map((cat) => (
                            <button
                              key={cat.value}
                              onMouseEnter={() => setActiveCategoryTab(cat.value)}
                              onClick={() => {
                                setCategoryHovered(false)
                                if (cat.value === 'all') navigate('/ProductPage')
                                else if (cat.value === 'brand') navigate('/ProductPage')
                                else navigate(`/ProductPage?category=${cat.value}`)
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-lg font-black uppercase tracking-wider text-[10px] transition-all border-l-2 flex items-center gap-3.5 ${
                                activeCategoryTab === cat.value
                                  ? 'bg-[#ff4655]/10 text-[#ff4655] border-l-[#ff4655]'
                                  : 'border-l-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                            >
                              <span className={`flex items-center ${activeCategoryTab === cat.value ? 'text-[#ff4655]' : 'text-zinc-400 dark:text-zinc-500'}`}>
                                {cat.icon}
                              </span>
                              {cat.label}
                            </button>
                          ))}
                          {!categoriesLoading && !categoriesError && dynamicCategories.length <= 2 && (
                            <span className="block px-3.5 py-2 text-[9px] text-zinc-400 font-mono italic">
                              // Chưa có danh mục nào được cấu hình
                            </span>
                          )}
                        </div>

                        {/* Right Pane: Dynamic Feature Area (9 cols) */}
                        <div className="col-span-9 pl-2 space-y-4">
                          
                          {/* 1. Dynamic Brands Grid when Tab is "brand" — dữ liệu thật từ MongoDB */}
                          {activeCategoryTab === 'brand' && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                                <span className="w-1.5 h-3.5 bg-[#ff4655]"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">THƯƠNG HIỆU HỢP TÁC HÀNG ĐẦU</span>
                              </div>

                              {brandsLoading && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  {[0, 1, 2, 3].map((i) => (
                                    <div key={i} className="h-[90px] rounded-xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
                                  ))}
                                </div>
                              )}
                              {!brandsLoading && brandsError && (
                                <div className="p-4 text-[10px] font-bold text-red-500 uppercase tracking-wider border border-dashed border-red-500/30 rounded-xl">
                                  ⚠️ Không tải được danh sách thương hiệu. Vui lòng thử lại sau.
                                </div>
                              )}
                              {!brandsLoading && !brandsError && dbBrands.length === 0 && (
                                <div className="p-4 text-[10px] text-zinc-400 font-mono italic border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                                  // Chưa có thương hiệu nào được cấu hình trên hệ thống
                                </div>
                              )}
                              {!brandsLoading && !brandsError && dbBrands.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  {dbBrands.map((brand) => (
                                    <Link
                                      key={brand._id || brand.id}
                                      to={`/ProductPage?search=${encodeURIComponent(brand.name)}`}
                                      onClick={() => setCategoryHovered(false)}
                                      className="group p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 rounded-xl transition-all duration-200 flex flex-col justify-between min-h-[90px] relative overflow-hidden"
                                    >
                                      <div className="absolute right-2 bottom-0 text-5xl opacity-5 group-hover:scale-105 transition-transform select-none">{brand.logo || '🏷️'}</div>
                                      <div className="flex items-center gap-2 z-10">
                                        <span className="w-7 h-7 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-base flex items-center justify-center shrink-0 shadow-sm">
                                          {brand.logo || '🏷️'}
                                        </span>
                                        <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider group-hover:text-[#ff4655] transition-colors">{brand.name}</h4>
                                      </div>
                                      <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium leading-normal mt-2 z-10">{brand.description || `Sản phẩm chính hãng ${brand.name}`}</p>
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* 2. Sub-categories when Tab is not "brand" */}
                          {activeCategoryTab !== 'brand' && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-900">
                                <span className="w-1.5 h-3.5 bg-[#ff4655]"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                                  DANH MỤC THIẾT BỊ // {dynamicCategories.find(c => c.value === activeCategoryTab)?.label || ''}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {(() => {
                                  // Tab động từ MongoDB: hiển thị danh mục con đúng cấp bậc
                                  const activeCat = dynamicCategories.find(c => c.value === activeCategoryTab)?.category
                                  const dynamicItems = activeCat ? dynamicSubItems(activeCat) : []
                                  const items = dynamicItems.length > 0
                                    ? dynamicItems.map((s) => ({ label: s.label, to: s.to, icon: s.icon, brands: undefined as undefined | { name: string; to: string }[] }))
                                    : (categorySubItems[activeCategoryTab] || []).map((s) => ({ ...s }))

                                  if (items.length === 0) {
                                    return (
                                      <span className="col-span-4 text-[10px] text-zinc-400 font-mono italic py-4">
                                        // Chưa có danh mục con. Vui lòng chọn danh mục khác.
                                      </span>
                                    )
                                  }

                                  return items.map((sub) => (
                                    <Link
                                      key={sub.label}
                                      to={sub.to}
                                      onClick={() => setCategoryHovered(false)}
                                      className="group p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/40 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/40 rounded-xl transition-all duration-200 flex flex-col justify-between min-h-[90px] relative overflow-hidden text-left"
                                    >
                                      <div className="absolute right-2 bottom-0 text-5xl opacity-5 group-hover:scale-105 transition-transform select-none">{sub.icon}</div>
                                      <div className="flex items-center gap-2 z-10">
                                        <span className="w-7 h-7 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-base flex items-center justify-center shrink-0 shadow-sm">
                                          {sub.icon}
                                        </span>
                                        <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider group-hover:text-[#ff4655] transition-colors">{sub.label}</h4>
                                      </div>
                                      {sub.brands && sub.brands.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 mt-3.5 z-10">
                                          {sub.brands.map((br) => (
                                            <button
                                              key={br.name}
                                              onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setCategoryHovered(false)
                                                navigate(br.to)
                                              }}
                                              className="px-2 py-0.5 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] dark:hover:text-white text-zinc-700 dark:text-zinc-300 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                            >
                                              {br.name}
                                            </button>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-[9px] font-black text-[#ff4655] mt-3 group-hover:underline flex items-center gap-1 z-10 uppercase tracking-widest">
                                          Khám phá &raquo;
                                        </span>
                                      )}
                                    </Link>
                                  ))
                                })()}
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/tintuc" className="text-zinc-600 hover:text-[#ff4655] dark:text-zinc-300 dark:hover:text-[#ff4655] font-bold text-xs uppercase tracking-widest transition-colors">
                Tin tức
              </Link>
              <Link to="/about" className="text-zinc-600 hover:text-[#ff4655] dark:text-zinc-300 dark:hover:text-[#ff4655] font-bold text-xs uppercase tracking-widest transition-colors">
                Chúng tôi
              </Link>
              <Link to="/Cua-hang" className="text-zinc-600 hover:text-[#ff4655] dark:text-zinc-300 dark:hover:text-[#ff4655] font-bold text-xs uppercase tracking-widest transition-colors">
                Cửa Hàng & Shop
              </Link>
            </nav>

            {/* Cart Icon with Preview Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCartHovered(true)}
              onMouseLeave={() => setCartHovered(false)}
            >
              <Link 
                to="/cart" 
                className="p-2.5 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-[#ff4655] dark:hover:text-white flex items-center justify-center relative transition-all active:scale-95"
              >
                <ShoppingCart size={19} weight="bold" />
                <span className="absolute top-1 right-1 bg-[#ff4655] text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black shadow-[0_0_10px_rgba(255,70,85,0.6)]">
                  {totalCartCount}
                </span>
              </Link>

              {/* Cart hover preview menu */}
              <AnimatePresence>
                {cartHovered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-1 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl z-35 py-4"
                  >
                    <div className="px-4 pb-3 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                      <span className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest">GIỎ HÀNG CỦA BẠN</span>
                      <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">{totalCartCount} sản phẩm</span>
                    </div>
                    
                    {/* Cart preview list */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                      {cartItems.length === 0 ? (
                        <div className="p-6 text-center text-xs text-zinc-400">
                          Giỏ hàng của bạn đang trống
                        </div>
                      ) : (
                        cartItems.map((item) => (
                          <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xl shrink-0 border border-zinc-200 dark:border-zinc-800">
                              {item.imageEmoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.title}</h4>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">SL: {item.quantity}</p>
                            </div>
                            <div className="text-xs font-black text-[#ff4655]">
                              {formatPrice(item.price)}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Cart preview footer */}
                    <div className="px-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between mt-1">
                      <div>
                        <p className="text-[9px] text-zinc-400 uppercase tracking-wider">Tổng cộng:</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-white">{formatPrice(totalCartPrice)}</p>
                      </div>
                      <Link 
                        to="/cart"
                        className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_12px_rgba(255,70,85,0.4)] active:scale-95"
                      >
                        Thanh toán
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title={theme === 'dark' ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
            >
              {theme === 'dark' ? (
                <Sun size={19} className="text-amber-400" />
              ) : (
                <Moon size={19} className="text-zinc-600" />
              )}
            </button>

            {/* Auth check: Avatar Dropdown if logged in, else Đăng nhập Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 focus:outline-none transition-all duration-200"
                >
                  <img
                    className="h-7 w-7 rounded object-cover shadow-inner border border-zinc-200 dark:border-zinc-700"
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt="User avatar"
                  />
                  <CaretDown size={10} className="text-zinc-400 mr-1 hidden sm:inline" />
                </button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)}></div>
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.12 }}
                        className="origin-top-right absolute right-0 mt-2.5 w-56 rounded-xl shadow-2xl py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 z-20 focus:outline-none"
                      >
                        <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1.5">
                          <p className="text-[9px] text-[#ff4655] font-black uppercase tracking-widest">TÀI KHOẢN GEARTECH</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white truncate mt-0.5">{currentUser.name}</p>
                          {currentUser.role === 'admin' ? (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[8px] font-black bg-red-500/10 text-red-500 border border-red-500/20 uppercase tracking-wider">
                               QUẢN TRỊ ADMIN
                            </span>
                          ) : currentUser.role === 'shop' ? (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                               CHỦ GIAN HÀNG
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                               {currentUser.memberRank || 'THÀNH VIÊN'} VIP
                            </span>
                          )}
                        </div>

                        <Link to="/profile" className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                          <User size={14} />
                          Trang cá nhân
                        </Link>

                        {/* Chỉ Admin mới thấy menu Quản trị Admin */}
                        {currentUser.role === 'admin' && (
                          <Link to="/admin" className="px-4 py-2 text-xs font-black text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                            <ShieldCheck size={14} weight="bold" />
                            Quản trị Admin
                          </Link>
                        )}

                        {/* Chỉ Chủ Shop mới thấy menu Kênh người bán */}
                        {currentUser.role === 'shop' && (
                          <Link to="/shop" className="px-4 py-2 text-xs font-black text-amber-500 hover:bg-amber-500/10 transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                            <Storefront size={14} weight="bold" />
                            Kênh Shop
                          </Link>
                        )}

                        <Link to="/orders" className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                          <Receipt size={14} />
                          Đơn mua của tôi
                        </Link>
                        <Link to="/settings" className="px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                          <Gear size={14} />
                          Cài đặt
                        </Link>
                        <hr className="border-zinc-100 dark:border-zinc-900 my-1.5" />
                        <button 
                          className="w-full text-left px-4 py-2 text-xs font-black text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-2 uppercase tracking-wide cursor-pointer" 
                          onClick={handleLogout}
                        >
                          <SignOut size={14} />
                          Đăng xuất
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link 
                to="/login"
                className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.55)] hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center border border-[#ff4655]/40"
              >
                Đăng nhập
              </Link>
            )}

          </div>
        </div>
      </div>

      {/* Mobile drawer / menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm thiết bị..."
                className="w-full pl-5 pr-11 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#ff4655]"
              />
              <button type="submit" className="absolute right-3.5 top-2.5 text-zinc-400">
                <MagnifyingGlass size={16} />
              </button>
            </form>
            <nav className="flex flex-col space-y-1">
              <Link to="/Trang-chu" className="px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Trang chủ
              </Link>

              {/* Mobile Category Accordion (A2) */}
              <div className="rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileCategoryOpen(prev => !prev)}
                  className="w-full px-3.5 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-between uppercase tracking-widest cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <List size={14} className="text-[#ff4655]" />
                    Danh Mục Sản Phẩm
                  </span>
                  <CaretDown size={12} className={`transition-transform duration-200 ${mobileCategoryOpen ? 'rotate-180 text-[#ff4655]' : ''}`} />
                </button>

                <AnimatePresence>
                  {mobileCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 pr-2 py-2 space-y-1 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-lg border-l-2 border-[#ff4655]"
                    >
                      <Link
                        to="/ProductPage"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655]"
                      >
                        ⚡ Tất cả sản phẩm
                      </Link>

                      {dbCategories.map((parent) => {
                        const hasChildren = parent.children && parent.children.length > 0
                        const isExpanded = mobileExpandedCat === parent._id

                        return (
                          <div key={parent._id} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <Link
                                to={`/ProductPage?category=${parent.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:text-[#ff4655] flex items-center gap-1.5"
                              >
                                <span>{parent.icon || '📦'}</span>
                                <span>{parent.name}</span>
                              </Link>
                              {hasChildren && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setMobileExpandedCat(isExpanded ? null : parent._id)
                                  }}
                                  className="p-1.5 text-zinc-400 hover:text-[#ff4655] cursor-pointer"
                                >
                                  <CaretDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180 text-[#ff4655]' : ''}`} />
                                </button>
                              )}
                            </div>

                            {/* Subcategories list */}
                            {hasChildren && isExpanded && (
                              <div className="pl-6 space-y-1 border-l border-zinc-200 dark:border-zinc-800 ml-3">
                                {parent.children!.map((child) => (
                                  <Link
                                    key={child._id}
                                    to={`/ProductPage?category=${child.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-1 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-[#ff4655]"
                                  >
                                    {child.icon || '•'} {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/tintuc" className="px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Tin tức
              </Link>
              <Link to="/about" className="px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Chúng tôi
              </Link>
              <Link to="/Cua-hang" className="px-3.5 py-2.5 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Cửa Hàng & Shop
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
