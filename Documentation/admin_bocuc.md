# YÊU CẦU TRIỂN KHAI: ADMIN HOMEPAGE BUILDER — GEAR TECH

## 1. Mục tiêu

Xây dựng chức năng **Quản lý giao diện và nội dung trang chủ (Homepage Builder)** trong Admin Dashboard của sàn thương mại điện tử Gear Tech.

Gear Tech là sàn có nhiều shop trực tuyến tương tự Shopee. Admin quản lý toàn sàn và có quyền cấu hình những khu vực xuất hiện trên trang chủ chung của Gear Tech.

Admin phải có thể tự tạo, chỉnh sửa, sắp xếp, lên lịch và xuất bản các khu vực nội dung trên trang chủ thông qua giao diện quản trị, thay vì phải sửa source code mỗi khi muốn thay đổi bố cục.

**Ví dụ:** Admin muốn trang chủ có ba khu vực PC, Laptop và Mac. Admin tạo ba khu vực, chọn danh mục tương ứng từ database, cấu hình cách hiển thị. Trang chủ tự động lấy các sản phẩm phù hợp từ dữ liệu thực tế.

Không được mặc định PC, Laptop và Mac là các khu vực cố định. Đây chỉ là ví dụ; Admin có thể tạo các khu vực khác theo nhu cầu.

## 2. Nguyên tắc trước khi triển khai

Trước khi sửa code, hãy kiểm tra:

- Cấu trúc thư mục frontend và backend.
- Router và layout của Admin Dashboard.
- Cấu trúc trang chủ Customer hiện tại.
- Các components banner, danh mục và thẻ sản phẩm đang sử dụng.
- MongoDB models hoặc collections liên quan đến danh mục, sản phẩm, shop, khuyến mãi và banner.
- API hiện có để lấy danh mục, sản phẩm và trạng thái kinh doanh.
- Cơ chế upload ảnh hiện tại.
- Cơ chế xác thực và phân quyền Admin.

Tận dụng kiến trúc hiện có. Không tạo thêm collection, API hoặc component trùng lặp nếu có thể mở rộng giải pháp hiện tại.

Không dùng dữ liệu mock để thay thế dữ liệu thật. Không làm hỏng trang chủ, Shop Dashboard, chức năng quản lý danh mục hoặc các chức năng mua hàng.

## 3. Thêm mục quản trị trang chủ

Trong Admin Dashboard, thêm nhóm chức năng:

**Quản lý trang chủ**
- Tổng quan bố cục.
- Quản lý các khu vực hiển thị.
- Quản lý banner.
- Quản lý chương trình khuyến mãi.
- Xem trước trang chủ.
- Lưu bản nháp và xuất bản.

Có thể tổ chức thành các tab hoặc trang con tùy theo cấu trúc dự án hiện tại.

## 4. Quản lý bố cục trang chủ

### 4.1. Tạo khu vực hiển thị

Admin có thể tạo một khu vực nội dung mới với các thông tin:

- Tên nội bộ của khu vực.
- Tiêu đề hiển thị trên trang chủ.
- Mô tả ngắn nếu cần.
- Loại khu vực.
- Trạng thái bật/tắt.
- Vị trí và thứ tự hiển thị.
- Thời gian bắt đầu và kết thúc hiển thị nếu cần.
- Cấu hình nội dung theo loại khu vực.

Các loại khu vực có thể gồm:

1. Banner quảng bá.
2. Danh mục sản phẩm.
3. Khu vực sản phẩm theo danh mục.
4. Sản phẩm nổi bật.
5. Sản phẩm khuyến mãi.
6. Khu vực chương trình sự kiện.
7. Các loại khu vực khác nếu phù hợp với kiến trúc hiện tại.

Không cần triển khai tất cả loại khu vực bằng cách tạo component riêng biệt hoàn toàn. Hãy thiết kế cấu trúc có khả năng tái sử dụng và mở rộng.

### 4.2. Chỉnh sửa và sắp xếp

Admin có thể:

- Tạo khu vực mới.
- Chỉnh sửa khu vực.
- Bật hoặc tắt khu vực.
- Thay đổi thứ tự xuất hiện.
- Sao chép cấu hình khu vực nếu hữu ích.
- Xóa khu vực sau khi xác nhận.
- Lưu thay đổi dưới dạng bản nháp.
- Xem trước trước khi xuất bản.

Việc xóa một khu vực bố cục không được xóa sản phẩm, danh mục hoặc dữ liệu shop gốc.

Khi kéo thả để đổi thứ tự, cần có phương án thao tác thay thế bằng nút lên/xuống để sử dụng được trên thiết bị cảm ứng và hỗ trợ accessibility.

## 5. Chọn danh mục để hiển thị sản phẩm

Đây là chức năng trọng tâm.

### 5.1. Ví dụ cấu hình PC, Laptop và Mac

Admin có thể tạo các khu vực sau:

| Tiêu đề khu vực | Danh mục được chọn | Nội dung |
|---|---|---|
| PC Gaming | Danh mục PC Gaming | Các sản phẩm PC phù hợp |
| Laptop nổi bật | Danh mục Laptop | Các sản phẩm laptop phù hợp |
| MacBook | Danh mục Mac hoặc danh mục tương ứng đang có | Các sản phẩm thuộc danh mục đã chọn |

Các tên trên chỉ là ví dụ minh họa, không được hardcode vào giao diện.

### 5.2. Cách chọn danh mục

Khi tạo hoặc chỉnh sửa khu vực loại “Sản phẩm theo danh mục”:

- Hiển thị danh sách danh mục lấy từ MongoDB.
- Hỗ trợ tìm kiếm danh mục.
- Hiển thị cấu trúc danh mục cha/con đúng cấp.
- Cho phép chọn một hoặc nhiều danh mục nếu thiết kế cho phép.
- Nếu chọn danh mục cha, cung cấp tùy chọn có lấy sản phẩm thuộc các danh mục con hay không.
- Lưu ID danh mục được chọn, không chỉ lưu tên hiển thị.
- Nếu danh mục bị xóa hoặc không còn hợp lệ, phải hiển thị cảnh báo trong Admin và xử lý an toàn ở trang chủ.

Không tự tạo danh mục PC, Laptop hoặc Mac nếu database chưa có. Admin phải chọn từ dữ liệu hiện có; nếu cần tạo danh mục mới thì dùng chức năng quản lý danh mục hiện tại.

### 5.3. Lấy sản phẩm tự động

Sau khi xuất bản, trang chủ tự động truy vấn các sản phẩm phù hợp với danh mục đã cấu hình.

Admin có thể cấu hình:

- Số lượng sản phẩm hiển thị.
- Cách sắp xếp: mới nhất, bán chạy hoặc tiêu chí khác nếu dữ liệu hỗ trợ.
- Có hiển thị sản phẩm khuyến mãi hay không.
- Có hiển thị sản phẩm hết hàng hay không.
- Có nút “Xem tất cả” hay không.
- Đường dẫn của nút “Xem tất cả” tới trang danh sách sản phẩm phù hợp.

Mặc định chỉ hiển thị sản phẩm đủ điều kiện kinh doanh theo trạng thái thực tế của hệ thống. Không hiển thị sản phẩm bị ẩn, bị từ chối hoặc ngừng bán như sản phẩm đang bán bình thường.

Nếu khu vực không có sản phẩm phù hợp, xử lý theo cấu hình đã chọn: ẩn khu vực hoặc hiển thị trạng thái phù hợp. Không tạo sản phẩm giả để lấp đầy khu vực.

### 5.4. Chọn sản phẩm thủ công nếu cần

Nếu muốn hỗ trợ khu vực sản phẩm nổi bật, có thể cho Admin chọn trực tiếp một danh sách sản phẩm cụ thể.

Cần phân biệt rõ hai chế độ:

- **Tự động theo danh mục:** sản phẩm thay đổi theo dữ liệu và tiêu chí đã cấu hình.
- **Chọn thủ công:** chỉ hiển thị các sản phẩm được Admin lựa chọn và vẫn đủ điều kiện kinh doanh.

Không bắt buộc triển khai chọn thủ công trong phiên bản đầu tiên nếu làm ảnh hưởng đến tiến độ; ưu tiên chế độ tự động theo danh mục.

## 6. Quản lý banner trang chủ

Admin có thể quản lý banner thông qua giao diện quản trị:

- Thêm banner.
- Tải ảnh từ máy tính theo cơ chế upload hiện có.
- Chỉnh sửa tiêu đề, mô tả và nội dung nút bấm nếu banner hỗ trợ.
- Cấu hình đường dẫn khi nhấn vào banner.
- Thiết lập thứ tự.
- Bật/tắt banner.
- Cấu hình thời gian bắt đầu và kết thúc hiển thị.
- Xem trước banner trên giao diện trang chủ.

Yêu cầu an toàn:

- Kiểm tra loại file và kích thước file.
- Xử lý ảnh không hợp lệ.
- Không để ảnh bị vỡ hoặc méo tỷ lệ.
- Không để banner hết hạn vẫn hiển thị.
- Không thay đổi hoặc xóa Hero Banner hiện tại khi chưa có cấu hình thay thế hợp lệ và chưa được xuất bản.

**Đặc biệt:** trước khi thay đổi Hero Banner hiện tại, phải kiểm tra cách nó đang hoạt động và giữ nguyên thiết kế, hiệu ứng, kích thước, nội dung, CTA và assets hiện tại cho đến khi Admin chủ động thay đổi và xuất bản cấu hình mới.

## 7. Quản lý thời gian khuyến mãi

Admin có thể tạo và quản lý chương trình khuyến mãi hiển thị trên trang chủ.

### 7.1. Thông tin chương trình

Các trường có thể gồm:

- Tên chương trình.
- Tiêu đề hiển thị.
- Mô tả.
- Banner hoặc hình ảnh chương trình nếu cần.
- Thời gian bắt đầu.
- Thời gian kết thúc.
- Trạng thái bản nháp, đã lên lịch, đang diễn ra, đã kết thúc hoặc đã tắt.
- Các khu vực trang chủ liên quan.
- Loại nội dung khuyến mãi.
- Quy tắc hiển thị và điều kiện áp dụng.

### 7.2. Quy tắc thời gian

- Cho phép đặt ngày giờ bắt đầu và kết thúc.
- Thời điểm kết thúc phải sau thời điểm bắt đầu.
- Chương trình đã lên lịch chưa được hiển thị trước giờ bắt đầu.
- Chương trình tự hết hiệu lực khi qua giờ kết thúc.
- Admin có thể tắt chương trình trước hạn nếu có quyền.
- Cần xử lý múi giờ nhất quán giữa frontend, backend và database.
- Trạng thái đang diễn ra phải được xác định dựa trên thời gian và trạng thái bật/tắt thực tế.

Không phụ thuộc vào bộ đếm thời gian chỉ chạy ở frontend để quyết định chương trình có hiệu lực hay không.

### 7.3. Phân biệt chương trình hiển thị và giảm giá thực tế

Nếu chương trình chỉ là banner quảng bá, nó chỉ kiểm soát nội dung và thời gian hiển thị.

Nếu chương trình thực sự giảm giá sản phẩm, phải dùng hoặc mở rộng nghiệp vụ giá khuyến mãi hiện có và xác thực ở backend.

Không được tự ý giảm giá tất cả sản phẩm chỉ vì chúng xuất hiện trong khu vực khuyến mãi.

Không tạo cơ chế giá mới trùng lặp nếu hệ thống đã có promotion hoặc voucher. Phải kiểm tra các chức năng hiện tại và xác định rõ quan hệ giữa chương trình, giá sản phẩm và voucher.

## 8. Xem trước, lưu nháp và xuất bản

Thiết kế quy trình quản lý nội dung an toàn:

1. Admin tạo hoặc chỉnh sửa cấu hình.
2. Admin lưu bản nháp.
3. Admin xem trước bố cục.
4. Admin kiểm tra các khu vực, sản phẩm và thời gian hiển thị.
5. Admin chủ động xuất bản.
6. Trang chủ Customer hiển thị phiên bản đã xuất bản.

Nếu kiến trúc hiện tại cho phép, nên tách bản nháp khỏi cấu hình đang hoạt động để thay đổi chưa xuất bản không ảnh hưởng khách hàng.

Nếu chưa có cơ chế versioning, hãy chọn phương án đơn giản, phù hợp kiến trúc hiện tại nhưng vẫn tránh cập nhật trang chủ từng phần khiến nội dung hiển thị không nhất quán.

Có xác nhận trước khi xuất bản hoặc xóa cấu hình quan trọng.

## 9. Tích hợp với trang chủ Customer

Trang chủ Customer phải render nội dung dựa trên cấu hình Admin đã xuất bản.

Các yêu cầu:

- Đọc danh sách khu vực đang hoạt động.
- Sắp xếp theo thứ tự cấu hình.
- Chọn component hiển thị dựa trên loại khu vực.
- Lấy danh mục và sản phẩm từ dữ liệu thực.
- Áp dụng thời gian hiển thị của từng khu vực.
- Không hiển thị nội dung nháp hoặc khu vực đã tắt.
- Không hiển thị chương trình đã hết hạn.
- Xử lý tốt trường hợp thiếu ảnh, danh mục không hợp lệ hoặc không có sản phẩm.
- Responsive trên desktop, tablet và mobile.
- Không làm hỏng tìm kiếm, navbar, giỏ hàng, trang sản phẩm và các chức năng mua hàng.

Không thay thế trang chủ hiện tại bằng một trang demo riêng. Phải tích hợp trực tiếp vào luồng Customer hiện tại.

## 10. Database và API

Trước tiên, kiểm tra collections và API đang có. Sau đó quyết định mở rộng cấu trúc hiện tại hay bổ sung collections mới.

Nếu cần lưu cấu hình bố cục, cân nhắc các nhóm dữ liệu:

- Cấu hình trang chủ.
- Các khu vực hiển thị.
- Tham chiếu danh mục hoặc sản phẩm.
- Cấu hình banner.
- Thời gian hiển thị.
- Trạng thái bản nháp/xuất bản.
- Thứ tự hiển thị.

Đây là định hướng dữ liệu, không phải yêu cầu tạo đúng số collection cố định.

Yêu cầu API:

- Admin được phép tạo, đọc, sửa, bật/tắt, sắp xếp và xóa cấu hình.
- Customer chỉ đọc cấu hình đã xuất bản và nội dung đủ điều kiện hiển thị.
- Backend kiểm tra quyền Admin.
- Kiểm tra dữ liệu đầu vào và quan hệ danh mục/sản phẩm.
- Không tin tưởng role gửi từ frontend.
- Tránh trả dữ liệu nháp hoặc thông tin quản trị nhạy cảm cho Customer.
- Không trả về dữ liệu sản phẩm không được phép bán.
- Có xử lý lỗi, loading và dữ liệu rỗng phù hợp.

Không tạo API trùng lặp nếu có thể mở rộng API hiện tại.

## 11. Giao diện Admin Builder

Giao diện phải rõ ràng và thuận tiện sử dụng.

Đề xuất bố cục:

- Cột danh sách các khu vực hiện có.
- Khu vực xem trước trang chủ.
- Bảng hoặc panel cấu hình khu vực đang chọn.
- Nút thêm khu vực.
- Nút lưu bản nháp.
- Nút xem trước.
- Nút xuất bản.
- Thông báo trạng thái và thời gian hiển thị.

Khi chọn một khu vực, Admin có thể chỉnh sửa cấu hình tương ứng mà không phải thao tác trực tiếp với JSON hoặc sửa source code.

Không cần tạo trình kéo thả tự do phức tạp ngay từ đầu. Ưu tiên cấu hình theo các loại khu vực rõ ràng, có thể sắp xếp và xem trước.

## 12. Bảo toàn chức năng hiện tại

- Không thay đổi luồng mở shop và duyệt shop.
- Không để Admin Builder chỉnh sửa dữ liệu thuộc quyền sở hữu riêng của Shop Owner.
- Không làm hỏng hệ thống danh mục cha/con.
- Không làm hỏng quản lý sản phẩm, giá khuyến mãi hoặc voucher.
- Không thay đổi Hero Banner đang hoạt động nếu Admin chưa chủ động cập nhật và xuất bản.
- Không thay đổi schema dữ liệu tùy tiện.
- Không làm hỏng các route và API đang được các vai trò khác sử dụng.

## 13. Kiểm thử

Sau khi triển khai, kiểm tra tối thiểu:

1. Admin tạo khu vực PC và chọn danh mục từ database.
2. Admin tạo khu vực Laptop và chọn danh mục khác.
3. Admin tạo khu vực Mac nếu danh mục tương ứng tồn tại.
4. Trang chủ hiển thị đúng sản phẩm theo từng khu vực.
5. Thay đổi danh mục và xuất bản; trang chủ cập nhật đúng.
6. Thay đổi thứ tự khu vực.
7. Tắt một khu vực và xác nhận khu vực không xuất hiện trên trang chủ.
8. Lưu bản nháp nhưng chưa xuất bản; trang chủ vẫn giữ nội dung đang hoạt động.
9. Lên lịch banner hoặc chương trình trong tương lai.
10. Xác nhận nội dung không hiển thị trước thời gian bắt đầu.
11. Xác nhận nội dung hết hạn không còn hiển thị.
12. Kiểm tra thời điểm kết thúc không hợp lệ.
13. Kiểm tra khu vực không có sản phẩm.
14. Kiểm tra danh mục đã bị xóa hoặc không còn hợp lệ.
15. Kiểm tra người dùng không có quyền Admin gọi API quản trị.
16. Kiểm tra trang chủ trên desktop và mobile.
17. Kiểm tra các chức năng Customer khác vẫn hoạt động.
18. Chạy build, lint và các bài test hiện có.

Không đánh dấu kiểm thử Pass nếu chưa thực sự chạy kiểm thử.

## 14. Trình tự triển khai

1. Kiểm tra source code và báo cáo kiến trúc hiện tại.
2. Xác định danh mục, sản phẩm, banner và khuyến mãi đang được quản lý ở đâu.
3. Thiết kế cấu trúc cấu hình phù hợp với database hiện tại.
4. Xây dựng giao diện Homepage Builder trong Admin.
5. Triển khai tạo, sửa, sắp xếp, lưu nháp và xuất bản khu vực.
6. Tích hợp chọn danh mục và truy vấn sản phẩm thật.
7. Triển khai thời gian hiển thị và chương trình khuyến mãi.
8. Tích hợp cấu hình đã xuất bản vào trang chủ Customer.
9. Kiểm thử quyền truy cập, dữ liệu và giao diện.
10. Sửa lỗi và báo cáo kết quả.

## 15. Báo cáo sau triển khai

Sau khi hoàn thành, hãy báo cáo:

- Các file đã tạo và chỉnh sửa.
- Các collections hoặc schema đã thay đổi.
- Các API đã thêm hoặc cập nhật.
- Các loại khu vực đã hỗ trợ.
- Cách Admin tạo khu vực PC/Laptop/Mac bằng danh mục thực tế.
- Cách đặt lịch hiển thị và khuyến mãi.
- Cách xem trước và xuất bản.
- Kết quả build, lint và kiểm thử.
- Những tính năng chưa triển khai hoặc cần xác nhận thêm.

**Yêu cầu cuối cùng:** trực tiếp triển khai trên source code hiện tại của Gear Tech. Không chỉ viết tài liệu thiết kế hoặc tạo giao diện demo không kết nối database. Ưu tiên một phiên bản hoạt động hoàn chỉnh, an toàn và có thể mở rộng.