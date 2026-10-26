import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { cartService } from '../../services/cartService'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { PrimaryButton } from '../../components/ui'
import { colors, formatPrice, radius, spacing } from '../../constants/theme'
import { confirmAsync } from '../../components/confirm'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import type { CartItem } from '../../types/api'

// Giỏ hàng — CRUD thật qua GET/PUT/DELETE /api/cart/*
// Backend kiểm tra tồn kho & chốt giá (kể cả chính sách giữ giá 48h); client chỉ hiển thị
export default function CartScreen() {
  const token = useAuthStore((s) => s.token)
  const setCartCount = useCartStore((s) => s.setFromCart)
  const resetCartCount = useCartStore((s) => s.reset)
  const queryClient = useQueryClient()

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const cart = await cartService.getCart()
      setCartCount(cart)
      return cart
    },
    enabled: Boolean(token)
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['cart'] })
  }

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateItem(productId, { quantity }),
    onSuccess: invalidate
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeItem(productId),
    onSuccess: invalidate
  })

  const confirmRemove = async (item: CartItem) => {
    const ok = await confirmAsync('Xóa sản phẩm', `Bỏ "${item.title}" khỏi giỏ hàng?`)
    if (ok) removeMutation.mutate(item.productId)
  }

  const changeQty = (item: CartItem, delta: number) => {
    const next = item.quantity + delta
    if (next < 1) {
      confirmRemove(item)
      return
    }
    if (next > item.stock) {
      Alert.alert('Vượt tồn kho', `Chỉ còn ${item.stock} sản phẩm trong kho.`)
      return
    }
    updateMutation.mutate({ productId: item.productId, quantity: next })
  }

  const goCheckout = () => {
    const cart = cartQuery.data
    if (!cart) return
    const selectable = cart.items.filter((i) => i.isAvailable && i.selected)
    if (selectable.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Không có sản phẩm khả dụng để thanh toán.')
      return
    }
    router.push('/checkout')
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Giỏ hàng</Text></View>
        <EmptyView
          icon="log-in-outline"
          title="Bạn chưa đăng nhập"
          subtitle="Đăng nhập để xem giỏ hàng và đặt mua sản phẩm"
        />
        <PrimaryButton label="Đăng nhập" onPress={() => router.push('/auth/login')} />
      </SafeAreaView>
    )
  }

  const cart = cartQuery.data

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Giỏ hàng {cart ? `(${cart.totalCount})` : ''}</Text>
        {cart && cart.items.length > 0 && (
          <TouchableOpacity
            onPress={async () => {
              const ok = await confirmAsync('Xóa giỏ hàng', 'Bỏ tất cả sản phẩm khỏi giỏ?')
              if (ok) { await cartService.clearCart(); resetCartCount(); invalidate() }
            }}
          >
            <Text style={[styles.clearText]}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartQuery.isLoading ? (
        <LoadingView label="Đang tải giỏ hàng..." />
      ) : cartQuery.isError ? (
        <ErrorView
          message="Không tải được giỏ hàng."
          onRetry={() => cartQuery.refetch()}
        />
      ) : !cart || cart.items.length === 0 ? (
        <EmptyView icon="cart-outline" title="Giỏ hàng trống" subtitle="Thêm sản phẩm để bắt đầu mua sắm" />
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={[styles.itemCard, !item.isAvailable && styles.itemDisabled]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemShop} numberOfLines={1}>{item.shop?.name ?? 'GEARTECH'}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.itemPrice}>{formatPrice(item.currentPrice)}</Text>
                    {item.oldPrice && item.oldPrice > item.currentPrice ? (
                      <Text style={styles.itemOldPrice}>{formatPrice(item.oldPrice)}</Text>
                    ) : null}
                  </View>
                  {item.isPriceLocked && item.promotionNote ? (
                    <Text style={styles.promoNote}>🔒 {item.promotionNote}</Text>
                  ) : null}
                  {!item.isAvailable ? (
                    <Text style={styles.unavailable}>⚠ {item.unavailableReason ?? 'Không thể mua sản phẩm này'}</Text>
                  ) : item.isExceedingStock ? (
                    <Text style={styles.unavailable}>⚠ Số lượng trong giỏ vượt tồn kho (còn {item.stock})</Text>
                  ) : null}
                </View>

                <View style={styles.itemRight}>
                  {item.isAvailable ? (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item, -1)} disabled={updateMutation.isPending}>
                        <Ionicons name="remove" size={14} color={colors.ink} />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => changeQty(item, 1)} disabled={updateMutation.isPending}>
                        <Ionicons name="add" size={14} color={colors.ink} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                  <Text style={styles.lineTotal}>{formatPrice(item.lineTotal)}</Text>
                  <TouchableOpacity onPress={() => confirmRemove(item)}>
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Thanh tổng tiền — tổng tính từ subtotal do backend trả về */}
          <View style={styles.footer}>
            <View style={styles.footerRow}>
              <Text style={styles.footerLabel}>Tạm tính</Text>
              <Text style={styles.footerValue}>{formatPrice(cart.subtotal)}</Text>
            </View>
            <Text style={styles.footerNote}>Phí vận chuyển và khuyến mãi được xác nhận khi đặt hàng</Text>
            <PrimaryButton label="Thanh toán" icon="arrow-forward" onPress={goCheckout} />
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.card, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  clearText: { fontSize: 12, fontWeight: '700', color: colors.danger },
  list: { padding: spacing.lg, gap: spacing.sm },
  itemCard: {
    flexDirection: 'row', backgroundColor: colors.card, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm
  },
  itemDisabled: { opacity: 0.6 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700', color: colors.ink, lineHeight: 18 },
  itemShop: { fontSize: 10, color: colors.faint, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  itemPrice: { fontSize: 13, fontWeight: '800', color: colors.primary },
  itemOldPrice: { fontSize: 10, color: colors.faint, textDecorationLine: 'line-through' },
  promoNote: { fontSize: 10, color: colors.success, marginTop: 4 },
  unavailable: { fontSize: 10, color: colors.warning, marginTop: 4, flexShrink: 1 },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 26, height: 26, borderRadius: 6, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center'
  },
  qty: { fontSize: 14, fontWeight: '800', color: colors.ink, minWidth: 18, textAlign: 'center' },
  lineTotal: { fontSize: 12, fontWeight: '800', color: colors.ink },
  footer: {
    backgroundColor: colors.card, padding: spacing.lg,
    borderTopWidth: 1, borderTopColor: colors.border, gap: 8
  },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerLabel: { fontSize: 13, color: colors.sub },
  footerValue: { fontSize: 18, fontWeight: '900', color: colors.primary },
  footerNote: { fontSize: 10, color: colors.faint, marginBottom: 4 }
})
