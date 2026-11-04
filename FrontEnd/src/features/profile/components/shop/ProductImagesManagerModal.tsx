import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, ArrowsClockwise, CheckCircle, Images, Plus, Star, Trash, UploadSimple, WarningCircle, X } from '@phosphor-icons/react'
import type { RefObject, FormEvent } from 'react'
import type { ProductItem } from '../../../../services/productService'
import type { ProductImageItem } from '../../../../services/productImageService'
import { SafeProductImage } from '../../../../components/common/ProductImage'

interface ProductImagesManagerModalProps {
  isOpen: boolean
  product: ProductItem | null
  images: ProductImageItem[]
  loading: boolean
  busy: boolean
  error: string | null
  success: string | null
  newImageUrl: string
  newImageIsPrimary: boolean
  fileInputRef: RefObject<HTMLInputElement | null>
  onOpenChange: (open: boolean) => void
  onNewImageUrlChange: (value: string) => void
  onNewImageIsPrimaryChange: (value: boolean) => void
  onUploadFiles: (files: FileList | null) => void
  onAddImageUrl: (event: FormEvent) => void
  onSetPrimaryImage: (imageId: string) => void
  onMoveImage: (index: number, direction: 'up' | 'down') => void
  onDeleteImage: (imageId: string) => void
}

export default function ProductImagesManagerModal(props: ProductImagesManagerModalProps) {
  const { isOpen, product, images, loading, busy, error, success, newImageUrl, newImageIsPrimary, fileInputRef, onOpenChange, onNewImageUrlChange, onNewImageIsPrimaryChange, onUploadFiles, onAddImageUrl, onSetPrimaryImage, onMoveImage, onDeleteImage } = props
  return (
      <AnimatePresence>
        {isOpen && product && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#ff4655]/10 rounded-lg border border-[#ff4655]/20 text-[#ff4655]">
                    <Images size={20} weight="bold" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
                      QUẢN LÝ THƯ VIỆN HÌNH ẢNH // PRODUCT_IMAGES
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium truncate max-w-md">
                      Thiết bị: <strong className="text-zinc-800 dark:text-zinc-200">{product.title}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Alert Feedback */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs font-semibold text-red-500 flex items-center gap-2">
                  <WarningCircle size={16} weight="bold" className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs font-semibold text-emerald-500 flex items-center gap-2">
                  <CheckCircle size={16} weight="bold" className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* Thêm ảnh mới (Upload hoặc Dán URL) */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-850 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">// THÊM ẢNH MỚI CHO THIẾT BỊ</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={newImageIsPrimary}
                      onChange={e => onNewImageIsPrimaryChange(e.target.checked)}
                      className="rounded border-zinc-700 text-[#ff4655] focus:ring-0"
                    />
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                      <Star size={12} weight="fill" /> Đặt làm ảnh chính ngay
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* Upload File Input */}
                  <div className="sm:col-span-5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={e => onUploadFiles(e.target.files)}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={busy}
                      className="w-full h-10 px-3 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#ff4655] rounded-lg text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-colors"
                    >
                      <UploadSimple size={16} className="text-[#ff4655]" />
                      <span>Tải ảnh từ máy tính</span>
                    </button>
                  </div>

                  {/* URL Input Form */}
                  <form onSubmit={onAddImageUrl} className="sm:col-span-7 flex gap-2">
                    <input
                      type="url"
                      value={newImageUrl}
                      onChange={e => onNewImageUrlChange(e.target.value)}
                      placeholder="Hoặc dán URL ảnh (https://...)"
                      className="flex-1 px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                    />
                    <button
                      type="submit"
                      disabled={busy || !newImageUrl.trim()}
                      className="px-3.5 py-2 bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
                    >
                      <Plus size={14} weight="bold" /> Thêm
                    </button>
                  </form>
                </div>
              </div>

              {/* Danh sách ảnh hiện có (Sắp xếp, Đặt ảnh chính, Xóa) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                    // DANH SÁCH HÌNH ẢNH ({images.length}) - SẮP XẾP & CHỌN ẢNH ĐẠI DIỆN
                  </h5>
                  {busy && (
                    <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 animate-pulse">
                      <ArrowsClockwise size={12} className="animate-spin" /> Đang cập nhật...
                    </span>
                  )}
                </div>

                {loading ? (
                  <div className="py-12 text-center text-xs text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
                    <ArrowsClockwise size={20} className="animate-spin text-[#ff4655]" />
                    <span>Đang nạp thư viện ảnh của thiết bị...</span>
                  </div>
                ) : images.length === 0 ? (
                  <div className="py-10 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 text-xs space-y-2">
                    <Images size={28} className="mx-auto text-zinc-600 opacity-60" />
                    <p>Sản phẩm này chưa có hình ảnh nào trong thư viện.</p>
                    <p className="text-[11px] text-zinc-600">Hãy chọn tải ảnh lên từ máy tính hoặc dán URL ở khung phía trên.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {images.map((img, index) => {
                      const isFirst = index === 0
                      const isLast = index === images.length - 1

                      return (
                        <div
                          key={img._id || index}
                          className={`p-3 rounded-xl border relative flex gap-3 transition-all ${
                            img.isPrimary
                              ? 'bg-amber-500/5 border-amber-500/40 shadow-sm'
                              : 'bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          {/* Image Box with SafeProductImage Fallback */}
                          <div className="w-20 h-20 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden shrink-0 relative">
                            <SafeProductImage
                              src={img.imageUrl}
                              alt="Product"
                              className="w-full h-full object-cover"
                            />
                            {img.isPrimary && (
                              <span className="absolute top-1 left-1 bg-amber-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                                <Star size={10} weight="fill" /> CHÍNH
                              </span>
                            )}
                          </div>

                          {/* Info & Action Controls */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-zinc-400">
                                  Thứ tự #{img.sortOrder !== undefined ? img.sortOrder : index}
                                </span>
                                {img.isPrimary ? (
                                  <span className="text-[9px] font-bold text-amber-500 flex items-center gap-0.5">
                                    ★ Ảnh đại diện
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onSetPrimaryImage(img._id)}
                                    disabled={busy}
                                    className="text-[9px] font-bold text-zinc-400 hover:text-amber-500 underline"
                                  >
                                    Đặt làm ảnh chính
                                  </button>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 truncate font-mono" title={img.imageUrl}>
                                {img.imageUrl}
                              </p>
                            </div>

                            {/* Buttons bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-150 dark:border-zinc-850 mt-1">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => onMoveImage(index, 'up')}
                                  disabled={isFirst || busy}
                                  title="Đưa lên trước"
                                  className="p-1 border border-zinc-200 dark:border-zinc-800 rounded hover:border-[#ff4655] hover:text-[#ff4655] text-zinc-400 disabled:opacity-20"
                                >
                                  <ArrowUp size={12} weight="bold" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onMoveImage(index, 'down')}
                                  disabled={isLast || busy}
                                  title="Đưa xuống sau"
                                  className="p-1 border border-zinc-200 dark:border-zinc-800 rounded hover:border-[#ff4655] hover:text-[#ff4655] text-zinc-400 disabled:opacity-20"
                                >
                                  <ArrowDown size={12} weight="bold" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onDeleteImage(img._id)}
                                disabled={busy}
                                className="px-2 py-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <Trash size={12} /> Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-end pt-3 border-t border-zinc-150 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="px-5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-850 text-zinc-900 dark:text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  )
}
