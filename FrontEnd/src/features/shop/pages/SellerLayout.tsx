import { useState, useEffect, useCallback } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Storefront, Receipt, Package, SquaresFour, CaretDown, CaretLeft, List, X,
  ArrowSquareOut, Bell, SignOut, User, Buildings, ChartLineUp, Tag, Wrench,
  Barbell, CurrencyDollar
} from '@phosphor-icons/react'
import apiClient from '../../../api/client'

interface SellerShop {
  _id: string
  name: string
  status: string
  logo?: string
}

// Định nghĩa cây điều hướng Seller Centre (chỉ gồm chức năng backend đang hỗ trợ)
// Các mục lọc trạng thái dùng dot màu thay icon để phân biệt nhẹ nhàng
const NAV_GROUPS = [
  {
    label: 'Tổng quan',
    items: [{ to: '/shop', end: true, icon: SquaresFour, label: 'Tổng quan shop' }]
  },
  {
    label: 'Quản lý đơn hàng',
    items: [
      { to: '/shop/orders', end: true, icon: Receipt, label: 'Tất cả đơn hàng' },
      { to: '/shop/orders?status=pending', end: false, icon: null, dot: 'bg-amber-400', label: 'Chờ xác nhận', matchPrefix: '/shop/orders?status=pending' },
      { to: '/shop/orders?status=shipping', end: false, icon: null, dot: 'bg-blue-400', label: 'Đang giao', matchPrefix: '/shop/orders?status=shipping' },
      { to: '/shop/orders?status=completed', end: false, icon: null, dot: 'bg-emerald-400', label: 'Hoàn thành', matchPrefix: '/shop/orders?status=completed' },
      { to: '/shop/orders?status=cancelled', end: false, icon: null, dot: 'bg-rose-400', label: 'Đã hủy', matchPrefix: '/shop/orders?status=cancelled' }
    ]
  },
  {
    label: 'Quản lý sản phẩm',
    items: [
      { to: '/shop/products', end: true, icon: Package, label: 'Tất cả sản phẩm' },
      { to: '/shop/products?status=active', end: false, icon: null, dot: 'bg-emerald-400', label: 'Đang bán', matchPrefix: '/shop/products?status=active' },
      { to: '/shop/products?status=out_of_stock', end: false, icon: null, dot: 'bg-rose-400', label: 'Hết hàng', matchPrefix: '/shop/products?status=out_of_stock' },
      { to: '/shop/products?status=inactive', end: false, icon: null, dot: 'bg-slate-300', label: 'Ngừng bán', matchPrefix: '/shop/products?status=inactive' }
    ]
  },
  {
    label: 'Quản lý kho',
    items: [
      { to: '/shop/inventory', end: true, icon: Barbell, label: 'Tồn kho & nhập hàng' },
      { to: '/shop/suppliers', end: true, icon: CurrencyDollar, label: 'Nhà cung cấp' }
    ]
  },
  {
    label: 'Marketing',
    items: [{ to: '/shop/vouchers', end: true, icon: Tag, label: 'Voucher của shop' }]
  },
  {
    label: 'Phân tích kinh doanh',
    items: [{ to: '/shop/analytics', end: true, icon: ChartLineUp, label: 'Doanh thu & hiệu suất' }]
  },
  {
    label: 'Quản lý gian hàng',
    items: [{ to: '/shop/storefront', end: true, icon: Wrench, label: 'Tùy chỉnh giao diện' }]
  }
]

// Breadcrumb theo route
function breadcrumbFor(pathname: string): string {
  const map: Record<string, string> = {
    '/shop': 'Tổng quan shop',
    '/shop/orders': 'Quản lý đơn hàng',
    '/shop/products': 'Quản lý sản phẩm',
    '/shop/inventory': 'Quản lý kho',
    '/shop/suppliers': 'Nhà cung cấp',
    '/shop/vouchers': 'Marketing',
    '/shop/analytics': 'Phân tích kinh doanh',
    '/shop/storefront': 'Tùy chỉnh giao diện'
  }
  return map[pathname] || 'Kênh Người Bán'
}

export type SellerContext = {
  shop: SellerShop | null
  refreshShop: () => void
}

export default function SellerLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [shop, setShop] = useState<SellerShop | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // drawer mobile
  const [collapsed, setCollapsed] = useState(false) // thu gọn desktop
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [noticesOpen, setNoticesOpen] = useState(false)

  const loadShop = useCallback(async () => {
    try {
      const res = await apiClient.get('/shops/my-shop')
      setShop(res.data.shop || null)
    } catch {
      setShop(null)
    }
  }, [])

  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }
      try {
        const res = await apiClient.get('/auth/profile')
        const user = res.data.user
        if (user.role !== 'shop' && user.role !== 'admin') {
          // Không phải chủ shop -> về trang cá nhân (phân quyền chặn ở đây và cả backend)
          navigate('/profile')
          return
        }
        setCurrentUser(user)
        await loadShop()
        setAuthChecked(true)
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }
    verify()
  }, [navigate, loadShop])

  // Đóng drawer khi đổi trang
  useEffect(() => {
    setSidebarOpen(false)
    setNoticesOpen(false)
  }, [location.pathname, location.search])

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

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang tải Kênh Người Bán...</p>
        </div>
      </div>
    )
  }

  const sidebarContent = (collapsed: boolean) => (
    <>
      {/* Logo */}
      <div className={`h-14 flex items-center border-b border-slate-100 px-4 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <Link to="/Trang-chu" className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">G</span>
          {!collapsed && (
            <span className="truncate">
              <span className="block text-xs font-black text-slate-900 uppercase tracking-wider leading-tight">GearTech</span>
              <span className="block text-[9px] font-bold text-blue-600 uppercase tracking-widest leading-tight">Kênh Người Bán</span>
            </span>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.label}</p>
            )}
            {collapsed && <div className="mx-3 mb-2 border-t border-slate-100" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon as React.ComponentType<any>
                const isActive = item.matchPrefix
                  ? (location.pathname + location.search) === item.matchPrefix
                  : item.end
                    ? location.pathname === item.to && !location.search
                    : location.pathname === item.to
                return (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={item.end}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    {item.dot ? (
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-[3px] mr-[13px] ${item.dot}`} />
                    ) : (
                      <Icon size={17} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                    )}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Xem gian hàng công khai */}
      <div className="p-3 border-t border-slate-100 shrink-0">
        {shop && (
          <a
            href={`/shop/${shop._id}`}
            onClick={(e) => { e.preventDefault(); navigate(`/shop/${shop._id}`) }}
            className={`flex items-center gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 hover:bg-blue-50 px-3 py-2.5 text-blue-700 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
            title={collapsed ? 'Xem gian hàng công khai' : undefined}
          >
            <ArrowSquareOut size={16} className="shrink-0" />
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-[11px] font-bold leading-tight">Xem gian hàng</span>
                <span className="block text-[10px] text-blue-500 truncate">{shop.name}</span>
              </span>
            )}
          </a>
        )}
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ============ SIDEBAR DESKTOP (thu gọn được) ============ */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-white border-r border-slate-200 transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {sidebarContent(collapsed)}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <CaretLeft size={12} weight="bold" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* ============ SIDEBAR MOBILE DRAWER ============ */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col bg-white border-r border-slate-200 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3.5 right-3 p-1 rounded text-slate-400 hover:text-slate-700"
                aria-label="Đóng menu"
              >
                <X size={18} />
              </button>
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ============ HEADER ============ */}
      <header className={`sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 ${collapsed ? 'lg:pl-[80px]' : 'lg:pl-64'} transition-all duration-200`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Mở menu"
        >
          <List size={20} />
        </button>

        {/* Breadcrumb */}
        <div className="min-w-0 flex items-center gap-1.5 text-xs">
          <Link to="/shop" className="font-semibold text-slate-500 hover:text-blue-600 transition-colors hidden sm:inline">Kênh Người Bán</Link>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-bold text-slate-800 truncate">{breadcrumbFor(location.pathname)}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {/* Tên shop */}
          {shop && (
            <Link
              to={`/shop/${shop._id}`}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-colors"
              title="Xem gian hàng công khai"
            >
              <Storefront size={15} className="text-blue-600 shrink-0" />
              <span className="text-xs font-bold text-slate-700 max-w-[160px] truncate">{shop.name}</span>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${shop.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} title={shop.status === 'active' ? 'Đang hoạt động' : `Trạng thái: ${shop.status}`} />
            </Link>
          )}

          {/* Thông báo: link nhanh tới các mục cần xử lý (dữ liệu thật, không giả) */}
          <div className="relative">
            <button
              onClick={() => setNoticesOpen(!noticesOpen)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Việc cần xử lý"
            >
              <Bell size={18} />
            </button>
            {noticesOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <p className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Việc cần xử lý</p>
                <Link to="/shop/orders?status=pending" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700">
                  <Receipt size={15} className="text-amber-500" /> Đơn chờ xác nhận
                </Link>
                <Link to="/shop/inventory" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700">
                  <Package size={15} className="text-rose-500" /> Cảnh báo tồn kho
                </Link>
                <Link to="/shop/vouchers" className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700">
                  <Tag size={15} className="text-blue-500" /> Voucher sắp hết hạn
                </Link>
              </div>
            )}
          </div>

          {/* Menu tài khoản */}
          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-black uppercase">
                {(currentUser?.name || 'S').slice(0, 1)}
              </span>
              <CaretDown size={10} className="text-slate-400 hidden sm:block" />
            </button>
            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{currentUser?.email}</p>
                </div>
                {shop && (
                  <p className="px-3 py-1.5 text-[11px] text-slate-500 flex items-center gap-2">
                    <Buildings size={13} className="text-slate-400" /> {shop.name}
                  </p>
                )}
                <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700">
                  <User size={15} className="text-slate-400" /> Tài khoản của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-rose-50 text-xs font-semibold text-rose-600 cursor-pointer"
                >
                  <SignOut size={15} /> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============ NỘI DUNG ============ */}
      <main className={`${collapsed ? 'lg:pl-[68px]' : 'lg:pl-60'} transition-all duration-200`}>
        <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          <Outlet context={{ shop, refreshShop: loadShop } satisfies SellerContext} />
        </div>
      </main>
    </div>
  )
}
