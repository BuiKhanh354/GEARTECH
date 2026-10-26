import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { authService } from '../../services/authService'
import { PrimaryButton } from '../../components/ui'
import { colors, radius, spacing } from '../../constants/theme'
import { AppError } from '../../services/client'

// Đăng ký — POST /api/auth/register (role luôn 'user', backend tự tạo Customer liên kết)
export default function RegisterScreen() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền họ tên, email và mật khẩu.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Mật khẩu yếu', 'Mật khẩu cần tối thiểu 6 ký tự.')
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
        { text: 'Đăng nhập', onPress: () => router.replace('/auth/login') }
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <Text style={styles.brand}>GEAR<Text style={{ color: colors.primary }}>TECH</Text></Text>
            <Text style={styles.welcome}>Tạo tài khoản mới</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>HỌ VÀ TÊN</Text>
            <TextInput style={styles.input} placeholder="Nguyễn Văn A" placeholderTextColor={colors.faint} value={name} onChangeText={setName} />

            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input} placeholder="example@gmail.com" placeholderTextColor={colors.faint}
              autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}
            />

            <Text style={styles.label}>SỐ ĐIỆN THOẠI (TÙY CHỌN)</Text>
            <TextInput
              style={styles.input} placeholder="09xx xxx xxx" placeholderTextColor={colors.faint}
              keyboardType="phone-pad" value={phone} onChangeText={setPhone}
            />

            <Text style={styles.label}>MẬT KHẨU (TỐI THIỂU 6 KÝ TỰ)</Text>
            <TextInput
              style={styles.input} placeholder="••••••••" placeholderTextColor={colors.faint}
              secureTextEntry value={password} onChangeText={setPassword}
            />

            <PrimaryButton label="Đăng ký" onPress={handleRegister} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  scroll: { flexGrow: 1, padding: spacing.xl },
  back: { alignSelf: 'flex-end', padding: 4 },
  brandWrap: { marginTop: 16, marginBottom: 24, alignItems: 'center' },
  brand: { fontSize: 30, fontWeight: '900', color: colors.ink, letterSpacing: 2 },
  welcome: { fontSize: 13, color: colors.sub, marginTop: 8 },
  form: { gap: 6 },
  label: { fontSize: 10, fontWeight: '800', color: colors.sub, letterSpacing: 1, marginTop: 10 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: colors.ink, marginBottom: 8
  },
  loginLink: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 20 }
})
