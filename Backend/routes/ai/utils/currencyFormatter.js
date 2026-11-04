/**
 * Tiện ích định dạng tiền tệ VND theo chuẩn vi-VN
 */
function formatVND(num) {
  if (!num && num !== 0) return '0₫';
  return new Intl.NumberFormat('vi-VN').format(num) + '₫';
}

module.exports = {
  formatVND
};

