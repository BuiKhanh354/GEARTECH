import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { PencilSimple, FloppyDisk, Storefront, CheckCircle, X, Plus } from '@phosphor-icons/react'
import { shopService } from '../../../../services/shopService'

interface UserProfileTabProps {
  token: string | null;
  currentUser: any;
  onRefresh: (updatedUser: any) => void;
}

export default function UserProfileTab({ token, currentUser, onRefresh }: UserProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: 'Nam',
    birthday: ''
  })

  // Trạng thái đơn xin mở gian hàng
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applying, setApplying] = useState(false)
  const [applySuccess, setApplySuccess] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [applyForm, setApplyForm] = useState({
    name: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    category: 'Gaming Hardware & Gear',
    logo: '🏬'
  })

  // Sync state when currentUser changes (e.g. initial load)
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.addresses?.find((a: any) => a.isDefault)?.detailAddress || '',
        gender: currentUser.gender || 'Nam',
        birthday: currentUser.birthday ? currentUser.birthday.split('T')[0] : ''
      })
    }
  }, [currentUser])

  const handleSaveProfile = async () => {
    setError(null)
    setSuccess(null)
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      localStorage.setItem('user', JSON.stringify(data.user))
      setIsEditing(false)
      setSuccess('Cập nhật hồ sơ tài khoản thành công!')
      onRefresh(data.user)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleApplyShop = async (e: React.FormEvent) => {
    e.preventDefault()
    setApplyError(null)
    setApplySuccess(null)
    setApplying(true)

    try {
      const res = await shopService.applyShop({
        name: applyForm.name,
        description: applyForm.description,
        phone: applyForm.phone || profileForm.phone,
        email: applyForm.email || profileForm.email,
        address: applyForm.address || profileForm.address,
        category: applyForm.category,
        logo: applyForm.logo
      })

      setApplySuccess(res.message || 'Yêu cầu mở gian hàng đã được gửi thành công!')
      setShowApplyModal(false)
      if (res.shop) {
        onRefresh({ ...currentUser, shopId: res.shop._id || res.shop.id })
      }
    } catch (err: any) {
      setApplyError(err.response?.data?.error || 'Có lỗi xảy ra khi gửi yêu cầu mở shop.')
    } finally {
      setApplying(false)
    }
  }

  return (
    <motion.div
      key="profile-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6 relative overflow-hidden"
    >
      <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-1.5 pl-1">
          THÔNG TIN CHI TIẾT TÀI KHOẢN
        </h3>
        
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#ff4655] hover:bg-[#e03d4b] text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-[#ff4655]/20 flex items-center gap-1 cursor-pointer"
          >
            <PencilSimple size={12} /> Chỉnh sửa hồ sơ
          </button>
        ) : (
          <button
            onClick={handleSaveProfile}
            disabled={submitting}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
          >
            <FloppyDisk size={12} /> {submitting ? 'ĐANG LƯU...' : 'LƯU HỒ SƠ'}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-bold">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-sm text-xs font-bold">
          ✅ {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-650 tracking-wider">HỌ VÀ TÊN</span>
          <input
            type="text"
            disabled={!isEditing}
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] disabled:opacity-70 uppercase"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">ĐỊA CHỈ EMAIL</span>
          <input
            type="email"
            disabled
            value={profileForm.email}
            className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 focus:outline-none disabled:opacity-70"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">SỐ ĐIỆN THOẠI</span>
          <input
            type="text"
            disabled={!isEditing}
            value={profileForm.phone}
            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
            className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] disabled:opacity-70"
          />
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIỚI TÍNH</span>
          <select
            disabled={!isEditing}
            value={profileForm.gender}
            onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
            className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] disabled:opacity-70 uppercase"
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
        <div className="relative md:col-span-2">
          <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">ĐỊA CHỈ GIAO HÀNG MẶC ĐỊNH</span>
          <input
            type="text"
            disabled={!isEditing}
            value={profileForm.address}
            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
            className="w-full text-xs font-semibold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-zinc-50 dark:bg-zinc-900/40 text-zinc-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] disabled:opacity-70 uppercase"
          />
        </div>
      </div>

      {/* Additional Privileges */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 space-y-4">
        <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-550 uppercase tracking-widest pl-1">
          ĐẶC QUYỀN THÀNH VIÊN GEARTECH:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-2">
            <span className="w-7 h-7 rounded bg-[#ff4655]/10 text-[#ff4655] flex items-center justify-center text-xs">🚀</span>
            <h5 className="text-[9px] font-black uppercase text-zinc-900 dark:text-white tracking-wider">FreeShip Toàn Quốc</h5>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">Áp dụng cho mọi đơn hàng linh kiện và gear chiến đấu.</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-2">
            <span className="w-7 h-7 rounded bg-yellow-400/10 text-yellow-500 flex items-center justify-center text-xs">🎁</span>
            <h5 className="text-[9px] font-black uppercase text-zinc-900 dark:text-white tracking-wider">Voucher Sinh Nhật</h5>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">Nhận voucher tri ân đặc quyền dịp sinh nhật hàng năm.</p>
          </div>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-2">
            <span className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">⚙️</span>
            <h5 className="text-[9px] font-black uppercase text-zinc-900 dark:text-white tracking-wider">Hỗ trợ kỹ thuật</h5>
            <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">Miễn phí lắp đặt, vệ sinh phần cứng trọn đời thiết bị.</p>
          </div>
        </div>
      </div>

      {/* Become a Shop Partner Card */}
      <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900">
        <div className="p-5 rounded-xl bg-gradient-to-r from-zinc-900 to-black border border-zinc-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Storefront size={20} className="text-[#ff4655]" />
              <h4 className="text-xs font-black uppercase tracking-wider">
                TRỞ THÀNH ĐỐI TÁC GIAN HÀNG GEARTECH
              </h4>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed max-w-xl">
              Bạn là doanh nghiệp, đại lý bán lẻ thiết bị PC & Gaming? Gửi hồ sơ đăng ký mở gian hàng để tiếp cận hàng triệu khách hàng công nghệ trên toàn quốc.
            </p>
          </div>

          <button
            onClick={() => setShowApplyModal(true)}
            className="px-4 py-2.5 rounded-lg bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black text-xs uppercase tracking-wider shrink-0 transition-all shadow-md shadow-[#ff4655]/30 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Plus size={14} weight="bold" />
            Đăng ký mở shop
          </button>
        </div>

        {applySuccess && (
          <div className="mt-3 p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle size={16} weight="fill" />
            <span>{applySuccess}</span>
          </div>
        )}
      </div>

      {/* Modal Đăng ký mở shop */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Storefront size={18} className="text-[#ff4655]" />
                <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider">
                  HỒ SƠ ĐĂNG KÝ GIAN HÀNG MỚI
                </h3>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-zinc-600"
              >
                <X size={18} />
              </button>
            </div>

            {applyError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-[#ff4655] text-xs font-bold rounded">
                ⚠️ {applyError}
              </div>
            )}

            <form onSubmit={handleApplyShop} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Tên gian hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: ASUS ROG ZONE, KEYCHRON VIETNAM..."
                  value={applyForm.name}
                  onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white uppercase focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Emoji đại diện / Logo *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: 👹, 💻, ⌨️ hoặc đường dẫn ảnh logo"
                  value={applyForm.logo}
                  onChange={(e) => setApplyForm({ ...applyForm, logo: e.target.value })}
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Phân khúc sản phẩm *</label>
                <input
                  type="text"
                  required
                  placeholder="VD: Bàn phím cơ Custom & Switch cao cấp"
                  value={applyForm.category}
                  onChange={(e) => setApplyForm({ ...applyForm, category: e.target.value })}
                  className="w-full text-xs font-bold px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Mô tả giới thiệu cửa hàng</label>
                <textarea
                  rows={2}
                  placeholder="Giới thiệu về doanh nghiệp, xuất xứ hàng hóa, chính sách bảo hành..."
                  value={applyForm.description}
                  onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    placeholder={profileForm.phone || '0901234567'}
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-1">Địa chỉ trụ sở</label>
                  <input
                    type="text"
                    placeholder={profileForm.address || 'Hà Nội, TP.HCM...'}
                    value={applyForm.address}
                    onChange={(e) => setApplyForm({ ...applyForm, address: e.target.value })}
                    className="w-full text-xs px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:border-[#ff4655]"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-bold uppercase rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 text-xs font-black uppercase rounded bg-[#ff4655] hover:bg-[#e03d4b] text-white transition-all shadow-md shadow-[#ff4655]/20"
                >
                  {applying ? 'ĐANG GỬI...' : 'GỬI ĐƠN XÉT DUYỆT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
