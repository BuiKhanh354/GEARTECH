import { useOutletContext } from 'react-router-dom'
import ShopVouchersTab from '../../profile/components/shop/ShopVouchersTab'

interface VoucherContext {
  shop: { _id: string; name: string } | null
}

// Marketing / Voucher của shop — tái sử dụng ShopVouchersTab
// (backend: /api/vouchers/shop/*, chỉ shop mới tạo/sửa voucher của mình)
export default function SellerVouchersPage() {
  const { shop } = useOutletContext<VoucherContext>()
  return <ShopVouchersTab currentShop={shop} />
}
