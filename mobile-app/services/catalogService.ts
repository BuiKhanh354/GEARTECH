import { api, toAppError } from './client'
import type { Category, Brand, Product, ProductsResponse, Shop, ShopDetailResponse } from '../types/api'

export interface ProductQuery {
  search?: string
  category?: string
  brand?: string
  minPrice?: string
  maxPrice?: string
  rating?: string
  sortBy?: 'popular' | 'priceAsc' | 'priceDesc' | 'newest' | 'reviews'
  page?: number
  limit?: number
}

export const catalogService = {
  // GET /api/products — tìm kiếm + lọc + phân trang (API công khai của website)
  async getProducts(query: ProductQuery = {}): Promise<ProductsResponse> {
    try {
      const res = await api.get<ProductsResponse>('/products', { params: query })
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/products/:idOrSlug
  async getProductById(id: string): Promise<Product> {
    try {
      const res = await api.get<Product>(`/products/${id}`)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/categories
  async getCategories(): Promise<Category[]> {
    try {
      const res = await api.get<Category[]>('/categories')
      return Array.isArray(res.data) ? res.data : []
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/brands
  async getBrands(): Promise<Brand[]> {
    try {
      const res = await api.get<Brand[]>('/brands')
      return Array.isArray(res.data) ? res.data : []
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/shops — danh sách shop đang hoạt động
  async getShops(): Promise<Shop[]> {
    try {
      const res = await api.get<Shop[]>('/shops')
      return Array.isArray(res.data) ? res.data : []
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/shops/:id — chi tiết shop + sản phẩm công khai
  async getShopById(id: string): Promise<ShopDetailResponse> {
    try {
      const res = await api.get<ShopDetailResponse>(`/shops/${id}`)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  }
}
