# YÊU CẦU: RÀ SOÁT VÀ CẢI THIỆN CUSTOMER — GEAR TECH

## 1. Mục tiêu

Hãy rà soát toàn bộ khu vực Customer của dự án Gear Tech — sàn thương mại điện tử kinh doanh máy tính, laptop và phụ kiện công nghệ.

Mục tiêu là làm cho trải nghiệm mua sắm rõ ràng, chuyên nghiệp, đồng bộ với Shop Dashboard và Admin Dashboard, đồng thời sửa các lỗi nghiệp vụ còn tồn tại.

**Không mặc định làm lại toàn bộ giao diện. Hãy kiểm tra source code trước, giữ lại những phần đang hoạt động tốt và chỉ redesign hoặc sửa những phần thực sự cần thiết.**

Sau khi hoàn thành, bắt buộc tạo file `customer_huongdanchucnang.md` tại thư mục gốc dự án để hướng dẫn kiểm thử Use Case của Customer.

## 2. Nguyên tắc thực hiện

1. Kiểm tra source code hiện tại trước khi sửa.
2. Giữ nguyên công nghệ và kiến trúc đang sử dụng: React, TypeScript, Vite, Node.js/Express và MongoDB.
3. Tận dụng các components, hooks, services, API và database models hiện có.
4. Không tạo dữ liệu giả để thay thế dữ liệu thật.
5. Không tự ý thay đổi schema hoặc xóa dữ liệu nếu chưa xác định được ảnh hưởng.
6. Không làm hỏng chức năng Admin và Shop Owner.
7. Không thay đổi Hero Banner hiện tại của trang chủ: giữ nguyên hình ảnh/video, nội dung, CTA, slide, kích thước, bố cục, hiệu ứng, assets và CSS liên quan nếu chưa được phê duyệt.
8. Không viết lại những chức năng đã hoàn thành nếu chúng đang hoạt động đúng.
9. Mọi nút bấm, biểu mẫu, bộ lọc và thao tác phải có chức năng thực tế.
10. Nếu thiếu API hoặc nghiệp vụ chưa được triển khai, ghi rõ và chỉ bổ sung sau khi đã kiểm tra ảnh hưởng đến hệ thống.

## 3. Rà soát giao diện tổng thể Customer

Kiểm tra và cải thiện những khu vực sau:

### 3.1. Header và Navbar

- Logo Gear Tech và điều hướng chính.
- Thanh tìm kiếm sản phẩm.
- Danh mục cha và danh mục con lấy từ MongoDB.
- Bổ sung danh mục Accessories nếu chưa có.
- Biểu tượng giỏ hàng hiển thị đúng số lượng sản phẩm.
- Khu vực đăng nhập, đăng ký và tài khoản.
- Điều hướng đến đơn hàng, hồ sơ cá nhân và các trang liên quan.

Kiểm tra kỹ việc hiển thị danh mục cha/con. Danh mục con phải nằm đúng cấp, không hiển thị ngang hàng với danh mục cha nếu không đúng cấu trúc dữ liệu.

Không thay đổi Hero Banner trong quá trình chỉnh sửa Navbar.

### 3.2. Trang chủ

- Hiển thị sản phẩm thực tế từ database.
- Các khu vực sản phẩm mới, bán chạy hoặc khuyến mãi chỉ xuất hiện khi có dữ liệu và quy tắc xác định tương ứng.
- Các danh mục sản phẩm có thể nhấn để xem danh sách.
- Các thẻ sản phẩm hiển thị ảnh, tên, giá, giá khuyến mãi, shop và thông tin cần thiết nếu dữ liệu có.
- Có trạng thái loading, lỗi và không có sản phẩm.
- Đảm bảo responsive trên desktop, tablet và mobile.

Giữ nguyên Hero Banner đang hoạt động tốt. Không thay thế bằng banner mới hoặc tự ý chỉnh sửa thiết kế.

### 3.3. Danh sách sản phẩm

- Tìm kiếm theo từ khóa.
- Lọc theo danh mục, thương hiệu và khoảng giá nếu được hỗ trợ.
- Sắp xếp theo giá, sản phẩm mới hoặc tiêu chí phù hợp với API hiện tại.
- Phân trang hoặc tải thêm sản phẩm.
- Hiển thị trạng thái còn hàng, hết hàng hoặc ngừng bán.
- Không hiển thị sản phẩm không còn được phép bán như sản phẩm đang bán bình thường.
- Khi nhấn vào sản phẩm, mở đúng trang chi tiết.

Không để các bộ lọc chỉ thay đổi giao diện nhưng không tác động đến dữ liệu.

### 3.4. Chi tiết sản phẩm

Kiểm tra và hoàn thiện:

- Hình ảnh và thông tin sản phẩm.
- Tên, thương hiệu, danh mục.
- Giá gốc và giá khuyến mãi.
- Số lượng tồn kho và số lượng đã bán nếu hệ thống có dữ liệu.
- Thông tin shop và liên kết đến trang cửa hàng.
- Chọn số lượng mua.
- Thêm vào giỏ hàng.
- Đánh giá và bình luận.
- Các sản phẩm liên quan nếu có dữ liệu phù hợp.

Không cho phép mua số lượng vượt quá tồn kho hoặc thêm sản phẩm đã ngừng bán vào giỏ hàng.

Giữ nguyên các chức năng đánh giá/bình luận và số lượng đã bán nếu chúng đang hoạt động tốt.

## 4. Giỏ hàng — ưu tiên sửa lỗi

Rà soát toàn bộ luồng giỏ hàng từ frontend đến backend.

### 4.1. Các chức năng cần có

- Xem danh sách sản phẩm trong giỏ.
- Tăng hoặc giảm số lượng.
- Xóa sản phẩm.
- Chọn sản phẩm để thanh toán nếu hệ thống có hỗ trợ.
- Hiển thị đơn giá, số lượng và thành tiền.
- Hiển thị tạm tính, giảm giá, voucher và tổng tiền.
- Kiểm tra tồn kho và tình trạng kinh doanh của sản phẩm.
- Cập nhật dữ liệu chính xác sau khi tải lại trang.

### 4.2. Sửa lỗi biểu tượng giỏ hàng

Kiểm tra lỗi đã được ghi nhận: **nhấn vào biểu tượng giỏ hàng có thể tự động thêm 2 sản phẩm**.

Yêu cầu:
- Nhấn biểu tượng giỏ hàng chỉ mở trang hoặc khu vực giỏ hàng.
- Không tự động thêm sản phẩm.
- Chỉ thêm sản phẩm khi khách hàng chủ động nhấn nút thêm vào giỏ hàng.
- Mỗi thao tác chỉ được thực hiện một lần, không bị gọi trùng do event handler, component lifecycle hoặc request lặp.
- Kiểm tra cả frontend và backend để tìm nguyên nhân gốc.
- Bổ sung test để đảm bảo lỗi không tái diễn.

### 4.3. Quy tắc giá trong giỏ hàng

Kiểm tra nghiệp vụ giữ giá khuyến mãi khi khách hàng thêm sản phẩm vào giỏ trong thời gian khuyến mãi.

Nếu hệ thống đã hỗ trợ, giữ lại và kiểm thử. Nếu chưa, trước tiên xác định schema, luồng giá và nghiệp vụ hiện tại rồi đề xuất cách bổ sung an toàn.

Định hướng nghiệp vụ:
- Giá tại thời điểm thêm vào giỏ được ghi nhận trên cart item.
- Có thời hạn giữ giá được xác định rõ, chẳng hạn 24 giờ nếu được chấp thuận trong nghiệp vụ.
- Sau thời hạn giữ giá, hệ thống áp dụng quy tắc cập nhật giá đã thống nhất.
- Backend là nơi xác thực giá và tính toán tổng tiền.
- Voucher được kiểm tra riêng theo điều kiện và thời hạn.
- Không cho phép mua sản phẩm hết hàng, ngừng bán hoặc vượt tồn kho.
- Không tin tưởng giá do frontend gửi lên.

Không tự ý áp dụng thời hạn 24 giờ nếu dự án đã có quy tắc khác.

## 5. Checkout và đặt hàng

Rà soát luồng từ giỏ hàng đến khi tạo đơn hàng.

- Kiểm tra thông tin người nhận và địa chỉ giao hàng.
- Kiểm tra sản phẩm, số lượng, tồn kho và trạng thái bán.
- Kiểm tra giá và voucher ở backend.
- Tính chính xác tổng tiền.
- Tạo đơn hàng và chi tiết đơn hàng.
- Lưu giá sản phẩm tại thời điểm mua.
- Ngăn việc tạo đơn trùng khi người dùng nhấn nút nhiều lần.
- Xử lý lỗi mạng, lỗi thanh toán và lỗi database.
- Thông báo rõ khi đặt hàng thành công hoặc thất bại.
- Chỉ xóa hoặc cập nhật giỏ hàng theo quy trình đặt hàng thành công đã thiết kế.

Không tự tạo cổng thanh toán giả nếu dự án chưa tích hợp. Nếu có thanh toán trực tuyến, kiểm tra trạng thái giao dịch theo API hiện tại.

Nếu một đơn hàng có nhiều shop, xác minh quy tắc xử lý đơn theo schema và nghiệp vụ thực tế trước khi thay đổi.

## 6. Hồ sơ Customer và lịch sử đơn hàng

### 6.1. Hồ sơ cá nhân

- Xem thông tin tài khoản.
- Cập nhật các trường được phép chỉnh sửa.
- Kiểm tra dữ liệu đầu vào.
- Không hiển thị mật khẩu hoặc dữ liệu nhạy cảm.
- Nếu hỗ trợ đổi mật khẩu, phải xác thực và lưu mật khẩu an toàn theo cơ chế hiện tại.

### 6.2. Lịch sử và theo dõi đơn hàng

Giữ lại chức năng theo dõi đơn hàng đã hoàn thành nếu đang hoạt động tốt.

Kiểm tra:
- Danh sách đơn hàng của đúng khách hàng.
- Chi tiết đơn hàng.
- Sản phẩm, số lượng, giá tại thời điểm mua và tổng tiền.
- Trạng thái đơn hàng.
- Thông tin vận chuyển nếu có.
- Hủy đơn nếu trạng thái và nghiệp vụ cho phép.
- Không cho khách hàng xem hoặc thao tác trên đơn hàng của người khác.

Trạng thái hiển thị cho Customer phải nhất quán với trạng thái mà Shop Owner và Admin sử dụng.

### 6.3. Đánh giá sản phẩm

- Chỉ cho phép đánh giá theo điều kiện nghiệp vụ hiện tại, chẳng hạn khách hàng đã mua và đơn hàng hoàn tất.
- Kiểm tra quyền sở hữu đơn hàng.
- Tránh đánh giá trùng nếu hệ thống không cho phép.
- Hiển thị nội dung đánh giá thực tế.
- Kiểm tra phân trang và xử lý nội dung không hợp lệ.

Giữ lại hệ thống đánh giá/bình luận đã hoạt động tốt, không xây dựng lại nếu không cần thiết.

## 7. Voucher và khuyến mãi

- Hiển thị voucher mà khách hàng được phép sử dụng.
- Kiểm tra thời hạn, trạng thái và điều kiện áp dụng.
- Kiểm tra giá trị đơn tối thiểu nếu có.
- Phân biệt voucher toàn sàn và voucher của shop nếu hệ thống hỗ trợ.
- Không cho sử dụng voucher đã hết hạn, bị vô hiệu hóa hoặc không đáp ứng điều kiện.
- Không tính giảm giá hai lần.
- Tính toán ở backend, không dựa hoàn toàn vào giá trị frontend gửi lên.

Không làm hỏng chức năng tạo voucher của Shop Owner hoặc chức năng vô hiệu hóa voucher của Admin.

## 8. Trạng thái tài khoản và bảo mật

- Customer chỉ được truy cập và thao tác với dữ liệu của chính mình.
- API phải xác thực người dùng và kiểm tra quyền ở backend.
- Không chỉ ẩn nút hoặc menu ở frontend để bảo vệ dữ liệu.
- Nếu Admin khóa quyền đặt hàng trong một khoảng thời gian, Customer phải nhận được thông báo rõ ràng khi cố gắng đặt hàng.
- Nếu quy tắc khóa chỉ giới hạn việc đặt hàng, không tự ý chặn toàn bộ quyền truy cập website.
- Kiểm tra thời điểm bắt đầu, thời điểm kết thúc và trạng thái khóa nếu các trường này tồn tại.
- Không để khách hàng vượt qua giới hạn bằng cách gọi API trực tiếp.

## 9. Kiểm thử tích hợp giữa các vai trò

Kiểm tra các luồng liên quan:

1. Admin tạo hoặc duyệt shop theo quy trình hiện có.
2. Shop Owner đăng sản phẩm.
3. Customer tìm và xem sản phẩm.
4. Customer thêm sản phẩm vào giỏ.
5. Customer checkout và tạo đơn.
6. Shop Owner xử lý đơn hàng.
7. Customer theo dõi đơn hàng.
8. Customer đánh giá sau khi đáp ứng điều kiện.
9. Admin xem được các dữ liệu tương ứng trong phạm vi quản trị.

Kiểm tra sự nhất quán dữ liệu giữa frontend, backend và MongoDB.

## 10. File hướng dẫn kiểm thử Use Case bắt buộc

Sau khi hoàn thành việc rà soát, sửa lỗi và cải thiện Customer, tạo file Markdown tại thư mục gốc dự án với tên chính xác:

`customer_huongdanchucnang.md`

### 10.1. Nội dung bắt buộc

**Phần 1 — Giới thiệu**
- Mục đích tài liệu.
- Phạm vi chức năng Customer.
- Công nghệ và môi trường kiểm thử.
- Điều kiện chuẩn bị trước khi kiểm thử.

**Phần 2 — Danh sách Use Case**
- Mã UC.
- Tên Use Case.
- Mô tả.
- Tác nhân.
- Mức độ ưu tiên.
- Trạng thái triển khai.

**Phần 3 — Hướng dẫn kiểm thử chi tiết**

Xem xét các Use Case:
- UC đăng ký.
- UC đăng nhập và đăng xuất.
- UC xem trang chủ.
- UC tìm kiếm sản phẩm.
- UC lọc và sắp xếp sản phẩm.
- UC xem chi tiết sản phẩm.
- UC xem thông tin shop.
- UC thêm sản phẩm vào giỏ.
- UC cập nhật giỏ hàng.
- UC xóa sản phẩm khỏi giỏ.
- UC áp dụng voucher.
- UC đặt hàng.
- UC xem lịch sử đơn hàng.
- UC theo dõi đơn hàng.
- UC hủy đơn nếu được hỗ trợ.
- UC cập nhật hồ sơ.
- UC đánh giá sản phẩm.
- UC xử lý trường hợp tài khoản bị giới hạn đặt hàng.
- Các Use Case khác đang thực sự có trong source code.

Mỗi Use Case phải có:
- Mã và tên.
- Mục tiêu.
- Tác nhân.
- Điều kiện trước.
- Dữ liệu đầu vào.
- Các bước thực hiện cụ thể.
- Kết quả mong đợi.
- Kết quả thực tế để người kiểm thử ghi.
- Trạng thái Pass / Fail / Blocked / Not Tested.
- Ghi chú và lỗi phát hiện.

**Phần 4 — Kiểm thử ngoại lệ**
- Tìm kiếm không có kết quả.
- Giỏ hàng rỗng.
- Số lượng mua không hợp lệ.
- Sản phẩm hết hàng hoặc ngừng bán.
- Voucher hết hạn hoặc không hợp lệ.
- Giá thay đổi sau khi thêm vào giỏ.
- Nhấn nút đặt hàng nhiều lần.
- Lỗi API hoặc mất kết nối database.
- Truy cập dữ liệu của khách hàng khác.
- Gọi API khi chưa đăng nhập.
- Tài khoản bị giới hạn đặt hàng.

**Phần 5 — Tổng hợp kết quả**
- Tổng số Use Case.
- Số Pass, Fail, Blocked và Not Tested.
- Danh sách lỗi và mức độ nghiêm trọng.
- Các chức năng còn thiếu hoặc cần kiểm thử lại.

### 10.2. Quy tắc tạo tài liệu

- Dựa trên source code và chức năng thực tế.
- Sử dụng đúng route, tên nút, API, trạng thái và trường dữ liệu hiện có.
- Không bịa ra endpoint hoặc kết quả kiểm thử.
- Nếu chưa chạy kiểm thử, phải ghi `Not Tested`.
- Nếu chức năng chưa có, ghi rõ `Chưa triển khai`.
- Không đánh dấu Pass chỉ vì code đã được viết.
- Hướng dẫn phải đủ chi tiết để một thành viên khác có thể thực hiện theo từng bước.
- Đảm bảo file được tạo đúng tại thư mục gốc, không có đuôi `.txt` ngoài ý muốn.

## 11. Trình tự triển khai

1. Rà soát source code và xác định chức năng Customer hiện có.
2. Lập danh sách lỗi, tính năng hoàn thiện và tính năng còn thiếu.
3. Kiểm tra mối liên hệ giữa UI, API, MongoDB và các vai trò.
4. Sửa lỗi nghiệp vụ trước, đặc biệt là giỏ hàng và giá.
5. Cải thiện giao diện các khu vực cần thiết.
6. Kiểm thử các luồng mua hàng đầu-cuối.
7. Chạy build, lint và test hiện có.
8. Sửa lỗi phát hiện được.
9. Tạo `customer_huongdanchucnang.md`.
10. Báo cáo các file đã sửa, chức năng hoàn thành, kết quả kiểm thử và phần còn thiếu.

## 12. Tiêu chí hoàn thành

- Customer có giao diện rõ ràng, đồng bộ và responsive.
- Hero Banner được giữ nguyên.
- Các chức năng tốt hiện tại được bảo toàn.
- Lỗi giỏ hàng tự thêm sản phẩm được xử lý tận gốc.
- Giá, voucher, tồn kho và đơn hàng được xác thực ở backend.
- Dữ liệu Customer được bảo vệ đúng quyền.
- Luồng mua hàng hoạt động nhất quán với Shop Owner và Admin.
- File `customer_huongdanchucnang.md` được tạo tại thư mục gốc.
- Báo cáo cuối cùng phân biệt rõ phần đã triển khai, phần đã kiểm thử và phần còn thiếu.

**Hãy trực tiếp thực hiện trên source code hiện tại. Không dừng lại ở việc phân tích hoặc chỉ đưa ra kế hoạch.**