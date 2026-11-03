import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Tự động gắn Token xác thực vào Header từ useAuthStore hoặc localStorage
apiClient.interceptors.request.use(
  (config) => {
    const storeToken = useAuthStore.getState().token;
    const token = storeToken || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Chuẩn hóa lỗi và tự động xử lý khi Token hết hạn (401)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ error?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      // Khi nhận mã 401: Xóa phiên xác thực trong Store
      const currentToken = useAuthStore.getState().token;
      if (currentToken) {
        useAuthStore.getState().logout();
        
        // Nếu đang ở các trang cần quyền đăng nhập thì chuyển hướng về login
        if (typeof window !== 'undefined') {
          const path = window.location.pathname;
          if (path.startsWith('/shop') || path.startsWith('/admin') || path.startsWith('/profile') || path.startsWith('/checkout')) {
            window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper trích xuất thông báo lỗi chuẩn từ Backend
export function getApiErrorMessage(error: unknown, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.response?.data?.message || error.message || fallbackMessage;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}

export default apiClient;
