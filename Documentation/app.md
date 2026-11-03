# PROMPT CHO CODING AGENT — XÂY DỰNG MOBILE APP GEAR TECH

## 1. Vai trò

Bạn là Senior Mobile Developer có kinh nghiệm với React Native, Expo, TypeScript, Node.js, Express và MongoDB.

Nhiệm vụ của bạn là phát triển ứng dụng di động **Gear Tech**, một sàn thương mại điện tử chuyên bán máy tính, laptop, linh kiện và phụ kiện máy tính.

Bạn phải làm việc trực tiếp trên repository hiện tại. Không chỉ đưa ra hướng dẫn hoặc code minh họa; hãy kiểm tra source, triển khai các chức năng trong phạm vi yêu cầu, chạy kiểm thử và báo cáo kết quả thực tế.

## 2. Bối cảnh dự án

Dự án hiện tại có thể bao gồm:

- `front-end/`: Website sử dụng React, TypeScript và Vite.
- `back-end/`: Backend sử dụng Node.js, Express và MongoDB.
- `mobile-app/`: Thư mục dự kiến dành cho ứng dụng di động mới.

Đây là cấu trúc dự kiến. Trước khi làm việc, hãy kiểm tra repository thực tế và xác định chính xác cấu trúc đang tồn tại.

### Nguyên tắc bắt buộc

1. Giữ nguyên website đang hoạt động.
2. Không viết lại hoặc di chuyển source website sang React Native.
3. Không tự ý thay đổi backend, database schema hoặc API hiện có nếu không thực sự cần thiết.
4. Ưu tiên tái sử dụng API và nghiệp vụ backend hiện tại.
5. Nếu API chưa hỗ trợ chức năng cần thiết, hãy báo cáo phần còn thiếu và đề xuất cách bổ sung an toàn.
6. Không tạo dữ liệu giả để giả vờ chức năng đã kết nối thành công.
7. Không tự ý xóa file, ghi đè cấu hình hoặc làm mất dữ liệu hiện có.
8. Không đưa mật khẩu, secret hoặc API key vào mã nguồn client.
9. Không tích hợp AI trong giai đoạn này.
10. Không tuyên bố hoàn thành hoặc PASS nếu chưa có bằng chứng kiểm thử.

## 3. Công nghệ sử dụng

Tạo ứng dụng di động bằng:

- React Native.
- Expo.
- TypeScript.
- Expo Router hoặc hệ thống điều hướng phù hợp với phiên bản Expo được chọn.
- Axios để gọi REST API.
- TanStack Query để quản lý trạng thái dữ liệu từ server.
- Zustand khi thực sự cần quản lý trạng thái dùng chung.
- React Hook Form và thư viện validation phù hợp cho biểu mẫu.
- Thư viện lưu trữ thông tin xác thực an toàn phù hợp với nền tảng di động.

Không cài đặt hàng loạt thư viện không cần thiết. Trước khi cài đặt, kiểm tra phiên bản Node.js, package manager, Expo SDK và khả năng tương thích giữa các package.

## 4. Giai đoạn 1 — Audit repository

Trước khi tạo hoặc sửa code:

1. Kiểm tra cấu trúc thư mục.
2. Đọc các file `package.json`, cấu hình TypeScript, cấu hình Vite và các file khởi động của frontend/backend.
3. Xác định các màn hình website đã có.
4. Xác định API hiện có, cách đăng nhập, cơ chế xác thực, phân quyền và cách kết nối MongoDB.
5. Kiểm tra schema thực tế của sản phẩm, danh mục, thương hiệu, cửa hàng, người dùng, giỏ hàng và đơn hàng.
6. Xác định API nào có thể tái sử dụng trên mobile.
7. Ghi lại các vấn đề, rủi ro và chức năng chưa được backend hỗ trợ.

Sau bước này, hãy tạo một kế hoạch triển khai ngắn gọn và tiếp tục thực hiện trong phạm vi an toàn. Không dừng lại chỉ để trình bày kế hoạch nếu đã đủ thông tin để bắt đầu.

Nếu không thể đọc được source hoặc thiếu thông tin thiết yếu, hãy nói rõ phần nào bị chặn thay vì tự suy đoán.

## 5. Giai đoạn 2 — Khởi tạo mobile app

Tạo dự án Expo riêng trong `mobile-app/`, cùng cấp với `front-end/` và `back-end/` nếu phù hợp với repository hiện tại.

Yêu cầu:

- Cấu hình TypeScript.
- Cấu hình điều hướng.
- Tạo cấu trúc thư mục dễ bảo trì.
- Tách màn hình, components, hooks, services, types và cấu hình.
- Tạo lớp API client dùng chung.
- Cấu hình API base URL qua biến môi trường dành cho client.
- Có cơ chế xử lý lỗi mạng, timeout và trạng thái loading.
- Có trạng thái rỗng khi chưa có dữ liệu.
- Có giao diện thông báo lỗi dễ hiểu.
- Không sử dụng `localhost` làm địa chỉ API khi chạy trên điện thoại thật; phải cấu hình địa chỉ máy chủ có thể truy cập từ thiết bị.
- Không commit secret hoặc thông tin xác thực.

Cấu trúc tham khảo:

```text
mobile-app/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx
│   │   ├── categories.tsx
│   │   ├── cart.tsx
│   │   └── profile.tsx
│   ├── products/
│   │   └── [id].tsx
│   ├── shops/
│   │   └── [id].tsx
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   └── _layout.tsx
├── components/
├── services/
├── hooks/
├── store/
├── types/
├── constants/
├── assets/
├── app.json
├── package.json
├── tsconfig.json
└── .env.example
```

Đây chỉ là cấu trúc gợi ý. Có thể điều chỉnh theo phiên bản Expo và kiến trúc thực tế. Không tạo các màn hình rỗng chỉ để đủ số lượng file.

## 6. Giai đoạn 3 — Phát triển chức năng khách hàng

Ưu tiên hoàn thiện các chức năng sau.

### 6.1. Trang chủ

- Hiển thị thương hiệu Gear Tech.
- Hiển thị thanh tìm kiếm.
- Hiển thị danh mục sản phẩm.
- Hiển thị sản phẩm nổi bật hoặc sản phẩm mới nếu backend có dữ liệu tương ứng.
- Hiển thị ảnh, tên, giá và trạng thái sản phẩm theo dữ liệu thực tế.
- Có trạng thái tải, lỗi và không có dữ liệu.

### 6.2. Danh mục và tìm kiếm

- Hiển thị danh mục từ API.
- Lọc hoặc tìm kiếm theo các tiêu chí mà backend hỗ trợ.
- Có phân trang nếu API hỗ trợ.
- Xử lý kết quả rỗng và lỗi mạng.

### 6.3. Chi tiết sản phẩm

- Hiển thị ảnh, tên, giá, mô tả, tồn kho và thông tin cửa hàng nếu có.
- Kiểm tra trạng thái sản phẩm trước khi cho phép mua.
- Có thao tác thêm vào giỏ hàng khi API hỗ trợ.
- Không tự tạo giá, tồn kho hoặc đánh giá giả.

### 6.4. Trang cửa hàng

- Hiển thị thông tin cửa hàng.
- Hiển thị sản phẩm thuộc cửa hàng đó.
- Chỉ hiển thị các trường mà API thực sự cung cấp.
- Không cho phép người dùng truy cập dữ liệu quản lý nội bộ của cửa hàng khác.

### 6.5. Đăng ký và đăng nhập

- Tích hợp cơ chế xác thực hiện có.
- Hiển thị lỗi validation và lỗi trả về từ backend.
- Quản lý token/session theo đúng cơ chế hiện tại.
- Không lưu token nhạy cảm trong nơi lưu trữ không an toàn.
- Xử lý đăng xuất và trạng thái phiên hết hạn.
- Không tự xây dựng một hệ thống đăng nhập mới không tương thích với website.

### 6.6. Hồ sơ và đơn hàng

- Hiển thị thông tin tài khoản.
- Hiển thị lịch sử đơn hàng của chính người dùng.
- Hiển thị trạng thái và chi tiết đơn hàng.
- Không cho phép thay đổi ID trên client để xem đơn hàng của người khác.
- Chỉ triển khai chức năng cập nhật hoặc hủy đơn nếu backend cho phép và đúng quy tắc nghiệp vụ.

### 6.7. Giỏ hàng

- Hiển thị sản phẩm, số lượng, giá và tổng tiền.
- Cập nhật số lượng và xóa sản phẩm nếu API hỗ trợ.
- Xử lý trường hợp sản phẩm hết hàng hoặc thay đổi giá.
- Tổng tiền cuối cùng phải được backend xác thực; không tin tưởng giá do client gửi lên.

## 7. Giai đoạn 4 — Thanh toán và đặt hàng

Chỉ triển khai sau khi đã xác minh API và nghiệp vụ hiện tại.

- Tạo đơn hàng bằng API backend.
- Xác minh giá, tồn kho, số lượng và quyền sở hữu giỏ hàng ở server.
- Hiển thị trạng thái xử lý đơn hàng.
- Không tự tạo giao dịch thanh toán giả.
- Không hiển thị đơn hàng thành công nếu backend chưa xác nhận.
- Nếu chưa có tích hợp cổng thanh toán, ghi rõ đây là phần chưa triển khai và không tự tuyên bố đã hỗ trợ thanh toán trực tuyến.

## 8. Giao diện và trải nghiệm người dùng

Thiết kế ứng dụng theo hướng thương mại điện tử hiện đại:

- Giao diện sáng, sạch, chuyên nghiệp.
- Tập trung vào sản phẩm máy tính và linh kiện.
- Phân cấp thông tin rõ ràng.
- Có thanh điều hướng dưới cho các khu vực chính khi phù hợp.
- Có khoảng cách, typography và nút bấm nhất quán.
- Hỗ trợ màn hình điện thoại nhỏ.
- Hỗ trợ vùng an toàn của thiết bị và bàn phím.
- Có trạng thái loading, empty, error và success.
- Hỗ trợ thao tác chạm thuận tiện.
- Không sao chép nguyên giao diện desktop rồi thu nhỏ thành mobile.
- Không sử dụng emoji thay thế cho toàn bộ icon giao diện.
- Không tự ý sửa giao diện website hiện tại.

## 9. Giai đoạn 5 — Kết nối backend

Tạo các service riêng theo nghiệp vụ, chẳng hạn:

- `authService`
- `productService`
- `categoryService`
- `shopService`
- `cartService`
- `orderService`
- `userService`

Tên file và phương thức thực tế phải phù hợp với API đã audit.

Yêu cầu:

1. Sử dụng API hiện có khi phù hợp.
2. Không truy cập MongoDB trực tiếp từ app.
3. Không hardcode dữ liệu sản phẩm để thay thế API.
4. Không tự tạo endpoint rồi coi như backend đã hỗ trợ.
5. Nếu cần bổ sung endpoint, đánh giá ảnh hưởng đến website và các client khác trước.
6. Phân biệt lỗi kết nối, lỗi xác thực, lỗi phân quyền và lỗi validation.
7. Kiểm tra quyền truy cập ở backend; không dựa vào việc ẩn nút trên giao diện.
8. Không để chức năng lỗi âm thầm hoặc trả về dữ liệu giả khi API thất bại.

## 10. Những chức năng chưa làm trong giai đoạn này

Không triển khai các phần sau trừ khi được yêu cầu sau:

- Chatbot AI.
- Tích hợp `category_model.pkl`.
- Tích hợp OpenAI hoặc Gemini.
- Tính năng tư vấn PC bằng AI.
- Chuyển đổi toàn bộ website sang React Native.
- Viết lại backend hoặc thay MongoDB.
- Tạo hệ thống thanh toán mới không có trong phạm vi hiện tại.
- Xây dựng toàn bộ chức năng quản trị trên mobile ngay từ đầu.

Ưu tiên app khách hàng trước. Chức năng quản lý dành cho chủ shop và quản trị viên sẽ được đánh giá ở giai đoạn tiếp theo dựa trên API hiện có.

## 11. Giai đoạn 6 — Kiểm thử

Thực hiện các kiểm tra phù hợp với môi trường thực tế:

- Cài đặt dependencies.
- Chạy TypeScript checks.
- Chạy lint nếu dự án có cấu hình.
- Chạy Expo và kiểm tra lỗi khởi động.
- Kiểm tra điều hướng giữa các màn hình.
- Kiểm tra gọi API và xử lý lỗi.
- Kiểm tra đăng nhập, đăng xuất và phiên hết hạn nếu môi trường cho phép.
- Kiểm tra truy cập dữ liệu theo người dùng.
- Kiểm tra giỏ hàng và đặt hàng trên môi trường phù hợp.
- Kiểm tra giao diện trên Android emulator hoặc thiết bị thật nếu có thể.

Không được báo PASS chỉ vì ứng dụng biên dịch thành công.

Phân loại kết quả:

- `PASS`: Đã chạy và xác nhận đạt.
- `FAIL`: Đã kiểm tra và phát hiện lỗi.
- `BLOCKED`: Không thể kiểm tra vì thiếu môi trường, credentials hoặc dịch vụ.
- `NOT RUN`: Chưa thực hiện kiểm tra.
- `MISSING`: Chức năng hoặc API cần thiết chưa tồn tại.

Không tuyên bố đã kiểm thử trên thiết bị thật nếu chưa thực hiện.

## 12. Kết quả cần bàn giao

Sau khi hoàn thành, hãy cung cấp:

1. Cấu trúc mobile app đã tạo.
2. Danh sách file chính đã thêm hoặc sửa.
3. Danh sách chức năng đã triển khai.
4. Danh sách API đã tái sử dụng.
5. Danh sách API còn thiếu.
6. Các lệnh cài đặt và chạy ứng dụng.
7. Cách cấu hình địa chỉ backend khi chạy trên máy thật.
8. Kết quả kiểm thử thực tế.
9. Các lỗi còn tồn tại và mức độ ưu tiên.
10. Những phần cần người dùng cung cấp thêm thông tin.

Không chỉ trả về một bản kế hoạch hoặc các đoạn code rời rạc. Hãy thực hiện trực tiếp trên repository trong phạm vi được phép.

## 13. Tiêu chí hoàn thành

Ứng dụng được xem là có bản nền tảng tốt khi:

- Mobile app là dự án Expo độc lập.
- Website hiện tại không bị ảnh hưởng.
- App khởi động được trong môi trường đã cấu hình.
- Điều hướng và giao diện chính hoạt động.
- Các màn hình được kết nối với API thật khi API sẵn có.
- Không có dữ liệu giả mạo trạng thái kết nối thành công.
- Có xử lý loading, lỗi và dữ liệu rỗng.
- Các chức năng được báo cáo đúng theo bằng chứng kiểm thử.
- Không tích hợp AI trong giai đoạn này.

**Bắt đầu bằng việc audit repository hiện tại, sau đó triển khai từng giai đoạn theo thứ tự. Ưu tiên tính đúng đắn, khả năng bảo trì và bảo toàn các chức năng đang hoạt động hơn việc tạo thật nhiều màn hình nhanh chóng.**