import axios, { AxiosError } from 'axios'
import { Platform } from 'react-native'
import Constants from 'expo-constants'
import { useAuthStore } from '../store/authStore'

/**
 * Tự động phát hiện IP của máy tính đang chạy Expo ở BẤT KỲ mạng nào:
 * Khi bạn đổi sang Wi-Fi khác (quán cafe, trường học, hotspot...), Expo Metro Bundler
 * tự động cấp hostUri = "<IP-máy-tính-ở-mạng-đó>:8081".
 * Ta tách lấy IP này và ghép với cổng backend 5000: http://<IP>:5000/api
 */
export const getAutoDetectedHost = (): string | null => {
  try {
    // 1. expoConfig.hostUri (Expo SDK 49+)
    const hostUri = Constants.expoConfig?.hostUri
    if (hostUri) {
      const host = hostUri.split(':')[0]
      if (host && host !== 'localhost' && host !== '127.0.0.1') return host
    }

    // 2. expoGoConfig (Expo Go)
    const expoGoHost = (Constants as any).expoGoConfig?.debuggerHost
    if (expoGoHost) {
      const host = expoGoHost.split(':')[0]
      if (host && host !== 'localhost' && host !== '127.0.0.1') return host
    }

    // 3. manifest (Legacy debuggerHost)
    const debuggerHost = (Constants as any).manifest?.debuggerHost
    if (debuggerHost) {
      const host = debuggerHost.split(':')[0]
      if (host && host !== 'localhost' && host !== '127.0.0.1') return host
    }

    // 4. linkingUri (e.g. exp://192.168.x.x:8081)
    const linkingUri = Constants.linkingUri
    if (linkingUri) {
      const match = linkingUri.match(/exp:\/\/([^:/]+)/)
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1]
      }
    }
  } catch (err) {
    console.warn('[Auto-IP] Lỗi phát hiện IP:', err)
  }
  return null
}

// Biến lưu URL do người dùng tự đổi trực tiếp trên app (nếu có)
let inAppCustomApiUrl: string | null = null

export const setInAppApiUrl = (url: string | null) => {
  inAppCustomApiUrl = url ? url.trim() : null
  const newBase = getApiBaseUrl()
  api.defaults.baseURL = newBase
  console.log('[GearTech Mobile] Đã chuyển địa chỉ API sang:', newBase)
}

export const getApiBaseUrl = (): string => {
  // 1. Nếu người dùng đổi thủ công trong app
  if (inAppCustomApiUrl) {
    return inAppCustomApiUrl
  }

  // 2. Nếu chạy trên nền Web: tự động dùng hostname hiện tại
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const host = window.location.hostname
    return `http://${host}:5000/api`
  }

  // 3. Nếu cấu hình biến môi trường cố định (không phải 'auto')
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim()
  if (envUrl && envUrl !== 'auto' && !envUrl.startsWith('#')) {
    return envUrl
  }

  // 4. Tự động nhận diện IP từ máy chủ Expo đang kết nối (hoạt động ở mọi mạng)
  const autoHost = getAutoDetectedHost()
  if (autoHost) {
    return `http://${autoHost}:5000/api`
  }

  // 5. Mặc định khi cắm cáp USB (adb reverse) hoặc chạy máy ảo
  return 'http://localhost:5000/api'
}

export const API_BASE_URL = getApiBaseUrl()

console.log('[GearTech Mobile] Đang kết nối API Backend tại:', API_BASE_URL)

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Cập nhật baseURL linh hoạt trước mỗi request
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
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
          : `Không thể kết nối máy chủ (${API_BASE_URL}). Hãy đảm bảo Backend đang chạy (port 5000) và cùng mạng Wi-Fi.`,
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
