import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Storefront, CheckCircle, WarningCircle, FloppyDisk, PencilSimple, Clock, Lock, XCircle } from '@phosphor-icons/react'
import { shopService, type ShopItem } from '../../../../services/shopService'

interface ShopOverviewTabProps {
  currentUser: any;
  currentShop: any;
  allProducts: any[];
}

export default function ShopOverviewTab({ currentUser, currentShop, allProducts }: ShopOverviewTabProps) {
  const [shop, setShop] = useState<ShopItem | null>(currentShop)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    logo: '🏬',
    bgClass: 'from-zinc-900 to-black'
  })

  useEffect(() => {
    if (currentShop) {
      setShop(currentShop)
      setFormData({
        name: currentShop.name || currentShop.shop_name || '',
        description: currentShop.description || '',
        category: currentShop.category || '',
        phone: currentShop.phone || '',
        email: currentShop.email || '',
        address: currentShop.address || '',
        logo: currentShop.logo || '🏬',
        bgClass: currentShop.bgClass || 'from-zinc-900 to-black'
      })
    }
  }, [currentShop])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const shopId = shop?._id || shop?.id || currentUser?.shopId
    if (!shopId) return

    setLoading(true)
    setAlert(null)
    try {
      const res = await shopService.updateShop(shopId, formData)
      setAlert({ type: 'success', message: res.message || 'Cập nhật thông tin cửa hàng thành công!' })
      setShop(res.shop)
      setIsEditing(false)
    } catch (err: any) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Có lỗi xảy ra khi cập nhật gian hàng.' })
    } finally {
      setLoading(false)
    }
  }

  const isPending = shop?.status === 'pending'
  const isLocked = shop?.status === 'locked'
  const isRejected = shop?.status === 'rejected'
  const isActive = shop?.status === 'active' || !shop?.status

  return (
    <motion.div
      key="shop-overview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex justify-between items-center">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Storefront size={18} className="text-[#ff4655]" />
            QUẢN LÝ THÔNG TIN GIAN HÀNG DOANH NGHIỆP
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Chủ shop cập nhật hồ sơ, thông tin liên hệ và hình ảnh đại diện thương hiệu
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-900 hover:text-[#ff4655] border border-zinc-200 dark:border-zinc-800 transition-colors cursor-pointer"
        >
          <PencilSimple size={14} />
          {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
        </button>
      </div>

      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3.5 rounded text-xs font-bold flex items-center justify-between ${
              alert.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-red-500/10 text-[#ff4655] border border-red-500/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {alert.type === 'success' ? <CheckCircle size={16} weight="fill" /> : <WarningCircle size={16} weight="fill" />}
              <span>{alert.message}</span>
            </div>
            <button onClick={() => setAlert(null)} className="text-[10px] uppercase underline ml-3">Đóng</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shop Status Banner */}
      {isPending && (
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 flex items-center gap-3">
          <Clock size={24} weight="fill" className="shrink-0" />
          <div className="text-xs">
            <h5 className="font-black uppercase">Gian hàng đang chờ Admin xét duyệt</h5>
            <p className="text-[11px] text-amber-500/80 mt-0.5">
              Yêu cầu mở gian hàng của bạn đang được ban quản trị kiểm tra. Bạn sẽ có thể đăng bán sản phẩm ngay khi gian hàng được kích hoạt.
            </p>
          </div>
        </div>
      )}

      {isLocked && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 flex items-center gap-3">
          <Lock size={24} weight="fill" className="shrink-0" />
          <div className="text-xs">
            <h5 className="font-black uppercase">Gian hàng đang bị tạm khóa</h5>
            <p className="text-[11px] text-red-400 mt-0.5">
              Cửa hàng của bạn đã bị Quản trị viên khóa do vi phạm hoặc bảo trì. Mọi sản phẩm tạm ngừng hiển thị với khách hàng.
            </p>
          </div>
        </div>
      )}

      {isRejected && (
        <div className="p-4 rounded-lg bg-zinc-500/10 border border-zinc-500/30 text-zinc-400 flex items-center gap-3">
          <XCircle size={24} weight="fill" className="shrink-0 text-red-500" />
          <div className="text-xs">
            <h5 className="font-black uppercase text-red-500">Yêu cầu mở gian hàng bị từ chối</h5>
            {shop?.rejectReason && (
              <p className="text-[11px] text-zinc-300 mt-0.5">
                Lý do: <strong>{shop.rejectReason}</strong>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Shop Detail Hero Presentation */}
      <div className={`p-6 rounded-lg bg-gradient-to-r ${shop?.bgClass || 'from-zinc-900 to-black'} text-white space-y-4 shadow-xl border border-zinc-800`}>
        <div className="flex items-center gap-4">
          <span className="w-16 h-16 rounded-md bg-white/10 backdrop-blur-md text-4xl flex items-center justify-center border border-white/20 shadow-inner">
            {shop?.logo || '🏬'}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-black uppercase tracking-wider leading-none">
                {shop?.name || shop?.shop_name || 'TÊN GIAN HÀNG'}
              </h4>
              {isActive && (
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Đã duyệt & Hoạt động
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-300 font-medium mt-1">{shop?.category || 'Phân phối thiết bị'}</p>
            {shop?.description && (
              <p className="text-[11px] text-zinc-400 italic mt-1 line-clamp-1">{shop.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-center">
          <div>
            <span className="text-[9px] text-white/50 block uppercase tracking-wider">ĐÁNH GIÁ SHOP</span>
            <span className="text-xs font-black text-amber-400 mt-1 block">⭐ {shop?.rating || 5.0} / 5.0</span>
          </div>
          <div>
            <span className="text-[9px] text-white/50 block uppercase tracking-wider">NGƯỜI THEO DÕI</span>
            <span className="text-xs font-black mt-1 block">{shop?.followers || '0'}</span>
          </div>
          <div>
            <span className="text-[9px] text-white/50 block uppercase tracking-wider">THIẾT BỊ ĐĂNG BÁN</span>
            <span className="text-xs font-black text-yellow-500 mt-1 block">{allProducts.length} SẢN PHẨM</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <form onSubmit={handleUpdate} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
          <h4 className="text-xs font-black text-[#ff4655] uppercase tracking-wider flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <PencilSimple size={16} /> CẬP NHẬT THÔNG TIN CỬA HÀNG
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Tên cửa hàng</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Emoji / Logo</label>
              <input
                type="text"
                required
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Mô tả giới thiệu cửa hàng</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Giới thiệu về thế mạnh sản phẩm, chính sách bảo hành của shop..."
                className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Phân khúc sản phẩm</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Số điện thoại liên hệ</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Email cửa hàng</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Địa chỉ trụ sở</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-bold uppercase rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-black uppercase rounded bg-[#ff4655] hover:bg-[#e03d4b] text-white flex items-center gap-1.5 shadow-md shadow-[#ff4655]/20"
            >
              <FloppyDisk size={14} weight="bold" />
              {loading ? 'ĐANG LƯU...' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  )
}
