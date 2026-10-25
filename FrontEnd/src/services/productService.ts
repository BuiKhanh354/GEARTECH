import apiClient from '../api/client'

export interface ProductQuery {
  search?: string
  category?: string
  brand?: string
  shopId?: string
  status?: string
  includeInactive?: boolean
  minPrice?: string | number
  maxPrice?: string | number
  rating?: string | number
  sortBy?: string
  page?: number
  limit?: number
}

export interface ProductItem {
  _id: string
  id?: string
  title: string
  name?: string
  slug?: string
  sku?: string
  description: string
  price: number
  oldPrice?: number
  discount?: string
  imageEmoji: string
  gallery: string[]
  category: string
  categoryId?: any
  categoryName: string
  brand?: string
  brandId?: any
  rating: number
  reviewsCount: number
  salesCount: string
  soldCount?: number
  stock: number
  status: 'active' | 'hidden' | 'out_of_stock' | 'inactive'
  shopId: any
  specs?: Record<string, string>
  createdAt?: string
  updatedAt?: string
}

export const productService = {
  // 1. Khách hàng xem danh sách, lọc và tìm kiếm sản phẩm công khai
  getProducts: async (params?: ProductQuery): Promise<{ products: ProductItem[]; total: number; currentPage: number; totalPages: number }> => {
    const res = await apiClient.get('/products', { params })
    return res.data
  },

  // 2. Chủ shop lấy danh sách sản phẩm thuộc gian hàng mình
  getMyProducts: async (params?: { search?: string; status?: string; category?: string; brand?: string; page?: number; limit?: number }): Promise<{ products: ProductItem[]; total: number; currentPage: number; totalPages: number }> => {
    const res = await apiClient.get('/products/shop/my-products', { params })
    return res.data
  },

  // 3. Xem chi tiết sản phẩm theo ID hoặc Slug
  getProductById: async (id: string): Promise<ProductItem> => {
    const res = await apiClient.get<ProductItem>(`/products/${id}`)
    return res.data
  },

  // 4. Chủ shop đăng bán sản phẩm mới
  createProduct: async (productData: Partial<ProductItem>): Promise<{ message: string; product: ProductItem }> => {
    const res = await apiClient.post<{ message: string; product: ProductItem }>('/products', productData)
    return res.data
  },

  // 5. Chủ shop cập nhật sản phẩm thuộc shop mình
  updateProduct: async (id: string, productData: Partial<ProductItem>): Promise<{ message: string; product: ProductItem }> => {
    const res = await apiClient.put<{ message: string; product: ProductItem }>(`/products/${id}`, productData)
    return res.data
  },

  // 6. Chủ shop đổi nhanh trạng thái bán (ẩn / hiện / hết hàng)
  updateProductStatus: async (id: string, status: 'active' | 'hidden' | 'out_of_stock' | 'inactive'): Promise<{ message: string; product: ProductItem }> => {
    const res = await apiClient.put<{ message: string; product: ProductItem }>(`/products/${id}/status`, { status })
    return res.data
  },

  // 7. Chủ shop hoặc Admin xóa sản phẩm (bảo vệ toàn vẹn lịch sử đơn hàng)
  deleteProduct: async (id: string): Promise<{ message: string; isSoftDeleted?: boolean }> => {
    const res = await apiClient.delete<{ message: string; isSoftDeleted?: boolean }>(`/products/${id}`)
    return res.data
  }
}
