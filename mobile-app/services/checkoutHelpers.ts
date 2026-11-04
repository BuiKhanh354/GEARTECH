import type { CartResponse } from '../types/api'
import type { CreateOrderPayload } from './orderService'

export interface CheckoutFormValues {
  receiverName: string
  receiverPhone: string
  detailAddress: string
  province: string
  paymentMethod: CreateOrderPayload['paymentMethod']
  note: string
}

export function getSelectedCheckoutItems(cart?: CartResponse) {
  return (cart?.items ?? []).filter((item) => item.isAvailable && item.selected)
}

export function buildCheckoutOrderPayload(
  cart: CartResponse | undefined,
  form: CheckoutFormValues
): CreateOrderPayload {
  return {
    items: getSelectedCheckoutItems(cart).map((item) => ({
      productId: item.productId,
      quantity: item.quantity
    })),
    shippingAddress: {
      receiverName: form.receiverName.trim(),
      receiverPhone: form.receiverPhone.trim(),
      detailAddress: form.detailAddress.trim(),
      province: form.province.trim()
    },
    paymentMethod: form.paymentMethod,
    note: form.note.trim() || undefined
  }
}
