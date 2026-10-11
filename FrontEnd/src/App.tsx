import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ProductListPage from './pages/ProductListPage'
import ProductDetailPage from './pages/ProductDetailPage'
import StorePage from './pages/StorePage'
import AboutPage from './pages/AboutPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
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
          <Route path="/Cua-hang" element={<StorePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<ProfilePage />} />
          <Route path="/settings" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  )
}

export default App