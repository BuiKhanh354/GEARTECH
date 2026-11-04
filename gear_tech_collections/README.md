# DỮ LIỆU CƠ SỞ DỮ LIỆU GEAR TECH

Thư mục này chứa toàn bộ dữ liệu MongoDB của dự án GEAR TECH.

---

## Cách khôi phục / nạp dữ liệu vào MongoDB:

### Bước 1: Đảm bảo MongoDB đang chạy
MongoDB đang chạy ở cổng mặc định: `mongodb://localhost:27017`

### Bước 2: Chạy lệnh Import tự động
Mở Terminal tại thư mục gốc của dự án và chạy:
```bash
node gear_tech_sql/import-db.js
```

Hoặc trong thư mục `Backend`:
```bash
npm run db:import
```

---
Toàn bộ tài khoản quản trị (admin), gian hàng (shop), sản phẩm, danh mục, đơn hàng và cấu hình trang chủ sẽ được khôi phục đầy đủ.

