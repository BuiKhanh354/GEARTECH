import apiClient from '../api/client'

export interface UserItem {
  _id: string
  id?: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'user' | 'shop' | 'admin'
  status: 'active' | 'locked'
  lockedAt?: string
  lockExpiresAt?: string
  lockReason?: string
  memberRank?: string
  points?: number
  shopId?: {
    _id: string
    name: string
    logo: string
    category: string
  } | null
  createdAt?: string
  updatedAt?: string
}

export interface GetUsersParams {
  search?: string
  role?: string
  status?: string
  page?: number
  limit?: number
}

export interface GetUsersResponse {
  users: UserItem[]
  total: number
  page: number
  totalPages: number
}

export const userService = {
  // Lấy danh sách người dùng cho Admin (kèm tìm kiếm, lọc role, status, phân trang)
  getUsers: async (params?: GetUsersParams): Promise<GetUsersResponse> => {
    const res = await apiClient.get<GetUsersResponse>('/auth/users', { params })
    return res.data
  },

  // D2: Admin tạo tài khoản mới (khi người dùng không thể tự đăng ký)
  createUser: async (payload: { name: string; email: string; phone?: string; password: string; role?: string }): Promise<{ message: string; user: UserItem }> => {
    const res = await apiClient.post<{ message: string; user: UserItem }>('/auth/users', payload)
    return res.data
  },

  // Khóa hoặc mở khóa tài khoản người dùng (hỗ trợ khóa có thời hạn D1)
  updateUserStatus: async (
    userId: string, 
    status: 'active' | 'locked',
    lockOptions?: { lockDurationHours?: number; lockExpiresAt?: string; lockReason?: string }
  ): Promise<{ message: string; user: UserItem }> => {
    const res = await apiClient.put<{ message: string; user: UserItem }>(`/auth/users/${userId}/status`, { 
      status,
      ...lockOptions
    })
    return res.data
  },

  // Lấy thông tin tài khoản hiện tại
  getProfile: async () => {
    const res = await apiClient.get('/auth/profile')
    return res.data
  },

  // Cập nhật thông tin tài khoản
  updateProfile: async (data: { name?: string; phone?: string; address?: string; gender?: string; birthday?: string }) => {
    const res = await apiClient.put('/auth/profile', data)
    return res.data
  },

  // Đăng xuất
  logout: async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // bỏ qua lỗi nếu token đã hết hạn
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}
