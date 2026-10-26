import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { catalogService } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { colors, radius, spacing } from '../../constants/theme'
import type { Category } from '../../types/api'

type ChipItem = { _id: string; name: string; slug?: string; icon?: string }

// Tab Danh mục: chọn danh mục -> xem sản phẩm thuộc danh mục (API thật, phân trang)
export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ category?: string }>()

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories()
  })

  const [selected, setSelected] = useState<string | undefined>(params.category)

  useEffect(() => {
    if (params.category) setSelected(params.category)
  }, [params.category])

  const products = useQuery({
    queryKey: ['products', 'by-category', selected ?? 'all'],
    queryFn: () => catalogService.getProducts({ category: selected, limit: 20 })
  })

  const pickCategory = (slug: string | undefined) => {
    setSelected(slug)
  }

  const renderItemCat = ({ item }: { item: ChipItem }) => {
    const active = selected === item.slug
    return (
      <TouchableOpacity
        style={[styles.catChip, active && styles.catChipActive]}
        onPress={() => pickCategory(item.slug)}
      >
        <Text style={styles.catIcon}>{item.icon || '📦'}</Text>
        <Text style={[styles.catName, active && { color: colors.primary }]} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
        <TouchableOpacity onPress={() => router.push('/products')}>
          <Text style={styles.searchLink}>Tìm kiếm nâng cao</Text>
        </TouchableOpacity>
      </View>

      {categories.isLoading ? (
        <LoadingView label="Đang tải danh mục..." />
      ) : categories.isError ? (
        <ErrorView message="Không tải được danh mục" onRetry={() => categories.refetch()} />
      ) : (categories.data?.length ?? 0) === 0 ? (
        <EmptyView icon="grid-outline" title="Chưa có danh mục nào" subtitle="Admin chưa cấu hình danh mục trên sàn" />
      ) : (
        <FlatList
          data={products.data?.products ?? []}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={products.isRefetching} onRefresh={() => { products.refetch() }} />}
          ListHeaderComponent={
            <View style={{ marginBottom: spacing.md }}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ _id: 'all', name: 'Tất cả', slug: undefined, icon: '⚡' } as ChipItem, ...(categories.data ?? [])]}
                keyExtractor={(item) => item._id}
                renderItem={renderItemCat}
                contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
              />
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => router.push(`/products/${item._id}`)} />
          )}
          ListEmptyComponent={
            products.isLoading ? (
              <LoadingView label="Đang tải sản phẩm..." />
            ) : products.isError ? (
              <ErrorView message="Không tải được sản phẩm" onRetry={() => products.refetch()} />
            ) : (
              <EmptyView icon="cube-outline" title="Chưa có sản phẩm trong danh mục này" />
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.ink },
  searchLink: { fontSize: 12, fontWeight: '700', color: colors.primary },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  catChip: {
    width: 88,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  catChipActive: { borderColor: colors.primary, backgroundColor: '#fff1f2' },
  catIcon: { fontSize: 22 },
  catName: { fontSize: 10, fontWeight: '600', color: colors.ink, textAlign: 'center', marginTop: 4 }
})
