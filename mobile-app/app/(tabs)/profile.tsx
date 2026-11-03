import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { authService } from '../../services/authService'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Card, PrimaryButton } from '../../components/ui'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'

// =============================================================================
// MÀN HÌNH CÁ NHÂN / PROFILE (v2)
// - Profile card lớn: Avatar ký tự, Rank badge pill, điểm tích lũy
// - Menu Card bo tròn cao cấp với icon và chevron
// - Nút đăng xuất dạng outline đỏ tinh tế
// =============================================================================
export default function ProfileScreen() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)
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
    routerNav.replace('/(tabs)')
  }

  const displayed = profile.data ?? user

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ sơ cá nhân</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!token ? (
          <Card style={styles.loggedOutCard}>
            <View style={styles.loggedOutIconWrap}>
              <Ionicons name="person-outline" size={36} color={palette.brand} />
            </View>
            <Text style={styles.loggedOutTitle}>Tài khoản GearTech</Text>
            <Text style={styles.loggedOutSub}>
              Đăng nhập để theo dõi đơn hàng, quản lý địa chỉ nhận và nhận ưu đãi thành viên độc quyền.
            </Text>
            <View style={{ width: '100%', marginTop: spacing.sm }}>
              <PrimaryButton
                label="Đăng nhập ngay"
                icon="log-in-outline"
                onPress={() => router.push('/auth/login')}
              />
            </View>
            <TouchableOpacity
              style={styles.registerTouch}
              onPress={() => router.push('/auth/register')}
              hitSlop={6}
            >
              <Text style={styles.registerLink}>
                Chưa có tài khoản? <Text style={styles.registerHighlight}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </Card>
        ) : (
          <>
            {/* Card thông tin người dùng */}
            <View style={[styles.profileCard, elevation.card]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(displayed?.name ?? 'U').slice(0, 1).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.profileName} numberOfLines={1}>
                  {displayed?.name ?? 'Người dùng GearTech'}
                </Text>
                <Text style={styles.profileEmail} numberOfLines={1}>
                  {displayed?.email ?? ''}
                </Text>
                <View style={styles.rankRow}>
                  {displayed?.memberRank ? (
                    <View style={styles.rankBadge}>
                      <Ionicons name="shield-checkmark" size={10} color={palette.brand} />
                      <Text style={styles.rankText}>{displayed.memberRank}</Text>
                    </View>
                  ) : (
                    <View style={styles.rankBadge}>
                      <Ionicons name="sparkles" size={10} color={palette.brand} />
                      <Text style={styles.rankText}>Thành viên</Text>
                    </View>
                  )}
                  {typeof displayed?.points === 'number' ? (
                    <Text style={styles.points}>{displayed.points} điểm tích lũy</Text>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Menu tiện ích */}
            <Card style={styles.menuCard}>
              <MenuItem
                icon="receipt-outline"
                label="Đơn hàng của tôi"
                subtitle="Theo dõi tiến độ giao nhận và lịch sử"
                onPress={() => router.push('/orders')}
              />
              <MenuItem
                icon="heart-outline"
                label="Gian hàng yêu thích"
                subtitle="Cửa hàng và đối tác bạn quan tâm"
                onPress={() => router.push('/(tabs)/categories')}
              />
              <MenuItem
                icon="cart-outline"
                label="Giỏ hàng hiện tại"
                subtitle="Xem lại các sản phẩm đã lưu"
                onPress={() => router.push('/(tabs)/cart')}
                isLast
              />
            </Card>

            {/* Nút đăng xuất */}
            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={18} color={palette.danger} />
              <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function MenuItem({
  icon,
  label,
  subtitle,
  onPress,
  isLast
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  subtitle?: string
  onPress: () => void
  isLast?: boolean
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconWrap}>
        <Ionicons name={icon} size={20} color={palette.brand} />
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <Text style={styles.menuItemText}>{label}</Text>
        {subtitle ? <Text style={styles.menuItemSub}>{subtitle}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={16} color={palette.borderStrong} />
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  header: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  headerTitle: {
    ...type.h2,
    fontSize: 18
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  loggedOutCard: {
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    marginTop: spacing.md
  },
  loggedOutIconWrap: {
    width: 68,
    height: 68,
    borderRadius: radius.pill,
    backgroundColor: palette.brandSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  loggedOutTitle: {
    ...type.h2,
    fontSize: 18
  },
  loggedOutSub: {
    ...type.body,
    textAlign: 'center',
    color: palette.muted,
    lineHeight: 19
  },
  registerTouch: {
    marginTop: spacing.sm
  },
  registerLink: {
    fontSize: 13,
    color: palette.muted
  },
  registerHighlight: {
    fontWeight: '800',
    color: palette.brand
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.lg
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: radius.pill,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: palette.brandSoft
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff'
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: palette.ink
  },
  profileEmail: {
    ...type.caption,
    color: palette.muted
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.brandSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill
  },
  rankText: {
    fontSize: 10,
    fontWeight: '800',
    color: palette.brand
  },
  points: {
    ...type.caption,
    fontWeight: '600',
    color: palette.faint
  },
  menuCard: {
    padding: 0,
    marginTop: spacing.lg,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink
  },
  menuItemSub: {
    ...type.caption,
    color: palette.muted
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.xl,
    paddingVertical: 13,
    backgroundColor: palette.dangerSoft,
    borderWidth: 1,
    borderColor: palette.danger + '33',
    borderRadius: radius.md
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.danger
  }
})
