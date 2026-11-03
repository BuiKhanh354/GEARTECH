import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { palette } from '../../constants/theme'
import { useCartStore } from '../../store/cartStore'

// =============================================================================
// TAB BAR v2 — ĐIỀU HƯỚNG CHÍNH DƯỚI ĐÁY MÀN HÌNH
// 4 tab: Trang chủ / Danh mục / Giỏ hàng (badge số lượng) / Cá nhân
// =============================================================================
export default function TabsLayout() {
  const cartCount = useCartStore((s) => s.cartCount)

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.brand,
        tabBarInactiveTintColor: palette.faint,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: -2
        },
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: 6,
          paddingTop: 6
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color as string} />
          )
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={22} color={color as string} />
          )
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Giỏ hàng',
          ...(cartCount > 0
            ? {
                tabBarBadge: cartCount > 99 ? '99+' : cartCount,
                tabBarBadgeStyle: {
                  backgroundColor: palette.brand,
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: '800',
                  minWidth: 18,
                  height: 18
                }
              }
            : {}),
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color as string} />
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Cá nhân',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color as string} />
          )
        }}
      />
    </Tabs>
  )
}
