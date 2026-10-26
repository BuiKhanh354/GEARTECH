import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { orderService } from '../../services/orderService'
import { confirmAsync } from '../../components/confirm'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { OrderStatusBadge } from '../../components/ui'
import { colors, formatPrice, radius, spacing } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'
import type { Order } from '../../types/api'

// Đơn hàng của tôi — GET /api/orders (backend lọc theo token, không nhận ID từ client)
export default function OrdersScreen() {
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()

  const orders = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderService.getMyOrders(),
    enabled: Boolean(token)
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => orderService.cancelOrder(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    onError: (err: Error) => Alert.alert('Không thể hủy đơn', err.message)
  })

  const confirmCancel = async (order: Order) => {
    const ok = await confirmAsync('Hủy đơn hàng', `Hủy đơn #${order._id.slice(-8).toUpperCase()}?`)
    if (ok) cancelMutation.mutate(order._id)
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyView icon="log-in-outline" title="Bạn chưa đăng nhập" subtitle="Đăng nhập để xem đơn hàng của bạn" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={orders.data ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={undefined}
        renderItem={({ item }) => {
          const status = item.orderStatus ?? item.order_status ?? 'pending'
          const items = item.detailedItems?.length ? item.detailedItems : item.items ?? []
          const firstItem = items[0]
          const firstTitle = firstItem?.title ?? firstItem?.product_name ?? 'Sản phẩm'
          const extra = items.length > 1 ? ` +${items.length - 1}` : ''
          const total = item.finalAmount ?? Number(item.final_amount?.toString?.() ?? 0)
          const isPending = status === 'pending'

          return (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/orders/${item._id}`)}>
              <View style={styles.rowTop}>
                <Text style={styles.orderCode}>#{item._id.slice(-8).toUpperCase()}</Text>
                <OrderStatusBadge status={status} />
              </View>
              <Text style={styles.date}>
                {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}
              </Text>
              <Text style={styles.itemLine} numberOfLines={1}>
                {firstTitle}{extra} · {items.length} mặt hàng
              </Text>
              <View style={styles.rowBottom}>
                <Text style={styles.total}>{formatPrice(total)}</Text>
                <View style={styles.actions}>
                  {isPending && (
                    <TouchableOpacity style={styles.cancelBtn} onPress={() => confirmCancel(item)} disabled={cancelMutation.isPending}>
                      <Text style={styles.cancelText}>Hủy đơn</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.detailBtn}>
                    <Text style={styles.detailText}>Chi tiết</Text>
                    <Ionicons name="chevron-forward" size={12} color={colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          orders.isLoading ? (
            <LoadingView label="Đang tải đơn hàng..." />
          ) : orders.isError ? (
            <ErrorView message="Không tải được đơn hàng." onRetry={() => orders.refetch()} />
          ) : (
            <EmptyView icon="receipt-outline" title="Bạn chưa có đơn hàng nào" subtitle="Đơn hàng sẽ hiển thị tại đây sau khi đặt mua" />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { padding: spacing.lg, paddingBottom: 48, gap: spacing.sm },
  card: {
    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.md, gap: 6
  },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderCode: { fontSize: 13, fontWeight: '800', color: colors.ink },
  date: { fontSize: 10, color: colors.faint },
  itemLine: { fontSize: 12, color: colors.sub, marginTop: 2 },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  total: { fontSize: 15, fontWeight: '900', color: colors.primary },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cancelBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#fecaca' },
  cancelText: { fontSize: 11, fontWeight: '700', color: colors.danger },
  detailBtn: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 11, fontWeight: '700', color: colors.primary }
})
