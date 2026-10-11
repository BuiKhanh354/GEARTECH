/**
 * Định dạng số tiền sang chuẩn tiền tệ Việt Nam Đồng (VND)
 * @param value Số tiền cần định dạng (number)
 * @returns Chuỗi tiền tệ đã định dạng (string)
 */
export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}
