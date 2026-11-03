import { create } from 'zustand';
import type { AuthUser } from '../types/auth';

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isShop: boolean;
  setSession: (token: string, user: AuthUser) => void;
  updateUser: (partialUser: Partial<AuthUser>) => void;
  logout: () => void;
}

const getInitialAuth = () => {
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user: AuthUser | null = userStr ? JSON.parse(userStr) : null;
    return {
      token: token || null,
      user: user || null,
      isAuthenticated: Boolean(token && user),
      isAdmin: user?.role === 'admin',
      isShop: user?.role === 'shop'
    };
  } catch {
    return {
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isShop: false
    };
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  ...getInitialAuth(),

  setSession: (token: string, user: AuthUser) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.error('Không thể lưu token vào localStorage:', e);
    }
    set({
      token,
      user,
      isAuthenticated: true,
      isAdmin: user.role === 'admin',
      isShop: user.role === 'shop'
    });
  },

  updateUser: (partialUser: Partial<AuthUser>) => {
    set((state) => {
      if (!state.user) return state;
      const updated = { ...state.user, ...partialUser };
      try {
        localStorage.setItem('user', JSON.stringify(updated));
      } catch (e) {
        console.error('Không thể cập nhật user trong localStorage:', e);
      }
      return {
        user: updated,
        isAdmin: updated.role === 'admin',
        isShop: updated.role === 'shop'
      };
    });
  },

  logout: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    } catch (e) {
      console.error('Không thể xóa token khỏi localStorage:', e);
    }
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isShop: false
    });
  }
}));

export default useAuthStore;

