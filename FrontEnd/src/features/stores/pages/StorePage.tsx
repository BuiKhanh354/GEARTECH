import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { shopService, type ShopItem } from '../../../services/shopService'
import { 
  Storefront, 
  Phone, 
  Envelope, 
  MagnifyingGlass, 
  Sparkle, 
  MapPin,
  Star,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  Package,
  CheckCircle,
  PlusCircle
} from '@phosphor-icons/react'

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<'all' | 'hcm' | 'hanoi' | 'danang' | 'other'>('all')
  const [shops, setShops] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeShop, setActiveShop] = useState<ShopItem | null>(null)

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true)
        const data = await shopService.getShops()
        if (Array.isArray(data)) {
          setShops(data)
          if (data.length > 0) {
            setActiveShop(data[0])
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách shop:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchShops()
  }, [])

  // Filter Shops by search text and city
  const filteredShops = useMemo(() => {
    return shops.filter(s => {
      const addr = (s.address || '').toLowerCase()
      let matchCity = true
      if (selectedCity === 'hcm') {
        matchCity = addr.includes('hồ chí minh') || addr.includes('hcm') || addr.includes('tp.hcm') || addr.includes('sài gòn')
      } else if (selectedCity === 'hanoi') {
        matchCity = addr.includes('hà nội') || addr.includes('ha noi') || addr.includes('hn')
      } else if (selectedCity === 'danang') {
        matchCity = addr.includes('đà nẵng') || addr.includes('da nang')
      } else if (selectedCity === 'other') {
        matchCity = !addr.includes('hồ chí minh') && !addr.includes('hcm') && !addr.includes('hà nội') && !addr.includes('đà nẵng')
      }

      const q = searchQuery.toLowerCase().trim()
      const matchText = !q || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.shop_name || '').toLowerCase().includes(q) || 
        (s.category || '').toLowerCase().includes(q) || 
        (s.address || '').toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q)

      return matchCity && matchText
    })
  }, [shops, selectedCity, searchQuery])

  const renderShopLogo = (shop: ShopItem) => {
    const logo = shop.logo?.trim()
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'))) {
      return <img src={logo} alt={shop.name} className="w-full h-full object-cover" />
    }
    return (
      <span className="text-xl font-black">{logo && logo !== '??' ? logo : '🏪'}</span>
    )
  }

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-16 transition-colors duration-200">
      
      {/* 1. Page Title Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
            <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
            <span>/</span>
            <span className="text-[#ff4655] font-black">CỬA HÀNG & CÁC SHOP</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#ff4655]"></span>
            <h1 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">
              // KHÁM PHÁ CÁC CỬA HÀNG & SHOP ĐANG HOẠT ĐỘNG
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {loading ? 'Đang đồng bộ...' : `${shops.length} SHOP ĐANG HOẠT ĐỘNG`}
          </span>

          <Link
            to="/profile?tab=shop"
            className="inline-flex items-center gap-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white text-[10px] font-mono font-black uppercase px-3.5 py-1.5 rounded transition-all shadow-sm hover:shadow-[0_0_12px_rgba(255,70,85,0.4)]"
          >
            <PlusCircle size={13} weight="bold" />
            Đăng ký mở shop
          </Link>
        </div>
      </div>

      {/* 2. Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Filter & Shops List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-zinc-950/80 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>

            {/* City Selector */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">// LỌC THEO KHU VỰC</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: `TẤT CẢ (${shops.length})` },
                  { id: 'hanoi', label: 'HÀ NỘI' },
                  { id: 'hcm', label: 'TP. HỒ CHÍ MINH' },
                  { id: 'danang', label: 'ĐÀ NẴNG' },
                  { id: 'other', label: 'TỈNH THÀNH KHÁC' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedCity(tab.id as any)}
                    className={`text-[9px] px-3.5 py-1.5 rounded font-black uppercase tracking-wider border transition-all cursor-pointer ${
                      selectedCity === tab.id
                        ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-md shadow-[#ff4655]/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TÌM THEO TÊN SHOP, DANH MỤC HOẶC ĐỊA CHỈ..."
                className="w-full pl-9 pr-4 py-2.5 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white rounded placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655] uppercase font-semibold tracking-wider transition-colors"
              />
              <MagnifyingGlass size={15} className="absolute left-3 top-3 text-zinc-400" />
            </div>
          </div>

          {/* Shops Cards List */}
          <div className="space-y-3 overflow-y-auto max-h-[750px] pr-1">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-36 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredShops.map((shop) => {
                  const isSelected = (activeShop?._id || activeShop?.id) === (shop._id || shop.id)
                  return (
                    <motion.div
                      layout
                      key={shop._id || shop.id}
                      onClick={() => setActiveShop(shop)}
                      whileHover={{ scale: 1.01 }}
                      className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                        isSelected
                          ? 'bg-zinc-50 dark:bg-zinc-900/90 border-[#ff4655] shadow-lg shadow-[#ff4655]/10'
                          : 'bg-white dark:bg-zinc-950/70 border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                            {renderShopLogo(shop)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors line-clamp-1">
                                {shop.name || shop.shop_name}
                              </h4>
                              <ShieldCheck size={14} weight="fill" className="text-blue-500 shrink-0" />
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1">
                              {shop.category || 'Cửa hàng máy tính & linh kiện'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Đang mở cửa
                        </span>
                      </div>

                      {shop.description && (
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {shop.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-900 pt-3 gap-2">
                        <div className="flex items-center gap-1.5 truncate max-w-[280px]">
                          <MapPin size={12} className="text-[#ff4655] shrink-0" weight="fill" />
                          <span className="truncate">{shop.address || 'Hà Nội / TP.HCM'}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star size={11} weight="fill" /> {shop.rating || 5.0}
                          </span>
                          <span className="text-zinc-400">•</span>
                          <span>{shop.total_products || 0} SP</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {filteredShops.length === 0 && (
                  <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 text-center text-zinc-400 space-y-2">
                    <Storefront size={36} className="mx-auto text-zinc-400" />
                    <p className="text-xs font-black uppercase tracking-widest">// KHÔNG TÌM THẤY GIAN HÀNG PHÙ HỢP</p>
                    <p className="text-[11px] text-zinc-500">Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc "TẤT CẢ".</p>
                  </div>
                )}
              </AnimatePresence>
            )}
          </div>

        </div>

        {/* Right Side: Detailed Shop Preview Panel (5 cols sticky) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          {activeShop ? (
            <div className="bg-white dark:bg-zinc-950/90 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-2xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4655] to-amber-500"></div>

              {/* Shop Profile Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-md">
                  {renderShopLogo(activeShop)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-[#ff4655] uppercase tracking-widest">
                      // GIAN HÀNG XÁC THỰC
                    </span>
                    <CheckCircle size={13} weight="fill" className="text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    {activeShop.name || activeShop.shop_name}
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    {activeShop.category || 'Cửa hàng máy tính & linh kiện công nghệ'}
                  </p>
                </div>
              </div>

              {/* Shop Description */}
              <div className="bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80 space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">GIỚI THIỆU GIAN HÀNG:</span>
                <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                  {activeShop.description || 'Gian hàng đối tác chính thức được xác thực bởi GearTech. Cam kết phân phối 100% linh kiện chính hãng, bảo hành chuẩn mực và hỗ trợ kỹ thuật chuyên sâu.'}
                </p>
              </div>

              {/* Contact & Location Details */}
              <div className="space-y-2.5 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#ff4655] shrink-0 mt-0.5" weight="fill" />
                  <span>{activeShop.address || 'Hà Nội / TP. Hồ Chí Minh / Toàn quốc'}</span>
                </div>

                {activeShop.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={16} className="text-[#ff4655] shrink-0" weight="fill" />
                    <span>Hotline: <strong className="text-zinc-900 dark:text-white">{activeShop.phone}</strong></span>
                  </div>
                )}

                {activeShop.email && (
                  <div className="flex items-center gap-2.5">
                    <Envelope size={16} className="text-[#ff4655] shrink-0" weight="fill" />
                    <span>Email: <strong className="text-zinc-900 dark:text-white">{activeShop.email}</strong></span>
                  </div>
                )}
              </div>

              {/* Key Trust Highlights */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-zinc-100 dark:border-zinc-900">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 flex items-center gap-2">
                  <Sparkle size={16} className="text-[#ff4655]" weight="fill" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 block">CHÍNH HÃNG 100%</span>
                    <span className="text-[8px] text-zinc-400 block font-mono">Bảo hành 1 đổi 1</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-150 dark:border-zinc-850 flex items-center gap-2">
                  <Package size={16} className="text-emerald-500" weight="fill" />
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-800 dark:text-zinc-200 block">GIAO SIÊU TỐC</span>
                    <span className="text-[8px] text-zinc-400 block font-mono">Đóng gói chuẩn eSports</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <Link
                  to={`/shop/${activeShop._id || activeShop.id}`}
                  className="flex-1 bg-[#ff4655] hover:bg-[#e03d4b] text-white py-3 rounded text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-[#ff4655]/20 flex items-center justify-center gap-1.5 text-center"
                >
                  Ghé thăm gian hàng <ArrowRight size={13} weight="bold" />
                </Link>
                {activeShop.phone && (
                  <a
                    href={`tel:${activeShop.phone.replace(/[^0-9]/g, '')}`}
                    className="border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 py-3 px-4 rounded text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Phone size={13} className="text-[#ff4655]" /> Gọi điện
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 text-center text-zinc-400">
              <Storefront size={40} className="mx-auto mb-2 text-zinc-500" />
              <p className="text-xs font-black uppercase tracking-wider">CHỌN MỘT GIAN HÀNG ĐỂ XEM CHI TIẾT</p>
            </div>
          )}

          {/* Become a Partner Callout Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-6 text-white space-y-3 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-[#ff4655] font-black text-sm">✦</span>
              <h4 className="text-xs font-black uppercase tracking-wider">HỢP TÁC KINH DOANH CÙNG GEARTECH</h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bạn là nhà phân phối, cửa hàng máy tính hoặc đại lý gaming gear? Tiếp cận hơn 150.000 khách hàng tiềm năng ngay hôm nay.
            </p>
            <Link
              to="/profile?tab=shop"
              className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#ff4655] hover:text-white uppercase tracking-wider transition-colors pt-1"
            >
              ĐĂNG KÝ MỞ GIAN HÀNG NGAY <ArrowUpRight size={11} weight="bold" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  )
}
