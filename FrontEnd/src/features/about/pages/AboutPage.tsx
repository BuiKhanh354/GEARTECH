import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  Trophy, 
  ShieldCheck, 
  Cpu, 
  Quotes,
  Star,
  GameController,
  MapPin,
  ArrowRight,
  Clock,
  Certificate,
  UsersThree,
  ArrowUpRight,
  Storefront,
  Phone
} from '@phosphor-icons/react'
import { shopService, type ShopItem } from '../../../services/shopService'

export default function AboutPage() {
  const [shops, setShops] = useState<ShopItem[]>([])
  const [loadingShops, setLoadingShops] = useState(true)

  useEffect(() => {
    const fetchActiveShops = async () => {
      try {
        setLoadingShops(true)
        const data = await shopService.getShops({ limit: 12 })
        if (Array.isArray(data)) {
          setShops(data)
        }
      } catch (err) {
        console.error('Lỗi tải danh sách shop trên AboutPage:', err)
      } finally {
        setLoadingShops(false)
      }
    }
    fetchActiveShops()
  }, [])

  const renderShopLogo = (shop: ShopItem) => {
    const logo = shop.logo?.trim()
    if (logo && (logo.startsWith('http://') || logo.startsWith('https://') || logo.startsWith('/'))) {
      return <img src={logo} alt={shop.name} className="w-full h-full object-cover" />
    }
    return (
      <span className="text-xl font-black">{logo && logo !== '??' ? logo : '🏪'}</span>
    )
  }

  const stats = [
    { label: 'NĂM THÀNH LẬP', value: '2020+', sub: 'Hơn 5 năm phát triển', icon: <Clock size={20} className="text-[#ff4655]" /> },
    { label: 'GIAN HÀNG HOẠT ĐỘNG', value: `${shops.length > 0 ? shops.length : '14'}+`, sub: 'Đối tác phần cứng uy tín', icon: <Storefront size={20} className="text-blue-500" /> },
    { label: 'GAME THỦ & KỸ SƯ', value: '150K+', sub: 'Chiến hữu tin dùng', icon: <UsersThree size={20} className="text-emerald-500" /> },
    { label: 'HÀI LÒNG TUYỆT ĐỐI', value: '99.8%', sub: 'Dịch vụ bảo hành 1 đổi 1', icon: <Certificate size={20} className="text-amber-500" /> }
  ]

  const values = [
    {
      title: 'CHẤT LƯỢNG TẬN HIẾN',
      tag: '100% CHÍNH HÃNG',
      desc: 'Tuyển chọn khắt khe từng linh kiện phần cứng, laptop và gaming gear đạt chuẩn thi đấu quốc tế. Nói không với hàng trôi nổi và hàng renew kém chất lượng.',
      icon: <Trophy size={24} weight="fill" className="text-[#ff4655]" />,
      accent: 'border-[#ff4655]/40 hover:border-[#ff4655]',
      bgGlow: 'from-[#ff4655]/10 to-transparent'
    },
    {
      title: 'TẬN TÂM ĐỒNG HÀNH',
      tag: 'BẢO HÀNH 1 ĐỔI 1',
      desc: 'Quyền lợi của chiến hữu là tối thượng. Đặc quyền 1 đổi 1 trong 30 ngày, chế độ bảo trì định kỳ trọn đời cùng đội ngũ hỗ trợ kỹ thuật trực tuyến 24/7.',
      icon: <ShieldCheck size={24} weight="fill" className="text-blue-500" />,
      accent: 'border-blue-500/40 hover:border-blue-500',
      bgGlow: 'from-blue-500/10 to-transparent'
    },
    {
      title: 'TIÊN PHONG ĐỘT PHÁ',
      tag: 'CÔNG NGHỆ MỚI NHẤT',
      desc: 'Luôn là đơn vị cập nhật nhanh nhất các dòng GPU RTX 40/50 series, CPU thế hệ mới, tản nhiệt nước Custom độc bản và bàn phím cơ hotswap siêu nhẹ.',
      icon: <Cpu size={24} weight="fill" className="text-emerald-500" />,
      accent: 'border-emerald-500/40 hover:border-emerald-500',
      bgGlow: 'from-emerald-500/10 to-transparent'
    }
  ]

  const labSteps = [
    {
      step: '01',
      title: 'Kiểm tra linh kiện gốc',
      desc: 'Xác thực tem niêm phong nhà phân phối, số serial, nguồn gốc CO/CQ và thông số kỹ thuật xuất xưởng.'
    },
    {
      step: '02',
      title: 'Stress Test FurMark & Cinebench',
      desc: 'Chạy thử tải nặng 100% công suất liên tục trong 12 tiếng để kiểm tra độ ổn định nhiệt độ và điện năng.'
    },
    {
      step: '03',
      title: 'Tối ưu hóa BIOS & Nhiệt độ',
      desc: 'Cập nhật BIOS mới nhất, ép xung XMP/EXPO an toàn và tra keo tản nhiệt gốm cao cấp trước khi đóng gói.'
    },
    {
      step: '04',
      title: 'Niêm phong & Cấp thẻ bảo hành',
      desc: 'Dán tem bảo hành điện tử độc quyền GearTech và bàn giao tận tay khách hàng kèm hồ sơ bảo hành 1 đổi 1.'
    }
  ]

  const founders = [
    {
      name: 'BÙI VIẾT KHÁNH',
      role: 'FOUNDER & CEO',
      desc: 'Cựu tuyển thủ bán chuyên. Sáng lập GearTech với khát vọng phổ cập hệ sinh thái gaming cao cấp và giải pháp phần cứng chuẩn thi đấu cho thế hệ trẻ Việt Nam.',
      emoji: '👑',
      tag: 'LEADERSHIP',
      gradient: 'from-red-600 to-amber-600'
    },
    {
      name: 'TRẦN MINH TUẤN',
      role: 'CTO & HARDWARE ARCHITECT',
      desc: 'Phù thủy phần cứng với hơn 10 năm kinh nghiệm build PC Custom Watercool, tối ưu hóa máy trạm AI Deep Learning và nghiên cứu khí động học thùng máy.',
      emoji: '⚡',
      tag: 'ENGINEERING',
      gradient: 'from-blue-600 to-cyan-500'
    },
    {
      name: 'NGUYỄN THU TRANG',
      role: 'HEAD OF CUSTOMER SUCCESS',
      desc: 'Người giữ lửa dịch vụ GearTech, thiết lập quy trình bảo hành 1 đổi 1 trong 30 ngày và đào tạo đội ngũ tư vấn kỹ thuật phục vụ 24/7.',
      emoji: '💎',
      tag: 'EXPERIENCE',
      gradient: 'from-purple-600 to-pink-500'
    }
  ]

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-16 transition-colors duration-200">
      
      {/* 1. Header Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
            <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
            <span>/</span>
            <span className="text-[#ff4655] font-black">CHÚNG TÔI LÀ AI</span>
          </nav>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-4 bg-[#ff4655]"></span>
            <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">
              // HỆ THỐNG CÔNG NGHỆ & GAMING GEARTECH DIVISION
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded text-[10px] font-mono font-black uppercase tracking-wider bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30">
            ● ESPORTS CERTIFIED 2026
          </span>
        </div>
      </div>

      {/* 2. Cyber Hero Mission Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 sm:p-14 mb-14 shadow-2xl border border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-950/80 to-[#ff4655]/15 z-0"></div>
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#ff4655] text-[10px] font-mono font-black uppercase tracking-[0.25em] border border-white/15 backdrop-blur-md">
            <GameController size={14} weight="fill" />
            // GEARTECH CORP // MISSION STATEMENT
          </div>

          <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-none uppercase text-white">
            ĐIỂM TỰA CÔNG NGHỆ CỦA <br/>
            <span className="text-[#ff4655] text-glow">NHỮNG CHIẾN HẠM BẤT KHẢ CHIẾN BẠI</span>
          </h1>

          <p className="text-xs sm:text-base text-zinc-400 font-medium leading-relaxed tracking-wide max-w-2xl">
            Thành lập từ năm 2020 bởi những game thủ và kỹ sư phần cứng tâm huyết, <b>GearTech</b> đã bứt phá trở thành hệ sinh thái phân phối máy tính thi đấu, laptop cao cấp và linh kiện công nghệ hàng đầu Việt Nam. Chúng tôi không chỉ bán thiết bị, chúng tôi đồng hành cùng bạn trên con đường chinh phục mọi đỉnh cao.
          </p>

          {/* Interactive Milestone Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {[
              { year: '2020', label: 'KHỞI NGUYÊN' },
              { year: '2022', label: 'MỞ RỘNG SHOWROOM' },
              { year: '2024', label: '150K CHIẾN HỮU' },
              { year: '2026', label: 'CHUẨN ESPORTS TOÀN DIỆN' }
            ].map((m, idx) => (
              <div key={idx} className="px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono font-bold flex items-center gap-1.5">
                <span className="text-[#ff4655] font-black">{m.year}:</span>
                <span className="text-zinc-300">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Holographic Stats Matrix (4 Futuristic Data Cores) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.5)' }}
            className="bg-white dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl text-center shadow-sm dark:shadow-xl space-y-2 relative overflow-hidden group transition-all duration-300"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-200 dark:bg-zinc-850 group-hover:bg-[#ff4655] transition-colors"></div>
            <div className="flex justify-center mb-1">
              <span className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                {stat.icon}
              </span>
            </div>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors tracking-tight font-mono">
              {stat.value}
            </h3>
            <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest">{stat.label}</p>
            <p className="text-[9px] text-zinc-400 font-mono">{stat.sub}</p>
          </motion.div>
        ))}
      </section>

      {/* 4. Core Values Section (3 Trụ Cột Triết Lý Hoạt Động) */}
      <section className="space-y-6 mb-16">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
            <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">// BA TRỤ CỘT GIÁ TRỊ CỐT LÕI</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">CAM KẾT BẤT BIẾN</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx) => (
            <motion.div
              whileHover={{ y: -6 }}
              key={idx}
              className={`bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/90 border ${val.accent} rounded-2xl p-7 shadow-sm dark:shadow-xl space-y-4 relative overflow-hidden transition-all duration-300 group`}
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  {val.icon}
                </div>
                <span className="px-2.5 py-1 rounded text-[9px] font-mono font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {val.tag}
                </span>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black tracking-wider uppercase text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors">{val.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {val.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. GearTech Laboratory & Quality Assurance Testing */}
      <section className="bg-white dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 mb-16 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff4655]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-2xl space-y-3 mb-10">
          <span className="text-[10px] font-mono font-black text-[#ff4655] uppercase tracking-widest">// QUY TRÌNH KIỂM ĐỊNH KHẮC NGHIỆT</span>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-zinc-900 dark:text-white tracking-wider">
            GEARTECH HARDWARE LAB & TESTING PIPELINE
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Mỗi hệ thống PC và thiết bị trước khi trao đến tay khách hàng đều phải vượt qua bài kiểm tra độ bền áp lực cao nhất theo chuẩn thi đấu eSports.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {labSteps.map((step, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80 space-y-3 relative group hover:border-[#ff4655]/50 transition-colors">
              <span className="text-2xl font-black font-mono text-[#ff4655] opacity-80 group-hover:opacity-100 transition-opacity">
                {step.step}
              </span>
              <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wide">
                {step.title}
              </h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Quote from Founders */}
      <section className="bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-xl mb-16 relative flex flex-col md:flex-row items-center gap-8 text-white">
        <div className="text-5xl text-[#ff4655] shrink-0 p-4 rounded-2xl bg-[#ff4655]/10 border border-[#ff4655]/20 shadow-inner">
          <Quotes size={42} weight="fill" />
        </div>
        <div className="space-y-3 flex-1">
          <p className="text-xs sm:text-sm font-medium italic text-zinc-300 leading-relaxed">
            "Tại GearTech, chúng tôi chia sẻ cùng một ngọn lửa đam mê với các game thủ và các nhà sáng tạo nội dung. Mỗi cỗ máy xuất xưởng không chỉ đơn thuần là sự kết hợp giữa CPU và GPU, đó là sự tận hiến kỹ thuật để đem lại sự ổn định tuyệt đối trong từng khung hình, giúp bạn tự tin chiến đấu và sáng tạo không giới hạn."
          </p>
          <div className="flex items-center justify-between pt-2 flex-wrap gap-2 border-t border-white/10">
            <div>
              <span className="text-xs font-black text-white uppercase tracking-wider block">BÙI VIẾT KHÁNH</span>
              <span className="text-[10px] text-[#ff4655] font-mono tracking-widest block uppercase">FOUNDER & CHIEF EXECUTIVE OFFICER</span>
            </div>
            <div className="flex text-amber-400 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} weight="fill" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Leadership & Architecture Team */}
      <section className="space-y-6 mb-16">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
            <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">// BAN SÁNG LẬP & KIẾN TRÚC SƯ HỆ THỐNG</h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider hidden sm:inline">ĐỘI NGŨ CHUYÊN GIA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {founders.map((fd, idx) => (
            <motion.div
              whileHover={{ y: -6, borderColor: 'rgba(255, 70, 85, 0.5)' }}
              key={idx}
              className="group bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-7 shadow-sm dark:shadow-xl relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[240px]"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${fd.gradient} text-white flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-md`}>
                      {fd.emoji}
                    </span>
                    <div>
                      <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider group-hover:text-[#ff4655] transition-colors">{fd.name}</h4>
                      <span className="text-[9px] font-black text-[#ff4655] tracking-widest mt-0.5 block uppercase">{fd.role}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-zinc-100 dark:bg-zinc-900 text-zinc-500 uppercase border border-zinc-200 dark:border-zinc-800">
                    {fd.tag}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                  {fd.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 flex items-center justify-between text-[9px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  GEARTECH VERIFIED
                </span>
                <span className="text-[#ff4655] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  CONNECT <ArrowUpRight size={10} weight="bold" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 8. Active Partner Shops Network (Hệ thống các shop đang hoạt động trên GearTech) */}
      <section className="space-y-6 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="w-1.5 h-4 bg-[#ff4655] rounded-xs"></span>
            <div>
              <h3 className="text-xs font-black tracking-[0.2em] text-zinc-900 dark:text-white uppercase">
                // HỆ THỐNG GIAN HÀNG & SHOP ĐANG HOẠT ĐỘNG
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Các đối tác phân phối phần cứng máy tính và Gaming Gear chính hãng trên nền tảng GearTech
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2.5 py-1 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {loadingShops ? 'ĐANG TẢI...' : `${shops.length} SHOP ĐANG HOẠT ĐỘNG`}
            </span>
            <Link
              to="/Cua-hang"
              className="text-[10px] font-mono font-bold text-zinc-400 hover:text-[#ff4655] uppercase tracking-wider flex items-center gap-1 transition-colors"
            >
              XEM TẤT CẢ CÁC SHOP <ArrowRight size={11} weight="bold" />
            </Link>
          </div>
        </div>

        {loadingShops ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : shops.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30">
            <Storefront size={36} className="mx-auto text-zinc-400 mb-2" />
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Chưa có gian hàng đối tác nào được kích hoạt</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <motion.div
                key={shop._id || shop.id}
                whileHover={{ y: -4, borderColor: 'rgba(255, 70, 85, 0.5)' }}
                className="p-6 bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4 relative group transition-all duration-300 shadow-sm dark:shadow-xl flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Shop Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                        {renderShopLogo(shop)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wide group-hover:text-[#ff4655] transition-colors line-clamp-1">
                            {shop.name || shop.shop_name}
                          </h4>
                          <ShieldCheck size={14} weight="fill" className="text-blue-500 shrink-0" />
                        </div>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium line-clamp-1">
                          {shop.category || 'Gian hàng công nghệ uy tín'}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase shrink-0 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </div>

                  {/* Shop Description */}
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal line-clamp-2 min-h-[36px]">
                    {shop.description || 'Chuyên phân phối linh kiện máy tính, laptop gaming và phụ kiện phần cứng cao cấp chính hãng.'}
                  </p>

                  {/* Shop Meta Info */}
                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900 text-[10px] font-mono text-zinc-500 dark:text-zinc-400 space-y-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-[#ff4655] shrink-0" weight="fill" />
                      <span className="truncate">{shop.address || 'Hà Nội / TP. Hồ Chí Minh'}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone size={12} className="text-zinc-400 shrink-0" weight="fill" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] font-mono font-bold">
                    <span className="flex items-center gap-1 text-amber-500">
                      <Star size={12} weight="fill" />
                      {shop.rating || 5.0}
                    </span>
                    <span className="text-zinc-400">•</span>
                    <span className="text-zinc-400">{shop.total_products || 0} sản phẩm</span>
                  </div>

                  <Link
                    to={`/shop/${shop._id || shop.id}`}
                    className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-white bg-[#ff4655] hover:bg-[#e03d4b] px-3 py-1.5 rounded uppercase tracking-wider transition-all shadow-sm hover:shadow-[0_0_12px_rgba(255,70,85,0.4)]"
                  >
                    Ghé thăm <ArrowUpRight size={11} weight="bold" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 9. Call to Action Banner */}
      <section className="text-center pt-6 space-y-5 max-w-xl mx-auto">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-black text-[#ff4655] uppercase tracking-widest">// SẴN SÀNG CHIẾN ĐẤU CÙNG GEARTECH?</span>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-zinc-900 dark:text-white">
            NÂNG TẦM KHÔNG GIAN BÀN MÁY CỦA BẠN NGAY HÔM NAY
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Khám phá hàng nghìn thiết bị phần cứng, bàn phím cơ, laptop AI và gear thi đấu với chính sách bảo hành 1 đổi 1 tối thượng.
          </p>
        </div>
        <div className="pt-2 flex justify-center gap-3 flex-wrap">
          <Link 
            to="/ProductPage"
            className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-sm transition-all shadow-[0_0_20px_rgba(255,70,85,0.35)] hover:shadow-[0_0_30px_rgba(255,70,85,0.6)] cursor-pointer"
          >
            ĐẾN DANH MỤC THIẾT BỊ <ArrowRight size={14} weight="bold" />
          </Link>
          <Link 
            to="/ProductPage?category=desktops"
            className="inline-flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-black text-xs uppercase tracking-widest px-7 py-4 rounded-sm transition-all cursor-pointer"
          >
            XEM BỘ SƯU TẬP PC BUILD
          </Link>
        </div>
      </section>

    </div>
  )
}
