import { useState, useEffect, useCallback } from 'react'
import { productService } from '../../../services/productService'
import ShopInventoryTab from '../../profile/components/shop/ShopInventoryTab'

// Quản lý kho — tái sử dụng ShopInventoryTab (phân biệt kho vật lý / đăng bán /
// khả dụng đã được triển khai ở backend: warehouseStock, listedQty, stock)
export default function SellerInventoryPage() {
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  return <ShopInventoryTab allProducts={allProducts} onRefreshProducts={loadProducts} />
}
