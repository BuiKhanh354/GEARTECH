import { api, toAppError } from './client'
import { useAuthStore } from '../store/authStore'
import type { AuthResponse, User } from '../types/api'

export const authService = {
  // POST /api/auth/login — API hiện có của website, tái sử dụng nguyên bản
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password })
      await useAuthStore.getState().setSession(res.data.token, res.data.user)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // POST /api/auth/register
  async register(payload: { name: string; email: string; password: string; phone?: string }): Promise<{ message: string }> {
    try {
      const res = await api.post<{ message: string }>('/auth/register', payload)
      return res.data
    } catch (err) {
      throw toAppError(err)
    }
  },

  // POST /api/auth/logout
  async logout(): Promise<void> {
    try {
      const token = useAuthStore.getState().token
      if (token) await api.post('/auth/logout')
    } catch {
      // Đăng xuất phía client luôn thực hiện kể cả API lỗi
    } finally {
      await useAuthStore.getState().clearSession()
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
