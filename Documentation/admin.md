# YÊU CẦU: REDESIGN ADMIN DASHBOARD — GEAR TECH

## 1. Mục tiêu

Hãy kiểm tra source code hiện tại và trực tiếp thiết kế lại, triển khai Admin Dashboard cho dự án Gear Tech — sàn thương mại điện tử kinh doanh máy tính, laptop và phụ kiện công nghệ.

Tham khảo cách tổ chức giao diện của các hệ thống quản trị thương mại điện tử chuyên nghiệp. Giao diện cần rõ ràng, hiện đại, dễ sử dụng, ưu tiên khả năng quản lý và theo dõi hoạt động toàn sàn.

**Không chỉ đưa ra kế hoạch hoặc đoạn code minh họa. Hãy trực tiếp chỉnh sửa source code hiện có và kiểm tra kết quả.**

## 2. Nguyên tắc bắt buộc

1. Đọc cấu trúc thư mục, router, components, API, database models và các chức năng hiện có trước khi sửa.
2. Giữ nguyên công nghệ, kiến trúc và quy ước đang sử dụng trong dự án.
3. Tận dụng lại components, API và dữ liệu MongoDB hiện có; tránh tạo trùng lặp.
4. Không tự ý xóa hoặc làm hỏng chức năng của Customer và Shop Owner.
5. Không sử dụng dữ liệu giả để thay thế dữ liệu thật. Nếu API hoặc dữ liệu chưa có, ghi rõ phần còn thiếu.
6. Phân quyền bằng backend, không chỉ ẩn menu ở frontend. Chỉ tài khoản Admin được phép truy cập chức năng quản trị.
7. Giữ nguyên các chức năng đã hoạt động tốt; không thay đổi giao diện Hero Banner của trang khách hàng.
8. Xử lý đầy đủ trạng thái loading, lỗi API, danh sách rỗng và thông báo thao tác thành công/thất bại.

## 3. Thiết kế giao diện Admin

### 3.1. Bố cục chung

- Sidebar bên trái có thể thu gọn.
- Header phía trên gồm tên Gear Tech, breadcrumb, thông báo nếu hệ thống đã hỗ trợ và menu tài khoản Admin.
- Khu vực nội dung hiển thị theo từng chức năng.
- Có trạng thái đang tải, lỗi, không có dữ liệu và xác nhận trước các thao tác quan trọng.
- Bảng dữ liệu cần hỗ trợ tìm kiếm, lọc, phân trang và sắp xếp khi phù hợp.
- Thiết kế responsive, sử dụng tốt trên desktop, tablet và mobile.
- Sử dụng phong cách Modern Tech + Premium E-commerce, rõ ràng và chuyên nghiệp. Màu đề xuất: navy `#101827`, xanh dương `#2563EB`, nền sáng `#F1F5F9`, trắng và màu trạng thái phù hợp.

## 4. Cấu trúc Sidebar

Tổ chức menu theo nhóm chức năng:

### A. Tổng quan
- Dashboard
- Báo cáo và thống kê

### B. Quản lý người dùng
- Danh sách tài khoản
- Khách hàng
- Chủ shop
- Khóa/mở khóa tài khoản

### C. Quản lý cửa hàng
- Danh sách cửa hàng
- Yêu cầu mở shop/chờ duyệt, nếu quy trình hiện tại có hỗ trợ
- Chi tiết cửa hàng
- Trạng thái hoạt động của shop

### D. Quản lý sản phẩm
- Danh sách sản phẩm toàn sàn
- Sản phẩm chờ duyệt, nếu có quy trình duyệt
- Sản phẩm đang bán
- Sản phẩm bị ẩn/ngừng bán

### E. Quản lý danh mục
- Danh mục cha
- Danh mục con
- Biểu tượng danh mục
- Thương hiệu

### F. Quản lý đơn hàng
- Tất cả đơn hàng
- Trạng thái đơn hàng
- Chi tiết đơn hàng

Chỉ triển khai những trạng thái và nghiệp vụ phù hợp với hệ thống hiện tại. Không tự ý thay đổi quy trình xử lý đơn hàng của shop.

### G. Khuyến mãi
- Danh sách voucher
- Trạng thái voucher
- Thời hạn và điều kiện áp dụng

Phân biệt voucher toàn sàn với voucher riêng của shop nếu database hiện tại có hỗ trợ. Admin không được tự ý xóa voucher của shop chỉ vì muốn vô hiệu hóa; phải tuân theo quyền sở hữu và nghiệp vụ đã thiết kế.

### H. Hệ thống
- Cài đặt hoặc cấu hình nếu dự án có chức năng tương ứng
- Nhật ký hoạt động nếu đã có dữ liệu và API phù hợp

Không tạo menu dẫn đến trang trống hoặc chức năng không tồn tại.

## 5. Dashboard tổng quan

Khi Admin đăng nhập, trang đầu tiên cần hiển thị:

### 5.1. Thẻ thống kê KPI

- Tổng số người dùng
- Tổng số khách hàng
- Tổng số shop
- Tổng số sản phẩm
- Tổng số đơn hàng
- Tổng doanh thu nền tảng, chỉ khi xác định được cách tính từ dữ liệu thực tế
- Số shop đang chờ duyệt, nếu có quy trình này
- Số tài khoản đang bị khóa

Mỗi thẻ cần có tiêu đề, giá trị, biểu tượng phù hợp và thông tin so sánh theo thời gian nếu backend hỗ trợ tính toán chính xác.

Không cộng doanh thu của tất cả shop rồi gọi đó là doanh thu của nền tảng nếu chưa trừ các khoản liên quan hoặc chưa có quy tắc tính phí. Phải phân biệt rõ:
- Tổng giá trị đơn hàng.
- Doanh thu bán hàng của các shop.
- Phí/hoa hồng mà nền tảng thực sự thu được.

### 5.2. Biểu đồ

Nếu dữ liệu hiện có đủ để tính toán, hiển thị:
- Doanh thu theo ngày/tháng.
- Số lượng đơn hàng theo thời gian.
- Tình hình tăng trưởng tài khoản.
- Tình trạng đơn hàng theo trạng thái.

Biểu đồ phải lấy dữ liệu từ backend và có bộ lọc khoảng thời gian khi phù hợp.

### 5.3. Các khu vực cảnh báo

- Yêu cầu mở shop cần xử lý.
- Tài khoản hoặc shop cần kiểm tra.
- Đơn hàng bất thường nếu hệ thống có tiêu chí xác định.
- Sản phẩm chờ duyệt.
- Các thông báo nghiệp vụ khác đã có dữ liệu.

### 5.4. Bảng dữ liệu nhanh

Hiển thị một số danh sách gần đây:
- Đơn hàng mới nhất.
- Shop mới đăng ký.
- Tài khoản mới tạo.
- Sản phẩm mới được thêm.

Cho phép nhấn vào từng bản ghi để mở trang chi tiết tương ứng.

## 6. Yêu cầu chức năng từng module

### 6.1. Quản lý người dùng

- Xem danh sách và thông tin chi tiết.
- Tìm kiếm theo tên, email hoặc số điện thoại nếu dữ liệu hỗ trợ.
- Lọc theo vai trò và trạng thái.
- Phân trang.
- Khóa/mở khóa tài khoản.
- Xác nhận trước thao tác khóa hoặc mở khóa.
- Ghi nhận lý do và thời hạn khóa nếu nghiệp vụ hiện tại hỗ trợ.

**Quy tắc quan trọng:** khóa khách hàng phải tuân theo nghiệp vụ đã xác định. Nếu yêu cầu là tạm ngăn khách hàng đặt hàng trong một khoảng thời gian, không được mặc định cấm họ truy cập toàn bộ website. Backend phải kiểm tra trạng thái khóa và thời hạn khi khách hàng đặt hàng.

Không cho Admin tự khóa tài khoản của chính mình hoặc tài khoản quan trọng khác theo cách khiến hệ thống mất khả năng quản trị, trừ khi hệ thống đã có cơ chế an toàn phù hợp.

### 6.2. Quản lý shop

- Xem danh sách shop và thông tin chủ sở hữu.
- Tìm kiếm, lọc theo trạng thái.
- Xem thông tin và sản phẩm của shop.
- Duyệt hoặc từ chối yêu cầu mở shop nếu hệ thống có quy trình này.
- Xem số lượng sản phẩm và các số liệu bán hàng khi dữ liệu hỗ trợ.
- Thay đổi trạng thái hoạt động theo đúng quyền hạn và nghiệp vụ.

Không tự tạo shop hoặc tài khoản chủ shop chỉ để làm đẹp dashboard. Nếu có chức năng tạo thủ công, phải kiểm tra các trường bắt buộc, quyền hạn và tính nhất quán dữ liệu.

### 6.3. Quản lý sản phẩm

- Xem toàn bộ sản phẩm trên sàn.
- Tìm kiếm theo tên, shop, danh mục và thương hiệu.
- Lọc theo trạng thái.
- Xem chi tiết sản phẩm, giá, tồn kho và shop sở hữu.
- Duyệt sản phẩm nếu hệ thống có quy trình duyệt.
- Ẩn hoặc xử lý sản phẩm vi phạm theo nghiệp vụ có sẵn.

Admin không được tùy ý sửa tồn kho của shop hoặc thực hiện thao tác ảnh hưởng dữ liệu bán hàng mà không có quy trình phù hợp.

### 6.4. Quản lý danh mục và thương hiệu

- Thêm, xem, sửa và xóa danh mục theo quy tắc an toàn.
- Hỗ trợ quan hệ danh mục cha/con.
- Hiển thị danh mục con đúng cấp, không đặt ngang cấp với danh mục cha.
- Tải biểu tượng danh mục từ máy tính nếu backend đã hỗ trợ upload hoặc có thể bổ sung an toàn.
- Quản lý thương hiệu.
- Kiểm tra sản phẩm liên quan trước khi xóa danh mục hoặc thương hiệu.
- Không xóa dữ liệu đang được tham chiếu nếu chưa có quy tắc xử lý phù hợp.

### 6.5. Quản lý đơn hàng

- Xem danh sách đơn hàng toàn sàn.
- Tìm kiếm theo mã đơn hoặc thông tin được hỗ trợ.
- Lọc theo trạng thái, shop và thời gian.
- Xem chi tiết đơn hàng, các sản phẩm, số lượng, giá tại thời điểm mua, khách hàng và thông tin thanh toán.
- Hiển thị trạng thái rõ ràng.
- Chỉ cho phép Admin thay đổi trạng thái hoặc xử lý đơn khi nghiệp vụ hiện tại cho phép.

Không tự ý thay đổi luồng xử lý đơn hàng đang được Shop Owner sử dụng.

### 6.6. Quản lý voucher

- Xem danh sách voucher và thông tin áp dụng.
- Phân biệt voucher toàn sàn và voucher của shop nếu được hỗ trợ.
- Lọc theo trạng thái và thời hạn.
- Vô hiệu hóa voucher theo đúng quyền.
- Khi vô hiệu hóa, ưu tiên cập nhật trạng thái thay vì xóa bản ghi nếu hệ thống cần lưu lịch sử.

Không để voucher đã vô hiệu hóa tiếp tục được áp dụng tại backend.

### 6.7. Báo cáo và thống kê

- Hiển thị các số liệu có thể tính toán từ dữ liệu thực.
- Thống nhất cách tính doanh thu và đơn hàng.
- Xác định rõ đơn hàng nào được tính doanh thu, cách xử lý đơn hủy và hoàn tiền.
- Không đếm trùng các sản phẩm trong một đơn hàng thành nhiều đơn hàng.
- Nếu thiếu dữ liệu, ghi rõ chưa hỗ trợ thay vì hiển thị số giả.

## 7. Backend, API và bảo mật

- Kiểm tra API hiện có trước khi tạo API mới.
- Bổ sung API còn thiếu nếu cần thiết.
- Bảo vệ API quản trị bằng middleware xác thực và phân quyền Admin.
- Không tin tưởng role hoặc user ID gửi lên từ frontend nếu chưa xác thực.
- Kiểm tra dữ liệu đầu vào, quyền sở hữu, trạng thái bản ghi và trường hợp dữ liệu không tồn tại.
- Không trả về thông tin nhạy cảm như mật khẩu hoặc dữ liệu xác thực.
- Thực hiện các thao tác cập nhật có kiểm soát, trả về HTTP status và thông báo lỗi phù hợp.
- Nếu có upload ảnh, kiểm tra loại file, kích thước và đường dẫn lưu trữ.
- Không làm hỏng các API mà Shop Owner hoặc Customer đang sử dụng.

## 8. Tổ chức code

- Tái sử dụng layout, sidebar, header, bảng, modal, form và các component dùng chung khi phù hợp.
- Tách phần giao diện, gọi API và xử lý nghiệp vụ theo kiến trúc hiện tại.
- Tránh viết toàn bộ dashboard trong một component quá lớn.
- Đảm bảo route rõ ràng và không xung đột với route của các vai trò khác.
- Các nút phải hoạt động thật; không tạo nút chỉ có giao diện nhưng không thực hiện thao tác.

## 9. File tài liệu kiểm thử bắt buộc

Sau khi triển khai Admin Dashboard, tạo file Markdown tại thư mục gốc của dự án với tên chính xác:

`admin_huongdanchucnang.md`

File phải viết bằng tiếng Việt, có nội dung hướng dẫn kiểm thử chức năng Admin theo Use Case thực tế của hệ thống.

### Cấu trúc bắt buộc của file

1. **Mục đích tài liệu**
   - Mục tiêu kiểm thử.
   - Phạm vi kiểm thử Admin.
   - Môi trường cần chuẩn bị.
   - Điều kiện tiên quyết: backend, frontend, MongoDB, tài khoản Admin và dữ liệu kiểm thử.

2. **Danh sách Use Case**
   - Mã UC.
   - Tên Use Case.
   - Mô tả.
   - Tác nhân.
   - Mức độ ưu tiên.
   - Trạng thái triển khai: Đã triển khai / Chưa triển khai / Cần xác minh.

3. **Đặc tả và hướng dẫn kiểm thử từng Use Case**

   Mỗi Use Case phải có:
   - Mã và tên Use Case.
   - Mục tiêu.
   - Tác nhân.
   - Điều kiện trước.
   - Dữ liệu đầu vào.
   - Các bước thực hiện cụ thể.
   - Kết quả mong đợi.
   - Kết quả thực tế để người kiểm thử tự ghi.
   - Trạng thái: Pass / Fail / Blocked / Not Tested.
   - Ghi chú hoặc lỗi phát hiện.

4. **Các nhóm Use Case cần xem xét**
   - Đăng nhập Admin và phân quyền.
   - Xem Dashboard tổng quan.
   - Xem và lọc thống kê.
   - Quản lý tài khoản.
   - Khóa/mở khóa tài khoản.
   - Quản lý và duyệt shop.
   - Quản lý sản phẩm.
   - Quản lý danh mục cha/con.
   - Quản lý thương hiệu.
   - Quản lý đơn hàng.
   - Quản lý voucher.
   - Kiểm tra truy cập trái phép từ Customer hoặc Shop Owner.
   - Các chức năng quản trị khác thực sự có trong source code.

5. **Kiểm thử ngoại lệ và bảo mật**
   - Đăng nhập sai.
   - Tài khoản không có quyền Admin truy cập route Admin.
   - Gọi trực tiếp API quản trị khi không có quyền.
   - Tìm kiếm không có kết quả.
   - Danh sách rỗng.
   - Dữ liệu không hợp lệ.
   - Bản ghi không tồn tại.
   - Lỗi kết nối API hoặc MongoDB.
   - Thao tác xóa hoặc thay đổi trạng thái với dữ liệu đang được tham chiếu.
   - Kiểm tra thời hạn khóa khách hàng nếu tính năng này có tồn tại.

6. **Bảng tổng hợp kết quả kiểm thử**
   - Tổng số Use Case.
   - Số Pass.
   - Số Fail.
   - Số Blocked.
   - Số Not Tested.
   - Danh sách lỗi và mức độ nghiêm trọng.

### Quy tắc viết tài liệu

- Viết các bước đủ cụ thể để người khác có thể làm theo.
- Sử dụng route, tên trường, trạng thái, nút bấm và API đúng với source code thực tế.
- Không tự bịa route, endpoint, dữ liệu, chức năng hoặc kết quả kiểm thử.
- Nếu chưa thực sự chạy kiểm thử, ghi trạng thái `Not Tested`; không đánh dấu Pass chỉ vì đã viết code.
- Nếu chức năng chưa được triển khai, ghi rõ `Chưa triển khai` hoặc `Blocked` và nguyên nhân.
- Có dữ liệu mẫu minh họa khi cần, nhưng phải ghi rõ dữ liệu đó là dữ liệu kiểm thử.
- Giữ file dễ đọc bằng Markdown, có mục lục và bảng phù hợp.
- Đảm bảo file được tạo tại đúng thư mục gốc, không tạo nhầm thành `admin_huongdanchucnang.md.txt`.

## 10. Trình tự thực hiện

1. Kiểm tra cấu trúc source code và xác định các chức năng Admin hiện tại.
2. Lập bản đồ route, component, API và model liên quan.
3. Thiết kế lại layout và sidebar Admin.
4. Hoàn thiện Dashboard tổng quan.
5. Triển khai hoặc sửa từng module quản trị dựa trên chức năng hiện có.
6. Kiểm tra phân quyền frontend và backend.
7. Chạy kiểm tra build, lint và các bài test hiện có.
8. Sửa lỗi phát hiện được.
9. Viết `admin_huongdanchucnang.md` dựa trên chức năng đã triển khai và xác minh.
10. Báo cáo các file đã sửa, chức năng đã hoàn thành, kết quả kiểm thử và các phần còn thiếu.

**Tiêu chí hoàn thành:** Admin Dashboard có giao diện thống nhất, các chức năng đã có dữ liệu thật, phân quyền đúng, không phá vỡ chức năng của các vai trò khác và file `admin_huongdanchucnang.md` tồn tại ở thư mục gốc với hướng dẫn Use Case có thể thực hiện theo từng bước.