import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { PrimaryButton } from '../../components/ui'
import { colors, radius, spacing } from '../../constants/theme'

// Tab Cá nhân: thông tin tài khoản, đơn hàng, đăng nhập/đăng xuất
export default function ProfileScreen() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
  const clearSession = useAuthStore((s) => s.clearSession)
  const resetCart = useCartStore((s) => s.reset)
  const routerNav = useRouter()

  // GET /api/auth/profile — làm mới thông tin mới nhất từ server
  const profile = useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: Boolean(token)
  })

  const handleLogout = async () => {
    await authService.logout()
    resetCart()
    routerNav.replace('/(tabs)/index')
  }

  const displayed = profile.data ?? user

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!token ? (
          <View style={styles.loggedOut}>
            <Ionicons name="person-circle-outline" size={72} color={colors.faint} />
            <Text style={styles.loggedOutTitle}>Bạn chưa đăng nhập</Text>
            <Text style={styles.loggedOutSub}>
              Đăng nhập để mua hàng, theo dõi đơn hàng và nhận ưu đãi thành viên
            </Text>
            <PrimaryButton label="Đăng nhập" onPress={() => router.push('/auth/login')} />
            <TouchableOpacity onPress={() => router.push('/auth/register')}>
              <Text style={styles.registerLink}>Chưa có tài khoản? Đăng ký</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Thông tin tài khoản */}
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(displayed?.name ?? 'U').slice(0, 1).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName} numberOfLines={1}>{displayed?.name ?? '...'}</Text>
                <Text style={styles.profileEmail} numberOfLines={1}>{displayed?.email ?? ''}</Text>
                <View style={styles.rankRow}>
                  {displayed?.memberRank ? (
                    <Text style={styles.rankBadge}>{displayed.memberRank}</Text>
                  ) : null}
                  {typeof displayed?.points === 'number' ? (
                    <Text style={styles.points}>{displayed.points} điểm</Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Menu chức năng — chỉ hiện những gì backend hỗ trợ thật */}
            <View style={styles.menuCard}>
              <MenuItem
                icon="receipt-outline"
                label="Đơn hàng của tôi"
                onPress={() => router.push('/orders')}
              />
              <MenuItem
                icon="heart-outline"
                label="Shop đang theo dõi"
                onPress={() => router.push('/(tabs)/categories')}
              />
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={17} color={colors.danger} />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function MenuItem({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <Ionicons name={icon} size={18} color={colors.sub} />
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.faint} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  content: { padding: spacing.lg, paddingBottom: 48 },
  loggedOut: { alignItems: 'center', paddingTop: 48, gap: 8 },
  loggedOutTitle: { fontSize: 16, fontWeight: '800', color: colors.ink, marginTop: 8 },
  loggedOutSub: { fontSize: 12, color: colors.sub, textAlign: 'center', lineHeight: 18, marginBottom: 12 },
  registerLink: { fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    padding: spacing.lg
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center'
  },
  avatarText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  profileName: { fontSize: 16, fontWeight: '800', color: colors.ink },
  profileEmail: { fontSize: 12, color: colors.sub, marginTop: 2 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  rankBadge: {
    fontSize: 9, fontWeight: '800', color: colors.primary, backgroundColor: '#fff1f2',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, overflow: 'hidden'
  },
  points: { fontSize: 10, color: colors.sub },
  menuCard: {
    backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border,
    marginTop: spacing.lg, overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuItemText: { fontSize: 13, fontWeight: '600', color: colors.ink },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: spacing.xl, paddingVertical: 12,
    borderWidth: 1, borderColor: '#fecaca', borderRadius: radius.md
  },
  logoutText: { fontSize: 13, fontWeight: '700', color: colors.danger }
})
