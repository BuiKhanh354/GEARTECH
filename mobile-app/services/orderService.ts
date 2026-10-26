import { api, toAppError } from './client'
import type { CheckoutInfo, Order } from '../types/api'

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[]
  shippingAddress: {
    receiverName: string
    receiverPhone: string
    detailAddress: string
    province?: string
    district?: string
    ward?: string
  }
  paymentMethod: 'COD' | 'BANK_TRANSFER'
  voucherCode?: string
  note?: string
}

export const orderService = {
  // GET /api/orders — chỉ đơn của chính người dùng (backend lọc theo token)
  async getMyOrders(): Promise<Order[]> {
    try {
      const res = await api.get<Order[]>('/orders')
      return Array.isArray(res.data) ? res.data : []
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/orders/:id — backend kiểm tra quyền sở hữu đơn
  async getOrderById(id: string): Promise<Order> {
    try {
      const res = await api.get<Order>(`/orders/${id}`)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // POST /api/orders — đặt hàng; backend xác thực giá & tồn kho, không tin client
  async createOrder(payload: CreateOrderPayload): Promise<{ message: string; orders: Order[] }> {
    try {
      const res = await api.post<{ message: string; orders: Order[] }>('/orders', payload)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // PUT /api/orders/:id/cancel — chỉ cho phép hủy đơn đang chờ xác nhận (nghiệp vụ backend)
  async cancelOrder(id: string): Promise<{ message: string }> {
    try {
      const res = await api.put<{ message: string }>(`/orders/${id}/cancel`)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/customers/checkout-info — địa chỉ giao hàng mặc định để điền sẵn
  async getCheckoutInfo(): Promise<CheckoutInfo> {
    try {
      const res = await api.get<CheckoutInfo>('/customers/checkout-info')
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  }
}
