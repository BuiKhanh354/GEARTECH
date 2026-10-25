import apiClient from '../api/client'

export interface StorefrontSection {
  id: string
  title: string
  enabled: boolean
  order: number
}

export interface StorefrontConfig {
  template: 'modern-tech' | 'minimal' | 'gaming'
  primaryColor: string
  secondaryColor: string
  textColor?: string
  bannerUrl: string
  logoUrl?: string
  introText: string
  viewMode: 'grid' | 'list'
  columns: 3 | 4
  sections: StorefrontSection[]
}

export interface StorefrontShopInfo {
  _id: string
  id?: string
  name: string
  logo?: string
  description?: string
  category?: string
  phone?: string
  email?: string
  address?: string
  rating?: number
  followers?: string | number
  total_products?: number
}

export interface MyStorefrontResponse {
  shop: StorefrontShopInfo
  storefrontDraft: StorefrontConfig
  storefrontPublished: StorefrontConfig
  publishedAt?: string
}

export interface PublicStorefrontResponse {
  shop: StorefrontShopInfo
  storefront: StorefrontConfig
  featuredProducts?: any[]
  allProducts?: any[]
  products?: any[]
  sectionsData?: {
    featured?: any[]
    newest?: any[]
    bestsellers?: any[]
    catalog?: any[]
  }
  totalProducts?: number
  categories?: string[]
}

export const storefrontService = {
  // 1. Chủ shop lấy cấu hình giao diện nháp & bản xuất bản
  getMyStorefront: async (): Promise<MyStorefrontResponse> => {
    const res = await apiClient.get<MyStorefrontResponse>('/shops/me/storefront')
    return res.data
  },

  // 2. Chủ shop lưu bản nháp giao diện
  saveDraft: async (data: Partial<StorefrontConfig>): Promise<{ message: string; storefrontDraft: StorefrontConfig }> => {
    const res = await apiClient.put<{ message: string; storefrontDraft: StorefrontConfig }>('/shops/me/storefront', data)
    return res.data
  },

  // 3. Chủ shop xuất bản giao diện từ bản nháp
  publish: async (): Promise<{ message: string; storefrontPublished: StorefrontConfig; publishedAt: string }> => {
    const res = await apiClient.post<{ message: string; storefrontPublished: StorefrontConfig; publishedAt: string }>('/shops/me/storefront/publish')
    return res.data
  },

  // 4. Chủ shop khôi phục giao diện mặc định
  reset: async (): Promise<{ message: string; storefrontDraft: StorefrontConfig }> => {
    const res = await apiClient.post<{ message: string; storefrontDraft: StorefrontConfig }>('/shops/me/storefront/reset')
    return res.data
  },

  // 4b. C1: Chủ shop hủy thay đổi (khôi phục từ bản đã xuất bản gần nhất)
  discardDraft: async (): Promise<{ message: string; storefrontDraft: StorefrontConfig }> => {
    const res = await apiClient.post<{ message: string; storefrontDraft: StorefrontConfig }>('/shops/me/storefront/discard')
    return res.data
  },

  // 5. Upload ảnh giao diện cửa hàng (banner / logo) - trả về URL tĩnh lưu trữ tại backend
  uploadShopImage: async (file: File): Promise<{ message: string; url: string }> => {
    const formData = new FormData()
    formData.append('image', file)
    const res = await apiClient.post<{ message: string; url: string }>('/upload/shop-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  // 6. Khách hàng xem giao diện công khai của gian hàng
  getPublicStorefront: async (shopId: string): Promise<PublicStorefrontResponse> => {
    const res = await apiClient.get<PublicStorefrontResponse>(`/shops/${shopId}/storefront`)
    return res.data
  }
}
