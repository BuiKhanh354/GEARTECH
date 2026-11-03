import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, radius, spacing } from '../constants/theme'

// Trạng thái tải / rỗng / lỗi dùng chung toàn app
export function LoadingView({ label = 'Đang tải...' }: { label?: string }) {
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator size="large" color={palette.brand} />
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

export function EmptyView({ icon = 'cube-outline', title, subtitle, actionLabel, onAction }: {
  icon?: keyof typeof Ionicons.glyphMap
  title: string
  subtitle?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.center} testID="empty-view">
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={28} color={palette.faint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.label}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={styles.action} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center} testID="error-view">
      <View style={[styles.iconWrap, { backgroundColor: palette.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={palette.danger} />
      </View>
      <Text style={styles.title}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.action} onPress={onRetry}>
          <Ionicons name="refresh" size={14} color={palette.brand} />
          <Text style={styles.actionText}>Thử lại</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 52, paddingHorizontal: 28 },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1, borderColor: palette.border
  },
  title: { fontSize: 14, fontWeight: '700', color: palette.ink, textAlign: 'center' },
  label: { fontSize: 12, color: palette.muted, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: spacing.lg,
    borderWidth: 1.5, borderColor: palette.brand,
    borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 9,
    backgroundColor: palette.brandSoft
  },
  actionText: { fontSize: 13, fontWeight: '800', color: palette.brand }
})
