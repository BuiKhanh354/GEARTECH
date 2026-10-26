import { create } from 'zustand'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'
import type { User } from '../types/api'

// Token lưu trong SecureStore (Keychain/Keystore) trên iOS/Android.
// Trên web preview (không phải mục tiêu chính), SecureStore có thể không hoạt động
// nên fallback về localStorage — native vẫn ưu tiên SecureStore tuyệt đối.
const TOKEN_KEY = 'geartech_token'
const USER_KEY = 'geartech_user'

const isWeb = Platform.OS === 'web'

async function safeSet(key: string, value: string): Promise<void> {
  if (!isWeb) {
    await SecureStore.setItemAsync(key, value)
    return
  }
  try {
    // Guard chống treo: SecureStore web có thể không resolve trong vài môi trường
    await Promise.race([
      SecureStore.setItemAsync(key, value),
      new Promise((_, reject) => setTimeout(() => reject(new Error('secure-store-timeout')), 1500))
    ])
  } catch {
    window.localStorage.setItem(key, value)
  }
}

async function safeGet(key: string): Promise<string | null> {
  if (!isWeb) {
    return SecureStore.getItemAsync(key)
  }
  try {
    const v = await Promise.race([
      SecureStore.getItemAsync(key) as Promise<string | null>,
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('secure-store-timeout')), 1500))
    ])
    return v ?? window.localStorage.getItem(key)
  } catch {
    return window.localStorage.getItem(key)
  }
}

async function safeDelete(key: string): Promise<void> {
  if (!isWeb) {
    await SecureStore.deleteItemAsync(key)
    return
  }
  try {
    await Promise.race([
      SecureStore.deleteItemAsync(key),
      new Promise((_, reject) => setTimeout(() => reject(new Error('secure-store-timeout')), 1500))
    ])
  } catch {
    // ignore
  }
  window.localStorage.removeItem(key)
}

interface AuthState {
  token: string | null
  user: User | null
  hydrated: boolean
  setSession: (token: string, user: User) => Promise<void>
  clearSession: () => Promise<void>
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setSession: async (token, user) => {
    await safeSet(TOKEN_KEY, token)
    await safeSet(USER_KEY, JSON.stringify(user))
    set({ token, user })
  },

  clearSession: async () => {
    await safeDelete(TOKEN_KEY)
    await safeDelete(USER_KEY)
    set({ token: null, user: null })
  },

  hydrate: async () => {
    try {
      const token = await safeGet(TOKEN_KEY)
      const userJson = await safeGet(USER_KEY)
      set({
        token: token ?? null,
        user: userJson ? (JSON.parse(userJson) as User) : null,
        hydrated: true
      })
    } catch {
      set({ token: null, user: null, hydrated: true })
    }
  }
}))
