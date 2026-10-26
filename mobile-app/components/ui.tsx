import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL, radius } from '../constants/theme'

// Nút chính dùng chung
export function PrimaryButton({ label, onPress, disabled, loading, danger, icon }: {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  danger?: boolean
  icon?: keyof typeof Ionicons.glyphMap
}) {
  const bg = disabled ? '#d4d4d8' : danger ? colors.danger : colors.primary
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg }]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {icon ? <Ionicons name={icon} size={16} color="#fff" style={{ marginRight: 6 }} /> : null}
      <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : label}</Text>
    </TouchableOpacity>
  )
}

// Badge trạng thái đơn hàng (khớp 5 trạng thái của backend)
export function OrderStatusBadge({ status }: { status?: string }) {
  const key = (status ?? 'pending').toLowerCase()
  const label = ORDER_STATUS_LABEL[key] ?? key
  const color = ORDER_STATUS_COLOR[key] ?? colors.sub
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '1A', borderColor: color + '4D' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  )
}

export function SectionHeader({ title, actionLabel, onAction }: {
  title: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.md
  },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start'
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.ink },
  sectionAction: { fontSize: 12, fontWeight: '700', color: colors.primary }
})
