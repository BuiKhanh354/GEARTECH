import apiClient from '../api/client'

export interface CardInfoPayload {
  cardNumber: string
  cardHolder?: string
  expiryDate?: string
  brand?: string
}

export interface CreateIntentPayload {
  orderId: string
  paymentMethod?: string
  cardInfo?: CardInfoPayload
}

export interface VerifyPaymentPayload {
  transactionCode: string
  gatewayToken?: string
  simulateSuccess?: boolean
}

export interface RetryPaymentPayload {
  orderId: string
  newPaymentMethod?: string
  cardInfo?: CardInfoPayload
}

export const paymentService = {
  // Lấy thông tin thanh toán của 1 đơn hàng
  getPaymentByOrderId: async (orderId: string) => {
    const res = await apiClient.get(`/payments/${orderId}`)
    return res.data
  },

  // Khởi tạo phiên thanh toán cho đơn hàng
  createPaymentIntent: async (payload: CreateIntentPayload) => {
    const res = await apiClient.post('/payments/create-intent', payload)
    return res.data
  },

  // Xác thực kết quả thanh toán từ cổng
  verifyPayment: async (payload: VerifyPaymentPayload) => {
    const res = await apiClient.post('/payments/verify', payload)
    return res.data
  },

  // Thử lại thanh toán nếu trước đó thất bại
  retryPayment: async (payload: RetryPaymentPayload) => {
    const res = await apiClient.post('/payments/retry', payload)
    return res.data
  },

  // Lấy lịch sử các khoản thanh toán của tôi
  getMyPaymentHistory: async () => {
    const res = await apiClient.get('/payments/my-payments/history')
    return res.data
  },

  // Admin xem toàn bộ giao dịch thanh toán
  getAdminPayments: async (params?: { status?: string; method?: string }) => {
    const res = await apiClient.get('/payments/admin/all', { params })
    return res.data
  }
}
