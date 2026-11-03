# TÀI LIỆU HƯỚNG DẪN KIỂM THỬ CHỨC NĂNG ADMIN — GEARTECH ADMIN CENTRE

> Tài liệu được tạo theo yêu cầu của `Documentation/admin.md`. Mọi route, nút bấm, endpoint và trạng thái ghi trong tài liệu này đều khớp với source code thực tế tại thời điểm viết.

---

## MỤC LỤC

1. [Mục đích tài liệu](#1-mục-đích-tài-liệu)
2. [Danh sách Use Case](#2-danh-sách-use-case)
3. [Đặc tả và hướng dẫn kiểm thử từng Use Case](#3-đặc-tả-và-hướng-dẫn-kiểm-thử-từng-use-case)
4. [Kiểm thử ngoại lệ và bảo mật](#4-kiểm-thử-ngoại-lệ-và-bảo-mật)
5. [Bảng tổng hợp kết quả kiểm thử](#5-bảng-tổng-hợp-kết-quả-kiểm-thử)

---

## 1. MỤC ĐÍCH TÀI LIỆU

### 1.1. Mục tiêu kiểm thử

- Xác minh các chức năng của **Admin Centre** (khu vực quản trị viên mới redesign) hoạt động đúng với dữ liệu thật từ MongoDB.
- Xác minh phân quyền: chỉ tài khoản Admin được truy cập khu vực `/admin` và các API quản trị.
- Xác minh việc redesign KHÔNG làm hỏng chức năng của Customer và Shop Owner.

### 1.2. Phạm vi kiểm thử Admin

| Khu vực | Route | Chức năng chính |
|---|---|---|
| Dashboard | `/admin` | KPI toàn sàn, biểu đồ, cảnh báo, bảng dữ liệu nhanh |
| Báo cáo & thống kê | `/admin/analytics` | Doanh thu, tăng trưởng tài khoản, đơn hàng theo ngày |
| Quản lý người dùng | `/admin/users` | Tìm kiếm, lọc, phân trang, khóa/mở khóa, tạo tài khoản |
| Quản lý cửa hàng | `/admin/shops` | Duyệt/từ chối/khóa shop, lọc theo trạng thái |
| Quản lý sản phẩm | `/admin/products` | Xem sản phẩm toàn sàn, ẩn/hiện sản phẩm |
| Danh mục | `/admin/categories` | Thêm/sửa/ẩn/xóa danh mục cha & con, icon |
| Thương hiệu | `/admin/brands` | Quản lý thương hiệu |
| Đơn hàng | `/admin/orders` | Giám sát đơn toàn sàn, lọc theo trạng thái |
| Khuyến mãi | `/admin/vouchers` | Tạo/sửa/vô hiệu hóa voucher, phân biệt voucher toàn sàn và voucher shop |
| Hệ thống | `/admin/showrooms` | Quản lý showroom GPS |

### 1.3. Môi trường cần chuẩn bị

- **Node.js** (đã cài) — backend Express chạy ở `Backend/`, frontend Vite ở `Frontend/`.
- **MongoDB** đang chạy tại `mongodb://localhost:27017/gear_tech` (xem `Backend/.env` → `MONGODB_URI`).
- Trình duyệt hiện đại (Chrome/Edge/Firefox).

### 1.4. Điều kiện tiên quyết

1. Khởi động backend:
   ```bash
   cd Backend
   node index.js
   # → Server backend GearTech đang chạy trên cổng 5000
   ```
2. Khởi động frontend:
   ```bash
   cd Frontend
   npm run dev
   # → http://localhost:5173
   ```
3. Tài khoản kiểm thử (tồn tại trong database thật):
   - **Admin:** `admin@geartech.vn` / `123456`
   - **Shop (đối chiếu phân quyền):** `shop@geartech.vn` / `123456`
   - **Customer (đối chiếu phân quyền):** `customer@gmail.com` / `123456`
4. Dữ liệu kiểm thử: đã có sẵn trong MongoDB (38 người dùng, 14 shop, 14 sản phẩm, 5 đơn hàng tại thời điểm viết tài liệu — con số thực tế có thể khác tùy dữ liệu của bạn).

---

## 2. DANH SÁCH USE CASE

| Mã UC | Tên Use Case | Mô tả | Tác nhân | Ưu tiên | Trạng thái triển khai |
|---|---|---|---|---|---|
| UC-01 | Đăng nhập Admin | Đăng nhập tài khoản admin và vào Admin Centre | Admin | Cao | Đã triển khai |
| UC-02 | Phân quyền truy cập Admin Centre | Chặn Customer/Shop truy cập `/admin` và API quản trị | Admin, Shop, Customer | Cao | Đã triển khai |
| UC-03 | Xem Dashboard tổng quan | KPI toàn sàn, biểu đồ, cảnh báo, bảng nhanh | Admin | Cao | Đã triển khai |
| UC-04 | Xem báo cáo & thống kê | Doanh thu theo ngày, tăng trưởng tài khoản, bộ lọc thời gian | Admin | Cao | Đã triển khai |
| UC-05 | Tìm kiếm & lọc tài khoản | Tìm theo tên/email/SĐT, lọc vai trò + trạng thái, phân trang | Admin | Cao | Đã triển khai |
| UC-06 | Khóa/mở khóa tài khoản | Chuyển trạng thái `active` ↔ `locked` có xác nhận | Admin | Cao | Đã triển khai |
| UC-07 | Tạo tài khoản mới | Admin tạo tài khoản user/shop khi người dùng không tự đăng ký được | Admin | Trung bình | Đã triển khai |
| UC-08 | Quản lý & duyệt shop | Xem danh sách shop, duyệt/từ chối/khóa, lọc trạng thái | Admin | Cao | Đã triển khai |
| UC-09 | Quản lý sản phẩm toàn sàn | Xem, tìm kiếm, lọc sản phẩm mọi shop; ẩn/hiện sản phẩm | Admin | Cao | Đã triển khai |
| UC-10 | Quản lý danh mục cha/con | Thêm/sửa/ẩn/xóa danh mục, hỗ trợ phân cấp | Admin | Cao | Đã triển khai |
| UC-11 | Quản lý thương hiệu | Thêm/sửa/xóa thương hiệu | Admin | Trung bình | Đã triển khai |
| UC-12 | Giám sát đơn hàng toàn sàn | Xem, lọc theo trạng thái đơn toàn hệ thống | Admin | Cao | Đã triển khai |
| UC-13 | Quản lý voucher | Tạo/sửa/vô hiệu hóa voucher; phân biệt voucher sàn & shop | Admin | Trung bình | Đã triển khai |
| UC-14 | Quản lý showroom GPS | Thêm/sửa/xóa showroom bản đồ | Admin | Thấp | Đã triển khai |
| UC-15 | Thu gọn sidebar & responsive | Sidebar thu gọn desktop, drawer mobile | Admin | Thấp | Đã triển khai |
| UC-16 | Đăng xuất | Thoát khỏi Admin Centre | Admin | Cao | Đã triển khai |

**Ghi chú về nghiệp vụ chưa có:** hệ thống hiện **chưa có** quy trình duyệt sản phẩm (sản phẩm của shop được đăng bán trực tiếp), **chưa có** quy tắc tính phí/hoa hồng nền tảng (Dashboard chỉ hiển thị "Tổng giá trị đơn hàng" và "Giá trị đơn hoàn tất"), **chưa có** nhật ký hoạt động hệ thống. Do đó không có menu/use case cho các mục này — đúng nguyên tắc "không tạo menu dẫn đến trang trống".

---

## 3. ĐẶC TẢ VÀ HƯỚNG DẪN KIỂM THỬ TỪNG USE CASE

> Cột "Kết quả thực tế" và "Trạng thái" để trống (hoặc `Not Tested`) là để người kiểm thử tự đi sau khi thực hiện. Những UC tôi đã chạy xác minh thật trong môi trường dev được ghi chú rõ ở phần "Ghi chú".

### UC-01: Đăng nhập Admin

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Đăng nhập tài khoản Admin thành công và truy cập được Admin Centre |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Backend + Frontend + MongoDB đang chạy; tài khoản Admin tồn tại |
| **Dữ liệu đầu vào** | Email: `admin@geartech.vn`, Mật khẩu: `123456` |
| **Các bước thực hiện** | 1. Mở `http://localhost:5173/login` <br>2. Nhập email và mật khẩu Admin <br>3. Bấm nút **ĐĂNG NHẬP HỆ THỐNG** <br>4. Truy cập `http://localhost:5173/admin` |
| **Kết quả mong đợi** | Đăng nhập thành công; trang `/admin` hiển thị Dashboard với sidebar navy "GearTech ADMIN CENTRE", badge "QUẢN TRỊ VIÊN" ở góc phải header; các thẻ KPI hiển thị số liệu thật |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: đăng nhập admin thành công và Dashboard tải dữ liệu thật (38 người dùng, 14 shop, 14 sản phẩm, 5 đơn tại thời điểm kiểm). |

### UC-02: Phân quyền truy cập Admin Centre

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Customer và Shop Owner không truy cập được khu vực `/admin` và không gọi được API quản trị |
| **Tác nhân** | Customer, Shop Owner |
| **Điều kiện trước** | Đã đăng nhập tài khoản Customer hoặc Shop; hoặc chưa đăng nhập |
| **Dữ liệu đầu vào** | URL `http://localhost:5173/admin`; API `GET /api/auth/admin/overview` |
| **Các bước thực hiện** | 1. Đăng nhập tài khoản `shop@geartech.vn` / `123456` <br>2. Truy cập trực tiếp `http://localhost:5173/admin` <br>3. Lặp lại với tài khoản `customer@gmail.com` <br>4. (Kỹ thuật) Gọi `curl http://localhost:5000/api/auth/admin/overview` kèm token của shop: `Authorization: Bearer <token_shop>` |
| **Kết quả mong đợi** | Bước 2-3: frontend tự chuyển hướng về `/profile` (guard trong `AdminLayout.tsx`). Bước 4: backend trả HTTP **403** với thông báo từ chối; không có token trả HTTP **401** |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: token shop gọi API admin → 403; không token → 401; customer/shop vào `/admin` bị redirect về `/profile`. |

### UC-03: Xem Dashboard tổng quan

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Hiển thị đúng KPI toàn sàn, biểu đồ hoạt động, đơn theo trạng thái, cảnh báo và bảng dữ liệu nhanh từ dữ liệu thật |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin (UC-01) |
| **Dữ liệu đầu vào** | Không (trang tự tải). Bộ lọc thời gian: 7 ngày / 30 ngày |
| **Các bước thực hiện** | 1. Vào `/admin` <br>2. Đối chiếu 8 thẻ KPI với dữ liệu MongoDB (tổng người dùng, cửa hàng, sản phẩm, đơn hàng, tổng giá trị đơn, giá trị đơn hoàn tất, shop chờ duyệt, tài khoản bị khóa) <br>3. Bấm chuyển giữa **7 ngày** và **30 ngày**, quan sát biểu đồ thay đổi <br>4. Cuộn xuống xem 4 bảng nhanh: Đơn hàng mới nhất / Cửa hàng mới / Tài khoản mới / Sản phẩm mới <br>5. Bấm vào một dòng trong bảng nhanh |
| **Kết quả mong đợi** | Thẻ KPI có skeleton loading khi tải; số liệu khớp database (đối chiếu nhanh bằng cách đếm bản ghi trong MongoDB Compass); biểu đồ có tooltip theo ngày (title attribute); cảnh báo chỉ hiện khi có dữ liệu thật; bấm dòng mở đúng trang quản lý tương ứng |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: KPI hiển thị đúng (161.910.000 ₫ tổng giá trị đơn, 131.000.000 ₫ đơn hoàn tất, 1 tài khoản bị khóa → cảnh báo hiện đúng). Lưu ý nghiệp vụ: hệ thống **chưa có quy tắc hoa hồng** nên không có chỉ tiêu "doanh thu nền tảng" — đây là thiết kế đúng theo yêu cầu. |

### UC-04: Xem báo cáo & thống kê

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Xem doanh thu theo ngày, tăng trưởng tài khoản, đơn mới theo ngày với bộ lọc thời gian |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Bộ lọc 7 ngày / 30 ngày |
| **Các bước thực hiện** | 1. Vào `/admin/analytics` <br>2. Bấm **30 ngày** rồi quay lại **7 ngày** <br>3. Rê chuột lên các cột biểu đồ <br>4. Đọc khối "Phương pháp tính" cuối trang |
| **Kết quả mong đợi** | Biểu đồ doanh thu chỉ tính đơn `completed`; ngày không có đơn hiển thị cột rỗng; khi cả kỳ không có doanh thu hiển thị thông báo "Chưa có đơn hoàn tất nào trong kỳ đã chọn"; tooltip hiển thị ngày + số liệu |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: trang tải với số liệu thật (131.000.000 ₫ / 4 đơn hoàn thành). |

### UC-05: Tìm kiếm & lọc tài khoản

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Tìm và lọc danh sách tài khoản theo từ khóa, vai trò, trạng thái; phân trang |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Từ khóa: `admin` hoặc số điện thoại tồn tại; bộ lọc vai trò: Khách hàng (User); trạng thái: Bị khóa |
| **Các bước thực hiện** | 1. Vào `/admin/users` <br>2. Nhập từ khóa vào ô **Tìm theo tên, email, số điện thoại...** <br>3. Chọn combobox vai trò = **Khách hàng (User)** rồi **Chủ cửa hàng (Shop)** <br>4. Chọn trạng thái = **Bị khóa** <br>5. Bấm **Sau**/Trước để phân trang |
| **Kết quả mong đợi** | Bảng cập nhật theo từng bộ lọc; số trang thay đổi theo tổng số bản ghi (`total` từ API `GET /api/auth/users`); danh sách trống hiển thị trạng thái rỗng, không lỗi |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: `/admin/users?role=user` tải đúng với combobox vai trò preselect "Khách hàng (User)". |

### UC-06: Khóa/mở khóa tài khoản

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Khóa và mở khóa tài khoản người dùng, tài khoản bị khóa không thể đăng nhập/gọi API |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin; có tài khoản khách hàng thử nghiệm |
| **Dữ liệu đầu vào** | Một tài khoản khách hàng (không phải chính tài khoản Admin) |
| **Các bước thực hiện** | 1. Vào `/admin/users` <br>2. Bấm nút khóa (hình ổ khóa) của một tài khoản khách hàng <br>3. Xác nhận trong hộp thoại confirm <br>4. Đăng xuất, thử đăng nhập lại bằng tài khoản vừa khóa <br>5. Đăng nhập lại Admin, mở khóa tài khoản đó <br>6. Thử khóa chính tài khoản Admin đang đăng nhập |
| **Kết quả mong đợi** | Bước 3: badge trạng thái đổi thành "Bị khóa"; thông báo thành công. Bước 4: đăng nhập bị từ chối HTTP 403 với thông báo "Tài khoản của bạn đã bị khóa...". Bước 5: mở khóa thành công, đăng nhập lại bình thường. Bước 6: backend từ chối với thông báo "Quản trị viên không thể tự khóa tài khoản của chính mình!" |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Endpoint: `PUT /api/auth/users/:id/status`. Đã xác minh tự động trong vòng test trước: khóa → login 403, token cũ gọi API 403, mở khóa → hoạt động lại. Tài khoản bị khóa vẫn đăng nhập bị chặn ngay cả khi dùng token cũ (middleware `auth.js` kiểm tra `status === 'locked'` ở mọi request). |

### UC-07: Tạo tài khoản mới

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Admin tạo tài khoản khách hàng/chủ shop khi người dùng không tự đăng ký được |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Họ tên, email (chưa tồn tại), SĐT (tùy chọn), mật khẩu tạm ≥ 6 ký tự, vai trò (user/shop) |
| **Các bước thực hiện** | 1. Vào `/admin/users` <br>2. Bấm **Thêm tài khoản** <br>3. Điền form, ví dụ email `testadmin_create@geartech.test`, mật khẩu `tam123456` <br>4. Bấm **Tạo tài khoản** <br>5. Thử tạo lại với cùng email |
| **Kết quả mong đợi** | Bước 4: thông báo thành công + danh sách làm mới, tài khoản xuất hiện. Bước 5: báo lỗi "Email này đã được sử dụng trên hệ thống." Mật khẩu được bcrypt hóa trong DB (không lưu plain text, không trả về response) |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Endpoint: `POST /api/auth/users`. Đã xác minh tự động: tạo user mới → 201, đăng nhập bằng tài khoản mới → 200. |

### UC-08: Quản lý & duyệt shop

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Xem danh sách shop, lọc trạng thái, duyệt/từ chối yêu cầu mở shop, khóa shop |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin; có shop ở trạng thái `pending` (chờ duyệt) |
| **Dữ liệu đầu vào** | Nút duyệt/từ chối trên dòng shop pending; lý do từ chối (tùy chọn) |
| **Các bước thực hiện** | 1. Vào `/admin/shops` <br>2. Lọc trạng thái = **pending** <br>3. Duyệt một shop chờ duyệt <br>4. Kiểm tra Dashboard `/admin` → thẻ "Shop chờ duyệt" giảm còn 0 <br>5. Thử khóa (locked) một shop rồi mở lại |
| **Kết quả mong đợi** | Shop chuyển `active`; chủ shop tự động được nâng quyền (backend tự xử lý trong `PUT /api/shops/:id/status`); shop bị khóa không đăng được sản phẩm mới; Dashboard cập nhật |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Nếu không có shop `pending`, tạo thử bằng cách đăng ký user mới và gửi yêu cầu mở shop qua `/api/shops/apply`. |

### UC-09: Quản lý sản phẩm toàn sàn

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Xem toàn bộ sản phẩm mọi shop, tìm kiếm, lọc trạng thái, ẩn/hiện sản phẩm |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Từ khóa tìm kiếm; tab Tất cả / Đang bán / Bị ẩn-ngừng bán |
| **Các bước thực hiện** | 1. Vào `/admin/products` <br>2. Đối chiếu tổng số dòng với thẻ "Tổng sản phẩm" ở Dashboard <br>3. Bấm tab **Đang bán** rồi **Bị ẩn / ngừng bán** <br>4. Tìm một sản phẩm theo tên <br>5. Bấm **Ẩn** trên một sản phẩm, xác nhận <br>6. Chuyển sang tab "Bị ẩn / ngừng bán", bấm **Hiện lại** |
| **Kết quả mong đợi** | Bảng hiển thị tên, shop sở hữu (link mở trang shop công khai), giá, tồn kho, badge trạng thái; ẩn/hiện thành công có thông báo; sản phẩm ẩn không còn hiển thị cho khách trên `/ProductPage` |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Endpoint: `GET /api/products?includeInactive=true&status=all` và `PUT /api/products/:id/status` (backend chỉ cho shop chủ sở hữu hoặc admin). Admin **không sửa trực tiếp tồn kho** của shop — đúng nguyên tắc. |

### UC-10: Quản lý danh mục cha/con

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Thêm/sửa/ẩn/xóa danh mục; danh mục con hiển thị đúng cấp dưới danh mục cha |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Tên danh mục mới (ví dụ `Phụ kiện MỚI TEST`); danh mục cha (tùy chọn) |
| **Các bước thực hiện** | 1. Vào `/admin/categories` <br>2. Thêm danh mục cha mới <br>3. Thêm danh mục con thuộc danh mục vừa tạo <br>4. Kiểm tra navbar trang chủ `/Trang-chu` → hover **Danh Mục** → danh mục con phải nằm trong khung phải của danh mục cha, không ngang cấp <br>5. Thử xóa danh mục cha đang chứa danh mục con <br>6. Thử xóa danh mục đang có sản phẩm |
| **Kết quả mong đợi** | Bước 4: navbar cập nhật theo DB ngay. Bước 5: bị chặn với thông báo "đang chứa ... danh mục con". Bước 6: bị chặn với thông báo "đang có ... sản phẩm trực thuộc" |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Endpoint: `GET/POST /api/categories`, `PUT /api/categories/:id`, `PUT /api/categories/:id/status`, `DELETE /api/categories/:id`. |

### UC-11: Quản lý thương hiệu

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Thêm/sửa thương hiệu; thương hiệu mới xuất hiện ở bộ lọc và tab Thương hiệu trên navbar |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Tên thương hiệu, logo (emoji), mô tả |
| **Các bước thực hiện** | 1. Vào `/admin/brands` <br>2. Thêm thương hiệu mới <br>3. Vào trang chủ → hover **Danh Mục** → tab **THƯƠNG HIỆU NỔI TIẾNG** <br>4. Tìm sản phẩm theo thương hiệu mới tại `/ProductPage` |
| **Kết quả mong đợi** | Thương hiệu mới hiển thị trên navbar (dữ liệu thật từ `GET /api/brands`) và tìm được sản phẩm khi có sản phẩm gắn thương hiệu đó |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |

### UC-12: Giám sát đơn hàng toàn sàn

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Xem mọi đơn hàng hệ thống, lọc theo trạng thái, xem chi tiết |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin; có ít nhất 1 đơn hàng trong DB |
| **Dữ liệu đầu vào** | Bộ lọc trạng thái (pending / confirmed / shipping / completed / cancelled) |
| **Các bước thực hiện** | 1. Vào `/admin/orders` <br>2. Lần lượt chọn từng trạng thái <br>3. Đối chiếu số đơn mỗi trạng thái với Dashboard <br>4. Xem chi tiết 1 đơn (sản phẩm, số lượng, giá tại thời điểm mua, thanh toán) |
| **Kết quả mong đợi** | Danh sách khớp API `GET /api/orders/admin`; Admin **chỉ giám sát** — luồng xử lý đơn (xác nhận/giao/hủy) thuộc về chủ shop, không bị thay đổi |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |

### UC-13: Quản lý voucher

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Tạo/sửa/vô hiệu hóa voucher; phân biệt voucher toàn sàn (shop_id = null) và voucher của shop |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Code voucher (in hoa), loại giảm giá, giá trị, hạn dùng |
| **Các bước thực hiện** | 1. Vào `/admin/vouchers` <br>2. Tạo voucher mới (ví dụ code `TESTADMIN100`) <br>3. Vô hiệu hóa bằng nút tròn (CheckCircle/XCircle) <br>4. Kiểm tra voucher vẫn còn trong danh sách (bộ lọc **TẠM KHÓA**) <br>5. Thử áp dụng voucher đã vô hiệu hóa khi đặt hàng |
| **Kết quả mong đợi** | Bước 4: voucher vẫn tồn tại trong DB (không bị xóa khi vô hiệu hóa). Bước 5: backend từ chối áp dụng với thông báo "Mã giảm giá này hiện đang bị tạm khóa..." |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Admin nhìn thấy cả voucher của shop (trường `shopId` khác null) nhưng vô hiệu hóa được mọi voucher theo quyền admin; xóa voucher đã được dùng sẽ tự chuyển `inactive` thay vì xóa cứng. |

### UC-14: Quản lý showroom GPS

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Thêm/sửa/xóa showroom hiển thị trên bản đồ trang Giới thiệu |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Tên, địa chỉ, SĐT, giờ mở cửa, lat/lng, city (hcm/hanoi/danang), mapUrl |
| **Các bước thực hiện** | 1. Vào `/admin/showrooms` <br>2. Thêm showroom mới <br>3. Sửa điện thoại của showroom đó <br>4. Xóa showroom vừa tạo, xác nhận |
| **Kết quả mong đợi** | Thêm/sửa/xóa thành công có thông báo; danh sách cập nhật; thiếu trường bắt buộc (lat/lng) → báo lỗi 400 từ backend |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động vòng trước: POST → 201, PUT → 200, DELETE → 200 trên chính endpoint này. |

### UC-15: Thu gọn sidebar & responsive

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Sidebar thu gọn/mở rộng trên desktop; drawer trên mobile |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Không |
| **Các bước thực hiện** | 1. Bấm nút tròn cạnh sidebar để thu gọn (chỉ còn icon) <br>2. Bấm lại để mở rộng <br>3. Thu hẹp cửa sổ trình duyệt < 1024px (hoặc dùng DevTools mobile) <br>4. Bấm nút ☰ trên header, chọn một mục menu, kiểm tra drawer tự đóng |
| **Kết quả mong đợi** | Sidebar thu gọn còn ~68px và ngược lại; mobile hiển thị drawer trượt với overlay; chọn menu xong drawer đóng và nội dung chuyển trang |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |
| **Ghi chú** | Đã xác minh tự động: desktop 1440px hiển thị sidebar đủ; mobile 390px hiển thị nút ☰ và drawer hoạt động. |

### UC-16: Đăng xuất

| Mục | Nội dung |
|---|---|
| **Mục tiêu** | Thoát an toàn khỏi Admin Centre |
| **Tác nhân** | Admin |
| **Điều kiện trước** | Đã đăng nhập Admin |
| **Dữ liệu đầu vào** | Không |
| **Các bước thực hiện** | 1. Bấm avatar ở header <br>2. Chọn **Đăng xuất** |
| **Kết quả mong đợi** | Xóa token/localStorage, chuyển về `/login`; truy cập lại `/admin` bị đưa về `/login` |
| **Kết quả thực tế** | _(người kiểm thử tự ghi)_ |
| **Trạng thái** | Not Tested |

---

## 4. KIỂM THỬ NGOẠI LỆ VÀ BẢO MẬT

| Mã | Tình huống | Cách thực hiện | Kết quả mong đợi | Trạng thái |
|---|---|---|---|---|
| EX-01 | Đăng nhập sai mật khẩu | `/login`, nhập mật khẩu sai | Thông báo "Tài khoản hoặc mật khẩu không chính xác.", không tạo token | Not Tested |
| EX-02 | Customer/Shop truy cập route Admin | Đăng nhập shop/customer, vào `/admin` | Redirect về `/profile`, không thấy dữ liệu admin | Not Tested |
| EX-03 | Gọi API quản trị không quyền | `curl /api/auth/admin/overview` với token shop / không token | HTTP 403 / 401 | **Pass** (đã xác minh tự động: shop token → 403, không token → 401) |
| EX-04 | Tìm kiếm không có kết quả | `/admin/products`, tìm chuỗi ngẫu nhiên | Hiển thị trạng thái rỗng "Không tìm thấy sản phẩm nào phù hợp bộ lọc", không lỗi màn hình | Not Tested |
| EX-05 | Danh sách rỗng | `/admin/vouchers` khi DB không có voucher / `/admin/shops` lọc pending khi không có | Hiển thị trạng thái rỗng, không crash | Not Tested |
| EX-06 | Dữ liệu không hợp lệ | Tạo voucher thiếu code; tạo showroom thiếu lat/lng | Backend trả HTTP 400 với thông báo tiếng Việt rõ ràng | Not Tested |
| EX-07 | Bản ghi không tồn tại | Gọi `PUT /api/products/<id_không_tồn_tại>/status` | HTTP 404 "Không tìm thấy sản phẩm." | Not Tested |
| EX-08 | Lỗi kết nối API/MongoDB | Dừng backend rồi mở `/admin` | Thẻ lỗi "Không tải được dữ liệu tổng quan." + nút Thử lại | Not Tested |
| EX-09 | Xóa dữ liệu đang được tham chiếu | Xóa danh mục còn sản phẩm/con (UC-10 bước 5-6) | Backend từ chối với thông báo đếm số bản ghi liên quan | Not Tested |
| EX-10 | Admin tự khóa chính mình | UC-06 bước 6 | Backend từ chối: "Quản trị viên không thể tự khóa tài khoản của chính mình!" | Not Tested |
| EX-11 | Khóa tài khoản Admin khác | Gọi API khóa một user có role=admin | Backend từ chối: "Không thể khóa tài khoản quản trị viên!" | Not Tested |
| EX-12 | Tài khoản bị khóa dùng token cũ | Khóa tài khoản rồi gọi API bằng token cũ | HTTP 403 `isLocked: true` từ middleware — phiên cũ cũng bị chặn | Not Tested |

---

## 5. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ

| Chỉ số | Giá trị |
|---|---|
| Tổng số Use Case (bao gồm ngoại lệ) | **28** |
| Pass | **1** (EX-03 — xác minh tự động qua API) |
| Fail | **0** |
| Blocked | **0** |
| Not Tested | **27** |

### Danh sách lỗi phát hiện trong quá trình phát triển (đã xử lý)

| Lỗi | Mức độ | Trạng thái |
|---|---|---|
| Thiếu import `Order` trong `routes/shops.js` khiến endpoint thống kê shop lỗi 500 | Nghiêm trọng | Đã sửa |
| Icon import sai tên thư viện (`CartSimple`, `FolderTree` không tồn tại trong @phosphor-icons/react) làm build fail | Thấp | Đã sửa |
| Khai báo trùng `interface NavItem` trong `AdminLayout.tsx` | Thấp | Đã sửa |

### Lưu ý cho người kiểm thử

1. Các trạng thái `Not Tested` chưa được đánh giá — hãy thực hiện theo từng bước và tự điền kết quả.
2. Số liệu minh họa trong tài liệu (38 users, 14 shops...) là **dữ liệu thực tại thời điểm viết**, sẽ khác với môi trường của bạn.
3. Nếu dashboard hiển thị số 0 ở mọi KPI, kiểm tra backend đã chạy và `MONGODB_URI` trong `Backend/.env` trỏ đúng database `gear_tech`.
4. Chức năng **chưa triển khai** (ghi rõ để tránh nhầm lẫn): duyệt sản phẩm (chưa có quy trình), hoa hồng/doanh thu nền tảng (chưa có quy tắc tính phí), nhật ký hoạt động hệ thống (chưa có collection/log API).
