import { useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, router } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { catalogService } from '../../services/catalogService'
import { ProductCard } from '../../components/ProductCard'
import { ProductGridSkeleton, Skeleton } from '../../components/Skeleton'
import { EmptyView, ErrorView } from '../../components/StateViews'
import { elevation, palette, radius, spacing, type } from '../../constants/theme'

type ChipItem = { _id: string; name: string; slug?: string; icon?: string }

// =============================================================================
// MÀN HÌNH DANH MỤC (v2)
// - Chip danh mục ngang với trạng thái active (brandSoft + viền brand đỏ)
// - Lưới 2 cột đồng bộ với trang chủ
// - Skeleton loading thay spinner
// =============================================================================
export default function CategoriesScreen() {
  const params = useLocalSearchParams<{ category?: string }>()

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogService.getCategories()
  })

  const [selected, setSelected] = useState<string | undefined>(params.category)

  useEffect(() => {
    if (params.category !== undefined) setSelected(params.category)
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
        style={[
          styles.catChip,
          elevation.card,
          active && styles.catChipActive
        ]}
        activeOpacity={0.7}
        onPress={() => pickCategory(item.slug)}
      >
        <View style={[styles.catIconWrap, active && styles.catIconWrapActive]}>
          <Text style={styles.catIcon}>{item.icon || '📦'}</Text>
        </View>
        <Text
          style={[styles.catName, active && styles.catNameActive]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header màn hình */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Danh mục sản phẩm</Text>
          <Text style={styles.headerSubtitle}>Lựa chọn phần cứng theo nhu cầu</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/products')}
          hitSlop={8}
        >
          <Ionicons name="search" size={16} color={palette.brand} />
          <Text style={styles.searchBtnText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {categories.isLoading ? (
        <View style={{ padding: spacing.lg }}>
          <View style={styles.skeletonRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} style={{ width: 84, height: 74, borderRadius: radius.md }} />
            ))}
          </View>
          <View style={{ marginTop: spacing.xl }}>
            <ProductGridSkeleton count={4} />
          </View>
        </View>
      ) : categories.isError ? (
        <ErrorView
          message="Không tải được danh mục"
          onRetry={() => categories.refetch()}
        />
      ) : (categories.data?.length ?? 0) === 0 ? (
        <EmptyView
          icon="grid-outline"
          title="Chưa có danh mục nào"
          subtitle="Admin chưa cấu hình danh mục trên hệ thống"
        />
      ) : (
        <FlatList
          data={products.data?.products ?? []}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
          ListHeaderComponent={
            <View style={styles.headerCategoryList}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[
                  { _id: 'all', name: 'Tất cả', slug: undefined, icon: '⚡' } as ChipItem,
                  ...(categories.data ?? [])
                ]}
                keyExtractor={(item) => item._id}
                renderItem={renderItemCat}
                contentContainerStyle={styles.chipsContent}
              />
              <View style={styles.countRow}>
                <Text style={styles.countText}>
                  {products.data?.total ? `${products.data.total} sản phẩm` : 'Sản phẩm'}
                </Text>
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
            products.isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : products.isError ? (
              <ErrorView
                message="Không tải được sản phẩm thuộc danh mục này"
                onRetry={() => products.refetch()}
              />
            ) : (
              <EmptyView
                icon="cube-outline"
                title="Chưa có sản phẩm"
                subtitle="Danh mục này hiện chưa có sản phẩm được đăng bán"
              />
            )
          }
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: palette.bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: palette.border
  },
  headerTitle: {
    ...type.h2,
    fontSize: 18
  },
  headerSubtitle: {
    ...type.caption,
    marginTop: 1
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: palette.brandSoft,
    borderWidth: 1,
    borderColor: palette.brand + '33'
  },
  searchBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: palette.brand
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  headerCategoryList: {
    paddingVertical: spacing.md
  },
  chipsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm
  },
  catChip: {
    width: 86,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    alignItems: 'center'
  },
  catChipActive: {
    borderColor: palette.brand,
    borderWidth: 1.5,
    backgroundColor: palette.brandSoft
  },
  catIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4
  },
  catIconWrapActive: {
    backgroundColor: palette.surface
  },
  catIcon: {
    fontSize: 20
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
    color: palette.ink,
    textAlign: 'center',
    lineHeight: 14
  },
  catNameActive: {
    color: palette.brand,
    fontWeight: '800'
  },
  countRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs
  },
  countText: {
    ...type.caption,
    fontWeight: '700',
    color: palette.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
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
