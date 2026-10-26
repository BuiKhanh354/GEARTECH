import { api, toAppError } from './client'
import type { CartResponse } from '../types/api'

export const cartService = {
  // GET /api/cart — giỏ hàng của người dùng đang đăng nhập
  async getCart(): Promise<CartResponse> {
    try {
      const res = await api.get<CartResponse>('/cart')
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // POST /api/cart/items — backend kiểm tra tồn kho và chốt giá tại server
  async addItem(productId: string, quantity = 1): Promise<{ message: string; cart: CartResponse }> {
    try {
      const res = await api.post<{ message: string; cart: CartResponse }>('/cart/items', { productId, quantity })
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // PUT /api/cart/items/:productId — cập nhật số lượng / trạng thái chọn
  async updateItem(productId: string, payload: { quantity?: number; selected?: boolean }): Promise<CartResponse> {
    try {
      const res = await api.put<CartResponse>(`/cart/items/${productId}`, payload)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // DELETE /api/cart/items/:productId
  async removeItem(productId: string): Promise<CartResponse> {
    try {
      const res = await api.delete<CartResponse>(`/cart/items/${productId}`)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // DELETE /api/cart/clear
  async clearCart(): Promise<{ message: string }> {
    try {
      const res = await api.delete<{ message: string }>('/cart/clear')
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  }
}
