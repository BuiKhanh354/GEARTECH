import React from 'react'
import {
  ChatCircleDots,
  Star,
  Warning,
  PaperPlaneTilt
} from '@phosphor-icons/react'
import type { ProductItem } from '../../../services/productService'

export interface ProductTabsContentProps {
  product: ProductItem
  shopName: string
  productSpecsList: Array<{ name: string; value: string }>
  activeTab: 'desc' | 'specs' | 'reviews'
  reviewsData: any
  isEligibleReview: boolean
  userReviewRating: number
  userReviewComment: string
  isSubmittingReview: boolean
  reviewMsg: { type: 'success' | 'error'; text: string } | null
  onTabChange: (tab: 'desc' | 'specs' | 'reviews') => void
  onRatingChange: (rating: number) => void
  onCommentChange: (comment: string) => void
  onSubmitReview: (e: React.FormEvent) => void
}

export const ProductTabsContent: React.FC<ProductTabsContentProps> = ({
  product,
  shopName,
  productSpecsList,
  activeTab,
  reviewsData,
  isEligibleReview,
  userReviewRating,
  userReviewComment,
  isSubmittingReview,
  reviewMsg,
  onTabChange,
  onRatingChange,
  onCommentChange,
  onSubmitReview
}) => {
  return (
    <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4">
      {/* Tabs navigation */}
      <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded border border-zinc-200 dark:border-zinc-850 self-start w-fit">
        <button
          type="button"
          onClick={() => onTabChange('desc')}
          className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'desc'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Mô tả sản phẩm
        </button>
        <button
          type="button"
          onClick={() => onTabChange('specs')}
          className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all cursor-pointer ${
            activeTab === 'specs'
              ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Thông số kỹ thuật
        </button>
        <button
          type="button"
          onClick={() => onTabChange('reviews')}
          className={`text-[10px] px-4 py-2 rounded font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reviews'
              ? 'bg-white dark:bg-zinc-900 text-[#ff4655] shadow-sm border border-zinc-200 dark:border-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <ChatCircleDots size={13} />
          Đánh giá ({reviewsData.totalReviews || 0})
        </button>
      </div>

      {/* Tab 1: Description */}
      {activeTab === 'desc' && (
        <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed pt-2">
          <p className="whitespace-pre-line font-semibold leading-relaxed tracking-wide">{product.description}</p>
        </div>
      )}

      {/* Tab 2: Specs */}
      {activeTab === 'specs' && (
        <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-2 space-y-5">
          {productSpecsList.length > 0 ? (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-xs font-medium border-collapse">
                <tbody>
                  {productSpecsList.map((spec, idx) => (
                    <tr
                      key={idx}
                      className={`border-b border-zinc-100 dark:border-zinc-850/80 transition-colors ${
                        idx % 2 === 0
                          ? 'bg-zinc-50/70 dark:bg-zinc-900/40'
                          : 'bg-white dark:bg-zinc-950/20'
                      }`}
                    >
                      <td className="py-3 px-4 font-bold text-zinc-500 dark:text-zinc-400 w-1/3 sm:w-1/4">
                        {spec.name}
                      </td>
                      <td className="py-3 px-4 text-zinc-900 dark:text-zinc-100 font-semibold">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center bg-zinc-50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Chưa có thông số kỹ thuật cho sản phẩm này.</p>
              <p className="text-[10px] text-zinc-400">Chủ cửa hàng sẽ sớm cập nhật bảng thông số chi tiết.</p>
            </div>
          )}

          {/* Thông tin phụ trợ */}
          <div className="pt-2">
            <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">// THÔNG TIN PHỤ & NGUỒN GỐC</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850">
                <span className="text-[9px] text-zinc-400 block font-mono uppercase">DANH MỤC</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">{product.categoryName}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850">
                <span className="text-[9px] text-zinc-400 block font-mono uppercase">GIAN HÀNG</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">{shopName}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850">
                <span className="text-[9px] text-zinc-400 block font-mono uppercase">MÃ SKU</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">{product.sku || product._id?.slice(-8).toUpperCase()}</span>
              </div>
              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850">
                <span className="text-[9px] text-zinc-400 block font-mono uppercase">TỒN KHO</span>
                <span className={`text-xs font-black block mt-0.5 ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {product.stock > 0 ? `CÒN HÀNG (${product.stock})` : 'HẾT HÀNG'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reviews */}
      {activeTab === 'reviews' && (
        <div className="space-y-6 pt-2">
          {/* Rating Summary */}
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-[#ff4655]">
                {reviewsData.totalReviews > 0 ? Number(reviewsData.averageRating).toFixed(1) : '0.0'} <span className="text-xs text-zinc-400 font-normal">/ 5.0</span>
              </div>
              <div className="flex gap-1 text-amber-500 text-sm mt-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = reviewsData.totalReviews > 0 && star <= Math.round(reviewsData.averageRating)
                  return (
                    <Star 
                      key={star} 
                      size={14} 
                      weight={isFilled ? 'fill' : 'regular'} 
                      className={isFilled ? 'text-amber-400' : 'text-zinc-400 dark:text-zinc-600'}
                    />
                  )
                })}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 block">
                {reviewsData.totalReviews > 0 ? `Dựa trên ${reviewsData.totalReviews} đánh giá thực tế` : 'Sản phẩm chưa có đánh giá nào từ người mua'}
              </span>
            </div>

            <div className="text-right text-[10px] text-zinc-400 space-y-0.5">
              <div>5★: {reviewsData.starCounts?.[5] || 0}</div>
              <div>4★: {reviewsData.starCounts?.[4] || 0}</div>
              <div>3★: {reviewsData.starCounts?.[3] || 0}</div>
            </div>
          </div>

          {/* Form Viết đánh giá */}
          {isEligibleReview ? (
            <form onSubmit={onSubmitReview} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="text-xs font-bold uppercase text-zinc-900 dark:text-white">
                Viết đánh giá của bạn (Khách hàng đã mua hàng)
              </div>

              {reviewMsg && (
                <div className={`p-2.5 rounded text-xs font-semibold ${
                  reviewMsg.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {reviewMsg.text}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-bold uppercase">Đánh giá sao:</span>
                <div className="flex gap-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onRatingChange(s)}
                      className="hover:scale-125 transition-transform cursor-pointer"
                    >
                      <Star size={18} weight={s <= userReviewRating ? 'fill' : 'regular'} />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={userReviewComment}
                onChange={(e) => onCommentChange(e.target.value)}
                placeholder="Chia sẻ trải nghiệm sử dụng thiết bị của bạn..."
                className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white resize-none h-20"
                required
              />

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-bold uppercase rounded flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PaperPlaneTilt size={13} weight="bold" />
                {isSubmittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
              </button>
            </form>
          ) : (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded text-[11px] text-zinc-500 flex items-center gap-2">
              <Warning size={14} className="text-amber-500 shrink-0" />
              <span>Chỉ những khách hàng đã mua sản phẩm này trong đơn hàng đã hoàn tất mới có thể gửi đánh giá.</span>
            </div>
          )}

          {/* Danh sách đánh giá */}
          <div className="space-y-3">
            {reviewsData.reviews?.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500">
                Chưa có nhận xét nào cho thiết bị này. Hãy là người đầu tiên trải nghiệm!
              </div>
            ) : (
              reviewsData.reviews?.map((rev: any) => (
                <div key={rev._id} className="p-3.5 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {rev.user_id?.name || rev.userId?.name || 'Khách hàng GearTech'}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>

                  <div className="flex text-amber-500 text-xs gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} weight={s <= rev.rating ? 'fill' : 'regular'} />
                    ))}
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

