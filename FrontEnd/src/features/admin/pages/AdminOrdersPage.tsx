import AdminOrdersTab from '../../profile/components/admin/AdminOrdersTab'

// Quản lý đơn hàng toàn sàn — tái sử dụng AdminOrdersTab
// (GET /api/orders/admin chỉ trả về cho admin; Admin chỉ giám sát, luồng xử lý
// đơn của shop không bị thay đổi)
export default function AdminOrdersPage() {
  return <AdminOrdersTab />
}
