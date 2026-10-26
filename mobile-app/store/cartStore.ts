import { create } from 'zustand'
import type { CartResponse } from '../types/api'

// Số lượng hiển thị trên badge tab Giỏ hàng — được sync từ response thật của
// GET /api/cart (totalCount do backend tính), không tự đếm phía client
interface CartState {
  cartCount: number
  setFromCart: (cart: CartResponse) => void
  reset: () => void
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,
  setFromCart: (cart) => set({ cartCount: cart.totalCount ?? 0 }),
  reset: () => set({ cartCount: 0 })
}))
