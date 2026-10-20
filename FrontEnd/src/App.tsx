import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StorePage from './pages/StorePage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import CheckoutPage from './pages/CheckoutPage'
import CartPage from './pages/CartPage'
import AdminPage from './pages/AdminPage'
import ShopManagerPage from './pages/ShopManagerPage'
import ShopDetailPage from './pages/ShopDetailPage'
import MainLayout from './layouts/Mainlayout'

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
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
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/shop" element={<ShopManagerPage />} />
          <Route path="/shop-manager" element={<ShopManagerPage />} />
          <Route path="/quan-ly-shop" element={<ShopManagerPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App