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
// ĐĂNG KÝ TÀI KHOẢN (v2)
// - Form trong Card cao cấp, Input có label và focus ring
// - Giữ 100% authService.register
// =============================================================================
export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, email và mật khẩu.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu cần tối thiểu 6 ký tự để bảo vệ tài khoản.')
      return
    }
    setLoading(true)
    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined
      })
      Alert.alert('Thành công', res.message ?? 'Đăng ký thành công! Hãy đăng nhập.', [
        { text: 'Đăng nhập ngay', onPress: () => router.replace('/auth/login') }
      ])
    } catch (err) {
      const e = err as AppError
      Alert.alert('Đăng ký thất bại', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Nút quay lại */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </TouchableOpacity>

          {/* Logo thương hiệu */}
          <View style={styles.brandWrap}>
            <Text style={styles.brand}>
              GEAR<Text style={{ color: palette.brand }}>TECH</Text>
            </Text>
            <Text style={styles.welcome}>Tạo tài khoản thành viên mới</Text>
          </View>

          {/* Card Form */}
          <Card style={styles.card}>
            <Input
              label="HỌ VÀ TÊN *"
              placeholder="Nguyễn Văn A"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="ĐỊA CHỈ EMAIL *"
              placeholder="example@gmail.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="SỐ ĐIỆN THOẠI (TÙY CHỌN)"
              placeholder="09xx xxx xxx"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />

            <Input
              label="MẬT KHẨU (TỐI THIỂU 6 KÝ TỰ) *"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <View style={{ marginTop: spacing.sm }}>
              <PrimaryButton
                label="Đăng ký tài khoản"
                onPress={handleRegister}
                loading={loading}
                icon="person-add-outline"
              />
            </View>
          </Card>

          {/* Chuyển hướng đăng nhập */}
          <TouchableOpacity
            style={styles.loginWrap}
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Text style={styles.loginText}>
              Đã có tài khoản?{' '}
              <Text style={styles.loginHighlight}>Đăng nhập</Text>
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl
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
  loginWrap: {
    marginTop: spacing.xl,
    alignItems: 'center'
  },
  loginText: {
    fontSize: 13,
    color: palette.muted
  },
  loginHighlight: {
    fontWeight: '800',
    color: palette.brand
  }
})
