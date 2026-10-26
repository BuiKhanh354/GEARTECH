import { useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { cartService } from '../../services/cartService'
import { ErrorView, LoadingView } from '../../components/StateViews'
import { PrimaryButton } from '../../components/ui'
import { colors, formatPrice, radius, spacing } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'

// Chi tiết sản phẩm — GET /api/products/:id (dữ liệu thật: giá, tồn kho, shop)
// Chỉ cho thêm vào giỏ khi sản phẩm đang bán và còn tồn kho
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)

  const product = useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogService.getProductById(id as string),
    enabled: Boolean(id)
  })

  const addToCart = useMutation({
    mutationFn: () => cartService.addItem(id as string, quantity),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      Alert.alert('Thành công', res.message, [
        { text: 'Ở lại', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') }
      ])
    },
    onError: (err: Error) => Alert.alert('Không thể thêm vào giỏ', err.message)
  })

  if (product.isLoading) return <LoadingView label="Đang tải sản phẩm..." />
  if (product.isError || !product.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Không tải được sản phẩm." onRetry={() => product.refetch()} />
      </SafeAreaView>
    )
  }

  const p = product.data
  const isImage = Boolean(p.imageEmoji && p.imageEmoji.startsWith('http'))
  const shopName = p.shopId && typeof p.shopId === 'object' ? p.shopId.name : undefined
  const shopId = p.shopId && typeof p.shopId === 'object' ? p.shopId._id : undefined
  const canBuy = p.status === 'active' && p.stock > 0

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} bounces>
        {/* Ảnh */}
        <View style={styles.imageWrap}>
          {isImage ? (
            <Image source={{ uri: p.imageEmoji }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.emoji}>{p.imageEmoji || '📦'}</Text>
          )}
        </View>

        <View style={styles.body}>
          {/* Tên + giá */}
          <Text style={styles.title}>{p.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatPrice(p.price)}</Text>
            {p.oldPrice && p.oldPrice > p.price ? (
              <Text style={styles.oldPrice}>{formatPrice(p.oldPrice)}</Text>
            ) : null}
            {p.discount ? (
              <View style={styles.discountBadge}><Text style={styles.discountText}>{p.discount}</Text></View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={13} color="#f59e0b" />
              <Text style={styles.metaText}>{Number(p.rating ?? 5).toFixed(1)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="cube-outline" size={13} color={colors.sub} />
              <Text style={[styles.metaText, { color: canBuy ? colors.success : colors.danger }]}>
                {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : 'Hết hàng'}
              </Text>
            </View>
            {p.soldCount ? (
              <View style={styles.metaItem}>
                <Ionicons name="flame-outline" size={13} color={colors.primary} />
                <Text style={styles.metaText}>Đã bán {p.soldCount}</Text>
              </View>
            ) : null}
          </View>

          {/* Shop */}
          {shopName ? (
            <TouchableOpacity
              style={styles.shopCard}
              onPress={() => shopId && router.push(`/shops/${shopId}`)}
            >
              <View style={styles.shopIcon}>
                <Text style={styles.shopIconText}>{(shopName || 'S').slice(0, 1)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{shopName}</Text>
                <Text style={styles.shopSub}>Xem gian hàng</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.faint} />
            </TouchableOpacity>
          ) : null}

          {/* Mô tả */}
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>{p.description}</Text>

          {p.sku ? <Text style={styles.sku}>Mã sản phẩm: {p.sku}</Text> : null}
        </View>
      </ScrollView>

      {/* Thanh mua hàng — chỉ hiển thị với sản phẩm đang bán */}
      {canBuy ? (
        <View style={styles.buyBar}>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
              <Ionicons name="remove" size={16} color={colors.ink} />
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.min(p.stock, quantity + 1))}
            >
              <Ionicons name="add" size={16} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {token ? (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Thêm vào giỏ"
                icon="cart-outline"
                onPress={() => addToCart.mutate()}
                loading={addToCart.isPending}
              />
            </View>
          ) : (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Đăng nhập để mua"
                icon="log-in-outline"
                onPress={() => router.push('/auth/login')}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.buyBar}>
          <View style={styles.outBox}>
            <Ionicons name="ban-outline" size={15} color={colors.danger} />
            <Text style={styles.outText}>
              {p.stock <= 0 ? 'Sản phẩm đã hết hàng' : 'Sản phẩm đang ngừng bán'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  scroll: { backgroundColor: colors.bg, paddingBottom: 24 },
  imageWrap: { height: 260, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 96 },
  body: { padding: spacing.lg, gap: spacing.sm },
  title: { fontSize: 17, fontWeight: '800', color: colors.ink, lineHeight: 24 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  price: { fontSize: 22, fontWeight: '900', color: colors.primary },
  oldPrice: { fontSize: 13, color: colors.faint, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  discountText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  metaRow: { flexDirection: 'row', gap: spacing.md, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '600', color: colors.sub },
  shopCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xs
  },
  shopIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center'
  },
  shopIconText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  shopName: { fontSize: 13, fontWeight: '700', color: colors.ink },
  shopSub: { fontSize: 10, color: colors.sub },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.ink, marginTop: spacing.sm },
  description: { fontSize: 13, color: colors.sub, lineHeight: 20 },
  sku: { fontSize: 11, color: colors.faint },
  buyBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.card, padding: spacing.md,
    borderTopWidth: 1, borderTopColor: colors.border
  },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 32, height: 32, borderRadius: 8, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center'
  },
  qty: { fontSize: 16, fontWeight: '800', color: colors.ink, minWidth: 24, textAlign: 'center' },
  outBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12 },
  outText: { fontSize: 13, fontWeight: '700', color: colors.danger }
})
