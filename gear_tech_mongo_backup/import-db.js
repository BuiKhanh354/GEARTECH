/**
 * SCRIPT IMPORT DỮ LIỆU VÀO MONGODB TRÊN MÁY KHÁC
 * 
 * Hướng dẫn sử dụng:
 * 1. Đảm bảo MongoDB đang chạy trên máy (cổng mặc định: mongodb://localhost:27017)
 * 2. Mở Terminal (tại thư mục Backend hoặc thư mục này) và chạy lệnh:
 *    node import-db.js
 */

const path = require('path');
const fs = require('fs');

// Tự động nhận diện node_modules từ thư mục Backend lân cận nếu có
const backendNodeModules = path.resolve(__dirname, '../Backend/node_modules');
if (fs.existsSync(backendNodeModules)) {
  module.paths.push(backendNodeModules);
}

let MongoClient, EJSON;
try {
  MongoClient = require('mongodb').MongoClient;
  EJSON = require('bson').EJSON;
} catch (e) {
  try {
    // Thử load từ mongoose trong Backend
    const mongoose = require(path.join(backendNodeModules, 'mongoose'));
    MongoClient = mongoose.mongo.MongoClient;
    EJSON = mongoose.mongo.BSON.EJSON;
  } catch (err) {
    console.error('[-] Chưa tìm thấy thư viện mongodb/bson.');
    console.log('    Vui lòng chạy: cd Backend && npm install');
    console.log('    Sau đó chạy lại lệnh: node ../gear_tech_mongo_backup/import-db.js');
    process.exit(1);
  }
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech';

async function importAll() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('====================================================');
    console.log('[*] Đang kết nối tới MongoDB: ' + MONGODB_URI);
    await client.connect();
    console.log('[+] Kết nối MongoDB thành công!\n');

    const db = client.db();
    const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.json') && f !== 'manifest.json');

    console.log(`[*] Bắt đầu nhập dữ liệu cho ${files.length} collections:\n`);

    let totalDocs = 0;

    for (const file of files) {
      const colName = path.basename(file, '.json');
      const filePath = path.join(__dirname, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const docs = EJSON.parse(content);

      if (docs && docs.length > 0) {
        const col = db.collection(colName);
        // Xóa dữ liệu cũ của collection trước khi nạp để tránh trùng lặp _id
        await col.deleteMany({});
        await col.insertMany(docs);
        totalDocs += docs.length;
        console.log(`  -> [THÀNH CÔNG] Collection '${colName}': đã nạp ${docs.length} bản ghi`);
      } else {
        console.log(`  -> [BỎ QUA] Collection '${colName}': không có dữ liệu`);
      }
    }

    console.log('\n====================================================');
    console.log(`🎉 HOÀN TẤT! Đã nhập thành công ${totalDocs} bản ghi vào MongoDB.`);
    console.log('====================================================');
  } catch (err) {
    console.error('[-] Lỗi trong quá trình import:', err.message);
  } finally {
    await client.close();
  }
}

importAll();
