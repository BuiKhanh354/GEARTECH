import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { orderService } from '../../services/orderService'
import { confirmAsync } from '../../components/confirm'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { OrderStatusBadge } from '../../components/ui'
import { elevation, formatPrice, palette, radius, spacing, type } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'
import type { Order } from '../../types/api'

// =============================================================================
// QUẢN LÝ ĐƠN HÀNG CỦA TÔI (v2)
// - Danh sách đơn hàng dạng card nổi
// - Mã đơn, OrderStatusBadge, tên mặt hàng tóm tắt, tổng tiền đỏ nổi bật
// - Nút Hủy đơn dạng outline khi đơn đang ở trạng thái pending
// =============================================================================
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
    const ok = await confirmAsync('Hủy đơn hàng', `Bạn có chắc muốn hủy đơn #${order._id.slice(-8).toUpperCase()}?`)
    if (ok) cancelMutation.mutate(order._id)
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <EmptyView
          icon="log-in-outline"
          title="Bạn chưa đăng nhập"
          subtitle="Đăng nhập tài khoản để theo dõi tình trạng các đơn hàng của bạn"
          actionLabel="Đăng nhập ngay"
          onAction={() => router.push('/auth/login')}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={orders.data ?? []}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const status = item.orderStatus ?? item.order_status ?? 'pending'
          const items = item.detailedItems?.length ? item.detailedItems : item.items ?? []
          const firstItem = items[0]
          const firstTitle = firstItem?.title ?? firstItem?.product_name ?? 'Sản phẩm phần cứng'
          const extra = items.length > 1 ? ` (+${items.length - 1} món khác)` : ''
          const total = item.finalAmount ?? Number(item.final_amount?.toString?.() ?? 0)
          const isPending = status === 'pending'

          return (
            <TouchableOpacity
              style={[styles.card, elevation.card]}
              activeOpacity={0.8}
              onPress={() => router.push(`/orders/${item._id}`)}
            >
              <View style={styles.rowTop}>
                <View style={styles.codeWrap}>
                  <Ionicons name="receipt-outline" size={14} color={palette.inkSoft} />
                  <Text style={styles.orderCode}>#{item._id.slice(-8).toUpperCase()}</Text>
                </View>
                <OrderStatusBadge status={status} />
              </View>

              <Text style={styles.date}>
                {item.created_at ? new Date(item.created_at).toLocaleString('vi-VN') : ''}
              </Text>

              <View style={styles.itemSummaryRow}>
                <Ionicons name="hardware-chip-outline" size={13} color={palette.muted} />
                <Text style={styles.itemLine} numberOfLines={1}>
                  {firstTitle}{extra}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.rowBottom}>
                <View>
                  <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                  <Text style={styles.total}>{formatPrice(total)}</Text>
                </View>

                <View style={styles.actions}>
                  {isPending && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => confirmCancel(item)}
                      disabled={cancelMutation.isPending}
                      hitSlop={6}
                    >
                      <Text style={styles.cancelText}>Hủy đơn</Text>
                    </TouchableOpacity>
                  )}
                  <View style={styles.detailBtn}>
                    <Text style={styles.detailText}>Chi tiết</Text>
                    <Ionicons name="chevron-forward" size={13} color={palette.brand} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )
        }}
        ListEmptyComponent={
          orders.isLoading ? (
            <LoadingView label="Đang tải danh sách đơn hàng..." />
          ) : orders.isError ? (
            <ErrorView
              message="Không tải được lịch sử đơn hàng."
              onRetry={() => orders.refetch()}
            />
          ) : (
            <EmptyView
              icon="receipt-outline"
              title="Chưa có đơn hàng nào"
              subtitle="Lịch sử mua sắm của bạn sẽ xuất hiện tại đây sau khi đặt hàng thành công"
              actionLabel="Khám phá sản phẩm"
              onAction={() => router.push('/(tabs)')}
            />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    gap: 6
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  orderCode: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.ink,
    letterSpacing: 0.5
  },
  date: {
    ...type.caption,
    color: palette.faint
  },
  itemSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4
  },
  itemLine: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: palette.inkSoft
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 4
  },
  rowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  totalLabel: {
    ...type.caption,
    color: palette.muted
  },
  total: {
    fontSize: 15,
    fontWeight: '900',
    color: palette.brand
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.danger + '44',
    backgroundColor: palette.dangerSoft
  },
  cancelText: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.danger
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  detailText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.brand
  }
})
