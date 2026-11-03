# GEAR TECH --- KẾ HOẠCH KIỂM THỬ WEBSITE THƯƠNG MẠI ĐIỆN TỬ

**Mục đích:** Giao cho coding agent kiểm tra website Gear Tech hiện tại,
chạy thử các luồng thực tế, xác định chức năng đã có, bị lỗi hoặc còn
thiếu, đồng thời kiểm tra quyền của từng tác nhân.

> **Nguyên tắc:** Đây là kế hoạch kiểm thử, không phải bằng chứng rằng
> chức năng đã được triển khai. Agent phải đọc source code và chạy thử
> trước khi kết luận. Không đánh dấu PASS chỉ vì thấy nút/trang giao
> diện. Không dùng dữ liệu giả để làm test có vẻ thành công. Nếu thiếu
> cấu hình/API/tài khoản dịch vụ, ghi BLOCKED hoặc NOT RUN.

## 1. Trạng thái và cách kiểm thử

-   **PASS:** Đã chạy và có bằng chứng kết quả đúng.
-   **FAIL:** Đã chạy nhưng kết quả sai, lỗi hoặc vi phạm yêu cầu.
-   **BLOCKED:** Không chạy được do thiếu cấu hình, API key, tài khoản
    hoặc môi trường.
-   **NOT RUN:** Chưa chạy; không được coi là đạt.
-   **MISSING:** Sau khi kiểm tra source/UI/API, xác nhận chức năng chưa
    được triển khai. Đây là trạng thái kiểm kê, không phải kết quả test.

Mỗi test cần có mã, điều kiện đầu vào, bước chạy, kết quả mong đợi, kết
quả thực tế, trạng thái, bằng chứng (log, ảnh, API response, DB record)
và ghi chú.

### Trình tự bắt buộc cho agent

1.  Kiểm tra `package.json`, README, cấu trúc React/Express, router,
    middleware, schema/model MongoDB, authentication/authorization, sản
    phẩm, giỏ hàng, đơn hàng, upload, thông báo và test hiện có.
2.  Khởi động dự án theo hướng dẫn hiện có; ghi lại lệnh và lỗi.
3.  Đối chiếu checklist; kiểm tra cả UI, API/backend và database/dịch vụ
    ngoài.
4.  Chỉ test trên môi trường development/test với dữ liệu thử riêng;
    không phá dữ liệu thật.
5.  Phân biệt **Missing** với **Unverified**. Có nút không có nghĩa chức
    năng hoạt động.
6.  Báo cáo trước khi thực hiện sửa đổi lớn. Không tự ý đổi kiến trúc,
    cơ chế đăng nhập hoặc xóa dữ liệu.
7.  Giữ nguyên Hero Banner trang chủ Customer hiện tại (ảnh/video/nội
    dung/CTA/slide/kích thước/bố cục/hiệu ứng/tài nguyên/CSS), trừ khi
    được cho phép rõ ràng.

## 2. Các tác nhân của hệ thống

  -----------------------------------------------------------------------
  Tác nhân                            Chức năng và giới hạn quyền
  ----------------------------------- -----------------------------------
  **Khách vãng lai (Guest)**          Xem trang chủ, danh mục, sản phẩm,
                                      shop công khai; tìm kiếm/lọc; đăng
                                      ký/đăng nhập. Không được xem dữ
                                      liệu cá nhân hoặc chức năng riêng
                                      tư.

  **Khách hàng (Customer)**           Quản lý hồ sơ của mình, giỏ hàng,
                                      đặt hàng, theo dõi đơn của mình,
                                      đánh giá khi đủ điều kiện, yêu
                                      thích/theo dõi shop nếu có. Không
                                      được truy cập dữ liệu người khác.

  **Chủ shop (Shop Owner/Seller)**    Gửi yêu cầu mở shop và chờ Admin
                                      duyệt; sau khi được duyệt mới quản
                                      lý shop, sản phẩm, tồn kho, đơn
                                      hàng, khuyến mãi và báo cáo trong
                                      phạm vi shop mình. Không được thao
                                      tác shop khác.

  **Quản trị viên (Admin)**           Quản lý tài khoản, duyệt/từ chối
                                      shop, danh mục, thương hiệu, giám
                                      sát sản phẩm/đơn hàng, quản lý nội
                                      dung trang chủ và xem báo cáo theo
                                      quyền được thiết kế.

  **Dịch vụ vận chuyển (ví dụ GHN)**  Tác nhân hệ thống ngoài; chỉ tính
                                      là tích hợp nếu có API/config thật
                                      và đã kiểm thử.

  **Cổng thanh toán**                 Chỉ kiểm thử nếu thực sự tích hợp;
                                      kiểm tra giao dịch,
                                      callback/webhook, thất bại và xử lý
                                      lặp. Không mặc định dự án có thanh
                                      toán online.

  **Firebase Storage**                Dịch vụ lưu ảnh nếu tích hợp; kiểm
                                      tra upload thật, quyền truy cập và
                                      URL/path lưu trong MongoDB.

  **Firebase Cloud Messaging (FCM)**  Dịch vụ push notification nếu tích
                                      hợp; kiểm tra token, quyền trình
                                      duyệt, service worker và nhận thông
                                      báo thật.

  **Nhân viên CSKH/đối tác khác (tùy  Chỉ thêm nếu có nghiệp vụ thực tế;
  phạm vi)**                          quyền phải giới hạn, không mặc định
                                      có quyền Admin.
  -----------------------------------------------------------------------

**Lưu ý:** Guest, Customer, Shop Owner và Admin là các tác nhân người
dùng cốt lõi. GHN, cổng thanh toán và Firebase là dịch vụ ngoài, không
phải vai trò người dùng nội bộ.

## 3. Checklist theo tác nhân

### 3.1 Guest

-   [ ] Trang chủ, danh mục, chi tiết sản phẩm và trang shop công khai
    tải được.
-   [ ] Tìm kiếm theo từ khóa; lọc danh mục/thương hiệu/khoảng giá nếu
    có.
-   [ ] Sắp xếp và phân trang hoạt động đúng theo tiêu chí thực tế được
    hỗ trợ.
-   [ ] Tên, ảnh, giá, mô tả, tồn kho và thông tin shop hiển thị khớp dữ
    liệu thật.
-   [ ] Guest không truy cập trang tài khoản, đơn hàng, quản trị hoặc
    API riêng tư.
-   [ ] Đăng ký kiểm tra trường bắt buộc, email trùng/sai định dạng và
    mật khẩu.
-   [ ] Đăng nhập/đăng xuất hoạt động; mật khẩu không lưu dạng rõ.

### 3.2 Customer

-   [ ] Xem/cập nhật hồ sơ của chính mình; không đọc/sửa hồ sơ người
    khác bằng cách đổi ID.
-   [ ] Thêm/sửa/xóa sản phẩm trong giỏ; số lượng và tổng tiền chính
    xác.
-   [ ] **Bấm biểu tượng giỏ hàng chỉ mở giỏ, không tự thêm sản phẩm.**
-   [ ] Backend chặn số lượng âm, không hợp lệ hoặc vượt tồn kho.
-   [ ] Giỏ hàng không bị lẫn giữa các tài khoản.
-   [ ] Checkout xác thực địa chỉ, sản phẩm, giá, tồn kho và tổng tiền
    tại backend.
-   [ ] Voucher hết hạn/không đủ điều kiện bị từ chối; giảm giá tính
    đúng.
-   [ ] Đơn hàng và chi tiết đơn được lưu đúng; lưu snapshot giá tại
    thời điểm mua.
-   [ ] Không tin giá/tổng tiền do frontend gửi lên.
-   [ ] Tồn kho không bị bán vượt khi nhiều khách đặt gần đồng thời.
-   [ ] Khách chỉ xem đơn của mình; hủy đơn tuân theo trạng thái/chính
    sách.
-   [ ] Trạng thái đơn hiển thị cập nhật; đánh giá chỉ được gửi khi đủ
    điều kiện.
-   [ ] Yêu thích/theo dõi shop nếu có được lưu thật.
-   [ ] Inbox thông báo chỉ hiển thị thông báo thuộc tài khoản; đánh dấu
    đã đọc nếu có.
-   [ ] Từ chối quyền push không làm website bị lỗi.
-   [ ] Responsive, loading, empty state và lỗi mạng được xử lý hợp lý.

### 3.3 Shop Owner

-   [ ] Tài khoản gửi yêu cầu mở shop; shop ở trạng thái chờ duyệt.
-   [ ] Shop chưa được duyệt bị chặn khỏi các chức năng đăng bán theo
    chính sách.
-   [ ] Admin duyệt/từ chối làm trạng thái được cập nhật đúng.
-   [ ] Chủ shop sửa hồ sơ/logo/ảnh bìa shop của mình.
-   [ ] Tạo/sửa/ẩn sản phẩm; kiểm tra giá và dữ liệu đầu vào.
-   [ ] Upload ảnh thật, kiểm tra định dạng/dung lượng/quyền upload.
-   [ ] Quản lý tồn kho không cho số lượng âm.
-   [ ] Chỉ xem/xử lý đơn của shop mình; không thao tác đơn shop khác.
-   [ ] Chuyển trạng thái đơn theo luồng hợp lệ, không tự nhảy trạng
    thái bị cấm.
-   [ ] Xem thông tin giao hàng cần thiết, không lộ dữ liệu không liên
    quan.
-   [ ] Xem đánh giá và phản hồi nếu chức năng đã được thiết kế.
-   [ ] Báo cáo chỉ gồm dữ liệu shop mình; công thức doanh thu chính
    xác.
-   [ ] API chặn việc sửa `shopId`, `ownerId`, giá, tồn kho hoặc trạng
    thái trái quyền.
-   [ ] Nhận thông báo đúng shop khi có sự kiện liên quan, nếu hệ thống
    có thông báo.

### 3.4 Admin

-   [ ] Dashboard dùng số liệu thật, không hard-code/mock.
-   [ ] Tìm kiếm/xem/khóa/mở khóa tài khoản; khóa được áp dụng ở
    backend.
-   [ ] Duyệt/từ chối yêu cầu mở shop; trạng thái và thông báo cập nhật
    đúng.
-   [ ] CRUD danh mục và thương hiệu; dữ liệu liên quan không bị hỏng.
-   [ ] Xem/kiểm duyệt sản phẩm vi phạm nếu thuộc phạm vi.
-   [ ] Giám sát đơn hàng toàn sàn theo chính sách, không sửa lịch sử
    giao dịch trái phép.
-   [ ] Quản lý voucher/khuyến mãi nếu nằm trong phạm vi.
-   [ ] Báo cáo phân biệt doanh thu toàn sàn và từng shop; số liệu khớp
    database.
-   [ ] Homepage Builder nếu đã yêu cầu: thêm/sửa/sắp xếp/ẩn-hiện khu
    vực trang chủ, chọn danh mục/sản phẩm thật, preview/publish.
-   [ ] Banner/ảnh danh mục được upload thật nếu Storage đã tích hợp.
-   [ ] API Admin kiểm tra quyền backend; Customer/Shop Owner không thể
    gọi trực tiếp.

## 4. Luồng cốt lõi đầu-cuối

-   [ ] Customer đặt đơn hợp lệ.
-   [ ] Backend xác minh sản phẩm, giá, tồn kho, shop và tổng tiền.
-   [ ] Đơn và chi tiết đơn được lưu đúng, trạng thái ban đầu hợp lệ.
-   [ ] Shop Owner chỉ nhìn thấy đơn thuộc shop mình.
-   [ ] Shop xử lý đơn theo luồng trạng thái được phép.
-   [ ] Customer nhìn thấy trạng thái mới.
-   [ ] Tồn kho trừ/hoàn đúng một lần; hủy/hoàn không gây cập nhật lặp.
-   [ ] Nếu có thanh toán, trạng thái đơn và thanh toán nhất quán;
    callback lặp không tạo giao dịch lặp.
-   [ ] Nếu có GHN, vận đơn/trạng thái đồng bộ và lỗi API được xử lý.
-   [ ] Nếu một bước thất bại, không có trạng thái thành công giả hoặc
    dữ liệu nửa vời.

## 5. Bảo mật và phân quyền --- bắt buộc

-   [ ] API riêng tư yêu cầu đăng nhập.
-   [ ] Phân quyền được kiểm tra ở backend, không chỉ ẩn nút trên
    frontend.
-   [ ] Customer A không đọc/sửa hồ sơ, giỏ hàng, đơn, thông báo của
    Customer B.
-   [ ] Shop A không đọc/sửa sản phẩm, tồn kho, đơn, báo cáo của Shop B.
-   [ ] Customer/Shop Owner không gọi được API Admin.
-   [ ] Backend không tin `role`, `userId`, `shopId`, giá, giảm giá,
    tổng tiền hoặc trạng thái client gửi mà chưa xác minh.
-   [ ] Kiểm tra NoSQL injection, dữ liệu sai định dạng, XSS và upload
    file không an toàn.
-   [ ] Không trả stack trace, mật khẩu, token hoặc khóa bí mật trong
    response/log.
-   [ ] Mật khẩu được hash; token/session và đăng xuất được xử lý an
    toàn.
-   [ ] CORS và rate limit cho endpoint nhạy cảm phù hợp.
-   [ ] `.env`, service account key và VAPID private key không bị
    commit/gửi ra frontend.
-   [ ] Storage Security Rules hoặc cơ chế tương đương chặn upload trái
    quyền ngay tại dịch vụ.
-   [ ] Lỗi API không làm lộ thông tin nội bộ.

## 6. Firebase Storage / FCM (chỉ khi nằm trong bản triển khai)

### Storage

-   [ ] Upload ảnh thật thành công bằng tài khoản được phép.
-   [ ] Tài khoản không có quyền không upload vào đường dẫn shop/người
    khác được.
-   [ ] Chặn loại file/dung lượng không hợp lệ.
-   [ ] URL và storage path lưu đúng MongoDB; ảnh còn hiển thị sau khi
    tải lại.
-   [ ] Xóa/thay ảnh không làm hỏng dữ liệu hoặc để lại file mồ côi
    ngoài ý muốn.
-   [ ] Lỗi Firebase được báo đúng, không giả lập thành công.

### FCM và inbox

-   [ ] Người dùng có thể cho phép/từ chối thông báo trình duyệt.
-   [ ] Token gắn đúng tài khoản/thiết bị và được cập nhật.
-   [ ] Sự kiện nghiệp vụ thật mới kích hoạt thông báo.
-   [ ] Inbox lưu trong MongoDB và tồn tại sau khi tải lại theo thiết
    kế.
-   [ ] Thông báo đến đúng người nhận/role.
-   [ ] Token hết hạn được xử lý; lỗi FCM không làm hỏng đơn hàng đã tạo
    thành công.
-   [ ] Kiểm tra service worker và điều kiện HTTPS/localhost.
-   [ ] Thiếu Firebase project/config/quyền/môi trường thì ghi BLOCKED,
    không giả vờ test thật.

## 7. Bộ test case tối thiểu

  ------------------------------------------------------------------------------------
  ID             Test              Kết quả mong đợi      Trạng thái ban Bằng chứng /
                                                         đầu            ghi chú
  -------------- ----------------- --------------------- -------------- --------------
  AUTH-01        Đăng ký hợp lệ    Tạo tài khoản, không  NOT RUN        
                                   lộ mật khẩu                          

  AUTH-02        Email đã tồn tại  Bị từ chối phù hợp    NOT RUN        

  AUTH-03        Đăng nhập sai mật Không đăng nhập       NOT RUN        
                 khẩu                                                   

  AUTH-04        Customer gọi API  Bị từ chối 401/403    NOT RUN        
                 Admin             hoặc tương đương                     

  CAT-01         Guest xem danh    Dữ liệu thật hiển thị NOT RUN        
                 mục/sản phẩm      đúng                                 

  CAT-02         Tìm kiếm/lọc/sắp  Kết quả đúng tiêu chí NOT RUN        
                 xếp                                                    

  CART-01        Thêm/sửa/xóa giỏ  Số lượng/tổng tiền    NOT RUN        
                                   đúng                                 

  CART-02        Bấm icon giỏ hàng Chỉ mở giỏ            NOT RUN        

  CART-03        Số lượng âm/vượt  Backend từ chối       NOT RUN        
                 tồn                                                    

  ORDER-01       Đặt đơn hợp lệ    Đơn và chi tiết đơn   NOT RUN        
                                   lưu đúng                             

  ORDER-02       Sửa giá/tổng tiền Backend xác minh/tính NOT RUN        
                 ở request         lại                                  

  ORDER-03       Customer A đọc    Bị từ chối            NOT RUN        
                 đơn B                                                  

  ORDER-04       Shop A xử lý đơn  Bị từ chối            NOT RUN        
                 Shop B                                                 

  ORDER-05       Hủy đơn           Theo chính sách, tồn  NOT RUN        
                                   kho chính xác                        

  SHOP-01        Gửi yêu cầu mở    Chờ duyệt             NOT RUN        
                 shop                                                   

  SHOP-02        Shop chưa duyệt   Backend chặn          NOT RUN        
                 đăng bán                                               

  SHOP-03        Admin duyệt shop  Trạng thái/quyền cập  NOT RUN        
                                   nhật đúng                            

  SHOP-04        Shop quản lý sản  Lưu DB thành công     NOT RUN        
                 phẩm mình                                              

  SHOP-05        Shop sửa sản phẩm Bị từ chối            NOT RUN        
                 shop khác                                              

  ADMIN-01       Admin khóa tài    Backend áp dụng chính NOT RUN        
                 khoản             sách khóa                            

  ADMIN-02       Admin CRUD danh   Dữ liệu đúng, không   NOT RUN        
                 mục/thương hiệu   hỏng liên kết                        

  ADMIN-03       Dashboard/báo cáo Số liệu khớp DB       NOT RUN        

  HOME-01        Trang chủ         Hero Banner không bị  NOT RUN        
                 Customer          thay đổi ngoài ý muốn                

  HOME-02        Homepage Builder  Lưu/preview/publish   NOT RUN        
                 nếu có            đúng                                 

  FILE-01        Upload ảnh hợp lệ Upload thật, URL/path NOT RUN        
                                   lưu đúng                             

  FILE-02        Upload file sai   Bị chặn               NOT RUN        
                 loại/quá lớn                                           

  NOTI-01        Sự kiện đơn hàng  Inbox đúng người nhận NOT RUN        
                 thật                                                   

  NOTI-02        Đọc thông báo     Bị từ chối            NOT RUN        
                 người khác                                             

  FCM-01         Push trình duyệt  Nhận khi cấu          NOT RUN        
                 thật              hình/quyền đầy đủ                    

  FCM-02         Token FCM hết hạn Xử lý lỗi, nghiệp vụ  NOT RUN        
                                   chính không hỏng                     

  REG-01         Build/lint/test   Chạy được hoặc ghi rõ NOT RUN        
                 có sẵn            lý do                                
  ------------------------------------------------------------------------------------

## 8. Bảng tổng hợp chức năng thiếu

Agent điền một dòng cho mỗi chức năng chưa có hoặc chưa xác minh:

  --------------------------------------------------------------------------------------------------------------
  Chức năng   Tác nhân    Trạng thái                                 Ưu tiên     Bằng chứng  Đề xuất
                          (Implemented/Partial/Missing/Unverified)               đã kiểm tra 
  ----------- ----------- ------------------------------------------ ----------- ----------- -------------------
  Ví dụ: lịch Customer    Unverified                                 P1          Chưa xác    Kiểm tra
  sử đơn hàng                                                                    minh        route/model/luồng
                                                                                 UI/API/DB   trước khi kết luận

  --------------------------------------------------------------------------------------------------------------

### Mức ưu tiên

-   **P0 --- Nghiêm trọng:** lộ dữ liệu, sai phân quyền, mất dữ
    liệu/tiền, đặt hàng/tồn kho sai.
-   **P1 --- Cốt lõi:** đăng nhập, duyệt shop, đặt hàng, xử lý đơn hoặc
    quản lý sản phẩm không hoạt động.
-   **P2 --- Quan trọng:** tìm kiếm/lọc, báo cáo, thông báo, upload,
    trạng thái lỗi/empty.
-   **P3 --- Cải thiện:** UI/UX và chức năng tùy chọn.

Không tự động coi thanh toán online, GHN, chat trực tiếp, đổi trả tự
động, tích điểm hoặc đa ngôn ngữ là bắt buộc nếu đề tài chưa yêu cầu.
Đánh dấu Optional/Out of scope đến khi xác nhận.

## 9. Báo cáo cuối cùng bắt buộc

Agent phải tạo `bao_cao_test_gear_tech.md` gồm: 1. Tình trạng tổng thể:
`Verified working / Partially working / Not verified / Blocked`. 2. Môi
trường test, phiên bản Node, lệnh chạy, URL frontend/backend; che thông
tin bí mật. 3. Tổng số PASS/FAIL/BLOCKED/NOT RUN; không tính MISSING như
test đã chạy. 4. Kết quả theo Guest, Customer, Shop Owner, Admin và dịch
vụ ngoài. 5. Luồng đầu-cuối đã chạy: đăng ký → yêu cầu mở shop → Admin
duyệt → đăng sản phẩm → Customer đặt hàng → Shop xử lý → Customer theo
dõi. 6. Lỗi P0/P1, cách tái hiện, file/API liên quan và tác động. 7.
Chức năng thiếu và chức năng chưa xác minh --- tách riêng. 8. Bằng chứng
thực tế; che token, mật khẩu và dữ liệu nhạy cảm. 9. Các file đã thay
đổi và lý do; nếu không sửa thì ghi rõ. 10. Bước thủ công còn lại
(Firebase/API đối tác/tài khoản test). 11. Không tuyên bố hoàn thành nếu
luồng cốt lõi chưa chạy hoặc test quan trọng đang BLOCKED/NOT RUN.

## 10. Chỉ dẫn cuối cho coding agent

-   Bắt đầu bằng audit, không sửa code ngay khi chưa hiểu kiến
    trúc/luồng.
-   Ưu tiên lập báo cáo trước; nếu được giao sửa, sửa từng nhóm nhỏ và
    chạy regression sau mỗi nhóm.
-   Không thêm dữ liệu giả, dashboard hard-code hoặc API response giả để
    làm test PASS.
-   Xác minh luồng frontend → API → database/dịch vụ ngoài.
-   Giữ nguyên Hero Banner trang chủ Customer.
-   Thiếu quyền/cấu hình thì ghi BLOCKED và nêu bước cần làm.
-   Không ghi hoặc hiển thị password, access token, private key, service
    account JSON hay dữ liệu cá nhân thật.
