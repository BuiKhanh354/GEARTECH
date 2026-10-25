const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { EJSON } = require('bson');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech';
const OUTPUT_DIR = path.resolve(__dirname, '../../gear_tech_mongo_backup');

async function exportDatabase() {
  try {
    console.log(`[*] Đang kết nối tới MongoDB: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('[+] Kết nối MongoDB thành công!');

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`[*] Tìm thấy ${collections.length} collections cần xuất.\n`);

    const summary = {};

    for (const colInfo of collections) {
      const colName = colInfo.name;
      const collection = mongoose.connection.db.collection(colName);
      const docs = await collection.find({}).toArray();

      // Dùng BSON EJSON để giữ nguyên kiểu ObjectId và Date
      const jsonContent = EJSON.stringify(docs, { relaxed: false }, 2);
      const filePath = path.join(OUTPUT_DIR, `${colName}.json`);

      fs.writeFileSync(filePath, jsonContent, 'utf8');
      summary[colName] = docs.length;
      console.log(`  -> [XUẤT] Collection '${colName}': ${docs.length} bản ghi`);
    }

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'manifest.json'),
      JSON.stringify({
        database: 'gear_tech',
        exportedAt: new Date().toISOString(),
        collections: summary
      }, null, 2),
      'utf8'
    );

    console.log(`\n🎉 Xuất dữ liệu hoàn tất ra: ${OUTPUT_DIR}`);
  } catch (error) {
    console.error('[-] Lỗi khi xuất dữ liệu:', error);
  } finally {
    await mongoose.disconnect();
  }
}

exportDatabase();
