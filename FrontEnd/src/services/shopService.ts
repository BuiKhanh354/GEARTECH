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

// Kết quả thống kê kinh doanh từ GET /api/shops/me/analytics
export interface ShopAnalytics {
  shop: { _id: string; name: string; status: string }
  period: { days: number; since: string }
  kpis: {
    revenue: number
    completedCount: number
    ordersCount: number
    itemsSold: number
    aov: number
    followersCount: number
  }
  statusCounts: { pending: number; confirmed: number; shipping: number; completed: number; cancelled: number }
  series: { date: string; revenue: number; orders: number }[]
  topProducts: { _id: string; title: string; price: number; imageEmoji: string; soldCount: number; stock: number }[]
  inventoryAlerts: {
    lowStockCount: number
    outOfStockCount: number
    lowStock: { _id: string; title: string; stock: number }[]
    outOfStock: { _id: string; title: string }[]
  }
  expiringVouchers: { _id: string; code: string; description: string; expiryDate: string }[]
  recentOrders: { _id: string; createdAt: string; status: string; total: number; itemCount: number; itemNames: string[] }[]
}

export const shopService = {
  // Thống kê kinh doanh của shop đang đăng nhập (doanh thu, đơn hàng, tồn kho, bán chạy)
  getMyAnalytics: async (days?: number): Promise<ShopAnalytics> => {
    const res = await apiClient.get<ShopAnalytics>('/shops/me/analytics', { params: days ? { days } : undefined })
    return res.data
  },

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
  },

  // 8. Seller Centre: Lấy thống kê kinh doanh thực tế từ MongoDB
  getShopAnalytics: async (days: number = 7): Promise<any> => {
    const res = await apiClient.get('/shops/me/analytics', { params: { days } })
    return res.data
  }
}
