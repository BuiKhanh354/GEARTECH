import { useState } from 'react'
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { palette, radius, spacing, elevation, type } from '../constants/theme'
import { PriceText } from './PriceText'
import type { Product } from '../types/api'

// ProductCard v2 — thành phần xuất hiện nhiều nhất trong app:
// - Ảnh tỷ lệ vuông thống nhất (aspectRatio 1), fallback khi ảnh lỗi/không có
// - Badge giảm giá tính từ oldPrice thật, overlay "Hết hàng" khi hết
// - Tên 2 dòng, giá nổi bật + giá gốc gạch ngang
// - Đánh giá + tên shop để quét thông tin nhanh
export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const [imgFailed, setImgFailed] = useState(false)
  const isImage = Boolean(product.imageEmoji && product.imageEmoji.startsWith('http')) && !imgFailed
  const soldOut = product.stock <= 0 || product.status === 'out_of_stock'
  const shopName = product.shopId && typeof product.shopId === 'object' ? product.shopId.name : undefined

  return (
    <TouchableOpacity
      style={[styles.card, elevation.card]}
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.imageWrap}>
        {isImage ? (
          <Image
            source={{ uri: product.imageEmoji }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <View style={styles.emojiWrap}>
            <Text style={styles.emoji}>{product.imageEmoji && !imgFailed ? product.imageEmoji : ''}</Text>
            <Ionicons name="image-outline" size={20} color={palette.borderStrong} />
          </View>
        )}

        {soldOut && (
          <View style={styles.outBadge}>
            <Text style={styles.outText}>Hết hàng</Text>
          </View>
        )}
        {!soldOut && product.stock <= 5 && (
          <View style={styles.lowBadge}>
            <Text style={styles.lowText}>Chỉ còn {product.stock}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <PriceText price={product.price} oldPrice={product.oldPrice} />

        <View style={styles.metaRow}>
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color={palette.star} />
            <Text style={styles.ratingText}>{Number(product.rating ?? 5).toFixed(1)}</Text>
          </View>
          {product.soldCount ? (
            <Text style={styles.sold}>Đã bán {product.soldCount}</Text>
          ) : (
            <Text style={styles.sold}>{product.categoryName ?? ''}</Text>
          )}
        </View>

        {shopName ? (
          <Text style={styles.shop} numberOfLines={1}>{shopName}</Text>
        ) : (
          <Text style={[styles.shop, styles.shopPlaceholder]} numberOfLines={1}> </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: 'hidden'
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: palette.surfaceAlt
  },
  image: { width: '100%', height: '100%' },
  emojiWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: palette.surfaceAlt
  },
  emoji: { fontSize: 34, color: palette.faint },
  outBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm
  },
  outText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  lowBadge: {
    position: 'absolute', bottom: 8, left: 8,
    backgroundColor: palette.warningSoft,
    borderWidth: 1, borderColor: palette.warning + '55',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm
  },
  lowText: { color: palette.warning, fontSize: 10, fontWeight: '700' },
  body: { padding: spacing.md, gap: spacing.xs },
  title: { fontSize: 12.5, fontWeight: '600', color: palette.ink, lineHeight: 17, minHeight: 34 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 10, fontWeight: '700', color: palette.inkSoft },
  sold: { fontSize: 10, color: palette.faint, flexShrink: 1 },
  shop: { fontSize: 10, fontWeight: '600', color: palette.muted, paddingTop: 2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: palette.border },
  shopPlaceholder: { color: 'transparent' }
})
