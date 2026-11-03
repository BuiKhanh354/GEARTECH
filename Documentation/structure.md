# Đề xuất Refactor Cấu trúc thư mục `src/` (GearTech)

Tài liệu này phân tích cấu trúc thư mục hiện tại của dự án **GearTech** và đề xuất hai phương án tái cơ cấu (Refactor) nhằm tối ưu hóa mã nguồn, tăng tốc độ tìm kiếm file và chuẩn hóa cách thức tổ chức trang/thành phần.

---

## 1. Phân tích Cấu trúc hiện tại (Current Status)

Hiện tại, thư mục `src/` đang ở trạng thái **lai (hybrid)** giữa mô hình Modular Feature (Theo tính năng) và mô hình Page-Driven (Theo trang):

```text
src/
├── components/          # Thành phần dùng chung (Header, Footer...)
├── layouts/             # Giao diện khung dùng chung (MainLayout)
├── utils/               # Công cụ dùng chung (formatPrice...)
├── pages/               # Chứa các trang
│   ├── Homepages.tsx    # Chỉ là file đệm, import từ features/home
│   ├── ProductPage.tsx  # Chỉ là file đệm, import từ features/products
│   ├── StorePage.tsx    # Chứa code trực tiếp (Không có feature)
│   ├── AboutPage.tsx    # Chứa code trực tiếp (Không có feature)
│   └── ProfilePage.tsx  # Chứa code trực tiếp (Không có feature)
└── features/            # Thư mục chứa code theo tính năng
    ├── home/            # Tính năng Trang chủ
    └── products/        # Tính năng Sản phẩm
```

### Các hạn chế của cấu trúc hiện tại:
1. **Thiếu nhất quán (Inconsistency):** Trang Chủ và Trang Sản phẩm thì chia nhỏ vào `features`, trong khi các trang Cửa hàng, Giới thiệu, Cá nhân lại viết trực tiếp vào `pages`.
2. **File đệm thừa:** Tệp `pages/Homepages.tsx` và `pages/ProductPage.tsx` chỉ làm nhiệm vụ import rồi export lại, tạo thêm một cấp dẫn đường dẫn không cần thiết.
3. **Độ sâu đường dẫn phức tạp:** Việc lồng nhiều cấp thư mục (`features/products/pages/ProductDetailPage.tsx`) khiến các câu lệnh import dài dòng và khó quản lý.

---

## 2. Các phương án Refactor đề xuất

---

### PHƯƠNG ÁN 1: Kiến trúc Phẳng (Page-Driven Architecture) - KHUYÊN DÙNG
Phương án này loại bỏ thư mục `features`, gom toàn bộ các trang về `src/pages/` và các dữ liệu dùng chung về `src/data/` hoặc `src/mock/`.

#### Cấu trúc thư mục sau khi Refactor:
```text
src/
├── assets/              # Tài nguyên tĩnh (video, images, styles)
├── components/          # Thành phần dùng chung (Header, Footer, UI components)
├── layouts/             # Layout chính (MainLayout)
├── pages/               # TẤT CẢ các trang (Không dùng file đệm)
│   ├── HomePage.tsx     # Code trang chủ
│   ├── ProductListPage.tsx
│   ├── ProductDetailPage.tsx
│   ├── StorePage.tsx
│   ├── AboutPage.tsx
│   └── ProfilePage.tsx
├── data/                # Dữ liệu mẫu (Mock data)
│   └── productsData.ts  
├── utils/               # Tiện ích dùng chung (format.ts)
├── App.tsx              # Cấu hình định tuyến
└── main.tsx             # Điểm chạy ứng dụng
```

#### Các bước thực hiện:
1. Di chuyển code từ `src/features/home/pages/HomePage.tsx` sang `src/pages/HomePage.tsx`.
2. Di chuyển code từ `src/features/products/pages/ProductListPage.tsx` sang `src/pages/ProductListPage.tsx`.
3. Di chuyển code từ `src/features/products/pages/ProductDetailPage.tsx` sang `src/pages/ProductDetailPage.tsx`.
4. Di chuyển dữ liệu mock từ `src/features/products/data/productsData.ts` sang `src/data/productsData.ts`.
5. Xóa bỏ thư mục `src/features/`.
6. Cập nhật lại đường dẫn import trong các file liên quan và cấu hình định tuyến trong `src/App.tsx`.

* **Đánh giá:** Rất đơn giản, dễ bảo trì, thích hợp cho các dự án quy mô trung bình và giúp lập trình viên tìm kiếm tệp nhanh chóng.

---

### PHƯƠNG ÁN 2: Kiến trúc Tính năng chuẩn (Feature-Driven Architecture)
Phương án này chuẩn hóa toàn bộ dự án theo mô hình Modular Features. Mọi trang và thành phần sẽ thuộc về một tính năng cụ thể, loại bỏ thư mục `src/pages/` trung gian.

#### Cấu trúc thư mục sau khi Refactor:
```text
src/
├── components/          # Thành phần dùng chung toàn hệ thống
├── layouts/             # Layout dùng chung
├── utils/               # Tiện ích dùng chung
└── features/            # Chia nhỏ theo tính năng
    ├── home/            # Tính năng Trang chủ
    │   └── pages/HomePage.tsx
    ├── products/        # Tính năng Sản phẩm
    │   ├── data/productsData.ts
    │   └── pages/
    │       ├── ProductListPage.tsx
    │       └── ProductDetailPage.tsx
    ├── stores/          # Tính năng Hệ thống cửa hàng
    │   └── pages/StorePage.tsx
    ├── about/           # Tính năng Giới thiệu doanh nghiệp
    │   └── pages/AboutPage.tsx
    └── profile/         # Tính năng Trang cá nhân người dùng
        └── pages/ProfilePage.tsx
```

#### Các bước thực hiện:
1. Xóa bỏ thư mục `src/pages/`.
2. Tạo các thư mục tính năng mới: `src/features/stores/`, `src/features/about/`, `src/features/profile/`.
3. Di chuyển các trang tương ứng từ `src/pages/` vào mục `pages/` của từng tính năng mới.
4. Cấu hình định tuyến trong `src/App.tsx` trỏ trực tiếp đến các trang nằm trong các thư mục `features`.

* **Đánh giá:** Rất có ích cho các dự án lớn, nhiều thành viên cùng làm việc, giúp chia nhỏ ứng dụng thành các module độc lập. Tuy nhiên, đường dẫn import sẽ dài hơn và cồng kềnh hơn.
