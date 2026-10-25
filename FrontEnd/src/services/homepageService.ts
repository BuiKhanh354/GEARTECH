import apiClient from '../api/client'
import type { ProductItem } from './productService'
import type { ShopItem } from './shopService'

export interface HomepageBannerItem {
  _id?: string
  title: string
  badge: string
  subtitle: string
  description: string
  priceTag: string
  ctaText: string
  link: string
  imageUrl: string
  bgGradient: string
  status: 'active' | 'inactive'
  startDate?: string | null
  endDate?: string | null
}

export type SectionType =
  | 'category_products'
  | 'banner_slider'
  | 'flash_sale'
  | 'category_grid'
  | 'featured_shops'
  | 'featured_products'
  | 'service_features'

export interface SectionSchedule {
  isScheduled: boolean
  startDate: string | null
  endDate: string | null
}

export interface SectionConfig {
  categoryId?: string | null
  categorySlug?: string
  categoryName?: string
  includeChildren?: boolean
  limit?: number
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'sold_desc' | 'rating_desc'
  showOutOfStock?: boolean
  showViewAll?: boolean
  viewAllLink?: string
  banners?: HomepageBannerItem[]
  countdownEnd?: string | null
  tagline?: string
  manualProductIds?: string[]
}

export interface HomepageSection {
  _id?: string
  sectionKey: string
  title: string
  subtitle: string
  type: SectionType
  status: 'active' | 'inactive'
  order: number
  schedule: SectionSchedule
  config: SectionConfig
}

export interface PopulatedSection extends HomepageSection {
  _previewBadge?: 'active' | 'scheduled' | 'expired' | 'inactive'
  populatedData?: {
    products?: ProductItem[]
    totalCount?: number
    banners?: HomepageBannerItem[]
    categories?: any[]
    shops?: ShopItem[]
    countdownEnd?: string
    categoryInfo?: {
      _id: string
      name: string
      slug: string
    } | null
    error?: string
  }
}

export interface HomepageResponse {
  success: boolean
  state: 'published'
  version: number
  publishedAt: string | null
  sections: PopulatedSection[]
}

export interface AdminHomepageConfigResponse {
  success: boolean
  draft: {
    _id: string
    state: 'draft'
    version: number
    sections: HomepageSection[]
    updatedAt: string
  }
  published: {
    _id: string
    state: 'published'
    version: number
    publishedAt: string
    sections: HomepageSection[]
  } | null
  categories: {
    _id: string
    name: string
    slug: string
    parent_id: string | null
    description: string
  }[]
}

export const homepageService = {
  // Lấy dữ liệu trang chủ đã xuất bản cho khách hàng
  getPublicHomepage: async (): Promise<HomepageResponse> => {
    const res = await apiClient.get<HomepageResponse>('/homepage')
    return res.data
  },

  // Lấy toàn bộ cấu hình bản nháp & xuất bản cho Admin
  getAdminConfig: async (): Promise<AdminHomepageConfigResponse> => {
    const res = await apiClient.get<AdminHomepageConfigResponse>('/homepage/admin/config')
    return res.data
  },

  // Lưu bản nháp (không ảnh hưởng trang chủ khách hàng)
  saveDraft: async (sections: HomepageSection[]) => {
    const res = await apiClient.put<{ success: boolean; message: string; draft: any }>(
      '/homepage/admin/draft',
      { sections }
    )
    return res.data
  },

  // Xuất bản bản nháp lên trang chủ chính thức
  publish: async () => {
    const res = await apiClient.post<{ success: boolean; message: string; published: any }>(
      '/homepage/admin/publish'
    )
    return res.data
  },

  // Khôi phục bản nháp về cấu hình mặc định ban đầu
  restoreDefault: async () => {
    const res = await apiClient.post<{ success: boolean; message: string; draft: any }>(
      '/homepage/admin/restore-default'
    )
    return res.data
  },

  // Xem trước bản nháp với dữ liệu sản phẩm THẬT được populate
  getPreview: async (): Promise<{ success: boolean; state: string; sections: PopulatedSection[] }> => {
    const res = await apiClient.get<{ success: boolean; state: string; sections: PopulatedSection[] }>(
      '/homepage/admin/preview'
    )
    return res.data
  },

  // Tải lên ảnh banner quảng bá trang chủ
  uploadBanner: async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('banner', file)
    const res = await apiClient.post<{ message: string; url: string }>('/upload/homepage-banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data.url
  }
}
