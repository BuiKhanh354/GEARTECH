import { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { useCartStore } from '../../store/cartStore'
import { ProductCard } from '../../components/ProductCard'
import { SearchBar } from '../../components/SearchBar'
import { ProductGridSkeleton, Skeleton } from '../../components/Skeleton'
import { EmptyView, ErrorView } from '../../components/StateViews'
import { SectionHeader } from '../../components/ui'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'

// =============================================================================
// TRANG CHỦ — GEARTECH MOBILE (v2)
// - Brand Header + Quick Cart button (có badge số lượng)
// - SearchBar mới (focus ring, nút xóa & gửi)
// - Danh mục ngang dạng tile tinh tế + skeleton khi loading
// - Lưới 2 cột sản phẩm mới dùng ProductCard v2 + ProductGridSkeleton
// =============================================================================
export default function HomeScreen() {
  const [search, setSearch] = useState('')
  const cartTotalQty = useCartStore((s) => s.cartCount)

  // GET /api/products — sản phẩm mới nhất (sortBy=newest)
  const newest = useQuery({
    queryKey: ['products', 'home-newest'],
    queryFn: () => catalogService.getProducts({ limit: 8, sortBy: 'newest' })
  })

  // GET /api/categories — danh mục đang hoạt động
  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories()
  })

  const submitSearch = () => {
    if (search.trim()) {
      router.push({ pathname: '/products', params: { search: search.trim() } })
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header thương hiệu + Tìm kiếm */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View>
            <Text style={styles.brand}>
              GEAR<Text style={{ color: palette.brand }}>TECH</Text>
            </Text>
            <Text style={styles.tagline}>Máy tính & linh kiện chính hãng</Text>
          </View>

          {/* Nút giỏ hàng nhanh */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/(tabs)/cart')}
            hitSlop={6}
          >
            <Ionicons name="cart-outline" size={20} color={palette.ink} />
            {cartTotalQty > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartTotalQty > 99 ? '99+' : cartTotalQty}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        <View style={styles.searchWrap}>
          <SearchBar
            value={search}
            onChangeText={setSearch}
            onSubmit={submitSearch}
            placeholder="Tìm linh kiện, laptop, PC gaming..."
          />
        </View>
      </View>

      <FlatList
        data={newest.data?.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={newest.isRefetching}
            tintColor={palette.brand}
            colors={[palette.brand]}
            onRefresh={() => {
              newest.refetch()
              categories.refetch()
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerList}>
            {/* Mục: Danh mục sản phẩm */}
            <SectionHeader
              title="Danh mục"
              subtitle="Khám phá theo nhóm phần cứng"
              actionLabel="Xem tất cả"
              onAction={() => router.push('/(tabs)/categories')}
            />

            {categories.isLoading ? (
              <View style={styles.catSkeletonRow}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <View key={i} style={styles.catSkeletonTile}>
                    <Skeleton style={{ width: 42, height: 42, borderRadius: radius.md }} />
                    <Skeleton style={{ width: 50, height: 10, borderRadius: 4, marginTop: 6 }} />
                  </View>
                ))}
              </View>
            ) : categories.isError ? (
              <ErrorView
                message="Không tải được danh mục"
                onRetry={() => categories.refetch()}
              />
            ) : (categories.data?.length ?? 0) === 0 ? (
              <EmptyView icon="grid-outline" title="Chưa có danh mục nào" />
            ) : (
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={categories.data}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.catListContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.catCard, elevation.card]}
                    activeOpacity={0.7}
                    onPress={() =>
                      router.push({
                        pathname: '/(tabs)/categories',
                        params: { category: item.slug }
                      })
                    }
                  >
                    <View style={styles.catIconWrap}>
                      <Text style={styles.catIcon}>{item.icon || '📦'}</Text>
                    </View>
                    <Text style={styles.catName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {/* Mục: Sản phẩm mới */}
            <View style={{ marginTop: spacing.md }}>
              <SectionHeader
                title="Sản phẩm mới"
                subtitle="Hàng mới về, nguyên seal chính hãng"
                actionLabel="Xem tất cả"
                onAction={() => router.push('/products')}
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
          newest.isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : newest.isError ? (
            <ErrorView
              message={newest.error?.message || 'Không tải được sản phẩm. Kiểm tra kết nối.'}
              onRetry={() => newest.refetch()}
            />
          ) : (
            <EmptyView
              icon="cube-outline"
              title="Chưa có sản phẩm nào"
              subtitle="Sàn hiện chưa có sản phẩm đang mở bán"
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
  header: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  brand: {
    ...type.h1,
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 0.8
  },
  tagline: {
    fontSize: 11,
    color: palette.muted,
    marginTop: 1
  },
  cartButton: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: palette.brand,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800'
  },
  searchWrap: {
    marginTop: 2
  },
  headerList: {
    paddingTop: spacing.md
  },
  catSkeletonRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  catSkeletonTile: {
    width: 82,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: palette.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.border
  },
  catListContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xs
  },
  catCard: {
    width: 84,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    alignItems: 'center'
  },
  catIconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs
  },
  catIcon: {
    fontSize: 22
  },
  catName: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 14
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  }
})
