export interface ProductSpecification {
  name: string
  value: string
}

export interface CategorySpecAttribute {
  name: string
  key: string
  placeholder?: string
  isRequired?: boolean
  order?: number
}

export interface CategorySpecTemplate {
  categorySlug: string
  categoryName?: string
  attributes: CategorySpecAttribute[]
}

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
  sale?: boolean | string
  page?: number
  limit?: number
}

export interface ProductShopRef {
  _id?: string
  id?: string
  name?: string
  shopName?: string
  avatar?: string
  logo?: string
  logoUrl?: string
  rating?: number
  productsCount?: number
  status?: string
}

export interface ProductCategoryRef {
  _id: string
  name: string
  slug?: string
}

export interface ProductBrandRef {
  _id: string
  name: string
  slug?: string
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
  originalPrice?: number
  discount?: string
  image?: string
  imageUrl?: string
  imageEmoji?: string
  gallery?: string[]
  category: string
  categoryId?: string | ProductCategoryRef
  categoryName: string
  brand?: string
  brandId?: string | ProductBrandRef
  rating: number
  reviewsCount: number
  isFeatured?: boolean
  salesCount: string
  soldCount?: number
  stock: number
  status: 'active' | 'hidden' | 'out_of_stock' | 'inactive'
  shopId?: string | ProductShopRef
  shop?: string | ProductShopRef
  specs?: Record<string, string>
  specifications?: ProductSpecification[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductListResponse {
  products: ProductItem[]
  total: number
  currentPage: number
  totalPages: number
}
