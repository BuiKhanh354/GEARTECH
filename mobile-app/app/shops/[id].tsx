import { FlatList, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { ProductGridSkeleton } from '../../components/Skeleton'
import { EmptyView, ErrorView } from '../../components/StateViews'
import { SectionHeader } from '../../components/ui'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'

// =============================================================================
// GIAN HÀNG / SHOP DETAIL (v2)
// - Header thông tin shop dạng card cao cấp (Avatar, Đánh giá, Người theo dõi)
// - Lưới sản phẩm 2 cột dùng ProductCard v2
// =============================================================================
export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()

  const shop = useQuery({
    queryKey: ['shop', id],
    queryFn: () => catalogService.getShopById(id as string),
    enabled: Boolean(id)
  })

  if (shop.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={{ padding: spacing.lg }}>
          <ProductGridSkeleton count={6} />
        </View>
      </SafeAreaView>
    )
  }

  if (shop.isError || !shop.data) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorView message="Không tải được thông tin gian hàng." onRetry={() => shop.refetch()} />
      </SafeAreaView>
    )
  }

  const s = shop.data.shop
  const name = s.name || s.shop_name || 'Gian hàng đối tác'

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={shop.data.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.shopHeaderWrapper}>
            <View style={[styles.shopHeaderCard, elevation.card]}>
              <View style={styles.shopAvatar}>
                <Text style={styles.shopAvatarText}>{name.slice(0, 1).toUpperCase()}</Text>
              </View>
              <Text style={styles.shopName}>{name}</Text>
              {s.category ? <Text style={styles.shopCategory}>{s.category}</Text> : null}

              <View style={styles.statsRow}>
                <View style={styles.statChip}>
                  <Ionicons name="star" size={13} color={palette.star} />
                  <Text style={styles.statText}>{Number(s.rating ?? 5).toFixed(1)}</Text>
                </View>
                <View style={styles.statChip}>
                  <Ionicons name="people-outline" size={13} color={palette.inkSoft} />
                  <Text style={styles.statText}>
                    {s.followersCount ?? Number(s.followers ?? 0)} theo dõi
                  </Text>
                </View>
                <View style={styles.statChip}>
                  <Ionicons name="cube-outline" size={13} color={palette.inkSoft} />
                  <Text style={styles.statText}>{shop.data.productsCount ?? 0} sản phẩm</Text>
                </View>
              </View>

              {s.description ? (
                <Text style={styles.shopDesc} numberOfLines={3}>
                  {s.description}
                </Text>
              ) : null}

              {s.address ? (
                <View style={styles.addressRow}>
                  <Ionicons name="location-outline" size={13} color={palette.muted} />
                  <Text style={styles.address} numberOfLines={1}>
                    {s.address}
                  </Text>
                </View>
              ) : null}
            </View>

            <View style={styles.sectionHeaderWrap}>
              <SectionHeader
                title="Sản phẩm đang bán"
                subtitle={`Tất cả ${shop.data.products?.length ?? 0} mặt hàng từ cửa hàng này`}
              />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item._id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyView
            icon="cube-outline"
            title="Chưa có sản phẩm"
            subtitle="Shop này hiện chưa có mặt hàng nào đang mở bán"
          />
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
    paddingBottom: spacing.xxxl
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg
  },
  shopHeaderWrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  shopHeaderCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg
  },
  shopAvatar: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    backgroundColor: palette.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: palette.brandSoft
  },
  shopAvatarText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900'
  },
  shopName: {
    ...type.h2,
    fontSize: 18,
    textAlign: 'center'
  },
  shopCategory: {
    ...type.caption,
    color: palette.muted,
    marginTop: 2
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.inkSoft
  },
  shopDesc: {
    ...type.body,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: 18,
    color: palette.muted
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm
  },
  address: {
    ...type.caption,
    color: palette.muted
  },
  sectionHeaderWrap: {
    marginTop: spacing.lg
  }
})
