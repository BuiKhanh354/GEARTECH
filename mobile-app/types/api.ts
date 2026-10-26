// Kiểu dữ liệu khớp với response thật của backend GearTech (Backend/routes/*)

export interface User {
  id?: string
  _id?: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'shop' | 'admin'
  memberRank?: string
  points?: number
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

export interface ShopBrief {
  _id: string
  name?: string
  logo?: string
  status?: string
  address?: string
  rating?: number
}

export interface Product {
  _id: string
  title: string
  name?: string
  slug?: string
  sku?: string
  description: string
  price: number
  oldPrice?: number
  discount?: string
  imageEmoji: string
  gallery?: string[]
  category: string
  categoryName?: string
  brand?: string
  rating: number
  reviewsCount: number
  salesCount?: string
  soldCount?: number
  stock: number
  status: 'active' | 'hidden' | 'out_of_stock' | 'inactive'
  shopId?: ShopBrief | string
}

export interface ProductsResponse {
  products: Product[]
  total: number
  currentPage: number
  totalPages: number
}

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  icon?: string
  status: 'active' | 'hidden' | 'inactive'
  parent_id?: { _id: string; name: string; slug: string } | null
  children?: Category[]
}

export interface Brand {
  _id: string
  name: string
  slug: string
  logo?: string
  description?: string
}

export interface Shop {
  _id: string
  name?: string
  shop_name?: string
  description?: string
  logo?: string
  category?: string
  phone?: string
  email?: string
  address?: string
  rating?: number
  followers?: string
  followersCount?: number
  total_products?: number
  status?: string
}

export interface ShopDetailResponse {
  shop: Shop
  products: Product[]
  productsCount: number
}

export interface CartItem {
  _id: string
  productId: string
  title: string
  slug?: string
  sku?: string
  imageEmoji: string
  currentPrice: number
  price: number
  oldPrice?: number
  savings?: number
  isPriceLocked?: boolean
  promotionNote?: string | null
  stock: number
  quantity: number
  selected: boolean
  variant?: string
  shop: { id?: string; name?: string }
  lineTotal: number
  isAvailable: boolean
  isExceedingStock?: boolean
  unavailableReason?: string
}

export interface CartResponse {
  cartId: string
  items: CartItem[]
  subtotal: number
  totalCount: number
  hasUnavailableItems: boolean
}

export interface OrderItem {
  productId?: { _id: string; title?: string } | string
  product_id?: { _id: string; title?: string } | string
  product_name?: string
  title?: string
  sku?: string
  quantity?: number
  qty?: number
  unit_price?: number
  price?: number
  subtotal?: number
}

export interface Order {
  _id: string
  created_at?: string
  createdAt?: string
  orderStatus?: string
  order_status?: string
  paymentStatus?: string
  payment_status?: string
  paymentMethod?: string
  payment_method?: string
  totalAmount?: number
  finalAmount?: number
  final_amount?: { toString(): string } | number
  shipping_address?: string
  shippingAddress?: { receiverName?: string; receiverPhone?: string; detailAddress?: string }
  items?: OrderItem[]
  detailedItems?: OrderItem[]
  shop?: ShopBrief
  shop_id?: ShopBrief | string
  shopId?: ShopBrief | string
  note?: string
}

export interface CheckoutInfo {
  customerId: string
  name: string
  email: string
  phone: string
  shippingAddress: {
    receiverName: string
    receiverPhone: string
    detailAddress: string
    province: string
    district: string
    ward: string
  }
}
