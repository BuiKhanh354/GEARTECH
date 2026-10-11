import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'

// Components
import ProfileSidebar from '../components/shared/ProfileSidebar'
import SecurityTab from '../components/shared/SecurityTab'
import AdminOverviewTab from '../components/admin/AdminOverviewTab'
import AdminShopsTab from '../components/admin/AdminShopsTab'
import AdminVouchersTab from '../components/admin/AdminVouchersTab'
import AdminShowroomsTab from '../components/admin/AdminShowroomsTab'
import ShopOverviewTab from '../components/shop/ShopOverviewTab'
import ShopProductsTab from '../components/shop/ShopProductsTab'
import UserProfileTab from '../components/user/UserProfileTab'
import UserOrdersTab from '../components/user/UserOrdersTab'
import UserVouchersTab from '../components/user/UserVouchersTab'

type TabType = 
  | 'profile' | 'orders' | 'vouchers' | 'security' 
  | 'admin-overview' | 'admin-shops' | 'admin-vouchers' | 'admin-showrooms' 
  | 'shop-overview' | 'shop-products'

export default function ProfilePage() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // Auth & User States
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentShop, setCurrentShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  // Real Database Lists
  const [shopsList, setShopsList] = useState<any[]>([])
  const [dbVouchers, setDbVouchers] = useState<any[]>([])
  const [dbShowrooms, setDbShowrooms] = useState<any[]>([])
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])

  // Fetch admin resources
  const fetchAdminData = async () => {
    try {
      const resShops = await fetch('http://localhost:5000/api/shops')
      if (resShops.ok) setShopsList(await resShops.json())

      const resVouchers = await fetch('http://localhost:5000/api/vouchers')
      if (resVouchers.ok) setDbVouchers(await resVouchers.json())

      const resShowrooms = await fetch('http://localhost:5000/api/showrooms')
      if (resShowrooms.ok) setDbShowrooms(await resShowrooms.json())
    } catch (err) {
      console.error('Lỗi tải dữ liệu quản trị:', err)
    }
  }

  // Fetch shop resources
  const fetchShopData = async (shopId: string) => {
    try {
      const resProducts = await fetch('http://localhost:5000/api/products?limit=100')
      if (resProducts.ok) {
        const result = await resProducts.json()
        const filtered = result.products.filter(
          (p: any) => p.shopId && (p.shopId._id === shopId || p.shopId === shopId)
        )
        setAllProducts(filtered)
      }
    } catch (err) {
      console.error('Lỗi tải dữ liệu shop:', err)
    }
  }

  // Fetch user specific resources
  const fetchUserData = async () => {
    try {
      const resOrders = await fetch('http://localhost:5000/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (resOrders.ok) setUserOrders(await resOrders.json())

      const resVouchers = await fetch('http://localhost:5000/api/vouchers')
      if (resVouchers.ok) setDbVouchers(await resVouchers.json())
    } catch (err) {
      console.error('Lỗi tải dữ liệu người dùng:', err)
    }
  }

  // 1. Fetch Profile and Initial Data
  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)

        setCurrentUser(data.user)

        if (data.user.role === 'shop') {
          setCurrentShop(data.shop)
          setActiveTab('shop-overview')
          fetchShopData(data.user.shopId)
        } else if (data.user.role === 'admin') {
          setActiveTab('admin-overview')
          fetchAdminData()
        } else {
          setActiveTab('profile')
          fetchUserData()
        }

      } catch (err: any) {
        console.error('Lỗi lấy hồ sơ:', err.message)
        localStorage.clear()
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [token])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/Trang-chu'
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <span className="text-xs font-black uppercase tracking-[0.25em] text-[#ff4655] animate-pulse">
          // ĐANG ĐỒNG BỘ DỮ LIỆU...
        </span>
      </div>
    )
  }

  const isAdmin = currentUser?.role === 'admin'
  const isShop = currentUser?.role === 'shop'

  return (
    <div className="w-full max-w-full px-6 lg:px-12 py-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-300 min-h-screen bg-grid-pattern pb-12 transition-colors duration-200">
      
      {/* Header Breadcrumbs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-4 mb-8">
        <nav className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mb-2">
          <Link to="/Trang-chu" className="hover:text-zinc-900 dark:hover:text-white transition-colors">TRANG CHỦ</Link>
          <span>/</span>
          <span className="text-[#ff4655] font-black">
            {isAdmin ? 'ADMIN CONTROL CENTER' : isShop ? 'SHOP PARTNER MANAGER' : 'TÀI KHOẢN CỦA TÔI'}
          </span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-4 bg-[#ff4655]"></span>
          <h2 className="text-sm font-black tracking-widest text-zinc-900 dark:text-white uppercase">
            {isAdmin 
              ? '// PHÂN KHU HỆ THỐNG QUẢN TRỊ ADMIN' 
              : isShop 
                ? `// QUẢN LÝ GIAN HÀNG DOANH NGHIỆP: ${currentShop?.name}`
                : '// TRANG CÁ NHÂN & ĐƠN MUA'}
          </h2>
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

        {/* Right Column: Tab View Details (8 cols) */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            
            {/* ADMIN */}
            {activeTab === 'admin-overview' && <AdminOverviewTab shopsList={shopsList} dbVouchers={dbVouchers} dbShowrooms={dbShowrooms} />}
            {activeTab === 'admin-shops' && <AdminShopsTab token={token} shopsList={shopsList} onRefresh={fetchAdminData} />}
            {activeTab === 'admin-vouchers' && <AdminVouchersTab token={token} dbVouchers={dbVouchers} onRefresh={fetchAdminData} />}
            {activeTab === 'admin-showrooms' && <AdminShowroomsTab token={token} dbShowrooms={dbShowrooms} onRefresh={fetchAdminData} />}

            {/* SHOP */}
            {activeTab === 'shop-overview' && isShop && <ShopOverviewTab currentUser={currentUser} currentShop={currentShop} allProducts={allProducts} />}
            {activeTab === 'shop-products' && isShop && <ShopProductsTab token={token} allProducts={allProducts} onRefresh={() => fetchShopData(currentUser.shopId)} />}

            {/* USER */}
            {activeTab === 'profile' && !isAdmin && !isShop && <UserProfileTab token={token} currentUser={currentUser} onRefresh={setCurrentUser} />}
            {activeTab === 'orders' && !isAdmin && !isShop && <UserOrdersTab userOrders={userOrders} />}
            {activeTab === 'vouchers' && !isAdmin && !isShop && <UserVouchersTab dbVouchers={dbVouchers} />}

            {/* SHARED */}
            {activeTab === 'security' && <SecurityTab />}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}