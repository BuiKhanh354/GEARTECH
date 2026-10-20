import apiClient from '../api/client'

export interface CategoryItem {
  _id: string
  id?: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parent_id?: {
    _id: string
    name: string
    slug: string
  } | null | string
  parent_category_id?: any
  status: 'active' | 'hidden' | 'inactive'
  order?: number
  productCount?: number
  children?: CategoryItem[]
  createdAt?: string
  updatedAt?: string
}

export const categoryService = {
  // 1. Lấy danh sách danh mục cho khách hàng & chủ shop
  getCategories: async (params?: { search?: string; parent_id?: string; tree?: boolean }): Promise<CategoryItem[]> => {
    const res = await apiClient.get<CategoryItem[]>('/categories', { params })
    return res.data
  },

  // 2. Admin lấy toàn bộ danh mục kèm số lượng sản phẩm, bộ lọc trạng thái
  getAdminCategories: async (params?: { search?: string; status?: string; page?: number; limit?: number }): Promise<{ categories: CategoryItem[]; total: number; totalPages: number }> => {
    const res = await apiClient.get<{ categories: CategoryItem[]; total: number; totalPages: number }>('/categories/admin/all', { params })
    return res.data
  },

  // 3. Lấy chi tiết danh mục theo ID hoặc Slug
  getCategoryById: async (id: string): Promise<{ category: CategoryItem; children: CategoryItem[] }> => {
    const res = await apiClient.get<{ category: CategoryItem; children: CategoryItem[] }>(`/categories/${id}`)
    return res.data
  },

  // 4. Admin tạo danh mục mới
  createCategory: async (data: {
    name: string
    slug?: string
    description?: string
    image?: string
    icon?: string
    parent_id?: string | null
    status?: 'active' | 'hidden' | 'inactive'
    order?: number
  }): Promise<{ message: string; category: CategoryItem }> => {
    const res = await apiClient.post<{ message: string; category: CategoryItem }>('/categories', data)
    return res.data
  },

  // 5. Admin chỉnh sửa danh mục
  updateCategory: async (id: string, data: Partial<CategoryItem>): Promise<{ message: string; category: CategoryItem }> => {
    const res = await apiClient.put<{ message: string; category: CategoryItem }>(`/categories/${id}`, data)
    return res.data
  },

  // 6. Admin đổi trạng thái (hiện / ẩn / ngừng hoạt động)
  updateCategoryStatus: async (id: string, status: 'active' | 'hidden' | 'inactive'): Promise<{ message: string; category: CategoryItem }> => {
    const res = await apiClient.put<{ message: string; category: CategoryItem }>(`/categories/${id}/status`, { status })
    return res.data
  },

  // 7. Admin xóa danh mục (được kiểm tra an toàn dữ liệu)
  deleteCategory: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/categories/${id}`)
    return res.data
  }
}
