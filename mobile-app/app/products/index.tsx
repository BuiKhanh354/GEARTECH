import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useLocalSearchParams, router } from 'expo-router'
import { catalogService, type ProductQuery } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { colors, spacing } from '../../constants/theme'

// Tìm kiếm & duyệt sản phẩm — GET /api/products với search/sort + phân trang vô hạn
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
    { key: 'priceAsc', label: 'Giá thấp' },
    { key: 'priceDesc', label: 'Giá cao' },
    { key: 'newest', label: 'Mới nhất' }
  ]

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Thanh tìm kiếm + sắp xếp */}
      <View style={styles.top}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.faint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sản phẩm..."
            placeholderTextColor={colors.faint}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={submit}
            returnKeyType="search"
          />
        </View>
      </View>
      <View style={styles.sortRow}>
        {SORTS.map((s) => (
          <TouchableOpacity
            key={s.key}
            style={[styles.sortChip, sortBy === s.key && styles.sortChipActive]}
            onPress={() => setSortBy(s.key)}
          >
            <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={products.data?.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={products.isRefetching} onRefresh={() => { products.refetch() }} />}
        ListFooterComponent={
          products.isFetching && (query.page ?? 1) > 1 ? <LoadingView label="Đang tải thêm..." /> : undefined
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/products/${item._id}`)} />
        )}
        ListEmptyComponent={
          products.isLoading ? (
            <LoadingView label="Đang tìm kiếm..." />
          ) : products.isError ? (
            <ErrorView message="Không tải được sản phẩm" onRetry={() => products.refetch()} />
          ) : (
            <EmptyView
              icon="search-outline"
              title="Không tìm thấy sản phẩm"
              subtitle="Thử từ khóa khác hoặc xóa bộ lọc"
            />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  top: { backgroundColor: colors.card, paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: colors.bg, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },
  sortRow: {
    flexDirection: 'row', gap: 8, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, backgroundColor: colors.card,
    borderBottomWidth: 1, borderBottomColor: colors.border
  },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border
  },
  sortChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  sortText: { fontSize: 11, fontWeight: '700', color: colors.sub },
  sortTextActive: { color: '#fff' },
  list: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: 48 },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm }
})
