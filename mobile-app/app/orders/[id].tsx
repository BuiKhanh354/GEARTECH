import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { orderService } from '../../services/orderService'
import { ErrorView, LoadingView } from '../../components/StateViews'
import { Card, OrderStatusBadge } from '../../components/ui'
import { elevation, formatPrice, palette, radius, spacing, type } from '../../constants/theme'
import type { OrderItem } from '../../types/api'

// Các bước tiến trình đơn hàng
const ORDER_STEPS = [
  { key: 'pending', label: 'Đặt hàng' },
  { key: 'confirmed', label: 'Xác nhận' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'completed', label: 'Hoàn thành' }
]

// =============================================================================
// CHI TIẾT ĐƠN HÀNG (v2)
// - Timeline tiến trình trạng thái 4 bước (hoặc Đã hủy)
// - Danh sách mặt hàng chi tiết
// - Khối thông tin người nhận, thanh toán và tổng thanh toán
// =============================================================================
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const order = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id as string),
    enabled: Boolean(id)
  })

  if (order.isLoading) return <LoadingView label="Đang tải chi tiết đơn hàng..." />
  if (order.isError || !order.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView
          message="Không tìm thấy đơn hàng hoặc đơn không thuộc tài khoản của bạn."
          onRetry={() => order.refetch()}
        />
      </SafeAreaView>
    )
  }

  const o = order.data
  const status = o.orderStatus ?? o.order_status ?? 'pending'
  const isCancelled = status === 'cancelled'
  const items: OrderItem[] = o.detailedItems?.length ? o.detailedItems : o.items ?? []
  const total = o.finalAmount ?? Number(o.final_amount?.toString?.() ?? 0)
  const subtotal = o.totalAmount ?? total

  // Tính bước hiện tại trong timeline (0-3)
  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.key === status)
  const activeStep = currentStepIdx === -1 ? 0 : currentStepIdx

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Card: Thông tin trạng thái & Timeline */}
        <Card style={styles.card}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.codeLabel}>Mã đơn hàng</Text>
              <Text style={styles.code}>#{o._id.slice(-8).toUpperCase()}</Text>
            </View>
            <OrderStatusBadge status={status} />
          </View>
          <Text style={styles.date}>
            Thời gian đặt: {o.created_at ? new Date(o.created_at).toLocaleString('vi-VN') : ''}
          </Text>

          {(o.trackingCode || o.tracking_code) ? (
            <View style={styles.ghnTag}>
              <Ionicons name="cube-outline" size={13} color={palette.brand} />
              <Text style={styles.ghnCarrier}>GHN Express:</Text>
              <Text style={styles.ghnTrackingCode}>#{o.trackingCode || o.tracking_code}</Text>
            </View>
          ) : null}

          {/* Timeline trạng thái */}
          {isCancelled ? (
            <View style={styles.cancelledBox}>
              <Ionicons name="close-circle" size={16} color={palette.danger} />
              <Text style={styles.cancelledText}>Đơn hàng này đã bị hủy bỏ</Text>
            </View>
          ) : (
            <View style={styles.timeline}>
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= activeStep
                const isCurrent = idx === activeStep
                return (
                  <View key={step.key} style={styles.timelineStep}>
                    <View style={styles.stepIndicatorRow}>
                      <View
                        style={[
                          styles.stepDot,
                          isPassed && styles.stepDotPassed,
                          isCurrent && styles.stepDotCurrent
                        ]}
                      >
                        {isPassed ? (
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        ) : null}
                      </View>
                      {idx < ORDER_STEPS.length - 1 ? (
                        <View
                          style={[
                            styles.stepLine,
                            idx < activeStep && styles.stepLinePassed
                          ]}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        isPassed && styles.stepLabelPassed,
                        isCurrent && styles.stepLabelCurrent
                      ]}
                    >
                      {step.label}
                    </Text>
                  </View>
                )
              })}
            </View>
          )}
        </Card>

        {/* Card: Danh sách sản phẩm trong đơn */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube-outline" size={16} color={palette.brand} />
            <Text style={styles.sectionTitle}>Sản phẩm trong đơn ({items.length})</Text>
          </View>

          {items.map((it, idx) => {
            const name =
              it.product_name ??
              it.title ??
              (typeof it.product_id === 'object' ? it.product_id?.title : undefined) ??
              'Linh kiện phần cứng'
            const qty = it.quantity ?? it.qty ?? 1
            const price = it.unit_price ?? it.price ?? 0

            return (
              <View key={idx} style={styles.itemRow}>
                <View style={styles.itemThumb}>
                  <Text style={{ fontSize: 18 }}>💻</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {name}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatPrice(Number(price))} × {qty}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatPrice(Number(price) * Number(qty))}
                </Text>
              </View>
            )
          })}
        </Card>

        {/* Card: Thông tin giao nhận & Thanh toán */}
        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={16} color={palette.brand} />
            <Text style={styles.sectionTitle}>Thông tin giao hàng & Thanh toán</Text>
          </View>

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Địa chỉ nhận hàng</Text>
            <Text style={styles.address}>
              {o.shipping_address ?? o.shippingAddress?.detailAddress ?? '—'}
            </Text>
            {o.shippingAddress?.receiverName ? (
              <Text style={styles.receiver}>
                Người nhận: {o.shippingAddress.receiverName} · {o.shippingAddress.receiverPhone}
              </Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Hình thức thanh toán</Text>
            <Text style={styles.paymentMethod}>
              {(o.paymentMethod ?? o.payment_method ?? 'COD') === 'COD'
                ? 'Thanh toán tiền mặt khi nhận hàng (COD)'
                : 'Chuyển khoản qua ngân hàng'}
            </Text>
            <Text style={styles.paymentStatus}>
              Trạng thái:{' '}
              {(o.paymentStatus ?? o.payment_status ?? 'pending') === 'paid'
                ? 'Đã hoàn tất thanh toán'
                : 'Chờ thanh toán khi nhận hàng'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.sumLabel}>Tạm tính</Text>
            <Text style={styles.sumValue}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={[styles.rowBetween, { marginTop: 4 }]}>
            <Text style={styles.sumLabelBold}>Tổng thanh toán</Text>
            <Text style={styles.sumTotal}>{formatPrice(total)}</Text>
          </View>
        </Card>
      </ScrollView>
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
    paddingBottom: spacing.xxxl,
    gap: spacing.md
  },
  card: {
    gap: spacing.xs
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  codeLabel: {
    ...type.caption,
    color: palette.muted
  },
  code: {
    fontSize: 16,
    fontWeight: '900',
    color: palette.ink,
    letterSpacing: 0.5
  },
  date: {
    ...type.caption,
    color: palette.faint,
    marginTop: 2
  },
  ghnTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.brandSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginTop: 6,
    alignSelf: 'flex-start'
  },
  ghnCarrier: {
    fontSize: 11,
    fontWeight: '800',
    color: palette.brand
  },
  ghnTrackingCode: {
    fontSize: 11,
    fontWeight: '900',
    color: palette.brand,
    letterSpacing: 0.5
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.dangerSoft,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.md
  },
  cancelledText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.danger
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xs
  },
  timelineStep: {
    flex: 1,
    alignItems: 'center'
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: palette.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  },
  stepDotPassed: {
    backgroundColor: palette.brand
  },
  stepDotCurrent: {
    borderWidth: 3,
    borderColor: palette.brandSoft,
    backgroundColor: palette.brand
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: palette.border,
    marginHorizontal: -2,
    zIndex: 1
  },
  stepLinePassed: {
    backgroundColor: palette.brand
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: palette.faint,
    marginTop: 6,
    textAlign: 'center'
  },
  stepLabelPassed: {
    color: palette.inkSoft,
    fontWeight: '700'
  },
  stepLabelCurrent: {
    color: palette.brand,
    fontWeight: '800'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    marginBottom: spacing.xs
  },
  sectionTitle: {
    ...type.h3,
    fontSize: 14
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: palette.border
  },
  itemName: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.ink,
    lineHeight: 16
  },
  itemMeta: {
    ...type.caption,
    color: palette.muted
  },
  itemTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.ink
  },
  infoBlock: {
    gap: 3,
    paddingVertical: 2
  },
  infoLabel: {
    ...type.caption,
    fontWeight: '800',
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  address: {
    ...type.body,
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink
  },
  receiver: {
    ...type.caption,
    color: palette.muted,
    marginTop: 2
  },
  paymentMethod: {
    ...type.body,
    fontSize: 13,
    fontWeight: '600',
    color: palette.ink
  },
  paymentStatus: {
    ...type.caption,
    color: palette.muted
  },
  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: spacing.sm
  },
  sumLabel: {
    ...type.body,
    color: palette.muted
  },
  sumValue: {
    ...type.body,
    fontWeight: '700',
    color: palette.ink
  },
  sumLabelBold: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.ink
  },
  sumTotal: {
    fontSize: 18,
    fontWeight: '900',
    color: palette.brand
  }
})
