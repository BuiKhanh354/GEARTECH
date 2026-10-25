import AdminShopsTab from '../../profile/components/admin/AdminShopsTab'

// Quản lý cửa hàng — tái sử dụng AdminShopsTab (duyệt/từ chối/khóa shop,
// backend chặn quyền admin qua PUT /api/shops/:id/status)
export default function AdminShopsPage() {
  return <AdminShopsTab token={localStorage.getItem('token')} shopsList={[]} onRefresh={() => {}} />
}
