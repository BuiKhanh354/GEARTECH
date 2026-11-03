import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService, type ProductQuery } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { SearchBar } from '../../components/SearchBar'
import { ProductGridSkeleton } from '../../components/Skeleton'
import { EmptyView, ErrorView } from '../../components/StateViews'
import { palette, radius, spacing, type } from '../../constants/theme'

// =============================================================================
// TÌM KIẾM & BỘ LỌC SẢN PHẨM (v2)
// - SearchBar mới (focus ring, nút xóa & gửi)
// - Bộ lọc sắp xếp dạng pill mượt mà
// - Lưới 2 cột đồng bộ với trang chủ + ProductGridSkeleton
// =============================================================================
export default function ProductSearchScreen() {
  const params = useLocalSearchParams<{ search?: string; category?: string }>()

  const [searchText, setSearchText] = useState(params.search ?? '')
  const [query, setQuery] = useState<ProductQuery>({
    search: params.search,
    category: params.category,
    limit: 12,
    page: 1
  })
  const [sortBy, setSortBy] = useState<string>('popular')

  useEffect(() => {
    setQuery((q) => ({ ...q, search: params.search, category: params.category, page: 1 }))
    if (params.search !== undefined) setSearchText(params.search)
  }, [params.search, params.category])

  const products = useQuery({
    queryKey: ['products', 'search', query, sortBy],
    queryFn: () => catalogService.getProducts({ ...query, sortBy: sortBy as ProductQuery['sortBy'] })
  })

  const submit = () => {
    setQuery((q) => ({ ...q, search: searchText.trim() || undefined, page: 1 }))
  }

  const loadMore = () => {
    const totalPages = products.data?.totalPages ?? 1
    if (products.isFetching || (query.page ?? 1) >= totalPages) return
    setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))
  }

  const SORTS = [
    { key: 'popular', label: 'Nổi bật' },
    { key: 'newest', label: 'Mới nhất' },
    { key: 'priceAsc', label: 'Giá tăng dần' },
    { key: 'priceDesc', label: 'Giá giảm dần' }
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Thanh tìm kiếm */}
      <View style={styles.top}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          onSubmit={submit}
          placeholder="Tìm sản phẩm, thương hiệu..."
        />
      </View>

      {/* Dải chip sắp xếp */}
      <View style={styles.sortRow}>
        {SORTS.map((s) => {
          const active = sortBy === s.key
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortChip, active && styles.sortChipActive]}
              activeOpacity={0.7}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.sortText, active && styles.sortTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Số lượng kết quả */}
      {products.data?.total !== undefined && !products.isLoading ? (
        <View style={styles.resultInfoRow}>
          <Text style={styles.resultInfoText}>
            Tìm thấy <Text style={{ color: palette.brand, fontWeight: '800' }}>{products.data.total}</Text> sản phẩm
            {query.search ? ` cho "${query.search}"` : ''}
          </Text>
        </View>
      ) : null}

      <FlatList
        data={products.data?.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={products.isRefetching}
            tintColor={palette.brand}
            colors={[palette.brand]}
            onRefresh={() => {
              products.refetch()
            }}
          />
        }
        ListFooterComponent={
          products.isFetching && (query.page ?? 1) > 1 ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator size="small" color={palette.brand} />
              <Text style={styles.footerLoadingText}>Đang tải thêm sản phẩm...</Text>
            </View>
          ) : undefined
        }
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => router.push(`/products/${item._id}`)}
          />
        )}
        ListEmptyComponent={
          products.isLoading ? (
            <ProductGridSkeleton count={6} />
          ) : products.isError ? (
            <ErrorView
              message="Không tải được kết quả tìm kiếm"
              onRetry={() => products.refetch()}
            />
          ) : (
            <EmptyView
              icon="search-outline"
              title="Không tìm thấy sản phẩm"
              subtitle="Hãy thử tìm với từ khóa khác hoặc bỏ chọn bộ lọc"
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
  top: {
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm
  },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: palette.surface,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: palette.surfaceAlt,
    borderWidth: 1,
    borderColor: palette.border
  },
  sortChipActive: {
    backgroundColor: palette.brand,
    borderColor: palette.brand
  },
  sortText: {
    fontSize: 11,
    fontWeight: '700',
    color: palette.muted
  },
  sortTextActive: {
    color: '#ffffff'
  },
  resultInfoRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 2
  },
  resultInfoText: {
    ...type.caption,
    color: palette.muted
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl
  },
  gridRow: {
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  footerLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.lg
  },
  footerLoadingText: {
    ...type.caption,
    color: palette.muted
  }
})
