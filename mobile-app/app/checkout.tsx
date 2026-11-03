import { useEffect, useState } from 'react'
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { cartService } from '../services/cartService'
import { orderService } from '../services/orderService'
import { ErrorView, LoadingView } from '../components/StateViews'
import { Card, Input, PrimaryButton } from '../components/ui'
import { confirmAsync } from '../components/confirm'
import { elevation, formatPrice, palette, radius, spacing, type } from '../constants/theme'
import { useAuthStore } from '../store/authStore'
import { useCartStore } from '../store/cartStore'

// =============================================================================
// MÀN HÌNH THANH TOÁN & ĐẶT HÀNG (v2)
// - Nhóm Card: Sản phẩm / Địa chỉ giao hàng (dùng Input component mới) / Phương thức thanh toán
// - Footer tổng tạm tính + Nút Đặt hàng nổi bật
// - Giữ 100% logic createOrder qua /api/orders
// =============================================================================
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
        res.message ?? 'Đơn hàng của bạn đã được ghi nhận vào hệ thống.',
        [
          { text: 'Xem đơn hàng', onPress: () => router.replace('/orders') },
          { text: 'Về trang chủ', onPress: () => router.replace('/(tabs)') }
        ]
      )
    },
    onError: (err: Error) => Alert.alert('Đặt hàng thất bại', err.message)
  })

  const handleSubmit = async () => {
    if (!receiverName.trim() || !receiverPhone.trim() || !detailAddress.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.')
      return
    }
    const ok = await confirmAsync(
      'Xác nhận đặt hàng',
      `Hình thức: ${paymentMethod === 'COD' ? 'Thanh toán khi nhận (COD)' : 'Chuyển khoản'}.\nTổng tạm tính: ${formatPrice(subtotal)}.`
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

  if (cart.isLoading || checkoutInfo.isLoading) return <LoadingView label="Đang chuẩn bị đơn hàng..." />
  if (cart.isError) {
    return <ErrorView message="Không tải được dữ liệu giỏ hàng." onRetry={() => cart.refetch()} />
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

  const subtotal = cartData!.subtotal

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Card: Danh sách sản phẩm thanh toán */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="bag-check-outline" size={17} color={palette.brand} />
              <Text style={styles.cardHeaderTitle}>Kiểm tra sản phẩm ({selectedItems.length})</Text>
            </View>

            {selectedItems.map((i) => (
              <View key={i._id} style={styles.itemRow}>
                <View style={styles.itemQtyBadge}>
                  <Text style={styles.itemQtyText}>{i.quantity}x</Text>
                </View>
                <Text style={styles.itemName} numberOfLines={1}>
                  {i.title}
                </Text>
                <Text style={styles.itemPrice}>{formatPrice(i.lineTotal)}</Text>
              </View>
            ))}

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text style={styles.subtotalLabel}>Tạm tính tiền hàng</Text>
              <Text style={styles.subtotalValue}>{formatPrice(subtotal)}</Text>
            </View>
            <Text style={styles.shippingNotice}>
              * Phí vận chuyển được xác nhận cụ thể theo từng cửa hàng đối tác.
            </Text>
          </Card>

          {/* Card: Thông tin người nhận hàng */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={17} color={palette.brand} />
              <Text style={styles.cardHeaderTitle}>Địa chỉ giao hàng</Text>
            </View>

            <Input
              label="HỌ TÊN NGƯỜI NHẬN *"
              value={receiverName}
              onChangeText={setReceiverName}
              placeholder="Nguyễn Văn A"
            />
            <Input
              label="SỐ ĐIỆN THOẠI LIÊN HỆ *"
              value={receiverPhone}
              onChangeText={setReceiverPhone}
              placeholder="09xx xxx xxx"
              keyboardType="phone-pad"
            />
            <Input
              label="ĐỊA CHỈ CHI TIẾT *"
              value={detailAddress}
              onChangeText={setDetailAddress}
              placeholder="Số nhà, tên đường, phường/xã..."
              multiline
            />
            <Input
              label="TỈNH / THÀNH PHỐ"
              value={province}
              onChangeText={setProvince}
              placeholder="TP. Hồ Chí Minh, Hà Nội..."
            />
            <Input
              label="GHI CHÚ GIAO HÀNG (TÙY CHỌN)"
              value={note}
              onChangeText={setNote}
              placeholder="Lưu ý về giờ giao hàng hoặc chỉ dẫn nhà..."
            />
          </Card>

          {/* Card: Phương thức thanh toán */}
          <Card style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="wallet-outline" size={17} color={palette.brand} />
              <Text style={styles.cardHeaderTitle}>Phương thức thanh toán</Text>
            </View>

            {(['COD', 'BANK_TRANSFER'] as const).map((m) => {
              const active = paymentMethod === m
              return (
                <TouchableOpacity
                  key={m}
                  style={[styles.payOption, active && styles.payOptionActive]}
                  activeOpacity={0.8}
                  onPress={() => setPaymentMethod(m)}
                >
                  <View style={[styles.radioCircle, active && styles.radioCircleActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payTitle, active && styles.payTitleActive]}>
                      {m === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Chuyển khoản ngân hàng'}
                    </Text>
                    <Text style={styles.paySub}>
                      {m === 'COD'
                        ? 'Nhận hàng, kiểm tra sản phẩm và thanh toán tiền mặt'
                        : 'Thông tin số tài khoản sẽ được cung cấp sau khi tạo đơn'}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            })}
          </Card>
        </ScrollView>

        {/* Thanh cố định ở đáy */}
        <View style={[styles.footer, elevation.float]}>
          <View style={styles.footerRow}>
            <View>
              <Text style={styles.footerLabel}>Tổng thanh toán</Text>
              <Text style={styles.footerSub}>Đã bao gồm thuế</Text>
            </View>
            <Text style={styles.footerValue}>{formatPrice(subtotal)}</Text>
          </View>

          <PrimaryButton
            label="Xác nhận đặt hàng"
            variant="dark"
            icon="checkmark-circle"
            onPress={handleSubmit}
            loading={createOrder.isPending}
          />
        </View>
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md
  },
  sectionCard: {
    gap: spacing.xs
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border
  },
  cardHeaderTitle: {
    ...type.h3,
    fontSize: 14
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 5
  },
  itemQtyBadge: {
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm
  },
  itemQtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.inkSoft
  },
  itemName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: palette.ink
  },
  itemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  subtotalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.muted
  },
  subtotalValue: {
    fontSize: 14,
    fontWeight: '900',
    color: palette.brand
  },
  shippingNotice: {
    ...type.caption,
    color: palette.faint,
    marginTop: 4
  },
  payOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1.5,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: palette.surface
  },
  payOptionActive: {
    borderColor: palette.brand,
    backgroundColor: palette.brandSoft
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center'
  },
  radioCircleActive: {
    borderColor: palette.brand
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.brand
  },
  payTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink
  },
  payTitleActive: {
    color: palette.brand
  },
  paySub: {
    ...type.caption,
    marginTop: 2,
    color: palette.muted
  },
  footer: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    gap: spacing.sm
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.inkSoft
  },
  footerSub: {
    ...type.caption
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: palette.brand
  }
})
