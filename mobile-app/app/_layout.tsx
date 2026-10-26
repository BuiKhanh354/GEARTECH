import { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider, FocusManager } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useColorScheme } from 'react-native'
import { useAuthStore } from '../store/authStore'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false
    }
  }
})

// Root layout: khởi tạo phiên đăng nhập từ SecureStore rồi mới render app
export default function RootLayout() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate().finally(() => setReady(true))
  }, [hydrate])

  if (!ready) return null

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#18181b',
            headerTitleStyle: { fontWeight: '800', fontSize: 15 },
            headerShadowVisible: false,
            headerBackTitle: ''
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="products/index" options={{ title: 'Tìm kiếm sản phẩm' }} />
          <Stack.Screen name="products/[id]" options={{ title: 'Chi tiết sản phẩm' }} />
          <Stack.Screen name="shops/[id]" options={{ title: 'Gian hàng' }} />
          <Stack.Screen name="auth/login" options={{ title: 'Đăng nhập', headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ title: 'Đăng ký', headerShown: false }} />
          <Stack.Screen name="orders/index" options={{ title: 'Đơn hàng của tôi' }} />
          <Stack.Screen name="orders/[id]" options={{ title: 'Chi tiết đơn hàng' }} />
          <Stack.Screen name="checkout" options={{ title: 'Thanh toán' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
