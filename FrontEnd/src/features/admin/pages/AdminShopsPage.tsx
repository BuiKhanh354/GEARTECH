import { useSearchParams } from 'react-router-dom'
import AdminShopsTab from '../../profile/components/admin/AdminShopsTab'

// Quản lý cửa hàng — phê duyệt hồ sơ đăng ký, quản lý trạng thái, tạo gian hàng thủ công
export default function AdminShopsPage() {
  const [searchParams] = useSearchParams()
  const status = searchParams.get('status') || undefined

  return <AdminShopsTab key={status || 'all'} initialStatus={status} />
}
