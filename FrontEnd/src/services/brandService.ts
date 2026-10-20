import apiClient from '../api/client'

export interface BrandItem {
  _id: string
  id?: string
  name: string
  slug: string
  logo?: string
  description?: string
  website?: string
  status: 'active' | 'hidden' | 'inactive'
  order?: number
  productCount?: number
  created_at?: string
  updated_at?: string
}

export const brandService = {
  // 1. Lấy danh sách thương hiệu đang hoạt động cho khách hàng & chủ shop
  getBrands: async (params?: { search?: string }): Promise<BrandItem[]> => {
    const res = await apiClient.get<BrandItem[]>('/brands', { params })
    return res.data
  },

  // 2. Admin lấy danh sách thương hiệu kèm số lượng sản phẩm liên kết
  getAdminBrands: async (params?: {
    search?: string
    status?: string
    page?: number
    limit?: number
  }): Promise<{ brands: BrandItem[]; total: number; totalPages: number }> => {
    const res = await apiClient.get<{ brands: BrandItem[]; total: number; totalPages: number }>('/brands/admin/all', { params })
    return res.data
  },

  // 3. Lấy chi tiết thương hiệu
  getBrandById: async (id: string): Promise<BrandItem> => {
    const res = await apiClient.get<BrandItem>(`/brands/${id}`)
    return res.data
  },

  // 4. Admin thêm mới thương hiệu (kiểm tra trùng lặp)
  createBrand: async (data: {
    name: string
    slug?: string
    logo?: string
    description?: string
    website?: string
    status?: 'active' | 'hidden' | 'inactive'
    order?: number
  }): Promise<{ message: string; brand: BrandItem }> => {
    const res = await apiClient.post<{ message: string; brand: BrandItem }>('/brands', data)
    return res.data
  },

  // 5. Admin cập nhật thương hiệu
  updateBrand: async (id: string, data: Partial<BrandItem>): Promise<{ message: string; brand: BrandItem }> => {
    const res = await apiClient.put<{ message: string; brand: BrandItem }>(`/brands/${id}`, data)
    return res.data
  },

  // 6. Admin đổi nhanh trạng thái thương hiệu (active / hidden / inactive)
  updateBrandStatus: async (id: string, status: 'active' | 'hidden' | 'inactive'): Promise<{ message: string; brand: BrandItem }> => {
    const res = await apiClient.put<{ message: string; brand: BrandItem }>(`/brands/${id}/status`, { status })
    return res.data
  },

  // 7. Admin xóa thương hiệu (bảo toàn dữ liệu lịch sử)
  deleteBrand: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/brands/${id}`)
    return res.data
  }
}
