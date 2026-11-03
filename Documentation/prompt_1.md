# TASK: REFACTOR & RESTRUCTURE TOÀN BỘ FRONTEND VÀ BACKEND – GEAR TECH

Bạn là Senior Full-stack Software Engineer và Software Architect. Hãy kiểm tra, đánh giá và refactor dự án Gear Tech của tôi.

## 1. Bối cảnh dự án

Dự án hiện có hai thư mục chính:

- `frontend/`: ReactJS, TypeScript, Vite, Tailwind CSS.
- `backend/`: Node.js, Express.js, MongoDB.

Đây là hệ thống thương mại điện tử đa cửa hàng (Multi-vendor Marketplace), có các vai trò:

- Guest: Khách chưa đăng nhập.
- Customer: Khách hàng.
- Shop Owner: Chủ cửa hàng.
- Admin: Quản trị viên.

Các nghiệp vụ chính gồm:

- Authentication và Authorization.
- Quản lý người dùng và phân quyền.
- Quản lý cửa hàng.
- Quản lý sản phẩm, danh mục, thương hiệu.
- Giỏ hàng và yêu thích.
- Đặt hàng và quản lý đơn hàng.
- Thanh toán.
- Vận chuyển GHN.
- Khuyến mãi và voucher.
- Đánh giá sản phẩm.
- Quản lý tài chính, doanh thu và yêu cầu rút tiền.
- Dashboard cho Admin và Shop Owner.

## 2. Mục tiêu refactor

Tôi muốn tổ chức lại toàn bộ source code để:

1. Folder được sử dụng đúng mục đích và đúng trách nhiệm.
2. Không để tất cả component, API, hook và logic tập trung trong một file.
3. Phát hiện và tách các Mega Component.
4. Loại bỏ code trùng lặp.
5. Tách biệt UI, business logic, API và dữ liệu.
6. Tăng khả năng tái sử dụng component.
7. Dễ dàng mở rộng tính năng trong tương lai.
8. Dễ đọc, dễ debug, dễ bảo trì và thuận tiện làm việc nhóm.
9. Đảm bảo Frontend và Backend có kiến trúc rõ ràng, giao tiếp với nhau thông qua API nhất quán.

Áp dụng các nguyên tắc:

- Single Responsibility Principle (SRP).
- Separation of Concerns.
- DRY.
- High Cohesion, Low Coupling.
- Component Composition.
- Reusable Components.
- Type Safety.

Không áp dụng máy móc các pattern nếu chúng làm dự án phức tạp hơn mức cần thiết.

## 3. Giai đoạn 1 – Audit toàn bộ dự án

Trước tiên, hãy đọc và phân tích toàn bộ source code trong cả `frontend/` và `backend/`.

Kiểm tra:

### Frontend
- Cấu trúc thư mục và cách tổ chức file.
- Components và Mega Components.
- Pages và Layouts.
- Custom Hooks.
- API Services.
- TanStack Query.
- React Router.
- Zustand hoặc Context nếu dự án đang sử dụng.
- Types và Interfaces.
- Utils và Constants.
- Form handling và validation.
- Authentication và Authorization.
- Quản lý loading, error, empty state.
- Responsive UI.
- Code trùng lặp và logic bị đặt sai vị trí.

### Backend
- Routes.
- Controllers.
- Services.
- Models và MongoDB schemas.
- Middlewares.
- Validators.
- Repositories nếu thực sự cần thiết.
- Config và Database connection.
- Authentication và Authorization.
- Error handling.
- API response format.
- Business logic.
- Phân quyền truy cập dữ liệu giữa Admin, Shop Owner và Customer.
- Code trùng lặp và các file quá lớn.

### Đánh giá chất lượng code

Tìm các vấn đề như:

- File có quá nhiều dòng code.
- Component đảm nhiệm quá nhiều chức năng.
- Component vừa hiển thị UI vừa gọi API vừa xử lý business logic.
- Controller chứa quá nhiều business logic.
- Route chứa trực tiếp logic xử lý phức tạp.
- Một hàm thực hiện nhiều nhiệm vụ không liên quan.
- Lặp lại API calls hoặc validation.
- Import không sử dụng.
- TypeScript sử dụng `any` không cần thiết.
- Circular dependencies.
- Tên folder, file, function không nhất quán.
- Logic phân quyền bị lặp hoặc đặt sai tầng.

Hãy tạo báo cáo gồm:

| Mức độ | Ý nghĩa |
|---|---|
| Critical | Lỗi nghiêm trọng, ảnh hưởng bảo mật hoặc chức năng |
| High | Ảnh hưởng lớn đến kiến trúc và khả năng bảo trì |
| Medium | Cần cải thiện để code dễ đọc và tái sử dụng |
| Low | Vấn đề nhỏ về naming, formatting hoặc convention |

Với mỗi vấn đề, chỉ rõ:
- Đường dẫn file.
- Vấn đề hiện tại.
- Tác động.
- Hướng giải quyết.
- Những file có thể bị ảnh hưởng.

**Quan trọng: Giai đoạn này chỉ audit và báo cáo, chưa được chỉnh sửa source code.**

## 4. Giai đoạn 2 – Đề xuất cấu trúc folder

Sau khi audit, hãy đề xuất cấu trúc folder phù hợp với source code thực tế.

Không được di chuyển file một cách máy móc. Cần xác định đúng trách nhiệm của từng file trước khi quyết định vị trí.

### Frontend

Ưu tiên tổ chức theo feature/domain, kết hợp các thư mục dùng chung.

Cấu trúc tham khảo:

```text
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── providers/
│   │   ├── router/
│   │   └── config/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── common/
│   │   └── feedback/
│   │
│   ├── layouts/
│   │   ├── MainLayout/
│   │   ├── AuthLayout/
│   │   ├── AdminLayout/
│   │   └── ShopLayout/
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   │
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── shops/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── shipping/
│   │   ├── promotions/
│   │   ├── reviews/
│   │   ├── favorites/
│   │   ├── finance/
│   │   └── users/
│   │
│   ├── hooks/
│   ├── services/
│   │   ├── api/
│   │   └── http/
│   │
│   ├── store/
│   ├── types/
│   ├── constants/
│   ├── utils/
│   └── styles/
│
├── .env
├── package.json
└── vite.config.ts
```

Đây là cấu trúc tham khảo, không phải yêu cầu bắt buộc phải tạo tất cả folder. Chỉ tạo folder khi có nội dung thực tế cần đặt vào đó.

### Backend

Ưu tiên tách biệt HTTP layer, business logic, dữ liệu và các thành phần dùng chung.

Cấu trúc tham khảo:

```text
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── environment.js
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   ├── auth.validation.js
│   │   │   └── auth.model.js
│   │   │
│   │   ├── users/
│   │   ├── shops/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── brands/
│   │   ├── cart/
│   │   ├── orders/
│   │   ├── payments/
│   │   ├── shipping/
│   │   ├── promotions/
│   │   ├── reviews/
│   │   ├── favorites/
│   │   └── finance/
│   │
│   ├── middlewares/
│   ├── shared/
│   │   ├── errors/
│   │   ├── responses/
│   │   ├── validators/
│   │   └── utils/
│   │
│   ├── integrations/
│   │   ├── ghn/
│   │   └── payment-gateways/
│   │
│   ├── app.js
│   └── server.js
│
├── tests/
├── .env
└── package.json
```

Nếu backend hiện tại sử dụng JavaScript thì không tự ý chuyển sang TypeScript trong quá trình refactor, trừ khi tôi phê duyệt riêng.

## 5. Giai đoạn 3 – Tách Mega Components

Đây là một trong những nhiệm vụ quan trọng nhất.

Hãy tìm những component có một hoặc nhiều dấu hiệu:

- Quá nhiều dòng code.
- Có nhiều khu vực UI độc lập.
- Chứa nhiều chức năng khác nhau.
- Có quá nhiều state và useEffect.
- Xử lý API trực tiếp trong component.
- Có logic nghiệp vụ phức tạp.
- Có nhiều điều kiện render lồng nhau.
- Khó tái sử dụng hoặc khó kiểm thử.

Không chỉ dựa vào số dòng code để kết luận một component là Mega Component. Hãy xem xét trách nhiệm và mức độ phức tạp thực tế.

Ví dụ:

Một `ProductManagement.tsx` đang chứa:
- Bộ lọc sản phẩm.
- Thanh tìm kiếm.
- Bảng sản phẩm.
- Phân trang.
- Modal thêm sản phẩm.
- Modal sửa sản phẩm.
- Modal xóa sản phẩm.
- Upload hình ảnh.
- Gọi API.
- Xử lý validation.

Có thể tách thành:

```text
features/products/
├── pages/
│   └── ProductManagementPage.tsx
│
├── components/
│   ├── ProductFilter.tsx
│   ├── ProductSearch.tsx
│   ├── ProductTable.tsx
│   ├── ProductPagination.tsx
│   ├── ProductForm.tsx
│   ├── ProductFormModal.tsx
│   ├── ProductImageUpload.tsx
│   └── DeleteProductDialog.tsx
│
├── hooks/
│   ├── useProducts.ts
│   └── useProductForm.ts
│
├── services/
│   └── productService.ts
│
└── types/
    └── product.types.ts
```

Quy tắc:
- Page chịu trách nhiệm kết hợp các component và điều phối màn hình.
- Component con tập trung vào một phần UI hoặc một nhiệm vụ rõ ràng.
- Custom Hook quản lý logic React có thể tái sử dụng.
- Service chịu trách nhiệm giao tiếp API.
- Types định nghĩa kiểu dữ liệu.
- Utils chứa hàm thuần có thể tái sử dụng.
- Không tạo component chỉ để bọc một vài dòng JSX nếu không mang lại lợi ích.
- Không chia nhỏ quá mức khiến code khó theo dõi.
- Ưu tiên composition và props rõ ràng thay vì truyền quá nhiều props không cần thiết.

Áp dụng tương tự cho các Mega Components khác trong Frontend.

## 6. Giai đoạn 4 – Chuẩn hóa cách sử dụng folder

Hãy kiểm tra và đưa ra quy tắc rõ ràng cho từng folder.

Frontend:

- `components/`: UI component dùng chung hoặc có thể tái sử dụng.
- `features/`: Chức năng theo nghiệp vụ.
- `pages/` hoặc `pages/` bên trong feature: Component đại diện cho trang.
- `layouts/`: Bố cục dùng chung cho nhiều trang.
- `hooks/`: Custom Hook dùng chung.
- `services/`: Giao tiếp API và xử lý tầng truy cập dịch vụ.
- `store/`: Global state.
- `types/`: Kiểu dữ liệu dùng chung.
- `utils/`: Hàm tiện ích thuần.
- `constants/`: Giá trị cố định.
- `assets/`: Tài nguyên tĩnh.
- `dist/`: Thư mục build do Vite tạo ra, không chỉnh sửa thủ công.

Backend:

- `routes/`: Định nghĩa endpoint và gắn middleware/controller.
- `controllers/`: Nhận request, gọi service và trả response.
- `services/`: Business logic.
- `models/`: Mô hình dữ liệu và truy vấn MongoDB.
- `middlewares/`: Authentication, authorization, error handling...
- `validators/`: Kiểm tra dữ liệu đầu vào.
- `config/`: Cấu hình ứng dụng và database.
- `integrations/`: Kết nối dịch vụ bên ngoài như GHN và cổng thanh toán.
- `utils/`: Hàm tiện ích dùng chung.

Nếu sử dụng kiến trúc `modules/`, hãy giải thích rõ vì sao một số thành phần được đặt bên trong từng module thay vì tách thành các folder toàn cục.

Không tạo đồng thời nhiều nơi chứa cùng một loại logic gây nhầm lẫn.

## 7. Giai đoạn 5 – Refactor an toàn

Sau khi tôi phê duyệt báo cáo và cấu trúc đề xuất, mới bắt đầu chỉnh sửa.

Thứ tự thực hiện:

1. Chuẩn hóa cấu trúc và naming.
2. Tách các Mega Components.
3. Tách UI khỏi business logic.
4. Tách API khỏi component.
5. Chuẩn hóa custom hooks.
6. Chuẩn hóa types và interfaces.
7. Refactor Backend routes/controllers/services/models.
8. Xử lý code trùng lặp.
9. Chuẩn hóa error handling.
10. Kiểm tra tích hợp Frontend – Backend.

Thực hiện theo từng module, không refactor toàn bộ trong một lần.

Với mỗi module:
- Kiểm tra code hiện tại.
- Xác định các file liên quan.
- Lập kế hoạch thay đổi.
- Refactor.
- Cập nhật import và đường dẫn.
- Kiểm tra chức năng.
- Chạy test và build.
- Báo cáo kết quả.

## 8. Những điều tuyệt đối không được làm

- Không xóa chức năng đang hoạt động.
- Không tự ý thay đổi nghiệp vụ.
- Không tự ý đổi API endpoint hoặc response format.
- Không tự ý đổi MongoDB collection, field hoặc schema.
- Không xóa dữ liệu cũ.
- Không tạo dữ liệu giả để làm giao diện trông có vẻ hoạt động.
- Không hardcode dữ liệu thay cho API.
- Không tự ý thay đổi authentication, authorization.
- Không để lộ thông tin trong `.env`.
- Không sửa trực tiếp thư mục `dist`.
- Không refactor chỉ để giảm số dòng code.
- Không tạo quá nhiều abstraction hoặc folder không cần thiết.
- Không ghi nhận test thành công nếu chưa thực sự chạy.

Trước khi di chuyển hoặc xóa file:
- Kiểm tra tất cả nơi đang import file đó.
- Kiểm tra route và lazy loading.
- Kiểm tra các module phụ thuộc.
- Đảm bảo không còn import bị lỗi.

## 9. Giai đoạn 6 – Kiểm thử và báo cáo

Sau mỗi module, kiểm tra:

### Frontend
- TypeScript.
- ESLint nếu có.
- Vite build.
- React Router.
- API integration.
- Các chức năng chính.
- Loading, error và empty state.

### Backend
- Server khởi động.
- Database connection.
- API endpoints.
- Authentication.
- Authorization theo role.
- Validation.
- Error handling.
- Các nghiệp vụ chính.

### Báo cáo cuối cùng

Tạo báo cáo gồm:

1. Cấu trúc folder trước và sau.
2. Các Mega Components đã được tách.
3. Các file đã tạo.
4. Các file đã di chuyển.
5. Các file đã chỉnh sửa.
6. Các file đã xóa và lý do.
7. Những vấn đề đã khắc phục.
8. Những vấn đề còn tồn tại.
9. Kết quả test và build thực tế.
10. Những rủi ro hoặc phần cần tôi kiểm tra thủ công.

## 10. Cách làm việc bắt buộc

**BẮT ĐẦU BẰNG GIAI ĐOẠN 1 – AUDIT.**

Đầu tiên, hãy kiểm tra toàn bộ hai thư mục `frontend/` và `backend/`.

Sau đó trả về:
- Đánh giá kiến trúc hiện tại.
- Danh sách Mega Components.
- Những folder đang được sử dụng sai mục đích.
- Những file nên di chuyển.
- Cấu trúc folder mới đề xuất.
- Kế hoạch refactor theo thứ tự ưu tiên.

**Không chỉnh sửa source code ở giai đoạn đầu. Hãy chờ tôi xác nhận trước khi thực hiện refactor.**