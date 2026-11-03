# NHIỆM VỤ: TRIỂN KHAI CHỨC NĂNG GIAO HÀNG GHN CHO GEAR TECH

## 1. Vai trò

Bạn là Senior Backend Engineer và Full-stack Developer, có kinh nghiệm với React/React Native, Node.js, Express, MongoDB và tích hợp GHN Shipping API.

Tôi muốn triển khai chức năng giao hàng cho sàn thương mại điện tử Gear Tech. Chủ shop là người quản lý vận chuyển đối với đơn hàng thuộc shop mình. Hệ thống cần có chức năng giao hàng nội bộ và tích hợp GHN thực tế.

Đây là dự án hiện có. Bạn phải kiểm tra và làm việc trên source hiện tại, không xây lại hệ thống từ đầu.

## 2. Nguyên tắc bắt buộc: Audit trước khi sửa

Trước khi chỉnh sửa bất kỳ file nào:

1. Kiểm tra cấu trúc repository.
2. Đọc package.json và các cấu hình liên quan.
3. Kiểm tra các route, controller, service, middleware và model/schema MongoDB hiện có.
4. Xác định cách đăng nhập, xác thực token và phân quyền Guest, Customer, Shop Owner và Admin.
5. Kiểm tra luồng đặt hàng, giỏ hàng, thanh toán và quản lý đơn hàng.
6. Kiểm tra cấu trúc Order, Order Item, Shop và các trường địa chỉ giao hàng.
7. Tìm các API liên quan đến phí vận chuyển, địa chỉ, trạng thái đơn hàng và giao hàng nếu đã tồn tại.
8. Kiểm tra dự án có đang sử dụng GHN hoặc dịch vụ vận chuyển khác không.
9. Xác định các chức năng có thể tái sử dụng và những phần thực sự còn thiếu.

Sau khi audit, lập bảng gồm:

- Chức năng hiện có.
- API và schema hiện có.
- Chức năng còn thiếu.
- File dự kiến cần sửa hoặc tạo.
- Rủi ro tương thích.
- Kế hoạch triển khai theo thứ tự ưu tiên.

Sau đó tiếp tục triển khai nếu đủ thông tin và môi trường. Không tự giả định endpoint hoặc schema khi chưa kiểm tra source.

## 3. Kiến trúc nghiệp vụ

Giữ nguyên website, mobile app, backend và MongoDB hiện tại.

Backend Express là nơi xử lý toàn bộ logic giao hàng và tích hợp GHN. Frontend chỉ gọi API của Gear Tech, không gọi GHN trực tiếp bằng thông tin xác thực.

Phân biệt rõ:

- Trạng thái xử lý đơn hàng của Gear Tech.
- Trạng thái vận chuyển của GHN.
- Trạng thái thanh toán.
- Trạng thái hoàn tiền nếu có.

Không gộp các trạng thái trên thành một trường duy nhất nếu điều đó làm mất ý nghĩa nghiệp vụ hiện tại.

### Mô hình đa shop

Gear Tech là marketplace nhiều shop. Kiểm tra xem một đơn hàng hiện tại có chứa sản phẩm của nhiều shop hay không.

Nếu một đơn hàng có nhiều shop, thiết kế vận chuyển theo từng đơn hàng con/shop hoặc cấu trúc tương đương phù hợp với schema hiện tại. Mỗi vận đơn phải xác định được:

- Đơn hàng Gear Tech liên quan.
- Shop chịu trách nhiệm gửi hàng.
- Danh sách sản phẩm và số lượng thuộc shop đó.
- Mã vận đơn GHN.
- Phí vận chuyển.
- Trạng thái giao hàng.
- Địa chỉ nhận hàng.
- Lịch sử cập nhật.

Không tạo một vận đơn duy nhất chứa hàng của nhiều địa chỉ lấy hàng khác nhau nếu nghiệp vụ thực tế không hỗ trợ.

Nếu đơn hàng hiện tại đã được tách theo shop, ưu tiên tái sử dụng cấu trúc đó thay vì tạo thêm một hệ thống đơn hàng song song.

## 4. Tích hợp GHN API

Đọc tài liệu chính thức hiện hành tại:

https://developer.ghn.vn/en/docs

Ưu tiên kiểm tra các API:

- Tính phí vận chuyển.
- Danh mục tỉnh/thành, phường/xã và mã địa chỉ.
- Dịch vụ vận chuyển được hỗ trợ.
- Tạo đơn giao hàng.
- Lấy thông tin và trạng thái đơn.
- Hủy hoặc cập nhật đơn theo điều kiện GHN cho phép.
- Webhook cập nhật trạng thái vận chuyển.

Không hardcode dữ liệu địa chỉ hoặc trạng thái nếu GHN cung cấp API tương ứng.

### Cấu hình môi trường

Tạo cấu hình môi trường phù hợp, ví dụ:

- `GHN_BASE_URL`
- `GHN_TOKEN`
- `GHN_SHOP_ID`
- Các biến bổ sung nếu kiến trúc thực tế cần thiết.

Các tên trên là gợi ý, cần điều chỉnh theo cấu trúc cấu hình hiện tại.

Ưu tiên môi trường staging/test trước production. Không ghi token, thông tin xác thực hoặc dữ liệu cá nhân vào log.

Nếu mỗi shop dùng tài khoản GHN riêng, cần thiết kế cách liên kết thông tin xác thực với shop một cách an toàn. Nếu dùng tài khoản GHN tập trung, phải kiểm tra địa chỉ lấy hàng và quyền tạo đơn cho từng shop. Không tự giả định một trong hai mô hình khi chưa xác nhận.

Không lưu secret trong frontend, mobile app, Git hoặc file cấu hình được public.

### Tính phí vận chuyển

Xây dựng luồng tính phí dựa trên:

- Địa chỉ lấy hàng.
- Địa chỉ nhận hàng.
- Mã địa chỉ GHN hợp lệ.
- Cân nặng và kích thước kiện hàng.
- Dịch vụ vận chuyển phù hợp.
- Giá trị khai giá và COD khi cần.

Xác minh dữ liệu từ database và phản hồi GHN ở backend. Không tin tưởng phí vận chuyển do frontend tự gửi lên.

Lưu lại mức phí được GHN trả về tại thời điểm thích hợp để có thể đối chiếu với phí thực tế sau này.

Không tự cộng phí vào tổng tiền đơn hàng nhiều lần khi khách tính lại phí hoặc tải lại trang.

### Tạo vận đơn

Chỉ tạo vận đơn khi:

- Đơn hàng tồn tại.
- Shop hiện tại có quyền quản lý đơn đó.
- Trạng thái đơn hàng cho phép giao.
- Địa chỉ nhận và thông tin kiện hàng hợp lệ.
- Thông tin phí và thanh toán đã được xác minh.
- Đơn chưa có vận đơn đang hoạt động trùng lặp.

Khi GHN tạo đơn thành công, lưu mã vận đơn, phí trả về, thời gian dự kiến giao nếu có và các thông tin cần thiết khác.

Nếu GHN lỗi hoặc timeout, không tự đánh dấu giao hàng thành công. Thiết kế xử lý retry an toàn và kiểm tra trạng thái trước khi gửi lại yêu cầu có thể tạo vận đơn trùng.

Không tự đặt trạng thái đã lấy hàng hoặc đang giao chỉ vì API tạo vận đơn thành công.

## 5. Webhook GHN

Tạo hoặc mở rộng endpoint webhook phù hợp với kiến trúc backend hiện tại.

Yêu cầu:

- Kiểm tra cơ chế xác thực webhook theo tài liệu GHN hiện hành.
- Xác định vận đơn và đơn hàng tương ứng.
- Xác thực dữ liệu đầu vào.
- Chỉ cập nhật các trường trạng thái vận chuyển hợp lệ.
- Xử lý callback lặp lại một cách idempotent.
- Tránh cập nhật trạng thái cũ đè lên trạng thái mới hơn.
- Lưu lịch sử sự kiện cần thiết để phục vụ đối soát.
- Không làm hỏng dữ liệu đơn hàng nếu payload không hợp lệ.
- Trả response đúng yêu cầu của GHN.
- Ghi log có kiểm soát, không ghi thông tin nhạy cảm.

Nếu webhook chưa thể kiểm tra do chưa có tài khoản hoặc môi trường GHN, đánh dấu BLOCKED và nêu rõ nguyên nhân. Không giả lập kết quả thành kiểm thử tích hợp thành công.

## 6. Thiết kế API nội bộ

Trước hết kiểm tra API hiện có. Chỉ tạo endpoint mới khi thực sự thiếu.

Các nhóm endpoint dự kiến:

- Lấy phí vận chuyển.
- Lấy danh mục địa chỉ vận chuyển.
- Lấy dịch vụ GHN khả dụng.
- Tạo vận đơn cho đơn hàng.
- Lấy chi tiết vận chuyển.
- Lấy lịch sử trạng thái.
- Hủy vận đơn nếu GHN cho phép.
- Webhook nhận trạng thái từ GHN.

Tên và URL endpoint phải phù hợp với quy ước dự án hiện tại. Không tạo endpoint trùng chức năng.

Tất cả endpoint quản lý vận đơn phải xác thực người dùng và phân quyền ở backend.

## 7. Giao diện chủ shop

Kiểm tra màn hình quản lý đơn hàng hiện có rồi tích hợp chức năng vận chuyển vào đó.

Chủ shop cần có khả năng:

- Xem các đơn thuộc shop mình.
- Xem thông tin người nhận và địa chỉ giao hàng theo quyền được cấp.
- Xem phí vận chuyển.
- Tạo vận đơn GHN.
- Xem mã vận đơn.
- Xem trạng thái giao hàng.
- Xem thời gian giao dự kiến nếu GHN cung cấp.
- Xem lịch sử cập nhật.
- Hủy vận đơn khi đủ điều kiện.
- Xử lý lỗi tạo vận đơn và thử lại an toàn.

Không cho chủ shop xem hoặc thao tác vận đơn thuộc shop khác bằng cách thay ID trong request.

Không hiển thị nút thao tác nếu trạng thái nghiệp vụ không cho phép, nhưng vẫn phải kiểm tra quyền ở backend.

## 8. Giao diện khách hàng

Tích hợp vào màn hình chi tiết đơn hàng hiện có.

Khách hàng có thể:

- Xem địa chỉ nhận hàng.
- Xem phí vận chuyển đã được ghi nhận.
- Xem mã vận đơn.
- Xem trạng thái giao hàng.
- Xem lịch sử vận chuyển phù hợp.
- Xem thông tin dự kiến giao nếu có.

Khách hàng chỉ được xem đơn hàng của chính mình.

Không hiển thị dữ liệu nội bộ của shop, token GHN hoặc thông tin vận chuyển nhạy cảm.

## 9. Cập nhật tổng tiền và thanh toán

Kiểm tra cách hệ thống hiện tại tính subtotal, discount, shipping fee và grand total.

Đảm bảo phí vận chuyển được tính đúng một lần và không bị sửa từ client để giảm số tiền thanh toán.

Không thay đổi cơ chế thanh toán hiện có ngoài phạm vi cần thiết.

Nếu có COD, xác định rõ số tiền GHN thu hộ, số tiền khách cần trả và trách nhiệm đối soát. Không tự coi phí vận chuyển là doanh thu của Gear Tech hoặc doanh thu của shop nếu chưa có quy tắc nghiệp vụ tương ứng.

## 10. Bảo mật và độ tin cậy

Bắt buộc kiểm tra:

- Shop A không thể tạo hoặc xem vận đơn của Shop B.
- Customer A không thể xem đơn hàng của Customer B.
- Không thể tạo vận đơn cho đơn hàng chưa đủ điều kiện.
- Không thể tạo nhiều vận đơn ngoài ý muốn do bấm nút nhiều lần.
- Không thể thay đổi phí vận chuyển từ client.
- Không để lộ GHN token.
- Không để webhook cập nhật tùy tiện các trường thanh toán hoặc quyền sở hữu đơn hàng.
- Không để lỗi GHN làm sập API đặt hàng hoặc làm mất dữ liệu đơn hàng đã lưu.
- Không tạo đơn vận chuyển thật ngoài ý muốn trong lúc phát triển.

Sử dụng staging trong giai đoạn phát triển và chỉ chuyển production khi có xác nhận rõ ràng.

## 11. Kiểm thử

Thực hiện kiểm thử phù hợp với môi trường:

1. Tính phí với địa chỉ hợp lệ.
2. Tính phí với địa chỉ không hợp lệ.
3. Tạo vận đơn thành công trên staging.
4. GHN trả lỗi khi tạo vận đơn.
5. Request timeout hoặc mất kết nối.
6. Bấm tạo vận đơn nhiều lần.
7. Chủ shop truy cập đơn của shop khác.
8. Khách hàng xem đơn của người khác.
9. Webhook hợp lệ.
10. Webhook lặp lại.
11. Webhook có payload không hợp lệ.
12. Hủy vận đơn khi đủ điều kiện.
13. Kiểm tra phí ship và tổng tiền đơn hàng.
14. Kiểm tra các luồng đặt hàng, thanh toán và quản lý đơn hiện tại không bị hỏng.

Phân loại kết quả:

- PASS: đã kiểm thử và có bằng chứng.
- FAIL: đã kiểm thử và phát hiện lỗi.
- BLOCKED: thiếu tài khoản, credentials hoặc môi trường.
- NOT RUN: chưa thực hiện.
- MISSING: chức năng cần thiết chưa tồn tại.

Không tuyên bố tích hợp GHN thành công nếu chỉ mới viết code mà chưa có kiểm thử phù hợp.

## 12. Kết quả bàn giao

Cung cấp:

- Tóm tắt audit ban đầu.
- Kiến trúc giao hàng sau khi triển khai.
- Danh sách file đã thêm hoặc sửa.
- API đã tái sử dụng và API mới.
- Schema hoặc migration đã thay đổi.
- Các biến môi trường cần cấu hình.
- Hướng dẫn chạy thử trên GHN staging.
- Kết quả kiểm thử và bằng chứng.
- Các lỗi còn tồn tại.
- Các bước cần hoàn thành trước khi bật production.

Bảo toàn chức năng cũ, tránh thay đổi ngoài phạm vi và không tạo dữ liệu giả để che giấu chức năng chưa hoạt động.

**Bắt đầu bằng audit source hiện tại, sau đó triển khai theo từng giai đoạn nhỏ, kiểm thử từng phần và chỉ chuyển sang giai đoạn tiếp theo khi các kiểm tra phù hợp đã đạt.**