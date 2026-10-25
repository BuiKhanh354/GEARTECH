import AdminCategoriesTab from '../../profile/components/admin/AdminCategoriesTab'

// Quản lý danh mục (cha/con + icon) — tái sử dụng AdminCategoriesTab
// (thêm/sửa/ẩn/xóa an toàn: backend chặn xóa khi còn sản phẩm hoặc danh mục con)
export default function AdminCategoriesPage() {
  return <AdminCategoriesTab />
}
