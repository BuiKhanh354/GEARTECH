import { useState } from 'react'
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { cartService } from '../../services/cartService'
import { PriceText } from '../../components/PriceText'
import { ErrorView, LoadingView } from '../../components/StateViews'
import { Card, PrimaryButton } from '../../components/ui'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'
import { useAuthStore } from '../../store/authStore'

// =============================================================================
// CHI TIẾT SẢN PHẨM (v2)
// - Ảnh tỷ lệ vuông thống nhất + fallback khi lỗi
// - PriceText size="detail" chuẩn hóa hiển thị giá & badge giảm thật
// - Nhóm meta chip: Đánh giá, Tình trạng tồn kho, Đã bán, Thương hiệu
// - Card thông tin cửa hàng riêng biệt
// - Thanh mua hàng nổi (elevation.float) với bộ chọn số lượng bo tròn
// =============================================================================
export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const token = useAuthStore((s) => s.token)
  const queryClient = useQueryClient()
  const [quantity, setQuantity] = useState(1)
  const [imgFailed, setImgFailed] = useState(false)

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
        { text: 'Ở lại trang', style: 'cancel' },
        { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') }
      ])
    },
    onError: (err: Error) => Alert.alert('Không thể thêm vào giỏ', err.message)
  })

  if (product.isLoading) return <LoadingView label="Đang tải chi tiết sản phẩm..." />
  if (product.isError || !product.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Không tải được thông tin sản phẩm." onRetry={() => product.refetch()} />
      </SafeAreaView>
    )
  }

  const p = product.data
  const isImage = Boolean(p.imageEmoji && p.imageEmoji.startsWith('http')) && !imgFailed
  const shopName = p.shopId && typeof p.shopId === 'object' ? p.shopId.name : undefined
  const shopId = p.shopId && typeof p.shopId === 'object' ? p.shopId._id : undefined
  const canBuy = p.status === 'active' && p.stock > 0

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Ảnh đại diện tỷ lệ vuông */}
        <View style={styles.imageWrap}>
          {isImage ? (
            <Image
              source={{ uri: p.imageEmoji }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <View style={styles.emojiFallback}>
              <Text style={styles.emoji}>{p.imageEmoji && !imgFailed ? p.imageEmoji : ''}</Text>
              <Ionicons name="image-outline" size={40} color={palette.faint} />
              <Text style={styles.fallbackText}>GearTech Certified Product</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          {/* Card chính: Tên, Giá, Meta */}
          <Card style={styles.mainCard}>
            <Text style={styles.title}>{p.title}</Text>
            <PriceText price={p.price} oldPrice={p.oldPrice} size="detail" />

            <View style={styles.metaChipsRow}>
              {/* Đánh giá */}
              <View style={styles.chip}>
                <Ionicons name="star" size={13} color={palette.star} />
                <Text style={styles.chipText}>{Number(p.rating ?? 5).toFixed(1)}</Text>
              </View>

              {/* Tồn kho */}
              <View style={[styles.chip, canBuy ? styles.chipSuccess : styles.chipDanger]}>
                <Ionicons
                  name={canBuy ? 'checkmark-circle-outline' : 'alert-circle-outline'}
                  size={13}
                  color={canBuy ? palette.success : palette.danger}
                />
                <Text style={[styles.chipText, { color: canBuy ? palette.success : palette.danger }]}>
                  {p.stock > 0 ? `Còn ${p.stock} sản phẩm` : 'Hết hàng'}
                </Text>
              </View>

              {/* Đã bán */}
              {p.soldCount ? (
                <View style={styles.chip}>
                  <Ionicons name="flash-outline" size={13} color={palette.brand} />
                  <Text style={styles.chipText}>Đã bán {p.soldCount}</Text>
                </View>
              ) : null}

              {/* Thương hiệu */}
              {p.brand ? (
                <View style={styles.chip}>
                  <Ionicons name="pricetag-outline" size={12} color={palette.muted} />
                  <Text style={styles.chipText}>{p.brand}</Text>
                </View>
              ) : null}
            </View>
          </Card>

          {/* Card gian hàng */}
          {shopName ? (
            <TouchableOpacity
              style={[styles.shopCard, elevation.card]}
              activeOpacity={0.8}
              onPress={() => shopId && router.push(`/shops/${shopId}`)}
            >
              <View style={styles.shopAvatar}>
                <Ionicons name="storefront-outline" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopName}>{shopName}</Text>
                <Text style={styles.shopSub}>Nhà phân phối được xác thực</Text>
              </View>
              <View style={styles.shopAction}>
                <Text style={styles.shopActionText}>Xem shop</Text>
                <Ionicons name="chevron-forward" size={14} color={palette.brand} />
              </View>
            </TouchableOpacity>
          ) : null}

          {/* Mô tả sản phẩm */}
          <Card style={styles.descCard}>
            <Text style={styles.sectionTitle}>Mô tả & Thông số kỹ thuật</Text>
            <Text style={styles.description}>{p.description}</Text>
            {p.sku ? <Text style={styles.sku}>Mã SKU: {p.sku}</Text> : null}
          </Card>
        </View>
      </ScrollView>

      {/* Thanh đặt hàng nổi ở đáy màn hình */}
      {canBuy ? (
        <View style={[styles.buyBar, elevation.float]}>
          <View style={styles.qtyStepper}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              hitSlop={6}
            >
              <Ionicons name="remove" size={16} color={palette.ink} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => setQuantity(Math.min(p.stock, quantity + 1))}
              hitSlop={6}
            >
              <Ionicons name="add" size={16} color={palette.ink} />
            </TouchableOpacity>
          </View>

          {token ? (
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label="Thêm vào giỏ hàng"
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
                variant="dark"
                onPress={() => router.push('/auth/login')}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={[styles.buyBar, elevation.float]}>
          <View style={styles.outBox}>
            <Ionicons name="ban-outline" size={16} color={palette.danger} />
            <Text style={styles.outText}>
              {p.stock <= 0 ? 'Sản phẩm tạm thời hết hàng' : 'Sản phẩm đang ngừng kinh doanh'}
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.surface
  },
  scroll: {
    backgroundColor: palette.bg,
    paddingBottom: spacing.xxl
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1.15,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  image: {
    width: '100%',
    height: '100%'
  },
  emojiFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: palette.surfaceAlt,
    width: '100%'
  },
  emoji: {
    fontSize: 56
  },
  fallbackText: {
    ...type.caption,
    color: palette.faint
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md
  },
  mainCard: {
    gap: spacing.sm
  },
  title: {
    ...type.h2,
    fontSize: 18,
    lineHeight: 25
  },
  metaChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: 2
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  chipSuccess: {
    backgroundColor: palette.successSoft
  },
  chipDanger: {
    backgroundColor: palette.dangerSoft
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.inkSoft
  },
  shopCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md
  },
  shopAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center'
  },
  shopName: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.ink
  },
  shopSub: {
    ...type.caption,
    marginTop: 1
  },
  shopAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2
  },
  shopActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: palette.brand
  },
  descCard: {
    gap: spacing.sm
  },
  sectionTitle: {
    ...type.h3,
    fontSize: 15
  },
  description: {
    ...type.body,
    lineHeight: 21
  },
  sku: {
    ...type.caption,
    color: palette.faint,
    marginTop: 4
  },
  buyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border
  },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: palette.border
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '800',
    color: palette.ink,
    minWidth: 20,
    textAlign: 'center'
  },
  outBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: palette.dangerSoft,
    borderRadius: radius.md
  },
  outText: {
    fontSize: 13,
    fontWeight: '800',
    color: palette.danger
  }
})
