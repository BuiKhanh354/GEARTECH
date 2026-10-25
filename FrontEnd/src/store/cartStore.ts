import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { cartService } from '../services/cartService'

export interface CartStoreItem {
  id: string
  productId: string
  title: string
  price: number
  oldPrice?: number
  originalPrice?: number
  savings?: number
  isPriceLocked?: boolean
  priceLockExpiresAt?: string
  priceLockRemainingMs?: number
  promotionNote?: string
  imageEmoji: string
  categoryName: string
  shopName: string
  quantity: number
  selected: boolean
  variant: string
  stock?: number
  isAvailable?: boolean
  unavailableReason?: string
}

interface CartState {
  items: CartStoreItem[]
  isLoading: boolean
  syncWithBackend: () => Promise<void>
  addItem: (product: any, quantity?: number, variant?: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, delta: number) => Promise<void>
  setQuantity: (productId: string, quantity: number) => Promise<void>
  toggleSelect: (productId: string) => Promise<void>
  toggleSelectAll: (selectState?: boolean) => void
  removeSelected: () => Promise<void>
  clearCart: () => Promise<void>
  getSubtotal: () => number
  getTotalCount: () => number
}

// In-flight tracker để chống bấm double-click hoặc gọi trùng hàm thêm vào giỏ
const inFlightAddSet = new Set<string>()

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      // 1. Đồng bộ giỏ hàng với Backend CSDL (Single Source of Truth)
      syncWithBackend: async () => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
          set({ isLoading: true })
          
          // Lấy dữ liệu giỏ hàng chuẩn từ server trước
          let cartData = await cartService.getCart()

          // Nếu server trống nhưng client có items (vừa đăng nhập từ chế độ khách), thực hiện sync 1 lần
          const localItems = get().items
          if ((!cartData.items || cartData.items.length === 0) && localItems.length > 0) {
            const syncRes = await cartService.syncCart(localItems)
            cartData = syncRes.cart
          }

          if (cartData && Array.isArray(cartData.items)) {
            const mappedItems: CartStoreItem[] = cartData.items.map((i) => ({
              id: i.productId,
              productId: i.productId,
              title: i.title,
              price: i.currentPrice ?? i.price ?? 0,
              oldPrice: i.oldPrice,
              originalPrice: i.originalPrice,
              savings: i.savings,
              isPriceLocked: i.isPriceLocked,
              priceLockExpiresAt: i.priceLockExpiresAt,
              priceLockRemainingMs: i.priceLockRemainingMs,
              promotionNote: i.promotionNote,
              imageEmoji: i.imageEmoji || '📦',
              categoryName: i.categoryName || 'Linh kiện',
              shopName: i.shop?.name || 'GEARTECH OFFICIAL',
              quantity: i.quantity,
              selected: i.selected,
              variant: i.variant || 'Tiêu chuẩn / Chính hãng',
              stock: i.stock,
              isAvailable: i.isAvailable,
              unavailableReason: i.unavailableReason
            }))
            set({ items: mappedItems })
          }
        } catch (err) {
          console.error('Lỗi khi đồng bộ giỏ hàng với Backend:', err)
        } finally {
          set({ isLoading: false })
        }
      },

      // 2. Thêm sản phẩm vào giỏ (chống gọi trùng, chuẩn hóa số lượng và giới hạn tồn kho)
      addItem: async (product, quantity, variant = 'Tiêu chuẩn / Chính hãng') => {
        const pId = product._id || product.id || product.productId
        if (!pId) return

        // Chống gọi trùng / race-condition do double click
        if (inFlightAddSet.has(pId)) return
        inFlightAddSet.add(pId)

        const numQty = Math.max(1, (quantity !== undefined && quantity !== null) ? Number(quantity) : Number(product.quantity || 1))
        const maxStock = product.stock !== undefined ? product.stock : 999
        const token = localStorage.getItem('token')

        try {
          // Cập nhật optimistic local
          set((state) => {
            const existingIndex = state.items.findIndex((item) => item.productId === pId)
            if (existingIndex > -1) {
              const updated = [...state.items]
              const currentQty = updated[existingIndex].quantity
              updated[existingIndex].quantity = Math.min(maxStock, currentQty + numQty)
              updated[existingIndex].selected = true
              return { items: updated }
            } else {
              const shopName = product.shopId?.name || product.shopId?.shopName || product.shop?.name || (typeof product.shop === 'string' ? product.shop : 'GEARTECH OFFICIAL')
              const isPromo = Boolean(product.oldPrice && product.oldPrice > product.price)
              const newItem: CartStoreItem = {
                id: pId,
                productId: pId,
                title: product.title || product.name,
                price: product.price,
                oldPrice: product.oldPrice,
                originalPrice: isPromo ? product.oldPrice : product.price,
                isPriceLocked: isPromo,
                promotionNote: isPromo ? 'Giữ giá ưu đãi 48 giờ' : undefined,
                imageEmoji: product.imageEmoji || product.image || product.imageUrl || '📦',
                categoryName: product.categoryName || 'Linh kiện',
                shopName,
                quantity: Math.min(maxStock, numQty),
                selected: true,
                variant,
                stock: product.stock,
                isAvailable: product.status === 'active' && (product.stock === undefined || product.stock > 0)
              }
              return { items: [...state.items, newItem] }
            }
          })

          // Đồng bộ server nếu đã đăng nhập
          if (token) {
            await cartService.addToCart(pId, numQty, variant)
            // Lấy lại dữ liệu chính xác từ Backend
            const freshCart = await cartService.getCart()
            if (freshCart && Array.isArray(freshCart.items)) {
              set({
                items: freshCart.items.map((i) => ({
                  id: i.productId,
                  productId: i.productId,
                  title: i.title,
                  price: i.currentPrice ?? i.price ?? 0,
                  oldPrice: i.oldPrice,
                  originalPrice: i.originalPrice,
                  savings: i.savings,
                  isPriceLocked: i.isPriceLocked,
                  priceLockExpiresAt: i.priceLockExpiresAt,
                  priceLockRemainingMs: i.priceLockRemainingMs,
                  promotionNote: i.promotionNote,
                  imageEmoji: i.imageEmoji || '📦',
                  categoryName: i.categoryName || 'Linh kiện',
                  shopName: i.shop?.name || 'GEARTECH OFFICIAL',
                  quantity: i.quantity,
                  selected: i.selected,
                  variant: i.variant || 'Tiêu chuẩn / Chính hãng',
                  stock: i.stock,
                  isAvailable: i.isAvailable,
                  unavailableReason: i.unavailableReason
                }))
              })
            }
          }
        } catch (err) {
          console.error('Lỗi khi thêm sản phẩm vào giỏ:', err)
        } finally {
          inFlightAddSet.delete(pId)
        }
      },

      // 3. Xóa sản phẩm khỏi giỏ
      removeItem: async (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId && item.id !== productId)
        }))

        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.removeCartItem(productId)
          } catch (err) {
            console.error('Lỗi xóa sản phẩm trên server:', err)
          }
        }
      },

      // 4. Cập nhật số lượng (+/- delta)
      updateQuantity: async (productId, delta) => {
        let finalQty = 1
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId || item.id === productId) {
              const maxStock = item.stock !== undefined ? item.stock : 999
              finalQty = Math.min(maxStock, Math.max(1, item.quantity + delta))
              return { ...item, quantity: finalQty }
            }
            return item
          })
        }))

        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.updateCartItem(productId, { quantity: finalQty })
          } catch (err) {
            console.error('Lỗi cập nhật số lượng trên server:', err)
          }
        }
      },

      // 5. Cập nhật trực tiếp số lượng cụ thể
      setQuantity: async (productId, qty) => {
        const validQty = Math.max(1, qty)
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId || item.id === productId) {
              const maxStock = item.stock !== undefined ? item.stock : 999
              return { ...item, quantity: Math.min(maxStock, validQty) }
            }
            return item
          })
        }))

        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.updateCartItem(productId, { quantity: validQty })
          } catch (err) {
            console.error('Lỗi cập nhật số lượng trên server:', err)
          }
        }
      },

      // 6. Chọn / Bỏ chọn sản phẩm
      toggleSelect: async (productId) => {
        let newSelected = true
        set((state) => ({
          items: state.items.map((item) => {
            if (item.productId === productId || item.id === productId) {
              newSelected = !item.selected
              return { ...item, selected: newSelected }
            }
            return item
          })
        }))

        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.updateCartItem(productId, { selected: newSelected })
          } catch (err) {
            console.error('Lỗi cập nhật trạng thái chọn trên server:', err)
          }
        }
      },

      // 7. Chọn / Bỏ chọn tất cả
      toggleSelectAll: (selectState) => {
        set((state) => {
          const newState = selectState !== undefined ? selectState : !state.items.every((i) => i.selected)
          return {
            items: state.items.map((item) => ({ ...item, selected: newState }))
          }
        })
      },

      // 8. Xóa các sản phẩm đang chọn
      removeSelected: async () => {
        set((state) => ({
          items: state.items.filter((item) => !item.selected)
        }))

        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.clearCart(true)
          } catch (err) {
            console.error('Lỗi xóa mục chọn trên server:', err)
          }
        }
      },

      // 9. Xóa sạch giỏ hàng
      clearCart: async () => {
        set({ items: [] })
        const token = localStorage.getItem('token')
        if (token) {
          try {
            await cartService.clearCart(false)
          } catch (err) {
            console.error('Lỗi làm sạch giỏ hàng trên server:', err)
          }
        }
      },

      // 10. Tạm tính dựa trên các sản phẩm đang được chọn
      getSubtotal: () => {
        return get()
          .items.filter((item) => item.selected && item.isAvailable !== false)
          .reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      // 11. Tổng số lượng
      getTotalCount: () => {
        return get()
          .items.filter((item) => item.isAvailable !== false)
          .reduce((sum, item) => sum + item.quantity, 0)
      }
    }),
    {
      name: 'geartech_cart'
    }
  )
)
