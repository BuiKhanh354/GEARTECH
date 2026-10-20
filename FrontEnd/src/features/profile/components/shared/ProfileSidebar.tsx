import { 
  User, Receipt, Ticket, ShieldCheck, SignOut, Storefront, MapPin, ChartBar, Package, Users, FolderSimple, Tag, Heart, PaintBrush 
} from '@phosphor-icons/react'

type TabType = 
  | 'profile' | 'orders' | 'vouchers' | 'favorites' | 'security' 
  | 'admin-overview' | 'admin-users' | 'admin-shops' | 'admin-categories' | 'admin-brands' | 'admin-vouchers' | 'admin-showrooms' | 'admin-orders'
  | 'shop-overview' | 'shop-products' | 'shop-orders' | 'shop-inventory' | 'shop-suppliers' | 'shop-storefront'

interface ProfileSidebarProps {
  currentUser: any;
  currentShop: any;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({ currentUser, currentShop: _currentShop, activeTab, setActiveTab, onLogout }: ProfileSidebarProps) {
  const isAdmin = currentUser?.role === 'admin'
  const isShop = currentUser?.role === 'shop'

  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Navigation Links */}
      <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 shadow-sm dark:shadow-xl flex flex-col space-y-1">
        
        {/* ADMIN ONLY TABS */}
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab('admin-overview')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-overview'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ChartBar size={16} /> Bảng thống kê
            </button>
            <button
              onClick={() => setActiveTab('admin-users')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-users'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Users size={16} /> Quản lý tài khoản
            </button>
            <button
              onClick={() => setActiveTab('admin-shops')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-shops'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Storefront size={16} /> Quản lý Shop Đối tác
            </button>
            <button
              onClick={() => setActiveTab('admin-categories')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-categories'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FolderSimple size={16} /> Quản lý Danh mục
            </button>
            <button
              onClick={() => setActiveTab('admin-brands')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-brands'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Tag size={16} /> Quản lý Thương hiệu
            </button>
            <button
              onClick={() => setActiveTab('admin-vouchers')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-vouchers'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Ticket size={16} /> Tạo Mã Giảm Giá
            </button>
            <button
              onClick={() => setActiveTab('admin-showrooms')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-showrooms'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <MapPin size={16} /> Tạo Showroom GPS
            </button>
            <button
              onClick={() => setActiveTab('admin-orders')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'admin-orders'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={16} /> Giám sát đơn hàng toàn sàn
            </button>
          </>
        )}

        {/* SHOP OWNER: CHUYỂN ĐỔI CHẾ ĐỘ (BÁN HÀNG vs MUA SẮM CÁ NHÂN) */}
        {isShop && (
          <div className="p-1 mb-2 bg-zinc-100 dark:bg-zinc-900 rounded-sm flex gap-1 border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setActiveTab('shop-overview')}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                activeTab.startsWith('shop-') 
                  ? 'bg-[#ff4655] text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Storefront size={13} /> Kênh Shop
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xs transition-all cursor-pointer flex items-center justify-center gap-1 ${
                !activeTab.startsWith('shop-') 
                  ? 'bg-[#ff4655] text-white shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <User size={13} /> Mua sắm
            </button>
          </div>
        )}

        {/* SHOP ONLY TABS (Hiển thị khi là Shop và đang ở tab shop-*) */}
        {isShop && activeTab.startsWith('shop-') && (
          <>
            <button
              onClick={() => setActiveTab('shop-overview')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-overview'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Storefront size={16} /> Thông tin gian hàng
            </button>
            <button
              onClick={() => setActiveTab('shop-products')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-products'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Package size={16} /> Đăng & Quản lý thiết bị
            </button>
            <button
              onClick={() => setActiveTab('shop-orders')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-orders'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={16} /> Quản lý đơn hàng của shop
            </button>
            <button
              onClick={() => setActiveTab('shop-inventory')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-inventory'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ChartBar size={16} /> Kho hàng & Biến động tồn
            </button>
            <button
              onClick={() => setActiveTab('shop-suppliers')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-suppliers'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <FolderSimple size={16} /> Đối tác & Nhà cung cấp
            </button>
            <button
              onClick={() => setActiveTab('shop-storefront')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'shop-storefront'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <PaintBrush size={16} /> Trang trí gian hàng (Storefront)
            </button>
          </>
        )}

        {/* CLIENT / BUYER TABS (Hiển thị cho Khách, hoặc cho Shop khi chuyển sang chế độ Mua sắm) */}
        {!isAdmin && (!isShop || !activeTab.startsWith('shop-')) && (
          <>
            <button
              onClick={() => setActiveTab('profile')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'profile'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <User size={16} /> Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'orders'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Receipt size={16} /> Đơn hàng của tôi
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'favorites'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Heart size={16} /> Sản phẩm yêu thích
            </button>
            <button
              onClick={() => setActiveTab('vouchers')}
              className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
                activeTab === 'vouchers'
                  ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
                  : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Ticket size={16} /> Kho Voucher ưu đãi
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('security')}
          className={`text-[10px] text-left px-4 py-3 rounded-sm font-black uppercase tracking-wider transition-all border-l-2 flex items-center gap-3.5 ${
            activeTab === 'security'
              ? 'bg-[#ff4655]/5 text-[#ff4655] border-l-[#ff4655]'
              : 'border-l-transparent text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck size={16} /> Bảo mật tài khoản
        </button>

        <hr className="border-zinc-100 dark:border-zinc-900/60 my-2" />

        <button
          onClick={onLogout}
          className="text-[10px] text-left px-4 py-3 rounded-2xl font-black uppercase tracking-wider text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-3.5 cursor-pointer"
        >
          <SignOut size={16} /> Đăng xuất hệ thống
        </button>
      </div>
    </div>
  )
}
