import apiClient from '../api/client'

export interface OrderItemPayload {
  productId: string
  title?: string
  product_name?: string
  qty?: number
  quantity?: number
  price?: number
}

export interface CreateOrderPayload {
  items: OrderItemPayload[]
  shippingAddress: {
    receiverName: string
    receiverPhone: string
    detailAddress: string
    ward?: string
    district?: string
    province?: string
  } | string
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'cod' | 'bank_transfer' | 'credit_card' | 'momo'
  voucherCode?: string
  note?: string
}

export const orderService = {
  // Khách hàng lấy danh sách đơn hàng của mình
  getMyOrders: async () => {
    const res = await apiClient.get('/orders')
    return res.data
  },

  // Khách hàng xem chi tiết 1 đơn hàng
  getOrderById: async (id: string) => {
    const res = await apiClient.get(`/orders/${id}`)
    return res.data
  },

  // Chủ shop lấy danh sách đơn hàng thuộc shop mình
  getShopOrders: async () => {
    const res = await apiClient.get('/orders/shop')
    return res.data
  },

  // Admin xem toàn bộ đơn hàng hệ thống
  getAdminOrders: async (params?: { status?: string; search?: string }) => {
    const res = await apiClient.get('/orders/admin', { params })
    return res.data
  },

  // Tạo đơn hàng mới từ giỏ hàng
  createOrder: async (payload: CreateOrderPayload) => {
    const res = await apiClient.post('/orders', payload)
    return res.data
  },

  // Cập nhật trạng thái đơn hàng (Chủ shop / Admin)
  updateOrderStatus: async (id: string, orderStatus: string) => {
    const res = await apiClient.put(`/orders/${id}/status`, { orderStatus })
    return res.data
  },

  // Khách hàng tự hủy đơn hàng khi trạng thái còn pending
  cancelOrder: async (id: string) => {
    const res = await apiClient.put(`/orders/${id}/cancel`)
    return res.data
  }
}
