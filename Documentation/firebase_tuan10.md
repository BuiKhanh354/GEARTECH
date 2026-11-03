# TÍCH HỢP FIREBASE STORAGE + FCM VÀO GEAR TECH

## 1. Vai trò và mục tiêu

Bạn là Senior Full-stack Developer chịu trách nhiệm tích hợp Firebase vào dự án thương mại điện tử Gear Tech hiện có.

Mục tiêu:
- Giữ MongoDB làm database chính.
- Tích hợp Firebase Storage để lưu ảnh.
- Tích hợp Firebase Cloud Messaging (FCM) để gửi thông báo đẩy trên trình duyệt.
- Xây dựng hộp thông báo bên trong website, lưu lịch sử thông báo trong MongoDB.
- Bảo toàn các chức năng hiện tại và kiểm thử thực tế sau khi thay đổi.

Công nghệ dự án theo thông tin hiện có:
- Frontend: React, TypeScript, Vite.
- Backend: Node.js, Express.
- Database: MongoDB.
- Ba vai trò: Admin, Chủ shop, Customer.

Đây là thông tin định hướng ban đầu. Phải xác minh công nghệ, cấu trúc thư mục, thư viện, cơ chế xác thực và schema thực tế từ source code trước khi quyết định triển khai.

## 2. Quy tắc bắt buộc trước khi sửa code

### Giai đoạn A — Audit dự án

Trước khi chỉnh sửa bất kỳ file nào:

1. Đọc cấu trúc thư mục frontend và backend.
2. Kiểm tra package.json, các lệnh chạy dự án, cấu hình môi trường và framework đang sử dụng.
3. Tìm hiểu cơ chế đăng nhập, đăng xuất, xác thực phiên/token và phân quyền Admin, Chủ shop, Customer.
4. Kiểm tra các middleware xác thực và phân quyền trên Express.
5. Kiểm tra model/schema, collection và các API liên quan đến:
   - Users và roles.
   - Shops và quy trình đăng ký/mở shop.
   - Products, categories, brands và product images.
   - Banners và cấu hình trang chủ.
   - Orders và trạng thái đơn hàng.
6. Xác định cách upload, lưu trữ, truy xuất và xóa hình ảnh hiện tại.
7. Kiểm tra giao diện header, menu thông báo nếu đã có, trang quản trị, trang shop và trang khách hàng.
8. Kiểm tra test hiện có, lint, build và các lỗi tồn tại trước khi thay đổi.
9. Tìm các thành phần có thể tái sử dụng; không tạo module trùng chức năng.
10. Xác định những chức năng cần giữ nguyên và những rủi ro có thể phát sinh.

Sau khi audit, tạo file gốc dự án `firebase_tichhop_kehoach.md`, bao gồm:
- Cấu trúc thực tế đã kiểm tra.
- Luồng upload ảnh hiện tại.
- Cơ chế xác thực và phân quyền hiện tại.
- Các file dự kiến cần sửa hoặc tạo, cùng lý do.
- Phương án tích hợp Firebase tương thích với code thực tế.
- Các điểm chưa xác định cần hỏi người phát triển.
- Kế hoạch kiểm thử trước và sau khi triển khai.

Không khẳng định đã kiểm tra file, chạy lệnh hoặc thử chức năng nếu chưa thực hiện.

Chỉ bắt đầu sửa code sau khi đã hoàn tất audit và có phương án triển khai rõ ràng. Nếu có rủi ro kiến trúc lớn hoặc cần thay đổi cơ chế xác thực, trình bày phương án trước khi thực hiện.

## 3. Quy tắc bảo toàn chức năng

- Không viết lại toàn bộ frontend hoặc backend.
- Không thay thế hệ thống đăng nhập hiện tại bằng Firebase Authentication.
- Không chuyển MongoDB sang Firestore.
- Không tự thay đổi schema hiện có nếu có thể mở rộng tương thích.
- Không xóa hoặc đổi tên API, route, collection, field, component hay chức năng đang hoạt động nếu không thực sự cần thiết.
- Không tạo dữ liệu mẫu, sản phẩm giả, đơn hàng giả, tài khoản giả hoặc thông báo giả để làm giao diện có vẻ hoạt động.
- Không hardcode thông tin người dùng, shop, sản phẩm hoặc người nhận thông báo.
- Không sửa Hero Banner của trang Customer hoặc những thành phần giao diện không liên quan.
- Tôn trọng quy ước đặt tên, cấu trúc thư mục, style và thư viện hiện tại.
- Không xóa chức năng cũ chỉ vì việc tích hợp Firebase thuận tiện hơn.
- Nếu cần migration, phải có kế hoạch tương thích dữ liệu cũ và phương án quay lui.

## 4. Tích hợp Firebase Storage

### 4.1. Phạm vi

Tích hợp upload và quản lý hình ảnh cho các chức năng thực sự tồn tại trong dự án, ưu tiên:
- Ảnh sản phẩm.
- Logo và ảnh đại diện shop.
- Ảnh danh mục.
- Banner trang chủ và hình ảnh khuyến mãi.

Không tạo thêm màn hình hoặc loại nội dung không cần thiết chỉ để minh họa tích hợp.

### 4.2. Luồng upload mong muốn

Luồng tổng quát:

1. Người dùng chọn ảnh trong giao diện React.
2. Frontend kiểm tra định dạng, kích thước và hiển thị trạng thái upload.
3. Frontend tải ảnh trực tiếp lên Firebase Storage.
4. Firebase Storage Rules kiểm soát quyền ghi trước khi chấp nhận file.
5. Sau khi upload thành công, frontend gửi thông tin tham chiếu ảnh lên API Express.
6. Express xác minh người dùng, vai trò, quyền sở hữu shop/sản phẩm và quyền sửa nội dung tương ứng.
7. Express kiểm tra đường dẫn Storage và các metadata cần thiết.
8. Express lưu URL, storagePath và thông tin cần thiết vào MongoDB.
9. Frontend cập nhật giao diện từ dữ liệu do backend trả về.

Không cho phép client tự quyết định một URL ảnh bất kỳ rồi gắn vào sản phẩm mà không có kiểm tra.

### 4.3. Yêu cầu bảo mật quan trọng

Trước tiên, xác minh hệ thống đăng nhập hiện tại có sử dụng Firebase Authentication hay không.

Nếu Gear Tech dùng hệ thống xác thực riêng của Express:
- Không giả định Firebase Storage Rules có thể tự xác minh JWT hoặc session riêng của Gear Tech.
- Không đặt Storage Rules cho phép mọi người upload tùy ý.
- Không đưa service-account key hoặc Firebase Admin credentials vào frontend.
- Đề xuất cơ chế tích hợp an toàn tương thích với hệ thống hiện tại.

Ưu tiên xem xét việc backend cấp Firebase custom token cho người dùng đã được xác thực, ánh xạ UID và custom claims tối thiểu cần thiết, để Firebase Storage Rules kiểm tra danh tính và quyền upload. Đây chỉ là cầu nối danh tính cho Storage, không phải thay thế toàn bộ đăng nhập Gear Tech.

Nếu chọn phương án khác, phải giải thích cách nó bảo vệ trực tiếp luồng upload và vì sao phù hợp hơn với code hiện tại.

Storage Rules phải:
- Chỉ cho phép đúng nhóm người dùng upload vào đúng đường dẫn được phép.
- Không cho Customer tự ý ghi ảnh sản phẩm hoặc banner quản trị.
- Không cho Chủ shop sửa tài nguyên của shop khác.
- Hạn chế định dạng và kích thước file.
- Không tin role, shopId hoặc đường dẫn do client tự khai báo nếu chưa được xác minh.
- Xử lý quyền đọc theo yêu cầu thực tế; không mặc định tất cả file đều cần public.
- Có quy trình xử lý file upload thành công nhưng lưu MongoDB thất bại, tránh tạo file mồ côi không được quản lý.

Express tiếp tục là nơi xác minh quyền nghiệp vụ trước khi cập nhật dữ liệu MongoDB.

### 4.4. Dữ liệu MongoDB

Tận dụng schema hiện có. Nếu cần mở rộng, ưu tiên các trường tham chiếu phù hợp như:
- imageUrl hoặc URL tương đương.
- storagePath.
- uploadedBy hoặc metadata tương đương nếu thực sự cần.
- createdAt/updatedAt theo quy ước dự án.

Không lưu binary ảnh vào MongoDB chỉ để phục vụ chức năng này.

Phải có cách xử lý thay thế hoặc giữ nguyên khả năng đọc ảnh cũ nếu trước đây ảnh được lưu tại local uploads, một dịch vụ khác hoặc URL cũ.

Không xóa ảnh cũ ngay sau khi đổi URL. Chỉ xóa khi xác định ảnh không còn được tham chiếu và có quyền xóa hợp lệ.

## 5. Tích hợp FCM — thông báo đẩy trình duyệt

### 5.1. Frontend

- Tạo module Firebase client dùng chung, phù hợp với cấu trúc hiện tại.
- Cấu hình Firebase Web SDK bằng biến môi trường frontend theo quy ước Vite.
- Không đưa Firebase Admin credentials vào bundle frontend.
- Kiểm tra khả năng hỗ trợ của trình duyệt và quyền Notification.
- Chỉ xin quyền thông báo sau khi người dùng thực hiện hành động phù hợp, không tự bật popup ngay khi vừa truy cập website.
- Đăng ký service worker và cấu hình FCM Web Push đúng tài liệu Firebase.
- Xử lý nhận thông báo khi trang đang mở và khi thông báo được bấm để mở trang liên quan.
- Có giao diện thể hiện trạng thái chưa đăng ký, đã đăng ký, bị từ chối hoặc gặp lỗi.
- Nếu người dùng từ chối quyền trình duyệt, các chức năng còn lại của website vẫn hoạt động bình thường.

Không hiển thị thông báo giả để thay thế FCM thực tế.

### 5.2. Backend

Sử dụng Firebase Admin SDK ở Express để gửi thông báo từ backend khi sự kiện nghiệp vụ thực sự thành công.

- Xác minh người thực hiện và quyền của họ.
- Xác định người nhận từ dữ liệu MongoDB đáng tin cậy.
- Không cho frontend tùy ý chỉ định người nhận để gửi thông báo.
- Không gửi thông báo trước khi thao tác nghiệp vụ được lưu thành công.
- Xử lý token FCM hết hạn, không hợp lệ hoặc gửi thất bại.
- Không làm một lỗi gửi thông báo khiến giao dịch tạo đơn hàng, cập nhật trạng thái đơn hàng hoặc duyệt shop thất bại ngoài ý muốn.
- Có cơ chế hạn chế gửi trùng, phù hợp với kiến trúc hiện tại.
- Không ghi token nhạy cảm hoặc credentials vào log.

Xác định phương án lưu token thiết bị/trình duyệt phù hợp với schema hiện có. Một người dùng có thể có nhiều trình duyệt hoặc thiết bị; cần xử lý đăng ký mới, cập nhật token và hủy đăng ký.

## 6. Hộp thông báo bên trong website

Lưu thông báo nghiệp vụ trong MongoDB. FCM chỉ là kênh gửi thông báo đẩy, không phải nơi lưu lịch sử thông báo duy nhất.

Kiểm tra xem dự án đã có collection hoặc API thông báo chưa. Nếu chưa, thiết kế bổ sung tối thiểu và tương thích với quy ước hiện tại.

Mỗi thông báo nên có dữ liệu phù hợp như:
- Người nhận.
- Loại thông báo.
- Tiêu đề và nội dung.
- Tham chiếu đến đơn hàng, shop hoặc tài nguyên liên quan khi cần.
- Thời điểm tạo.
- Trạng thái đã đọc/chưa đọc.
- Khóa hoặc thông tin phục vụ chống tạo trùng nếu cần.

Tạo hoặc mở rộng API để:
- Lấy danh sách thông báo của người đang đăng nhập.
- Phân trang nếu cần.
- Lấy số thông báo chưa đọc.
- Đánh dấu một thông báo đã đọc.
- Đánh dấu tất cả đã đọc nếu phù hợp.
- Chỉ cho phép người dùng đọc hoặc cập nhật thông báo thuộc quyền của mình.

Frontend hiển thị hộp thông báo phù hợp với thiết kế hiện tại, ưu tiên tái sử dụng header/menu có sẵn. Nếu dự án đã có UI thông báo, hãy mở rộng thay vì tạo một hệ thống thứ hai.

Không bắt buộc xây dựng WebSocket hoặc realtime database chỉ để hiển thị hộp thông báo. Trước tiên chọn cách cập nhật phù hợp với kiến trúc hiện có; có thể dùng refetch/polling hợp lý nếu chưa có cơ chế realtime.

## 7. Quy tắc thông báo theo ba vai trò

Chỉ triển khai sự kiện phù hợp với các trạng thái nghiệp vụ đã tồn tại trong source code.

### Admin
Có thể nhận thông báo khi có yêu cầu mở shop mới hoặc sự kiện quản trị quan trọng nếu hệ thống có các sự kiện này.

### Chủ shop
Có thể nhận thông báo về đơn hàng mới, thay đổi trạng thái đơn hàng hoặc sự kiện liên quan đến shop mà họ có quyền quản lý.

### Customer
Có thể nhận thông báo về trạng thái đơn hàng của chính họ và các thông báo khác mà họ đã đăng ký nhận.

Quy tắc:
- Không tự sáng tạo trạng thái đơn hàng mới.
- Không gửi thông tin đơn hàng hoặc dữ liệu riêng tư cho người không có quyền.
- Không gửi thông báo quảng cáo nếu chưa có luồng nghiệp vụ hoặc cấu hình cho phép.
- Không hardcode một userId làm người nhận.
- Không giả định mọi Customer đều muốn nhận thông báo đẩy.
- Lịch sử thông báo trong website phải hoạt động độc lập với quyền nhận thông báo của trình duyệt.

## 8. Firebase configuration và môi trường

Hướng dẫn tạo và cấu hình Firebase project, bật Storage và FCM, cấu hình Web App và VAPID key nếu cần.

Kiểm tra các biến môi trường theo cấu trúc thực tế. Không tự đặt tên biến trùng hoặc thay thế biến đang được dùng nếu không cần thiết.

Tách biệt:
- Cấu hình Firebase Web SDK an toàn để frontend sử dụng.
- Bí mật Firebase Admin SDK chỉ dành cho backend.
- Cấu hình môi trường development và production.
- Danh sách domain/HTTPS và service worker cần thiết cho môi trường chạy thực tế.

Không commit `.env`, service-account JSON, private key hoặc secrets vào Git.

Nếu thiếu Firebase project, credentials, VAPID key hoặc quyền truy cập cần thiết, ghi rõ chính xác thông tin người phát triển phải cung cấp. Không tự bịa giá trị và không tuyên bố kết nối thành công khi chưa có thông tin xác thực.

## 9. Quy trình thực hiện

Chia triển khai thành các giai đoạn có thể kiểm thử độc lập:

### Giai đoạn 1 — Audit và kế hoạch
Hoàn tất `firebase_tichhop_kehoach.md`, xác định file và rủi ro trước khi sửa.

### Giai đoạn 2 — Storage
Tích hợp Firebase client, luồng upload, Storage Rules, API lưu metadata và khả năng tương thích với ảnh cũ.

### Giai đoạn 3 — Hộp thông báo MongoDB
Xây dựng hoặc mở rộng API, dữ liệu thông báo và UI danh sách thông báo/chưa đọc.

### Giai đoạn 4 — FCM
Cấu hình service worker, đăng ký token, gửi thông báo qua Express và kết nối các sự kiện nghiệp vụ đã xác minh.

### Giai đoạn 5 — Kiểm thử và hoàn thiện
Chạy các bài kiểm thử, xử lý lỗi, kiểm tra hồi quy, cập nhật tài liệu và báo cáo những phần còn phụ thuộc cấu hình Firebase.

Sau mỗi giai đoạn:
- Tóm tắt file đã thêm/sửa.
- Nêu lý do thay đổi.
- Chạy các kiểm thử phù hợp.
- Xử lý lỗi phát sinh trước khi chuyển giai đoạn.
- Không đánh dấu hoàn thành nếu chưa xác minh.

## 10. Kiểm thử bắt buộc

Tạo hoặc cập nhật test dựa trên framework hiện có. Không tự đưa framework mới vào nếu không cần thiết.

### Storage
1. Admin tải ảnh banner/danh mục nếu các chức năng đó tồn tại.
2. Chủ shop tải ảnh sản phẩm của shop mình.
3. Chủ shop không thể ghi hoặc thay thế ảnh thuộc shop khác.
4. Customer không thể upload ảnh quản trị/sản phẩm nếu không được phép.
5. File sai định dạng hoặc vượt giới hạn bị từ chối.
6. Người chưa xác thực không thể upload trái phép.
7. Upload thất bại không làm MongoDB lưu URL không hợp lệ.
8. Upload thành công nhưng API lưu MongoDB thất bại được xử lý rõ ràng.
9. Ảnh cũ và chức năng hiển thị ảnh vẫn hoạt động.

### Hộp thông báo
1. Người dùng chỉ xem được thông báo thuộc quyền của mình.
2. Đánh dấu đã đọc cập nhật đúng dữ liệu.
3. Số lượng chưa đọc khớp với MongoDB.
4. Không lộ thông tin riêng tư của đơn hàng/shop.
5. Không tạo thông báo trùng cho cùng một sự kiện khi retry trong các tình huống đã xác định.

### FCM
1. Trình duyệt hỗ trợ và người dùng đồng ý cấp quyền.
2. Trình duyệt không hỗ trợ hoặc người dùng từ chối quyền.
3. Token được đăng ký, cập nhật và hủy đăng ký.
4. Thông báo được gửi đúng người nhận cho sự kiện đã cấu hình.
5. Token không hợp lệ được xử lý.
6. Lỗi FCM không làm hỏng thao tác nghiệp vụ đã thành công.
7. Nhấp thông báo mở đúng trang nếu có điều hướng được hỗ trợ.

### Hồi quy
1. Đăng nhập/đăng xuất và phân quyền cũ.
2. Đăng ký yêu cầu mở shop và luồng Admin duyệt shop.
3. CRUD sản phẩm và danh mục.
4. Trang chủ, banner và hiển thị ảnh.
5. Giỏ hàng, checkout và đơn hàng.
6. Các API cũ không liên quan đến Firebase.
7. Build frontend, kiểm tra TypeScript, lint và test backend theo các lệnh thực tế của dự án.

Phải phân biệt:
- PASS: đã thực thi và thành công.
- FAIL: đã thực thi và thất bại.
- BLOCKED: chưa thực hiện được vì thiếu cấu hình, credentials, dịch vụ hoặc môi trường.
- NOT RUN: chưa chạy.

Không được đánh dấu PASS chỉ vì đã viết code hoặc test.
Không dùng mock data để báo cáo một luồng Firebase thật đã hoạt động.
Nếu dùng mock/stub trong unit test, phải ghi rõ đó là kiểm thử mô phỏng, không phải tích hợp Firebase thực tế.

## 11. Tài liệu bàn giao

Tạo hoặc cập nhật file gốc dự án `firebase_tichhop_huongdan.md`, bao gồm:

1. Kiến trúc sau tích hợp.
2. Danh sách file đã tạo và chỉnh sửa.
3. Hướng dẫn cấu hình Firebase Web App, Storage, FCM và VAPID key.
4. Hướng dẫn cấu hình biến môi trường backend/frontend.
5. Cách chạy dự án.
6. Luồng upload ảnh.
7. Luồng đăng ký nhận thông báo và gửi thông báo.
8. Cấu trúc dữ liệu MongoDB đã thêm hoặc thay đổi.
9. Quy tắc bảo mật và phân quyền.
10. Danh sách API mới hoặc đã chỉnh sửa.
11. Hướng dẫn kiểm thử thủ công cho Admin, Chủ shop và Customer.
12. Các lệnh test đã chạy và kết quả thực tế.
13. Các bước còn phải làm thủ công trên Firebase Console.
14. Các lỗi, giới hạn và việc chưa hoàn thành.

Cập nhật tài liệu kế hoạch để phản ánh đúng những gì thực sự đã triển khai, không để nội dung dự kiến bị hiểu nhầm là đã hoàn tất.

## 12. Báo cáo cuối cùng

Khi kết thúc, báo cáo theo cấu trúc:

- Tóm tắt kết quả.
- Các thay đổi theo từng giai đoạn.
- Danh sách file đã thêm/sửa.
- Các thay đổi schema/API.
- Kết quả kiểm thử thực tế, ghi rõ PASS/FAIL/BLOCKED/NOT RUN.
- Những chức năng cũ đã được kiểm tra hồi quy.
- Cấu hình hoặc thao tác người phát triển còn phải thực hiện.
- Vấn đề bảo mật hoặc rủi ro còn tồn tại.
- Những việc chưa hoàn thành.

Không tuyên bố toàn bộ dự án đã hoạt động nếu chưa có Firebase credentials và chưa kiểm thử end-to-end.

**Nguyên tắc cuối cùng:** ưu tiên tính tương thích, bảo mật, khả năng bảo trì và dữ liệu thực tế. Đọc code trước, hiểu luồng nghiệp vụ trước, rồi mới sửa code. Không thay đổi những phần không liên quan chỉ để làm cho kiến trúc trông mới hơn.