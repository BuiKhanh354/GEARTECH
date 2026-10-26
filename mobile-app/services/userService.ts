import { api, toAppError } from './client'
import type { User } from '../types/api'

export const userService = {
  // PUT /api/customers/me — cập nhật hồ sơ (đồng bộ User phía backend)
  async updateProfile(payload: { name?: string; phone?: string }): Promise<{ customer: unknown }> {
    try {
      const res = await api.put('/customers/me', payload)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // GET /api/auth/profile
  async getProfile(): Promise<User> {
    try {
      const res = await api.get<{ user: User }>('/auth/profile')
      return res.data.user
    } catch (err) {
      throw toAppError(err)
    }
  }
}
