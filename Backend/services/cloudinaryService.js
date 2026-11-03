/**
 * Cloudinary Storage Service - GEARTECH
 * Tải ảnh trực tiếp lên Cloudinary CDN đám mây (25GB miễn phí, không cần thẻ)
 * Có cơ chế tự động Fallback về ổ cứng cục bộ nếu thiếu API Key hoặc lỗi mạng.
 */

const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary từ biến môi trường
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || '';
const apiKey = process.env.CLOUDINARY_API_KEY || '';
const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
  console.log(`[Cloudinary] Đã kết nối thành công với tài khoản Cloud: ${cloudName}`);
} else {
  console.warn('[Cloudinary] Chưa cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY hoặc CLOUDINARY_API_SECRET trong file .env');
}

/**
 * Tải 1 buffer ảnh lên Cloudinary
 * @param {Buffer} buffer - Dữ liệu nhị phân của ảnh
 * @param {string} folder - Thư mục phân loại trên Cloudinary
 * @returns {Promise<string>} URL ảnh https://res.cloudinary.com/...
 */
function uploadToCloudinary(buffer, folder = 'products') {
  return new Promise((resolve, reject) => {
    if (!isConfigured) {
      return reject(new Error('Cloudinary chưa được cấu hình'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `geartech/${folder}`,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Lưu ảnh vào ổ cứng cục bộ (Fallback)
 */
function uploadToLocal(buffer, originalname, folder = 'products') {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  const fileName = `${folder}-${uniqueSuffix}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  fs.writeFileSync(filePath, buffer);
  return `http://localhost:5000/uploads/${folder}/${fileName}`;
}

/**
 * Hàm upload tổng hợp: Ưu tiên Cloudinary -> Tự động Fallback sang Local nếu chưa có key hoặc lỗi
 */
async function saveImage(buffer, originalname, mimetype, folder = 'products') {
  if (isConfigured) {
    try {
      const cloudUrl = await uploadToCloudinary(buffer, folder);
      return { url: cloudUrl, storage: 'cloudinary' };
    } catch (err) {
      console.warn(`[Cloudinary Fallback] Lỗi upload Cloudinary (${err.message}), chuyển sang lưu cục bộ.`);
    }
  }

  const localUrl = uploadToLocal(buffer, originalname, folder);
  return { url: localUrl, storage: 'local' };
}

module.exports = {
  saveImage,
  uploadToCloudinary,
  uploadToLocal,
  isCloudinaryReady: () => isConfigured
};

