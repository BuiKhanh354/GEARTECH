# TODO — Redesign UI/UX Mobile App GearTech (HOÀN THÀNH ✅)

> File này ghi trạng thái công việc redesign UI/UX mobile app theo `Documentation/app_update_ux.md`.
> Cập nhật lần cuối: **Đã hoàn thành toàn bộ các bước redesign, kiểm thử TypeScript 0 lỗi và export bundle thành công**.

---

## Bối cảnh

- Mobile app nằm tại `mobile-app/` — Expo SDK 58, React Native 0.88, TypeScript strict, Expo Router, TanStack Query, Zustand, Axios.
- Backend + website **không đụng đến** — app gọi API thật `http://<IP>:5000/api`.
- Redesign theo prompt: giữ nguyên toàn bộ nghiệp vụ/API/luồng, chỉ nâng cấp thị giác + nhất quán.

## Nguyên tắc đã tuân thủ

- Mọi màu/chữ/khoảng cách lấy từ Design System `constants/theme.ts` — **không hardcode màu trong StyleSheet màn hình**.
- Không đổi logic services/stores; chỉ sửa phần trình bày.
- Không thêm thư viện mới (icon dùng @expo/vector-icons).
- Giữ brand đỏ `#ff4655` của website.

---

## ✅ ĐÃ HOÀN THÀNH TOÀN BỘ

### Bước 1-3 — Audit + Design System + Components

| File | Nội dung |
|---|---|
| `constants/theme.ts` | **Viết lại hoàn toàn (v2)**: `palette` (brand/ink/muted/surface/border/status…), `spacing` thang 4dp, `radius`, `elevation` (bóng tinh tế), `type` (typography 6 cấp + price/priceOld), `formatPrice`, ORDER_STATUS_*. |
| `components/ui.tsx` | Viết lại: `PrimaryButton` (variant primary/dark/outline + loading), `OrderStatusBadge`, `SectionHeader` (có subtitle), `Input` (label + focus ring + error), `Card`. |
| `components/ProductCard.tsx` | **v2 hoàn chỉnh**: ảnh tỷ lệ vuông (aspectRatio 1) + fallback onError, badge "-X%" tính từ oldPrice thật, overlay "Hết hàng" / "Chỉ còn N", tên 2 dòng, `PriceText`, rating + soldCount + tên shop, đường kẻ phân cách shop. |
| `components/PriceText.tsx` | **Mới**: khối giá dùng chung, 2 size `card`/`detail`, chỉ hiện giá gốc + badge giảm khi có khuyến mãi thật. |
| `components/SearchBar.tsx` | **Mới**: ô tìm kiếm focus ring đỏ, nút xóa nội dung, nút gửi. |
| `components/Skeleton.tsx` | **Mới**: `Skeleton` (fade pulse) + `ProductGridSkeleton` cho lưới 2 cột. |
| `components/StateViews.tsx` | v2: EmptyView có nút hành động, ErrorView có icon + nút Thử lại dạng pill — dùng `palette`. |

---

### Bước 4 — Redesign từng màn hình

| Màn hình | Trạng thái | Điểm cải tiến chính |
|---|---|---|
| `app/(tabs)/index.tsx` | ✅ Xong | Brand header `GEARTECH` + nút Cart pill badge, `SearchBar`, `SectionHeader` có subtitle, Category tiles, `ProductGridSkeleton`, lưới 2 cột `ProductCard` v2. |
| `app/(tabs)/_layout.tsx` | ✅ Xong | Tab bar v2: 4 tab, icon fill/outline đúng trạng thái, active brand đỏ, badge giỏ hàng, nền trắng viền hairline. |
| `app/_layout.tsx` | ✅ Xong | Header stack: nền trắng, chữ ink đậm, back button brand đỏ, `headerShadowVisible: false`. |
| `app/(tabs)/categories.tsx` | ✅ Xong | Chip danh mục ngang với trạng thái active (brandSoft + viền brand), nút tìm kiếm nhanh, `ProductGridSkeleton`, empty state. |
| `app/products/index.tsx` | ✅ Xong | `SearchBar` mới, chip sắp xếp dạng pill mượt mà, thông báo số lượng kết quả, pagination loading, `ProductGridSkeleton`. |
| `app/products/[id].tsx` | ✅ Xong | Ảnh tỷ lệ vuông + fallback onError, `PriceText size="detail"`, meta chips (rating, tồn kho, đã bán, brand), card shop riêng, thanh mua hàng nổi (`elevation.float`) với circular qty stepper. |
| `app/shops/[id].tsx` | ✅ Xong | Header shop dạng card lớn (avatar bo góc, rating/followers/sản phẩm), `SectionHeader`, lưới sản phẩm 2 cột. |
| `app/(tabs)/cart.tsx` | ✅ Xong | Item card: thumbnail 56px, tên 2 dòng, `PriceText`, circular qty stepper, nút xóa thùng rác, footer tổng tiền nổi bật + ghi chú giao hàng. |
| `app/checkout.tsx` | ✅ Xong | Nhóm card: Sản phẩm / Địa chỉ giao hàng (dùng `Input` có focus ring) / Thanh toán (radio button chuẩn UI); footer tổng + nút Đặt hàng variant dark. |
| `app/orders/index.tsx` | ✅ Xong | Card đơn hàng nổi, mã đơn `#CODE` + `OrderStatusBadge`, mặt hàng tóm tắt, tổng tiền đỏ, nút Hủy đơn outline đỏ khi pending. |
| `app/orders/[id].tsx` | ✅ Xong | Timeline tiến trình 4 bước trực quan (hoặc thông báo Đã hủy), bảng mặt hàng có thumbnail, block giao nhận & thanh toán chi tiết. |
| `app/auth/login.tsx` | ✅ Xong | Logo GEARTECH lớn giữa màn hình, card form bo góc dùng `Input`, nút `PrimaryButton` full-width, link chuyển sang đăng ký. |
| `app/auth/register.tsx` | ✅ Xong | Card form đồng bộ với Login, các trường `Input` chuẩn hóa, validation mật khẩu >= 6 ký tự. |
| `app/(tabs)/profile.tsx` | ✅ Xong | Profile card lớn (avatar chữ cái, rank badge pill, điểm tích lũy), menu card có icon & chevron, nút đăng xuất outline đỏ. |

---

### Bước 5-6 — Kiểm tra & Regression Test

- [x] **TypeScript check**: `npx tsc --noEmit` đạt **0 lỗi** tuyệt đối.
- [x] **Production Export**: `CI=1 npx expo export --no-bytecode` thành công 100%, bundle đầy đủ cho cả `android`, `ios`, và `web`.
- [x] **Visual Verification (Mobile View 390x844)**:
  - Đã kiểm tra trực quan các màn hình: Home, Categories, Product Detail, Cart, Profile, Login.
  - Typography đồng bộ, khoảng cách 4dp chuẩn xác, không có lỗi tràn layout.
  - Xử lý mượt mà các trạng thái loading (Skeleton) và empty/error.
- [x] **Logic & Nghiệp vụ**:
  - Giữ 100% logic API, services, Zustand store và Expo Router navigation.
  - Không thay đổi backend hay mock dữ liệu giả.
