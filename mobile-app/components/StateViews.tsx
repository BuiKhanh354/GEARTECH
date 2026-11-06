import { useState } from 'react'
import { ActivityIndicator, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, radius, spacing } from '../constants/theme'
import { getApiBaseUrl, setInAppApiUrl, getAutoDetectedHost } from '../services/client'

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
  const [showConfig, setShowConfig] = useState(false)
  const [customInput, setCustomInput] = useState(getApiBaseUrl())
  const currentBase = getApiBaseUrl()
  const detectedHost = getAutoDetectedHost()

  const handleApplyConfig = (url: string | null) => {
    setInAppApiUrl(url)
    setShowConfig(false)
    if (onRetry) {
      setTimeout(onRetry, 300)
    }
  }

  return (
    <View style={styles.center} testID="error-view">
      <View style={[styles.iconWrap, { backgroundColor: palette.dangerSoft }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={palette.danger} />
      </View>
      <Text style={styles.title}>{message}</Text>
      <Text style={styles.urlHint}>Máy chủ: {currentBase}</Text>

      <View style={styles.buttonRow}>
        {onRetry ? (
          <TouchableOpacity style={styles.action} onPress={onRetry}>
            <Ionicons name="refresh" size={14} color={palette.brand} />
            <Text style={styles.actionText}>Thử lại</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity style={styles.configAction} onPress={() => setShowConfig(true)}>
          <Ionicons name="settings-outline" size={14} color={palette.ink} />
          <Text style={styles.configActionText}>Đổi IP Máy chủ</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Cài đặt IP Máy chủ linh hoạt trực tiếp trên App */}
      <Modal visible={showConfig} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cài đặt địa chỉ API Backend</Text>
              <TouchableOpacity onPress={() => setShowConfig(false)}>
                <Ionicons name="close" size={20} color={palette.ink} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Nhập IP máy tính chạy Backend hoặc chọn nhanh cấu hình bên dưới:
            </Text>

            <TextInput
              style={styles.input}
              value={customInput}
              onChangeText={setCustomInput}
              placeholder="http://192.168.x.x:5000/api"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.quickOptions}>
              {detectedHost && (
                <TouchableOpacity
                  style={styles.quickChip}
                  onPress={() => {
                    const u = `http://${detectedHost}:5000/api`
                    setCustomInput(u)
                    handleApplyConfig(u)
                  }}
                >
                  <Text style={styles.quickChipText}>✨ Tự nhận diện ({detectedHost})</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.quickChip}
                onPress={() => {
                  const u = 'http://localhost:5000/api'
                  setCustomInput(u)
                  handleApplyConfig(u)
                }}
              >
                <Text style={styles.quickChipText}>🔌 Cáp USB (localhost:5000)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowConfig(false)}
              >
                <Text style={styles.cancelBtnText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => handleApplyConfig(customInput)}
              >
                <Text style={styles.saveBtnText}>Lưu & Kết nối</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  urlHint: { fontSize: 11, color: palette.muted, marginTop: 4, textAlign: 'center', fontFamily: 'monospace' },
  buttonRow: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1.5, borderColor: palette.brand,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 9,
    backgroundColor: palette.brandSoft
  },
  actionText: { fontSize: 13, fontWeight: '800', color: palette.brand },
  configAction: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: palette.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 9,
    backgroundColor: palette.surfaceAlt
  },
  configActionText: { fontSize: 13, fontWeight: '700', color: palette.ink },

  // Modal styles
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20
  },
  modalBox: {
    width: '100%', maxWidth: 360, backgroundColor: palette.surface,
    borderRadius: radius.lg, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: palette.ink },
  modalDesc: { fontSize: 12, color: palette.muted, marginBottom: 12, lineHeight: 16 },
  input: {
    borderWidth: 1, borderColor: palette.border, borderRadius: radius.md,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 13,
    backgroundColor: palette.bg, color: palette.ink, marginBottom: 12
  },
  quickOptions: { gap: 6, marginBottom: 16 },
  quickChip: {
    backgroundColor: palette.surfaceAlt, borderWidth: 1, borderColor: palette.border,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: palette.ink },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.sm },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: palette.muted },
  saveBtn: {
    backgroundColor: palette.brand, paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: radius.sm
  },
  saveBtnText: { fontSize: 13, fontWeight: '800', color: '#fff' }
})
