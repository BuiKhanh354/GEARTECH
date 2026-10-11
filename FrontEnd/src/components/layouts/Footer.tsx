import { Link } from 'react-router-dom'
import { 
  FacebookLogo, 
  InstagramLogo, 
  YoutubeLogo, 
  TwitterLogo,
  GameController,
  MapPin,
  Envelope,
  PhoneCall
} from '@phosphor-icons/react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-zinc-100 dark:bg-[#06070a] border-t border-zinc-200 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors duration-200">
      
      {/* Main Footer Links */}
      <div className="w-full max-w-full px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand and Intro column */}
          <div className="space-y-5">
            <Link 
              to="/Trang-chu" 
              className="group flex items-center gap-3.5 tracking-widest text-lg font-black uppercase text-zinc-900 dark:text-white"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded bg-[#ff4655] text-white shadow-[0_0_10px_rgba(255,70,85,0.3)]">
                <GameController size={18} weight="fill" />
              </span>
              <div className="flex flex-col">
                <span className="text-xs font-black tracking-[0.25em] leading-none text-zinc-900 dark:text-white">GEARTECH</span>
                <span className="text-[8px] font-bold tracking-[0.4em] text-[#ff4655] mt-0.5">VALORANT ED.</span>
              </div>
            </Link>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              Hệ thống cung cấp thiết bị máy tính, Laptop Gaming cao cấp, màn hình đồ họa và linh kiện phần cứng hàng đầu Việt Nam. Đạt tiêu chuẩn thi đấu Esport.
            </p>
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a href="#" className="w-8 h-8 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-900 dark:hover:bg-[#ff4655] flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105 active:scale-95" aria-label="Facebook">
                <FacebookLogo size={18} weight="bold" />
              </a>
              <a href="#" className="w-8 h-8 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-900 dark:hover:bg-[#ff4655] flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105 active:scale-95" aria-label="Instagram">
                <InstagramLogo size={18} weight="bold" />
              </a>
              <a href="#" className="w-8 h-8 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-900 dark:hover:bg-[#ff4655] flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105 active:scale-95" aria-label="Youtube">
                <YoutubeLogo size={18} weight="bold" />
              </a>
              <a href="#" className="w-8 h-8 rounded bg-zinc-200 hover:bg-[#ff4655] hover:text-white dark:bg-zinc-900 dark:hover:bg-[#ff4655] flex items-center justify-center text-zinc-500 dark:text-zinc-400 transition-all hover:scale-105 active:scale-95" aria-label="Twitter">
                <TwitterLogo size={18} weight="bold" />
              </a>
            </div>
          </div>

          {/* Contact Details Column */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest border-l-2 border-[#ff4655] pl-2">// LIÊN HỆ</h3>
            <ul className="space-y-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="text-[#ff4655] shrink-0 mt-0.5" />
                <span>Showroom: 123 Đường Ba Tháng Hai, Quận 10, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-2">
                <PhoneCall size={16} className="text-[#ff4655] shrink-0" />
                <span className="hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-colors">Hotline: 1900 6868 (8:00 - 22:00)</span>
              </li>
              <li className="flex items-center gap-2">
                <Envelope size={16} className="text-[#ff4655] shrink-0" />
                <span className="hover:text-zinc-800 dark:hover:text-white cursor-pointer transition-colors">Support: contact@geartech.vn</span>
              </li>
            </ul>
          </div>

          {/* Company Links Column */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest border-l-2 border-[#ff4655] pl-2">// VỀ GEARTECH</h3>
            <ul className="space-y-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <li>
                <Link to="/about" className="hover:text-[#ff4655] transition-colors">Chúng tôi là ai</Link>
              </li>
              <li>
                <Link to="/tintuc" className="hover:text-[#ff4655] transition-colors">Tin tức công nghệ</Link>
              </li>
              <li>
                <Link to="/Cua-hang" className="hover:text-[#ff4655] transition-colors">Hệ thống cửa hàng</Link>
              </li>
              <li>
                <Link to="/ProductPage" className="hover:text-[#ff4655] transition-colors">Danh mục thiết bị</Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#ff4655] transition-colors">Tuyển dụng liên minh</a>
              </li>
            </ul>
          </div>

          {/* Checkout & Shipping Partners */}
          <div className="space-y-6">
            <div>
              <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest border-l-2 border-[#ff4655] pl-2 mb-3">// ĐỐI TÁC THANH TOÁN</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-black text-[9px] text-[#ff4655] shadow-sm select-none">MOMO</span>
                <span className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-black text-[9px] text-blue-600 shadow-sm select-none">VNPAY</span>
                <span className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-black text-[9px] text-[#ff4655] shadow-sm select-none">VISA</span>
                <span className="px-2.5 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-black text-[9px] text-blue-800 shadow-sm select-none">MASTER</span>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest border-l-2 border-[#ff4655] pl-2 mb-3">// ĐƠN VỊ VẬN CHUYỂN</h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[9px] font-bold text-orange-500 shadow-sm select-none">GHN</span>
                <span className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[9px] font-bold text-emerald-600 shadow-sm select-none">GHTK</span>
                <span className="px-2 py-0.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-[9px] font-bold text-red-500 shadow-sm select-none">Viettel Post</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Section */}
      <div className="bg-zinc-200/50 dark:bg-black/50 border-t border-zinc-200 dark:border-zinc-900 py-6 text-center text-[10px] font-bold text-zinc-500 dark:text-zinc-500 tracking-wider transition-colors duration-200">
        <div className="w-full max-w-full px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-3 uppercase">
          <p>&copy; {currentYear} GEARTECH. Tất cả quyền được bảo lưu.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#ff4655] transition-colors">Quốc gia & Khu vực: Việt Nam</a>
          </div>
        </div>
      </div>

    </footer>
  )
}