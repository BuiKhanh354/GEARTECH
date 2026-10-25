import apiClient from '../api/client';

export interface CartItemDetail {
  _id: string;
  productId: string;
  title: string;
  slug?: string;
  sku?: string;
  imageEmoji: string;
  currentPrice: number;
  price?: number;
  oldPrice?: number;
  originalPrice?: number;
  savings?: number;
  isPriceLocked?: boolean;
  priceLockExpiresAt?: string;
  priceLockRemainingMs?: number;
  promotionNote?: string;
  stock: number;
  quantity: number;
  selected: boolean;
  variant: string;
  shop: {
    id?: string;
    name: string;
  };
  category?: string;
  categoryName?: string;
  lineTotal: number;
  isAvailable: boolean;
  isExceedingStock?: boolean;
  unavailableReason?: string;
}

export interface CartDetailsResponse {
  cartId: string;
  userId: string;
  customerId?: string;
  items: CartItemDetail[];
  subtotal: number;
  totalCount: number;
  hasUnavailableItems: boolean;
  updatedAt?: string;
}

export interface CartValidationResponse {
  isValid: boolean;
  issues: Array<{
    productId?: string;
    title?: string;
    error: string;
    availableStock?: number;
  }>;
  verifiedTotal: number;
  selectedCount: number;
}

export const cartService = {
  // 1. Lấy thông tin giỏ hàng chi tiết từ backend (được kiểm tra giá và tồn kho thời gian thực)
  async getCart(): Promise<CartDetailsResponse> {
    const res = await apiClient.get('/cart');
    return res.data;
  },

  // 2. Thêm sản phẩm vào giỏ hàng
  async addToCart(productId: string, quantity = 1, variant = 'Tiêu chuẩn / Chính hãng'): Promise<{ message: string; cart: CartDetailsResponse }> {
    const res = await apiClient.post('/cart/items', { productId, quantity, variant });
    return res.data;
  },

  // 3. Cập nhật số lượng hoặc trạng thái chọn (selected)
  async updateCartItem(
    productId: string, 
    data: { quantity?: number; selected?: boolean; variant?: string }
  ): Promise<{ message: string; cart: CartDetailsResponse }> {
    const res = await apiClient.put(`/cart/items/${productId}`, data);
    return res.data;
  },

  // 4. Xóa sản phẩm khỏi giỏ hàng
  async removeCartItem(productId: string): Promise<{ message: string; cart: CartDetailsResponse }> {
    const res = await apiClient.delete(`/cart/items/${productId}`);
    return res.data;
  },

  // 5. Làm sạch giỏ hàng (hoặc chỉ xóa các mục đã chọn sau thanh toán)
  async clearCart(onlySelected = false): Promise<{ message: string; cart: CartDetailsResponse }> {
    const res = await apiClient.delete('/cart/clear', { params: { onlySelected } });
    return res.data;
  },

  // 6. Đồng bộ giỏ hàng từ localStorage lên server khi đăng nhập
  async syncCart(localItems: any[]): Promise<{ message: string; cart: CartDetailsResponse }> {
    const res = await apiClient.post('/cart/sync', { localItems });
    return res.data;
  },

  // 7. Kiểm tra lại giá và tồn kho trước khi đặt hàng (pre-checkout validation)
  async validateCart(): Promise<CartValidationResponse> {
    const res = await apiClient.get('/cart/validate');
    return res.data;
  }
};

export default cartService;
