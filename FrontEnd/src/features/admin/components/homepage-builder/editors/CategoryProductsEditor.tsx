import { useState, useEffect, useCallback } from 'react'
import { ArrowClockwise, Funnel, Package, Sparkle, Warning } from '@phosphor-icons/react'
import { homepageService, type HomepageSection } from '../../../../../services/homepageService'
import type { HomepageCategoryOption } from '../../../config/homepageSections'
import { formatPrice } from '../../../../../utils/format'
import { SafeProductImage } from '../../../../../components/common/ProductImage'
import type { ProductItem } from '../../../../../services/productService'

interface CategoryProductsEditorProps {
  section: HomepageSection
  categories: HomepageCategoryOption[]
  onUpdateConfig: (key: string, configUpdates: any) => void
}

export default function CategoryProductsEditor({
  section,
  categories,
  onUpdateConfig
}: CategoryProductsEditorProps) {
  const [categorySearch, setCategorySearch] = useState('')
  const [previewProducts, setPreviewProducts] = useState<ProductItem[]>([])
  const [previewTotal, setPreviewTotal] = useState<number>(0)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Real-time live query for category products in editor
  const fetchCategoryPreview = useCallback(async () => {
    if (!section || section.type !== 'category_products') {
      setPreviewProducts([])
      setPreviewTotal(0)
      return
    }

    try {
      setPreviewLoading(true)
      const res = await homepageService.getCategoryPreview({
        categoryId: section.config?.categoryId,
        categorySlug: section.config?.categorySlug,
        includeChildren: section.config?.includeChildren ?? true,
        limit: section.config?.limit || 8,
        sortBy: section.config?.sortBy || 'newest',
        showOutOfStock: section.config?.showOutOfStock ?? false
      })
      if (res.success) {
        setPreviewProducts(res.products || [])
        setPreviewTotal(res.totalCount || 0)
      }
    } catch (err) {
      console.error('Lỗi nạp xem trước sản phẩm danh mục:', err)
    } finally {
      setPreviewLoading(false)
    }
  }, [
    section?.sectionKey,
    section?.type,
    section?.config?.categoryId,
    section?.config?.categorySlug,
    section?.config?.includeChildren,
    section?.config?.limit,
    section?.config?.sortBy,
    section?.config?.showOutOfStock
  ])

  useEffect(() => {
    fetchCategoryPreview()
  }, [fetchCategoryPreview])

  const filteredCategories = categories.filter(c =>
    !categorySearch ||
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    c.slug.includes(categorySearch.toLowerCase())
  )

  return (
    <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
          <Package size={15} className="text-blue-500" weight="bold" />
          2. Cấu hình chọn danh mục MongoDB & Truy vấn sản phẩm
        </h3>
      </div>

      {/* Category Selector with Search */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
              Chọn danh mục sản phẩm từ Database <span className="text-red-500">*</span>
            </label>
            <span className="text-[10px] text-zinc-400">
              {categories.length} danh mục khả dụng
            </span>
          </div>

          <div className="relative mb-2">
            <input
              type="text"
              value={categorySearch}
              onChange={e => setCategorySearch(e.target.value)}
              placeholder="Tìm kiếm danh mục theo tên hoặc slug..."
              className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white focus:outline-hidden focus:border-blue-500"
            />
            <Funnel size={12} className="absolute left-2.5 top-2.5 text-zinc-400" />
          </div>

          <select
            value={section.config.categoryId || ''}
            onChange={e => {
              const cat = categories.find(c => c._id === e.target.value)
              onUpdateConfig(section.sectionKey, {
                categoryId: cat?._id || null,
                categorySlug: cat?.slug || '',
                categoryName: cat?.name || '',
                viewAllLink: cat ? `/ProductPage?category=${cat.slug}` : '/ProductPage'
              })
            }}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="">-- Chọn danh mục --</option>
            {filteredCategories.map(c => (
              <option key={c._id} value={c._id}>
                {c.parent_id ? `↳ ${c.name}` : `📁 ${c.name}`} ({c.productCount ?? 0} sản phẩm)
              </option>
            ))}
          </select>
        </div>

        {/* Include Children & Out of Stock Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={section.config.includeChildren ?? true}
              onChange={e => onUpdateConfig(section.sectionKey, { includeChildren: e.target.checked })}
              className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Bao gồm cả danh mục con (Sub-categories)
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={section.config.showOutOfStock ?? false}
              onChange={e => onUpdateConfig(section.sectionKey, { showOutOfStock: e.target.checked })}
              className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Hiển thị cả sản phẩm hết hàng
            </span>
          </label>
        </div>

        {/* Query Controls: Limit & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Số lượng sản phẩm hiển thị
            </label>
            <select
              value={section.config.limit || 8}
              onChange={e => onUpdateConfig(section.sectionKey, { limit: Number(e.target.value) })}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
            >
              <option value={4}>4 sản phẩm (1 hàng)</option>
              <option value={8}>8 sản phẩm (2 hàng)</option>
              <option value={12}>12 sản phẩm (3 hàng)</option>
              <option value={16}>16 sản phẩm (4 hàng)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Tiêu chí sắp xếp
            </label>
            <select
              value={section.config.sortBy || 'newest'}
              onChange={e => onUpdateConfig(section.sectionKey, { sortBy: e.target.value })}
              className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
            >
              <option value="newest">Mới nhất (Ngày đăng)</option>
              <option value="sold_desc">Bán chạy nhất (Số lượng bán)</option>
              <option value="rating_desc">Đánh giá cao nhất (Sao review)</option>
              <option value="price_asc">Giá từ thấp đến cao</option>
              <option value="price_desc">Giá từ cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* View All Button Config */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.config.showViewAll ?? true}
              onChange={e => onUpdateConfig(section.sectionKey, { showViewAll: e.target.checked })}
              className="rounded text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Hiển thị nút "Xem tất cả"
            </span>
          </div>

          {section.config.showViewAll && (
            <div className="flex-1">
              <input
                type="text"
                value={section.config.viewAllLink || ''}
                onChange={e => onUpdateConfig(section.sectionKey, { viewAllLink: e.target.value })}
                placeholder="Đường dẫn nút xem tất cả (/ProductPage?category=...)"
                className="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-xs text-zinc-900 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* REAL-TIME LIVE PRODUCT PREVIEW BOX (TRUY VẤN SẢN PHẨM THỰC TẾ) */}
        <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Sparkle size={14} className="text-blue-500" weight="fill" />
                Sản phẩm thực tế trong Database ({previewProducts.length} hiển thị / {previewTotal} tổng số)
              </h4>
            </div>

            <button
              type="button"
              onClick={() => fetchCategoryPreview()}
              disabled={previewLoading}
              className="text-[11px] font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowClockwise size={12} className={previewLoading ? 'animate-spin' : ''} weight="bold" />
              <span>Làm mới</span>
            </button>
          </div>

          {previewLoading ? (
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg flex items-center justify-center gap-2 text-xs text-zinc-400">
              <ArrowClockwise size={16} className="animate-spin text-blue-500" />
              <span>Đang truy vấn sản phẩm thực tế từ MongoDB...</span>
            </div>
          ) : previewProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {previewProducts.map(p => (
                <div
                  key={p._id || p.id}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-lg p-2.5 space-y-1.5 shadow-2xs hover:border-blue-500 transition-colors"
                >
                  <div className="h-24 bg-zinc-100 dark:bg-zinc-950 rounded overflow-hidden flex items-center justify-center">
                    <SafeProductImage src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-mono font-bold px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 uppercase">
                      {p.categoryName || p.category}
                    </span>
                    <h5 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {p.title}
                    </h5>
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-black text-[#ff4655]">{formatPrice(p.price)}</span>
                    <span className="text-zinc-400 font-mono">Kho: {p.stock}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg space-y-1 text-center">
              <p className="text-xs font-bold text-amber-500 flex items-center justify-center gap-1">
                <Warning size={14} weight="fill" /> Danh mục này hiện chưa có sản phẩm nào trong database!
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Khu vực này sẽ tự động ẩn trên trang chủ khách hàng cho đến khi bạn gán sản phẩm vào danh mục này.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
