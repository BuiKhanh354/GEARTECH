# 📋 GearTech Marketplace — Nhật ký Cập nhật & Tiến độ Phát triển

> **Cập nhật ngày:** 01/08/2026  
> **Trạng thái tổng thể:** Frontend + Backend cơ bản đã hoàn thành, hệ thống Multi-vendor hoạt động

---

## 📁 Cấu trúc Dự án Hiện tại

```
GEARTECH/
├── Backend/                    # Express.js + MongoDB
│   ├── config/
│   │   └── db.js               # Kết nối MongoDB (localhost:27017/geartech)
│   ├── middleware/
│   │   └── auth.js             # JWT xác thực + checkRole middleware
│   ├── models/
│   │   ├── User.js             # Schema người dùng (role: user/admin/shop)
│   │   ├── Product.js          # Schema sản phẩm (specs Map, gallery, shopId)
│   │   ├── Shop.js             # Schema gian hàng đối tác
│   │   ├── Order.js            # Schema đơn hàng
│   │   ├── Voucher.js          # Schema mã giảm giá
│   │   └── Showroom.js         # Schema showroom GPS
│   ├── routes/
│   │   ├── auth.js             # Đăng ký, đăng nhập, profile, register-shop
│   │   ├── products.js         # CRUD sản phẩm (GET danh sách/chi tiết, POST đăng bán)
│   │   ├── shops.js            # Lấy danh sách shop
│   │   ├── orders.js           # Tạo đơn hàng, lấy lịch sử đơn
│   │   ├── vouchers.js         # CRUD voucher
│   │   ├── showrooms.js        # CRUD showroom
│   │   └── upload.js           # Upload ảnh sản phẩm từ máy tính (multer)
│   ├── public/
│   │   └── uploads/products/   # Thư mục lưu ảnh sản phẩm đã upload
│   ├── seed.js                 # Dữ liệu mẫu ban đầu
│   ├── index.js                # Entry point Express server (port 5000)
│   └── .env                    # MONGO_URI, JWT_SECRET, PORT
│
├── Frontend/                   # Vite + React 19 + TailwindCSS
│   └── src/
│       ├── features/
│       │   ├── home/pages/HomePage.tsx         # Trang chủ (banner, flash sale, gợi ý)
│       │   ├── products/
│       │   │   ├── pages/ProductListPage.tsx    # Danh sách sản phẩm (lọc, sắp xếp, phân trang)
│       │   │   ├── pages/ProductDetailPage.tsx  # Chi tiết sản phẩm (gallery, specs, mua hàng)
│       │   │   └── data/productsData.ts         # Dữ liệu sản phẩm tĩnh (mock)
│       │   ├── auth/pages/LoginPage.tsx         # Đăng nhập / Đăng ký
│       │   ├── profile/pages/ProfilePage.tsx    # Trang cá nhân (User/Admin/Shop dashboards)
│       │   ├── about/pages/AboutPage.tsx        # Giới thiệu
│       │   └── stores/pages/StoresPage.tsx      # Hệ thống showroom bản đồ
│       ├── components/layouts/
│       │   ├── Header.tsx       # Header + Menu dropdown danh mục
│       │   └── Footer.tsx       # Footer
│       ├── layouts/MainLayout.tsx  # Layout chính (Header + Outlet + Footer)
│       ├── routes/AppRoutes.tsx    # Định tuyến React Router
│       ├── utils/format.ts        # Hàm formatPrice tiền VND
│       └── App.tsx                # Root component
│
└── Documentation/
    ├── requirement.md          # Yêu cầu dự án
    ├── database.md             # Thiết kế cơ sở dữ liệu
    └── update-process.md       # File này
```

---

## ✅ Những gì ĐÃ HOÀN THÀNH

### 1. Frontend — Giao diện người dùng

| Trang | File | Trạng thái | Mô tả |
|-------|------|------------|-------|
| Trang chủ | `HomePage.tsx` | ✅ Xong | Banner video, Flash Sale, Gợi ý hôm nay, danh mục |
| Danh sách SP | `ProductListPage.tsx` | ✅ Xong | Lọc theo danh mục/giá/đánh giá, sắp xếp, tìm kiếm, phân trang |
| Chi tiết SP | `ProductDetailPage.tsx` | ✅ Xong | Gallery ảnh lớn + thumbnails, thông số kỹ thuật, nút mua |
| Đăng nhập | `LoginPage.tsx` | ✅ Xong | Form đăng nhập + đăng ký, gọi API Backend |
| Trang cá nhân | `ProfilePage.tsx` | ✅ Xong | Phân quyền 3 dashboard (User/Admin/Shop) |
| Giới thiệu | `AboutPage.tsx` | ✅ Xong | Trang about |
| Showroom | `StoresPage.tsx` | ✅ Xong | Bản đồ GPS showroom |
| Header | `Header.tsx` | ✅ Xong | Menu dropdown danh mục với thương hiệu (AMD, Intel, NVIDIA...) |

**Hỗ trợ hiển thị ảnh thật:**
- Tất cả các trang (HomePage, ProductListPage, ProductDetailPage, ProfilePage) đều có hàm `isImageUrl()` để phân biệt URL ảnh và emoji
- Nếu `imageEmoji` là URL → render thẻ `<img>` thật, nếu là emoji → render emoji như cũ

### 2. Backend — API Server

| API Endpoint | Method | Mô tả | Bảo mật |
|-------------|--------|-------|---------|
| `/api/auth/register` | POST | Đăng ký tài khoản user | Công khai |
| `/api/auth/login` | POST | Đăng nhập, trả về JWT token | Công khai |
| `/api/auth/profile` | GET | Lấy thông tin profile | Token |
| `/api/auth/profile` | PUT | Cập nhật profile | Token |
| `/api/auth/register-shop` | POST | Admin tạo tài khoản shop đối tác | Token + Admin |
| `/api/products` | GET | Danh sách SP (lọc, sắp xếp, phân trang) | Công khai |
| `/api/products/:id` | GET | Chi tiết sản phẩm | Công khai |
| `/api/products` | POST | Shop đăng bán sản phẩm mới | Token + Shop |
| `/api/shops` | GET | Danh sách gian hàng đối tác | Công khai |
| `/api/orders` | POST | Tạo đơn hàng mới | Token |
| `/api/orders` | GET | Lịch sử đơn hàng của user | Token |
| `/api/vouchers` | GET | Danh sách voucher | Công khai |
| `/api/vouchers` | POST | Tạo voucher mới | Token + Admin |
| `/api/showrooms` | GET | Danh sách showroom | Công khai |
| `/api/showrooms` | POST | Thêm showroom mới | Token + Admin |
| `/api/upload/product-images` | POST | Upload ảnh SP từ máy tính (multer) | Token |

### 3. Hệ thống Phân quyền (3 Role)

#### 👤 User (Khách hàng)
- Đăng ký / Đăng nhập
- Xem & chỉnh sửa thông tin cá nhân
- Xem lịch sử đơn hàng
- Xem & copy mã voucher

#### 🛡️ Admin (Quản trị viên)
- **Tài khoản mẫu:** `admin@geartech.com` / `adminpassword`
- Bảng thống kê tổng quan (số shop, voucher, showroom)
- Tạo tài khoản doanh nghiệp đối tác (register-shop)
- Quản lý & tạo mã giảm giá (voucher)
- Quản lý & thêm showroom GPS

#### 🏬 Shop (Doanh nghiệp đối tác)
- Xem thông tin gian hàng (tên, logo, rating, followers)
- **Đăng bán sản phẩm mới** với:
  - Thông tin cơ bản (tên, giá, danh mục, mô tả)
  - Upload ảnh từ máy tính (kéo thả hoặc bấm chọn, tối đa 6 ảnh)
  - Hoặc dán link ảnh URL từ internet
  - Chọn ảnh đại diện (★ CHÍNH) trong danh sách ảnh
  - Thông số kỹ thuật động (4 cặp key-value: CPU, RAM, SSD, VGA...)
- Xem danh sách sản phẩm đã đăng bán

### 4. Upload ảnh sản phẩm

- **Thư viện:** `multer` (Backend)
- **Lưu trữ ảnh:** `Backend/public/uploads/products/` (trên ổ cứng server)
- **MongoDB chỉ lưu:** URL đường dẫn (VD: `http://localhost:5000/uploads/products/product-xxx.jpg`)
- **Giới hạn:** Tối đa 6 ảnh/lần, mỗi ảnh ≤ 5MB
- **Định dạng:** JPEG, PNG, GIF, WEBP, AVIF
- **Frontend hỗ trợ:** Kéo thả (drag & drop) + Bấm chọn file + Dán link URL

---

## ⚙️ Cách chạy dự án

### Bước 1: Khởi động MongoDB
```bash
# Đảm bảo MongoDB đang chạy trên localhost:27017
mongod
```

### Bước 2: Khởi động Backend
```bash
cd Backend
npm install          # Cài dependencies (lần đầu)
node seed.js         # Tạo dữ liệu mẫu (lần đầu)
node index.js        # Chạy server trên port 5000
```

### Bước 3: Khởi động Frontend
```bash
cd Frontend
npm install          # Cài dependencies (lần đầu)
npm run dev          # Chạy dev server trên port 5173
```

### Tài khoản thử nghiệm
| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | admin@geartech.com | adminpassword |
| User | test@geartech.com | password123 |
| Shop | (Admin tạo từ dashboard) | (Admin đặt khi tạo) |

---

## 🔧 Thư viện & Công nghệ đang dùng

### Backend
| Package | Mục đích |
|---------|----------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Mã hóa mật khẩu |
| jsonwebtoken | JWT xác thực |
| cors | Cross-origin |
| dotenv | Biến môi trường |
| multer | Upload file ảnh |

### Frontend
| Package | Mục đích |
|---------|----------|
| react 19 | UI framework |
| react-router-dom | Routing |
| motion (framer-motion) | Animations |
| @phosphor-icons/react | Icon library |
| tailwindcss | CSS framework |
| vite | Build tool |

---

## 🚧 Những việc CẦN LÀM TIẾP (Gợi ý tuần sau)

### Ưu tiên cao
- [ ] **Giỏ hàng (Cart):** Thêm chức năng giỏ hàng cho User (thêm/xóa/sửa số lượng SP, tính tổng tiền)
- [ ] **Thanh toán (Checkout):** Luồng thanh toán hoàn chỉnh (chọn địa chỉ, áp mã voucher, xác nhận đơn)
- [ ] **Sản phẩm từ DB:** Hiện tại trang chủ + danh sách SP vẫn đọc từ `productsData.ts` (mock). Cần chuyển sang gọi API `GET /api/products` từ Backend

### Ưu tiên trung bình
- [ ] **Tìm kiếm sản phẩm:** Kết nối ô tìm kiếm trên Header với API Backend (đã có sẵn query search)
- [ ] **Đánh giá & Bình luận:** Cho phép User đánh giá sản phẩm sau khi mua
- [ ] **Quản lý đơn hàng cho Shop:** Shop xem đơn hàng liên quan đến sản phẩm của mình
- [ ] **Thông báo:** Hệ thống thông báo real-time (đơn hàng mới, trạng thái đơn...)

### Ưu tiên thấp
- [ ] **Responsive mobile:** Kiểm tra và tối ưu giao diện trên điện thoại
- [ ] **Dark mode toggle:** Nút chuyển đổi sáng/tối
- [ ] **Deploy:** Triển khai lên hosting (Vercel cho Frontend, Railway/Render cho Backend)
- [ ] **Tối ưu hiệu suất:** Code-splitting, lazy loading các trang

---

## 📝 Ghi chú kỹ thuật quan trọng

1. **File `.env` Backend** cần có:
   ```
   MONGO_URI=mongodb://localhost:27017/geartech
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

2. **Dữ liệu mock vs Database:**
   - `Frontend/src/features/products/data/productsData.ts` chứa dữ liệu sản phẩm tĩnh (đang dùng cho HomePage và ProductListPage)
   - Backend đã có API products hoạt động hoàn chỉnh, tuần sau nên chuyển Frontend sang gọi API thay vì đọc mock

3. **Ảnh sản phẩm upload** lưu tại `Backend/public/uploads/products/` — nếu xóa thư mục này thì ảnh cũ sẽ mất

4. **Token JWT** hết hạn sau 7 ngày, lưu trong `localStorage` với key `token`

---

*Tài liệu này được viết ngày 01/08/2026 để ghi nhận tiến độ phát triển dự án GearTech Marketplace.*
