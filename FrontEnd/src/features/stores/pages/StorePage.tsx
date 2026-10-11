import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Storefront, 
  Phone, 
  Clock, 
  NavigationArrow, 
  MagnifyingGlass, 
  Sparkle, 
  MapPin, 
  Cpu, 
  Wrench,
  ChatCircleText
} from '@phosphor-icons/react'

interface Showroom {
  id: string
  name: string
  address: string
  phone: string
  hours: string
  features: string[]
  lat: number
  lng: number
  city: 'hcm' | 'hanoi' | 'danang'
  mapUrl: string
}

export default function StorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState<'all' | 'hcm' | 'hanoi' | 'danang'>('all')

  const showrooms: Showroom[] = [
    {
      id: 'sr-1',
      name: 'GEARTECH FLAGSHIP STORE - TP. HCM',
      address: '123 Đường Ba Tháng Hai, Phường 11, Quận 10, Thành phố Hồ Chí Minh',
      phone: '1900 6868 (Phím 1)',
      hours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
      features: [
        'Khu Trải Nghiệm Virtual Reality (VR)',
        'Độc Quyền Ghế Secretlab Valorant Ed.',
        'Trung Tâm Bảo Hành & Nâng Cấp Tốc Hành'
      ],
      lat: 10.7766023,
      lng: 106.6780075,
      city: 'hcm',
      mapUrl: 'https://maps.google.com/maps?q=123%20%C4%90%C6%B0%E1%BB%9Dng%20Ba%20Th%C3%A1ng%20Hai%2C%20Ph%C6%B0%E1%BB%9Dng%2011%2C%20Qu%E1%BA%ADn%2010%2C%20TP.HCM&t=&z=16&ie=UTF8&iwloc=&output=embed'
    },
    {
      id: 'sr-2',
      name: 'GEARTECH ZONE - ĐỐNG ĐA, HÀ NỘI',
      address: '18 Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội',
      phone: '1900 6868 (Phím 2)',
      hours: '08:00 - 22:00 (Thứ 2 - Chủ Nhật)',
      features: [
        'Không Gian Build Phím Cơ Custom chuyên sâu',
        'Khu Vực Benchmark Workstation đồ họa',
        'Trải Nghiệm Tản Nhiệt Nước Custom'
      ],
      lat: 21.0076935,
      lng: 105.8260799,
      city: 'hanoi',
      mapUrl: 'https://maps.google.com/maps?q=18%20Ph%E1%BB%91%20Ch%C3%B9a%20B%E1%BB%99c%2C%20Quang%20Trung%2C%20%C4%90%E1%BB%91ng%20%C4%90a%2C%20H%C3%A0%20N%E1%BB%99i&t=&z=16&ie=UTF8&iwloc=&output=embed'
    },
    {
      id: 'sr-3',
      name: 'GEARTECH ESPORT HUB - HẢI CHÂU, ĐÀ NẴNG',
      address: '52 Nguyễn Văn Linh, Nam Dương, Hải Châu, Đà Nẵng',
      phone: '1900 6868 (Phím 3)',
      hours: '08:30 - 21:30 (Thứ 2 - Chủ Nhật)',
      features: [
        'Khu Vực Thi Đấu Esport 5v5 Chuẩn Gear',
        'Trải Nghiệm Chuột & Tai Nghe Siêu Nhẹ',
        'Bàn Trải Nghiệm Tay Cầm Console'
      ],
      lat: 16.0601955,
      lng: 108.2145322,
      city: 'danang',
      mapUrl: 'https://maps.google.com/maps?q=52%20Nguy%E1%BB%85n%20V%C4%83n%20Linh%2C%20Nam%20D%C6%B0%C6%A1ng%2C%20H%E1%BA%A3i%20Ch%C3%A2u%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&t=&z=16&ie=UTF8&iwloc=&output=embed'
    }
  ]

  const [activeShowroom, setActiveShowroom] = useState<Showroom>(showrooms[0])

  // Filter Showrooms
  const filteredShowrooms = useMemo(() => {
    return showrooms.filter(sr => {
      const matchCity = selectedCity === 'all' || sr.city === selectedCity
      const matchText = sr.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        sr.address.toLowerCase().includes(searchQuery.toLowerCase())
      return matchCity && matchText
    })
  }, [selectedCity, searchQuery])

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Page Title Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-6">
        <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
          <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
          <span>/</span>
          <span className="text-[#ff4655] font-black">HỆ THỐNG CỬA HÀNG</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#ff4655]"></span>
          <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">// SHOWROOM TRẢI NGHIỆM GEARTECH</h2>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Side: Search & Showrooms List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          
          {/* Filter Toolbar */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 space-y-4 shadow-sm dark:shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>

            {/* City Selector */}
            <div className="space-y-2">
              <span className="text-[9px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">// CHỌN KHU VỰC</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCity('all')}
                  className={`text-[9px] px-3.5 py-2 rounded font-black uppercase tracking-wider border transition-all ${
                    selectedCity === 'all'
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-md shadow-[#ff4655]/20'
                      : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  TẤT CẢ ({showrooms.length})
                </button>
                <button
                  onClick={() => setSelectedCity('hcm')}
                  className={`text-[9px] px-3.5 py-2 rounded font-black uppercase tracking-wider border transition-all ${
                    selectedCity === 'hcm'
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-md shadow-[#ff4655]/20'
                      : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  TP. HỒ CHÍ MINH
                </button>
                <button
                  onClick={() => setSelectedCity('hanoi')}
                  className={`text-[9px] px-3.5 py-2 rounded font-black uppercase tracking-wider border transition-all ${
                    selectedCity === 'hanoi'
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-md shadow-[#ff4655]/20'
                      : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  HÀ NỘI
                </button>
                <button
                  onClick={() => setSelectedCity('danang')}
                  className={`text-[9px] px-3.5 py-2 rounded font-black uppercase tracking-wider border transition-all ${
                    selectedCity === 'danang'
                      ? 'bg-[#ff4655] text-white border-[#ff4655] shadow-md shadow-[#ff4655]/20'
                      : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  ĐÀ NẴNG
                </button>
              </div>
            </div>

            {/* Keyword Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="TÌM THEO TÊN HOẶC ĐỊA CHỈ..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-800 dark:text-white rounded placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff4655] focus:border-[#ff4655] uppercase font-semibold tracking-wider"
              />
              <MagnifyingGlass size={14} className="absolute left-3 top-2.5 text-zinc-400" />
            </div>
          </div>

          {/* Showrooms Cards List */}
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
            <AnimatePresence mode="popLayout">
              {filteredShowrooms.map((sr) => (
                <motion.div
                  layout
                  key={sr.id}
                  onClick={() => setActiveShowroom(sr)}
                  whileHover={{ scale: 1.01 }}
                  className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-4 ${
                    activeShowroom.id === sr.id
                      ? 'bg-[#ff4655]/5 border-[#ff4655] shadow-md shadow-[#ff4655]/10'
                      : 'bg-white dark:bg-zinc-950/60 border-zinc-200 dark:border-zinc-855 hover:border-zinc-350 dark:hover:border-zinc-800'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                        activeShowroom.id === sr.id ? 'bg-[#ff4655] text-white' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-650'
                      }`}>
                        <Storefront size={14} />
                      </span>
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white">{sr.name}</h4>
                    </div>
                    <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 flex items-start gap-1">
                      <MapPin size={12} className="text-[#ff4655] shrink-0 mt-0.5" />
                      {sr.address}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-black tracking-widest text-zinc-400 dark:text-zinc-500 uppercase border-t border-zinc-100 dark:border-zinc-900/60 pt-3">
                    <span className="flex items-center gap-1"><Phone size={12} className="text-[#ff4655]" /> {sr.phone}</span>
                    <span className="flex items-center gap-1"><Clock size={12} className="text-[#ff4655]" /> {sr.hours}</span>
                  </div>
                </motion.div>
              ))}

              {filteredShowrooms.length === 0 && (
                <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center text-zinc-400">
                  <p className="text-xs font-black uppercase tracking-widest">// KHÔNG TÌM THẤY SHOWROOM PHÙ HỢP</p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Side: Map Display & Showroom Features Detail (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          
          {/* Google Maps Embed Sandbox */}
          <div className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl h-[340px] relative">
            <iframe
              src={activeShowroom.mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'grayscale(0.15) contrast(1.05)' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={activeShowroom.name}
            ></iframe>
          </div>

          {/* Active Showroom Detailed Features Panel */}
          <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm dark:shadow-xl space-y-4 relative flex-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#ff4655] to-red-650"></div>
            
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-3">
              <div>
                <span className="text-[8px] font-black text-[#ff4655] uppercase tracking-[0.25em]// ĐANG HIỂN THỊ">// ĐANG HIỂN THỊ</span>
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider mt-0.5">{activeShowroom.name}</h3>
              </div>
              
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(activeShowroom.address)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-3 py-2 rounded text-[9px] font-black uppercase tracking-widest transition-all shadow-md shadow-[#ff4655]/20 flex items-center gap-1"
              >
                <NavigationArrow size={12} weight="fill" /> Chỉ đường
              </a>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest">// CÁC TIỆN ÍCH TRẢI NGHIỆM</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeShowroom.features.map((feat, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl flex flex-col justify-between gap-3 text-left transition-all duration-200 hover:border-zinc-300 dark:hover:border-zinc-800"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#ff4655]/10 border border-[#ff4655]/20 text-[#ff4655] flex items-center justify-center shrink-0">
                      {idx === 0 ? <Cpu size={16} /> : idx === 1 ? <Sparkle size={16} /> : <Wrench size={16} />}
                    </div>
                    <p className="text-[10px] font-bold text-zinc-655 dark:text-zinc-350 leading-relaxed uppercase tracking-wider">
                      {feat}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 border-t border-zinc-100 dark:border-zinc-900/60">
              <a 
                href={`tel:${activeShowroom.phone.replace(/[^0-9]/g, '')}`}
                className="flex-1 text-center border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded text-[10px] font-black uppercase tracking-widest text-zinc-650 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-zinc-955 dark:hover:text-white transition-colors"
              >
                <Phone size={12} className="inline mr-1" /> Gọi Hotline Showroom
              </a>
              <button 
                className="flex-1 bg-zinc-900 dark:bg-zinc-900 hover:bg-zinc-855 text-white dark:border dark:border-zinc-800 px-4 py-2.5 rounded text-[10px] font-black uppercase tracking-widest transition-colors"
                onClick={() => alert('Chức năng liên hệ đang kết nối tổng đài!')}
              >
                <ChatCircleText size={12} className="inline mr-1" /> Tư vấn nâng cấp PC
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
