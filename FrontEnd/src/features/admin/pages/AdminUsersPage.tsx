import { useSearchParams } from 'react-router-dom'
import AdminUsersTab from '../../profile/components/admin/AdminUsersTab'

// Quản lý người dùng — tái sử dụng AdminUsersTab (tìm kiếm, lọc, phân trang,
// khóa/mở khóa có xác nhận; backend chặn quyền admin và chặn tự khóa chính mình)
export default function AdminUsersPage() {
  const [searchParams] = useSearchParams()
  const role = searchParams.get('role') || undefined

  return <AdminUsersTab key={role || 'all'} initialRole={role} />
}
