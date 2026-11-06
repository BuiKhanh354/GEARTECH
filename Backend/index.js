const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : process.env.NODE_ENV === 'production'
    ? []
    : ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:8081'];

app.use(cors({
  origin(origin, callback) {
    // Cho phép tất cả các nguồn khi chạy ở môi trường development (bao gồm web, mobile expo, IP LAN)
    if (!origin || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(null, allowedOrigins.includes(origin));
  },
  credentials: true
}));
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
app.use('/api/ai', require('./routes/ai'));
app.use('/api/shipping', require('./routes/shipping'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/care', require('./routes/careServices'));


// Middleware xử lý lỗi 404 (Không tìm thấy Route)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint API không tồn tại.' });
});

// Middleware xử lý lỗi hệ thống toàn cục (Global Error Handler)
app.use((err, req, res, next) => {
  console.error('❌ Lỗi hệ thống phát sinh:', err.stack);
  res.status(500).json({ error: 'Lỗi hệ thống máy chủ.' });
});

const startServer = async () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your_jwt_secret_here') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a strong, private value before starting the server.');
    } else {
      console.warn('⚠️ [Auth] JWT_SECRET chưa được đặt trong .env, sử dụng khóa mặc định cho môi trường dev.');
      process.env.JWT_SECRET = 'GEARTECH_VALORANT_EDITION_SECRET_2026';
    }
  }

  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GearTech backend listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error(`Backend startup failed: ${error.message}`);
  process.exit(1);
});
