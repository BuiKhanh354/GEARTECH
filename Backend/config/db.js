const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/gear_tech');
    console.log(`✅ Kết nối cơ sở dữ liệu MongoDB thành công: ${conn.connection.host}`);
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error.message}`, { cause: error });
  }
};

module.exports = connectDB;
