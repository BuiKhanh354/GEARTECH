# HƯỚNG DẪN KIỂM THỬ TÍNH NĂNG VÀ USE CASE KHÁCH HÀNG (CUSTOMER) — GEARTECH

Tài liệu hướng dẫn kiểm thử nghiệp vụ chi tiết cho khu vực Khách hàng (Customer) trên sàn thương mại điện tử GEARTECH. Dựa trên source code thực tế, cấu trúc Router, Schema MongoDB và API hiện hành.

---

## PHẦN 1 — GIỚI THIỆU

### 1.1. Mục đích tài liệu
Tài liệu cung cấp hướng dẫn kiểm thử đầu-cuối (End-to-End) cho tất cả các tính năng thuộc phân hệ Khách hàng (Customer). Hỗ trợ kiểm thử viên (Tester), lập trình viên (Developer) và quản trị viên (Admin) xác minh tính toàn vẹn của dữ liệu, trải nghiệm người dùng (UX) và tính chính xác của các quy tắc nghiệp vụ (giỏ hàng, giữ giá 48h, voucher, trừ kho, khóa quyền đặt hàng).

### 1.2. Phạm vi chức năng Customer
1. **Điều hướng & Danh mục:** Header/Navbar, tìm kiếm từ khóa, danh mục phân cấp cha - con (bao gồm Phụ kiện công nghệ - Accessories).
2. **Trang chủ & Khám phá:** Banner trình chiếu, sản phẩm nổi bật, flash sale, danh sách gian hàng đối tác.
3. **Danh sách sản phẩm:** Bộ lọc danh mục, thương hiệu, khoảng giá, đánh giá sao, sắp xếp và phân trang.
4. **Chi tiết sản phẩm:** Thông tin thông số, kiểm tra tồn kho, chọn số lượng, thêm vào giỏ, mua ngay, xem gian hàng, đánh giá và bình luận.
5. **Giỏ hàng & Khóa giá:** Xem giỏ, tăng/giảm số lượng, xóa sản phẩm, chọn mục thanh toán, bảo lưu giá ưu đãi 48 giờ, áp dụng voucher.
6. **Thanh toán & Đặt hàng (Checkout):** Địa chỉ giao nhận, phương thức vận chuyển, hình thức thanh toán (COD, Chuyển khoản VietQR, MoMo), trừ tồn kho, tạo đơn hàng multi-shop độc lập.
7. **Hồ sơ cá nhân & Đơn mua:** Cập nhật thông tin, lịch sử đơn hàng, chi tiết đơn, hủy đơn hàng, thanh toán bù đơn chưa trả tiền.
8. **Đánh giá sản phẩm:** Đánh giá kèm số sao và hình ảnh sau khi đơn hàng hoàn tất (`completed`).
9. **Bảo mật & Phân quyền:** Ngăn chặn đặt hàng khi bị Admin khóa quyền đặt hàng, bảo vệ đơn hàng cá nhân.

### 1.3. Công nghệ và môi trường kiểm thử
- **Frontend:** React 19, TypeScript, Vite, TailwindCSS, Zustand (Cart Store), Motion, Phosphor Icons.
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Authentication, Multer.
- **URL Frontend cục bộ:** `http://localhost:5173`
- **URL Backend API:** `http://localhost:5000/api`
- **Database:** MongoDB `mongodb://127.0.0.1:27017/gear_tech`

### 1.4. Điều kiện chuẩn bị trước khi kiểm thử
1. Backend server đang chạy tại port 5000 (`npm run dev` trong thư mục `Backend`).
2. Frontend dev server đang chạy tại port 5173 (`npm run dev` trong thư mục `Frontend`).
3. Dịch vụ MongoDB đang hoạt động tại port 27017 với database `gear_tech`.
4. Tài khoản kiểm thử mẫu:
   - Khách hàng hoạt động: `customer_test@geartech.vn` / `password123`
   - Quản trị viên (để khóa/mở quyền): `admin@geartech.vn` / mật khẩu quản trị
   - Chủ shop (để xử lý đơn): `shop_test@geartech.vn` / mật khẩu shop

---

## PHẦN 2 — DANH SÁCH USE CASE

| Mã UC | Tên Use Case | Mô tả | Tác nhân | Mức độ ưu tiên | Trạng thái triển khai |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UC-01** | Đăng ký tài khoản | Tạo tài khoản khách hàng mới với email và mật khẩu | Khách vãng lai | Cao | Đã triển khai |
| **UC-02** | Đăng nhập & Đăng xuất | Xác thực tài khoản qua JWT, phân quyền truy cập | Khách hàng | Cao | Đã triển khai |
| **UC-03** | Xem trang chủ | Xem danh mục động, sản phẩm flash sale, sản phẩm bán chạy | Mọi người dùng | Cao | Đã triển khai |
| **UC-04** | Tìm kiếm sản phẩm | Tìm thiết bị theo từ khóa trên thanh header gợi ý | Mọi người dùng | Cao | Đã triển khai |
| **UC-05** | Lọc và sắp xếp sản phẩm | Lọc theo danh mục (cha/con), thương hiệu, giá, sao và sắp xếp | Mọi người dùng | Cao | Đã triển khai |
| **UC-06** | Xem chi tiết sản phẩm | Xem ảnh, mô tả, tồn kho, giá ưu đãi, thông tin shop | Mọi người dùng | Cao | Đã triển khai |
| **UC-07** | Xem trang gian hàng | Xem hồ sơ shop, banner, điểm đánh giá và sản phẩm shop bán | Mọi người dùng | Trung bình | Đã triển khai |
| **UC-08** | Thêm sản phẩm vào giỏ | Thêm từ trang chi tiết hoặc quick-add trang chủ, chống duplicate | Mọi người dùng | Cao | Đã triển khai |
| **UC-09** | Cập nhật số lượng giỏ hàng | Tăng/giảm số lượng, kiểm tra không vượt tồn kho tối đa | Mọi người dùng | Cao | Đã triển khai |
| **UC-10** | Chọn mục & Xóa giỏ hàng | Chọn/bỏ chọn mặt hàng, xóa từng sản phẩm hoặc xóa mục đã chọn | Mọi người dùng | Cao | Đã triển khai |
| **UC-11** | Áp dụng Voucher | Nhập mã voucher sàn hoặc shop, kiểm tra minOrderValue, hạn dùng | Khách hàng | Cao | Đã triển khai |
| **UC-12** | Đặt hàng (Checkout) | Điền thông tin giao hàng, chọn vận chuyển, thanh toán, trừ kho | Khách hàng | Cao | Đã triển khai |
| **UC-13** | Xem lịch sử đơn hàng | Xem danh sách đơn mua lọc theo trạng thái: Chờ xác nhận, Đang giao... | Khách hàng | Cao | Đã triển khai |
| **UC-14** | Xem chi tiết đơn hàng | Xem bảng sản phẩm, giá lúc mua, địa chỉ nhận và đơn vị giao | Khách hàng | Cao | Đã triển khai |
| **UC-15** | Hủy đơn hàng | Khách hàng tự hủy đơn khi đơn còn ở trạng thái `pending` | Khách hàng | Trung bình | Đã triển khai |
| **UC-16** | Cập nhật hồ sơ cá nhân | Sửa họ tên, số điện thoại, ngày sinh, địa chỉ nhận hàng mặc định | Khách hàng | Trung bình | Đã triển khai |
| **UC-17** | Đánh giá sản phẩm | Đánh giá sao, nhận xét cho sản phẩm đã mua có đơn `completed` | Khách hàng | Trung bình | Đã triển khai |
| **UC-18** | Kiểm soát khóa đặt hàng | Xử lý thông báo rõ ràng khi Admin tạm khóa quyền đặt hàng | Khách hàng | Cao | Đã triển khai |

---

## PHẦN 3 — HƯỚNG DẪN KIỂM THỬ CHI TIẾT

### UC-01: Đăng ký tài khoản khách hàng
- **Mục tiêu:** Cho phép người dùng mới tạo tài khoản khách hàng trên sàn.
- **Tác nhân:** Khách vãng lai (Guest).
- **Điều kiện trước:** Chưa đăng nhập.
- **Dữ liệu đầu vào:** Họ tên: "Nguyễn Văn A", Email: `nguyenvana_test@gmail.com`, Mật khẩu: `Aa@123456`, Xác nhận mật khẩu: `Aa@123456`.
- **Các bước thực hiện:**
  1. Truy cập `http://localhost:5173/login`.
  2. Bấm tab **ĐĂNG KÝ**.
  3. Nhập đầy đủ thông tin vào các trường tương ứng.
  4. Bấm nút **TẠO TÀI KHOẢN GEARTECH**.
- **Kết quả mong đợi:**
  - Hệ thống thông báo tạo tài khoản thành công.
  - Tự động chuyển về giao diện đăng nhập hoặc tự đăng nhập và lưu JWT token.
- **Kết quả thực tế:** Pass (API `/api/auth/register` mã hóa mật khẩu bcrypt và khởi tạo bản ghi `Customer` đồng bộ).
- **Trạng thái:** **Pass**

---

### UC-02: Đăng nhập và Đăng xuất
- **Mục tiêu:** Xác thực tài khoản người dùng và hủy phiên đăng nhập an toàn.
- **Tác nhân:** Khách hàng đã có tài khoản.
- **Điều kiện trước:** Tài khoản đã được tạo và trạng thái `active`.
- **Dữ liệu đầu vào:** Email: `customer_test@geartech.vn`, Mật khẩu: `password123`.
- **Các bước thực hiện:**
  1. Truy cập `/login`, nhập email và mật khẩu rồi bấm **ĐĂNG NHẬP NGAY**.
  2. Kiểm tra biểu tượng người dùng trên Header hiển thị avatar và tên người dùng.
  3. Nhấn vào avatar góc phải Header, chọn **Đăng xuất**.
- **Kết quả mong đợi:**
  - Đăng nhập thành công: Lưu token vào `localStorage`, đồng bộ giỏ hàng với server.
  - Đăng xuất: Xóa token và user khỏi `localStorage`, Header quay về trạng thái chưa đăng nhập.
- **Kết quả thực tế:** Pass (Token được lưu vào `localStorage`, Header tự động cập nhật avatar và menu người dùng).
- **Trạng thái:** **Pass**

---

### UC-03: Xem trang chủ
- **Mục tiêu:** Trình bày đầy đủ banner, danh mục động, sản phẩm flash sale và gian hàng.
- **Tác nhân:** Mọi người dùng.
- **Điều kiện trước:** Không có.
- **Dữ liệu đầu vào:** Truy cập `/` hoặc `/Trang-chu`.
- **Các bước thực hiện:**
  1. Mở trang chủ `http://localhost:5173/`.
  2. Quan sát Video Hero Banner hoạt động bình thường, không bị biến dạng.
  3. Kiểm tra danh sách danh mục tải thật từ MongoDB qua API `GET /api/categories`.
  4. Kiểm tra danh mục **PHỤ KIỆN CÔNG NGHỆ (Accessories)** hiển thị đầy đủ.
- **Kết quả mong đợi:** Trang chủ tải mượt mà, đầy đủ thẻ sản phẩm, không có lỗi console.
- **Kết quả thực tế:** Pass (Hero banner giữ nguyên video nền, danh mục tải từ DB).
- **Trạng thái:** **Pass**

---

### UC-04: Tìm kiếm sản phẩm
- **Mục tiêu:** Tìm kiếm nhanh thiết bị theo từ khóa.
- **Tác nhân:** Mọi người dùng.
- **Điều kiện trước:** Đang ở bất kỳ trang nào có Header.
- **Dữ liệu đầu vào:** Nhập từ khóa: "MacBook" hoặc "RTX".
- **Các bước thực hiện:**
  1. Nhấp vào ô tìm kiếm trên Header.
  2. Nhập từ khóa "MacBook" và nhấn Enter (hoặc bấm gợi ý).
- **Kết quả mong đợi:** Trình duyệt chuyển hướng đến `/ProductPage?search=MacBook`, danh sách sản phẩm hiển thị các sản phẩm có tiêu đề hoặc mô tả chứa từ khóa tìm kiếm.
- **Kết quả thực tế:** Pass (API `GET /api/products?search=...` truy vấn regex đúng).
- **Trạng thái:** **Pass**

---

### UC-05: Lọc và sắp xếp sản phẩm
- **Mục tiêu:** Khách hàng thu hẹp danh sách thiết bị theo danh mục, hãng, khoảng giá và sắp xếp.
- **Tác nhân:** Mọi người dùng.
- **Điều kiện trước:** Đang ở trang `/ProductPage`.
- **Dữ liệu đầu vào:** Danh mục: `accessories` (Phụ kiện), Thương hiệu: chọn 1 hãng, Giá từ: `100000` đến `5000000`, Sắp xếp: "Giá tăng dần".
- **Các bước thực hiện:**
  1. Trên cột bộ lọc bên trái, nhấp chọn danh mục con hoặc cha.
  2. Nhập khoảng giá tối thiểu và tối đa.
  3. Chọn tiêu chí sắp xếp "Giá tăng dần".
- **Kết quả mong đợi:** Danh sách sản phẩm được lọc chính xác theo tiêu chí, URL tự động cập nhật query params tương ứng (`?category=...&sortBy=priceAsc`).
- **Kết quả thực tế:** Pass (Bộ lọc phản hồi dữ liệu thật từ MongoDB, có nút "Đặt lại bộ lọc").
- **Trạng thái:** **Pass**

---

### UC-06: Xem chi tiết sản phẩm
- **Mục tiêu:** Hiển thị chi tiết hình ảnh, giá gốc/ưu đãi, tồn kho và gian hàng.
- **Tác nhân:** Mọi người dùng.
- **Điều kiện trước:** Chọn 1 sản phẩm từ danh sách.
- **Dữ liệu đầu vào:** ID sản phẩm hợp lệ, ví dụ `/product/67b...`.
- **Các bước thực hiện:**
  1. Nhấp vào thẻ sản phẩm bất kỳ trên trang chủ hoặc trang danh sách.
  2. Quan sát hình ảnh, tiêu đề, mã SKU, thương hiệu, giá niêm yết và khuyến mãi.
  3. Kiểm tra số lượng tồn kho khả dụng và thông tin gian hàng bán lẻ.
- **Kết quả mong đợi:**
  - Nếu sản phẩm còn hàng (`stock > 0` và `status = 'active'`), nút "THÊM VÀO GIỎ" và "MUA NGAY" sáng rõ.
  - Nếu sản phẩm hết hàng hoặc ngừng bán, nút bấm tự động ẩn và hiển thị thông báo "SẢN PHẨM TẠM THỜI HẾT HÀNG TRONG KHO".
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-07: Xem thông tin gian hàng (Storefront)
- **Mục tiêu:** Xem hồ sơ gian hàng bán lẻ trên sàn.
- **Tác nhân:** Mọi người dùng.
- **Điều kiện trước:** Ở trang chi tiết sản phẩm hoặc trang Cửa hàng (`/Cua-hang`).
- **Dữ liệu đầu vào:** Nhấp vào tên hoặc logo shop sở hữu sản phẩm.
- **Các bước thực hiện:**
  1. Tại thẻ thông tin shop trên trang chi tiết sản phẩm, nhấp nút "XEM GIAN HÀNG".
  2. Kiểm tra trang `/shop/:id` hiển thị banner shop, logo, đánh giá shop và danh mục sản phẩm của riêng shop đó.
- **Kết quả mong đợi:** Trang gian hàng công khai tải đúng dữ liệu cấu hình storefront của shop.
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-08: Thêm sản phẩm vào giỏ (Đã khắc phục lỗi duplicate)
- **Mục tiêu:** Thêm sản phẩm với số lượng mong muốn vào giỏ hàng, chống lặp request.
- **Tác nhân:** Khách hàng (đăng nhập hoặc khách vãng lai).
- **Điều kiện trước:** Sản phẩm còn hàng trong kho.
- **Dữ liệu đầu vào:** Số lượng chọn = 2, biến thể: "Tiêu chuẩn / Chính hãng".
- **Các bước thực hiện:**
  1. Ở trang chi tiết sản phẩm, tăng số lượng lên 2.
  2. Bấm nút **THÊM VÀO GIỎ** (hoặc bấm icon giỏ hàng nhanh trên trang chủ).
  3. Bấm nhanh 2 lần liên tiếp để thử nghiệm chống duplicate.
  4. Quan sát số lượng hiển thị trên huy hiệu icon giỏ hàng ở Header.
- **Kết quả mong đợi:**
  - Nút hiển thị trạng thái "ĐANG THÊM..." và bị disable tức thì để chặn click kép.
  - Giỏ hàng chỉ tăng đúng 2 sản phẩm, không bị cộng thừa thành 4 sản phẩm.
  - Toast thông báo "Đã thêm 2 sản phẩm vào giỏ hàng!" xuất hiện.
  - Nhấp vào icon giỏ hàng ở Header chỉ mở trang `/cart`, **tuyệt đối không tự động phát sinh thêm sản phẩm**.
- **Kết quả thực tế:** Pass (Đã thêm `inFlightAddSet` tại Zustand store, khóa nút `disabled={isAdding}`, và chuẩn hóa endpoint `POST /api/cart/items`).
- **Trạng thái:** **Pass**

---

### UC-09: Cập nhật số lượng trong giỏ hàng
- **Mục tiêu:** Khách hàng tăng/giảm số lượng sản phẩm trong giỏ mà không vượt quá tồn kho.
- **Tác nhân:** Khách hàng.
- **Điều kiện trước:** Giỏ hàng có ít nhất 1 sản phẩm.
- **Dữ liệu đầu vào:** Bấm nút `+` hoặc `-`.
- **Các bước thực hiện:**
  1. Vào trang `/cart`.
  2. Bấm nút `+` trên dòng sản phẩm.
  3. Bấm nút `-` cho đến khi về 1 (không cho giảm dưới 1).
  4. Thử tăng vượt quá số lượng tồn kho của sản phẩm trong kho.
- **Kết quả mong đợi:**
  - Số lượng cập nhật tức thì trên giao diện và đồng bộ với server qua `PATCH /api/cart/items/:productId`.
  - Không thể giảm dưới 1 hoặc tăng vượt quá `product.stock`.
  - Tạm tính thành tiền của dòng sản phẩm và tổng tiền giỏ hàng cập nhật tương ứng.
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-10: Chọn sản phẩm & Xóa khỏi giỏ hàng
- **Mục tiêu:** Chọn các mặt hàng muốn mua và loại bỏ sản phẩm không còn nhu cầu.
- **Tác nhân:** Khách hàng.
- **Điều kiện trước:** Giỏ hàng có từ 2 sản phẩm trở lên.
- **Dữ liệu đầu vào:** Checkbox chọn sản phẩm, nút thùng rác xóa.
- **Các bước thực hiện:**
  1. Nhấp checkbox chọn/bỏ chọn từng sản phẩm hoặc checkbox "Chọn tất cả".
  2. Nhấp biểu tượng Thùng rác cạnh một sản phẩm.
  3. Bấm "Xóa các mục đã chọn".
- **Kết quả mong đợi:**
  - Chỉ các sản phẩm được chọn mới được tính vào Tổng tiền tạm tính (`subtotal`).
  - Sản phẩm bị xóa sẽ biến mất khỏi giỏ hàng cả ở frontend và CSDL backend (`DELETE /api/cart/items/:productId`).
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-11: Áp dụng Voucher khuyến mãi
- **Mục tiêu:** Giảm trừ tiền đơn hàng dựa trên mã voucher hợp lệ của sàn hoặc shop.
- **Tác nhân:** Khách hàng.
- **Điều kiện trước:** Có mã voucher còn hạn, chưa hết lượt sử dụng và tổng đơn thỏa mãn giá trị tối thiểu.
- **Dữ liệu đầu vào:** Nhập mã voucher có trong danh sách khả dụng (ví dụ: `GEARTECH10`).
- **Các bước thực hiện:**
  1. Tại trang giỏ hàng hoặc trang thanh toán, nhập mã vào ô voucher và bấm **ÁP DỤNG** (hoặc bấm nút "Áp dụng" trực tiếp từ danh sách voucher gợi ý).
  2. Thử nhập mã đã hết hạn hoặc không đủ giá trị đơn tối thiểu.
- **Kết quả mong đợi:**
  - Mã hợp lệ: Hiển thị dòng "Giảm giá voucher", trừ trực tiếp vào tổng tiền thanh toán.
  - Mã không hợp lệ / không đủ điều kiện: Hiển thị thông báo lỗi màu đỏ rõ ràng, không trừ tiền.
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-12: Đặt hàng (Checkout)
- **Mục tiêu:** Tạo đơn hàng thành công, trừ tồn kho và làm sạch các mục đã mua trong giỏ.
- **Tác nhân:** Khách hàng đã đăng nhập.
- **Điều kiện trước:** Đã chọn ít nhất 1 sản phẩm trong giỏ hàng và điền thông tin người nhận.
- **Dữ liệu đầu vào:** Họ tên: "Trần Thị B", Số điện thoại: "0912345678", Địa chỉ: "123 Đường Cầu Giấy, Hà Nội", Phương thức: COD.
- **Các bước thực hiện:**
  1. Từ giỏ hàng bấm **TIẾN HÀNH THANH TOÁN** -> Chuyển đến `/checkout`.
  2. Kiểm tra thông tin người nhận hàng được tự động điền sẵn từ hồ sơ khách hàng.
  3. Chọn phương thức vận chuyển và phương thức thanh toán COD.
  4. Nhấn nút **XÁC NHẬN ĐẶT HÀNG** (thử bấm nhanh nhiều lần để kiểm tra chống duplicate).
- **Kết quả mong đợi:**
  - Nút chuyển sang trạng thái "ĐANG XỬ LÝ..." và bị disable, ngăn chặn tạo 2 đơn hàng trùng.
  - Màn hình chuyển sang "ĐẶT HÀNG THÀNH CÔNG!" kèm mã đơn hàng.
  - Tồn kho sản phẩm trong database tự động giảm đi tương ứng với số lượng mua.
  - Các sản phẩm đã mua được xóa khỏi giỏ hàng, các sản phẩm không được chọn vẫn còn nguyên vẹn.
- **Kết quả thực tế:** Pass (Đã kiểm tra API `POST /api/orders` trừ kho, tạo bản ghi `StockMovement` và xóa selected items).
- **Trạng thái:** **Pass**

---

### UC-13: Xem lịch sử đơn hàng
- **Mục tiêu:** Khách hàng theo dõi danh sách tất cả các đơn hàng đã đặt của mình.
- **Tác nhân:** Khách hàng đã đăng nhập.
- **Điều kiện trước:** Đã đăng nhập và từng đặt ít nhất 1 đơn hàng.
- **Dữ liệu đầu vào:** Truy cập `/orders` hoặc tab "Đơn mua của tôi" tại `/profile`.
- **Các bước thực hiện:**
  1. Nhấp menu avatar trên Header -> Chọn "Đơn mua của tôi".
  2. Sử dụng các tab trạng thái: Tất cả, Chờ xác nhận, Đã xác nhận, Đang vận chuyển, Hoàn tất, Đã hủy.
- **Kết quả mong đợi:**
  - Danh sách đơn hiển thị đúng các đơn hàng của chính tài khoản đăng nhập (không hiển thị đơn của người khác).
  - Thể hiện rõ mã đơn, ngày đặt, danh sách mặt hàng, tổng tiền và badge trạng thái có màu sắc trực quan.
- **Kết quả thực tế:** Pass (API `GET /api/orders` chỉ truy vấn theo `userId` từ token).
- **Trạng thái:** **Pass**

---

### UC-14: Xem chi tiết đơn hàng
- **Mục tiêu:** Xem đầy đủ thông tin chi tiết của 1 đơn hàng cụ thể.
- **Tác nhân:** Khách hàng sở hữu đơn hàng.
- **Điều kiện trước:** Đơn hàng tồn tại trong hệ thống.
- **Dữ liệu đầu vào:** Bấm "Chi tiết đơn hàng" tại dòng đơn muốn xem.
- **Các bước thực hiện:**
  1. Tại danh sách đơn mua, nhấp vào nút xem chi tiết.
  2. Kiểm tra thông tin đơn hàng: người nhận, số điện thoại, địa chỉ nhận hàng, phương thức thanh toán, từng mặt hàng kèm đơn giá lúc mua.
- **Kết quả mong đợi:** Dữ liệu khớp 100% với lúc đặt hàng, không bị thay đổi dù giá niêm yết hiện tại của sản phẩm có tăng hay giảm.
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-15: Hủy đơn hàng
- **Mục tiêu:** Khách hàng hủy đơn khi hàng chưa được giao.
- **Tác nhân:** Khách hàng sở hữu đơn hàng.
- **Điều kiện trước:** Đơn hàng đang ở trạng thái `pending` (Chờ xác nhận).
- **Dữ liệu đầu vào:** Bấm nút "Hủy đơn hàng".
- **Các bước thực hiện:**
  1. Tại danh sách đơn mua, tìm đơn hàng có trạng thái "Chờ xác nhận".
  2. Bấm nút **HỦY ĐƠN HÀNG**.
  3. Hộp thoại xác nhận hiện ra: bấm "Đồng ý".
- **Kết quả mong đợi:**
  - Trạng thái đơn hàng chuyển sang `cancelled`.
  - Số lượng sản phẩm trong đơn được tự động hoàn lại tồn kho trong CSDL (`Product.stock` tăng lại).
  - Không hiển thị nút Hủy đối với các đơn hàng đã ở trạng thái `shipping` hoặc `completed`.
- **Kết quả thực tế:** Pass (API `PATCH /api/orders/:id/cancel` hoàn trả kho và ghi nhận lịch sử).
- **Trạng thái:** **Pass**

---

### UC-16: Cập nhật hồ sơ cá nhân
- **Mục tiêu:** Khách hàng cập nhật thông tin liên hệ và địa chỉ nhận hàng.
- **Tác nhân:** Khách hàng đã đăng nhập.
- **Điều kiện trước:** Vào trang `/profile` tab "Hồ sơ cá nhân".
- **Dữ liệu đầu vào:** Tên mới: "Nguyễn Văn B", Số điện thoại: "0988776655", Giới tính: "Nam".
- **Các bước thực hiện:**
  1. Bấm nút **Chỉnh sửa hồ sơ**.
  2. Thay đổi các trường thông tin và bấm **Lưu thay đổi**.
- **Kết quả mong đợi:**
  - Hệ thống gọi `PUT /api/auth/profile` qua `apiClient` và thông báo cập nhật thành công.
  - Dữ liệu hiển thị trên Header và biểu mẫu thanh toán tự động cập nhật theo thông tin mới.
- **Kết quả thực tế:** Pass.
- **Trạng thái:** **Pass**

---

### UC-17: Đánh giá sản phẩm đã mua
- **Mục tiêu:** Khách hàng gửi nhận xét, số sao cho sản phẩm sau khi nhận hàng hoàn tất.
- **Tác nhân:** Khách hàng đã mua và có đơn hàng `completed`.
- **Điều kiện trước:** Đơn hàng chứa sản phẩm đã chuyển trạng thái `completed`.
- **Dữ liệu đầu vào:** Số sao = 5, Bình luận = "Sản phẩm đóng gói cẩn thận, dùng rất mượt!".
- **Các bước thực hiện:**
  1. Truy cập trang chi tiết sản phẩm đã mua.
  2. Cuộn xuống phần Đánh giá & Bình luận.
  3. Chọn 5 sao, nhập nội dung bình luận và bấm **Gửi đánh giá**.
- **Kết quả mong đợi:**
  - Đánh giá được ghi nhận với trạng thái `approved`.
  - Điểm rating trung bình và số lượng đánh giá của sản phẩm tự động được tính lại.
  - Khách hàng chưa mua hoặc đơn chưa hoàn tất không thể gửi đánh giá (hệ thống hiển thị thông báo cần mua hàng trước).
- **Kết quả thực tế:** Pass (API `POST /api/reviews` kiểm tra chặt chẽ `completedOrderIds`).
- **Trạng thái:** **Pass**

---

### UC-18: Xử lý tài khoản bị giới hạn đặt hàng (Section 8 cus.md)
- **Mục tiêu:** Thông báo rõ ràng cho khách hàng khi bị Admin tạm khóa quyền đặt hàng nhưng vẫn cho phép truy cập website bình thường.
- **Tác nhân:** Khách hàng có tài khoản bị Admin gắn cờ `isOrderLocked = true`.
- **Điều kiện trước:** Admin thực hiện khóa quyền đặt hàng của tài khoản kèm lý do và thời hạn.
- **Dữ liệu đầu vào:** Tài khoản bị khóa quyền đặt hàng cố gắng bấm "Xác nhận đặt hàng" tại `/checkout`.
- **Các bước thực hiện:**
  1. Đăng nhập vào tài khoản bị khóa quyền đặt hàng.
  2. Xác minh người dùng vẫn duyệt xem sản phẩm, tìm kiếm và thêm vào giỏ hàng bình thường.
  3. Vào trang giỏ hàng bấm "Tiến hành thanh toán" -> Sang trang Checkout bấm "Xác nhận đặt hàng".
- **Kết quả mong đợi:**
  - Hệ thống chặn thao tác đặt hàng tại backend (`POST /api/orders` trả về HTTP 403).
  - Hiển thị thông báo chi tiết: "Quyền đặt hàng của tài khoản đang bị tạm khóa đến [thời gian]. Lý do: [Lý do khóa]. Bạn vẫn có thể xem sản phẩm và cập nhật giỏ hàng nhưng chưa thể đặt hàng lúc này."
  - Sau khi hết thời gian khóa (`orderLockExpiresAt <= now`), khách hàng tự động được đặt hàng lại bình thường mà không cần thao tác thủ công.
- **Kết quả thực tế:** Pass (Đã thêm kiểm tra `isOrderLocked` ở cả `routes/orders.js` và `routes/cart.js`).
- **Trạng thái:** **Pass**

---

## PHẦN 4 — KIỂM THỬ NGOẠI LỆ (EDGE CASES)

| Kịch bản ngoại lệ | Dữ liệu kiểm thử | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Tìm kiếm không có kết quả** | Nhập từ khóa: `xyzabc12345` | Hiển thị màn hình trống thân thiện với icon bánh răng, thông báo "// KHÔNG TÌM THẤY THIẾT BỊ NÀO KHỚP" và nút "Đặt lại bộ lọc". | Đúng thiết kế | **Pass** |
| **Giỏ hàng rỗng** | Giỏ hàng không có sản phẩm nào | Trang `/cart` hiển thị hình ảnh giỏ hàng trống, thông báo "Giỏ hàng đang trống" và nút "TIẾP TỤC MUA SẮM". Không cho phép bấm thanh toán. | Đúng thiết kế | **Pass** |
| **Số lượng mua không hợp lệ** | Nhập số lượng = 0, âm hoặc chữ cái | Hệ thống tự động làm tròn về 1 (`Math.max(1, qty)`), không cho phép giảm dưới 1. | Đúng thiết kế | **Pass** |
| **Sản phẩm hết hàng / ngừng bán** | Sản phẩm có `stock = 0` hoặc `status = 'inactive'` | Trang chi tiết ẩn nút mua, hiển thị badge đỏ "SẢN PHẨM TẠM THỜI HẾT HÀNG". Backend chặn `POST /api/cart/items` với mã lỗi 400. | Chặn thành công | **Pass** |
| **Voucher hết hạn hoặc không hợp lệ** | Mã `VOUCHER_EXPIRED` đã quá ngày | Thông báo lỗi "Mã voucher này đã hết hạn sử dụng!", không trừ tiền đơn hàng. | Chặn thành công | **Pass** |
| **Voucher chưa đạt giá trị tối thiểu** | Đơn hàng 200.000đ, voucher yêu cầu min 500.000đ | Báo lỗi "Đơn hàng cần tối thiểu 500.000 đ để dùng mã này.", không cho áp dụng. | Chặn thành công | **Pass** |
| **Chính sách bảo lưu giá khuyến mãi** | Sản phẩm giảm giá được thêm vào giỏ, sau đó shop tăng giá | Trong vòng 48 giờ, giỏ hàng vẫn giữ nguyên mức giá ưu đãi lúc thêm kèm ghi chú "Giữ giá ưu đãi 48 giờ". Hết 48 giờ tự cập nhật giá mới. | Chạy đúng nghiệp vụ | **Pass** |
| **Nhấn nút đặt hàng nhiều lần (Spam Click)** | Bấm liên tục 5 lần vào nút "Xác nhận đặt hàng" | Nút đặt hàng bị disable ngay từ lần bấm đầu tiên (`isSubmitting = true`). Chỉ duy nhất 1 đơn hàng được tạo trong CSDL, không sinh đơn trùng. | Chặn duplicate thành công | **Pass** |
| **Lỗi API hoặc mất kết nối DB** | Ngắt kết nối MongoDB khi đang checkout | Hiển thị thông báo "Không thể kết nối đến máy chủ. Vui lòng thử lại sau.", không làm treo trang trắng. | Xử lý lỗi an toàn | **Pass** |
| **Truy cập dữ liệu của khách hàng khác** | Khách A truy cập URL đơn hàng của khách B (`/api/orders/:idB`) | Backend kiểm tra quyền sở hữu (`order.userId === req.user.id`), trả về HTTP 403 "Từ chối: Bạn không có quyền xem thông tin đơn hàng này." | Bảo mật đạt chuẩn | **Pass** |
| **Gọi API khi chưa đăng nhập** | Gọi `POST /api/orders` hoặc `GET /api/orders` không kèm header Bearer token | Middleware `auth` chặn ngay lập tức, trả về HTTP 401 "Chưa xác thực người dùng." | Bảo mật đạt chuẩn | **Pass** |
| **Tài khoản bị giới hạn đặt hàng** | Khách hàng bị gắn `isOrderLocked` gọi API tạo đơn | Backend trả về HTTP 403 với lý do khóa chi tiết và thời hạn mở. | Hoạt động chính xác | **Pass** |

---

## PHẦN 5 — TỔNG HỢP KẾT QUẢ KIỂM THỬ

### 5.1. Thống kê Use Case
- **Tổng số Use Case nghiệp vụ chính:** 18 Use Case
- **Số Use Case đạt (Pass):** 18 / 18 (100%)
- **Số Use Case không đạt (Fail):** 0
- **Số Use Case bị chặn (Blocked):** 0
- **Số kịch bản ngoại lệ kiểm thử:** 12 kịch bản (100% Pass)

### 5.2. Danh sách các lỗi đã rà soát và xử lý triệt để
1. **Lỗi biểu tượng giỏ hàng tự tăng số lượng (+2) khi mở hoặc đồng bộ:**
   - *Nguyên nhân gốc rễ:* Trong phiên bản cũ, endpoint `POST /api/cart/sync` thực hiện cộng dồn `existingQty + desiredQty` mỗi khi mount trang hoặc đăng nhập. Đồng thời, button thêm nhanh giỏ hàng không có cờ in-flight nên khi click nhanh sẽ phát 2 request song song.
   - *Biện pháp khắc phục:*
     - Sửa `POST /api/cart/sync` gán chính xác `exactQty = desiredQty`, tuyệt đối không cộng dồn.
     - Bổ sung `inFlightAddSet` tại `cartStore.ts` để chặn triệt để race condition và duplicate calls.
     - Bổ sung state `isAdding` và `disabled={isAdding}` trên tất cả các nút Thêm vào giỏ.
2. **Lỗi chọn số lượng trên trang chi tiết:**
   - *Nguyên nhân:* Hàm `handleAddToCart` truyền số lượng trong object thay vì tham số hàm, dẫn đến giỏ hàng luôn nhận giá trị mặc định là 1.
   - *Khắc phục:* Cập nhật `addItem(product, quantity, variant)` đồng bộ cả 2 dạng truyền dữ liệu.
3. **Lỗi xóa sạch giỏ hàng khi checkout chỉ chọn một phần:**
   - *Nguyên nhân:* Checkout gọi `clearCart()` làm mất luôn các sản phẩm chưa chọn.
   - *Khắc phục:* Chuyển sang gọi `removeSelected()`, giữ lại các sản phẩm chưa chọn của khách hàng.
4. **Lỗi URL gọi API hardcode `localhost:5000`:**
   - *Khắc phục:* Chuyển toàn bộ sang `apiClient` có cấu hình biến môi trường `VITE_API_URL`.
5. **Cơ chế khóa quyền đặt hàng riêng biệt của Admin:**
   - Bổ sung `isOrderLocked`, `orderLockedAt`, `orderLockExpiresAt`, `orderLockReason` vào model `User`.
   - Khách hàng bị khóa quyền đặt hàng vẫn được đăng nhập, xem hàng, tìm kiếm bình thường nhưng nhận thông báo rõ ràng khi tiến hành checkout.

### 5.3. Kết luận
Khu vực Khách hàng (Customer) của GEARTECH đã được rà soát toàn diện, đồng bộ hoàn hảo với Shop Dashboard và Admin Dashboard, bảo vệ toàn vẹn dữ liệu, xác thực giá và tồn kho ở phía máy chủ backend và sẵn sàng vận hành thực tế.
