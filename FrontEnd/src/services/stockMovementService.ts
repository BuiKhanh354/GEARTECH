import apiClient from '../api/client'

export interface CreateMovementPayload {
  productId: string
  type: 'import' | 'export' | 'adjustment'
  quantity?: number
  unitCost?: number
  supplierId?: string
  reference?: string
  note?: string
  actualStock?: number
}

export const stockMovementService = {
  // Lấy danh sách lịch sử biến động kho
  getStockMovements: async (params?: {
    shopId?: string
    productId?: string
    type?: string
    supplierId?: string
  }) => {
    const res = await apiClient.get('/stock-movements', { params })
    return res.data
  },

  // Tạo biến động kho mới (nhập, xuất hủy, điều chỉnh kiểm kê)
  createStockMovement: async (payload: CreateMovementPayload) => {
    const res = await apiClient.post('/stock-movements', payload)
    return res.data
  },

  // Lấy báo cáo tổng quan kho
  getStockSummary: async () => {
    const res = await apiClient.get('/stock-movements/summary')
    return res.data
  }
}
