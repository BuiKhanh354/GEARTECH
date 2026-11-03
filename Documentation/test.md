# PROMPT: TRIỂN KHAI HỆ THỐNG QUẢN LÝ TÀI CHÍNH, DOANH THU VÀ THANH TOÁN CHO SHOP – GEAR TECH

Bạn là Senior Full-stack Developer có kinh nghiệm xây dựng sàn thương mại điện tử nhiều nhà bán hàng (Multi-vendor Marketplace).

Tôi muốn triển khai hệ thống quản lý tài chính cho dự án Gear Tech.

## 1. Bối cảnh dự án

Gear Tech là nền tảng thương mại điện tử nhiều shop.

Công nghệ hiện tại:
- Frontend Web: ReactJS + TypeScript + Vite.
- Backend: Node.js + Express.
- Database: MongoDB.
- Mobile App: React Native + Expo + TypeScript.
- Các vai trò: Guest, Customer, Shop Owner, Admin.

Người bán có thể mở shop và kinh doanh sản phẩm trên nền tảng. Một đơn hàng có thể chứa sản phẩm từ nhiều shop khác nhau.

## 2. Mục tiêu triển khai

Xây dựng hệ thống quản lý tài chính, doanh thu, số dư và thanh toán cho từng shop.

**Mô hình kinh doanh mong muốn:**

1. Khách hàng đặt hàng và thanh toán thông qua Gear Tech.
2. Backend xác nhận giao dịch thanh toán thành công.
3. Hệ thống ghi nhận số tiền thanh toán và phân bổ doanh thu tương ứng cho từng shop.
4. Trong thời gian đơn hàng chưa hoàn tất, tiền của shop được ghi nhận là đang chờ đối soát.
5. Khi đơn hàng đáp ứng điều kiện giải ngân, số tiền được chuyển sang số dư có thể rút.
6. Shop Owner gửi yêu cầu rút tiền.
7. Admin kiểm tra và xử lý yêu cầu rút tiền.
8. Hệ thống lưu lịch sử giao dịch và cập nhật số dư sau khi giải ngân thành công.

Lưu ý: Không tự xây dựng cơ chế giữ tiền hoặc trung gian thanh toán trái quy định. Trước khi triển khai giao dịch tiền thật, phải xác định cổng thanh toán và mô hình pháp lý phù hợp. Nếu chưa có tích hợp giải ngân thực tế, xây dựng quy trình ghi nhận và xử lý thủ công có kiểm soát, không giả lập rằng tiền đã được chuyển.

## 3. BẮT BUỘC: KIỂM TRA SOURCE TRƯỚC KHI CODE

Không được bắt đầu viết code ngay.

Trước tiên, hãy kiểm tra toàn bộ source hiện tại và báo cáo:

### Backend
- Cấu trúc thư mục backend.
- MongoDB connection và cách truy cập database.
- Models/Schemas hiện tại.
- Orders, Order Items, Payments.
- Authentication và Authorization.
- Middleware kiểm tra vai trò Admin, Shop Owner, Customer.
- API tạo đơn hàng.
- API thanh toán và callback/webhook.
- API cập nhật trạng thái đơn hàng.
- API quản lý shop.
- Cách xác định một đơn hàng thuộc shop nào.

### Frontend
- Cấu trúc thư mục.
- Trang quản lý của Shop Owner.
- Trang quản trị Admin.
- Các trang đơn hàng và thanh toán hiện có.
- Cách gọi API và quản lý state.
- Các component/layout có thể tái sử dụng.

### Database
Kiểm tra cấu trúc thực tế của:
- users
- shops
- products
- orders
- order_items
- payments
- Các collection liên quan khác.

Không tự giả định tên collection, trường dữ liệu hoặc API. Phải dựa trên source thực tế.

Sau khi kiểm tra, hãy trình bày:
1. Những chức năng đã tồn tại.
2. Những chức năng còn thiếu.
3. Những phần cần chỉnh sửa.
4. Những phần có thể tái sử dụng.
5. Đề xuất thiết kế database và API tương thích với source.

Chỉ bắt đầu triển khai sau khi đã có báo cáo audit.

## 4. Thiết kế nghiệp vụ tài chính

Phải phân biệt rõ các loại số tiền sau:

### A. Tổng tiền khách hàng thanh toán
Bao gồm:
- Giá trị sản phẩm.
- Phí vận chuyển.
- Giảm giá/voucher.
- Các khoản điều chỉnh hợp lệ khác.

### B. Doanh thu của shop
Là phần doanh thu thuộc về shop sau khi phân bổ đơn hàng.

### C. Phí nền tảng
Khoản phí Gear Tech thu từ shop theo chính sách đã cấu hình.

Không hardcode tỷ lệ phí. Cho phép Admin cấu hình chính sách phí, có hiệu lực theo thời điểm và lưu lại mức phí áp dụng cho từng giao dịch để tránh thay đổi lịch sử.

### D. Số dư tài chính của shop

Cần phân biệt:
- Pending Balance: Số tiền đang chờ đối soát.
- Available Balance: Số tiền đủ điều kiện rút.
- Withdrawn Balance: Số tiền đã giải ngân.
- Refunded/Adjusted Amount: Khoản hoàn tiền hoặc điều chỉnh.

Không được tính trùng tiền giữa các loại số dư.

### E. Ví dụ minh họa

Một khách hàng mua sản phẩm của Shop A:

- Giá trị sản phẩm: 5.000.000đ.
- Phí vận chuyển: 30.000đ.
- Tổng khách thanh toán: 5.030.000đ.
- Phí nền tảng giả định: 5% giá trị sản phẩm.
- Doanh thu dự kiến của shop: 5.000.000đ.
- Phí nền tảng: 250.000đ.
- Shop dự kiến nhận: 4.750.000đ.

Đây chỉ là ví dụ minh họa. Không được mặc định phí vận chuyển thuộc về shop hoặc Gear Tech. Phải dựa trên chính sách vận chuyển thực tế của dự án.

## 5. Xử lý đơn hàng nhiều shop

Đây là yêu cầu đặc biệt quan trọng.

Một đơn hàng tổng có thể chứa sản phẩm từ nhiều shop.

Ví dụ:
- Shop A: 5.000.000đ.
- Shop B: 3.000.000đ.
- Tổng giá trị sản phẩm: 8.000.000đ.

Hệ thống phải phân bổ doanh thu theo từng shop, không được ghi toàn bộ 8.000.000đ vào doanh thu của một shop.

Nếu source hiện tại đã có mô hình Order và Sub-order thì tái sử dụng. Nếu chưa có, hãy đề xuất cách mở rộng phù hợp mà không phá vỡ API cũ.

Mỗi shop cần có bản ghi tài chính riêng cho phần đơn hàng của mình.

## 6. Trạng thái thanh toán và tài chính

Không gộp trạng thái thanh toán, trạng thái đơn hàng và trạng thái vận chuyển.

### Payment Status
- PENDING
- PAID
- FAILED
- REFUND_PENDING
- PARTIALLY_REFUNDED
- REFUNDED

Chỉ sử dụng các trạng thái phù hợp với hệ thống thanh toán thực tế.

### Financial Status
- PENDING_RECONCILIATION
- AVAILABLE
- WITHDRAWAL_PENDING
- PAID_OUT
- REFUNDED
- ADJUSTED

### Order Status
Giữ nguyên các trạng thái hiện tại nếu đang hoạt động. Không tự ý đổi tên hoặc xóa trạng thái cũ.

### Shipping Status
Giữ độc lập với tài chính và tiếp tục tương thích với chức năng GHN hiện tại hoặc dự kiến triển khai.

## 7. Điều kiện ghi nhận doanh thu và giải ngân

Thiết kế quy trình có thể cấu hình:

- Khi thanh toán thành công: ghi nhận giao dịch thanh toán.
- Khi đơn hàng được giao thành công: cập nhật tiến trình xử lý đơn.
- Khi đơn hàng hoàn tất và đáp ứng chính sách đối soát: chuyển số tiền hợp lệ sang Available Balance.
- Khi có yêu cầu hoàn tiền hoặc khiếu nại: tạm dừng giải ngân phần tiền liên quan.
- Khi giải ngân thành công: cập nhật lịch sử và số dư.

Không được tự động cho phép rút tiền chỉ dựa vào trạng thái PAID.

Phải kiểm tra các trường hợp:
- Đơn hàng bị hủy.
- Giao hàng thất bại.
- Hoàn tiền toàn bộ.
- Hoàn tiền một phần.
- Đơn hàng có nhiều shop.
- Shop bị khóa.
- Shop chưa xác minh thông tin nhận tiền.
- Admin từ chối yêu cầu rút tiền.

## 8. Chức năng dành cho Shop Owner

Thêm mục **Tài chính** trong trang quản lý shop.

### Tổng quan tài chính
Hiển thị:
- Tổng doanh thu.
- Doanh thu trong ngày.
- Doanh thu trong tháng.
- Pending Balance.
- Available Balance.
- Withdrawn Balance.
- Tổng phí nền tảng.
- Tổng tiền hoàn/điều chỉnh.

### Danh sách giao dịch
Cho phép:
- Xem giao dịch theo mã đơn hàng.
- Xem giá trị sản phẩm.
- Xem phí vận chuyển nếu có liên quan.
- Xem phí nền tảng.
- Xem số tiền shop được nhận.
- Xem trạng thái thanh toán.
- Xem trạng thái đối soát.
- Lọc theo ngày, tháng và trạng thái.
- Tìm kiếm theo mã đơn.

### Yêu cầu rút tiền
Cho phép Shop Owner:
- Xem số dư có thể rút.
- Tạo yêu cầu rút tiền.
- Nhập số tiền muốn rút.
- Chọn tài khoản nhận tiền đã được xác minh.
- Xem trạng thái yêu cầu.
- Xem lịch sử rút tiền.

Phải kiểm tra số dư ở backend, không tin số tiền do frontend gửi lên.

## 9. Chức năng dành cho Admin

Thêm mục **Quản lý tài chính** trong trang Admin.

Bao gồm:

### Tổng quan
- Tổng giá trị giao dịch.
- Tổng doanh thu các shop.
- Tổng phí nền tảng.
- Tổng tiền đang chờ đối soát.
- Tổng tiền có thể giải ngân.
- Tổng tiền đã giải ngân.
- Tổng tiền hoàn trả.

### Quản lý giao dịch
- Danh sách giao dịch.
- Xem chi tiết giao dịch.
- Lọc theo shop, ngày, trạng thái.
- Tra cứu mã đơn hàng và mã giao dịch thanh toán.

### Quản lý yêu cầu rút tiền
- Xem danh sách yêu cầu.
- Xem thông tin shop.
- Xem số tiền yêu cầu.
- Duyệt hoặc từ chối.
- Nhập lý do từ chối.
- Đánh dấu đã giải ngân chỉ khi có bằng chứng hoặc kết quả xử lý thực tế.
- Lưu người thực hiện và thời gian xử lý.

### Cấu hình phí nền tảng
- Cho phép Admin cấu hình tỷ lệ phí.
- Không làm thay đổi phí của các giao dịch đã phát sinh.
- Lưu lịch sử thay đổi cấu hình.

## 10. Thiết kế Database

Dựa trên cấu trúc MongoDB hiện tại, hãy đề xuất các collection cần thêm hoặc mở rộng.

Có thể cân nhắc:
- shop_wallets
- financial_transactions
- withdrawal_requests
- platform_fee_configs
- payout_records
- refund_records

Đây là tên gợi ý, không bắt buộc phải dùng đúng nếu source hiện tại đã có cấu trúc phù hợp.

Yêu cầu:
- Có liên kết rõ với user, shop, order, payment.
- Hỗ trợ đơn hàng nhiều shop.
- Lưu snapshot số tiền và tỷ lệ phí tại thời điểm phát sinh.
- Có lịch sử thay đổi trạng thái.
- Có created_at, updated_at.
- Không lưu trùng dữ liệu nếu có thể tính toán an toàn từ ledger.
- Sử dụng transaction hoặc cơ chế chống ghi nhận trùng phù hợp với MongoDB deployment hiện tại.
- Thiết kế idempotency để callback/webhook thanh toán không cộng tiền hai lần.

Ưu tiên mô hình ledger (sổ cái giao dịch) để truy vết dòng tiền. Không chỉ cập nhật một trường balance mà không có lịch sử giao dịch đối ứng.

## 11. API cần có

Trước khi tạo API mới, kiểm tra các endpoint hiện tại để tránh trùng lặp.

Đề xuất các nhóm API:

### Shop Owner
- Lấy tổng quan tài chính.
- Lấy danh sách giao dịch.
- Xem chi tiết giao dịch.
- Lấy số dư.
- Tạo yêu cầu rút tiền.
- Xem lịch sử rút tiền.

### Admin
- Lấy tổng quan tài chính toàn hệ thống.
- Lấy danh sách giao dịch.
- Xem chi tiết giao dịch.
- Lấy danh sách yêu cầu rút tiền.
- Duyệt yêu cầu.
- Từ chối yêu cầu.
- Ghi nhận kết quả giải ngân.
- Quản lý cấu hình phí nền tảng.

Yêu cầu API:
- Authentication đầy đủ.
- Authorization theo role.
- Shop Owner chỉ được xem dữ liệu của shop mình.
- Admin có quyền quản lý toàn hệ thống.
- Validate dữ liệu đầu vào.
- Xử lý lỗi thống nhất.
- Phân trang và lọc dữ liệu.
- Không để lộ thông tin tài khoản nhận tiền của shop khác.

## 12. Bảo mật và tính toàn vẹn tài chính

Bắt buộc:
- Không để frontend tự quyết định số dư.
- Không cho phép Shop Owner sửa số tiền doanh thu.
- Không cho phép Shop Owner tự đánh dấu đã rút tiền.
- Không cho phép duyệt yêu cầu rút tiền của chính mình bằng quyền shop.
- Không xử lý một giao dịch thanh toán nhiều lần.
- Không ghi nhận doanh thu nếu thanh toán chưa được xác thực từ backend/cổng thanh toán.
- Không ghi nhận giải ngân thành công nếu chưa có kết quả thực tế.
- Có audit log cho các thao tác tài chính quan trọng.
- Không lưu token, mật khẩu hoặc thông tin nhạy cảm trong log.

## 13. Thiết kế giao diện

Giữ nguyên design system, màu sắc, component, layout và phong cách hiện tại của Gear Tech.

Không tự ý redesign toàn bộ website.

Ưu tiên giao diện:
- Rõ ràng, chuyên nghiệp.
- Dễ đọc số liệu.
- Responsive.
- Có loading, empty state, error state.
- Có xác nhận trước thao tác tài chính quan trọng.
- Có thông báo thành công/thất bại.
- Không dùng dữ liệu giả để thay thế dữ liệu API thật.

## 14. Kiểm thử

Phải kiểm thử ít nhất các trường hợp:

1. Khách thanh toán thành công.
2. Khách thanh toán thất bại.
3. Callback thanh toán được gửi nhiều lần.
4. Đơn hàng có sản phẩm của một shop.
5. Đơn hàng có sản phẩm của nhiều shop.
6. Shop A không thể xem giao dịch của Shop B.
7. Shop không đủ số dư để rút tiền.
8. Shop gửi yêu cầu rút tiền hợp lệ.
9. Admin duyệt yêu cầu rút tiền.
10. Admin từ chối yêu cầu rút tiền.
11. Đơn hàng bị hủy trước khi hoàn tất.
12. Hoàn tiền toàn bộ.
13. Hoàn tiền một phần.
14. Đơn hàng đang khiếu nại.
15. Giải ngân bị lỗi hoặc chưa xác nhận thành công.

Không được báo PASS nếu chưa thực sự chạy kiểm thử.

## 15. Nguyên tắc không phá vỡ chức năng cũ

- Không xóa API đang được frontend/mobile sử dụng.
- Không tự ý đổi cấu trúc dữ liệu hiện tại nếu chưa đánh giá tác động.
- Không thay đổi luồng đăng nhập, phân quyền, đặt hàng, thanh toán, giao hàng nếu không cần thiết.
- Tái sử dụng component và service hiện có.
- Nếu cần migration dữ liệu, phải có kế hoạch và khả năng rollback.
- Không xóa dữ liệu thật.
- Không thay đổi dữ liệu production.
- Không tạo dữ liệu mẫu trong database thật.

## 16. Cách triển khai

Thực hiện theo từng giai đoạn:

**Giai đoạn 1:** Audit source và báo cáo thiết kế.

**Giai đoạn 2:** Thiết kế database, ledger và quy tắc tính toán tài chính.

**Giai đoạn 3:** Triển khai backend và API.

**Giai đoạn 4:** Triển khai giao diện Shop Owner.

**Giai đoạn 5:** Triển khai giao diện Admin.

**Giai đoạn 6:** Kết nối với luồng thanh toán hiện tại.

**Giai đoạn 7:** Kiểm thử, rà soát bảo mật và tương thích chức năng cũ.

Sau mỗi giai đoạn:
- Liệt kê file đã tạo/sửa.
- Giải thích chức năng.
- Nêu API và database thay đổi.
- Nêu các kiểm thử đã chạy và kết quả thực tế.
- Báo cáo vấn đề còn tồn tại.

Nếu thiếu thông tin về cổng thanh toán hoặc cơ chế giải ngân, hãy ghi rõ phần cần quyết định, không tự bịa thông tin tích hợp.

## KẾT QUẢ CUỐI CÙNG

Tôi cần một hệ thống mà:

- Khách hàng thanh toán qua Gear Tech.
- Chủ shop nhìn thấy số tiền của từng đơn hàng.
- Chủ shop phân biệt được doanh thu, tiền đang chờ đối soát và tiền có thể rút.
- Admin quản lý được tài chính toàn sàn.
- Mỗi shop chỉ xem được tài chính của shop mình.
- Hệ thống hỗ trợ đơn hàng nhiều shop.
- Có lịch sử giao dịch minh bạch, có thể truy vết.
- Không ghi nhận hoặc giải ngân tiền hai lần.
- Không làm hỏng chức năng cũ của Gear Tech.

**Hãy bắt đầu bằng việc audit source hiện tại. Không code trước khi hoàn thành báo cáo audit và đề xuất phương án triển khai phù hợp.**