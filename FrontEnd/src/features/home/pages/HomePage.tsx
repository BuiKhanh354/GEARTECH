import React from 'react'
import { motion } from 'motion/react'
import { 
  Laptop,
  Desktop,
  Cpu,
  Monitor,
  Keyboard,
  Mouse,
  Headphones,
  Watch,
  Plug,
  Lightning,
  Flame,
  ArrowRight,
  Tag,
  Star,
  CaretDown,
  ShieldCheck,
  Wrench,
  Truck
} from '@phosphor-icons/react'
import { mockProducts } from '../../products/data/productsData'
import backgroundVideo from '../../../assets/video/BackgroundLoop.mp4'
import lightHeroImage from '../../../assets/images/predator-helios-neo-16s-ai-phn16s-71-(agw)-banner-2560x1080-(DT).avif'
import { formatPrice } from '../../../utils/format'

const isImageUrl = (str: string) => {
  if (!str) return false
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/') || str.startsWith('data:image/')
}

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const HomePage: React.FC = () => {
  // Tech categories (clean vector icons)
  const categories: Category[] = [
    { id: '1', name: 'LAPTOP & MACBOOK', icon: <Laptop size={26} /> },
    { id: '2', name: 'PC & WORKSTATION', icon: <Desktop size={26} /> },
    { id: '3', name: 'LINH KIỆN MÁY TÍNH', icon: <Cpu size={26} /> },
    { id: '4', name: 'MÀN HÌNH ĐỒ HỌA', icon: <Monitor size={26} /> },
    { id: '5', name: 'BÀN PHÍM CƠ', icon: <Keyboard size={26} /> },
    { id: '6', name: 'CHUỘT GAMING', icon: <Mouse size={26} /> },
    { id: '7', name: 'TAI NGHE CHỤP TAI', icon: <Headphones size={26} /> },
    { id: '8', name: 'SMARTWATCH', icon: <Watch size={26} /> },
    { id: '9', name: 'CỦ SẠC & DÂY CÁP', icon: <Plug size={26} /> },
    { id: '10', name: 'PHỤ KIỆN HIGH-TECH', icon: <Lightning size={26} /> },
  ]

  // Filter flash sale products
  const flashSaleProducts = mockProducts.slice(0, 5)

  // Recommended Products
  const recommendProducts = mockProducts.slice(4, 10)

  // Featured Tech Shops
  const featuredShops = [
    {
      id: 'shop1',
      name: 'APPLE MALL',
      category: 'MacBook & Apple Ecosystem',
      rating: '4.9',
      followers: '1.2M',
      logo: '🍎',
      bgClass: 'from-zinc-900 via-zinc-950 to-black text-white border-zinc-800'
    },
    {
      id: 'shop2',
      name: 'ASUS ROG ZONE',
      category: 'ROG Laptop & Gaming Hardware',
      rating: '4.9',
      followers: '450K',
      logo: '👹',
      bgClass: 'from-red-950/20 via-zinc-950 to-black text-white border-red-500/20'
    },
    {
      id: 'shop3',
      name: 'LOGITECH G LAB',
      category: 'Lightspeed Gear & Gaming Mice',
      rating: '4.9',
      followers: '680K',
      logo: '👾',
      bgClass: 'from-blue-950/20 via-zinc-950 to-black text-white border-blue-500/20'
    },
    {
      id: 'shop4',
      name: 'KEYCHRON LABS',
      category: 'Custom Keyboards & Accessories',
      rating: '4.9',
      followers: '85K',
      logo: '⌨️',
      bgClass: 'from-amber-950/20 via-zinc-950 to-black text-white border-amber-500/20'
    }
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'tween', ease: 'easeOut', duration: 0.3 } }
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* 1. Cinematic Fullscreen Video Hero Section */}
      <section className="relative w-full h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center border-b border-zinc-200 dark:border-zinc-900 bg-black">
        
        {/* Fullscreen Video Background (Dark Mode) */}
        <video
          src={backgroundVideo}
          autoPlay
          loop
          muted
          playsInline
          className="hidden dark:block absolute inset-0 w-full h-full object-cover opacity-45 z-0 pointer-events-none"
        />

        {/* Fullscreen Image Background (Light Mode) */}
        <img
          src={lightHeroImage}
          alt="Light Theme Smoked Hero"
          className="block dark:hidden absolute inset-0 w-full h-full object-cover opacity-100 z-0 pointer-events-none"
        />

        {/* Ambient Dark Gradient Overlays (Dark Mode) */}
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-zinc-950/60 z-0"></div>
        <div className="hidden dark:block absolute inset-0 bg-gradient-to-r from-zinc-950/40 via-transparent to-zinc-950/40 z-0"></div>

        {/* Cinematic Content Overlay */}
        <div className="max-w-4xl text-center px-6 z-10 space-y-6 flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-[#ff4655]/10 text-[10px] font-black uppercase tracking-[0.25em] border border-[#ff4655]/30 text-[#ff4655] text-glow"
          >
            <Tag size={10} weight="fill" /> // GEARTECH DIVISION // EXPERT SPEC
          </motion.span>
          
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, type: 'tween', ease: 'easeOut' }}
            className="text-4xl sm:text-7xl font-black tracking-tighter leading-none text-zinc-900 dark:text-white uppercase"
          >
            GEAR UP FOR <br/>
            <span className="text-[#ff4655] text-glow">VICTORY</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xs sm:text-base text-zinc-600 dark:text-zinc-400 font-semibold max-w-2xl leading-relaxed tracking-wider"
          >
            Trang bị các dòng sản phẩm máy tính tối tân nhất đạt chuẩn thi đấu. Trải nghiệm hệ sinh thái PC Gaming, phụ kiện chuyên nghiệp và dịch vụ bảo hành 1 đổi 1 tối thượng.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: 'tween', ease: 'easeOut', duration: 0.5 }}
            className="pt-4"
          >
            <button 
              onClick={() => {
                const element = document.getElementById('main-content')
                element?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-8 py-4 rounded-sm font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-98 transition-all shadow-[0_0_20px_rgba(255, 70, 85, 0.4)] hover:shadow-[0_0_35px_rgba(255, 70, 85, 0.65)] flex items-center gap-2 border border-[#ff4655]/50 cursor-pointer"
            >
              KHÁM PHÁ CÁC SẢN PHẨM CHIẾN ĐẤU <ArrowRight size={14} weight="bold" />
            </button>
          </motion.div>
        </div>

        {/* Pulse Scroll Down Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 cursor-pointer"
             onClick={() => {
               const element = document.getElementById('main-content')
               element?.scrollIntoView({ behavior: 'smooth' })
             }}
        >
          <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase select-none">CUỘN XUỐNG</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            className="text-yellow-500"
          >
            <CaretDown size={20} weight="bold" />
          </motion.div>
        </div>

      </section>

      {/* 2. Scrollable Body Content */}
      <div id="main-content" className="max-w-full px-6 lg:px-12 py-12 space-y-12 bg-grid-pattern">
        
        {/* Tech Features Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.3)' }}
            className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-md p-6 flex flex-col justify-between min-h-[160px] shadow-sm dark:shadow-lg relative group transition-all duration-300"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-[#ff4655]/10 border border-[#ff4655]/20 flex items-center justify-center text-[#ff4655]">
                  <Wrench size={16} weight="fill" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#ff4655]">// THIẾT KẾ CẤU HÌNH</span>
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-white mt-2">Build PC Trả Góp 0%</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Tự do build PC Gaming, Workstation đồ họa. Xét duyệt hồ sơ online cực nhanh, hỗ trợ trả góp lãi suất 0%.</p>
            </div>
            <div className="absolute right-6 bottom-6 text-2xl opacity-10 group-hover:opacity-60 transition-opacity">🖥️</div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(59, 130, 246, 0.3)' }}
            className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-md p-6 flex flex-col justify-between min-h-[160px] shadow-sm dark:shadow-lg relative group transition-all duration-300"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <ShieldCheck size={16} weight="fill" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-400">// CHÍNH SÁCH BẢO HÀNH</span>
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-white mt-2">Bảo Hành 1 Đổi 1</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">An tâm tuyệt đối với đặc quyền 1 đổi 1 trong vòng 30 ngày cho mọi dòng Laptop, linh kiện phần cứng nếu gặp lỗi sản xuất.</p>
            </div>
            <div className="absolute right-6 bottom-6 text-2xl opacity-10 group-hover:opacity-60 transition-opacity">🛡️</div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(34, 197, 94, 0.3)' }}
            className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-md p-6 flex flex-col justify-between min-h-[160px] shadow-sm dark:shadow-lg relative group transition-all duration-300"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Truck size={16} weight="fill" />
                </span>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400">// GIAO HÀNG SIÊU TỐC</span>
              </div>
              <h3 className="text-lg font-black tracking-tight uppercase text-zinc-900 dark:text-white mt-2">Giao Hàng Hỏa Tốc 2H</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Hỗ trợ giao hàng hỏa tốc trong vòng 2 giờ nội thành cho các đơn hàng linh kiện, chuột bàn phím cơ và tai nghe.</p>
            </div>
            <div className="absolute right-6 bottom-6 text-2xl opacity-10 group-hover:opacity-60 transition-opacity">⚡</div>
          </motion.div>

        </section>

        {/* Categories Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <span className="w-1.5 h-4 bg-[#ff4655]"></span>
            <h3 className="text-xs font-black tracking-[0.2em] text-zinc-800 dark:text-white uppercase">// DANH MỤC THIẾT BỊ</h3>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3"
          >
            {categories.map((cat) => (
              <motion.div
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -4, borderColor: 'rgba(255, 70, 85, 0.4)' }}
                className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-sm p-4 flex flex-col items-center justify-center text-center cursor-pointer shadow-sm hover:shadow-neon transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 text-[#ff4655] flex items-center justify-center mb-3">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 leading-tight uppercase tracking-wider">
                  {cat.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Flash Sale Section */}
        <section className="bg-white dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800/80 rounded-md p-6 shadow-sm dark:shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#ff4655]"></div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-250 dark:border-zinc-800/50 pl-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-sm bg-[#ff4655] text-white animate-pulse">
                <Flame size={16} weight="fill" />
              </span>
              <h3 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">
                // GIỜ VÀNG CHIẾN ĐẤU // PHÂN KHU HẠ NHIỆT
              </h3>
              <div className="flex items-center gap-1.5 ml-2">
                <span className="bg-yellow-500/10 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] px-2 py-1 rounded-sm font-bold border border-yellow-500/20">02</span>
                <span className="text-zinc-650 dark:text-zinc-500 font-bold">:</span>
                <span className="bg-yellow-500/10 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] px-2 py-1 rounded-sm font-bold border border-yellow-500/20">14</span>
                <span className="text-zinc-655 dark:text-zinc-500 font-bold">:</span>
                <span className="bg-yellow-500/10 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] px-2 py-1 rounded-sm font-bold border border-yellow-500/20">35</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {flashSaleProducts.map((prod) => (
              <motion.div 
                key={prod.id} 
                whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.3)' }}
                className="group bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-sm overflow-hidden shadow-sm hover:shadow-neon transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="h-44 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-4xl relative border-b border-zinc-155 dark:border-zinc-900 overflow-hidden">
                  {isImageUrl(prod.imageEmoji) ? (
                    <img src={prod.imageEmoji} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                  ) : (
                    prod.imageEmoji
                  )}
                  {prod.discount && (
                    <span className="absolute top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-sm shadow-[0_0_10px_rgba(234,179,8,0.4)]">
                      {prod.discount}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <h4 className="text-xs font-bold text-zinc-850 dark:text-zinc-300 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase tracking-wide">
                    {prod.title}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="current-price text-sm font-extrabold text-[#ff4655] text-glow">{formatPrice(prod.price)}</span>
                      {prod.oldPrice && (
                        <span className="old-price text-[10px] text-zinc-400 line-through">{formatPrice(prod.oldPrice)}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">{prod.salesCount}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Featured Tech Brands / Allied Partners */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <span className="w-1.5 h-4 bg-[#ff4655]"></span>
            <h3 className="text-xs font-black tracking-[0.2em] text-zinc-800 dark:text-white uppercase">// ĐỐI TÁC CÔNG NGHỆ LIÊN MINH</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredShops.map((shop) => (
              <motion.div
                key={shop.id}
                whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.3)' }}
                className={`relative overflow-hidden rounded-md bg-gradient-to-br ${shop.bgClass} p-5 flex flex-col justify-between min-h-[160px] shadow-sm hover:shadow-neon border transition-all duration-300 cursor-pointer group`}
              >
                <div className="absolute right-0 bottom-0 text-7xl opacity-5 group-hover:scale-110 transition-transform duration-300 select-none">
                  {shop.logo}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-sm bg-white/10 flex items-center justify-center text-xl backdrop-blur-sm shrink-0 border border-white/10">
                      {shop.logo}
                    </span>
                    <div>
                      <h4 className="text-xs font-black tracking-wider uppercase text-white">{shop.name}</h4>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase mt-0.5">{shop.category}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-900/30 mt-2 z-10">
                  <div className="flex gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-0.5 text-amber-500">
                      <Star size={11} weight="fill" /> {shop.rating}
                    </span>
                    <span className="text-zinc-500 uppercase tracking-wide">{shop.followers} Follower</span>
                  </div>
                  <span className="text-[9px] font-black bg-white text-zinc-950 group-hover:bg-[#ff4655] group-hover:text-white px-3 py-1.5 rounded-sm transition-all uppercase tracking-widest">
                    Ghé thăm
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recommended Products Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
            <span className="w-1.5 h-4 bg-[#ff4655]"></span>
            <h3 className="text-xs font-black tracking-[0.2em] text-zinc-800 dark:text-white uppercase">// ĐỀ XUẤT THIẾT BỊ HÔM NAY</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recommendProducts.map((prod) => (
              <motion.div 
                key={prod.id} 
                whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.3)' }}
                className="group bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-sm overflow-hidden shadow-sm hover:shadow-neon transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="h-40 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-center text-3xl border-b border-zinc-150 dark:border-zinc-900 overflow-hidden">
                  {isImageUrl(prod.imageEmoji) ? (
                    <img src={prod.imageEmoji} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350" />
                  ) : (
                    prod.imageEmoji
                  )}
                </div>
                <div className="p-3.5 space-y-2">
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-400 line-clamp-2 min-h-[32px] group-hover:text-zinc-900 dark:group-hover:text-white transition-colors uppercase tracking-wide">
                    {prod.title}
                  </h4>
                  <div className="space-y-0.5">
                    <span className="text-sm font-extrabold text-[#ff4655] text-glow block">
                      {formatPrice(prod.price)}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-500 block uppercase tracking-wider">
                      {prod.salesCount}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default HomePage
