import apiClient from '../api/client'

export interface CreateReviewPayload {
  productId: string
  rating: number
  comment: string
  images?: string[]
}

export const reviewService = {
  // Lấy danh sách đánh giá của sản phẩm
  getProductReviews: async (productId: string) => {
    const res = await apiClient.get(`/reviews/product/${productId}`)
    return res.data
  },

  // Kiểm tra điều kiện đánh giá của user
  checkEligibility: async (productId: string) => {
    const res = await apiClient.get(`/reviews/check-eligibility/${productId}`)
    return res.data
  },

  // Gửi hoặc cập nhật đánh giá
  submitReview: async (payload: CreateReviewPayload) => {
    const res = await apiClient.post('/reviews', payload)
    return res.data
  },

  // Sửa đánh giá
  updateReview: async (id: string, payload: Partial<CreateReviewPayload>) => {
    const res = await apiClient.put(`/reviews/${id}`, payload)
    return res.data
  },

  // Xóa đánh giá
  deleteReview: async (id: string) => {
    const res = await apiClient.delete(`/reviews/${id}`)
    return res.data
  }
}
