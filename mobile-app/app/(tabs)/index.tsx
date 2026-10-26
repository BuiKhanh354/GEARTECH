import { useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { catalogService } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { EmptyView, ErrorView, LoadingView } from '../../components/StateViews'
import { SectionHeader } from '../../components/ui'
import { colors, radius, spacing } from '../../constants/theme'

// Trang chủ: thương hiệu, tìm kiếm, danh mục, sản phẩm mới/nổi bật từ API thật
export default function HomeScreen() {
  const [search, setSearch] = useState('')

  // GET /api/products — sản phẩm mới nhất (sortBy=newest)
  const newest = useQuery({
    queryKey: ['products', 'home-newest'],
    queryFn: () => catalogService.getProducts({ limit: 6, sortBy: 'newest' })
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
      {/* Header thương hiệu + tìm kiếm */}
      <View style={styles.header}>
        <Text style={styles.brand}>
          GEAR<Text style={{ color: colors.primary }}>TECH</Text>
        </Text>
        <Text style={styles.tagline}>Máy tính & linh kiện chính hãng</Text>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={colors.faint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm sản phẩm, linh kiện..."
            placeholderTextColor={colors.faint}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={submitSearch} hitSlop={8}>
              <Ionicons name="arrow-forward-circle" size={22} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={newest.data?.products ?? []}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={newest.isRefetching}
            onRefresh={() => { newest.refetch(); categories.refetch() }}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerList}>
            {/* Danh mục ngang */}
            {categories.isLoading ? (
              <LoadingView label="Đang tải danh mục..." />
            ) : categories.isError ? (
              <ErrorView message={`Không tải được danh mục: ${categories.error?.message || ''}`} onRetry={() => categories.refetch()} />
            ) : (categories.data?.length ?? 0) === 0 ? (
              <EmptyView icon="grid-outline" title="Chưa có danh mục nào" />
            ) : (
              <View style={{ marginBottom: spacing.lg }}>
                <SectionHeader title="Danh mục" actionLabel="Xem tất cả" onAction={() => router.push('/(tabs)/categories')} />
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={categories.data}
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.catChip}
                      onPress={() => router.push({ pathname: '/(tabs)/categories', params: { category: item.slug } })}
                    >
                      <Text style={styles.catIcon}>{item.icon || '📦'}</Text>
                      <Text style={styles.catName} numberOfLines={2}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <SectionHeader title="Sản phẩm mới" actionLabel="Xem tất cả" onAction={() => router.push('/products')} />
          </View>
        }
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/products/${item._id}`)} />
        )}
        ListEmptyComponent={
          newest.isLoading ? (
            <LoadingView label="Đang tải sản phẩm..." />
          ) : newest.isError ? (
            <ErrorView
              message={newest.error?.message || 'Không tải được sản phẩm. Kiểm tra kết nối tới máy chủ.'}
              onRetry={() => newest.refetch()}
            />
          ) : (
            <EmptyView icon="cube-outline" title="Chưa có sản phẩm nào" subtitle="Sàn hiện chưa có sản phẩm đang bán" />
          )
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  brand: { fontSize: 22, fontWeight: '900', color: colors.ink, letterSpacing: 1 },
  tagline: { fontSize: 11, color: colors.sub, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: spacing.md
  },
  searchInput: { flex: 1, fontSize: 13, color: colors.ink },
  headerList: { paddingTop: spacing.lg },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  gridRow: { gap: spacing.sm, marginBottom: spacing.sm },
  catChip: {
    width: 84,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 6,
    alignItems: 'center'
  },
  catIcon: { fontSize: 22 },
  catName: { fontSize: 10, fontWeight: '600', color: colors.ink, textAlign: 'center', marginTop: 4 }
})
