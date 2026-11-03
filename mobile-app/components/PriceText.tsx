import { StyleSheet, Text, View } from 'react-native'
import { formatPrice, palette, type } from '../constants/theme'

// Khối giá dùng chung: giá hiện tại + giá gốc + nhãn giảm giá (chỉ hiện khi có KM thật)
// size: 'card' (trong product card) | 'detail' (trang chi tiết)
export function PriceText({ price, oldPrice, size = 'card' }: {
  price: number
  oldPrice?: number
  size?: 'card' | 'detail'
}) {
  const hasDiscount = Boolean(oldPrice && oldPrice > price)
  const discountPct = hasDiscount ? Math.round(((oldPrice! - price) / oldPrice!) * 100) : 0

  if (size === 'detail') {
    return (
      <View style={styles.detailRow}>
        <Text style={styles.detailPrice}>{formatPrice(price)}</Text>
        {hasDiscount && (
          <>
            <Text style={styles.detailOld}>{formatPrice(oldPrice)}</Text>
            <View style={styles.detailBadge}>
              <Text style={styles.badgeText}>-{discountPct}%</Text>
            </View>
          </>
        )}
      </View>
    )
  }

  return (
    <View style={styles.cardCol}>
      <Text style={styles.cardPrice} numberOfLines={1}>{formatPrice(price)}</Text>
      {hasDiscount && (
        <View style={styles.cardRow}>
          <Text style={styles.cardOld}>{formatPrice(oldPrice)}</Text>
          <View style={styles.miniBadge}>
            <Text style={styles.miniBadgeText}>-{discountPct}%</Text>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  detailPrice: { fontSize: 23, fontWeight: '900', color: palette.brand, letterSpacing: 0.2 },
  detailOld: { ...type.priceOld },
  detailBadge: { backgroundColor: palette.brand, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardCol: { gap: 2 },
  cardPrice: { fontSize: 14, fontWeight: '900', color: palette.brand },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardOld: { ...type.priceOld, fontSize: 10 },
  miniBadge: { backgroundColor: palette.brandSoft, borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  miniBadgeText: { color: palette.brand, fontSize: 9, fontWeight: '800' }
})
