import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { PencilSimple, FloppyDisk } from '@phosphor-icons/react'

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
    </motion.div>
  )
}
