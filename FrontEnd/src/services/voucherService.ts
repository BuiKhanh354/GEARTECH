import apiClient from '../api/client'

export interface VoucherItem {
  _id: string
  code: string
  name?: string
  description: string
  discountType?: 'fixed' | 'percentage'
  discountValue: number
  minOrderValue: number
  maxDiscount?: number
  startDate?: string
  expiryDate: string
  maxUses: number
  usesCount: number
  status?: 'active' | 'inactive' | 'expired'
  emoji?: string
  shopId?: string | { _id: string; shopName?: string; name?: string }
}

export interface ValidateVoucherResponse {
  message: string
  voucherId: string
  code: string
  discountType: 'fixed' | 'percentage'
  discountValue: number
  rawDiscountValue: number
  maxDiscount: number
  minOrderValue: number
  description: string
  shopId?: string | null
}

export const voucherService = {
  getVouchers: async (shopId?: string) => {
    const res = await apiClient.get<VoucherItem[]>('/vouchers', {
      params: shopId ? { shopId } : undefined
    })
    return res.data
  },

  getAdminVouchers: async () => {
    const res = await apiClient.get<VoucherItem[]>('/vouchers/admin')
    return res.data
  },

  getShopVouchers: async () => {
    const res = await apiClient.get<{ shop: any; vouchers: VoucherItem[] }>('/vouchers/shop/my-vouchers')
    return res.data
  },

  validateVoucher: async (code: string, orderValue?: number, items?: any[]) => {
    const res = await apiClient.post<ValidateVoucherResponse>('/vouchers/validate', { code, orderValue, items })
    return res.data
  },

  createVoucher: async (voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.post('/vouchers', voucherData)
    return res.data
  },

  createShopVoucher: async (voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.post('/vouchers/shop', voucherData)
    return res.data
  },

  updateVoucher: async (id: string, voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.put(`/vouchers/${id}`, voucherData)
    return res.data
  },

  updateShopVoucher: async (id: string, voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.put(`/vouchers/shop/${id}`, voucherData)
    return res.data
  },

  updateStatus: async (id: string, status: 'active' | 'inactive' | 'expired') => {
    const res = await apiClient.patch(`/vouchers/${id}/status`, { status })
    return res.data
  },

  updateShopVoucherStatus: async (id: string, status: 'active' | 'inactive') => {
    const res = await apiClient.patch(`/vouchers/shop/${id}/status`, { status })
    return res.data
  },

  deleteVoucher: async (id: string) => {
    const res = await apiClient.delete(`/vouchers/${id}`)
    return res.data
  },

  deleteShopVoucher: async (id: string) => {
    const res = await apiClient.delete(`/vouchers/shop/${id}`)
    return res.data
  }
}
