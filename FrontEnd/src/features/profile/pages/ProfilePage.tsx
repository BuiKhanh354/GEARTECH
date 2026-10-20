import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, House } from '@phosphor-icons/react'
import apiClient from '../../../api/client'
import { productService } from '../../../services/productService'

// Sub-components
import ProfileSidebar from '../components/shared/ProfileSidebar'
import AdminOverviewTab from '../components/admin/AdminOverviewTab'
import AdminUsersTab from '../components/admin/AdminUsersTab'
import AdminShopsTab from '../components/admin/AdminShopsTab'
import AdminVouchersTab from '../components/admin/AdminVouchersTab'
import AdminShowroomsTab from '../components/admin/AdminShowroomsTab'
import AdminCategoriesTab from '../components/admin/AdminCategoriesTab'
import AdminBrandsTab from '../components/admin/AdminBrandsTab'
import AdminOrdersTab from '../components/admin/AdminOrdersTab'

import ShopOverviewTab from '../components/shop/ShopOverviewTab'
import ShopProductsTab from '../components/shop/ShopProductsTab'
import ShopOrdersTab from '../components/shop/ShopOrdersTab'
import ShopInventoryTab from '../components/shop/ShopInventoryTab'
import ShopSuppliersTab from '../components/shop/ShopSuppliersTab'
import ShopStorefrontDesignTab from '../components/shop/ShopStorefrontDesignTab'

import UserProfileTab from '../components/user/UserProfileTab'
import UserOrdersTab from '../components/user/UserOrdersTab'
import UserFavoritesTab from '../components/user/UserFavoritesTab'
import UserVouchersTab from '../components/user/UserVouchersTab'

type TabType = 
  | 'profile' | 'orders' | 'vouchers' | 'favorites' | 'security' 
  | 'admin-overview' | 'admin-users' | 'admin-shops' | 'admin-categories' | 'admin-brands' | 'admin-vouchers' | 'admin-showrooms' | 'admin-orders'
  | 'shop-overview' | 'shop-products' | 'shop-orders' | 'shop-inventory' | 'shop-suppliers' | 'shop-storefront'

interface ProfilePageProps {
  initialRole?: 'admin' | 'shop' | 'user'
}

export default function ProfilePage({ initialRole }: ProfilePageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem('token')

  const path = location.pathname.toLowerCase()
  const requiredRole = initialRole || (path.includes('admin') ? 'admin' : path.includes('shop') ? 'shop' : null)

  // Auth & User States: Chỉ lấy role từ dữ liệu đăng nhập thực tế của user
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // ignore
      }
    }
    return null
  })

  const [currentShop, setCurrentShop] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const role = currentUser?.role || 'user'
    if (role === 'admin') return 'admin-overview'
    if (role === 'shop') return 'shop-overview'
    return 'profile'
  })

  // Real Database Lists
  const [shopsList, setShopsList] = useState<any[]>([])
  const [dbVouchers, setDbVouchers] = useState<any[]>([])
  const [dbShowrooms, setDbShowrooms] = useState<any[]>([])
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])

  // Fetch admin resources from Backend API
  const fetchAdminData = async () => {
    try {
      const resShops = await apiClient.get('/shops')
      if (resShops.data) setShopsList(resShops.data)

      const resVouchers = await apiClient.get('/vouchers')
      if (resVouchers.data) setDbVouchers(resVouchers.data)

      const resShowrooms = await apiClient.get('/showrooms')
      if (resShowrooms.data) setDbShowrooms(resShowrooms.data)
    } catch (err) {
      console.error('Lỗi tải dữ liệu admin:', err)
    }
  }

  // Fetch shop resources from Backend API (lấy đầy đủ sản phẩm kể cả đang ẩn)
  const fetchShopData = async (shopId?: string) => {
    try {
      // 1. Thử gọi API chuyên biệt dành riêng cho chủ shop (/api/products/shop/my-products)
      try {
        const myRes = await productService.getMyProducts({ limit: 200 })
        if (myRes && Array.isArray(myRes.products)) {
          setAllProducts(myRes.products)
          return
        }
      } catch {
        // Dự phòng fallback
      }

      // 2. Fallback: Lấy danh sách sản phẩm với includeInactive=true và status=all
      const resProducts = await apiClient.get('/products', {
        params: {
          shopId: shopId || undefined,
          includeInactive: true,
          status: 'all',
          limit: 200
        }
      })
      if (resProducts.data?.products) {
        let products = resProducts.data.products
        if (shopId) {
          const shopMatched = products.filter(
            (p: any) => p.shopId && (p.shopId._id === shopId || p.shopId === shopId || String(p.shopId) === String(shopId))
          )
          if (shopMatched.length > 0) {
            products = shopMatched
          }
        }
        setAllProducts(products)
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu shop:', err)
    }
  }

  // Fetch user specific resources
  const fetchUserData = async () => {
    if (!token) return
    try {
      const resOrders = await apiClient.get('/orders')
      if (resOrders.data) setUserOrders(resOrders.data)

      const resVouchers = await apiClient.get('/vouchers')
      if (resVouchers.data) setDbVouchers(resVouchers.data)
    } catch (err) {
      console.error('Lỗi tải đơn hàng user:', err)
    }
  }

  // Initial Load & Sync profile từ Backend
  useEffect(() => {
    if (token) {
      const fetchProfile = async () => {
        try {
          const res = await apiClient.get('/auth/profile')
          const data = res.data

          if (data.user) {
            setCurrentUser(data.user)
            localStorage.setItem('user', JSON.stringify(data.user))

            if (data.user.role === 'shop') {
              setCurrentShop(data.shop || null)
              if (!path.includes('profile')) setActiveTab('shop-overview')
              fetchShopData(data.user.shopId)
            } else if (data.user.role === 'admin') {
              if (!path.includes('profile')) setActiveTab('admin-overview')
              fetchAdminData()
            } else {
              setActiveTab('profile')
              fetchUserData()
            }
          }
        } catch {
          // Token không hợp lệ hoặc hết hạn
        }
      }
      fetchProfile()
    } else {
      // Nếu chưa đăng nhập mà vào admin hoặc shop
      if (requiredRole === 'admin' || requiredRole === 'shop') {
        navigate('/login')
      }
    }
  }, [token])

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const isAdmin = currentUser?.role === 'admin'
  const isShop = currentUser?.role === 'shop'

  // ==========================================
  // KIỂM TRA PHÂN QUYỀN TRUY CẬP (ACCESS CONTROL)
  // ==========================================
  if (requiredRole === 'admin' && !isAdmin) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#ff4655] flex items-center justify-center text-4xl shadow-lg">
          🛡️
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            TỪ CHỐI TRUY CẬP (403 FORBIDDEN)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Khu vực Quản trị Admin chỉ dành riêng cho tài khoản Quản trị viên hệ thống. Tài khoản của bạn hiện tại là <b>{isShop ? 'Chủ cửa hàng' : 'Khách hàng'}</b> nên không có quyền truy cập.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/profile" className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-black uppercase tracking-wider rounded transition-all">
            Về trang cá nhân
          </Link>
          <Link to="/login" className="px-5 py-2.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white text-xs font-black uppercase tracking-wider rounded transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)]">
            Đổi sang tài khoản Admin
          </Link>
        </div>
      </div>
    )
  }

  if (requiredRole === 'shop' && !isShop) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-8 text-center space-y-5 bg-zinc-50 dark:bg-zinc-950">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center text-4xl shadow-lg">
          🏬
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-wider">
            TỪ CHỐI TRUY CẬP (403 FORBIDDEN)
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-md mx-auto leading-relaxed">
            Kênh Người Bán chỉ dành riêng cho tài khoản Chủ Gian Hàng / Đối tác doanh nghiệp. Tài khoản khách hàng hiện tại của bạn không có quyền quản lý cửa hàng.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <Link to="/profile" className="px-5 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white text-xs font-black uppercase tracking-wider rounded transition-all">
            Về trang cá nhân
          </Link>
          <Link to="/login" className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded transition-all shadow-md">
            Đăng nhập tài khoản Shop
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Header Breadcrumbs & Quick Back */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            to="/Trang-chu" 
            className="flex items-center gap-2 px-3 py-2 rounded-sm bg-zinc-100 dark:bg-zinc-900 hover:bg-[#ff4655] hover:text-white dark:hover:bg-[#ff4655] dark:hover:text-white text-zinc-700 dark:text-zinc-300 text-xs font-black uppercase tracking-wider transition-all border border-zinc-200 dark:border-zinc-800 group"
            title="Quay lại cửa hàng GearTech"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Về Cửa Hàng</span>
          </Link>
          <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block"></div>
          <div>
            <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
              <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors flex items-center gap-1">
                <House size={12} /> TRANG CHỦ
              </Link>
              <span>/</span>
              <span className="text-[#ff4655] font-black">
                {isAdmin ? 'ADMIN CONTROL CENTER' : isShop ? 'SHOP PARTNER MANAGER' : 'TÀI KHOẢN CỦA TÔI'}
              </span>
            </nav>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#ff4655]"></span>
              <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">
                {isAdmin 
                  ? '// HỆ THỐNG QUẢN TRỊ ADMIN TOÀN DIỆN' 
                  : isShop 
                    ? `// QUẢN LÝ GIAN HÀNG: ${currentShop?.name || 'GEARTECH PARTNER'}`
                    : '// TRANG CÁ NHÂN & ĐƠN MUA CỦA KHÁCH HÀNG'}
              </h2>
            </div>
          </div>
        </div>

        {/* Huy hiệu vai trò xác thực thực tế từ CSDL */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">VAI TRÒ:</span>
          <span className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider border shadow-sm ${
            isAdmin 
              ? 'bg-red-500/10 text-[#ff4655] border-red-500/30' 
              : isShop 
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' 
                : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
          }`}>
            {isAdmin ? ' Quản trị viên (Admin)' : isShop ? ' Chủ cửa hàng (Shop)' : ' Khách hàng (Customer)'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <ProfileSidebar 
          currentUser={currentUser} 
          currentShop={currentShop} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={handleLogout} 
        />

        {/* Tab Content Rendering */}
        <div className="lg:col-span-8">
          {/* 1. ADMIN TABS (Chỉ render khi là Admin thật) */}
          {isAdmin && (
            <>
              {activeTab === 'admin-overview' && <AdminOverviewTab shopsList={shopsList} dbVouchers={dbVouchers} dbShowrooms={dbShowrooms} />}
              {activeTab === 'admin-users' && <AdminUsersTab />}
              {activeTab === 'admin-shops' && <AdminShopsTab token={token} shopsList={shopsList} onRefresh={fetchAdminData} />}
              {activeTab === 'admin-categories' && <AdminCategoriesTab />}
              {activeTab === 'admin-brands' && <AdminBrandsTab />}
              {activeTab === 'admin-vouchers' && <AdminVouchersTab token={token} dbVouchers={dbVouchers} onRefresh={fetchAdminData} />}
              {activeTab === 'admin-showrooms' && <AdminShowroomsTab token={token} dbShowrooms={dbShowrooms} onRefresh={fetchAdminData} />}
              {activeTab === 'admin-orders' && <AdminOrdersTab />}
            </>
          )}

          {/* 2. SHOP TABS (Chỉ render khi là Shop và đang ở tab shop-*) */}
          {isShop && activeTab.startsWith('shop-') && (
            <>
              {activeTab === 'shop-overview' && <ShopOverviewTab currentUser={currentUser} currentShop={currentShop} allProducts={allProducts} />}
              {activeTab === 'shop-products' && <ShopProductsTab token={token} allProducts={allProducts} onRefresh={() => fetchShopData(currentUser?.shopId)} />}
              {activeTab === 'shop-orders' && <ShopOrdersTab />}
              {activeTab === 'shop-inventory' && <ShopInventoryTab allProducts={allProducts} />}
              {activeTab === 'shop-suppliers' && <ShopSuppliersTab />}
              {activeTab === 'shop-storefront' && <ShopStorefrontDesignTab currentShop={currentShop} allProducts={allProducts} />}
            </>
          )}

          {/* 3. USER / BUYER TABS (Render cho Khách hàng, hoặc Chủ Shop khi chuyển sang chế độ mua hàng) */}
          {!isAdmin && (!isShop || !activeTab.startsWith('shop-')) && (
            <>
              {activeTab === 'profile' && <UserProfileTab token={token} currentUser={currentUser} onRefresh={setCurrentUser} />}
              {activeTab === 'orders' && <UserOrdersTab userOrders={userOrders} onRefreshOrders={fetchUserData} />}
              {activeTab === 'favorites' && <UserFavoritesTab />}
              {activeTab === 'vouchers' && <UserVouchersTab dbVouchers={dbVouchers} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}