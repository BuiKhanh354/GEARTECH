import apiClient from '../api/client'
import type {
  Order,
  OrderItem,
  OrderItemPayload,
  CreateOrderPayload,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingAddressInfo
} from '../types/order'

export type {
  Order,
  OrderItem,
  OrderItemPayload,
  CreateOrderPayload,
  OrderStatus,
  PaymentStatus,
  PaymentMethod,
  ShippingAddressInfo
}

export const orderService = {
  // Khách hàng lấy danh sách đơn hàng của mình
  getMyOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/orders')
    return res.data
  },

  // Khách hàng xem chi tiết 1 đơn hàng
  getOrderById: async (id: string): Promise<Order> => {
    const res = await apiClient.get<Order>(`/orders/${id}`)
    return res.data
  },

  // Chủ shop lấy danh sách đơn hàng thuộc shop mình
  getShopOrders: async (): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/orders/shop')
    return res.data
  },

  // Admin xem toàn bộ đơn hàng hệ thống
  getAdminOrders: async (params?: { status?: string; search?: string }): Promise<Order[]> => {
    const res = await apiClient.get<Order[]>('/orders/admin', { params })
    return res.data
  },

  // Tạo đơn hàng mới từ giỏ hàng
  createOrder: async (payload: CreateOrderPayload): Promise<{ message: string; order?: Order; orders?: Order[] }> => {
    const res = await apiClient.post<{ message: string; order?: Order; orders?: Order[] }>('/orders', payload)
    return res.data
  },

  // Cập nhật trạng thái đơn hàng (Chủ shop / Admin)
  updateOrderStatus: async (
    id: string,
    orderStatus: OrderStatus | string,
    extraData?: { trackingCode?: string; carrier?: string }
  ): Promise<{ message: string; order: Order }> => {
    const res = await apiClient.put<{ message: string; order: Order }>(`/orders/${id}/status`, {
      orderStatus,
      ...extraData
    })
    return res.data
  },

  // Khách hàng tự hủy đơn hàng khi trạng thái còn pending
  cancelOrder: async (id: string): Promise<{ message: string; order: Order }> => {
    const res = await apiClient.put<{ message: string; order: Order }>(`/orders/${id}/cancel`)
    return res.data
  }
}
