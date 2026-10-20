import apiClient from '../api/client'

export interface SupplierPayload {
  name: string
  contactName?: string
  contact_name?: string
  phone: string
  email: string
  address?: string
  status?: 'active' | 'inactive'
  shopId?: string
}

export const supplierService = {
  // Lấy danh sách nhà cung cấp
  getSuppliers: async (params?: { shopId?: string; status?: string; search?: string }) => {
    const res = await apiClient.get('/suppliers', { params })
    return res.data
  },

  // Chi tiết 1 nhà cung cấp
  getSupplierById: async (id: string) => {
    const res = await apiClient.get(`/suppliers/${id}`)
    return res.data
  },

  // Thêm mới nhà cung cấp
  createSupplier: async (payload: SupplierPayload) => {
    const res = await apiClient.post('/suppliers', payload)
    return res.data
  },

  // Cập nhật nhà cung cấp
  updateSupplier: async (id: string, payload: Partial<SupplierPayload>) => {
    const res = await apiClient.put(`/suppliers/${id}`, payload)
    return res.data
  },

  // Xóa nhà cung cấp
  deleteSupplier: async (id: string) => {
    const res = await apiClient.delete(`/suppliers/${id}`)
    return res.data
  }
}
