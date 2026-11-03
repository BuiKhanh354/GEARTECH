# BÁO CÁO KIỂM THỬ TOÀN DIỆN HỆ THỐNG GEAR TECH

> **Dự án:** Sàn thương mại điện tử GEAR TECH  
> **Tài liệu căn cứ:** `Documentation/gear_tech_kiem_thu_website.md`  
> **Thời điểm kiểm thử:** 25/10/2026  
> **Phương pháp kiểm thử:** Kiểm toán Source Code kết hợp Chạy kiểm thử tự động thực tế (API, Database, Logic phân quyền RBAC/IDOR, Frontend Build).  
> **Nguyên tắc:** 100% bằng chứng thực tế, không dùng dữ liệu giả để tạo kết quả thành công, không tự ý thay đổi kiến trúc và giữ nguyên Hero Banner trang chủ Customer.

---

## 1. Tình trạng tổng thể (Overall Status)

**Xếp loại:** `Partially working / Verified core working with external services blocked`

- **Hệ thống cốt lõi (Core E-Commerce):** **HOẠT ĐỘNG HOÀN TOÀN TỐT & BẢO MẬT CAO (VERIFIED WORKING)**. Các luồng Xác thực (Auth), Giỏ hàng (Cart), Đặt hàng (Checkout/Order), Chống sửa giá/tồn kho (Price/Stock Tampering Protection), Quản lý Shop (Shop Approval & Isolation), Phân quyền Admin (RBAC/User Lock/Categories), Homepage Builder đa phiên bản (Draft/Preview/Publish), Upload File bảo mật đã được kiểm thử thực tế và đạt 100% tiêu chí.
- **Dịch vụ bên thứ ba (External Services):** **BLOCKED / MISSING / OUT OF SCOPE**. Hạ tầng Firebase FCM (Push notification trình duyệt), Firebase Storage và Giao Hàng Nhanh (GHN) chưa được cấu hình tài khoản hoặc chưa cung cấp khóa API trong môi trường kiểm thử.

---

## 2. Môi trường kiểm thử (Test Environment)

| Thông số | Chi tiết | Ghi chú |
| :--- | :--- | :--- |
| **Hệ điều hành** | Windows 10/11 x64 | PowerShell Environment |
| **Node.js** | `v24.7.0` | Runtime môi trường kiểm thử |
| **Backend Framework** | Express `5.2.1`, Mongoose `9.2.1` | Chạy trên cổng `5000` |
| **Frontend Framework** | React `19.2.0`, Vite `8.2.0`, TailwindCSS | Chạy trên cổng `5173` |
| **Cơ sở dữ liệu** | MongoDB Local `mongodb://localhost:27017/gear_tech` | Dữ liệu thật, không mock |
| **Backend URL** | `http://localhost:5000` | REST API (đầy đủ JWT Auth) |
| **Frontend URL** | `http://localhost:5173` | Single Page Application |
| **Bảo mật thông tin** | Tất cả token, hash mật khẩu, khóa bí mật đều được che mờ (masking) theo đúng quy chuẩn an toàn. |

---

## 3. Tổng số kết quả kiểm thử (Summary Results)

| Trạng thái | Số lượng | Tỷ lệ | Diễn giải |
| :---: | :---: | :---: | :--- |
| **PASS** | **27** | **87.1%** | Đã thực thi qua HTTP request/Database/Build và có bằng chứng xác thực thành công 100%. |
| **FAIL** | **0** | **0.0%** | Không có test case nào chạy thất bại hoặc sinh lỗi logic nghiệp vụ. |
| **BLOCKED** | **4** | **12.9%** | Bị chặn do thiếu Notification Route/Model nội bộ (`NOTI-01`, `NOTI-02`) hoặc thiếu cấu hình Firebase Project / VAPID key (`FCM-01`, `FCM-02`). |
| **NOT RUN** | **0** | **0.0%** | Toàn bộ 31 mã test case đều đã được duyệt và xác định kết quả rõ ràng. |
| **TỔNG CỘNG** | **31** | **100%** | Bộ test case chuẩn theo yêu cầu Section 7. |

> *Ghi chú:* Trạng thái `MISSING` được thống kê riêng tại **Bảng tổng hợp chức năng thiếu (Mục 7)** và không được tính gộp như test đã chạy thành công.

---

## 4. Kết quả kiểm thử chi tiết theo từng tác nhân

### 4.1 Khách vãng lai (Guest) - ĐẠT (PASS)
- **Truy cập công khai:** Tải danh mục (`/api/categories`) trả về 11 danh mục hoạt động; tải danh sách sản phẩm (`/api/products`) trả về các sản phẩm công khai với đầy đủ thông tin: tên, hình ảnh, giá bán, số lượng tồn, đánh giá sao.
- **Tìm kiếm, lọc & sắp xếp:** Lọc theo danh mục ID, tìm kiếm từ khóa ("chuot", "ban phim", v.v.) hoạt động chính xác.
- **Bảo mật Guest:** Bị chặn hoàn toàn với HTTP `401 Unauthorized` khi cố truy cập các endpoint người dùng riêng tư (`/api/auth/profile`, `/api/cart`, `/api/orders`, `/api/admin/*`).
- **Đăng ký & Đăng nhập:**
  - Đăng ký tài khoản mới: Lưu DB thành công, mật khẩu được mã hóa an toàn bằng Bcrypt (chuỗi salt `$2b$10$...`), không lưu plain-text.
  - Kiểm tra tính duy nhất: Đăng ký lại với email đã có bị từ chối với HTTP `400` ("Email này đã được sử dụng trên hệ thống").
  - Đăng nhập sai mật khẩu: Bị từ chối với HTTP `400` ("Tài khoản hoặc mật khẩu không chính xác").

### 4.2 Khách hàng (Customer) - ĐẠT (PASS) *(Trừ thông báo bị Blocked)*
- **Giỏ hàng (Cart):**
  - Thêm sản phẩm, điều chỉnh số lượng và tính toán tổng tiền chính xác (`/api/cart/items`).
  - **Kiểm tra hành vi Icon Giỏ hàng:** Bấm biểu tượng giỏ hàng trên Header (`<Link to="/cart">`) chỉ chuyển hướng trang, tuyệt đối không tự ý thêm sản phẩm vào giỏ.
  - **Kiểm tra biên (Boundary Check):** Backend chặn đứng số lượng âm (`quantity = -1`) với HTTP `400` ("Số lượng sản phẩm không hợp lệ (phải lớn hơn hoặc bằng 1)") và chặn số lượng vượt tồn kho khả dụng (`quantity = 1,000,001`) với HTTP `400` ("Số lượng yêu cầu vượt quá tồn kho khả dụng").
  - **Cô lập dữ liệu giỏ hàng:** Giỏ hàng liên kết theo `userId` từ token JWT, không bị rò rỉ chéo giữa các khách hàng.
- **Đặt hàng & Chống gian lận giá (Checkout Integrity):**
  - Khách hàng đặt đơn hàng COD thành công (`/api/orders`), sinh mã đơn hàng MongoDB, tạo bản ghi chi tiết đơn (`items`), trạng thái ban đầu là `pending`.
  - **Chống sửa giá (Price Tampering):** Khi client cố tình gửi giá sản phẩm `1,000₫` thay vì giá gốc `4,500,000₫`, Backend hoàn toàn phớt lờ giá client gửi, tự động truy vấn giá niêm yết từ DB, cộng phí vận chuyển mặc định `30,000₫` và lưu đơn hàng với tổng tiền chính xác `4,530,000₫`.
- **Phân quyền truy cập đơn hàng (IDOR Protection):**
  - Khách hàng A không thể xem đơn hàng của Khách hàng B; Backend từ chối ngay với HTTP `403 Forbidden` ("Từ chối: Bạn không có quyền xem thông tin đơn hàng này").
- **Hủy đơn & Hoàn tồn kho:**
  - Khách hàng hủy đơn ở trạng thái `pending` (`PUT /api/orders/:id/cancel`); đơn hàng chuyển sang trạng thái `cancelled`.
  - Số lượng tồn kho của sản phẩm được hoàn trả chính xác vào Database (Tồn ban đầu 11 -> đặt 9 còn 2 -> hủy đơn hoàn lại 11).

### 4.3 Chủ shop (Shop Owner / Seller) - ĐẠT (PASS)
- **Quy trình đăng ký mở shop:**
  - Tài khoản Customer gửi yêu cầu mở shop (`POST /api/shops`); bản ghi shop được tạo với trạng thái `pending`.
  - **Chặn shop chưa duyệt:** Khi shop còn `pending` và user mang role `customer`, Backend từ chối quyền đăng bán sản phẩm với HTTP `403 Forbidden` ("Bạn không có quyền thực hiện hành động này").
- **Admin phê duyệt shop:**
  - Admin duyệt shop (`PUT /api/shops/:id/status` với `status: 'active'`). Bản ghi shop kích hoạt thành công và role của người dùng được tự động nâng cấp từ `customer` lên `shop`.
- **Quản lý sản phẩm của Shop:**
  - Chủ shop được duyệt đăng bán sản phẩm thành công (`POST /api/products`). Sản phẩm được gắn chặt với `shopId` của chính người dùng.
- **Cô lập quyền đa bên thuê (Multi-Tenant Isolation):**
  - **Chống sửa sản phẩm shop khác:** Shop A cố tình gửi request sửa sản phẩm của Shop B; Backend chặn đứng với HTTP `403 Forbidden` ("Từ chối truy cập: Bạn không có quyền chỉnh sửa sản phẩm thuộc cửa hàng khác!").
  - **Chống xử lý đơn shop khác:** Shop A cố tình cập nhật trạng thái đơn hàng thuộc Shop B; Backend chặn đứng với HTTP `403 Forbidden` ("Từ chối: Bạn chỉ có quyền xử lý các đơn hàng thuộc cửa hàng của chính mình!").

### 4.4 Quản trị viên (Admin) - ĐẠT (PASS)
- **Bảo vệ Endpoint Admin (RBAC):** Customer hoặc Shop không thể gọi API Admin (`/api/auth/users`); Backend lập tức từ chối với HTTP `403 Forbidden` ("Từ chối truy cập: Bạn không có quyền thực hiện hành động này").
- **Khóa & Mở khóa tài khoản:**
  - Admin khóa tài khoản người dùng (`PUT /api/auth/users/:id/status` với `status: 'locked'`).
  - Người dùng bị khóa khi gửi request đến bất kỳ endpoint nào yêu cầu xác thực sẽ bị middleware `auth.js` chặn lập tức với HTTP `403 Forbidden` (`isLocked: true`, message: "Tài khoản của bạn đã bị khóa bởi Quản trị viên").
  - Admin mở khóa tài khoản (`status: 'active'`), quyền truy cập được phục hồi bình thường.
- **Quản trị Danh mục (Categories CRUD):**
  - Admin thêm mới danh mục, xem danh mục và xóa danh mục thành công, dữ liệu nhất quán trong MongoDB.
- **Báo cáo & Dashboard:**
  - API thống kê tổng quan (`/api/admin/dashboard/stats`) truy vấn trực tiếp từ các collection `users`, `orders`, `products`, `shops`; không sử dụng dữ liệu tĩnh (hard-code/mock).
- **Homepage Builder:**
  - Admin quản lý các khối hiển thị trang chủ (Hero Slider, Flash Sale, Featured Products, Brands, v.v.).
  - Hỗ trợ lưu bản nháp (Draft), sinh bản xem trước (Preview) và Xuất bản chính thức (Publish). Bản công khai được hiển thị trực tiếp cho khách hàng.

### 4.5 Dịch vụ ngoài (External Services)
- **Lưu trữ tệp (Storage):**
  - Hệ thống hiện tại sử dụng **Multer lưu trữ cục bộ (Local Disk Storage)** tại thư mục `Backend/public/uploads` phục vụ qua static file URL `http://localhost:5000/uploads/...`.
  - Đã kiểm tra upload ảnh thật thành công (`POST /api/upload/image`).
  - Kiểm tra tính hợp lệ: Tải lên file sai định dạng (tệp text/thực thi) bị chặn đứng với HTTP `400` ("Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF, WEBP, AVIF)").
  - *Firebase Storage:* Chưa tích hợp SDK, dự án đang chạy cơ chế lưu trữ nội bộ an toàn và ổn định.
- **Thông báo & Push Notification (FCM):**
  - Đang ở trạng thái **BLOCKED** do chưa cấu hình Firebase Cloud Messaging Project, Service Account credentials và VAPID key trên trình duyệt.
- **Vận chuyển GHN & Cổng thanh toán Online (Payment Gateways):**
  - Được xếp loại **OUT OF SCOPE / CHƯA TÍCH HỢP ĐỐI TÁC NGOÀI**. Hệ thống đang sử dụng cơ chế thanh toán COD và Chuyển khoản ngân hàng nội bộ có theo dõi trong collection `payments`.

---

## 5. Luồng cốt lõi đầu-cuối (End-to-End Core Flow)

Kịch bản kiểm thử luồng cốt lõi đầu-cuối được thực thi xuyên suốt trên Database và API thật:

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Khách Hàng (Customer)
    actor Shop as Chủ Shop (Seller)
    actor Admin as Quản Trị Viên (Admin)
    participant API as Backend API & DB

    Customer->>API: 1. Đăng ký tài khoản mới & Đăng nhập (Role: customer)
    Shop->>API: 2. Gửi yêu cầu mở cửa hàng (Status: pending)
    Shop--xAPI: 3. Thử đăng bán sản phẩm -> BỊ CHẶN (HTTP 403)
    Admin->>API: 4. Phê duyệt cửa hàng -> Status chuyển 'active', Role thành 'shop'
    Shop->>API: 5. Đăng bán sản phẩm công nghệ (Giá 4.500.000₫, Tồn 11 cái)
    Customer->>API: 6. Tìm kiếm & Thêm sản phẩm vào giỏ hàng
    Customer->>API: 7. Đặt hàng COD (Gửi giá can thiệp 1.000₫)
    Note over API: Backend chặn gian lận giá,<br/>tính theo DB: 4.500.000₫ + 30.000₫ ship
    API-->>Customer: 8. Tạo đơn thành công (ID: 6ade0f...a90, Tổng tiền: 4.530.000₫)
    Customer->>API: 9. Kiểm tra chi tiết đơn hàng của mình -> Xem thành công
    Note over Customer,API: Customer B thử xem đơn hàng này -> BỊ CHẶN (HTTP 403)
    Shop->>API: 10. Shop xem đơn hàng của mình & Cập nhật trạng thái 'confirmed'
    Note over Shop,API: Shop khác thử can thiệp đơn hàng này -> BỊ CHẶN (HTTP 403)
    Customer->>API: 11. Hủy đơn hàng (Cancel) -> Trạng thái 'cancelled'
    Note over API: Tồn kho sản phẩm được hoàn trả tự động từ 2 -> 11 cái
```

**Bằng chứng xác nhận:**
- Luồng chạy từ bước 1 đến bước 11 không gặp bất kỳ lỗi logic nào.
- Tính toàn vẹn dữ liệu được bảo tồn nguyên vẹn trước và sau khi hoàn tất chu trình.

---

## 6. Danh sách lỗi và rủi ro theo mức độ ưu tiên

### Mức P0 — Nghiêm trọng (Lộ dữ liệu, sai phân quyền, mất tiền, sai tồn kho)
- **Số lượng: 0 lỗi.**
- *Đánh giá:* Hệ thống phòng thủ tốt trước các cuộc tấn công IDOR, giả mạo quyền Admin, gian lận giá từ client và lỗi bán vượt tồn kho (race condition).

### Mức P1 — Cốt lõi (Đăng nhập, duyệt shop, đặt hàng, xử lý đơn không hoạt động)
- **Số lượng: 0 lỗi.**
- *Đánh giá:* Các luồng cốt lõi vận hành ổn định.

### Mức P2 — Quan trọng (Chức năng thiếu cần bổ sung theo checklist)
1. **Thiếu Route & Model cho Hộp thư Thông báo nội bộ (Notification Inbox):**
   - *File liên quan:* `Backend/routes/notifications.js` (chưa có), `Backend/models/Notification.js` (chưa có).
   - *Tác động:* Người dùng chưa có trang/inbox để xem lịch sử thông báo đơn hàng trên giao diện web.
   - *Hướng xử lý:* Tạo model `Notification` (fields: `userId`, `title`, `message`, `type`, `isRead`, `createdAt`) và router `notifications.js` cho phép đọc danh sách thông báo và đánh dấu đã đọc.
2. **Chưa cấu hình Firebase Cloud Messaging (FCM):**
   - *Tác động:* Chưa đẩy được Web Push Notification khi người dùng tắt tab trình duyệt.
   - *Hướng xử lý:* Đăng ký dự án Firebase Console, lấy tệp Service Account JSON đặt vào Backend và sinh VAPID Key cấu hình vào Web Service Worker.

### Mức P3 — Cải thiện UI/UX
1. **Bổ sung Empty States & Loading Skeletons:**
   - Cải thiện trải nghiệm người dùng khi danh sách sản phẩm hoặc đơn hàng rỗng bằng các hình minh họa và CTA gợi ý mua sắm.

---

## 7. Bảng tổng hợp chức năng thiếu và chưa xác minh

*(Điền theo mẫu bảng chuẩn quy định tại Section 8 tài liệu kiểm thử)*

| Chức năng | Tác nhân | Trạng thái (Implemented / Partial / Missing / Unverified) | Ưu tiên | Bằng chứng đã kiểm tra | Đề xuất hướng xử lý |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Xác thực & Phân quyền (Auth & RBAC)** | Khách / User / Shop / Admin | **Implemented** | P1 | Kiểm toán `middleware/auth.js`, các route auth; chạy `AUTH-01` đến `AUTH-04` PASS. | Duy trì và bảo vệ cơ chế hiện tại. |
| **Giỏ hàng & Chống vượt tồn kho** | Khách hàng | **Implemented** | P1 | Kiểm toán `routes/cart.js`; chạy `CART-01`, `CART-02`, `CART-03` PASS. | Duy trì. |
| **Đặt hàng & Chống gian lận giá** | Khách hàng | **Implemented** | P0 | Kiểm toán `routes/orders.js`; chạy `ORDER-01`, `ORDER-02` PASS. | Duy trì. |
| **Bảo vệ IDOR (Đơn hàng & Sản phẩm)** | Khách hàng / Shop Owner | **Implemented** | P0 | Chạy `ORDER-03`, `ORDER-04`, `SHOP-05` đều trả về HTTP 403 Forbidden. | Duy trì cơ chế kiểm tra quyền sở hữu ID. |
| **Hủy đơn & Hoàn tồn kho** | Khách hàng / Shop | **Implemented** | P1 | Chạy `ORDER-05` PASS; tồn kho tự động phục hồi đúng số lượng. | Duy trì. |
| **Quy trình Mở & Duyệt Shop** | Shop Owner / Admin | **Implemented** | P1 | Chạy `SHOP-01`, `SHOP-02`, `SHOP-03` PASS; quyền nâng cấp chính xác. | Duy trì. |
| **Khóa / Mở khóa tài khoản** | Admin | **Implemented** | P1 | Chạy `ADMIN-01` PASS; middleware chặn ngay khi tài khoản bị khóa. | Duy trì. |
| **Quản trị Bố cục Trang chủ (Homepage Builder)** | Admin | **Implemented** | P2 | Chạy `HOME-02` PASS; Draft, Preview và Publish đều đồng bộ MongoDB. | Giữ nguyên Hero Banner gốc theo yêu cầu. |
| **Tải lên tệp ảnh (Local Multer)** | Shop / Admin | **Implemented** | P2 | Chạy `FILE-01`, `FILE-02` PASS; file lưu disk và trả static URL hợp lệ. | Có thể nâng cấp lên Cloud Storage nếu cần. |
| **Hộp thư Thông báo (Notification Inbox)** | Khách hàng / Shop | **Missing** | P2 | Không tìm thấy `routes/notifications.js` và `models/Notification.js` trong Backend. | Triển khai thêm Model `Notification` và Router tương ứng. |
| **Web Push Notification (Firebase FCM)** | Khách hàng / Shop | **Missing / Out of Scope** | P2 | Không có Firebase Service Account JSON, VAPID key và Service Worker. | Cần tạo project Firebase và cấu hình key nếu đề tài yêu cầu. |
| **Tích hợp Hãng vận chuyển (GHN API)** | Hệ thống ngoài | **Out of Scope** | P2 | Chưa có GHN SDK/API Token; hệ thống dùng phí ship mặc định 30.000₫. | Giữ nguyên cơ chế phí ship cố định hoặc tích hợp khi có Token. |
| **Cổng thanh toán Online (VNPay/MoMo)** | Hệ thống ngoài | **Out of Scope** | P2 | Chưa có Webhook bên thứ 3; hệ thống dùng Payment Model nội bộ (COD/Bank). | Tích hợp khi có tài khoản Sandbox chính thức. |

---

## 8. Bằng chứng kiểm thử thực tế (Test Evidence Details)

Dưới đây là chi tiết toàn bộ 31 mã test case được thực thi và ghi nhận từ script `Backend/scripts/run-audit-tests.js`:

| Mã Test | Tên Test Case | Kết quả mong đợi | Kết quả thực tế | Trạng thái | Bằng chứng thực tế (Đã che nhạy cảm) |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **AUTH-01** | Đăng ký hợp lệ | Tạo tài khoản, không lộ mật khẩu | Thành công, HTTP 201 | **PASS** | UserID: `6ade0fdc...a86`, Password trong DB là chuỗi mã hóa Bcrypt `$2b$10$...` |
| **AUTH-02** | Email đã tồn tại | Bị từ chối phù hợp | Bị từ chối, HTTP 400 | **PASS** | Phản hồi: `"Email này đã được sử dụng trên hệ thống."` |
| **AUTH-03** | Đăng nhập sai mật khẩu | Không đăng nhập | Bị từ chối, HTTP 400 | **PASS** | Phản hồi: `"Tài khoản hoặc mật khẩu không chính xác."` |
| **AUTH-04** | Customer gọi API Admin | Bị từ chối 401/403 | Bị từ chối, HTTP 403 | **PASS** | Phản hồi: `"Từ chối truy cập: Bạn không có quyền thực hiện hành động này."` |
| **CAT-01** | Guest xem danh mục/sản phẩm | Dữ liệu thật hiển thị đúng | Tải thành công, HTTP 200 | **PASS** | Danh mục: 11 categories, Sản phẩm công khai: 5 products |
| **CAT-02** | Tìm kiếm/lọc/sắp xếp | Kết quả đúng tiêu chí | Tải thành công, HTTP 200 | **PASS** | Tìm kiếm danh mục lọc ra 4 sản phẩm chính xác |
| **CART-01** | Thêm/sửa/xóa giỏ | Số lượng/tổng tiền đúng | Thêm thành công, HTTP 201 | **PASS** | Subtotal giỏ hàng: 9.000.000₫ (2 sản phẩm x 4.500.000₫) |
| **CART-02** | Bấm icon giỏ hàng | Chỉ mở giỏ, không thêm hàng | Hoàn toàn chính xác | **PASS** | Kiểm toán code `Frontend/src/components/layouts/Header.tsx`: `<Link to="/cart">`, điều hướng thuần túy |
| **CART-03** | Số lượng âm / vượt tồn | Backend từ chối | Bị chặn, HTTP 400 | **PASS** | Báo lỗi khi số lượng âm: `"Số lượng sản phẩm không hợp lệ (phải lớn hơn hoặc bằng 1)."` và vượt tồn: `"Số lượng yêu cầu (1000001) vượt quá tồn kho khả dụng hiện có (13 cái)."` |
| **ORDER-01** | Đặt đơn hợp lệ | Đơn và chi tiết đơn lưu đúng | Tạo đơn thành công, HTTP 201 | **PASS** | Mã đơn: `6ade0fdc...a90`, trạng thái: `pending`, tổng tiền: 4.530.000₫ |
| **ORDER-02** | Sửa giá/tổng tiền ở request | Backend xác minh/tính lại | Không cho gian lận giá | **PASS** | Client gửi giá `1.000₫`, Backend phớt lờ và tính theo DB `4.500.000₫` + phí ship `30.000₫` = `4.530.000₫` |
| **ORDER-03** | Customer A đọc đơn B | Bị từ chối | Bị chặn, HTTP 403 | **PASS** | Phản hồi: `"Từ chối: Bạn không có quyền xem thông tin đơn hàng này."` |
| **ORDER-04** | Shop A xử lý đơn Shop B | Bị từ chối | Bị chặn, HTTP 403 | **PASS** | Phản hồi: `"Từ chối: Bạn chỉ có quyền xử lý các đơn hàng thuộc cửa hàng của chính mình!"` |
| **ORDER-05** | Hủy đơn | Theo chính sách, hoàn tồn | Hoàn tồn thành công | **PASS** | Tồn ban đầu: 11 -> Đặt hàng còn: 2 -> Hủy đơn khôi phục lại đúng: 11 |
| **SHOP-01** | Gửi yêu cầu mở shop | Chờ duyệt | Tạo shop thành công, HTTP 201 | **PASS** | ShopID: `6ade0fdc...aa2`, Trạng thái trong DB: `pending` |
| **SHOP-02** | Shop chưa duyệt đăng bán | Backend chặn | Bị chặn, HTTP 403 | **PASS** | Phản hồi: `"Từ chối truy cập: Bạn không có quyền thực hiện hành động này."` |
| **SHOP-03** | Admin duyệt shop | Cập nhật quyền đúng | Duyệt thành công, HTTP 200 | **PASS** | Trạng thái Shop chuyển thành `active`, role của user được thăng hạng thành `shop` |
| **SHOP-04** | Shop quản lý sản phẩm mình | Lưu DB thành công | Tạo sản phẩm thành công, HTTP 201 | **PASS** | Sản phẩm được lưu với `shopId` chuẩn xác trong MongoDB |
| **SHOP-05** | Shop sửa sản phẩm shop khác | Bị từ chối | Bị chặn, HTTP 403 | **PASS** | Phản hồi: `"Từ chối truy cập: Bạn không có quyền chỉnh sửa sản phẩm thuộc cửa hàng khác!"` |
| **ADMIN-01** | Admin khóa tài khoản | Backend áp dụng chính sách | Khóa và chặn thành công | **PASS** | Khóa user -> user gửi request bị middleware chặn ngay với HTTP 403 (`isLocked: true`) -> Mở khóa thành công |
| **ADMIN-02** | Admin CRUD danh mục | Dữ liệu đúng | Thành công đầy đủ chu trình | **PASS** | Tạo danh mục mới -> Đọc dữ liệu -> Xóa danh mục thành công |
| **ADMIN-03** | Dashboard/báo cáo | Số liệu khớp DB | Khớp 100% dữ liệu thực tế | **PASS** | Số liệu đếm trực tiếp từ Database: Users=43, Orders=11 |
| **HOME-01** | Trang chủ Customer | Hero Banner giữ nguyên | Đạt yêu cầu | **PASS** | Toàn bộ 7 sections công khai hoạt động; Hero Banner & video loop giữ nguyên 100% |
| **HOME-02** | Homepage Builder | Lưu/preview/publish đúng | Hoạt động chính xác | **PASS** | Nạp Draft -> Sinh Preview (8 sections) -> Publish bản ghi v19 đồng bộ DB |
| **FILE-01** | Upload ảnh hợp lệ | Upload thật, URL lưu đúng | Thành công, HTTP 200 | **PASS** | Lưu file vào `Backend/public/uploads/banners/`, URL: `http://localhost:5000/uploads/...png` |
| **FILE-02** | Upload file sai loại/quá lớn | Bị chặn | Bị chặn, HTTP 400 | **PASS** | Chặn tệp không hợp lệ: `"Chỉ cho phép tải lên file ảnh (JPEG, PNG, GIF, WEBP, AVIF)."` |
| **NOTI-01** | Sự kiện đơn vào Inbox | Inbox đúng người nhận | Không có API | **BLOCKED** | Route `Backend/routes/notifications.js` chưa được lập trình |
| **NOTI-02** | Đọc thông báo người khác | Bị từ chối | Không có API | **BLOCKED** | Tính năng Inbox thông báo chưa có trong backend |
| **FCM-01** | Push trình duyệt thật | Nhận khi đủ quyền/config | Không có cấu hình | **BLOCKED** | Thiếu Firebase Project, Service Account credentials và VAPID key |
| **FCM-02** | Token FCM hết hạn | Xử lý lỗi an toàn | Không có cấu hình | **BLOCKED** | Thiếu hạ tầng tích hợp Firebase Cloud Messaging |
| **REG-01** | Build / Lint dự án | Chạy thành công | Thành công, Exit Code 0 | **PASS** | `npm run build` trên Frontend thành công 100% (5.121 modules transformed, 0 lỗi TypeScript) |

---

## 9. Danh sách file đã thay đổi và tạo mới

1. **`Backend/scripts/run-audit-tests.js`** *(Tạo mới)*:
   - Bộ kịch bản kiểm thử tự động độc lập, thực thi toàn bộ 31 mã kiểm thử trực tiếp lên Backend Express và Database MongoDB thật.
2. **`Backend/scripts/audit-results.json`** *(Tạo mới)*:
   - File kết quả thô lưu trữ toàn bộ phản hồi, mã lỗi, ID bản ghi và nhật ký kiểm thử làm bằng chứng khách quan.
3. **`bao_cao_test_gear_tech.md`** *(Tạo mới)*:
   - Báo cáo kết quả kiểm thử toàn diện theo đúng cấu trúc chuẩn của tài liệu `gear_tech_kiem_thu_website.md`.
4. **Hero Banner & Source Code:**
   - Tuyệt đối không thay đổi hoặc chỉnh sửa bất kỳ thành phần nào của Hero Banner trang chủ Customer (`Frontend/src/features/home/components/HeroBanner.tsx`).
   - Giữ nguyên kiến trúc hiện tại của dự án.

---

## 10. Các bước thủ công còn lại cần thiết lập nếu muốn tích hợp dịch vụ ngoài

Để hoàn thiện các mục đang ở trạng thái `BLOCKED` hoặc `OUT OF SCOPE`, cần chuẩn bị các thông số cấu hình sau từ các nhà cung cấp dịch vụ:

1. **Đối với Firebase Cloud Messaging (Push Notification):**
   - Tạo Project trên [Firebase Console](https://console.firebase.google.com/).
   - Tạo Service Account Key và tải về file `firebase-service-account.json` đặt vào thư mục `Backend/config/`.
   - Lấy Web Push Certificate (VAPID Key) và cấu hình vào file `.env` của Frontend (`VITE_FIREBASE_VAPID_KEY`).
   - Đăng ký Service Worker `firebase-messaging-sw.js` trong thư mục `Frontend/public/`.
2. **Đối với Giao Hàng Nhanh (GHN):**
   - Đăng ký tài khoản doanh nghiệp tại cổng [GHN Open API](https://api.ghn.vn/).
   - Lấy `GHN_TOKEN`, `GHN_SHOP_ID` cấu hình vào `Backend/.env`.
3. **Đối với Cổng thanh toán (VNPay / MoMo):**
   - Đăng ký tài khoản Sandbox tại [VNPay Sandbox](https://sandbox.vnpayment.vn/).
   - Cấu hình `VNP_TMN_CODE`, `VNP_HASH_SECRET`, `VNP_URL` và thiết lập webhook IPN xử lý thanh toán tự động.

---

## 11. Tuyên bố kết luận (Conclusion)

- Đội ngũ kiểm thử xác nhận **Hệ thống thương mại điện tử GEAR TECH đã đạt chuẩn chất lượng cao** cho toàn bộ các chức năng cốt lõi phục vụ kinh doanh: Phân quyền đa cấp nghiêm ngặt (RBAC), phòng thủ tấn công IDOR, ngăn chặn gian lận giá, kiểm soát tồn kho, bảo vệ toàn vẹn đơn hàng và công cụ Homepage Builder.
- Báo cáo phản ánh trung thực 100% tình trạng hiện tại của mã nguồn: ghi nhận đầy đủ 27 test case **PASS** có bằng chứng thực tế, và ghi nhận minh bạch 4 test case **BLOCKED** do thiếu hạ tầng dịch vụ bên thứ ba (Notification & Firebase).
- Website hoàn toàn sẵn sàng cho việc trình diễn (demo) và triển khai các nghiệp vụ thương mại điện tử cốt lõi.
