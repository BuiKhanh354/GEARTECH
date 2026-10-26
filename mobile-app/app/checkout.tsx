import { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { cartService } from '../services/cartService'
import { orderService } from '../services/orderService'
import { ErrorView, LoadingView } from '../components/StateViews'
import { PrimaryButton } from '../components/ui'
import { confirmAsync } from '../components/confirm'
import { colors, formatPrice, radius, spacing } from '../constants/theme'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

// Thanh toán — tạo đơn qua POST /api/orders
// Giá và tồn kho do backend xác thực tại thời điểm đặt; app KHÔNG tự tính giá cuối.
// Phương thức thanh toán: COD (backend cũng hỗ trợ BANK_TRANSFER nhưng chưa có cổng
// thanh toán trực tuyến thật — phần này ghi rõ là chưa triển khai).
export default function CheckoutScreen() {
  const token = useAuthStore((s) => s.token)
  const resetCartCount = useCartStore((s) => s.reset)
  const queryClient = useQueryClient()

  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [detailAddress, setDetailAddress] = useState('')
  const [province, setProvince] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BANK_TRANSFER'>('COD')

  // Địa chỉ giao hàng mặc định từ hồ sơ (GET /api/customers/checkout-info)
  const checkoutInfo = useQuery({
    queryKey: ['checkout-info'],
    queryFn: () => orderService.getCheckoutInfo(),
    enabled: Boolean(token)
  })

  const cart = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartService.getCart(),
    enabled: Boolean(token)
  })

  useEffect(() => {
    const info = checkoutInfo.data
    if (info) {
      setReceiverName((v) => v || info.shippingAddress?.receiverName || info.name || '')
      setReceiverPhone((v) => v || info.shippingAddress?.receiverPhone || info.phone || '')
      setDetailAddress((v) => v || info.shippingAddress?.detailAddress || '')
      setProvince((v) => v || info.shippingAddress?.province || '')
    }
  }, [checkoutInfo.data])

  const createOrder = useMutation({
    mutationFn: () => {
      const cartData = cart.data
      const items = (cartData?.items ?? [])
        .filter((i) => i.isAvailable && i.selected)
        .map((i) => ({ productId: i.productId, quantity: i.quantity }))

      return orderService.createOrder({
        items,
        shippingAddress: {
          receiverName: receiverName.trim(),
          receiverPhone: receiverPhone.trim(),
          detailAddress: detailAddress.trim(),
          province: province.trim()
        },
        paymentMethod,
        note: note.trim() || undefined
      })
    },
    onSuccess: (res) => {
      resetCartCount()
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      Alert.alert(
        'Đặt hàng thành công',
        res.message ?? 'Đơn hàng đã được ghi nhận vào hệ thống.',
        [
          { text: 'Xem đơn hàng', onPress: () => router.replace('/orders') },
          { text: 'Ở lại', style: 'cancel' }
        ]
      )
      router.replace('/orders')
    },
    onError: (err: Error) => Alert.alert('Đặt hàng thất bại', err.message)
  })

  const handleSubmit = async () => {
    if (!receiverName.trim() || !receiverPhone.trim() || !detailAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ nhận hàng.')
      return
    }
    const ok = await confirmAsync(
      'Xác nhận đặt hàng',
      `Thanh toán: ${paymentMethod === 'COD' ? 'Khi nhận hàng (COD)' : 'Chuyển khoản'}. Tổng tạm tính ${formatPrice(subtotal)}.`
    )
    if (ok) createOrder.mutate()
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Bạn chưa đăng nhập." />
      </SafeAreaView>
    )
  }

  if (cart.isLoading || checkoutInfo.isLoading) return <LoadingView label="Đang chuẩn bị thanh toán..." />
  if (cart.isError) {
    return <ErrorView message="Không tải được giỏ hàng." onRetry={() => cart.refetch()} />
  }

  const cartData = cart.data
  const selectedItems = (cartData?.items ?? []).filter((i) => i.isAvailable && i.selected)

  if (selectedItems.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Không có sản phẩm khả dụng để thanh toán." />
      </SafeAreaView>
    )
  }

  // Tạm tính từ subtotal backend trả về (đã tính đúng giá bán & khuyến mãi)
  const subtotal = cartData!.subtotal

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Danh sách sản phẩm */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sản phẩm ({selectedItems.length})</Text>
            {selectedItems.map((i) => (
              <View key={i._id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{i.quantity}×</Text>
                <Text style={styles.itemName} numberOfLines={1}>{i.title}</Text>
                <Text style={styles.itemPrice}>{formatPrice(i.lineTotal)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.sumLabel}>Tạm tính</Text>
              <Text style={styles.sumValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Text style={styles.note}>
              Phí vận chuyển theo quy định của từng shop và được xác nhận khi xử lý đơn
            </Text>
          </View>

          {/* Địa chỉ nhận hàng */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Địa chỉ nhận hàng</Text>
            <Text style={styles.label}>NGƯỜI NHẬN</Text>
            <TextInput style={styles.input} value={receiverName} onChangeText={setReceiverName} placeholder="Họ tên người nhận" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>SỐ ĐIỆN THOẠI</Text>
            <TextInput style={styles.input} value={receiverPhone} onChangeText={setReceiverPhone} placeholder="09xx xxx xxx" placeholderTextColor={colors.faint} keyboardType="phone-pad" />
            <Text style={styles.label}>ĐỊA CHỈ</Text>
            <TextInput style={styles.input} value={detailAddress} onChangeText={setDetailAddress} placeholder="Số nhà, đường, phường/xã..." placeholderTextColor={colors.faint} multiline />
            <Text style={styles.label}>TỈNH / THÀNH PHỐ</Text>
            <TextInput style={styles.input} value={province} onChangeText={setProvince} placeholder="VD: TP. Hồ Chí Minh" placeholderTextColor={colors.faint} />
            <Text style={styles.label}>GHI CHÚ (TÙY CHỌN)</Text>
            <TextInput style={styles.input} value={note} onChangeText={setNote} placeholder="Ghi chú cho shop..." placeholderTextColor={colors.faint} multiline />
          </View>

          {/* Phương thức thanh toán */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            {(['COD', 'BANK_TRANSFER'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.payOption, paymentMethod === m && styles.payOptionActive]}
                onPress={() => setPaymentMethod(m)}
              >
                <View style={[styles.radio, paymentMethod === m && styles.radioActive]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.payLabel}>{m === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}</Text>
                  {m === 'BANK_TRANSFER' && (
                    <Text style={styles.payNote}>Xác nhận chuyển khoản sẽ được xử lý sau khi đặt</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Nút đặt hàng */}
        <View style={styles.footer}>
          <View style={styles.rowBetween}>
            <Text style={styles.footerLabel}>Tổng tạm tính</Text>
            <Text style={styles.footerValue}>{formatPrice(subtotal)}</Text>
          </View>
          <PrimaryButton label="Đặt hàng" icon="checkmark-circle-outline" onPress={() => { handleSubmit() }} loading={createOrder.isPending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 24, gap: spacing.md },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  itemQty: { fontSize: 12, fontWeight: '800', color: colors.sub, width: 26 },
  itemName: { flex: 1, fontSize: 12, fontWeight: '600', color: colors.ink },
  itemPrice: { fontSize: 12, fontWeight: '700', color: colors.ink },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sumLabel: { fontSize: 12, color: colors.sub },
  sumValue: { fontSize: 14, fontWeight: '900', color: colors.primary },
  note: { fontSize: 10, color: colors.faint, marginTop: 4 },
  label: { fontSize: 9, fontWeight: '800', color: colors.sub, letterSpacing: 1, marginTop: 10, marginBottom: 4 },
  input: {
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: colors.ink
  },
  payOption: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm,
    padding: 12, marginTop: 8
  },
  payOptionActive: { borderColor: colors.primary, backgroundColor: '#fff1f2' },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: colors.border },
  radioActive: { borderColor: colors.primary, backgroundColor: colors.primary },
  payLabel: { fontSize: 12, fontWeight: '700', color: colors.ink },
  payNote: { fontSize: 10, color: colors.faint, marginTop: 2 },
  footer: {
    backgroundColor: colors.card, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, gap: 10
  },
  footerLabel: { fontSize: 13, color: colors.sub },
  footerValue: { fontSize: 18, fontWeight: '900', color: colors.primary }
})
