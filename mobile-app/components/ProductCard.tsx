import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, formatPrice, radius } from '../constants/theme'
import type { Product } from '../types/api'

// Thẻ sản phẩm dùng cho lưới trang chủ & danh sách tìm kiếm
// Hiển thị đúng các trường backend trả về: imageEmoji (URL ảnh hoặc emoji), giá, giá cũ, tồn kho, đánh giá
export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const isImage = Boolean(product.imageEmoji && product.imageEmoji.startsWith('http'))
  const hasDiscount = Boolean(product.oldPrice && product.oldPrice > product.price)

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.imageWrap}>
        {isImage ? (
          <Image source={{ uri: product.imageEmoji }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.emoji}>{product.imageEmoji || '📦'}</Text>
        )}
        {product.stock <= 0 && (
          <View style={styles.outBadge}>
            <Text style={styles.outText}>Hết hàng</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price} numberOfLines={1}>{formatPrice(product.price)}</Text>
        </View>
        {hasDiscount && (
          <Text style={styles.oldPrice}>{formatPrice(product.oldPrice)}</Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.rating}>
            <Ionicons name="star" size={11} color="#f59e0b" />
            <Text style={styles.ratingText}>{Number(product.rating ?? 5).toFixed(1)}</Text>
          </View>
          {product.shopId && typeof product.shopId === 'object' && product.shopId.name ? (
            <Text style={styles.shop} numberOfLines={1}>{product.shopId.name}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden'
  },
  imageWrap: {
    height: 110,
    backgroundColor: '#fafafa',
    alignItems: 'center',
    justifyContent: 'center'
  },
  image: { width: '100%', height: '100%' },
  emoji: { fontSize: 42 },
  outBadge: {
    position: 'absolute', bottom: 6, right: 6,
    backgroundColor: 'rgba(239,68,68,0.92)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6
  },
  outText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  body: { padding: 10, gap: 4 },
  title: { fontSize: 12, fontWeight: '600', color: colors.ink, lineHeight: 16, minHeight: 32 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  price: { fontSize: 13, fontWeight: '800', color: colors.primary, flexShrink: 1 },
  oldPrice: { fontSize: 10, color: colors.faint, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 10, fontWeight: '700', color: colors.sub },
  shop: { fontSize: 9, color: colors.faint, maxWidth: 80 }
})
