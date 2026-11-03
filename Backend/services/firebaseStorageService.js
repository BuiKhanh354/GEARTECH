/**
 * Firebase Storage Service - GEARTECH
 * Quản lý tải lên hình ảnh lên Google Cloud / Firebase Storage
 * Có cơ chế tự động Fallback về ổ cứng cục bộ nếu Firebase chưa cấu hình hoặc gặp sự cố mạng.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const admin = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const { cert } = require('firebase-admin/app');

let firebaseBucket = null;
let isFirebaseReady = false;

// Đường dẫn file service account
const serviceAccountPath = path.join(__dirname, '..', 'firebase-service-account.json');

try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    const projectId = serviceAccount.project_id;
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;

    const app = admin.initializeApp({
      credential: cert(serviceAccount),
      storageBucket: bucketName
    }, 'geartech-storage-app');

    firebaseBucket = getStorage(app).bucket();
    isFirebaseReady = true;
    console.log(`[Firebase Storage] Đã khởi tạo kết nối với Bucket: ${bucketName}`);
  } else {
    console.warn('[Firebase Storage] Không tìm thấy file firebase-service-account.json, sử dụng lưu trữ cục bộ.');
  }
} catch (error) {
  console.error('[Firebase Storage] Lỗi khởi tạo Firebase:', error.message);
  isFirebaseReady = false;
}

/**
 * Upload một file buffer lên Firebase Storage
 * @param {Buffer} buffer - Dữ liệu nhị phân của file ảnh
 * @param {string} originalname - Tên file gốc
 * @param {string} mimetype - Định dạng ảnh (image/jpeg, image/png...)
 * @param {string} folder - Thư mục đích trên Firebase (products, shops, categories, banners)
 * @returns {Promise<string>} URL công khai của ảnh
 */
async function uploadToFirebase(buffer, originalname, mimetype, folder = 'products') {
  if (!isFirebaseReady || !firebaseBucket) {
    throw new Error('Firebase Storage chưa sẵn sàng hoặc chưa khởi tạo.');
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(originalname).toLowerCase() || '.jpg';
  const fileName = `${folder}/${uniqueSuffix}${ext}`;
  const file = firebaseBucket.file(fileName);

  // Tạo access token cho URL tải trực tiếp
  const downloadToken = crypto.randomUUID();

  await file.save(buffer, {
    metadata: {
      contentType: mimetype,
      metadata: {
        firebaseStorageDownloadTokens: downloadToken
      }
    },
    resumable: false
  });

  // URL truy cập ảnh trực tiếp chuẩn Firebase
  const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseBucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${downloadToken}`;
  return publicUrl;
}

/**
 * Upload cục bộ (fallback an toàn khi Firebase offline hoặc chưa bật)
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
 * Hàm upload tổng hợp: Ưu tiên Firebase -> Tự động Fallback sang Local nếu lỗi
 */
async function saveImage(buffer, originalname, mimetype, folder = 'products') {
  if (isFirebaseReady) {
    try {
      const firebaseUrl = await uploadToFirebase(buffer, originalname, mimetype, folder);
      return { url: firebaseUrl, storage: 'firebase' };
    } catch (firebaseErr) {
      console.warn(`[Storage Fallback] Không thể upload Firebase (${firebaseErr.message}), chuyển sang lưu cục bộ.`);
    }
  }

  const localUrl = uploadToLocal(buffer, originalname, folder);
  return { url: localUrl, storage: 'local' };
}

module.exports = {
  saveImage,
  uploadToFirebase,
  uploadToLocal,
  isFirebaseConfigured: () => isFirebaseReady
};

