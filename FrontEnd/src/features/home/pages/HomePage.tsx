import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import {
  Lightning,
  Flame,
  ArrowRight,
  Tag,
  Star,
  CaretDown,
  ShieldCheck,
  Wrench,
  Truck,
  ShoppingCart,
  CheckCircle,
  Clock,
  Sparkle,
  ArrowUpRight
} from '@phosphor-icons/react'
import { productService, type ProductItem } from '../../../services/productService'
import { categoryService } from '../../../services/categoryService'
import { shopService, type ShopItem } from '../../../services/shopService'
import { useCartStore } from '../../../store/cartStore'
import { SafeProductImage } from '../../../components/common/ProductImage'
import backgroundVideo from '../../../assets/video/BackgroundLoop.mp4'
import lightHeroImage from '../../../assets/images/predator-helios-neo-16s-ai-phn16s-71-(agw)-banner-2560x1080-(DT).avif'
import { formatPrice } from '../../../utils/format'

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  subtitle: string;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate()

  // Real data states from Backend API
  const [allProducts, setAllProducts] = useState<ProductItem[]>([])
  const [featuredShops, setFeaturedShops] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)

  // Interactive Category Filter on Homepage
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all')

  // Flash Sale Live Ticking Countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 45, seconds: 18 })
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return { hours: 2, minutes: 59, seconds: 59 }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Cart Add Toast Notification
  const [addedToast, setAddedToast] = useState<string | null>(null)
  const handleAddToCart = async (e: React.MouseEvent, prod: ProductItem) => {
    e.stopPropagation()
    try {
      await useCartStore.getState().addItem(prod)
      setAddedToast(`Đã thêm "${prod.title}" vào giỏ hàng!`)
      setTimeout(() => setAddedToast(null), 2500)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [productRes, shopRes] = await Promise.all([
          productService.getProducts({ limit: 20 }),
          shopService.getShops()
        ])
        if (productRes && Array.isArray(productRes.products)) {
          setAllProducts(productRes.products)
        }
        if (Array.isArray(shopRes)) {
          setFeaturedShops(shopRes)
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu trang chủ:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Danh mục hiển thị lấy THẬT từ MongoDB qua /api/categories
  // (Admin thêm/sửa/ẩn danh mục sẽ tự động phản ánh tại đây)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    let cancelled = false
    categoryService.getCategories()
      .then((cats) => {
        if (cancelled || !Array.isArray(cats)) return
        setCategories(cats.map((c) => ({
          id: c._id || c.slug,
          name: c.name,
          slug: c.slug,
          icon: <span className="text-xl leading-none">{c.icon || '📦'}</span>,
          subtitle: (c.description || '').slice(0, 40)
        })))
      })
      .catch((err) => console.error('Lỗi nạp danh mục trang chủ:', err))
    return () => { cancelled = true }
  }, [])

  // Filter flash sale products from real API
  const flashSaleProducts = allProducts.slice(0, 5)

  // Filtered Showcase Products
  const showcaseProducts = activeCategoryFilter === 'all' 
    ? allProducts.slice(0, 8) 
    : allProducts.filter(p => p.category?.toLowerCase() === activeCategoryFilter.toLowerCase()).slice(0, 8)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
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

      {/* ========================================================================= */}
      {/* 2. INFINITE CYBER MARQUEE (Chuyển động liên tục êm ái phong cách Hi-Tech) */}
      {/* ========================================================================= */}
      <div className="relative w-full overflow-hidden border-y border-zinc-200 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md py-3.5 shadow-sm z-20">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.22em] text-zinc-700 dark:text-zinc-200">
          {/* Loop 1 */}
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <ShieldCheck size={15} className="text-emerald-500" />
            100% CHÍNH HÃNG GEARTECH CERTIFIED
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Lightning size={15} className="text-[#ff4655]" />
            GIAO HỎA TỐC 2H NỘI THÀNH
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Sparkle size={15} className="text-yellow-500" />
            TRẢ GÓP LÃI SUẤT 0% THỦ TỤC 5 PHÚT
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Wrench size={15} className="text-blue-500" />
            ĐẶC QUYỀN 1 ĐỔI 1 TRONG 30 NGÀY
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Flame size={15} className="text-[#ff4655]" />
            HỆ SINH THÁI CHIẾN ĐẤU ESPORTS ĐỈNH CAO
          </span>
          <span className="text-[#ff4655] font-mono">//</span>

          {/* Loop 2 Duplicate for continuous loop */}
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <ShieldCheck size={15} className="text-emerald-500" />
            100% CHÍNH HÃNG GEARTECH CERTIFIED
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Lightning size={15} className="text-[#ff4655]" />
            GIAO HỎA TỐC 2H NỘI THÀNH
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Sparkle size={15} className="text-yellow-500" />
            TRẢ GÓP LÃI SUẤT 0% THỦ TỤC 5 PHÚT
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Wrench size={15} className="text-blue-500" />
            ĐẶC QUYỀN 1 ĐỔI 1 TRONG 30 NGÀY
          </span>
          <span className="text-[#ff4655] font-mono">//</span>
          <span className="flex items-center gap-2">
            <Flame size={15} className="text-[#ff4655]" />
            HỆ SINH THÁI CHIẾN ĐẤU ESPORTS ĐỈNH CAO
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. SCROLLABLE BODY CONTENT (Hero Banner ở trên được giữ nguyên 100%)       */}
      {/* ========================================================================= */}
      <div id="main-content" className="max-w-full px-6 lg:px-12 py-12 space-y-16 bg-grid-pattern">
        
        {/* SECTION A: CYBER PODS - 3 TRỤ CỘT DỊCH VỤ CÔNG NGHỆ */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.6)' }}
            className="bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between min-h-[175px] shadow-sm hover:shadow-xl relative group transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>
            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-[#ff4655]/10 border border-[#ff4655]/30 flex items-center justify-center text-[#ff4655] shadow-sm group-hover:scale-105 transition-transform">
                  <Wrench size={20} weight="fill" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30 uppercase">
                  LÃI SUẤT 0%
                </span>
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight uppercase text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors">
                  Build PC & Cấu Hình Đồ Họa
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-1">
                  Đội ngũ kỹ sư build cấu hình tối ưu hiệu năng. Hỗ trợ trả góp 0% qua thẻ tín dụng và CCCD duyệt nhanh 5 phút.
                </p>
              </div>
            </div>
            <div className="pl-2 pt-3 flex items-center justify-between text-[10px] font-black uppercase text-[#ff4655] tracking-wider">
              <span>BẮT ĐẦU BUILD NGAY</span>
              <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(37, 99, 235, 0.6)' }}
            className="bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between min-h-[175px] shadow-sm hover:shadow-xl relative group transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck size={20} weight="fill" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/30 uppercase">
                  30 NGÀY VIP
                </span>
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight uppercase text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">
                  Bảo Hành 1 Đổi 1 Tận Nơi
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-1">
                  Đặc quyền 1 đổi 1 trong 30 ngày nếu phát sinh lỗi phần cứng từ nhà sản xuất. Hỗ trợ mượn máy thay thế khi bảo hành.
                </p>
              </div>
            </div>
            <div className="pl-2 pt-3 flex items-center justify-between text-[10px] font-black uppercase text-blue-500 tracking-wider">
              <span>TRA CỨU BẢO HÀNH</span>
              <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5, borderColor: 'rgba(16, 185, 129, 0.6)' }}
            className="bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between min-h-[175px] shadow-sm hover:shadow-xl relative group transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
            <div className="space-y-3 pl-2">
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm group-hover:scale-105 transition-transform">
                  <Truck size={20} weight="fill" />
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase">
                  SIÊU TỐC 2H
                </span>
              </div>
              <div>
                <h3 className="text-base font-black tracking-tight uppercase text-zinc-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  Giao Hàng Hỏa Tốc & Miễn Phí
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-1">
                  Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000₫. Đóng gói chuyên dụng chống sốc đạt chuẩn vận chuyển đồ công nghệ.
                </p>
              </div>
            </div>
            <div className="pl-2 pt-3 flex items-center justify-between text-[10px] font-black uppercase text-emerald-500 tracking-wider">
              <span>XEM CHÍNH SÁCH SHIP</span>
              <ArrowRight size={14} weight="bold" className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </section>

        {/* SECTION B: BỘ SƯU TẬP CHIẾN HẠM 2026 (DUAL BATTLE STATION PROMO BANNERS) */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Banner 1: ROG & MSI Gaming Arena */}
          <div 
            onClick={() => navigate('/ProductPage?category=desktops')}
            className="group relative overflow-hidden rounded-2xl p-7 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black border border-zinc-800 hover:border-[#ff4655]/70 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between min-h-[230px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff4655]/15 rounded-full blur-3xl group-hover:bg-[#ff4655]/25 transition-all pointer-events-none"></div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-[#ff4655] text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                  ROG // TITAN SERIES 2026
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">FPS 240+ RAY TRACING</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight group-hover:text-[#ff4655] transition-colors max-w-md">
                CHIẾN HẠM PC GAMING ĐỈNH CAO THI ĐẤU ESPORTS
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Trang bị cấu hình GeForce RTX 4090, Intel Core Ultra 9 và bo mạch chủ ROG Strix tối tân nhất.
              </p>
            </div>
            <div className="relative z-10 pt-4 flex items-center justify-between">
              <span className="text-xs font-black text-[#ff4655] uppercase tracking-wider">Giá từ 28.990.000₫</span>
              <span className="px-4 py-2 bg-white text-zinc-950 group-hover:bg-[#ff4655] group-hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5">
                Khám phá ngay <ArrowUpRight size={13} weight="bold" />
              </span>
            </div>
          </div>

          {/* Banner 2: AI Workstation & Watercooling */}
          <div 
            onClick={() => navigate('/ProductPage?category=components')}
            className="group relative overflow-hidden rounded-2xl p-7 bg-gradient-to-br from-zinc-950 via-zinc-900 to-[#071324] border border-zinc-800 hover:border-blue-500/70 transition-all duration-300 cursor-pointer shadow-lg flex flex-col justify-between min-h-[230px]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl group-hover:bg-blue-500/25 transition-all pointer-events-none"></div>
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest shadow-sm">
                  AI WORKSTATION & CUSTOM WATERCOOL
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-400">RENDER 8K // TRAINING AI</span>
              </div>
              <h3 className="text-xl font-black uppercase text-white tracking-tight group-hover:text-blue-400 transition-colors max-w-md">
                HỆ THỐNG ĐỒ HỌA CHUYÊN NGHIỆP & TẢN NƯỚC ĐỘC BẢN
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Hỗ trợ Dual GPU, tản nhiệt nước ống đồng mạ niken tối ưu nhiệt độ hoạt động 24/7 không giới hạn.
              </p>
            </div>
            <div className="relative z-10 pt-4 flex items-center justify-between">
              <span className="text-xs font-black text-blue-400 uppercase tracking-wider">Tùy biến theo yêu cầu</span>
              <span className="px-4 py-2 bg-white text-zinc-950 group-hover:bg-blue-600 group-hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5">
                Nhận tư vấn <ArrowUpRight size={13} weight="bold" />
              </span>
            </div>
          </div>
        </section>

        {/* SECTION C: 10 PHÂN KHU CHUYÊN SÂU - MODERN TECH GLASS PODS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
              <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">// DANH MỤC THIẾT BỊ CÔNG NGHỆ CHUYÊN SÂU</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">10 PHÂN KHU THI ĐẤU</span>
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
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => navigate(`/ProductPage?category=${cat.slug}`)}
                className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 hover:border-[#ff4655]/60 hover:shadow-[0_0_20px_rgba(255,70,85,0.25)] rounded-xl p-3.5 flex flex-col items-center justify-between text-center cursor-pointer shadow-sm transition-all duration-300 group min-h-[125px]"
              >
                <div className="w-11 h-11 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-[#ff4655] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#ff4655] group-hover:text-white transition-all shadow-inner">
                  {cat.icon}
                </div>
                <div className="mt-2 space-y-0.5">
                  <span className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 leading-tight uppercase tracking-wider block group-hover:text-[#ff4655] transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                  <span className="text-[8px] font-mono text-zinc-400 dark:text-zinc-500 block uppercase">
                    {cat.subtitle}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* SECTION D: GIỜ VÀNG CHIẾN ĐẤU (FLASH SALE CYBER HUD) */}
        <section className="bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-[#ff4655]"></div>

          {/* Cyber HUD Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800/80 pl-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#ff4655] text-white shadow-[0_0_15px_rgba(255,70,85,0.5)] animate-pulse">
                <Flame size={18} weight="fill" />
              </span>
              <div>
                <h3 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase flex items-center gap-2">
                  // GIỜ VÀNG CHIẾN ĐẤU // FLASH DEALS
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono">CẬP NHẬT GIÁ SỐC MỖI 24 GIỜ</span>
              </div>

              {/* HUD Live Countdown */}
              <div className="flex items-center gap-1.5 sm:ml-4 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <Clock size={14} className="text-[#ff4655]" weight="bold" />
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase mr-1">KẾT THÚC TRONG:</span>
                <span className="bg-[#ff4655] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[#ff4655] font-black">:</span>
                <span className="bg-[#ff4655] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[#ff4655] font-black">:</span>
                <span className="bg-[#ff4655] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded shadow">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/ProductPage?search=sale')}
              className="text-xs font-black text-[#ff4655] hover:text-[#e03d4b] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
            >
              Xem toàn bộ ưu đãi &raquo;
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-72 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl animate-pulse border border-zinc-200 dark:border-zinc-800" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {flashSaleProducts.map((prod) => (
                <motion.div 
                  key={prod._id || prod.id} 
                  whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.5)' }}
                  onClick={() => navigate(`/product/${prod._id || prod.id}`)}
                  className="group bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800/90 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-44 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-4xl relative border-b border-zinc-100 dark:border-zinc-800/80 overflow-hidden">
                    <SafeProductImage src={prod.imageEmoji} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    
                    {/* Badge Giảm Giá Góc Gaming */}
                    <span className="absolute top-2.5 left-2.5 bg-[#ff4655] text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-sm shadow-md flex items-center gap-1">
                      <Flame size={10} weight="fill" />
                      {prod.discount || '-15%'}
                    </span>

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      title="Thêm vào giỏ hàng ngay"
                      className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-zinc-900/80 hover:bg-[#ff4655] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md backdrop-blur-sm cursor-pointer"
                    >
                      <ShoppingCart size={15} weight="bold" />
                    </button>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {prod.categoryName || prod.category}
                      </span>
                      {prod.brand && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20 uppercase">
                          {prod.brand}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-2 min-h-[32px] group-hover:text-[#ff4655] transition-colors uppercase tracking-wide">
                      {prod.title}
                    </h4>

                    {/* Số lượng đã bán THẬT từ database (soldCount) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono font-bold text-zinc-400">
                        <span className="text-[#ff4655] flex items-center gap-0.5">
                          <Flame size={10} weight="fill" /> ĐÃ BÁN {prod.soldCount ?? 0}
                        </span>
                        <span>{(prod.stock ?? 0) > 0 ? `CÒN ${prod.stock} SẢN PHẨM` : 'HẾT HÀNG'}</span>
                      </div>
                    </div>

                    {/* Price Block */}
                    <div className="pt-1">
                      <div className="flex items-baseline gap-2">
                        <span className="current-price text-sm font-black text-[#ff4655]">{formatPrice(prod.price)}</span>
                        {prod.oldPrice && (
                          <span className="old-price text-[10px] text-zinc-400 line-through">{formatPrice(prod.oldPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* SECTION E: BỘ LỌC CẤU HÌNH THEO NGÂN SÁCH (QUICK BUDGET CONFIGURATOR WIDGET) */}
        <section className="p-6 bg-gradient-to-r from-zinc-900/90 via-zinc-950/90 to-zinc-900/90 border border-zinc-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[10px] font-mono font-black text-[#ff4655] uppercase tracking-widest">// CẤU HÌNH THEO TÚI TIỀN</span>
            <h4 className="text-base font-black uppercase text-white tracking-wider">
              BẠN ĐANG TÌM CẤU HÌNH THEO MỨC NGÂN SÁCH NÀO?
            </h4>
            <p className="text-xs text-zinc-400">
              Chọn mức giá dự kiến để xem ngay các bộ PC & Laptop tối ưu hiệu năng tốt nhất trong tầm giá.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { label: '< 15 Triệu', desc: 'Esports LOL/Valorant', max: 15000000 },
              { label: '15 - 25 Triệu', desc: 'Stream & AAA 1080p', min: 15000000, max: 25000000 },
              { label: '25 - 45 Triệu', desc: '2K 165Hz & Đồ họa', min: 25000000, max: 45000000 },
              { label: '> 45 Triệu', desc: '4K Ray Tracing & AI', min: 45000000 }
            ].map((budget, idx) => (
              <button
                key={idx}
                onClick={() => {
                  let query = '/ProductPage?'
                  if (budget.min) query += `minPrice=${budget.min}&`
                  if (budget.max) query += `maxPrice=${budget.max}`
                  navigate(query)
                }}
                className="px-4 py-2.5 bg-zinc-800/80 hover:bg-[#ff4655] border border-zinc-700/80 hover:border-[#ff4655] rounded-xl text-left transition-all cursor-pointer group shadow-sm"
              >
                <span className="text-xs font-black text-white group-hover:text-white block uppercase tracking-wider">
                  {budget.label}
                </span>
                <span className="text-[9px] font-mono text-zinc-400 group-hover:text-white/80 block">
                  {budget.desc}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* SECTION F: SHOWCASE SẢN PHẨM CÔNG NGHỆ CHỌN LỌC (INTERACTIVE TABS) */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
              <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">
                // BỘ SƯU TẬP THIẾT BỊ HÀNG ĐẦU // FLAGSHIP SERIES
              </h3>
            </div>

            {/* Category Filter Pills on Homepage */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'TẤT CẢ' },
                { id: 'laptops', label: 'LAPTOP' },
                { id: 'desktops', label: 'PC & WORKSTATION' },
                { id: 'components', label: 'LINH KIỆN' },
                { id: 'peripherals', label: 'GEAR CHIẾN ĐẤU' },
                { id: 'monitors', label: 'MÀN HÌNH' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    activeCategoryFilter === tab.id
                      ? 'bg-[#ff4655] text-white shadow-[0_0_12px_rgba(255,70,85,0.4)]'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Products with Quick Add to Cart */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {showcaseProducts.map((prod) => (
              <motion.div 
                key={prod._id || prod.id} 
                whileHover={{ y: -4, borderColor: 'rgba(255, 70, 85, 0.45)' }}
                onClick={() => navigate(`/product/${prod._id || prod.id}`)}
                className="group bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between relative"
              >
                <div className="h-44 bg-zinc-50 dark:bg-zinc-900/60 flex items-center justify-center text-3xl border-b border-zinc-100 dark:border-zinc-800/80 overflow-hidden relative">
                  <SafeProductImage src={prod.imageEmoji} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {prod.discount && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded shadow">
                      {prod.discount}
                    </span>
                  )}

                  {/* Star Rating Badge */}
                  <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
                    <Star size={10} weight="fill" /> {prod.rating || 5.0}
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 uppercase">
                        {prod.categoryName || prod.category}
                      </span>
                      {prod.brand && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                          {prod.brand}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-[#ff4655] transition-colors uppercase tracking-wide">
                      {prod.title}
                    </h4>

                    <p className="text-[10px] text-zinc-400 font-mono">
                      Kho: <strong className="text-zinc-900 dark:text-white">{prod.stock}</strong> cái | SKU: {prod.sku || 'CHÍNH HÃNG'}
                    </p>
                  </div>

                  {/* Price and Add to Cart Action */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-black text-[#ff4655] block">
                        {formatPrice(prod.price)}
                      </span>
                      {prod.oldPrice && (
                        <span className="text-[9px] text-zinc-400 line-through block">
                          {formatPrice(prod.oldPrice)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, prod)}
                      title="Thêm vào giỏ"
                      className="px-2.5 py-1.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-[#ff4655] text-white text-[10px] font-black rounded uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <ShoppingCart size={13} weight="bold" />
                      <span>+ Giỏ</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION G: ĐỐI TÁC CÔNG NGHỆ LIÊN MINH (ALLIED PARTNERS) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
              <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">// ĐỐI TÁC CÔNG NGHỆ LIÊN MINH</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">100% GIAN HÀNG CHÍNH HÃNG</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredShops.map((shop) => (
              <motion.div
                key={shop._id}
                whileHover={{ y: -4, borderColor: 'rgba(255, 70, 85, 0.5)' }}
                onClick={() => navigate(`/shop/${shop._id || shop.id}`)}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${shop.bgClass || 'from-zinc-900 to-black'} p-5 flex flex-col justify-between min-h-[170px] shadow-sm hover:shadow-xl border border-zinc-800 transition-all duration-300 cursor-pointer group text-white`}
              >
                <div className="absolute right-0 bottom-0 text-7xl opacity-5 group-hover:scale-110 transition-transform duration-300 select-none">
                  {shop.logo}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center text-2xl backdrop-blur-sm shrink-0 border border-white/10 shadow-inner group-hover:scale-105 transition-transform">
                      {shop.logo}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black tracking-wider uppercase text-white group-hover:text-[#ff4655] transition-colors">{shop.name}</h4>
                        <CheckCircle size={12} weight="fill" className="text-blue-400" />
                      </div>
                      <p className="text-[9px] text-zinc-400 font-semibold uppercase mt-0.5">{shop.category}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2 z-10">
                  <div className="flex gap-3 text-[10px] font-bold">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star size={12} weight="fill" /> {shop.rating || 5.0}
                    </span>
                    <span className="text-zinc-400 uppercase tracking-wide">{shop.followers || '1.2K'} Follower</span>
                  </div>
                  <span className="text-[9px] font-black bg-white text-zinc-950 group-hover:bg-[#ff4655] group-hover:text-white px-3 py-1.5 rounded transition-all uppercase tracking-widest shadow-sm flex items-center gap-1">
                    Ghé thăm <ArrowUpRight size={11} weight="bold" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION H: LÝ DO HÀNG NGHÌN GAME THỦ CHỌN GEARTECH */}
        <section className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="text-[10px] font-mono font-black text-[#ff4655] uppercase tracking-widest">// VÌ SAO CHỌN CHÚNG TÔI</span>
            <h3 className="text-xl font-black uppercase text-zinc-900 dark:text-white tracking-wider">
              TIÊU CHUẨN GEARTECH ESPORTS CERTIFIED
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Mỗi thiết bị phân phối đều trải qua quy trình kiểm tra gắt gao về nhiệt độ, độ bền và tính tương thích phần mềm thi đấu.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-2xl font-black text-[#ff4655] block">50,000+</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block uppercase">Game thủ & Khách hàng</span>
              <span className="text-[9px] text-zinc-400 block">Tin dùng trên toàn quốc</span>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-2xl font-black text-blue-500 block">100%</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block uppercase">Chính Hãng Nhập Khẩu</span>
              <span className="text-[9px] text-zinc-400 block">Full VAT & CO/CQ</span>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-2xl font-black text-emerald-500 block">64</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block uppercase">Tỉnh Thành Vận Chuyển</span>
              <span className="text-[9px] text-zinc-400 block">Bảo hiểm 100% hàng hóa</span>
            </div>
            <div className="p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1">
              <span className="text-2xl font-black text-amber-500 block">4.9 / 5.0</span>
              <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block uppercase">Đánh Giá Hài Lòng</span>
              <span className="text-[9px] text-zinc-400 block">Từ hơn 12,000 lượt review</span>
            </div>
          </div>
        </section>

      </div>

      {/* Floating Add to Cart Toast Feedback */}
      <AnimatePresence>
        {addedToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-24 right-6 z-50 bg-zinc-900 text-white px-5 py-3 rounded-lg shadow-2xl border border-zinc-700 flex items-center gap-3 text-xs font-bold backdrop-blur-md"
          >
            <CheckCircle size={18} className="text-emerald-400" weight="fill" />
            <span>{addedToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage

