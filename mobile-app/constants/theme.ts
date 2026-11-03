// =============================================================================
// GEARTECH MOBILE — DESIGN SYSTEM v2
// Mọi màn hình dùng token từ file này; không hardcode màu trong StyleSheet.
// Thương hiệu: accent đỏ #ff4655 (giữ nhận diện website), chữ ink navy-slate.
// =============================================================================
import { TextStyle } from 'react-native'

export const palette = {
  // Thương hiệu
  brand: '#ff4655',
  brandDark: '#e03d4b',
  brandSoft: '#fff1f2', // nền nhạt đỏ cho badge/chip active

  // Màu chữ (3 cấp)
  ink: '#0f172a',       // tiêu đề, giá trị chính (navy đen)
  inkSoft: '#334155',   // nội dung chính
  muted: '#64748b',     // phụ
  faint: '#94a3b8',     // nhãn phụ, placeholder

  // Nền & bề mặt
  bg: '#f5f6f8',        // nền trang
  surface: '#ffffff',   // card
  surfaceAlt: '#f1f5f9',// nền ô input, thumbnail
  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  // Trạng thái
  success: '#16a34a',
  successSoft: '#f0fdf4',
  warning: '#d97706',
  warningSoft: '#fffbeb',
  danger: '#dc2626',
  dangerSoft: '#fef2f2',
  info: '#2563eb',
  infoSoft: '#eff6ff',

  // Điểm nhấn đánh giá
  star: '#f59e0b',

  overlay: 'rgba(15, 23, 42, 0.45)'
} as const

// Thang khoảng cách thống nhất (bước 4dp)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40
} as const

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999
} as const

// Bóng đổ tinh tế — chỉ dùng cho phần tử nổi (không lạm dụng)
export const elevation = {
  card: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1
  },
  float: {
    shadowColor: '#0f172a',
    shadowOpacity: 0.10,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  }
} as const

// =============================================================================
// TYPOGRAPHY — 5 cấp duy nhất + kiểu chuyên biệt
// =============================================================================
export const type = {
  h1: { fontSize: 22, fontWeight: '800', color: palette.ink, letterSpacing: 0.2 } as TextStyle,
  h2: { fontSize: 17, fontWeight: '800', color: palette.ink } as TextStyle,
  h3: { fontSize: 15, fontWeight: '700', color: palette.ink } as TextStyle,
  body: { fontSize: 13, fontWeight: '500', color: palette.inkSoft, lineHeight: 19 } as TextStyle,
  caption: { fontSize: 11, fontWeight: '500', color: palette.muted } as TextStyle,
  overline: { fontSize: 10, fontWeight: '800', color: palette.faint, letterSpacing: 1.2, textTransform: 'uppercase' } as TextStyle,
  // Kiểu giá — số lớn đậm, dễ quét
  price: { fontSize: 15, fontWeight: '900', color: palette.brand } as TextStyle,
  priceOld: { fontSize: 12, fontWeight: '500', color: palette.faint, textDecorationLine: 'line-through' } as TextStyle
}

// Định dạng tiền VND dùng chung
export function formatPrice(v: number | undefined | null): string {
  const n = Number(v ?? 0)
  return n.toLocaleString('vi-VN') + ' ₫'
}

// Nhãn + màu trạng thái đơn hàng khớp backend: pending|confirmed|shipping|completed|cancelled
export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
}

export const ORDER_STATUS_COLOR: Record<string, string> = {
  pending: '#d97706',
  confirmed: '#0891b2',
  shipping: '#2563eb',
  completed: '#16a34a',
  cancelled: '#dc2626'
}
