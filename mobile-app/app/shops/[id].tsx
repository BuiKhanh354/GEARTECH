import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { colors, radius, spacing } from '../../constants/theme'

// Trang cửa hàng — GET /api/shops/:id (chỉ thông tin công khai: shop + sản phẩm đang bán)
export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const shop = useQuery({
    queryKey: ['shop', id],
    queryFn: () => catalogService.getShopById(id as string),
    enabled: Boolean(id)
  })

  if (shop.isLoading) return <LoadingView label="Đang tải gian hàng..." />
  if (shop.isError || !shop.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <ErrorView message="Không tải được gian hàng." onRetry={() => shop.refetch()} />
      </SafeAreaView>
    )
  }

  const s = shop.data.shop
  const name = s.name || s.shop_name || 'Gian hàng'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={shop.data.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.shopHeader}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>{name.slice(0, 1).toUpperCase()}</Text>
            </View>
            <Text style={styles.shopName}>{name}</Text>
            {s.category ? <Text style={styles.shopCategory}>{s.category}</Text> : null}

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Ionicons name="star" size={13} color="#f59e0b" />
                <Text style={styles.statText}>{Number(s.rating ?? 5).toFixed(1)}</Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="people-outline" size={13} color={colors.sub} />
                <Text style={styles.statText}>
                  {s.followersCount ?? Number(s.followers ?? 0)} theo dõi
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="cube-outline" size={13} color={colors.sub} />
                <Text style={styles.statText}>{shop.data.productsCount ?? 0} sản phẩm</Text>
              </View>
            </View>

            {s.description ? (
              <Text style={styles.shopDesc} numberOfLines={3}>{s.description}</Text>
            ) : null}
            {s.address ? (
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={12} color={colors.faint} />
                <Text style={styles.address} numberOfLines={1}>{s.address}</Text>
              </View>
            ) : null}

            <Text style={styles.sectionTitle}>Sản phẩm đang bán</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/products/${item._id}`)} />
        )}
        ListEmptyComponent={
          <EmptyView icon="cube-outline" title="Shop chưa có sản phẩm nào đang bán" />
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  list: { paddingBottom: 48 },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
  shopHeader: {
    backgroundColor: colors.card, alignItems: 'center',
    paddingVertical: spacing.xl, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.md
  },
  shopAvatar: {
    width: 64, height: 64, borderRadius: 16, backgroundColor: colors.ink,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10
  },
  shopAvatarText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  shopName: { fontSize: 17, fontWeight: '900', color: colors.ink },
  shopCategory: { fontSize: 11, color: colors.sub, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: 12 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: 11, fontWeight: '700', color: colors.sub },
  shopDesc: { fontSize: 12, color: colors.sub, lineHeight: 18, marginTop: 10, textAlign: 'center' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  address: { fontSize: 11, color: colors.faint },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: colors.ink,
    alignSelf: 'flex-start', marginTop: spacing.lg
  }
})
