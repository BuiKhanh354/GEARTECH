/**
 * Local Storage Service - GEARTECH
 * Lưu trữ file/ảnh trực tiếp vào thư mục public/uploads trên máy chủ cục bộ.
 * Hoạt động 100% offline và ổn định trên mọi máy tính không cần phụ thuộc dịch vụ bên ngoài.
 */

const fs = require('fs');
const path = require('path');

/**
 * Lưu buffer ảnh vào ổ đĩa cục bộ
 * @param {Buffer} buffer - Dữ liệu nhị phân của ảnh
 * @param {string} originalname - Tên file gốc
 * @param {string} folder - Thư mục con (products, shops, categories, banners)
 * @returns {string} URL công khai để truy cập ảnh
 */
function uploadToLocal(buffer, originalname, folder = 'products') {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  const fileName = `${folder}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.BACKEND_URL;
  return baseUrl ? `${baseUrl}/uploads/${folder}/${fileName}` : `/uploads/${folder}/${fileName}`;
}

/**
 * Hàm upload ảnh tổng quát
 */
async function saveImage(buffer, originalname, mimetype, folder = 'products') {
  const localUrl = uploadToLocal(buffer, originalname, folder);
  return { url: localUrl, storage: 'local' };
}

module.exports = {
  saveImage,
  uploadToLocal
};

