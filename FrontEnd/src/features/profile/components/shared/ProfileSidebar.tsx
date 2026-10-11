import { 
  User, Receipt, Ticket, ShieldCheck, SignOut, Storefront, MapPin, ChartBar, Package, Coins 
} from '@phosphor-icons/react'

type TabType = 
  | 'profile' | 'orders' | 'vouchers' | 'security' 
  | 'admin-overview' | 'admin-shops' | 'admin-vouchers' | 'admin-showrooms' 
  | 'shop-overview' | 'shop-products'

interface ProfileSidebarProps {
  currentUser: any;
  currentShop: any;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
}

export default function ProfileSidebar({ currentUser, currentShop, activeTab, setActiveTab, onLogout }: ProfileSidebarProps) {
  const isAdmin = currentUser?.role === 'admin'
  const isShop = currentUser?.role === 'shop'

  return (
    <div className="lg:col-span-4 space-y-4">
      {/* User profile Summary Card */}
      <div className="bg-white dark:bg-zinc-950/60 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl relative overflow-hidden text-center flex flex-col items-center">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff4655]"></div>
        
        <div className="relative group">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
            alt="Avatar"
            className="w-20 h-20 rounded-md object-cover border-2 border-zinc-200 dark:border-zinc-800 group-hover:border-[#ff4655] transition-all duration-350 shadow-md"
          />
          <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#ff4655] text-white rounded-md flex items-center justify-center text-xs shadow-md border border-[#ff4655]/40 select-none">
            {isAdmin ? '🛡️' : isShop ? '🏬' : '👑'}
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider">
            {currentUser?.name}
          </h3>
          <span className="inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-[#ff4655]">
            {isAdmin 
              ? 'HỆ THỐNG ADMIN' 
              : isShop 
                ? `DOANH NGHIỆP: ${currentShop?.name || currentUser?.name}`
                : `${currentUser?.memberRank || 'THƯỜNG'} MEMBER`}
          </span>
          <p className="text-[9px] text-zinc-450 dark:text-zinc-550 font-semibold tracking-wide pt-1">{currentUser?.email}</p>
        </div>

        {/* Member Points (only for users) */}
        {!isAdmin && !isShop && (
          <div className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-850 rounded-sm p-4 mt-5 text-left space-y-3">
            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1"><Coins size={14} className="text-yellow-500" /> Điểm tích lũy:</span>
              <span className="text-yellow-500 font-extrabold text-glow">{currentUser?.points || 0} PTS</span>
            </div>
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-none overflow-hidden">
                <div 
                  className="h-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]" 
                  style={{ width: `${Math.min(((currentUser?.points || 0) / 10000) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[8px] font-mono text-zinc-400 dark:text-zinc-650 tracking-wider">
                <span>{currentUser?.memberRank || 'THƯỜNG'}</span>
                <span className="text-yellow-500/70">KIM CƯƠNG (10,000 PTS)</span>
              </div>
            </div>
          </div>
        )}
      </div>

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
          </>
        )}

        {/* SHOP OWNER ONLY TABS */}
        {isShop && (
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
          </>
        )}

        {/* CLIENT ONLY TABS */}
        {!isAdmin && !isShop && (
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
