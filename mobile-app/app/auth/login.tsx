import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { authService } from '../../services/authService'
import { Card, Input, PrimaryButton } from '../../components/ui'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'
import { AppError } from '../../services/client'

// =============================================================================
// ĐĂNG NHẬP (v2)
// - Form trong Card nổi bật, dùng Input component mới với focus ring
// - Giữ 100% authService.login
// =============================================================================
export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }
    setLoading(true)
    try {
      await authService.login(email.trim(), password)
      router.back()
    } catch (err) {
      const e = err as AppError
      Alert.alert('Đăng nhập thất bại', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Nút đóng / quay lại */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={palette.ink} />
          </TouchableOpacity>

          {/* Logo thương hiệu */}
          <View style={styles.brandWrap}>
            <View style={styles.logoBadge}>
              <Ionicons name="hardware-chip-outline" size={32} color={palette.brand} />
            </View>
            <Text style={styles.brand}>
              GEAR<Text style={{ color: palette.brand }}>TECH</Text>
            </Text>
            <Text style={styles.welcome}>Chào mừng bạn quay trở lại</Text>
          </View>

          {/* Card Form */}
          <Card style={styles.card}>
            <Input
              label="ĐỊA CHỈ EMAIL"
              placeholder="example@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="MẬT KHẨU"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={{ marginTop: spacing.sm }}>
              <PrimaryButton
                label="Đăng nhập"
                onPress={handleLogin}
                loading={loading}
                icon="log-in-outline"
              />
            </View>
          </Card>

          {/* Chuyển hướng đăng ký */}
          <TouchableOpacity
            style={styles.registerWrap}
            onPress={() => router.push('/auth/register')}
            hitSlop={8}
          >
            <Text style={styles.registerText}>
              Chưa có tài khoản?{' '}
              <Text style={styles.registerHighlight}>Đăng ký thành viên</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  scroll: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: 'center'
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md
  },
  brandWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border,
    marginBottom: spacing.md
  },
  brand: {
    ...type.h1,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  welcome: {
    ...type.body,
    color: palette.muted,
    marginTop: 4
  },
  card: {
    padding: spacing.lg,
    gap: spacing.xs
  },
  registerWrap: {
    marginTop: spacing.xl,
    alignItems: 'center'
  },
  registerText: {
    fontSize: 13,
    color: palette.muted
  },
  registerHighlight: {
    fontWeight: '800',
    color: palette.brand
  }
})
