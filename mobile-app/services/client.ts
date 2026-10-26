import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../store/authStore'

// Địa chỉ backend lấy từ biến môi trường EXPO_PUBLIC_API_URL (.env của app).
// KHÔNG dùng localhost khi chạy trên máy thật — xem .env.example
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api'

console.log('[GearTech Mobile] Đang kết nối API Backend tại:', API_BASE_URL)

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Gắn token cho mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Chuẩn hóa lỗi để UI phân loại: mạng / xác thực / phân quyền / validation / khác
export type AppErrorKind = 'network' | 'auth' | 'forbidden' | 'validation' | 'notFound' | 'server' | 'unknown'

export class AppError extends Error {
  kind: AppErrorKind
  status?: number

  constructor(kind: AppErrorKind, message: string, status?: number) {
    super(message)
    this.kind = kind
    this.status = status
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err

  const axiosErr = err as AxiosError<{ error?: string; message?: string }>
  if (axiosErr?.isAxiosError) {
    if (!axiosErr.response) {
      console.error('[API Network Error]', axiosErr.message, axiosErr.code, 'Base:', API_BASE_URL)
      // Timeout hoặc không kết nối được máy chủ
      return new AppError(
        'network',
        axiosErr.code === 'ECONNABORTED'
          ? 'Kết nối quá chậm. Vui lòng thử lại.'
          : `Không thể kết nối máy chủ (${axiosErr.message || 'Lỗi mạng'}). Đích: ${API_BASE_URL}`,
        undefined
      )
    }
    const status = axiosErr.response.status
    const msg = axiosErr.response.data?.error || axiosErr.response.data?.message || 'Có lỗi xảy ra.'
    if (status === 401) return new AppError('auth', msg, status)
    if (status === 403) return new AppError('forbidden', msg, status)
    if (status === 404) return new AppError('notFound', msg, status)
    if (status === 400 || status === 422) return new AppError('validation', msg, status)
    return new AppError('server', msg, status)
  }

  return new AppError('unknown', 'Đã xảy ra lỗi không xác định.')
}

// 401 => phiên hết hạn / token không hợp lệ: xóa phiên để người dùng đăng nhập lại
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const axiosErr = error as AxiosError
    if (axiosErr?.response?.status === 401) {
      const { token, clearSession } = useAuthStore.getState()
      if (token) {
        await clearSession()
      }
    }
    return Promise.reject(error)
  }
)
