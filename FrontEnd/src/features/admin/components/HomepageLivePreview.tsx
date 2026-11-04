import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  Eye,
  Flame,
  ShieldCheck,
  Truck,
  Wrench
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'
import type { PopulatedSection, ServiceFeatureItem } from '../../../services/homepageService'

interface HomepageLivePreviewProps {
  loading: boolean
  sections: PopulatedSection[]
  onRefresh: () => void | Promise<void>
  onPublish: () => void
}

export default function HomepageLivePreview({ loading, sections, onRefresh, onPublish }: HomepageLivePreviewProps) {
  return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                  <Eye size={16} weight="bold" className="text-blue-500" />
                  Xem trước trực quan toàn trang (Dữ liệu MongoDB Thật 100%)
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Hiển thị chính xác những gì khách hàng sẽ nhìn thấy khi bạn bấm nút "Xuất bản ngay".
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onRefresh}
                disabled={loading}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ArrowClockwise size={13} className={loading ? 'animate-spin' : ''} weight="bold" />
                <span>Làm mới xem trước</span>
              </button>

              <button
                onClick={() => onPublish()}
                className="px-4 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer shadow-sm transition-all"
              >
                <CheckCircle size={14} weight="bold" />
                <span>Xuất bản ngay</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <ArrowClockwise size={32} className="animate-spin text-[#ff4655]" />
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Đang truy vấn sản phẩm và danh mục thực tế từ Database...</p>
            </div>
          ) : (
            <div className="space-y-12">
              {sections.map((sec, idx) => (
                <div key={sec.sectionKey || idx} className="space-y-4 border-l-2 border-[#ff4655]/40 pl-4 py-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-zinc-400">#{idx + 1}</span>
                        <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white">{sec.title}</h4>
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          sec._previewBadge === 'active'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                            : sec._previewBadge === 'scheduled'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                        }`}>
                          {sec._previewBadge === 'active' ? 'Đang bật' : sec._previewBadge === 'scheduled' ? 'Lên lịch' : 'Tắt / Hết hạn'}
                        </span>
                      </div>
                      {sec.subtitle && <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{sec.subtitle}</p>}
                    </div>

                    {sec.config?.showViewAll && sec.config?.viewAllLink && (
                      <span className="text-xs font-bold text-[#ff4655] flex items-center gap-1">
                        Xem tất cả &raquo;
                      </span>
                    )}
                  </div>

                  {/* Populated Content */}
                  {sec.type === 'category_products' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {sec.populatedData?.products && sec.populatedData.products.length > 0 ? (
                        sec.populatedData.products.map(p => (
                          <div
                            key={p._id || p.id}
                            className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 space-y-2 shadow-xs"
                          >
                            <div className="h-32 bg-white dark:bg-zinc-900 rounded overflow-hidden flex items-center justify-center">
                              <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white line-clamp-1">{p.title}</h5>
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                              <span className="text-[10px] text-zinc-400">Kho: {p.stock}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full py-6 text-center text-xs text-zinc-400 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
                          Danh mục này hiện chưa có sản phẩm nào kích hoạt trong database. Khu vực sẽ tự động ẩn trên trang chủ.
                        </div>
                      )}
                    </div>
                  )}

                  {sec.type === 'banner_slider' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(sec.populatedData?.banners || sec.config?.banners || []).map((b, bIdx) => (
                        <div
                          key={bIdx}
                          className={`p-6 rounded-2xl bg-gradient-to-br ${b.bgGradient || 'from-zinc-950 to-black'} text-white space-y-3 border border-zinc-800`}
                        >
                          <span className="px-2 py-0.5 rounded bg-[#ff4655] text-white text-[9px] font-black uppercase">
                            {b.badge || 'PROMO'}
                          </span>
                          <h4 className="text-base font-black uppercase">{b.title}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-2">{b.description}</p>
                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-xs font-black text-[#ff4655]">{b.priceTag}</span>
                            <span className="px-3 py-1 bg-white text-zinc-900 rounded text-[10px] font-black uppercase">
                              {b.ctaText}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {sec.type === 'flash_sale' && (
                    <div className="p-4 bg-zinc-100 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                      <div className="flex items-center gap-2 text-[#ff4655] font-black mb-3">
                        <Flame size={18} weight="fill" />
                        <span>GIỜ VÀNG FLASH SALE (Đếm ngược: {sec.config?.countdownEnd ? new Date(sec.config.countdownEnd).toLocaleTimeString('vi-VN') : '24:00:00'})</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {(sec.populatedData?.products || []).slice(0, 5).map(p => (
                          <div key={p._id || p.id} className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                            <div className="h-24 bg-zinc-100 dark:bg-zinc-950 rounded mb-1 overflow-hidden">
                              <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                            </div>
                            <p className="text-[11px] font-bold truncate text-zinc-900 dark:text-white">{p.title}</p>
                            <span className="text-xs font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'service_features' && (() => {
                    const defaultItems: ServiceFeatureItem[] = [
                      {
                        title: 'Build PC & Cấu Hình Đồ Họa',
                        description: 'Đội ngũ kỹ sư build cấu hình tối ưu hiệu năng. Hỗ trợ trả góp 0% qua thẻ tín dụng và CCCD duyệt nhanh 5 phút.',
                        badge: 'LÃI SUẤT 0%',
                        badgeColor: 'red',
                        icon: 'wrench',
                        ctaText: 'BẮT ĐẦU BUILD NGAY',
                        link: '/ProductPage?category=desktops'
                      },
                      {
                        title: 'Bảo Hành 1 Đổi 1 Tận Nơi',
                        description: 'Đặc quyền 1 đổi 1 trong 30 ngày nếu phát sinh lỗi phần cứng từ nhà sản xuất. Hỗ trợ mượn máy thay thế khi bảo hành.',
                        badge: '30 NGÀY VIP',
                        badgeColor: 'blue',
                        icon: 'shield',
                        ctaText: 'TRA CỨU BẢO HÀNH',
                        link: '/dich-vu'
                      },
                      {
                        title: 'Giao Hàng Hỏa Tốc & Miễn Phí',
                        description: 'Miễn phí giao hàng toàn quốc cho đơn từ 1.000.000₫. Đóng gói chuyên dụng chống sốc đạt chuẩn vận chuyển đồ công nghệ.',
                        badge: 'SIÊU TỐC 2H',
                        badgeColor: 'emerald',
                        icon: 'truck',
                        ctaText: 'XEM CHÍNH SÁCH SHIP',
                        link: '/about'
                      }
                    ];
                    const populatedItems = sec.populatedData?.items
                    const items = sec.config?.items?.length
                      ? sec.config.items
                      : populatedItems?.length
                        ? populatedItems
                        : defaultItems

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {items.map((it: ServiceFeatureItem, itIdx: number) => {
                          const color = it.badgeColor || (itIdx === 0 ? 'red' : itIdx === 1 ? 'blue' : 'emerald');
                          const barColor = color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-[#ff4655]';
                          const badgeClass = color === 'blue' 
                            ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                            : color === 'emerald' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                            : 'bg-[#ff4655]/10 text-[#ff4655] border-[#ff4655]/30';
                          const ctaColor = color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-[#ff4655]';

                          return (
                            <div key={itIdx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col justify-between min-h-[135px] relative overflow-hidden shadow-xs">
                              <div className={`absolute top-0 left-0 w-1.5 h-full ${barColor}`}></div>
                              <div className="space-y-1.5 pl-2">
                                <div className="flex items-center justify-between">
                                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center border ${badgeClass}`}>
                                    {it.icon === 'shield' ? <ShieldCheck size={16} weight="fill" /> : it.icon === 'truck' ? <Truck size={16} weight="fill" /> : <Wrench size={16} weight="fill" />}
                                  </span>
                                  {it.badge && (
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-mono font-bold uppercase border ${badgeClass}`}>
                                      {it.badge}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white">
                                    {it.title}
                                  </h4>
                                  <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5">
                                    {it.description}
                                  </p>
                                </div>
                              </div>
                              <div className={`pl-2 pt-2 flex items-center justify-between text-[9px] font-black uppercase ${ctaColor}`}>
                                <span>{it.ctaText || 'XEM NGAY'}</span>
                                <ArrowRight size={12} weight="bold" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          )}
        </div>
  )
}
