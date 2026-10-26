import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { orderService } from '../../services/orderService'
import { ErrorView, LoadingView } from '../../components/StateViews'
import { OrderStatusBadge } from '../../components/ui'
import { colors, formatPrice, radius, spacing } from '../../constants/theme'
import type { OrderItem } from '../../types/api'

// Chi tiết đơn hàng — GET /api/orders/:id (backend kiểm tra quyền sở hữu,
// client không thể xem đơn của người khác kể cả tự thay ID trên URL)
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const order = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id as string),
    enabled: Boolean(id)
  })

  if (order.isLoading) return <LoadingView label="Đang tải đơn hàng..." />
  if (order.isError || !order.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Không tải được đơn hàng. Đơn có thể không thuộc quyền của bạn." onRetry={() => order.refetch()} />
      </SafeAreaView>
    )
  }

  const o = order.data
  const status = o.orderStatus ?? o.order_status ?? 'pending'
  const items: OrderItem[] = o.detailedItems?.length ? o.detailedItems : o.items ?? []
  const total = o.finalAmount ?? Number(o.final_amount?.toString?.() ?? 0)
  const subtotal = o.totalAmount ?? total

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Trạng thái */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.code}>#{o._id.slice(-8).toUpperCase()}</Text>
            <OrderStatusBadge status={status} />
          </View>
          <Text style={styles.date}>
            {o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : ''}
          </Text>
          <View style={styles.statusGrid}>
            <View>
              <Text style={styles.miniLabel}>Thanh toán</Text>
              <Text style={styles.miniValue}>
                {(o.paymentMethod ?? o.payment_method ?? 'COD').toUpperCase()} ·
                {' '}{(o.paymentStatus ?? o.payment_status ?? 'pending') === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
              </Text>
            </View>
          </View>
        </View>

        {/* Sản phẩm */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sản phẩm ({items.length})</Text>
          {items.map((it, idx) => {
            const name = it.product_name ?? it.title ?? (typeof it.product_id === 'object' ? it.product_id?.title : undefined) ?? 'Sản phẩm'
            const qty = it.quantity ?? it.qty ?? 1
            const price = it.unit_price ?? it.price ?? 0
            return (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName} numberOfLines={2}>{name}</Text>
                  <Text style={styles.itemMeta}>
                    {formatPrice(Number(price))} × {qty}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>{formatPrice(Number(price) * Number(qty))}</Text>
              </View>
            )
          })}
        </View>

        {/* Giao nhận + thanh toán */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Giao nhận</Text>
          <Text style={styles.address}>{o.shipping_address ?? o.shippingAddress?.detailAddress ?? '—'}</Text>
          {o.shippingAddress?.receiverName ? (
            <Text style={styles.receiver}>
              {o.shippingAddress.receiverName} · {o.shippingAddress.receiverPhone}
            </Text>
          ) : null}

          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <Text style={styles.sumLabel}>Tạm tính</Text>
            <Text style={styles.sumValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.sumLabelBold}>Tổng thanh toán</Text>
            <Text style={styles.sumTotal}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 48, gap: spacing.md },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 14, fontWeight: '900', color: colors.ink },
  date: { fontSize: 11, color: colors.faint, marginTop: 4 },
  statusGrid: { marginTop: 10 },
  miniLabel: { fontSize: 10, color: colors.faint },
  miniValue: { fontSize: 12, fontWeight: '700', color: colors.sub, marginTop: 2 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.ink, marginBottom: 8 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 8 },
  itemName: { fontSize: 12, fontWeight: '600', color: colors.ink },
  itemMeta: { fontSize: 10, color: colors.faint, marginTop: 2 },
  itemTotal: { fontSize: 12, fontWeight: '800', color: colors.ink },
  address: { fontSize: 12, color: colors.sub, lineHeight: 18 },
  receiver: { fontSize: 11, color: colors.faint, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
  sumLabel: { fontSize: 12, color: colors.sub, marginBottom: 6 },
  sumValue: { fontSize: 12, fontWeight: '700', color: colors.ink, marginBottom: 6 },
  sumLabelBold: { fontSize: 13, fontWeight: '800', color: colors.ink },
  sumTotal: { fontSize: 16, fontWeight: '900', color: colors.primary }
})
