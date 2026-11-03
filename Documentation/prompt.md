# REDESIGN GEAR TECH SHOP DASHBOARD — INSPIRED BY SHOPEE SELLER CENTRE

## Vai trò

Bạn là Senior UI/UX Designer và Senior Frontend Engineer, có kinh nghiệm thiết kế dashboard quản lý thương mại điện tử.

Nhiệm vụ là redesign khu vực Chủ shop của dự án Gear Tech, tham khảo cách tổ chức nghiệp vụ và trải nghiệm sử dụng của Shopee Seller Centre, nhưng xây dựng giao diện riêng phù hợp với thương hiệu Gear Tech.

Đây là dự án đang phát triển. Hãy sửa trực tiếp source code hiện tại, không tạo một dự án mới.

## 1. Khảo sát source code trước khi triển khai

Trước tiên:

- Đọc cấu trúc thư mục frontend và backend.
- Xác định router, layout, sidebar, header, dashboard hiện tại và các trang quản lý shop.
- Xác định những component đang được tái sử dụng.
- Xác định các API, service và MongoDB collection liên quan.
- Xác định các trang quản lý sản phẩm, đơn hàng, tồn kho, nhà cung cấp, voucher, thống kê và cấu hình shop.
- Xác định các chức năng nào đang hoạt động và những chức năng nào mới có giao diện.

Sau khi khảo sát, hãy lập kế hoạch ngắn gọn rồi trực tiếp thực hiện. Không dừng ở việc chỉ mô tả thiết kế.

## 2. Phong cách thiết kế

Tham khảo Shopee Seller Centre về cấu trúc điều hướng, tổ chức nhóm chức năng và cách ưu tiên công việc cần xử lý. Không sao chép nguyên xi giao diện hoặc nhận diện thương hiệu Shopee.

Phong cách Gear Tech:

- Modern Tech + Premium E-commerce.
- Giao diện sáng, chuyên nghiệp, gọn gàng.
- Màu nền trắng hoặc xám rất nhạt.
- Màu xanh công nghệ làm điểm nhấn.
- Màu sắc trạng thái rõ ràng và nhất quán.
- Typography dễ đọc.
- Bảng dữ liệu có cấu trúc, căn chỉnh tốt.
- Khoảng cách hợp lý, không nhồi nhét quá nhiều thẻ.
- Responsive cho desktop, tablet và mobile.
- Ưu tiên khả năng sử dụng thực tế hơn hiệu ứng trang trí.

Không biến dashboard thành landing page marketing. Đây là công cụ vận hành shop hằng ngày.

## 3. Layout tổng thể

Thiết kế lại khu vực Chủ shop thành một Seller Centre thống nhất.

### A. Sidebar bên trái

Sidebar cần có nhóm chức năng rõ ràng, có thể thu gọn trên desktop và chuyển thành drawer trên màn hình nhỏ.

**Tổng quan**
- Tổng quan shop.

**Quản lý đơn hàng**
- Tất cả đơn hàng.
- Chờ xác nhận.
- Chờ xử lý/giao hàng.
- Đang giao.
- Hoàn thành.
- Đã hủy.
- Hoàn trả/hoàn tiền nếu hệ thống có hỗ trợ.

**Quản lý sản phẩm**
- Tất cả sản phẩm.
- Thêm sản phẩm.
- Sản phẩm đang bán.
- Sản phẩm hết hàng.
- Sản phẩm ngừng bán.

**Quản lý kho**
- Tổng quan tồn kho.
- Nhập hàng.
- Phiếu nhập kho.
- Nhà cung cấp.
- Lịch sử nhập/xuất kho.

**Marketing**
- Voucher của shop.
- Chương trình giảm giá.
- Sản phẩm khuyến mãi.

**Phân tích kinh doanh**
- Tổng quan doanh thu.
- Hiệu suất sản phẩm.
- Đơn hàng và số lượng bán.
- Đánh giá và lượt theo dõi.

**Quản lý gian hàng**
- Thông tin shop.
- Tùy chỉnh giao diện shop.
- Banner và ảnh đại diện.
- Màu sắc giao diện.

Chỉ hiển thị hoặc kích hoạt các mục mà dự án có thể hỗ trợ. Nếu một mục chưa được triển khai, không tạo trang giả hoặc số liệu giả để lấp đầy giao diện.

Tái sử dụng các route hiện có nếu phù hợp. Không tạo route trùng lặp.

### B. Header phía trên

Header cần có:

- Logo hoặc tên Gear Tech.
- Tên shop hiện tại.
- Breadcrumb thể hiện vị trí trang.
- Nút xem gian hàng công khai.
- Thông báo nếu hệ thống đã hỗ trợ.
- Menu tài khoản Chủ shop.
- Đăng xuất.

Thông tin shop phải lấy từ tài khoản đang đăng nhập, không hardcode tên shop.

### C. Khu vực nội dung

Nội dung trang thay đổi theo route được chọn. Giữ nguyên sidebar và header để tạo trải nghiệm điều hướng nhất quán.

Không xây dựng mỗi trang như một layout độc lập nếu chúng có thể dùng chung layout.

## 4. Trang Tổng quan shop

Đây là trang quan trọng nhất cần được thiết kế lại.

### A. Phần chào mừng

Hiển thị:

- Tên shop.
- Lời chào ngắn.
- Trạng thái hoạt động của shop.
- Nút xem gian hàng.
- Nút quản lý sản phẩm hoặc tạo sản phẩm mới.

### B. Khu vực công việc cần xử lý

Tạo một khu vực dễ nhìn, cho biết những công việc Chủ shop cần thực hiện.

Ví dụ:

- Đơn hàng chờ xác nhận.
- Đơn cần chuẩn bị giao.
- Đơn đang vận chuyển.
- Yêu cầu hoàn trả đang chờ xử lý.
- Sản phẩm sắp hết hàng.
- Sản phẩm hết hàng.
- Voucher sắp hết hạn nếu có dữ liệu phù hợp.

Mỗi mục có số lượng thực tế và có thể bấm để mở đúng trang đã lọc.

Không tính hoặc hiển thị những trạng thái không tồn tại trong nghiệp vụ hiện tại.

### C. Các chỉ số kinh doanh

Thiết kế các thẻ KPI:

- Doanh thu.
- Tổng đơn hàng.
- Số lượng sản phẩm đã bán.
- Giá trị đơn hàng trung bình nếu tính được chính xác.
- Số người theo dõi shop.
- Điểm đánh giá shop nếu có dữ liệu đánh giá shop.

Có bộ lọc thời gian phù hợp như hôm nay, 7 ngày, 30 ngày và khoảng thời gian tùy chỉnh nếu backend hỗ trợ.

Các số liệu phải được lấy từ API và MongoDB thực tế.

Không tự tạo doanh thu, lượt xem, tỷ lệ chuyển đổi hoặc số người theo dõi nếu hệ thống chưa thu thập dữ liệu đó. Với chỉ số chưa có nguồn dữ liệu, hãy ẩn chỉ số hoặc ghi rõ chưa có dữ liệu.

Định nghĩa doanh thu phải nhất quán với trạng thái đơn hàng và chính sách tính tiền hiện tại.

### D. Biểu đồ kinh doanh

Nếu dữ liệu backend đủ, xây dựng biểu đồ doanh thu hoặc số đơn hàng theo thời gian.

Yêu cầu:

- Bộ lọc thời gian.
- Tooltip khi tương tác.
- Trạng thái không có dữ liệu.
- Loading và lỗi tải dữ liệu.
- Dữ liệu khớp với bộ lọc và khoảng thời gian được chọn.

Nếu chưa có API thống kê, hãy xác định endpoint cần bổ sung và triển khai nếu môi trường cho phép. Không dùng dữ liệu mẫu rồi trình bày như dữ liệu thật.

### E. Sản phẩm bán chạy

Hiển thị danh sách sản phẩm bán chạy dựa trên số lượng bán thực tế.

Mỗi dòng có thể bao gồm:

- Ảnh sản phẩm.
- Tên sản phẩm.
- Giá bán.
- Số lượng đã bán.
- Tồn kho khả dụng.

Có nút xem tất cả sản phẩm.

### F. Đơn hàng gần đây

Hiển thị danh sách đơn hàng mới hoặc gần đây.

Thông tin phù hợp:

- Mã đơn hàng.
- Thời gian đặt.
- Sản phẩm hoặc số lượng mặt hàng.
- Tổng tiền.
- Trạng thái đơn.
- Trạng thái vận chuyển nếu có.
- Hành động xem chi tiết hoặc xử lý đơn.

Không đưa dữ liệu nhạy cảm của khách hàng lên dashboard nếu không cần thiết.

### G. Thông báo và nhắc nhở

Có thể hiển thị:

- Sản phẩm sắp hết hàng.
- Voucher sắp hết hạn.
- Đơn hàng cần xử lý.
- Thông báo hệ thống.

Chỉ hiển thị thông báo khi có dữ liệu thực tế. Không tạo thông báo giả.

## 5. Thiết kế các trang nghiệp vụ

Các trang sau cần sử dụng chung layout và design system.

### Quản lý đơn hàng

- Bộ lọc trạng thái.
- Tìm kiếm theo mã đơn nếu hỗ trợ.
- Bảng đơn hàng dễ đọc.
- Phân trang.
- Trạng thái rõ ràng.
- Xem chi tiết và thao tác theo đúng quyền.

### Quản lý sản phẩm

- Bảng hoặc lưới sản phẩm.
- Tìm kiếm và lọc.
- Thêm, sửa, xem chi tiết và ngừng bán theo chức năng hiện có.
- Hiển thị giá, số lượng bán và tồn kho khả dụng.
- Hành động chính rõ ràng.

### Quản lý kho

- Phân biệt tồn kho vật lý, số lượng phân bổ đăng bán và số lượng khả dụng theo mô hình dữ liệu hiện tại.
- Xem phiếu nhập.
- Tạo phiếu nhập.
- Quản lý nhà cung cấp.
- Xem lịch sử nhập/xuất.
- Hiển thị cảnh báo tồn kho khi có dữ liệu phù hợp.

Không làm thay đổi logic tính kho chỉ để phù hợp với giao diện mới.

### Marketing và voucher

- Danh sách voucher.
- Trạng thái hoạt động, hết hạn hoặc vô hiệu hóa.
- Tạo và chỉnh sửa voucher theo quyền của Chủ shop.
- Hiển thị điều kiện áp dụng, thời gian và phạm vi voucher.
- Có xác nhận trước thao tác quan trọng.

### Phân tích kinh doanh

- Bộ lọc thời gian.
- Chỉ số doanh thu và đơn hàng.
- Sản phẩm bán chạy.
- Đánh giá và lượt theo dõi nếu có nguồn dữ liệu.
- Không hiển thị các chỉ số không có dữ liệu nguồn.

### Quản lý gian hàng

- Thông tin shop.
- Ảnh đại diện.
- Banner/ảnh nền.
- Tùy chỉnh màu sắc theo chức năng hiện có.
- Preview trước khi lưu.
- Lưu thay đổi và xử lý lỗi upload.

Giữ nguyên cơ chế upload và lưu trữ ảnh nếu đang hoạt động; chỉ sửa những phần cần thiết.

## 6. Yêu cầu kỹ thuật

- Tái sử dụng component và thư viện hiện có.
- Nếu dự án đang dùng React Router, Axios, TanStack Query hoặc thư viện tương tự, hãy tuân thủ cách tổ chức hiện tại.
- Không tự ý cài thêm nhiều thư viện UI nếu không cần thiết.
- Tạo component dùng chung cho KPI card, bảng dữ liệu, trạng thái đơn hàng, bộ lọc và phân trang khi phù hợp.
- Xử lý loading, error và empty state.
- Không hardcode dữ liệu kinh doanh.
- Không để lộ API key hoặc thông tin nhạy cảm.
- Không phá vỡ xác thực và phân quyền.
- Chủ shop chỉ được xem dữ liệu thuộc shop mình.
- Kiểm tra quyền tại backend, không chỉ dựa vào việc ẩn menu ở frontend.
- Đảm bảo các route hiện có vẫn hoạt động.
- Không tự ý sửa giao diện Public, trang Admin hoặc Hero Banner.

## 7. Quy trình thực hiện

### Giai đoạn 1 — Audit

Đọc source code và lập danh sách:

- Layout hiện tại.
- Các route của Chủ shop.
- Các component có thể tái sử dụng.
- Các API và model liên quan.
- Các trang đã hoạt động.
- Các chỉ số chưa có dữ liệu.
- Những phần cần chỉnh sửa.

### Giai đoạn 2 — Redesign

Triển khai lần lượt:

1. Seller layout gồm sidebar, header và vùng nội dung.
2. Dashboard tổng quan.
3. Trang quản lý đơn hàng.
4. Trang quản lý sản phẩm.
5. Trang quản lý kho và nhà cung cấp.
6. Trang voucher.
7. Trang phân tích kinh doanh.
8. Trang tùy chỉnh gian hàng.

Tái sử dụng các trang nghiệp vụ hiện có thay vì viết lại logic từ đầu.

### Giai đoạn 3 — Kiểm thử

- Kiểm tra điều hướng giữa các trang.
- Kiểm tra phân quyền Chủ shop.
- Kiểm tra dữ liệu thực tế.
- Kiểm tra các bộ lọc và nút thao tác.
- Kiểm tra responsive.
- Chạy build và các bài test có sẵn.
- Đảm bảo không ảnh hưởng Public và Admin.

### Giai đoạn 4 — Báo cáo

Báo cáo:

- Các trang đã redesign.
- Các file đã sửa.
- Các API được tái sử dụng hoặc bổ sung.
- Những chức năng vẫn chưa có dữ liệu backend.
- Kết quả build/test.
- Các lỗi còn tồn tại.

## Điều kiện hoàn thành

Dashboard phải có layout thống nhất, điều hướng rõ ràng, dữ liệu thật, thao tác hoạt động, responsive và tương thích với kiến trúc hiện tại.

Bắt đầu bằng việc khảo sát source code, sau đó trực tiếp triển khai. Không dừng lại ở mockup, ảnh minh họa hoặc kế hoạch lý thuyết.