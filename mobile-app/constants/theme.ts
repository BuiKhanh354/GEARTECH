// Bảng màu & kích thước chung của app GearTech (giao diện sáng, hiện đại)
export const colors = {
  primary: '#ff4655',      // đỏ thương hiệu GearTech
  primaryDark: '#e03d4b',
  ink: '#18181b',          // chữ chính (zinc-900)
  sub: '#71717a',          // chữ phụ (zinc-500)
  faint: '#a1a1aa',
  bg: '#f4f4f5',           // nền trang (zinc-100)
  card: '#ffffff',
  border: '#e4e4e7',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  chipBg: '#fafafa'
} as const

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const

export const radius = { sm: 8, md: 12, lg: 16, pill: 999 } as const

// Định dạng tiền VND dùng chung
export function formatPrice(v: number | undefined | null): string {
  const n = Number(v ?? 0)
  return n.toLocaleString('vi-VN') + ' ₫'
}

// Nhãn trạng thái đơn hàng khớp backend: pending|confirmed|shipping|completed|cancelled
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#06b6d4',
  shipping: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444'
}
