import React, { useState, useEffect, useCallback, Component, type ErrorInfo, type ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  SquaresFour, ChartLineUp, Users, Storefront, Package, TreeStructure,
  Tag, Receipt, CaretLeft, List, X, SignOut, User,
  ArrowSquareOut, Gear, Browsers, Wallet, Wrench
} from '@phosphor-icons/react'
import apiClient from '../../../api/client'

// Cây điều hướng Admin Centre — chỉ gồm các chức năng có thật trong hệ thống
interface NavItem {
  to: string
  end: boolean
  icon: any
  label: string
  dot?: string
  matchPrefix?: string
  matchExact?: boolean
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: 'Tổng quan',
    items: [
      { to: '/admin', end: true, icon: SquaresFour, label: 'Dashboard' },
      { to: '/admin/analytics', end: true, icon: ChartLineUp, label: 'Báo cáo & thống kê' }
    ]
  },
  {
    label: 'Quản lý người dùng',
    items: [
      { to: '/admin/users', end: true, icon: Users, label: 'Danh sách tài khoản', matchExact: true },
      { to: '/admin/users?role=user', end: false, icon: null, dot: 'bg-blue-400', label: 'Khách hàng', matchPrefix: '/admin/users?role=user' },
      { to: '/admin/users?role=shop', end: false, icon: null, dot: 'bg-violet-400', label: 'Chủ shop', matchPrefix: '/admin/users?role=shop' }
    ]
  },
  {
    label: 'Quản lý cửa hàng',
    items: [
      { to: '/admin/shops', end: true, icon: Storefront, label: 'Tất cả cửa hàng', matchExact: true },
      { to: '/admin/shops?status=pending', end: false, icon: null, dot: 'bg-amber-400', label: 'Chờ xét duyệt', matchPrefix: '/admin/shops?status=pending' },
      { to: '/admin/shops?status=active', end: false, icon: null, dot: 'bg-emerald-400', label: 'Đang hoạt động', matchPrefix: '/admin/shops?status=active' },
      { to: '/admin/shops?status=locked', end: false, icon: null, dot: 'bg-rose-400', label: 'Bị khóa', matchPrefix: '/admin/shops?status=locked' }
    ]
  },
  {
    label: 'Quản lý sản phẩm',
    items: [
      { to: '/admin/products', end: true, icon: Package, label: 'Sản phẩm toàn sàn', matchExact: true },
      { to: '/admin/products?status=active', end: false, icon: null, dot: 'bg-emerald-400', label: 'Đang bán', matchPrefix: '/admin/products?status=active' },
      { to: '/admin/products?status=hidden', end: false, icon: null, dot: 'bg-amber-400', label: 'Bị ẩn / ngừng bán', matchPrefix: '/admin/products?status=hidden' }
    ]
  },
  {
    label: 'Danh mục & thương hiệu',
    items: [
      { to: '/admin/categories', end: true, icon: TreeStructure, label: 'Danh mục (cha/con)' },
      { to: '/admin/brands', end: true, icon: Tag, label: 'Thương hiệu' }
    ]
  },
  {
    label: 'Quản lý đơn hàng',
    items: [
      { to: '/admin/orders', end: true, icon: Receipt, label: 'Tất cả đơn hàng' }
    ]
  },
  {
    label: 'Tài chính & Giải ngân',
    items: [
      { to: '/admin/finance', end: true, icon: Wallet, label: 'Tài chính & Phí sàn' }
    ]
  },
  {
    label: 'Dịch vụ độc quyền sàn',
    items: [
      { to: '/admin/care', end: true, icon: Wrench, label: 'GearTech Care' }
    ]
  },
  {
    label: 'Khuyến mãi',
    items: [
      { to: '/admin/vouchers', end: true, icon: Tag, label: 'Voucher toàn sàn' }
    ]
  },
  {
    label: 'Giao diện & Nội dung',
    items: [
      { to: '/admin/homepage', end: true, icon: Browsers, label: 'Bố cục trang chủ' }
    ]
  }
]

function breadcrumbFor(pathname: string): string {
  const map: Record<string, string> = {
    '/admin': 'Dashboard',
    '/admin/analytics': 'Báo cáo & thống kê',
    '/admin/users': 'Quản lý người dùng',
    '/admin/shops': 'Quản lý cửa hàng',
    '/admin/products': 'Quản lý sản phẩm',
    '/admin/categories': 'Danh mục',
    '/admin/brands': 'Thương hiệu',
    '/admin/orders': 'Quản lý đơn hàng',
    '/admin/finance': 'Quản lý tài chính sàn',
    '/admin/care': 'Dịch vụ GearTech Care',
    '/admin/vouchers': 'Khuyến mãi',
    '/admin/homepage': 'Quản lý bố cục trang chủ'
  }
  return map[pathname] || 'Quản trị hệ thống'
}

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class AdminErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Admin Error Boundary caught error]:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-2xl text-center space-y-4 my-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl">
            ⚠️
          </div>
          <h3 className="text-base font-black text-red-500 uppercase tracking-wider">
            ĐÃ XẢY RA LỖI KHI TẢI KHU VỰC NÀY
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            {this.state.error?.message || 'Có lỗi xảy ra trong quá trình kết xuất dữ liệu.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
          >
            Thử tải lại
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export type AdminContext = {
  admin: { name: string; email: string } | null
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  const [authChecked, setAuthChecked] = useState(false)
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

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
        // Phân quyền: chỉ Admin vào được Admin Centre (backend cũng chặn mọi API quản trị)
        if (user.role !== 'admin') {
          navigate('/profile')
          return
        }
        setAdmin({ name: user.name, email: user.email })
        setAuthChecked(true)
      } catch {
        localStorage.removeItem('token')
        navigate('/login')
      }
    }
    verify()
  }, [navigate])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname, location.search])

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout')
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }, [navigate])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-[3px] border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Đang tải Admin Centre...</p>
        </div>
      </div>
    )
  }

  const sidebarContent = (collapsed: boolean) => (
    <>
      <div className={`h-14 flex items-center border-b border-white/10 px-4 shrink-0 ${collapsed ? 'justify-center px-0' : ''}`}>
        <Link to="/Trang-chu" className="flex items-center gap-2.5 min-w-0">
          <span className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-black text-sm shrink-0">G</span>
          {!collapsed && (
            <span className="truncate">
              <span className="block text-xs font-black text-white uppercase tracking-wider leading-tight">GearTech</span>
              <span className="block text-[9px] font-bold text-blue-400 uppercase tracking-widest leading-tight">Admin Centre</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 admin-nav">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{group.label}</p>
            )}
            {collapsed && <div className="mx-3 mb-2 border-t border-white/10" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon as React.ComponentType<any>
                const fullPath = location.pathname + location.search
                const isActive = 'matchPrefix' in item && item.matchPrefix
                  ? fullPath === item.matchPrefix
                  : 'matchExact' in item && item.matchExact
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
                        ? 'bg-[#2563EB] text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    {item.dot ? (
                      <span className={`w-2 h-2 rounded-full shrink-0 ml-[3px] mr-[13px] ${item.dot}`} />
                    ) : (
                      <Icon size={17} weight={isActive ? 'fill' : 'regular'} className={isActive ? 'text-white' : 'text-slate-500'} />
                    )}
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10 shrink-0">
        <Link
          to="/Trang-chu"
          className={`flex items-center gap-2.5 rounded-lg bg-white/5 hover:bg-white/10 px-3 py-2.5 text-slate-300 transition-colors ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Xem website công khai' : undefined}
        >
          <ArrowSquareOut size={16} className="shrink-0" />
          {!collapsed && <span className="text-[11px] font-bold">Xem website công khai</span>}
        </Link>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800">
      {/* Sidebar desktop (nền navy #101827, thu gọn được) */}
      <aside
        className={`hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col bg-[#101827] transition-all duration-200 ${
          collapsed ? 'w-[68px]' : 'w-60'
        }`}
      >
        {sidebarContent(collapsed)}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm flex items-center justify-center text-slate-400 hover:text-[#2563EB] hover:border-blue-200 transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
        >
          <CaretLeft size={12} weight="bold" className={`transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Drawer mobile */}
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
              className="fixed inset-y-0 left-0 w-64 z-50 flex flex-col bg-[#101827] border-r border-white/10 lg:hidden"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-3.5 right-3 p-1 rounded text-slate-400 hover:text-white"
                aria-label="Đóng menu"
              >
                <X size={18} />
              </button>
              {sidebarContent(false)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className={`sticky top-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4 lg:px-6 ${collapsed ? 'lg:pl-[80px]' : 'lg:pl-64'} transition-all duration-200`}>
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100"
          aria-label="Mở menu"
        >
          <List size={20} />
        </button>

        <div className="min-w-0 flex items-center gap-1.5 text-xs">
          <Link to="/admin" className="font-semibold text-slate-500 hover:text-[#2563EB] transition-colors hidden sm:inline">Admin</Link>
          <span className="text-slate-300 hidden sm:inline">/</span>
          <span className="font-bold text-slate-800 truncate">{breadcrumbFor(location.pathname)}</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#2563EB] text-[10px] font-bold uppercase tracking-wide">
            <Gear size={12} weight="fill" /> Quản trị viên
          </span>

          <div className="relative">
            <button
              onClick={() => setAccountMenuOpen(!accountMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[11px] font-black uppercase">
                {(admin?.name || 'A').slice(0, 1)}
              </span>
              <span className="hidden sm:block text-xs font-bold text-slate-700 max-w-[120px] truncate">{admin?.name}</span>
            </button>
            {accountMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-slate-800 truncate">{admin?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{admin?.email}</p>
                </div>
                <Link to="/profile" className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-slate-700">
                  <User size={15} className="text-slate-400" /> Trang cá nhân
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

      <main className={`${collapsed ? 'lg:pl-[68px]' : 'lg:pl-60'} transition-all duration-200`}>
        <div className="p-4 lg:p-6 max-w-[1500px] mx-auto">
          <AdminErrorBoundary>
            <Outlet context={{ admin } satisfies AdminContext} />
          </AdminErrorBoundary>
        </div>
      </main>
    </div>
  )
}
