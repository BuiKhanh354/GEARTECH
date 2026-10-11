import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { formatPrice } from '../../utils/format'
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
  Laptop,
  Desktop,
  Cpu,
  Monitor,
  Keyboard,
  Headphones,
  Watch,
  Plug,
  Lightning,
  Sun,
  Moon
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

  const techBrands = [
    { name: 'APPLE', desc: 'Hệ sinh thái MacBook & Apple Silicon', logo: '🍎', search: 'Apple' },
    { name: 'ASUS ROG', desc: 'Laptop Gaming & Linh kiện Republic of Gamers', logo: '👹', search: 'Asus' },
    { name: 'LOGITECH G', desc: 'Chuột gaming Lightspeed & Phím cơ PRO', logo: '👾', search: 'Logitech' },
    { name: 'RAZER', desc: 'Chuột, bàn phím & tai nghe rắn ba đầu siêu cấp', logo: '🐍', search: 'Razer' },
    { name: 'KEYCHRON', desc: 'Bàn phím cơ custom đa kết nối cao cấp', logo: '⌨️', search: 'Keychron' },
    { name: 'SONY', desc: 'Tai nghe chụp tai chống ồn chủ động ANC đỉnh cao', logo: '🎵', search: 'Sony' },
    { name: 'INTEL', desc: 'Bộ vi xử lý Core i9 thế hệ mới Raptor Lake', logo: '💎', search: 'Intel' },
    { name: 'NVIDIA', desc: 'Card đồ họa GeForce RTX dòng 40-series cực khủng', logo: '💚', search: 'RTX' }
  ]

  const categorySubItems: Record<string, { label: string; to: string; icon: string; brands?: { name: string; to: string }[] }[]> = {
    all: [
      { label: 'TẤT CẢ THIẾT BỊ', to: '/ProductPage', icon: '⚡' },
      { label: 'SẢN PHẨM KHUYẾN MÃI', to: '/ProductPage?search=giảm', icon: '🏷️' },
      { label: 'ĐÁNH GIÁ 5 SAO', to: '/ProductPage?sortBy=popular', icon: '⭐' },
      { label: 'GIÁ TỐT NHẤT', to: '/ProductPage?sortBy=priceAsc', icon: '💸' }
    ],
    laptops: [
      { label: 'MacBook Apple', to: '/ProductPage?search=MacBook', icon: '🍎', brands: [{ name: 'Pro', to: '/ProductPage?search=MacBook+Pro' }, { name: 'Air', to: '/ProductPage?search=MacBook+Air' }] },
      { label: 'Laptop ASUS', to: '/ProductPage?search=Asus', icon: '👹', brands: [{ name: 'ROG', to: '/ProductPage?search=ROG' }, { name: 'TUF', to: '/ProductPage?search=TUF' }] },
      { label: 'Laptop Acer', to: '/ProductPage?search=Acer', icon: '⚡', brands: [{ name: 'Predator', to: '/ProductPage?search=Predator' }, { name: 'Nitro', to: '/ProductPage?search=Nitro' }] },
      { label: 'Laptop Lenovo', to: '/ProductPage?search=Lenovo', icon: '💻', brands: [{ name: 'Legion', to: '/ProductPage?search=Legion' }, { name: 'IdeaPad', to: '/ProductPage?search=Lenovo' }] }
    ],
    desktops: [
      { label: 'PC Gaming', to: '/ProductPage?search=PC+Gaming', icon: '🎮', brands: [{ name: 'Asus ROG', to: '/ProductPage?search=ROG' }, { name: 'MSI', to: '/ProductPage?search=MSI' }] },
      { label: 'Workstation', to: '/ProductPage?search=Workstation', icon: '⚙️', brands: [{ name: 'Intel', to: '/ProductPage?search=Intel' }, { name: 'AMD', to: '/ProductPage?search=AMD' }] },
      { label: 'Mini PC', to: '/ProductPage?search=Mini', icon: '📦', brands: [{ name: 'Intel NUC', to: '/ProductPage?search=Mini' }, { name: 'Mac Mini', to: '/ProductPage?search=Mac+Mini' }] },
      { label: 'AI Server', to: '/ProductPage?search=Server', icon: '🧠', brands: [{ name: 'NVIDIA', to: '/ProductPage?search=NVIDIA' }, { name: 'RTX 4090', to: '/ProductPage?search=RTX' }] }
    ],
    components: [
      { label: 'CPU BỘ VI XỬ LÝ', to: '/ProductPage?search=CPU', icon: '🧠', brands: [{ name: 'Intel', to: '/ProductPage?search=Intel' }, { name: 'AMD', to: '/ProductPage?search=AMD' }] },
      { label: 'VGA CARD MÀN HÌNH', to: '/ProductPage?search=GeForce', icon: '🔌', brands: [{ name: 'NVIDIA', to: '/ProductPage?search=RTX' }, { name: 'AMD Radeon', to: '/ProductPage?search=Radeon' }] },
      { label: 'RAM BỘ NHỚ', to: '/ProductPage?search=RAM', icon: '⚡', brands: [{ name: 'Corsair', to: '/ProductPage?search=Corsair' }, { name: 'Kingston', to: '/ProductPage?search=Kingston' }] },
      { label: 'Ổ CỨNG SSD', to: '/ProductPage?search=SSD', icon: '💾', brands: [{ name: 'Samsung', to: '/ProductPage?search=SSD' }, { name: 'WD Blue', to: '/ProductPage?search=SSD' }] }
    ],
    monitors: [
      { label: 'Màn hình đồ họa', to: '/ProductPage?search=ProArt', icon: '🎨', brands: [{ name: 'ASUS', to: '/ProductPage?search=ASUS' }, { name: 'Dell', to: '/ProductPage?search=Dell' }] },
      { label: 'Màn hình Gaming', to: '/ProductPage?search=Hz', icon: '📺', brands: [{ name: '240Hz', to: '/ProductPage?search=Hz' }, { name: 'OLED', to: '/ProductPage?search=Hz' }] },
      { label: 'Màn hình UltraWide', to: '/ProductPage?search=ASUS', icon: '🖥️', brands: [{ name: '21:9', to: '/ProductPage?search=ASUS' }, { name: 'Curved', to: '/ProductPage?search=ASUS' }] },
      { label: 'Màn hình 4K', to: '/ProductPage?search=PA279CV', icon: '🌟', brands: [{ name: 'ProArt', to: '/ProductPage?search=PA279CV' }, { name: 'IPS', to: '/ProductPage?search=PA279CV' }] }
    ],
    peripherals: [
      { label: 'BÀN PHÍM CƠ', to: '/ProductPage?search=Keychron', icon: '⌨️', brands: [{ name: 'Keychron', to: '/ProductPage?search=Keychron' }, { name: 'Corsair', to: '/ProductPage?search=Corsair' }] },
      { label: 'CHUỘT GAMING', to: '/ProductPage?search=Superlight', icon: '🖱️', brands: [{ name: 'Logitech', to: '/ProductPage?search=Logitech' }, { name: 'Razer', to: '/ProductPage?search=Razer' }] },
      { label: 'Keycaps & Custom', to: '/ProductPage?search=Custom', icon: '🔌', brands: [{ name: 'Switches', to: '/ProductPage?search=Custom' }, { name: 'PBT', to: '/ProductPage?search=Custom' }] },
      { label: 'Bàn di chuột', to: '/ProductPage?search=pad', icon: '👾', brands: [{ name: 'Corsair', to: '/ProductPage?search=pad' }, { name: 'Razer Pad', to: '/ProductPage?search=pad' }] }
    ],
    audio: [
      { label: 'Tai nghe chụp tai', to: '/ProductPage?search=Sony', icon: '🎧', brands: [{ name: 'Sony WH', to: '/ProductPage?search=Sony' }, { name: 'Sennheiser', to: '/ProductPage?search=Sennheiser' }] },
      { label: 'Tai nghe chống ồn', to: '/ProductPage?search=ANC', icon: '🔇', brands: [{ name: 'ANC', to: '/ProductPage?search=ANC' }, { name: 'TWS', to: '/ProductPage?search=ANC' }] },
      { label: 'Tai nghe gaming', to: '/ProductPage?search=gaming+headset', icon: '🎵', brands: [{ name: 'ROG', to: '/ProductPage?search=ROG' }, { name: 'Razer Kraken', to: '/ProductPage?search=Razer' }] },
      { label: 'Hệ thống âm thanh', to: '/ProductPage?search=Audio', icon: '🎙️', brands: [{ name: 'Sony Audio', to: '/ProductPage?search=Sony' }, { name: 'Bose', to: '/ProductPage?search=Bose' }] }
    ],
    'smart-devices': [
      { label: 'Apple Watch', to: '/ProductPage?search=Apple+Watch', icon: '⌚', brands: [{ name: 'Ultra 2', to: '/ProductPage?search=Ultra' }, { name: 'Series 9', to: '/ProductPage?search=Apple' }] },
      { label: 'Đồng hồ thể thao', to: '/ProductPage?search=Ultra', icon: '🏔️', brands: [{ name: 'Titanium', to: '/ProductPage?search=Ultra' }, { name: 'Garmin', to: '/ProductPage?search=Garmin' }] },
      { label: 'Thiết bị định vị', to: '/ProductPage?search=GPS', icon: '🌊', brands: [{ name: 'GPS', to: '/ProductPage?search=GPS' }, { name: 'Cellular', to: '/ProductPage?search=Cellular' }] },
      { label: 'Thiết bị Smarthome', to: '/ProductPage?search=IoT', icon: '🔋', brands: [{ name: 'IoT', to: '/ProductPage?search=IoT' }, { name: 'Xiaomi', to: '/ProductPage?search=Xiaomi' }] }
    ],
    accessories: [
      { label: 'Cáp sạc đa năng', to: '/ProductPage?search=HyperDrive', icon: '🔌', brands: [{ name: 'HyperDrive', to: '/ProductPage?search=HyperDrive' }, { name: 'Anker', to: '/ProductPage?search=Anker' }] },
      { label: 'Hub chuyển đổi', to: '/ProductPage?search=Hub', icon: '📺', brands: [{ name: '9-in-1', to: '/ProductPage?search=Hub' }, { name: 'Type-C', to: '/ProductPage?search=Hub' }] },
      { label: 'Củ sạc nhanh PD', to: '/ProductPage?search=Power', icon: '⚡', brands: [{ name: 'PD 100W', to: '/ProductPage?search=Power' }, { name: 'GaN', to: '/ProductPage?search=Power' }] },
      { label: 'Phụ kiện nhôm', to: '/ProductPage?search=USB-C', icon: '📦', brands: [{ name: 'Hyper', to: '/ProductPage?search=USB-C' }, { name: 'Baseus', to: '/ProductPage?search=Baseus' }] }
    ]
  }

  const categoriesList = [
    { value: 'all', label: 'TẤT CẢ SẢN PHẨM', desc: 'Xem toàn bộ thiết bị đang có tại GearTech', icon: <Lightning size={18} /> },
    { value: 'laptops', label: 'LAPTOP & MACBOOK', desc: 'MacBook Pro, Air & Laptop Gaming cao cấp', icon: <Laptop size={18} /> },
    { value: 'desktops', label: 'PC & WORKSTATION', desc: 'PC Gaming chuyên nghiệp & máy trạm đồ họa', icon: <Desktop size={18} /> },
    { value: 'brand', label: 'THƯƠNG HIỆU NỔI TIẾNG', desc: 'Các hãng công nghệ liên minh hàng đầu', icon: <GameController size={18} /> },
    { value: 'components', label: 'LINH KIỆN MÁY TÍNH', desc: 'CPU, VGA RTX, RAM & ổ cứng SSD siêu tốc', icon: <Cpu size={18} /> },
    { value: 'monitors', label: 'MÀN HÌNH MÁY TÍNH', desc: 'Màn hình đồ họa 4K & màn gaming 240Hz OLED', icon: <Monitor size={18} /> },
    { value: 'peripherals', label: 'BÀN PHÍM & CHUỘT', desc: 'Bàn phím cơ Custom & chuột gaming siêu nhẹ', icon: <Keyboard size={18} /> },
    { value: 'audio', label: 'TAI NGHE & LOA', desc: 'Tai nghe chụp tai ANC & loa thanh âm thanh vòm', icon: <Headphones size={18} /> },
    { value: 'smart-devices', label: 'THIẾT BỊ THÔNG MINH', desc: 'Apple Watch, Smartwatch & Smarthome IoT', icon: <Watch size={18} /> },
    { value: 'accessories', label: 'PHỤ KIỆN CÔNG NGHỆ', desc: 'Cáp chuyển đổi Hub USB-C, củ sạc nhanh PD', icon: <Plug size={18} /> }
  ]

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

  // Mock popular searches
  const popularSearches = [
    'MacBook Pro M3',
    'RTX 4090 PC',
    'Keychron Q1 Pro',
    'Logitech G Pro X 2',
    'Sony WH-1000XM5'
  ]

  // Mock cart items for preview
  const cartItems = [
    { id: 'tech-1', title: 'MacBook Pro M3 Max', price: 79990000, emoji: '💻', qty: 1 },
    { id: 'tech-4', title: 'Keychron Q1 Pro', price: 4590000, emoji: '⌨️', qty: 1 }
  ]

  const totalCartPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md transition-colors duration-300">
      <div className="max-w-full px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <List size={20} />}
            </button>

            <Link 
              to="/Trang-chu" 
              className="group flex items-center gap-3.5 tracking-widest text-lg font-black uppercase text-zinc-900 dark:text-white hover:opacity-90 transition-opacity"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.4)] group-hover:scale-105 transition-transform duration-300">
                <GameController size={20} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-[0.25em] leading-none text-zinc-900 dark:text-white dark:text-glow">GEARTECH</span>
                <span className="text-[8px] font-bold tracking-[0.4em] text-[#ff4655] mt-1">VALORANT ED.</span>
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
                placeholder="TÌM KIẾM THIẾT BỊ..."
                className="w-full pl-5 pr-11 py-2 rounded bg-zinc-100 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs tracking-wider text-zinc-800 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-550 focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655] transition-all duration-200 uppercase"
              />
              <button 
                type="submit" 
                className="absolute right-3.5 top-2.5 text-zinc-500 hover:text-[#ff4655] transition-colors"
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
                  className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl z-10 py-3"
                >
                  <div className="px-4 py-1.5 text-[9px] font-black text-[#ff4655] uppercase tracking-widest">
                    Tìm kiếm phổ biến
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
                        className="w-full text-left px-4 py-2 text-xs font-semibold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 flex items-center gap-2 transition-colors uppercase tracking-wider"
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
              <Link to="/Trang-chu" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                Trang chủ
              </Link>
              
              {/* Dropdown-enabled Categories Link */}
              <div 
                className="relative py-2"
                onMouseEnter={() => setCategoryHovered(true)}
                onMouseLeave={() => setCategoryHovered(false)}
              >
                <Link to="/ProductPage" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1">
                  Danh Mục <CaretDown size={10} className={`transition-transform duration-200 ${categoryHovered ? 'rotate-180 text-[#ff4655]' : ''}`} />
                </Link>

                <AnimatePresence>
                  {categoryHovered && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="fixed top-16 left-0 w-full bg-white/98 dark:bg-zinc-950/98 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800/80 shadow-2xl z-40 py-8 px-6 lg:px-12"
                    >
                      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
                        {/* Left Pane: Vertical Categories List (3 cols) */}
                        <div className="col-span-3 border-r border-zinc-200/80 dark:border-zinc-850 pr-6 space-y-1">
                          <span className="text-[7px] font-mono text-zinc-450 dark:text-zinc-550 uppercase tracking-[0.25em] pl-2 block mb-2">// CATEGORY_TABS</span>
                          {categoriesList.map((cat) => (
                            <button
                              key={cat.value}
                              onMouseEnter={() => setActiveCategoryTab(cat.value)}
                              onClick={() => {
                                setCategoryHovered(false)
                                if (cat.value === 'all') navigate('/ProductPage')
                                else if (cat.value === 'brand') navigate('/ProductPage')
                                else navigate(`/ProductPage?category=${cat.value}`)
                              }}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl font-black uppercase tracking-wider text-[10px] transition-all border-l-2 flex items-center gap-3.5 ${
                                activeCategoryTab === cat.value
                                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655] border-y-zinc-900/5 dark:border-y-zinc-800/10'
                                  : 'border-l-transparent text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
                              }`}
                            >
                              <span className={activeCategoryTab === cat.value ? 'text-[#ff4655]' : 'text-zinc-400 dark:text-zinc-500'}>
                                {cat.icon}
                              </span>
                              {cat.label}
                            </button>
                          ))}
                        </div>

                        {/* Right Pane: Dynamic Feature Area (9 cols) */}
                        <div className="col-span-9 pl-2 space-y-4">
                          
                          {/* 1. Dynamic Brands Grid when Tab is "brand" */}
                          {activeCategoryTab === 'brand' && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-900">
                                <span className="w-1.5 h-3.5 bg-[#ff4655]"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">HÃNG CÔNG NGHỆ HIỆN NAY // ALLIED BRAND ALLIANCE</span>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {techBrands.map((brand) => (
                                  <Link
                                    key={brand.name}
                                    to={`/ProductPage?search=${encodeURIComponent(brand.search)}`}
                                    onClick={() => setCategoryHovered(false)}
                                    className="group p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-800/80 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[90px] relative overflow-hidden"
                                  >
                                    <div className="absolute right-2 bottom-0 text-5xl opacity-5 group-hover:scale-105 transition-transform select-none">{brand.logo}</div>
                                    <div className="flex items-center gap-2 z-10">
                                      <span className="w-7 h-7 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-base flex items-center justify-center shrink-0 shadow-sm shadow-[#ff4655]/5">
                                        {brand.logo}
                                      </span>
                                      <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider group-hover:text-[#ff4655] transition-colors">{brand.name}</h4>
                                    </div>
                                    <p className="text-[8px] text-zinc-500 font-semibold leading-normal capitalize tracking-wide mt-2 z-10">{brand.desc}</p>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Sub-categories when Tab is not "brand" */}
                          {activeCategoryTab !== 'brand' && (
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 pb-2 border-b border-zinc-150 dark:border-zinc-900">
                                <span className="w-1.5 h-3.5 bg-[#ff4655]"></span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                                  CHI TIẾT PHÂN KHU // {categoriesList.find(c => c.value === activeCategoryTab)?.label}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {categorySubItems[activeCategoryTab]?.map((sub) => (
                                  <Link
                                    key={sub.label}
                                    to={sub.to}
                                    onClick={() => setCategoryHovered(false)}
                                    className="group p-4 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/30 dark:hover:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-800/80 rounded-2xl transition-all duration-200 flex flex-col justify-between min-h-[90px] relative overflow-hidden text-left"
                                  >
                                    <div className="absolute right-2 bottom-0 text-5xl opacity-5 group-hover:scale-105 transition-transform select-none">{sub.icon}</div>
                                    <div className="flex items-center gap-2 z-10">
                                      <span className="w-7 h-7 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-base flex items-center justify-center shrink-0 shadow-sm shadow-[#ff4655]/5">
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
                                            className="px-1.5 py-0.5 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] dark:hover:text-white text-zinc-700 dark:text-zinc-300 text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                          >
                                            {br.name}
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <span className="text-[8px] font-black text-[#ff4655] mt-3 group-hover:underline flex items-center gap-1 z-10 uppercase tracking-widest">
                                        Khám phá &raquo;
                                      </span>
                                    )}
                                  </Link>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/tintuc" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                Tin tức
              </Link>
              <Link to="/about" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                Chúng tôi là ai
              </Link>
              <Link to="/Cua-hang" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white font-bold text-xs uppercase tracking-widest transition-colors">
                Cửa hàng
              </Link>
            </nav>

            {/* Glowing Cart Icon with Preview Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setCartHovered(true)}
              onMouseLeave={() => setCartHovered(false)}
            >
              <Link 
                to="/cart" 
                className="p-2.5 rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center relative transition-all active:scale-95"
              >
                <ShoppingCart size={18} />
                <span className="absolute top-1 right-1 bg-[#ff4655] text-white rounded-full text-[9px] w-4 h-4 flex items-center justify-center font-black shadow-[0_0_10px_rgba(255,70,85,0.6)]">
                  {cartItems.length}
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
                    className="absolute right-0 mt-1 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl z-35 py-4"
                  >
                    <div className="px-4 pb-3 border-b border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                      <span className="text-[9px] font-black text-[#ff4655] uppercase tracking-widest">GIỎ HÀNG CỦA BẠN</span>
                      <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{cartItems.length} sản phẩm</span>
                    </div>
                    
                    {/* Cart preview list */}
                    <div className="max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                      {cartItems.map((item) => (
                        <div key={item.id} className="p-4 flex items-start gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-xl shrink-0 border border-zinc-200 dark:border-zinc-800">
                            {item.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{item.title}</h4>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1">SL: {item.qty}</p>
                          </div>
                          <div className="text-xs font-black text-[#ff4655]">
                            {formatPrice(item.price)}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart preview footer */}
                    <div className="px-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between mt-1">
                      <div>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tổng tiền:</p>
                        <p className="text-sm font-black text-zinc-900 dark:text-white">{formatPrice(totalCartPrice)}</p>
                      </div>
                      <Link 
                        to="/cart"
                        className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-4 py-2 rounded text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(255,70,85,0.3)] hover:shadow-[0_0_20px_rgba(255,70,85,0.5)] active:scale-95"
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
              className="p-2.5 rounded text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title={theme === 'dark' ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
            >
              {theme === 'dark' ? (
                <Sun size={18} className="text-yellow-500 animate-spin-slow" />
              ) : (
                <Moon size={18} className="text-zinc-650" />
              )}
            </button>

            {/* Auth check: Avatar Dropdown if logged in, else Đăng nhập Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 p-1 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850/60 focus:outline-none transition-all duration-200"
                >
                  <img
                    className="h-7 w-7 rounded-sm object-cover shadow-inner border border-zinc-200 dark:border-zinc-700"
                    src={currentUser.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                    alt="User avatar"
                  />
                  <CaretDown size={10} className="text-zinc-500 mr-1 hidden sm:inline" />
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
                        className="origin-top-right absolute right-0 mt-2.5 w-56 rounded shadow-2xl py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 z-20 focus:outline-none"
                      >
                        <div className="px-4 py-2 border-b border-zinc-100 dark:border-zinc-900 mb-1.5">
                          <p className="text-[9px] text-[#ff4655] font-black uppercase tracking-widest">ĐÃ ĐĂNG NHẬP</p>
                          <p className="text-xs font-black text-zinc-900 dark:text-white truncate mt-0.5">{currentUser.name}</p>
                          {currentUser.role === 'shop' ? (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[8px] font-black bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/20 uppercase tracking-wider">
                              🏬 DOANH NGHIỆP
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[8px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                              👑 {currentUser.memberRank || 'THUONG'} MEMBER
                            </span>
                          )}
                        </div>

                        <Link to="/profile" className="px-4 py-2 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                          <User size={14} />
                          Trang cá nhân
                        </Link>
                        <Link to="/orders" className="px-4 py-2 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
                          <Receipt size={14} />
                          Đơn mua của tôi
                        </Link>
                        <Link to="/settings" className="px-4 py-2 text-xs font-bold text-zinc-650 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-2 uppercase tracking-wide" onClick={() => setUserMenuOpen(false)}>
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
                className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-5 py-2.5 rounded text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255, 70, 85, 0.25)] hover:shadow-[0_0_25px_rgba(255, 70, 85, 0.55)] hover:scale-[1.03] active:scale-95 text-center flex items-center justify-center border border-[#ff4655]/40"
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
            className="md:hidden border-t border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 px-4 py-4 space-y-4 overflow-hidden"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-5 pr-11 py-2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
              />
              <button type="submit" className="absolute right-3.5 top-2.5 text-zinc-500">
                <MagnifyingGlass size={16} />
              </button>
            </form>
            <nav className="flex flex-col space-y-1">
              <Link to="/Trang-chu" className="px-3.5 py-2.5 rounded text-xs font-bold text-zinc-650 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Trang chủ
              </Link>
              <Link to="/ProductPage" className="px-3.5 py-2.5 rounded text-xs font-bold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Danh Mục
              </Link>
              <Link to="/tintuc" className="px-3.5 py-2.5 rounded text-xs font-bold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Tin tức
              </Link>
              <Link to="/about" className="px-3.5 py-2.5 rounded text-xs font-bold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Chúng tôi là ai
              </Link>
              <Link to="/Cua-hang" className="px-3.5 py-2.5 rounded text-xs font-bold text-zinc-655 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center gap-2 uppercase tracking-widest" onClick={() => setMobileMenuOpen(false)}>
                Cửa hàng
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
