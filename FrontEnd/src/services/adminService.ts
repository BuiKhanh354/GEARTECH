import apiClient from '../api/client'

export interface AdminOverview {
  counts: {
    totalUsers: number
    totalCustomers: number
    totalShopOwners: number
    totalShops: number
    totalProducts: number
    totalOrders: number
    lockedUsers: number
    pendingShops: number
    activeShops: number
  }
  orderStatus: { pending: number; confirmed: number; shipping: number; completed: number; cancelled: number }
  orderValue: { totalAll: number; completed: number; note: string }
  period: { days: number; since: string }
  series: { date: string; revenue: number; orders: number; newUsers: number }[]
  alerts: {
    pendingShops: { _id: string; name?: string; shop_name?: string; createdAt: string; ownerId?: { name: string; email: string } }[]
  }
  recent: {
    orders: { _id: string; createdAt: string; status: string; total: number; itemCount: number }[]
    shops: { _id: string; name?: string; shop_name?: string; status: string; createdAt: string; total_products?: number }[]
    users: { _id: string; name: string; email: string; role: string; status: string; createdAt: string }[]
    products: { _id: string; title: string; price: number; stock: number; status: string; createdAt: string; shopId?: { name?: string } | null }[]
  }
}

export const adminService = {
  // Thống kê tổng quan toàn sàn cho Admin (GET /api/auth/admin/overview, backend chặn quyền admin)
  getOverview: async (days?: number): Promise<AdminOverview> => {
    const res = await apiClient.get<AdminOverview>('/auth/admin/overview', { params: days ? { days } : undefined })
    return res.data
  }
}
