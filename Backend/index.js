const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');

// Khởi tạo Express
const app = express();

// Kết nối cơ sở dữ liệu MongoDB
connectDB();

// Cấu hình Middleware
app.use(cors());
app.use(express.json());

// Phục vụ file tĩnh (ảnh sản phẩm đã upload)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Định tuyến API gốc
app.get('/', (req, res) => {
  res.json({
    name: 'GearTech // Valorant Edition API Server',
    version: '1.0.0',
    status: 'ONLINE',
    systemTime: new Date()
  });
});

// Đăng ký các Routes cụ thể
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/shops', require('./routes/shops'));
app.use('/api/showrooms', require('./routes/showrooms'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/vouchers', require('./routes/vouchers'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/suppliers', require('./routes/suppliers'));
app.use('/api/stock-movements', require('./routes/stockMovements'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/shop-followers', require('./routes/shopFollowers'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/homepage', require('./routes/homepage'));

// Middleware xử lý lỗi 404 (Không tìm thấy Route)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint API không tồn tại.' });
});

// Middleware xử lý lỗi hệ thống toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error('❌ Lỗi hệ thống phát sinh:', err.stack);
  res.status(500).json({ error: 'Lỗi hệ thống máy chủ.', details: err.message });
});

// Cổng chạy ứng dụng
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server backend GearTech đang chạy trên cổng ${PORT}`);
});
