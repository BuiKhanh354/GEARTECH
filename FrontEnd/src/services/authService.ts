import apiClient from '../api/client';
import type { AuthResponse, AuthUser } from '../types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export const authService = {
  // 1. Đăng nhập
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', payload);
    return res.data;
  },

  // 2. Đăng ký tài khoản
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', payload);
    return res.data;
  },

  // 3. Lấy thông tin tài khoản hiện tại
  getProfile: async (): Promise<{ user: AuthUser }> => {
    const res = await apiClient.get<{ user: AuthUser }>('/auth/me');
    return res.data;
  },

  // 4. Cập nhật hồ sơ cá nhân
  updateProfile: async (data: Partial<AuthUser>): Promise<{ message: string; user: AuthUser }> => {
    const res = await apiClient.put<{ message: string; user: AuthUser }>('/auth/profile', data);
    return res.data;
  }
};

export default authService;

