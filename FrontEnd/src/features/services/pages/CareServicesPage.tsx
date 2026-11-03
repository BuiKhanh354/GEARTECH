import { useState, useEffect } from 'react'
import { 
  Wrench, 
  ShieldCheck, 
  Sparkle, 
  Clock, 
  PhoneCall, 
  CheckCircle, 
  CalendarCheck, 
  Lightning, 
  HardDrives,
  Cpu,
  ArrowsClockwise,
  Ticket,
  WarningCircle
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { useAuthStore } from '../../../store/authStore'
import { careService, type CareBookingItem } from '../../../services/careService'

const servicePackages = [
  {
    id: 'deep-clean',
    name: 'Bảo Dưỡng & Vệ Sinh Chuyên Sâu',
    subtitle: 'Tối ưu nhiệt độ cho Laptop & PC Gaming',
    price: 250000,
    originalPrice: 350000,
    time: '45 - 60 phút',
    badge: 'Phổ biến nhất',
    badgeColor: 'bg-[#ff4655]/10 text-[#ff4655] border border-[#ff4655]/30',
    icon: Sparkle,
    features: [
      'Vệ sinh bụi siêu âm cánh quạt và khe tản nhiệt',
      'Tra keo tản nhiệt cao cấp Honeywell PTM7950 / Thermal Grizzly',
      'Thay thermal pad dẫn nhiệt VRAM card màn hình',
      'Cân chỉnh lại hướng luồng khí đối lưu trong case PC',
      'Kiểm tra và báo cáo nhiệt độ trước & sau khi làm'
    ]
  },
  {
    id: 'hardware-repair',
    name: 'Sửa Chữa Phần Cứng & Linh Kiện',
    subtitle: 'Khắc phục triệt để lỗi nguồn, mainboard, màn hình',
    price: 350000,
    originalPrice: null,
    time: 'Trong ngày (1 - 24 giờ)',
    badge: 'Kỹ thuật cao',
    badgeColor: 'bg-amber-500/10 text-amber-500 border border-amber-500/30',
    icon: Wrench,
    features: [
      'Khám bệnh & đo đạc linh kiện hoàn toàn MIỄN PHÍ',
      'Sửa chữa mainboard, nguồn, card đồ họa bị chập cháy',
      'Thay thế bàn phím, màn hình IPS/OLED laptop chính hãng',
      'Sửa bản lề gãy vỡ, phục hồi vỏ nhôm laptop va đập',
      'Cam kết linh kiện thay thế chính hãng 100% kèm bảo hành'
    ]
  },
  {
    id: 'data-recovery',
    name: 'Cứu Hộ Dữ Liệu & Nâng Cấp Tốc Độ',
    subtitle: 'Khôi phục dữ liệu ổ cứng và nhân đôi tốc độ máy',
    price: 450000,
    originalPrice: 600000,
    time: '2 - 4 giờ',
    badge: 'Bảo mật 100%',
    badgeColor: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30',
    icon: HardDrives,
    features: [
      'Cứu dữ liệu ổ cứng SSD/HDD bị format, xóa nhầm, bad sector',
      'Nhân bản (Clone) hệ điều hành không làm mất dữ liệu',
      'Nâng cấp RAM và SSD NVMe Gen 4 siêu tốc giá gốc',
      'Cài đặt lại Windows bản quyền chuẩn và đầy đủ driver hãng',
      'Cam kết bảo mật tuyệt đối thông tin và dữ liệu khách hàng'
    ]
  },
  {
    id: 'care-plus',
    name: 'Gói Bảo Hành Vàng (GearTech Care+)',
    subtitle: 'Đặc quyền 1 đổi 1 tại nhà và hỗ trợ máy dùng tạm',
    price: 990000,
    originalPrice: 1500000,
    time: 'Gói 12 tháng',
    badge: 'Gói VIP 24/7',
    badgeColor: 'bg-rose-500/10 text-rose-500 border border-rose-500/30',
    icon: ShieldCheck,
    features: [
      'Đổi mới linh kiện tại nhà trong 2 giờ khi gặp sự cố',
      'Cung cấp laptop/PC cấu hình tương đương dùng tạm khi gửi hãng',
      'Miễn phí 4 lần vệ sinh bảo dưỡng trọn gói trong năm',
      'Đường dây nóng kỹ thuật viên cao cấp hỗ trợ Remote 24/7',
      'Bảo hiểm rơi vỡ, vào nước trong 6 tháng đầu tiên'
    ]
  }
]

const steps = [
  {
    number: '01',
    title: 'Tiếp nhận & Khám máy Miễn phí',
    desc: 'Kỹ thuật viên kiểm tra 24 hạng mục phần cứng trước mặt khách hàng, xác định chính xác nguyên nhân và báo giá rõ ràng.'
  },
  {
    number: '02',
    title: 'Sửa chữa minh bạch tại phòng Lab',
    desc: 'Khách hàng quan sát trực tiếp hoặc theo dõi qua hệ thống camera phòng Lab. Tuyệt đối không tráo đổi linh kiện.'
  },
  {
    number: '03',
    title: 'Kiểm thử tải nặng (Stress Test)',
    desc: 'Chạy bài test tải nặng FurMark, Cinebench và MemTest để đảm bảo hệ thống đạt độ ổn định 100% trước khi xuất xưởng.'
  },
  {
    number: '04',
    title: 'Bàn giao & Kích hoạt bảo hành',
    desc: 'Bàn giao máy sạch sẽ kèm tem bảo hành điện tử. Cam kết hoàn tiền 100% nếu sự cố tái diễn trong vòng 30 ngày.'
  }
]

export default function CareServicesPage() {
  const { user } = useAuthStore()

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    deviceType: 'laptop',
    servicePackage: 'deep-clean',
    issueDescription: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<CareBookingItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Tự động điền thông tin nếu tài khoản đã đăng nhập
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.name || '',
        phone: prev.phone || user.phone || ''
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.fullName.trim() || !formData.phone.trim()) {
      setErrorMsg('Vui lòng nhập họ tên và số điện thoại liên hệ.')
      return
    }

    setLoading(true)
    try {
      const res = await careService.createBooking({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        deviceType: formData.deviceType,
        servicePackage: formData.servicePackage,
        issueDescription: formData.issueDescription
      })

      setCreatedBooking(res.booking)
      setSubmitted(true)
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#08090c] text-zinc-800 dark:text-zinc-200 transition-colors duration-200 pb-16">
      
      {/* ============================================================
          HERO BANNER - GEARTECH SIGNATURE RED TECH AESTHETIC
      ============================================================ */}
      <div className="relative overflow-hidden bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 shadow-lg">
        {/* Glow accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#ff4655]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-[#ff4655]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck size={14} weight="fill" className="text-[#ff4655]" />
                <span>GEARTECH CARE – TRUNG TÂM DỊCH VỤ & BẢO HÀNH CHUYÊN SÂU</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white uppercase">
                Dịch vụ kỹ thuật <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff4655] via-rose-400 to-amber-300">
                  Cứu hộ & Chăm sóc PC/Laptop
                </span>
              </h1>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                Bảo dưỡng vệ sinh chuyên sâu, cứu hộ phần cứng cấp tốc, nâng cấp linh kiện tận nhà và các gói bảo hành vàng 1 đổi 1 dành riêng cho cộng đồng công nghệ GearTech.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#booking-form"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider transition shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 active:scale-98 cursor-pointer"
                >
                  <CalendarCheck size={16} weight="bold" />
                  <span>Đặt lịch kỹ thuật viên</span>
                </a>
                <a
                  href="tel:19008888"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition backdrop-blur-sm"
                >
                  <PhoneCall size={16} weight="bold" className="text-[#ff4655]" />
                  <span>Hotline khẩn cấp: 1900 8888</span>
                </a>
              </div>
            </div>

            {/* Trust Highlights Grid */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:w-80">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-[#ff4655]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-[#ff4655]/20 flex items-center justify-center text-[#ff4655] mb-2">
                  <Clock size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Lấy liền 45 Phút</div>
                <div className="text-[11px] text-zinc-400">Vệ sinh & tra keo tản nhiệt</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-amber-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                  <ShieldCheck size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">1 Đổi 1 Tại Nhà</div>
                <div className="text-[11px] text-zinc-400">Bảo hành linh kiện thay thế</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-emerald-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                  <Cpu size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Phòng Lab Chuẩn</div>
                <div className="text-[11px] text-zinc-400">Thiết bị đo đạc điện tử hiện đại</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md hover:border-rose-500/40 transition">
                <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
                  <Lightning size={20} weight="bold" />
                </div>
                <div className="text-lg font-black text-white">Khám Miễn Phí</div>
                <div className="text-[11px] text-zinc-400">Không sửa không mất phí</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-16">

        {/* ============================================================
            BẢNG GIÁ DỊCH VỤ & CÁC GÓI KỸ THUẬT
        ============================================================ */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff4655] block mb-1 font-mono">
              // BẢNG GIÁ NIÊM YẾT MINH BẠCH
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Các Gói Dịch Vụ GearTech Care
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              Cam kết báo giá trọn gói trước khi làm – Không phát sinh phụ phí ẩn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicePackages.map((pkg) => {
              const Icon = pkg.icon
              return (
                <div
                  key={pkg.id}
                  className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between hover:border-[#ff4655]/60 hover:shadow-lg transition relative group"
                >
                  <div>
                    {/* Header Tag */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center border border-[#ff4655]/20">
                        <Icon size={24} weight="bold" />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${pkg.badgeColor}`}>
                        {pkg.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1 group-hover:text-[#ff4655] transition">
                      {pkg.name}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                      {pkg.subtitle}
                    </p>

                    <div className="pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-[#ff4655]">
                          {formatPrice(pkg.price)}
                        </span>
                        {pkg.originalPrice && (
                          <span className="text-xs text-zinc-400 line-through">
                            {formatPrice(pkg.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-1">
                        <Clock size={12} />
                        <span>Thời gian thực hiện: {pkg.time}</span>
                      </div>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6 text-xs text-zinc-600 dark:text-zinc-300">
                      {pkg.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle size={14} weight="fill" className="text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-[11px] leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href="#booking-form"
                    onClick={() => setFormData({ ...formData, servicePackage: pkg.id })}
                    className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-[#ff4655] text-white dark:bg-zinc-800 dark:hover:bg-[#ff4655] text-xs font-bold uppercase tracking-wider transition text-center flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-98"
                  >
                    <CalendarCheck size={15} weight="bold" />
                    <span>Chọn gói này</span>
                  </a>
                </div>
              )
            })}
          </div>
        </div>

        {/* ============================================================
            QUY TRÌNH TIẾP NHẬN & SỬA CHỮA CHUẨN LAB
        ============================================================ */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#ff4655] block mb-1 font-mono">
              // TIÊU CHUẨN CHẤT LƯỢNG
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Quy Trình 4 Bước Chuẩn Phòng Lab
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="relative p-5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800/80 hover:border-[#ff4655]/40 transition">
                <div className="text-3xl font-black text-[#ff4655]/40 mb-2 font-mono">
                  {st.number}
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1.5">
                  {st.title}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            FORM ĐẶT LỊCH KỸ THUẬT VIÊN
        ============================================================ */}
        <div id="booking-form" className="scroll-mt-10 bg-gradient-to-br from-[#ff4655]/5 via-zinc-50 to-amber-500/5 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 sm:p-10 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff4655]/10 text-[#ff4655] text-xs font-bold uppercase tracking-wider mb-2 border border-[#ff4655]/20">
                <Lightning size={14} weight="fill" />
                HỖ TRỢ NHANH TRONG 15 PHÚT
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                Đặt Lịch Kỹ Thuật Viên GearTech
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Điền thông tin thiết bị, kỹ thuật viên chuyên trách sẽ liên hệ xác nhận và đến tận nơi hỗ trợ bạn
              </p>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <WarningCircle size={18} weight="fill" className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted && createdBooking ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 sm:p-8 text-center text-emerald-600 dark:text-emerald-400 space-y-4">
                <CheckCircle size={52} weight="fill" className="mx-auto text-emerald-500" />
                <div>
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                    Đặt lịch GearTech Care thành công!
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 max-w-md mx-auto">
                    Kỹ thuật viên phòng Lab GearTech Care đã tiếp nhận yêu cầu và sẽ liên hệ với bạn trong vòng 15 phút.
                  </p>
                </div>

                {/* Ticket Card Details */}
                <div className="bg-white dark:bg-zinc-900/90 border border-emerald-500/30 rounded-xl p-4 text-left max-w-md mx-auto shadow-sm space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800">
                    <span className="text-zinc-500 flex items-center gap-1 font-mono font-bold text-[11px]">
                      <Ticket size={14} className="text-[#ff4655]" />
                      MÃ PHIẾU DỊCH VỤ:
                    </span>
                    <span className="font-mono font-black text-sm text-[#ff4655]">
                      {createdBooking.bookingCode}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gói dịch vụ:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{createdBooking.servicePackageName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Giá niêm yết:</span>
                    <span className="font-bold text-[#ff4655]">{formatPrice(createdBooking.price)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">Khách hàng:</span>
                    <span className="font-medium text-zinc-900 dark:text-zinc-200">{createdBooking.fullName} - {createdBooking.phone}</span>
                  </div>

                  {createdBooking.address && (
                    <div className="flex justify-between gap-4">
                      <span className="text-zinc-500 shrink-0">Địa chỉ hỗ trợ:</span>
                      <span className="text-right text-zinc-600 dark:text-zinc-300">{createdBooking.address}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 italic">
                    * Chi phí dịch vụ nộp trực tiếp cho kỹ thuật viên hoặc chuyển khoản tài khoản sàn GearTech khi nghiệm thu.
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setCreatedBooking(null)
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-md shadow-[#ff4655]/20"
                  >
                    Tạo yêu cầu mới
                  </button>
                  <a
                    href="tel:19008888"
                    className="px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider transition"
                  >
                    Gọi 1900 8888 hỗ trợ ngay
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Số điện thoại liên hệ *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0988xxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Địa chỉ nhận máy / Hỗ trợ tận nhà
                  </label>
                  <input
                    type="text"
                    placeholder="Số nhà, đường, quận/huyện, tỉnh/thành phố"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Loại thiết bị
                    </label>
                    <select
                      value={formData.deviceType}
                      onChange={(e) => setFormData({ ...formData, deviceType: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                    >
                      <option value="laptop">Laptop Gaming / Văn phòng</option>
                      <option value="desktop">PC Desktop / Máy bàn</option>
                      <option value="vga">Card màn hình (VGA / GPU)</option>
                      <option value="other">Màn hình / Linh kiện khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      Gói dịch vụ quan tâm
                    </label>
                    <select
                      value={formData.servicePackage}
                      onChange={(e) => setFormData({ ...formData, servicePackage: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                    >
                      <option value="deep-clean">Bảo Dưỡng & Vệ Sinh Chuyên Sâu</option>
                      <option value="hardware-repair">Sửa Chữa Phần Cứng & Linh Kiện</option>
                      <option value="data-recovery">Cứu Hộ Dữ Liệu & Nâng Cấp Tốc Độ</option>
                      <option value="care-plus">Gói Bảo Hành Vàng (GearTech Care+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    Mô tả tình trạng lỗi / Nhu cầu nâng cấp
                  </label>
                  <textarea
                    rows={3}
                    placeholder="VD: Máy bị sập nguồn khi chơi game, quạt kêu to, cần tra keo tản nhiệt và nâng cấp thêm 1 thanh RAM 16GB..."
                    value={formData.issueDescription}
                    onChange={(e) => setFormData({ ...formData, issueDescription: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#ff4655]/20 focus:border-[#ff4655] transition shadow-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#ff4655] hover:bg-[#e03d4b] active:bg-[#c9323f] disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition shadow-lg shadow-[#ff4655]/30 hover:shadow-[#ff4655]/50 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {loading ? (
                    <>
                      <ArrowsClockwise size={16} className="animate-spin" />
                      <span>Đang xử lý yêu cầu...</span>
                    </>
                  ) : (
                    <>
                      <CalendarCheck size={16} weight="bold" />
                      <span>Gửi yêu cầu đặt lịch ngay</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

    </div>
  )
}
