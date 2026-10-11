import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { 
  Trophy, 
  ShieldCheck, 
  Cpu, 
  ArrowLeft, 
  Quotes,
  Star,
  GameController
} from '@phosphor-icons/react'

export default function AboutPage() {
  const stats = [
    { label: 'Năm thành lập', value: '2020+' },
    { label: 'Showroom Toàn Quốc', value: '3+' },
    { label: 'Khách Hàng Chiến Hữu', value: '150K+' },
    { label: 'Hài Lòng Tuyệt Đối', value: '99.8%' }
  ]

  const values = [
    {
      title: 'CHẤT LƯỢNG TẬN HIẾN',
      desc: 'Chúng tôi chỉ tuyển chọn những sản phẩm phần cứng, gear cao cấp nhất đạt chuẩn thi đấu Esport quốc tế. Nói không với hàng giả, hàng kém chất lượng.',
      icon: <Trophy size={22} weight="fill" />
    },
    {
      title: 'TẬN TÂM ĐỒNG HÀNH',
      desc: 'Quyền lợi khách hàng là tối thượng. Bảo hành 1 đổi 1 trong 30 ngày, dịch vụ bảo trì định kỳ trọn đời và đội ngũ hỗ trợ kỹ thuật 24/7 luôn sẵn sàng.',
      icon: <ShieldCheck size={22} weight="fill" />
    },
    {
      title: 'TIÊN PHONG ĐỘT PHÁ',
      desc: 'Luôn đón đầu xu hướng công nghệ mới. Mang đến các bộ PC Custom siêu khủng, phím cơ custom độc bản và các dòng gear siêu nhẹ thế hệ mới nhanh nhất.',
      icon: <Cpu size={22} weight="fill" />
    }
  ]

  const founders = [
    {
      name: 'BÙI VIẾT KHÁNH',
      role: 'FOUNDER & CEO',
      desc: 'Cựu tuyển thủ bán chuyên. Lập ra GearTech với mong muốn phổ cập hệ sinh thái gaming cao cấp cho giới trẻ Việt Nam.',
      emoji: '👑',
      gradient: 'from-amber-650 to-orange-500'
    },
    {
      name: 'TRẦN MINH TUẤN',
      role: 'CTO & HARDWARE ARCHITECT',
      desc: 'Phù thủy cấu hình máy tính với 10 năm kinh nghiệm build PC tản nhiệt nước và tối ưu hóa hệ thống máy trạm.',
      emoji: '🛠️',
      gradient: 'from-blue-600 to-indigo-600'
    },
    {
      name: 'NGUYỄN THU TRANG',
      role: 'HEAD OF PLAYER SUPPORT',
      desc: 'Người giữ lửa cho GearTech, chịu trách nhiệm xây dựng chế độ bảo hành 1 đổi 1 và nâng tầm dịch vụ chăm sóc.',
      emoji: '💖',
      gradient: 'from-pink-600 to-rose-600'
    }
  ]

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Page Title Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-8">
        <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
          <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
          <span>/</span>
          <span className="text-[#ff4655] font-black">CHÚNG TÔI LÀ AI</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#ff4655]"></span>
          <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">// GIỚI THIỆU DOANH NGHIỆP GEARTECH</h2>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-8 sm:p-12 mb-12 shadow-lg border border-zinc-850">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-zinc-900/60 to-[#ff4655]/10 z-0"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-10 z-0"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#ff4655]/20 text-[#ff4655] text-[9px] font-black uppercase tracking-[0.2em] border border-[#ff4655]/30">
            <GameController size={12} weight="fill" /> // GEARTECH DIVISION // ABOUT US
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none uppercase">
            ĐIỂM TỰA CỦA CÁC <br/>
            <span className="text-[#ff4655]">CHIẾN BINH CÔNG NGHỆ</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-semibold leading-relaxed tracking-wide">
            Thành lập từ năm 2020 bởi những game thủ và chuyên gia phần cứng tâm huyết, GearTech đã không ngừng bứt phá để trở thành hệ thống phân phối thiết bị hi-tech và máy tính gaming cao cấp hàng đầu Việt Nam. Chúng tôi không chỉ bán sản phẩm, chúng tôi cung cấp trang bị giúp bạn làm chủ cuộc chơi và bứt phá giới hạn công việc.
          </p>
        </div>
      </section>

      {/* Core Stats Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl text-center shadow-sm dark:shadow-xl space-y-2 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-150 dark:bg-zinc-900 group-hover:bg-[#ff4655] transition-colors"></div>
            <p className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-zinc-900 dark:text-white group-hover:text-[#ff4655] transition-colors tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </section>

      {/* Core Values Section */}
      <section className="space-y-6 mb-12">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
          <span className="w-1.5 h-4 bg-[#ff4655]"></span>
          <h3 className="text-xs font-black tracking-[0.2em] text-zinc-800 dark:text-white uppercase">// BA GIÁ TRỊ CỐT LÕI</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx) => (
            <motion.div
              whileHover={{ y: -5, borderColor: 'rgba(255, 70, 85, 0.3)' }}
              key={idx}
              className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 relative overflow-hidden"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[#ff4655] flex items-center justify-center">
                {val.icon}
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black tracking-wider uppercase text-zinc-900 dark:text-white">{val.title}</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                  {val.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quote Section */}
      <section className="bg-white dark:bg-zinc-955/40 border border-zinc-200 dark:border-zinc-900/60 rounded-3xl p-6 sm:p-10 shadow-sm mb-12 relative flex flex-col md:flex-row items-center gap-6">
        <div className="text-4xl text-[#ff4655] shrink-0 opacity-80">
          <Quotes size={48} weight="fill" />
        </div>
        <div className="space-y-2">
          <p className="text-xs sm:text-sm font-semibold italic text-zinc-650 dark:text-zinc-455 leading-relaxed">
            "Tại GearTech, chúng tôi chia sẻ cùng một đam mê với các game thủ và các nhà sáng tạo nội dung. Mỗi chiếc máy tính xuất xưởng không chỉ đơn thuần là sự kết hợp của CPU và GPU, đó là cả sự tận hiến về mặt kỹ thuật để mang lại sự ổn định tuyệt đối trong từng khung hình, giúp bạn tự tin chiến đấu và sáng tạo đỉnh cao."
          </p>
          <div className="flex items-center gap-1.5 pt-2">
            <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-wider">Đội Ngũ Phát Triển GearTech</span>
            <div className="flex text-amber-500">
              <Star size={10} weight="fill" />
              <Star size={10} weight="fill" />
              <Star size={10} weight="fill" />
              <Star size={10} weight="fill" />
              <Star size={10} weight="fill" />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Founders */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
          <span className="w-1.5 h-4 bg-[#ff4655]"></span>
          <h3 className="text-xs font-black tracking-[0.2em] text-zinc-800 dark:text-white uppercase">// BAN SÁNG LẬP GEARTECH</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {founders.map((fd, idx) => (
            <motion.div
              whileHover={{ y: -6, borderColor: 'rgba(255, 70, 85, 0.4)' }}
              key={idx}
              className="group bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-850 rounded-3xl p-6 shadow-sm dark:shadow-xl relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[220px]"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${fd.gradient} text-white flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-md`}>
                    {fd.emoji}
                  </span>
                  <div>
                    <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider group-hover:text-[#ff4655] transition-colors">{fd.name}</h4>
                    <span className="text-[9px] font-black text-[#ff4655] tracking-widest mt-0.5 block uppercase">{fd.role}</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold leading-relaxed">
                  {fd.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900/60 mt-4 flex items-center justify-between text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase">
                <span>GEARTECH DIVISION</span>
                <span className="text-[#ff4655] opacity-0 group-hover:opacity-100 transition-opacity font-mono">// THIẾT KẾ</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Row */}
      <section className="text-center pt-12 space-y-4">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-800 dark:text-white">// BẮT ĐẦU TRẢI NGHIỆM TRANG BỊ CỦA BẠN</h4>
        <Link 
          to="/ProductPage"
          className="inline-flex items-center gap-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] hover:shadow-[0_0_25px_rgba(255,70,85,0.5)] active:scale-98"
        >
          ĐẾN DANH MỤC THIẾT BỊ <ArrowLeft size={12} weight="bold" className="rotate-180" />
        </Link>
      </section>

    </div>
  )
}
