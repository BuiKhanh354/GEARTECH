import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, TouchableOpacity, View, TextInputProps, ViewStyle } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, radius, spacing, type, elevation, ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from '../constants/theme'

// =============================================================================
// BUTTON — variant: primary (đỏ brand) | dark (ink) | outline | danger-ghost
// =============================================================================
export function PrimaryButton({ label, onPress, disabled, loading, danger, icon, variant = 'primary' }: {
  label: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  danger?: boolean
  icon?: keyof typeof Ionicons.glyphMap
  variant?: 'primary' | 'dark' | 'outline'
}) {
  const isDisabled = disabled || loading
  const stylesByVariant = {
    primary: { bg: isDisabled ? palette.borderStrong : danger ? palette.danger : palette.brand, fg: '#fff', border: undefined },
    dark: { bg: isDisabled ? palette.borderStrong : palette.ink, fg: '#fff', border: undefined },
    outline: { bg: palette.surface, fg: palette.ink, border: palette.borderStrong }
  }[variant]

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: stylesByVariant.bg }, stylesByVariant.border ? { borderWidth: 1.5, borderColor: stylesByVariant.border } : null]}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <View style={styles.row}>
          <Ionicons name="refresh" size={15} color={stylesByVariant.fg} style={styles.spin} />
          <Text style={[styles.buttonText, { color: stylesByVariant.fg }]}>Đang xử lý...</Text>
        </View>
      ) : (
        <View style={styles.row}>
          {icon ? <Ionicons name={icon} size={16} color={stylesByVariant.fg} style={{ marginRight: 7 }} /> : null}
          <Text style={[styles.buttonText, { color: stylesByVariant.fg }]}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// =============================================================================
// ORDER STATUS BADGE — khớp 5 trạng thái backend
// =============================================================================
export function OrderStatusBadge({ status }: { status?: string }) {
  const key = (status ?? 'pending').toLowerCase()
  const label = ORDER_STATUS_LABEL[key] ?? key
  const color = ORDER_STATUS_COLOR[key] ?? palette.muted
  return (
    <View style={[styles.statusBadge, { backgroundColor: color + '14', borderColor: color + '55' }]}>
      <View style={[styles.statusDot, { backgroundColor: color }]} />
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  )
}

// =============================================================================
// SECTION HEADER — tiêu đề khu vực + hành động phụ
// =============================================================================
export function SectionHeader({ title, actionLabel, onAction, subtitle }: {
  title: string
  actionLabel?: string
  onAction?: () => void
  subtitle?: string
}) {
  return (
    <View style={styles.sectionRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity onPress={onAction} style={styles.sectionAction}>
          <Text style={styles.sectionActionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={12} color={palette.brand} />
        </TouchableOpacity>
      ) : null}
    </View>
  )
}

// =============================================================================
// INPUT — ô nhập form dùng chung (label + focus ring)
// =============================================================================
export function Input({ label, error, style, ...props }: TextInputProps & { label?: string; error?: boolean }) {
  const [focused, setFocused] = useState(false)
  return (
    <View style={{ marginBottom: spacing.md }}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        style={[
          styles.input,
          focused && { borderColor: palette.brand, backgroundColor: palette.surface },
          error && { borderColor: palette.danger }
        ]}
        placeholderTextColor={palette.faint}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
    </View>
  )
}

// Card nền trắng bo góc dùng chung cho nhóm nội dung
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[styles.card, elevation.card, style]}>{children}</View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  spin: { marginRight: 7 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md
  },
  buttonText: { fontSize: 14, fontWeight: '800', letterSpacing: 0.2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 9, paddingVertical: 4,
    borderRadius: radius.pill, borderWidth: 1, alignSelf: 'flex-start'
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  sectionTitle: { ...type.h3 },
  sectionSubtitle: { ...type.caption, marginTop: 2 },
  sectionAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  sectionActionText: { fontSize: 12, fontWeight: '700', color: palette.brand },
  inputLabel: { ...type.overline, color: palette.muted, marginBottom: 6 },
  input: {
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1.5, borderColor: 'transparent',
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: palette.ink
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border
  }
})
