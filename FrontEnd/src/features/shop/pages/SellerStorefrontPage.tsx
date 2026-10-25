import { useState, useEffect, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { productService } from '../../../services/productService'
import ShopStorefrontDesignTab from '../../profile/components/shop/ShopStorefrontDesignTab'

interface StorefrontContext {
  shop: any
  refreshShop?: () => void
}

// Tùy chỉnh giao diện gian hàng — tái sử dụng ShopStorefrontDesignTab
// (draft/publish/reset + upload banner & logo từ máy đã hoạt động)
export default function SellerStorefrontPage() {
  const { shop } = useOutletContext<StorefrontContext>()
  const [allProducts, setAllProducts] = useState<any[]>([])

  const loadProducts = useCallback(async () => {
    try {
      const res = await productService.getMyProducts({ limit: 200 })
      setAllProducts(res.products || [])
    } catch {
      setAllProducts([])
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return <ShopStorefrontDesignTab currentShop={shop} allProducts={allProducts} />
}
