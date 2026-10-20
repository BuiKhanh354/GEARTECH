import apiClient from '../api/client'

export interface ShopItem {
  _id: string
  id?: string
  name: string
  shop_name?: string
  description?: string
  logo: string
  category: string
  phone?: string
  email?: string
  address?: string
  commission_rate?: number | string
  rating: number
  followers: string
  total_products?: number
  bgClass?: string
  status: 'pending' | 'active' | 'rejected' | 'locked'
  rejectReason?: string
  ownerId?: {
    _id?: string
    id?: string
    name?: string
    email?: string
    phone?: string
  } | any
  createdAt?: string
  updatedAt?: string
}

export const shopService = {
  // 1. Lấy danh sách shop đang hoạt động (công khai cho khách hàng)
  getShops: async (params?: { search?: string; limit?: number; page?: number }): Promise<ShopItem[]> => {
    const res = await apiClient.get<ShopItem[]>('/shops', { params })
    return res.data
  },

  // 2. Admin lấy danh sách toàn bộ shop (kèm trạng thái pending, locked, rejected)
  getAdminShops: async (params?: { status?: string; search?: string; page?: number; limit?: number }): Promise<{ shops: ShopItem[]; total: number; totalPages: number }> => {
    const res = await apiClient.get<{ shops: ShopItem[]; total: number; totalPages: number }>('/shops/admin/all', { params })
    return res.data
  },

  // 3. Khách hàng xem trang chi tiết của shop kèm danh sách sản phẩm
  getShopById: async (shopId: string): Promise<{ shop: ShopItem; products: any[]; productsCount: number }> => {
    const res = await apiClient.get<{ shop: ShopItem; products: any[]; productsCount: number }>(`/shops/${shopId}`)
    return res.data
  },

  // 4. Chủ shop lấy thông tin cửa hàng của mình
  getMyShop: async (): Promise<{ shop: ShopItem }> => {
    const res = await apiClient.get<{ shop: ShopItem }>('/shops/my-shop')
    return res.data
  },

  // 5. Khách hàng gửi yêu cầu mở shop
  applyShop: async (data: {
    name: string
    description?: string
    phone?: string
    email?: string
    address?: string
    logo?: string
    category?: string
    bgClass?: string
  }): Promise<{ message: string; shop: ShopItem }> => {
    const res = await apiClient.post<{ message: string; shop: ShopItem }>('/shops/apply', data)
    return res.data
  },

  // 6. Chủ shop chỉnh sửa thông tin cửa hàng của mình
  updateShop: async (shopId: string, data: Partial<ShopItem>): Promise<{ message: string; shop: ShopItem }> => {
    const res = await apiClient.put<{ message: string; shop: ShopItem }>(`/shops/${shopId}`, data)
    return res.data
  },

  // 7. Admin duyệt, từ chối hoặc khóa cửa hàng
  updateShopStatus: async (
    shopId: string, 
    status: 'active' | 'rejected' | 'locked' | 'pending', 
    rejectReason?: string
  ): Promise<{ message: string; shop: ShopItem }> => {
    const res = await apiClient.put<{ message: string; shop: ShopItem }>(`/shops/${shopId}/status`, { status, rejectReason })
    return res.data
  }
}
