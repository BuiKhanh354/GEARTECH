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
}

export const voucherService = {
  getVouchers: async () => {
    const res = await apiClient.get<VoucherItem[]>('/vouchers')
    return res.data
  },

  getAdminVouchers: async () => {
    const res = await apiClient.get<VoucherItem[]>('/vouchers/admin')
    return res.data
  },

  validateVoucher: async (code: string, orderValue?: number) => {
    const res = await apiClient.post<ValidateVoucherResponse>('/vouchers/validate', { code, orderValue })
    return res.data
  },

  createVoucher: async (voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.post('/vouchers', voucherData)
    return res.data
  },

  updateVoucher: async (id: string, voucherData: Partial<VoucherItem>) => {
    const res = await apiClient.put(`/vouchers/${id}`, voucherData)
    return res.data
  },

  updateStatus: async (id: string, status: 'active' | 'inactive' | 'expired') => {
    const res = await apiClient.patch(`/vouchers/${id}/status`, { status })
    return res.data
  },

  deleteVoucher: async (id: string) => {
    const res = await apiClient.delete(`/vouchers/${id}`)
    return res.data
  }
}
