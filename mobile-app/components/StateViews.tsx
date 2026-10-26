import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors } from '../constants/theme'

// Trạng thái tải / rỗng / lỗi dùng chung toàn app
export function LoadingView({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export function EmptyView({ icon = 'cube-outline', title, subtitle }: {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
}) {
  return (
    <View style={styles.center} testID="empty-view">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={colors.faint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.label}>{subtitle}</Text> : null}
    </View>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center} testID="error-view">
      <View style={[styles.iconWrap, { backgroundColor: '#fef2f2' }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.danger} />
      </View>
      <Text style={styles.title}>{message}</Text>
      {onRetry ? (
        <Text style={styles.retry} onPress={onRetry}>
          Thử lại
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, paddingHorizontal: 24 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12
  },
  title: { fontSize: 14, fontWeight: '700', color: colors.ink, textAlign: 'center' },
  label: { fontSize: 12, color: colors.sub, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  retry: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 14 }
})
