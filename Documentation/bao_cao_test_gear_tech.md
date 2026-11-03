# PROMPT: THIẾT KẾ VÀ TRIỂN KHAI GIAO DIỆN TRANG KHUYẾN MÃI – GEAR TECH

Bạn là Senior UI/UX Designer và Senior Frontend Developer chuyên thiết kế website thương mại điện tử hiện đại.

Tôi muốn bạn thiết kế và triển khai giao diện chức năng **Khuyến mãi (Promotions)** cho dự án Gear Tech – nền tảng thương mại điện tử nhiều shop chuyên kinh doanh máy tính, laptop, linh kiện PC và phụ kiện công nghệ.

## 1. Bối cảnh dự án

Công nghệ hiện tại:
- ReactJS
- TypeScript
- Vite
- Tailwind CSS
- Axios
- TanStack Query
- React Router
- Backend Node.js + Express
- Database MongoDB

Các vai trò:
- Guest: Khách chưa đăng nhập.
- Customer: Khách hàng.
- Shop Owner: Chủ shop.
- Admin: Quản trị viên.

Đây là dự án đang phát triển, không phải dự án mới.

## 2. BẮT BUỘC: AUDIT SOURCE TRƯỚC KHI THIẾT KẾ

Trước khi viết code, hãy kiểm tra source hiện tại:

- Cấu trúc thư mục frontend.
- Các trang Home, Product Listing, Product Detail, Cart và Checkout.
- Header, Footer, Sidebar và các component dùng chung.
- Design system, màu sắc, typography, spacing, button, card.
- Routing và phân quyền.
- API khuyến mãi hiện có.
- Các model/schema voucher, promotion, coupon nếu đã tồn tại.
- Cách tính giảm giá trong giỏ hàng và checkout.
- Quan hệ giữa khuyến mãi với Shop, Product, Category và Order.

Sau khi audit, báo cáo:
1. Những component có thể tái sử dụng.
2. Những API và chức năng khuyến mãi đã tồn tại.
3. Những phần giao diện còn thiếu.
4. Những file dự kiến tạo mới hoặc chỉnh sửa.

Không tạo API hoặc database mới nếu chức năng đó đã tồn tại.

## 3. PHẦN A – TRANG KHUYẾN MÃI DÀNH CHO KHÁCH HÀNG

Tạo trang Khuyến mãi với đường dẫn phù hợp routing hiện tại, ví dụ `/promotions`.

### A1. Hero Banner

Thiết kế khu vực banner nổi bật ở đầu trang.

Nội dung gợi ý:
- Tiêu đề: "Ưu đãi công nghệ – Nâng cấp trải nghiệm"
- Mô tả: "Khám phá các chương trình khuyến mãi và ưu đãi dành riêng cho bạn."
- CTA: "Khám phá ưu đãi"

Yêu cầu:
- Hình ảnh liên quan đến công nghệ, laptop, PC, linh kiện.
- Thiết kế hiện đại, có điểm nhấn nhưng không quá rối.
- Responsive trên desktop, tablet và mobile.
- Không sử dụng hình ảnh hoặc logo thương hiệu không có quyền sử dụng.

### A2. Danh mục khuyến mãi

Tạo các bộ lọc:
- Tất cả ưu đãi.
- Ưu đãi từ Gear Tech.
- Ưu đãi từ cửa hàng.
- Voucher sản phẩm.
- Voucher vận chuyển.
- Ưu đãi sắp kết thúc.

Chỉ hiển thị những loại khuyến mãi mà hệ thống thực tế hỗ trợ.

### A3. Danh sách voucher

Mỗi voucher cần có:
- Mã voucher.
- Tên chương trình.
- Mức giảm giá.
- Điều kiện áp dụng.
- Giá trị đơn hàng tối thiểu.
- Mức giảm tối đa nếu có.
- Thời gian bắt đầu và kết thúc.
- Shop phát hành.
- Trạng thái sử dụng.
- Nút "Lưu mã" hoặc "Sao chép mã".

Ví dụ giao diện minh họa:
- Giảm 10% tối đa 200.000đ.
- Giảm 100.000đ cho đơn từ 1.000.000đ.
- Miễn phí vận chuyển cho đơn đủ điều kiện.

Không sử dụng những voucher minh họa như dữ liệu thật. Khi kết nối API, phải hiển thị dữ liệu thực tế.

### A4. Chương trình khuyến mãi nổi bật

Thiết kế khu vực:
- Flash Sale.
- Ưu đãi laptop.
- Ưu đãi linh kiện PC.
- Ưu đãi phụ kiện.
- Khuyến mãi từ các shop.

Mỗi chương trình có thể hiển thị:
- Banner.
- Tên chương trình.
- Thời gian áp dụng.
- Sản phẩm liên quan.
- Phần trăm giảm giá nếu có.
- Nút xem chi tiết.

Chỉ triển khai bộ đếm thời gian nếu API có thời gian bắt đầu và kết thúc hợp lệ. Không tạo countdown giả.

### A5. Bộ lọc và tìm kiếm

Cho phép khách hàng:
- Tìm kiếm theo tên chương trình hoặc mã voucher.
- Lọc theo loại ưu đãi.
- Lọc theo shop.
- Lọc theo trạng thái còn hiệu lực.
- Sắp xếp theo thời gian kết thúc hoặc mức ưu đãi nếu dữ liệu hỗ trợ.

### A6. Chi tiết khuyến mãi

Khi nhấn vào một chương trình, hiển thị:
- Tên chương trình.
- Mô tả.
- Mã voucher.
- Mức giảm.
- Điều kiện áp dụng.
- Sản phẩm áp dụng.
- Shop áp dụng.
- Thời gian hiệu lực.
- Cách sử dụng.
- Nút xem sản phẩm áp dụng.

### A7. Voucher của tôi

Nếu khách đã đăng nhập, có thể xem:
- Voucher đã lưu.
- Voucher còn hiệu lực.
- Voucher đã sử dụng.
- Voucher đã hết hạn.

Khách chưa đăng nhập vẫn có thể xem những chương trình công khai. Khi cần lưu voucher, yêu cầu đăng nhập theo cơ chế hiện tại.

## 4. PHẦN B – TÍCH HỢP VỚI GIỎ HÀNG VÀ CHECKOUT

Thiết kế giao diện chọn voucher trong Cart và Checkout.

Yêu cầu:
- Hiển thị voucher đủ điều kiện.
- Hiển thị voucher không đủ điều kiện kèm lý do nếu API hỗ trợ.
- Cho phép nhập mã voucher.
- Hiển thị số tiền được giảm.
- Cập nhật tổng tiền sau giảm.
- Phân biệt voucher toàn sàn và voucher của từng shop.
- Hiển thị rõ voucher vận chuyển và voucher sản phẩm.

Đặc biệt, Gear Tech là marketplace nhiều shop. Không áp dụng voucher của Shop A cho sản phẩm của Shop B nếu voucher không hỗ trợ phạm vi đó.

Không tự tính lại hoặc ghi đè kết quả giảm giá từ backend. Backend phải là nơi xác thực điều kiện và tính toán giá trị giảm cuối cùng.

## 5. PHẦN C – GIAO DIỆN QUẢN LÝ KHUYẾN MÃI CỦA SHOP OWNER

Tạo hoặc mở rộng mục "Khuyến mãi" trong trang quản lý shop.

### C1. Dashboard

Hiển thị:
- Tổng số chương trình.
- Đang hoạt động.
- Sắp diễn ra.
- Đã kết thúc.
- Số lượt sử dụng voucher nếu API có dữ liệu.

### C2. Danh sách chương trình

Các cột:
- Tên chương trình.
- Mã voucher.
- Loại khuyến mãi.
- Mức giảm.
- Thời gian áp dụng.
- Lượt sử dụng.
- Trạng thái.
- Thao tác.

### C3. Tạo và chỉnh sửa khuyến mãi

Form gồm các trường phù hợp với schema thực tế:
- Tên chương trình.
- Mô tả.
- Mã voucher.
- Loại giảm giá.
- Giá trị giảm.
- Giá trị giảm tối đa.
- Đơn hàng tối thiểu.
- Số lượt sử dụng.
- Giới hạn sử dụng mỗi khách.
- Thời gian bắt đầu.
- Thời gian kết thúc.
- Phạm vi áp dụng.
- Sản phẩm áp dụng.
- Danh mục áp dụng.
- Trạng thái.

Có validation rõ ràng:
- Không cho mức giảm âm.
- Không cho ngày kết thúc trước ngày bắt đầu.
- Không cho số lượt sử dụng âm.
- Không cho chỉnh sửa chương trình đã kết thúc nếu nghiệp vụ không cho phép.

Shop Owner chỉ được quản lý khuyến mãi thuộc shop của mình.

## 6. PHẦN D – GIAO DIỆN QUẢN LÝ KHUYẾN MÃI CỦA ADMIN

Admin có thể:
- Xem tất cả chương trình khuyến mãi.
- Tạo chương trình khuyến mãi toàn sàn.
- Xem chương trình của từng shop.
- Lọc theo shop và trạng thái.
- Duyệt chương trình nếu hệ thống có quy trình duyệt.
- Tạm ngừng chương trình.
- Xem thống kê sử dụng voucher.
- Xem lịch sử chỉnh sửa.

Phân biệt rõ:
- Khuyến mãi do Gear Tech phát hành.
- Khuyến mãi do Shop Owner phát hành.

Không cho phép Shop Owner chỉnh sửa chương trình khuyến mãi toàn sàn.

## 7. YÊU CẦU UI/UX

Hãy giữ nguyên design system hiện tại của Gear Tech.

Phong cách mong muốn:
- Modern Technology E-commerce.
- Clean, Premium, Professional.
- Giao diện sáng, nền trắng hoặc xám rất nhạt.
- Màu nhấn xanh dương phù hợp thương hiệu công nghệ.
- Card có bo góc vừa phải.
- Typography rõ ràng.
- Khoảng trắng hợp lý.
- Hình ảnh sản phẩm sắc nét.
- Không lạm dụng gradient, shadow hoặc animation.
- Không thiết kế quá nhiều màu gây rối mắt.

Ưu tiên desktop nhưng phải responsive tốt trên mobile.

Không redesign các trang khác nếu không cần thiết.

## 8. TRẠNG THÁI GIAO DIỆN

Mỗi trang cần có:
- Loading state.
- Empty state.
- Error state.
- Success feedback.
- Disabled state.
- Pagination nếu danh sách dài.
- Skeleton loading nếu phù hợp.

Không để giao diện trống khi API chưa có dữ liệu.

Nếu backend chưa hỗ trợ một chức năng:
- Không giả vờ chức năng đã hoạt động.
- Báo cáo API còn thiếu.
- Có thể hoàn thiện UI ở trạng thái chờ tích hợp.
- Không tự tạo dữ liệu giả trong database thật.

## 9. YÊU CẦU KỸ THUẬT

- Sử dụng TypeScript đúng kiểu dữ liệu.
- Tái sử dụng component hiện có.
- Tách component hợp lý.
- Sử dụng Axios service hiện tại.
- Sử dụng TanStack Query nếu dự án đang dùng.
- Giữ nguyên routing và authentication.
- Không viết toàn bộ logic trong một component.
- Không tạo CSS trùng lặp nếu đã có design token hoặc component tương ứng.
- Không hardcode dữ liệu API.
- Không sửa backend nếu chỉ cần thay đổi giao diện.
- Không xóa hoặc đổi tên API cũ khi chưa đánh giá tác động.

## 10. KIỂM THỬ

Sau khi triển khai:
- Kiểm tra trang khuyến mãi trên desktop và mobile.
- Kiểm tra điều hướng.
- Kiểm tra tìm kiếm và bộ lọc.
- Kiểm tra lưu/sao chép voucher.
- Kiểm tra voucher trong giỏ hàng.
- Kiểm tra phân quyền Customer, Shop Owner và Admin.
- Kiểm tra dữ liệu API.
- Kiểm tra TypeScript.
- Chạy build và các test hiện có.

Không báo PASS nếu chưa thực sự chạy kiểm tra.

## 11. QUY TRÌNH THỰC HIỆN

Giai đoạn 1: Audit source và báo cáo thiết kế.

Giai đoạn 2: Thiết kế trang khuyến mãi dành cho khách hàng.

Giai đoạn 3: Tích hợp voucher với Cart và Checkout.

Giai đoạn 4: Thiết kế quản lý khuyến mãi cho Shop Owner.

Giai đoạn 5: Thiết kế quản lý khuyến mãi cho Admin.

Giai đoạn 6: Kiểm thử và rà soát chức năng cũ.

Sau mỗi giai đoạn, báo cáo:
- File đã tạo.
- File đã chỉnh sửa.
- Component được tái sử dụng.
- API đã kết nối.
- Chức năng đã hoàn thành.
- Lỗi còn tồn tại.
- Kết quả kiểm thử thực tế.

## KẾT QUẢ MONG MUỐN

Tôi muốn Gear Tech có một trang Khuyến mãi chuyên nghiệp như các sàn thương mại điện tử lớn, giúp khách hàng dễ tìm và sử dụng voucher, đồng thời giúp Shop Owner và Admin quản lý chương trình khuyến mãi thuận tiện.

**Hãy audit source trước, sau đó triển khai theo từng giai đoạn. Ưu tiên hoàn thiện giao diện khách hàng trước, không phá vỡ chức năng hiện tại và không tự tạo dữ liệu giả để thay thế API thật.**