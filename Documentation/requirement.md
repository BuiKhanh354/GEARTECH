# PROMPT: XÂY DỰNG CHỨC NĂNG TÙY CHỈNH GIAO DIỆN CỬA HÀNG – GEAR TECH

## 1. Bối cảnh dự án

Tôi đang phát triển Gear Tech, một sàn thương mại điện tử chuyên bán máy tính, laptop, linh kiện PC và phụ kiện công nghệ.

Công nghệ dự án:
- Frontend: ReactJS, TypeScript, Vite, Tailwind CSS.
- Backend: Node.js, Express.js nếu đây là backend hiện tại của dự án.
- Database: MongoDB.
- Giao tiếp API: Axios/REST API theo cấu trúc hiện có.

Hệ thống có ba vai trò: Admin, Chủ shop và Khách hàng.

Tôi muốn bổ sung chức năng để **mỗi Chủ shop có thể tự thiết kế và tùy chỉnh trang bán hàng công khai của chính mình**, tương tự tính năng trang trí gian hàng trên các sàn thương mại điện tử.

## 2. Yêu cầu quan trọng

Trước khi viết code, hãy đọc source code hiện tại để xác định:
- Cấu trúc frontend và backend.
- Collection `shops` hiện có và các trường dữ liệu.
- Cách xác thực, phân quyền và xác định chủ sở hữu shop.
- Trang storefront hiện tại và cách hiển thị sản phẩm của từng shop.
- Các component, API và thư viện đã có.

Hãy tận dụng kiến trúc hiện tại. Không tạo dự án mới, không thay đổi công nghệ và không tạo collection trùng lặp nếu có thể mở rộng collection `shops`.

## 3. Chức năng dành cho Chủ shop

Tạo một khu vực quản lý có tên **“Thiết kế cửa hàng”** hoặc **“Tùy chỉnh giao diện shop”** trong trang quản lý của Chủ shop.

### 3.1. Chỉnh sửa thông tin thương hiệu

Chủ shop có thể:
- Thay đổi tên hiển thị cửa hàng nếu quy định hệ thống cho phép.
- Tải lên hoặc thay đổi logo shop.
- Tải lên ảnh bìa/banner cửa hàng.
- Chỉnh sửa mô tả ngắn và giới thiệu cửa hàng.
- Chọn màu chủ đạo và màu phụ.
- Chọn ảnh đại diện và ảnh bìa phù hợp với thương hiệu.

Không cho phép chỉnh sửa các trường hệ thống như shop ID, chủ sở hữu, trạng thái duyệt hoặc dữ liệu doanh thu bằng chức năng tùy chỉnh giao diện.

### 3.2. Tùy chỉnh bố cục trang shop

Cho phép Chủ shop cấu hình những khu vực sau:
- Banner đầu trang.
- Khu vực logo, tên shop và mô tả.
- Khu vực giới thiệu cửa hàng.
- Khu vực sản phẩm nổi bật.
- Khu vực sản phẩm mới nhất.
- Khu vực sản phẩm bán chạy nếu dữ liệu bán hàng hiện có đủ để xác định.
- Khu vực danh mục sản phẩm.
- Khu vực danh sách sản phẩm của shop.

Chủ shop có thể bật hoặc tắt các khu vực được hỗ trợ, thay đổi thứ tự hiển thị và chỉnh sửa tiêu đề khu vực.

Không tạo trình chỉnh sửa kéo-thả phức tạp nếu không cần thiết. Ưu tiên giao diện cấu hình trực quan, dễ dùng và phù hợp phạm vi dự án sinh viên.

### 3.3. Tùy chỉnh phong cách

Cung cấp các tùy chọn:
- Màu sắc chủ đạo.
- Kiểu hiển thị danh sách sản phẩm: dạng lưới hoặc danh sách nếu giao diện hiện tại hỗ trợ.
- Số cột sản phẩm trong phạm vi layout responsive cho phép.
- Kiểu hiển thị banner.
- Một số mẫu giao diện có sẵn, chẳng hạn:
  1. Modern Tech: hiện đại, chuyên nghiệp, phù hợp linh kiện máy tính.
  2. Minimal: tối giản, nền sáng, tập trung vào sản phẩm.
  3. Gaming: phong cách gaming, màu sắc nổi bật.

Các mẫu chỉ là bộ cấu hình giao diện. Không tạo những trang riêng biệt trùng lặp cho từng mẫu.

Màu sắc và nội dung do Chủ shop nhập phải được kiểm tra hợp lệ và không được làm hỏng giao diện hoặc ảnh hưởng đến các shop khác.

### 3.4. Xem trước và xuất bản

Trong trang quản lý, tạo hai khu vực:
- **Khu vực chỉnh sửa:** các trường cấu hình và tùy chọn.
- **Khu vực xem trước:** hiển thị trang shop gần giống với giao diện khách hàng thực tế.

Các thao tác cần có:
- Xem trước thay đổi trước khi lưu.
- Lưu bản nháp nếu kiến trúc hiện tại hỗ trợ.
- Xuất bản giao diện.
- Hủy thay đổi chưa lưu hoặc khôi phục cấu hình mặc định.

Nếu dùng cơ chế bản nháp và xuất bản, hãy phân biệt rõ cấu hình đang chỉnh sửa với cấu hình đang hiển thị công khai. Không để khách hàng thấy các thay đổi chưa xuất bản.

Sau khi xuất bản, khách hàng truy cập trang shop sẽ nhìn thấy giao diện mới.

## 4. Trang shop dành cho khách hàng

Cập nhật storefront công khai để đọc cấu hình giao diện của shop và hiển thị tương ứng.

Trang công khai cần có:
- Logo, tên shop, ảnh bìa và mô tả.
- Các khu vực đã được Chủ shop bật và sắp xếp.
- Danh sách sản phẩm đang được phép bán.
- Tìm kiếm hoặc lọc sản phẩm trong shop nếu hệ thống đã có.
- Phân trang sản phẩm.
- Nút xem chi tiết sản phẩm.
- Thông tin theo dõi shop nếu chức năng `shop_follower` đã được triển khai.

Chỉ hiển thị thông tin công khai. Không để khách hàng truy cập được trang chỉnh sửa, dữ liệu nháp hoặc thông tin quản trị.

Nếu shop chưa tùy chỉnh, hãy hiển thị giao diện mặc định đẹp và đồng nhất với Gear Tech.

Nếu shop bị khóa hoặc chưa được duyệt, phải tuân thủ quy tắc hiển thị và trạng thái shop đang được áp dụng trong hệ thống.

## 5. Thiết kế dữ liệu MongoDB

Ưu tiên mở rộng collection `shops` hiện có thay vì tạo collection mới.

Có thể sử dụng cấu trúc logic tương tự dưới đây, nhưng phải điều chỉnh theo schema thật của dự án:

- `storefront`: cấu hình trang bán hàng.
  - `logo`
  - `banner`
  - `description`
  - `theme`
  - `layout`
  - `sections`
  - `template`
- `storefrontDraft`: cấu hình đang chỉnh sửa, nếu cần tách bản nháp.
- `storefrontPublished`: cấu hình đang được công khai, nếu cần tách bản xuất bản.
- `updatedAt`, `publishedAt` nếu phù hợp với quy ước hiện tại.

Ví dụ cấu hình giao diện:
- Mẫu giao diện: `modern-tech`.
- Màu chủ đạo: `#2563EB`.
- Màu phụ: `#111827`.
- Banner: đường dẫn ảnh hợp lệ.
- Các khu vực: banner, giới thiệu, sản phẩm nổi bật, sản phẩm mới.
- Thứ tự và trạng thái bật/tắt của từng khu vực.

Đây là gợi ý thiết kế, không phải yêu cầu thêm tất cả trường một cách máy móc. Nếu dự án đã có cấu trúc tương đương, hãy tái sử dụng.

## 6. API cần triển khai

Hãy thiết kế endpoint phù hợp với cách đặt tên và cấu trúc hiện tại. Có thể tham khảo:

- `GET /api/shops/:shopId/storefront`: lấy giao diện công khai.
- `GET /api/shops/me/storefront`: lấy cấu hình của shop đang đăng nhập.
- `PUT /api/shops/me/storefront`: lưu cấu hình.
- `POST /api/shops/me/storefront/publish`: xuất bản cấu hình nếu cần tách endpoint.
- `POST /api/shops/me/storefront/reset`: khôi phục mặc định nếu phù hợp.

Không tạo endpoint trùng chức năng với API hiện có. Đảm bảo backend xác định shop từ tài khoản đã xác thực thay vì tin `shopId` do frontend gửi lên.

Tất cả API chỉnh sửa phải kiểm tra:
- Đã đăng nhập.
- Đúng vai trò Chủ shop.
- Shop thuộc quyền sở hữu của tài khoản hiện tại.
- Shop đáp ứng điều kiện được phép chỉnh sửa.
- Dữ liệu đầu vào hợp lệ.

## 7. Upload và bảo vệ dữ liệu

Nếu dự án đã có chức năng upload ảnh, hãy tái sử dụng. Nếu chưa có, hãy triển khai theo hạ tầng phù hợp với source code hiện tại.

- Kiểm tra loại tệp, dung lượng và định dạng ảnh.
- Không cho phép tải lên nội dung thực thi.
- Không tin đường dẫn ảnh hoặc dữ liệu cấu hình do frontend tự gửi.
- Nếu dùng dịch vụ lưu trữ ảnh, đặt thông tin bí mật ở backend/environment variables.
- Không để shop A chỉnh sửa cấu hình của shop B.
- Không cho phép tùy chỉnh giao diện can thiệp vào giá, tồn kho, trạng thái duyệt, doanh thu hoặc quyền tài khoản.
- Dùng CSS responsive để giao diện hoạt động tốt trên desktop, tablet và điện thoại.

## 8. Yêu cầu giao diện

Trang quản lý thiết kế shop phải:
- Phù hợp giao diện quản trị Chủ shop hiện tại của Gear Tech.
- Có sidebar hoặc khu vực điều hướng nhất quán với hệ thống.
- Nhóm các trường thành các mục rõ ràng: Thương hiệu, Bố cục, Màu sắc, Sản phẩm và Xuất bản.
- Có nút Lưu, Xem trước, Xuất bản và Khôi phục mặc định khi phù hợp.
- Có thông báo khi lưu thành công hoặc thất bại.
- Có trạng thái loading, lỗi, dữ liệu rỗng.
- Có kiểm tra dữ liệu đầu vào và hiển thị lỗi dễ hiểu.
- Không sử dụng dữ liệu mẫu giả khi API thực tế đã tồn tại.

## 9. Tiêu chí nghiệm thu

Chỉ coi chức năng hoàn thành khi kiểm tra được các tình huống:

1. Chủ shop A chỉnh sửa logo, banner, mô tả và màu sắc; lưu lại và tải lại trang vẫn còn dữ liệu.
2. Chủ shop A không thể sửa giao diện của shop B bằng cách thay ID trên URL hoặc request.
3. Các khu vực đã tắt không xuất hiện trên storefront công khai.
4. Thứ tự các khu vực thay đổi đúng theo cấu hình.
5. Bản nháp không hiển thị công khai trước khi xuất bản nếu có hỗ trợ bản nháp.
6. Sau khi xuất bản, khách hàng thấy giao diện mới.
7. Shop chưa tùy chỉnh vẫn hiển thị giao diện mặc định.
8. Sản phẩm trên storefront chỉ lấy từ đúng shop và tuân thủ trạng thái bán.
9. Giao diện hoạt động trên desktop và mobile.
10. Không làm hỏng chức năng quản lý sản phẩm, đơn hàng, đăng nhập hoặc các trang shop hiện có.

## 10. Cách Agent thực hiện

Hãy làm việc trực tiếp trên source code hiện tại:

1. Kiểm tra cấu trúc dự án và báo cáo các file liên quan.
2. Xác định những chức năng đã có và còn thiếu.
3. Đưa ra kế hoạch triển khai ngắn gọn.
4. Triển khai backend, schema và API cần thiết.
5. Triển khai giao diện quản lý thiết kế shop và xem trước.
6. Tích hợp cấu hình với storefront công khai.
7. Chạy kiểm tra hoặc build/test theo khả năng của dự án.
8. Báo cáo các file đã tạo/sửa, API đã triển khai, cách kiểm thử và những phần chưa hoàn tất.

Không chỉ tạo giao diện minh họa. Các nút và chức năng phải kết nối với dữ liệu thật, lưu được vào MongoDB và hoạt động xuyên suốt từ trang quản lý đến trang công khai. Không tự ý viết lại toàn bộ hệ thống hoặc thay đổi cấu trúc lớn khi chưa cần thiết.