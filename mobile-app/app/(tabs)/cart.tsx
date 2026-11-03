import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { cartService } from '../../services/cartService'
import { PriceText } from '../../components/PriceText'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { Card, PrimaryButton } from '../../components/ui'
import { elevation, formatPrice, palette, radius, spacing, type } from '../../constants/theme'
import { confirmAsync } from '../../components/confirm'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import type { CartItem } from '../../types/api'

// =============================================================================
// GIỎ HÀNG — CART SCREEN (v2)
// - Item card: Thumbnail 56px, tên 2 dòng, PriceText, Qty stepper tròn, nút xóa
// - Footer tổng tiền nổi bật + thông tin ghi chú phí vận chuyển
// - Giữ 100% logic CRUD giỏ hàng thật qua /api/cart
// =============================================================================
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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
        </View>
        <EmptyView
          icon="log-in-outline"
          title="Bạn chưa đăng nhập"
          subtitle="Đăng nhập tài khoản GearTech để xem giỏ hàng và đồng bộ sản phẩm"
          actionLabel="Đăng nhập ngay"
          onAction={() => router.push('/auth/login')}
        />
      </SafeAreaView>
    )
  }

  const cart = cartQuery.data

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header giỏ hàng */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Giỏ hàng {cart ? `(${cart.totalCount})` : ''}
          </Text>
          <Text style={styles.headerSubtitle}>Kiểm tra số lượng trước khi đặt</Text>
        </View>
        {cart && cart.items.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            hitSlop={8}
            onPress={async () => {
              const ok = await confirmAsync('Xóa giỏ hàng', 'Bỏ tất cả sản phẩm khỏi giỏ hàng?')
              if (ok) {
                await cartService.clearCart()
                resetCartCount()
                invalidate()
              }
            }}
          >
            <Ionicons name="trash-outline" size={14} color={palette.danger} />
            <Text style={styles.clearText}>Xóa hết</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartQuery.isLoading ? (
        <LoadingView label="Đang tải giỏ hàng của bạn..." />
      ) : cartQuery.isError ? (
        <ErrorView
          message="Không thể kết nối giỏ hàng."
          onRetry={() => cartQuery.refetch()}
        />
      ) : !cart || cart.items.length === 0 ? (
        <EmptyView
          icon="cart-outline"
          title="Giỏ hàng trống"
          subtitle="Chưa có món hàng nào được thêm. Hãy tiếp tục khám phá!"
          actionLabel="Mua sắm ngay"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <>
          <FlatList
            data={cart.items}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.itemCard,
                  elevation.card,
                  !item.isAvailable && styles.itemDisabled
                ]}
              >
                {/* Thumbnail */}
                <View style={styles.thumbWrap}>
                  <Text style={styles.thumbEmoji}>💻</Text>
                </View>

                {/* Thông tin sản phẩm */}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.shopRow}>
                    <Ionicons name="storefront-outline" size={11} color={palette.faint} />
                    <Text style={styles.itemShop} numberOfLines={1}>
                      {item.shop?.name ?? 'GEARTECH Official'}
                    </Text>
                  </View>

                  <View style={styles.priceRow}>
                    <PriceText price={item.currentPrice} oldPrice={item.oldPrice} />
                  </View>

                  {item.isPriceLocked && item.promotionNote ? (
                    <Text style={styles.promoNote}>🔒 {item.promotionNote}</Text>
                  ) : null}

                  {!item.isAvailable ? (
                    <Text style={styles.unavailable}>
                      ⚠ {item.unavailableReason ?? 'Sản phẩm tạm thời không khả dụng'}
                    </Text>
                  ) : item.isExceedingStock ? (
                    <Text style={styles.unavailable}>
                      ⚠ Số lượng vượt tồn kho (còn {item.stock})
                    </Text>
                  ) : null}
                </View>

                {/* Cột thao tác phải */}
                <View style={styles.itemRight}>
                  <TouchableOpacity
                    onPress={() => confirmRemove(item)}
                    hitSlop={8}
                    style={styles.deleteIconBtn}
                  >
                    <Ionicons name="close" size={16} color={palette.muted} />
                  </TouchableOpacity>

                  {item.isAvailable ? (
                    <View style={styles.qtyRow}>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => changeQty(item, -1)}
                        disabled={updateMutation.isPending}
                        hitSlop={6}
                      >
                        <Ionicons name="remove" size={13} color={palette.ink} />
                      </TouchableOpacity>
                      <Text style={styles.qty}>{item.quantity}</Text>
                      <TouchableOpacity
                        style={styles.qtyBtn}
                        onPress={() => changeQty(item, 1)}
                        disabled={updateMutation.isPending}
                        hitSlop={6}
                      >
                        <Ionicons name="add" size={13} color={palette.ink} />
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  <Text style={styles.lineTotal}>{formatPrice(item.lineTotal)}</Text>
                </View>
              </View>
            )}
          />

          {/* Thanh tổng tiền footer */}
          <View style={[styles.footer, elevation.float]}>
            <View style={styles.footerRow}>
              <View>
                <Text style={styles.footerLabel}>Tổng tạm tính</Text>
                <Text style={styles.footerNote}>Chưa bao gồm phí giao hàng</Text>
              </View>
              <Text style={styles.footerValue}>{formatPrice(cart.subtotal)}</Text>
            </View>

            <PrimaryButton
              label="Tiến hành đặt hàng"
              icon="arrow-forward"
              onPress={goCheckout}
            />
          </View>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  headerTitle: {
    ...type.h2,
    fontSize: 18
  },
  headerSubtitle: {
    ...type.caption,
    marginTop: 1
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: palette.dangerSoft
  },
  clearText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.danger
  },
  list: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: spacing.md
  },
  itemDisabled: {
    opacity: 0.55
  },
  thumbWrap: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border
  },
  thumbEmoji: {
    fontSize: 26
  },
  itemInfo: {
    flex: 1,
    gap: 2
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: palette.ink,
    lineHeight: 18
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2
  },
  itemShop: {
    ...type.caption,
    color: palette.muted
  },
  priceRow: {
    marginTop: 4
  },
  promoNote: {
    fontSize: 10,
    color: palette.success,
    fontWeight: '700',
    marginTop: 2
  },
  unavailable: {
    fontSize: 10,
    color: palette.warning,
    fontWeight: '700',
    marginTop: 2
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 80
  },
  deleteIconBtn: {
    padding: 2
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.surfaceAlt,
    borderRadius: radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: palette.border
  },
  qtyBtn: {
    width: 22,
    height: 22,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qty: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.ink,
    minWidth: 16,
    textAlign: 'center'
  },
  lineTotal: {
    fontSize: 12,
    fontWeight: '900',
    color: palette.ink
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
    color: palette.inkSoft,
    fontWeight: '700'
  },
  footerNote: {
    ...type.caption,
    marginTop: 1
  },
  footerValue: {
    fontSize: 20,
    fontWeight: '900',
    color: palette.brand
  }
})
