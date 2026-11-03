export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'paid' | 'failed' | 'Pending' | 'Paid' | 'Failed'
export type PaymentMethod = 'COD' | 'MOMO' | 'VNPAY' | 'BANK_TRANSFER' | 'cod' | 'bank_transfer' | 'credit_card' | 'momo' | 'vnpay'

export interface OrderItemPayload {
  productId: string
  product_id?: string
  title?: string
  product_name?: string
  qty?: number
  quantity?: number
  price?: number
  unit_price?: number
  sku?: string
}

export interface ShippingAddressInfo {
  receiverName: string
  receiverPhone: string
  detailAddress: string
  ward?: string
  district?: string
  province?: string
}

export interface CreateOrderPayload {
  items: OrderItemPayload[]
  shippingAddress: ShippingAddressInfo | string
  paymentMethod: PaymentMethod
  shippingMethod?: string
  shippingMethodName?: string
  shippingFee?: number
  carrier?: string
  voucherCode?: string
  note?: string
}

export interface OrderItem {
  _id?: string
  productId?: string
  product_id?: string
  title?: string
  product_name?: string
  quantity: number
  qty?: number
  price: number
  unit_price?: number
  subtotal?: number
  image?: string
  imageUrl?: string
  sku?: string
}

export interface Order {
  _id: string
  id?: string
  userId?: string
  user_id?: string
  customerId?: string
  customer_id?: string
  shopId?: string | { _id: string; name?: string; shopName?: string }
  shop_id?: string | { _id: string; name?: string; shopName?: string }
  items: OrderItem[]
  totalAmount: number
  total_amount?: number | { toString: () => string }
  discountAmount?: number
  discount_amount?: number | { toString: () => string }
  shippingFee?: number
  shipping_fee?: number | { toString: () => string }
  shippingMethod?: string
  shipping_method?: string
  shippingMethodName?: string
  shipping_method_name?: string
  finalAmount: number
  final_amount?: number | { toString: () => string }
  shippingAddress?: ShippingAddressInfo | string
  shipping_address?: string
  phone?: string
  receiver_name?: string
  paymentMethod: PaymentMethod
  payment_method?: string
  paymentStatus: PaymentStatus
  payment_status?: string
  orderStatus: OrderStatus
  order_status?: string
  trackingCode?: string
  tracking_code?: string
  carrier?: string
  note?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

