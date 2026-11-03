import apiClient from '../api/client'

export interface ShopWallet {
  pendingBalance: number
  availableBalance: number
  lockedBalance: number
  withdrawnBalance: number
  totalRevenue: number
  totalPlatformFee: number
  totalRefunded: number
  payoutAccount: {
    bankName: string
    bankCode?: string
    accountNumber: string
    accountHolder: string
    isVerified: boolean
  }
}

export interface FinancialStats {
  revenueToday: number
  revenueMonth: number
  currentFeeRate: number
}

export interface FinancialTransactionItem {
  _id: string
  transactionCode: string
  shopId: any
  orderId?: any
  type: string
  amount: number
  balanceBefore: number
  balanceAfter: number
  orderAmount: number
  shippingFee: number
  platformFeeRate: number
  platformFeeAmount: number
  netAmount: number
  status: string
  description: string
  metadata?: any
  createdAt: string
}

export interface WithdrawalRequestItem {
  _id: string
  requestCode: string
  shopId: any
  requestedBy: any
  amount: number
  bankInfo: {
    bankName: string
    bankCode?: string
    accountNumber: string
    accountHolder: string
  }
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID_OUT'
  rejectReason?: string
  processedBy?: any
  processedAt?: string
  payoutProofUrl?: string
  payoutReference?: string
  note?: string
  createdAt: string
}

export interface AdminFinanceOverview {
  metrics: {
    totalRevenue: number
    totalPlatformFee: number
    totalPendingBalance: number
    totalAvailableBalance: number
    totalLockedBalance: number
    totalWithdrawnBalance: number
    totalRefunded: number
    totalShopsWithWallet: number
    pendingWithdrawalsCount: number
    currentFeeRate: number
  }
  shopWallets: any[]
}

export interface PlatformFeeConfigData {
  _id?: string
  name: string
  defaultRate: number
  categoryOverrides?: any[]
  effectiveFrom: string
  isActive: boolean
  notes?: string
}

export const financeService = {
  // Shop Owner
  getShopOverview: async (): Promise<{ shopId: string; wallet: ShopWallet; stats: FinancialStats }> => {
    const res = await apiClient.get('/finance/shop/overview')
    return res.data
  },

  getShopTransactions: async (params?: { type?: string; search?: string; page?: number; limit?: number }): Promise<{ transactions: FinancialTransactionItem[]; total: number; currentPage: number; totalPages: number }> => {
    const res = await apiClient.get('/finance/shop/transactions', { params })
    return res.data
  },

  getShopWithdrawals: async (): Promise<WithdrawalRequestItem[]> => {
    const res = await apiClient.get('/finance/shop/withdrawals')
    return res.data
  },

  requestWithdrawal: async (data: { amount: number; bankName: string; accountNumber: string; accountHolder: string; bankCode?: string }): Promise<{ message: string; withdrawal: WithdrawalRequestItem }> => {
    const res = await apiClient.post('/finance/shop/withdraw', data)
    return res.data
  },

  updatePayoutAccount: async (data: { bankName: string; accountNumber: string; accountHolder: string; bankCode?: string }): Promise<{ message: string; payoutAccount: any }> => {
    const res = await apiClient.put('/finance/shop/payout-account', data)
    return res.data
  },

  // Admin
  getAdminOverview: async (): Promise<AdminFinanceOverview> => {
    const res = await apiClient.get('/finance/admin/overview')
    return res.data
  },

  getAdminWithdrawals: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ withdrawals: WithdrawalRequestItem[]; total: number; currentPage: number; totalPages: number }> => {
    const res = await apiClient.get('/finance/admin/withdrawals', { params })
    return res.data
  },

  rejectWithdrawal: async (id: string, reason: string): Promise<{ message: string; withdrawal: WithdrawalRequestItem }> => {
    const res = await apiClient.put(`/finance/admin/withdrawals/${id}/reject`, { reason })
    return res.data
  },

  payoutWithdrawal: async (id: string, data?: { payoutReference?: string; payoutProofUrl?: string }): Promise<{ message: string; withdrawal: WithdrawalRequestItem }> => {
    const res = await apiClient.put(`/finance/admin/withdrawals/${id}/payout`, data)
    return res.data
  },

  getAdminFeeConfig: async (): Promise<PlatformFeeConfigData> => {
    const res = await apiClient.get('/finance/admin/fee-config')
    return res.data
  },

  updateAdminFeeConfig: async (data: { defaultRate: number; name?: string; notes?: string }): Promise<{ message: string; config: PlatformFeeConfigData }> => {
    const res = await apiClient.put('/finance/admin/fee-config', data)
    return res.data
  },

  getAdminTransactions: async (params?: { shopId?: string; type?: string; search?: string; page?: number; limit?: number }): Promise<{ transactions: FinancialTransactionItem[]; total: number; currentPage: number; totalPages: number }> => {
    const res = await apiClient.get('/finance/admin/transactions', { params })
    return res.data
  }
}

