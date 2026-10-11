import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, PlusCircle } from '@phosphor-icons/react'

interface AdminShowroomsTabProps {
  token: string | null;
  dbShowrooms: any[];
  onRefresh: () => void;
}

export default function AdminShowroomsTab({ token, dbShowrooms, onRefresh }: AdminShowroomsTabProps) {
  const [showroomForm, setShowroomForm] = useState({
    name: '',
    address: '',
    phone: '1900 6868',
    hours: '08:00 - 22:00',
    city: 'hcm',
    lat: 10.7766,
    lng: 106.678,
    mapUrl: '',
    featuresString: 'Trải nghiệm VR, Bản Giới Hạn, Kỹ thuật hỗ trợ nhanh'
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateShowroom = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSubmitting(true)

    const payload = {
      ...showroomForm,
      features: showroomForm.featuresString.split(',').map(f => f.trim()),
      lat: Number(showroomForm.lat),
      lng: Number(showroomForm.lng)
    }

    try {
      const res = await fetch('http://localhost:5000/api/showrooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(`Thêm mới showroom "${data.showroom.name}" thành công!`)
      setShowroomForm({
        name: '',
        address: '',
        phone: '1900 6868',
        hours: '08:00 - 22:00',
        city: 'hcm',
        lat: 10.7766,
        lng: 106.678,
        mapUrl: '',
        featuresString: 'Trải nghiệm VR, Bản Giới Hạn, Kỹ thuật hỗ trợ nhanh'
      })
      onRefresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      key="admin-showrooms"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-955/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
          <MapPin size={16} className="text-[#ff4655]" />
          QUẢN LÝ HỆ THỐNG PHÂN KHU SHOWROOM GPS
        </h3>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm text-xs font-bold">
            ⚠️ {error}
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-sm text-xs font-bold">
            ✅ {success}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleCreateShowroom} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-sm space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <PlusCircle size={14} /> // THÊM SHOWROOM BẢN ĐỒ MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">TÊN CHI NHÁNH SHOWROOM (IN HOA)</span>
            <input
              type="text"
              required
              value={showroomForm.name}
              onChange={(e) => setShowroomForm({ ...showroomForm, name: e.target.value })}
              placeholder="GEARTECH ZONE - ĐỒNG ĐA HÀ NỘI"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] uppercase"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-450 dark:text-zinc-655 tracking-wider">THÀNH PHỐ</span>
            <select
              required
              value={showroomForm.city}
              onChange={(e) => setShowroomForm({ ...showroomForm, city: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              <option value="hcm">HỒ CHÍ MINH</option>
              <option value="hanoi">HÀ NỘI</option>
              <option value="danang">ĐÀ NẴNG</option>
            </select>
          </div>
          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">ĐỊA CHỈ CHI TIẾT</span>
            <input
              type="text"
              required
              value={showroomForm.address}
              onChange={(e) => setShowroomForm({ ...showroomForm, address: e.target.value })}
              placeholder="18 Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">SỐ ĐIỆN THOẠI LIÊN HỆ</span>
            <input
              type="text"
              required
              value={showroomForm.phone}
              onChange={(e) => setShowroomForm({ ...showroomForm, phone: e.target.value })}
              placeholder="1900 6868 (Phím 2)"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GIỜ MỞ CỬA</span>
            <input
              type="text"
              required
              value={showroomForm.hours}
              onChange={(e) => setShowroomForm({ ...showroomForm, hours: e.target.value })}
              placeholder="08:00 - 22:00"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">VĨ ĐỘ (LATITUDE)</span>
            <input
              type="number"
              step="any"
              required
              value={showroomForm.lat}
              onChange={(e) => setShowroomForm({ ...showroomForm, lat: Number(e.target.value) })}
              placeholder="21.00769"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">KINH ĐỘ (LONGITUDE)</span>
            <input
              type="number"
              step="any"
              required
              value={showroomForm.lng}
              onChange={(e) => setShowroomForm({ ...showroomForm, lng: Number(e.target.value) })}
              placeholder="105.82607"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">TIỆN ÍCH (CÁCH BẰNG DẤU PHẨY)</span>
            <input
              type="text"
              required
              value={showroomForm.featuresString}
              onChange={(e) => setShowroomForm({ ...showroomForm, featuresString: e.target.value })}
              placeholder="Khu trải nghiệm VR, Cân phím cơ custom..."
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-455 dark:text-zinc-655 tracking-wider">GOOGLE MAP EMBED URL (IFRAME SRC)</span>
            <input
              type="text"
              required
              value={showroomForm.mapUrl}
              onChange={(e) => setShowroomForm({ ...showroomForm, mapUrl: e.target.value })}
              placeholder="https://maps.google.com/maps?q=..."
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-850 rounded-sm bg-white dark:bg-zinc-955 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest px-6 py-3.5 rounded-sm transition-all shadow-[0_0_15px_rgba(255,70,85,0.3)] cursor-pointer"
        >
          {submitting ? 'ĐANG TẠO...' : 'THÊM MỚI CHI NHÁNH'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbShowrooms.map((sr) => (
          <div key={sr._id} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-sm relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-sm text-[8px] font-mono font-bold bg-yellow-400/10 border border-yellow-400/30 text-yellow-500 tracking-widest uppercase">
                GPS CITY: {sr.city.toUpperCase()}
              </span>
              <h4 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase leading-normal pt-1">{sr.name}</h4>
              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 font-semibold">{sr.address}</p>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-555 pt-1 font-mono">Giờ mở cửa: {sr.hours} | ĐT: {sr.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
