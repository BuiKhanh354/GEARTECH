import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StorePage from './pages/StorePage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import CheckoutPage from './pages/CheckoutPage'
import CartPage from './pages/CartPage'
import ShopDetailPage from './pages/ShopDetailPage'
import MainLayout from './layouts/Mainlayout'

// Admin Centre (Kênh Quản trị) - layout dashboard riêng cho vai trò Admin
import AdminLayout from './features/admin/pages/AdminLayout'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'
import AdminAnalyticsPage from './features/admin/pages/AdminAnalyticsPage'
import AdminUsersPage from './features/admin/pages/AdminUsersPage'
import AdminShopsPage from './features/admin/pages/AdminShopsPage'
import AdminProductsPage from './features/admin/pages/AdminProductsPage'
import AdminCategoriesPage from './features/admin/pages/AdminCategoriesPage'
import AdminBrandsPage from './features/admin/pages/AdminBrandsPage'
import AdminOrdersPage from './features/admin/pages/AdminOrdersPage'
import AdminVouchersPage from './features/admin/pages/AdminVouchersPage'
import AdminShowroomsPage from './features/admin/pages/AdminShowroomsPage'
import AdminHomepageBuilderPage from './features/admin/pages/AdminHomepageBuilderPage'

// Seller Centre (Kênh Người Bán) - layout dashboard riêng, không dùng chrome trang công khai
import SellerLayout from './features/shop/pages/SellerLayout'
import SellerOverviewPage from './features/shop/pages/SellerOverviewPage'
import SellerOrdersPage from './features/shop/pages/SellerOrdersPage'
import SellerProductsPage from './features/shop/pages/SellerProductsPage'
import SellerInventoryPage from './features/shop/pages/SellerInventoryPage'
import SellerSuppliersPage from './features/shop/pages/SellerSuppliersPage'
import SellerVouchersPage from './features/shop/pages/SellerVouchersPage'
import SellerAnalyticsPage from './features/shop/pages/SellerAnalyticsPage'
import SellerStorefrontPage from './features/shop/pages/SellerStorefrontPage'

// Wrapper cho site công khai: giữ MainLayout bao quanh Outlet
function SiteLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================================
            SELLER CENTRE — Khu vực Chủ shop (layout dashboard thống nhất)
            Route cũ /shop-manager, /quan-ly-shop được redirect về /shop
            Lưu ý: /shop/:id (trang gian hàng công khai) vẫn phân giải đúng
            vì React Router ưu tiên segment tĩnh hơn segment động.
        ============================================================ */}
        <Route path="/shop" element={<SellerLayout />}>
          <Route index element={<SellerOverviewPage />} />
          <Route path="orders" element={<SellerOrdersPage />} />
          <Route path="products" element={<SellerProductsPage />} />
          <Route path="inventory" element={<SellerInventoryPage />} />
          <Route path="suppliers" element={<SellerSuppliersPage />} />
          <Route path="vouchers" element={<SellerVouchersPage />} />
          <Route path="analytics" element={<SellerAnalyticsPage />} />
          <Route path="storefront" element={<SellerStorefrontPage />} />
        </Route>

        {/* ============================================================
            ADMIN CENTRE — Khu vực Quản trị viên (layout dashboard riêng)
            Backend chặn mọi API quản trị bằng checkRole(['admin']).
        ============================================================ */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="shops" element={<AdminShopsPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="brands" element={<AdminBrandsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="vouchers" element={<AdminVouchersPage />} />
          <Route path="showrooms" element={<AdminShowroomsPage />} />
          <Route path="homepage" element={<AdminHomepageBuilderPage />} />
        </Route>

        {/* ============================================================
            SITE CÔNG KHAI — giữ nguyên layout hiện có
        ============================================================ */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/Trang-chu" element={<HomePage />} />
          <Route path="/ProductPage" element={<ProductListPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/shop/:id" element={<ShopDetailPage />} />
          <Route path="/Cua-hang" element={<StorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/gio-hang" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/thanh-toan" element={<CheckoutPage />} />
          <Route path="/quan-tri" element={<Navigate to="/admin" replace />} />
          {/* Route cũ của khu Chủ shop -> chuyển hướng sang Seller Centre mới */}
          <Route path="/shop-manager" element={<Navigate to="/shop" replace />} />
          <Route path="/quan-ly-shop" element={<Navigate to="/shop" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
