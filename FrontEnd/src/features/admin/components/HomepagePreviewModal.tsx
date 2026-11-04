import {
  ArrowClockwise,
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Eye,
  Flame,
  ShieldCheck,
  Truck,
  Wrench,
  X
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { SafeProductImage } from '../../../components/common/ProductImage'
import type { PopulatedSection, ServiceFeatureItem } from '../../../services/homepageService'

interface HomepagePreviewModalProps {
  isOpen: boolean
  loading: boolean
  sections: PopulatedSection[]
  onClose: () => void
  onPublish: () => void
}

export default function HomepagePreviewModal({
  isOpen,
  loading,
  sections,
  onClose,
  onPublish
}: HomepagePreviewModalProps) {
  return (
    <>{isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-2xl">
            {/* Preview Toolbar */}
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-500 border border-blue-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  <Eye size={14} weight="bold" /> CHẾ ĐỘ XEM TRƯỚC BẢN NHÁP
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  (Dữ liệu sản phẩm & danh mục THẬT từ MongoDB)
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onClose()
                    onPublish()
                  }}
                  className="px-4 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1"
                >
                  <CheckCircle size={14} weight="bold" />
                  <span>Xuất bản ngay</span>
                </button>

                <button
                  onClick={() => onClose()}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={20} weight="bold" />
                </button>
              </div>
            </div>

            {/* Preview Scroll Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-12 bg-zinc-50 dark:bg-zinc-950">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 space-y-2">
                  <ArrowClockwise size={28} className="animate-spin text-[#ff4655]" />
                  <p className="text-xs text-zinc-400">Đang truy vấn dữ liệu sản phẩm thực tế...</p>
                </div>
              ) : (
                sections.map((sec, idx) => (
                  <div key={sec.sectionKey || idx} className="space-y-4 relative border-l-2 border-[#ff4655]/40 pl-4">
                    {/* Section Badge in Preview */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-zinc-400">#{idx + 1}</span>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 dark:text-white">
                            {sec.title}
                          </h3>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                            sec._previewBadge === 'active'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : sec._previewBadge === 'scheduled'
                              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {sec._previewBadge === 'active' ? 'Hiển thị ngay' : sec._previewBadge === 'scheduled' ? 'Đã lên lịch' : 'Tắt / Hết hạn'}
                          </span>
                        </div>
                        {sec.subtitle && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{sec.subtitle}</p>
                        )}
                      </div>

                      {sec.config.showViewAll && sec.config.viewAllLink && (
                        <a
                          href={sec.config.viewAllLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-[#ff4655] hover:underline flex items-center gap-1"
                        >
                          Xem tất cả <ArrowSquareOut size={12} weight="bold" />
                        </a>
                      )}
                    </div>

                    {/* Populated Data Display */}
                    {sec.type === 'category_products' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {sec.populatedData?.products && sec.populatedData.products.length > 0 ? (
                          sec.populatedData.products.map(p => (
                            <div
                              key={p._id || p.id}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden p-3 space-y-2 shadow-sm"
                            >
                              <div className="h-32 bg-zinc-100 dark:bg-zinc-950 rounded flex items-center justify-center text-2xl overflow-hidden">
                                <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 line-clamp-1">{p.title}</h4>
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                                <span className="text-[10px] text-zinc-400">Kho: {p.stock}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full py-8 text-center text-xs text-zinc-400 bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800">
                            Chưa có sản phẩm nào thuộc danh mục này trong database.
                          </div>
                        )}
                      </div>
                    )}

                    {sec.type === 'banner_slider' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(sec.populatedData?.banners || []).map((b, bIdx) => (
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
                      <div className="p-4 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
                        <div className="flex items-center gap-2 text-[#ff4655] font-black mb-3">
                          <Flame size={18} weight="fill" />
                          <span>GIỜ VÀNG FLASH SALE (Đếm ngược: {sec.config.countdownEnd ? new Date(sec.config.countdownEnd).toLocaleTimeString('vi-VN') : '24:00:00'})</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          {(sec.populatedData?.products || []).slice(0, 5).map(p => (
                            <div key={p._id || p.id} className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
                              <div className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded mb-1 overflow-hidden">
                                <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <p className="text-[11px] font-bold truncate">{p.title}</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {items.map((it: ServiceFeatureItem, itIdx: number) => {
                            const color = it.badgeColor || (itIdx === 0 ? 'red' : itIdx === 1 ? 'blue' : 'emerald');
                            const borderClass = color === 'blue' ? 'bg-blue-500' : color === 'emerald' ? 'bg-emerald-500' : 'bg-[#ff4655]';
                            const badgeClass = color === 'blue' 
                              ? 'bg-blue-500/10 text-blue-500 border-blue-500/30' 
                              : color === 'emerald' 
                              ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' 
                              : 'bg-[#ff4655]/10 text-[#ff4655] border-[#ff4655]/30';
                            const textCta = color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-[#ff4655]';

                            return (
                              <div key={itIdx} className="bg-white dark:bg-gradient-to-br dark:from-zinc-900/90 dark:to-zinc-950/95 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col justify-between min-h-[175px] shadow-sm relative overflow-hidden">
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${borderClass}`}></div>
                                <div className="space-y-3 pl-2">
                                  <div className="flex items-center justify-between">
                                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border ${badgeClass}`}>
                                      {it.icon === 'shield' ? <ShieldCheck size={20} weight="fill" /> : it.icon === 'truck' ? <Truck size={20} weight="fill" /> : <Wrench size={20} weight="fill" />}
                                    </span>
                                    {it.badge && (
                                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase border ${badgeClass}`}>
                                        {it.badge}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <h3 className="text-base font-black tracking-tight uppercase text-zinc-900 dark:text-white">
                                      {it.title}
                                    </h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mt-1">
                                      {it.description}
                                    </p>
                                  </div>
                                </div>
                                <div className={`pl-2 pt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-wider ${textCta}`}>
                                  <span>{it.ctaText || 'XEM NGAY'}</span>
                                  <ArrowRight size={14} weight="bold" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
