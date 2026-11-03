# PROMPT: REDESIGN UI/UX MOBILE APP GEAR TECH

Bạn là **Senior UI/UX Designer và Senior React Native Developer**, có kinh nghiệm thiết kế ứng dụng thương mại điện tử công nghệ cao cấp.

Tôi đã hoàn thành ứng dụng di động Gear Tech bằng React Native + Expo + TypeScript. Hiện tại tôi muốn bạn **redesign giao diện toàn bộ ứng dụng để trông chuyên nghiệp, hiện đại, đẹp mắt và nhất quán hơn**.

Đây là nhiệm vụ cải tiến giao diện của một dự án đã tồn tại, KHÔNG phải tạo ứng dụng mới.

## 1. Nguyên tắc quan trọng nhất

Trước khi sửa code:

1. Đọc cấu trúc thư mục và các file cấu hình của dự án.
2. Kiểm tra toàn bộ màn hình, component dùng chung, navigation, theme, assets và styles hiện tại.
3. Chạy ứng dụng hoặc kiểm tra ảnh chụp giao diện nếu môi trường cho phép.
4. Xác định những điểm yếu về bố cục, màu sắc, typography, khoảng cách, icon, hình ảnh và trải nghiệm thao tác.
5. Lập danh sách các màn hình cần redesign và kế hoạch cải tiến.

Sau đó, tiến hành chỉnh sửa trực tiếp trên source hiện tại.

**Không được:**
- Tạo một dự án Expo mới để thay thế dự án hiện có.
- Xóa hoặc viết lại các chức năng nghiệp vụ chỉ để dễ thiết kế.
- Thay đổi API, backend, database hoặc cơ chế xác thực nếu không cần thiết cho giao diện.
- Thay dữ liệu thật bằng dữ liệu mẫu để làm giao diện trông đẹp hơn.
- Tự ý xóa màn hình hoặc tính năng đang hoạt động.
- Chỉ đổi màu sắc rồi kết luận đã redesign thành công.
- Tạo các nút đẹp nhưng không hoạt động.
- Thêm thư viện lớn khi các component hiện có có thể đáp ứng.
- Tự nhận đã kiểm tra giao diện thực tế nếu chưa chạy ứng dụng.

Nếu một thay đổi giao diện có nguy cơ ảnh hưởng chức năng, hãy tìm cách tách phần trình bày khỏi logic nghiệp vụ để giảm rủi ro.

## 2. Định hướng thiết kế

Hãy phát triển phong cách riêng cho Gear Tech, phù hợp với một sàn thương mại điện tử chuyên máy tính, laptop, linh kiện và phụ kiện công nghệ.

Phong cách mong muốn:

- Modern Technology E-commerce.
- Premium nhưng không phô trương.
- Clean, Minimal, Professional.
- Giao diện sáng, dễ nhìn và dễ sử dụng.
- Có điểm nhấn công nghệ, tạo cảm giác đáng tin cậy.
- Ưu tiên trải nghiệm mua sắm và khả năng đọc thông tin sản phẩm.
- Tránh giao diện đại trà, quá nhiều màu sắc hoặc giống template có sẵn.

### Bảng màu đề xuất

Hãy kiểm tra nhận diện hiện tại trước. Nếu dự án chưa có hệ thống màu rõ ràng, hãy xây dựng palette nhất quán:

- Primary: xanh navy đậm hoặc xanh công nghệ.
- Accent: xanh dương sáng, sử dụng có kiểm soát.
- Background: trắng hoặc xám rất nhạt.
- Surface: trắng.
- Primary text: xám đen đậm.
- Secondary text: xám trung tính.
- Border: xám nhạt.
- Success, warning, error: màu trạng thái dễ phân biệt.

Không sử dụng gradient, hiệu ứng phát sáng, bóng đổ hoặc viền màu quá mức trên mọi thành phần. Chỉ dùng khi thực sự cải thiện phân cấp thị giác.

Nếu nhận diện hiện tại đã có màu thương hiệu phù hợp, hãy tinh chỉnh và duy trì thay vì thay đổi tùy tiện.

## 3. Xây dựng Design System

Tạo hoặc chuẩn hóa hệ thống thiết kế dùng chung cho toàn bộ app.

### Màu sắc
- Định nghĩa color tokens.
- Phân biệt background, surface, text, border và trạng thái.
- Không viết màu rải rác tùy tiện trong từng màn hình.

### Typography
- Có hệ thống kiểu chữ rõ ràng cho tiêu đề, tiêu đề phụ, nội dung, giá sản phẩm, nhãn và chú thích.
- Giá sản phẩm phải dễ nhìn.
- Tên sản phẩm có giới hạn dòng hợp lý.
- Hỗ trợ tiếng Việt có dấu.
- Không sử dụng quá nhiều cỡ chữ hoặc độ đậm khác nhau.

### Spacing
- Chuẩn hóa khoảng cách theo một thang đo thống nhất.
- Căn lề màn hình nhất quán.
- Khoảng cách giữa các card, tiêu đề và nhóm nội dung phải hợp lý.

### Components
Tái sử dụng các component phù hợp, chẳng hạn:
- Button.
- SearchBar.
- ProductCard.
- CategoryCard.
- SectionHeader.
- PriceText.
- Badge.
- Input.
- EmptyState.
- LoadingState.
- ErrorState.
- ScreenContainer.

Không tạo component cho mọi phần tử nhỏ một cách máy móc. Chỉ trừu tượng hóa khi giúp tăng tính nhất quán và dễ bảo trì.

## 4. Redesign từng màn hình hiện có

Trước hết, hãy lập danh sách màn hình thật sự tồn tại trong dự án. Sau đó cải tiến các màn hình tương ứng trong các nhóm dưới đây.

### 4.1. Trang chủ

Ưu tiên cao nhất.

- Tổ chức lại header, logo, tìm kiếm và các hành động chính.
- Làm nổi bật danh mục sản phẩm.
- Phân chia khu vực sản phẩm theo hierarchy rõ ràng.
- Thiết kế product card đẹp, đồng bộ và dễ quét thông tin.
- Hiển thị giá, giá khuyến mãi và trạng thái sản phẩm rõ ràng khi dữ liệu hỗ trợ.
- Cân đối mật độ nội dung để trang chủ không quá trống hoặc quá dày.
- Tạo điểm nhấn thương hiệu Gear Tech.
- Không tự tạo banner quảng cáo hoặc thông tin khuyến mãi giả.

### 4.2. Danh mục và tìm kiếm

- SearchBar có trạng thái focus và thao tác xóa nội dung hợp lý.
- Hiển thị bộ lọc và sắp xếp dễ sử dụng nếu chức năng hiện tại hỗ trợ.
- Cải thiện khoảng cách, tiêu đề và trạng thái kết quả.
- Product grid hoặc list phải phù hợp với kích thước màn hình.
- Không làm mất chức năng tìm kiếm hiện có.

### 4.3. Chi tiết sản phẩm

- Hình ảnh sản phẩm là thành phần chính.
- Tên, giá, thông tin khuyến mãi và tồn kho được phân cấp rõ ràng.
- Thông số kỹ thuật trình bày dễ đọc.
- Thông tin cửa hàng có khu vực riêng nếu API cung cấp.
- Các hành động như thêm giỏ hàng và mua ngay phải dễ nhận biết.
- Giữ nguyên validation, xử lý tồn kho và logic đặt hàng.

### 4.4. Giỏ hàng và checkout

- Bố cục từng sản phẩm rõ ràng.
- Số lượng và thao tác xóa dễ sử dụng.
- Tổng tiền được nhấn mạnh.
- Phân biệt tiền hàng, phí vận chuyển và tổng thanh toán khi hệ thống có dữ liệu.
- Nút tiếp tục thanh toán có trạng thái phù hợp.
- Không tự tạo phí hoặc phương thức thanh toán không tồn tại.

### 4.5. Đăng nhập và đăng ký

- Form gọn gàng, hiện đại và dễ thao tác bằng một tay.
- Nhãn, placeholder, validation và thông báo lỗi rõ ràng.
- Nút chính có độ tương phản tốt.
- Bàn phím không che trường nhập hoặc nút xác nhận.
- Giữ nguyên cơ chế xác thực hiện tại.

### 4.6. Hồ sơ, đơn hàng và các màn hình khác

- Chuẩn hóa header, card, trạng thái và khoảng cách.
- Trạng thái đơn hàng dễ phân biệt.
- Hồ sơ người dùng gọn gàng và có phân cấp.
- Giữ nguyên các chức năng hiện tại.
- Các màn hình chưa được liệt kê cũng cần được kiểm tra và đồng bộ nếu thuộc phạm vi app.

## 5. Bottom Navigation và điều hướng

Nếu app hiện tại sử dụng bottom navigation:

- Thiết kế lại icon, nhãn và trạng thái đang chọn.
- Căn chỉnh chiều cao, khoảng cách và vùng chạm.
- Hỗ trợ safe area.
- Không làm mất trạng thái điều hướng hoặc thay đổi luồng chuyển màn hình.
- Không thêm tab mới nếu chưa có chức năng tương ứng.

Nếu đang dùng hệ thống điều hướng khác, hãy giữ kiến trúc hiện có và chỉ cải tiến phần trình bày phù hợp.

## 6. Product Card — Thành phần cần chú trọng

Đối với một ứng dụng bán máy tính, product card là thành phần xuất hiện nhiều nhất và cần được thiết kế đặc biệt tốt.

Yêu cầu:

- Ảnh sản phẩm có tỷ lệ thống nhất.
- Hình ảnh không bị kéo giãn hoặc cắt mất nội dung quan trọng.
- Tên sản phẩm có số dòng hợp lý.
- Giá hiện tại nổi bật.
- Giá gốc và nhãn giảm giá chỉ xuất hiện khi dữ liệu thực tế hỗ trợ.
- Thông tin tồn kho và trạng thái kinh doanh phải đúng.
- Khoảng cách giữa các thành phần đồng nhất.
- Chiều cao card phù hợp với layout.
- Không nhồi nhét quá nhiều thông số vào một card.
- Các card trong cùng danh sách phải có tính nhất quán.

## 7. Responsive và trải nghiệm sử dụng

Kiểm tra trên các kích thước màn hình khác nhau.

- Điện thoại màn hình nhỏ.
- Điện thoại màn hình lớn.
- Thiết bị có vùng notch hoặc thanh điều hướng hệ thống.
- Bàn phím mở và đóng.
- Tên sản phẩm dài.
- Giá trị lớn.
- Hình ảnh lỗi hoặc không tải được.
- Danh sách rỗng.
- Nội dung loading và lỗi API.

Không sử dụng kích thước cố định khiến giao diện bị tràn hoặc mất nội dung. Ưu tiên layout linh hoạt, `SafeAreaView` hoặc giải pháp tương đương phù hợp với phiên bản đang dùng.

## 8. Motion và tương tác

Có thể bổ sung các tương tác nhỏ khi phù hợp:

- Feedback khi nhấn nút.
- Loading indicator tinh tế.
- Chuyển trạng thái yêu thích.
- Hiệu ứng xuất hiện hoặc chuyển màn hình nhẹ nhàng.
- Skeleton loading nếu phù hợp với kiến trúc hiện tại.

Không thêm animation quá nhiều hoặc gây chậm ứng dụng. Mọi tương tác phải có phản hồi rõ ràng và không ảnh hưởng chức năng.

## 9. Quy tắc về hình ảnh và icon

- Ưu tiên ảnh sản phẩm thực tế đang có trong hệ thống.
- Xử lý ảnh lỗi bằng fallback thống nhất.
- Không dùng emoji làm icon chính.
- Sử dụng thư viện icon đang có nếu phù hợp.
- Nếu cần thêm thư viện icon, kiểm tra tính tương thích trước khi cài đặt.
- Không thay ảnh sản phẩm thật bằng hình minh họa không liên quan.
- Không tạo nội dung thương mại giả chỉ để lấp đầy bố cục.

## 10. Quy trình triển khai

Thực hiện theo thứ tự:

**Bước 1 — Audit:** Kiểm tra source và lập danh sách màn hình.

**Bước 2 — Đánh giá UI:** Xác định các vấn đề và ưu tiên cải tiến.

**Bước 3 — Design System:** Chuẩn hóa màu sắc, typography, spacing và component.

**Bước 4 — Redesign:** Bắt đầu từ trang chủ, product card, danh mục, chi tiết sản phẩm, giỏ hàng và các màn hình còn lại.

**Bước 5 — Kiểm tra:** Chạy app, chụp hoặc quan sát giao diện nếu môi trường hỗ trợ, sửa các vấn đề về layout và tương tác.

**Bước 6 — Regression test:** Xác nhận các chức năng nghiệp vụ trước đây vẫn hoạt động.

Không chỉ tạo một trang demo mới hoặc một ảnh mockup rồi dừng lại. Hãy áp dụng thiết kế vào source thực tế của ứng dụng.

## 11. Tiêu chí nghiệm thu

Chỉ hoàn thành khi:

- Các màn hình hiện có đã được kiểm tra và cải tiến theo phạm vi.
- Giao diện có ngôn ngữ thiết kế thống nhất.
- Trang chủ và product card đạt chất lượng tốt.
- Không có lỗi tràn layout nghiêm trọng trên kích thước thiết bị được kiểm tra.
- Nút bấm và thao tác vẫn hoạt động.
- Không làm hỏng navigation, API, authentication, cart hoặc order flow.
- Không xuất hiện dữ liệu giả hoặc trạng thái thành công giả.
- TypeScript, lint và các kiểm tra phù hợp được chạy khi có thể.
- Báo cáo rõ những màn hình đã chỉnh sửa, file đã thay đổi, các kiểm thử đã chạy và lỗi còn tồn tại.

Nếu không thể chạy trên thiết bị hoặc emulator, phải ghi rõ giới hạn đó.

**Hãy bắt đầu bằng việc kiểm tra giao diện và source hiện tại, sau đó trực tiếp redesign ứng dụng Gear Tech theo tiêu chuẩn UI/UX thương mại điện tử chuyên nghiệp. Ưu tiên chất lượng thị giác, tính nhất quán và bảo toàn chức năng hơn số lượng hiệu ứng.**