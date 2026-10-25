import { useSearchParams } from 'react-router-dom'
import ShopOrdersTab from '../../profile/components/shop/ShopOrdersTab'

// Quản lý đơn hàng — tái sử dụng ShopOrdersTab hiện có, nhận bộ lọc từ URL
// (/shop/orders?status=pending...) để sidebar điều hướng đến đúng trang đã lọc
export default function SellerOrdersPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || undefined

  return <ShopOrdersTab key={status || 'all'} initialStatus={status} />
}
