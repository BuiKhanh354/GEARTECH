import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { productService } from '../../../services/productService'
import ShopProductsTab from '../../profile/components/shop/ShopProductsTab'

// Quản lý sản phẩm — tái sử dụng ShopProductsTab, tự tải danh sách sản phẩm
// của shop từ API (/api/products/shop/my-products)
export default function SellerProductsPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || undefined

  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('token')

  const loadProducts = useCallback(async () => {
    try {
      const res = await productService.getMyProducts({ limit: 200 })
      setAllProducts(res.products || [])
    } catch {
      setAllProducts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <ShopProductsTab
      key={status || 'all'}
      token={token}
      allProducts={allProducts}
      onRefresh={loadProducts}
      initialStatus={status}
    />
  )
}
