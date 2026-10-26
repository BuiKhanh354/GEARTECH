import { useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { authService } from '../../services/authService'
import { PrimaryButton } from '../../components/ui'
import { colors, radius, spacing } from '../../constants/theme'
import { AppError } from '../../services/client'

// Đăng nhập — POST /api/auth/login (cùng cơ chế JWT với website)
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
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </TouchableOpacity>

          <View style={styles.brandWrap}>
            <Text style={styles.brand}>GEAR<Text style={{ color: colors.primary }}>TECH</Text></Text>
            <Text style={styles.welcome}>Đăng nhập để mua sắm</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor={colors.faint}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.label}>MẬT KHẨU</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={colors.faint}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <PrimaryButton label="Đăng nhập" onPress={handleLogin} loading={loading} />
          </View>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Chưa có tài khoản? Đăng ký ngay</Text>
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
  brandWrap: { marginTop: 24, marginBottom: 32, alignItems: 'center' },
  brand: { fontSize: 30, fontWeight: '900', color: colors.ink, letterSpacing: 2 },
  welcome: { fontSize: 13, color: colors.sub, marginTop: 8 },
  form: { gap: 6 },
  label: { fontSize: 10, fontWeight: '800', color: colors.sub, letterSpacing: 1, marginTop: 10 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: colors.ink, marginBottom: 8
  },
  registerLink: { textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 20 }
})
