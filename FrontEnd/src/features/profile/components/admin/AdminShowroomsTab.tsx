import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { MapPin, PlusCircle, PencilSimple, Trash, X, Storefront } from '@phosphor-icons/react'
import { showroomService } from '../../../../services/showroomService'
import apiClient from '../../../../api/client'

interface AdminShowroomsTabProps {
  token: string | null;
  dbShowrooms: any[];
  shopsList?: any[];
  onRefresh: () => void;
}

export default function AdminShowroomsTab({ token: _token, dbShowrooms, shopsList, onRefresh }: AdminShowroomsTabProps) {
  const [availableShops, setAvailableShops] = useState<any[]>(shopsList || [])

  useEffect(() => {
    if (shopsList && shopsList.length > 0) {
      setAvailableShops(shopsList)
    } else {
      apiClient.get('/shops')
        .then(res => {
          if (Array.isArray(res.data)) setAvailableShops(res.data)
          else if (res.data?.shops) setAvailableShops(res.data.shops)
        })
        .catch(err => console.error('Lỗi tải danh sách shops cho showroom:', err))
    }
  }, [shopsList])

  const [showroomForm, setShowroomForm] = useState({
    name: '',
    address: '',
    phone: '1900 6868',
    hours: '08:00 - 22:00',
    city: 'hcm',
    lat: 10.7766,
    lng: 106.678,
    mapUrl: '',
    featuresString: 'Trải nghiệm VR, Bản Giới Hạn, Kỹ thuật hỗ trợ nhanh',
    shopId: ''
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
      name: showroomForm.name.trim().toUpperCase(),
      address: showroomForm.address,
      phone: showroomForm.phone,
      hours: showroomForm.hours,
      city: showroomForm.city as 'hcm' | 'hanoi' | 'danang',
      mapUrl: showroomForm.mapUrl,
      features: showroomForm.featuresString.split(',').map(f => f.trim()).filter(Boolean),
      lat: Number(showroomForm.lat),
      lng: Number(showroomForm.lng),
      shopId: showroomForm.shopId ? showroomForm.shopId : null
    }

    try {
      const res = await showroomService.createShowroom(payload)
      setSuccess(`Thêm mới showroom "${res.showroom?.name || showroomForm.name}" thành công!`)
      setShowroomForm({
        name: '',
        address: '',
        phone: '1900 6868',
        hours: '08:00 - 22:00',
        city: 'hcm',
        lat: 10.7766,
        lng: 106.678,
        mapUrl: '',
        featuresString: 'Trải nghiệm VR, Bản Giới Hạn, Kỹ thuật hỗ trợ nhanh',
        shopId: ''
      })
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Lỗi thêm mới showroom.')
    } finally {
      setSubmitting(false)
    }
  }

  // D2: CHỈNH SỬA & XÓA SHOWROOM
  const [editingShowroom, setEditingShowroom] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '',
    city: 'hcm',
    lat: 0,
    lng: 0,
    mapUrl: '',
    featuresString: '',
    shopId: ''
  })
  const [editSubmitting, setEditSubmitting] = useState(false)

  const handleOpenEdit = (sr: any) => {
    setEditingShowroom(sr)
    setEditForm({
      name: sr.name || '',
      address: sr.address || '',
      phone: sr.phone || '',
      hours: sr.hours || '',
      city: sr.city || 'hcm',
      lat: sr.lat || 0,
      lng: sr.lng || 0,
      mapUrl: sr.mapUrl || '',
      featuresString: Array.isArray(sr.features) ? sr.features.join(', ') : '',
      shopId: sr.shopId?._id || sr.shopId || sr.shop_id || ''
    })
    setError(null)
    setSuccess(null)
  }

  const handleUpdateShowroom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingShowroom) return
    setEditSubmitting(true)
    setError(null)
    try {
      const res = await showroomService.updateShowroom(editingShowroom._id, {
        name: editForm.name.trim().toUpperCase(),
        address: editForm.address,
        phone: editForm.phone,
        hours: editForm.hours,
        city: editForm.city as 'hcm' | 'hanoi' | 'danang',
        lat: Number(editForm.lat),
        lng: Number(editForm.lng),
        mapUrl: editForm.mapUrl,
        features: editForm.featuresString.split(',').map((f) => f.trim()).filter(Boolean),
        shopId: editForm.shopId ? editForm.shopId : null
      })
      setSuccess(res.message || 'Cập nhật showroom thành công!')
      setEditingShowroom(null)
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi cập nhật showroom.')
    } finally {
      setEditSubmitting(false)
    }
  }

  const handleDeleteShowroom = async (sr: any) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa showroom "${sr.name}"? Thao tác này không thể hoàn tác!`)) return
    setError(null)
    try {
      const res = await showroomService.deleteShowroom(sr._id)
      setSuccess(res.message || 'Đã xóa showroom thành công!')
      onRefresh()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Lỗi xóa showroom.')
    }
  }

  return (
    <motion.div
      key="admin-showrooms"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <MapPin size={16} className="text-[#ff4655]" />
            QUẢN LÝ HỆ THỐNG SHOWROOM & LIÊN KẾT GIAN HÀNG
          </h3>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
            Quản lý các điểm showroom vật lý trên bản đồ GPS và liên kết trực tiếp với gian hàng/shop tương ứng.
          </p>
        </div>
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

      <form onSubmit={handleCreateShowroom} className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-4">
        <h4 className="text-[10px] font-black text-[#ff4655] uppercase tracking-widest flex items-center gap-1.5">
          <PlusCircle size={14} /> // THÊM SHOWROOM BẢN ĐỒ MỚI
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">TÊN CHI NHÁNH SHOWROOM (IN HOA) *</span>
            <input
              type="text"
              required
              value={showroomForm.name}
              onChange={(e) => setShowroomForm({ ...showroomForm, name: e.target.value })}
              placeholder="GEARTECH ZONE - ĐỒNG ĐA HÀ NỘI"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655] uppercase"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">THÀNH PHỐ *</span>
            <select
              required
              value={showroomForm.city}
              onChange={(e) => setShowroomForm({ ...showroomForm, city: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              <option value="hcm">HỒ CHÍ MINH</option>
              <option value="hanoi">HÀ NỘI</option>
              <option value="danang">ĐÀ NẴNG</option>
            </select>
          </div>

          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">LIÊN KẾT GIAN HÀNG / SHOP TRỰC THUỘC (TÙY CHỌN)</span>
            <select
              value={showroomForm.shopId}
              onChange={(e) => setShowroomForm({ ...showroomForm, shopId: e.target.value })}
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            >
              <option value="">-- Showroom độc lập (Không liên kết shop) --</option>
              {availableShops.map((s: any) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  🏬 {s.name || s.shop_name} ({s.category || 'Gian hàng'})
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">ĐỊA CHỈ CHI TIẾT *</span>
            <input
              type="text"
              required
              value={showroomForm.address}
              onChange={(e) => setShowroomForm({ ...showroomForm, address: e.target.value })}
              placeholder="18 Phố Chùa Bộc, Quang Trung, Đống Đa, Hà Nội"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">SỐ ĐIỆN THOẠI LIÊN HỆ *</span>
            <input
              type="text"
              required
              value={showroomForm.phone}
              onChange={(e) => setShowroomForm({ ...showroomForm, phone: e.target.value })}
              placeholder="1900 6868 (Phím 2)"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">GIỜ MỞ CỬA *</span>
            <input
              type="text"
              required
              value={showroomForm.hours}
              onChange={(e) => setShowroomForm({ ...showroomForm, hours: e.target.value })}
              placeholder="08:00 - 22:00"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">VĨ ĐỘ (LATITUDE) *</span>
            <input
              type="number"
              step="any"
              required
              value={showroomForm.lat}
              onChange={(e) => setShowroomForm({ ...showroomForm, lat: Number(e.target.value) })}
              placeholder="21.00769"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">KINH ĐỘ (LONGITUDE) *</span>
            <input
              type="number"
              step="any"
              required
              value={showroomForm.lng}
              onChange={(e) => setShowroomForm({ ...showroomForm, lng: Number(e.target.value) })}
              placeholder="105.82607"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-2">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">TIỆN ÍCH NỔI BẬT (CÁCH NHAU DẤU PHẨY)</span>
            <input
              type="text"
              value={showroomForm.featuresString}
              onChange={(e) => setShowroomForm({ ...showroomForm, featuresString: e.target.value })}
              placeholder="Trải nghiệm VR, Bản Giới Hạn, Kỹ thuật hỗ trợ nhanh"
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
          <div className="relative md:col-span-3">
            <span className="absolute left-3 top-1.5 text-[7px] font-mono text-zinc-400 dark:text-zinc-500 tracking-wider">GOOGLE MAP EMBED URL (IFRAME) *</span>
            <input
              type="text"
              required
              value={showroomForm.mapUrl}
              onChange={(e) => setShowroomForm({ ...showroomForm, mapUrl: e.target.value })}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full text-xs font-bold pl-3 pr-3 pt-4.5 pb-2.5 border border-zinc-200 dark:border-zinc-800 rounded-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#ff4655]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-[#ff4655] hover:bg-[#ff4655]/90 text-white rounded text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-[#ff4655]/20"
          >
            <PlusCircle size={15} />
            {submitting ? 'ĐANG KHỞI TẠO...' : 'LƯU SHOWROOM GPS MỚI'}
          </button>
        </div>
      </form>

      {/* Danh sách Showroom GPS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dbShowrooms.map((sr) => {
          const linkedShop = sr.shopId || sr.shop_id
          const linkedShopName = typeof linkedShop === 'object' ? (linkedShop?.name || linkedShop?.shop_name) : null

          return (
            <div key={sr._id || sr.id} className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase leading-normal">{sr.name}</h4>
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 mt-1 inline-block">
                      {sr.city === 'hcm' ? 'Hồ Chí Minh' : sr.city === 'hanoi' ? 'Hà Nội' : 'Đà Nẵng'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(sr)}
                      title="Sửa showroom"
                      className="p-1.5 rounded text-zinc-400 hover:text-[#ff4655] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <PencilSimple size={14} weight="bold" />
                    </button>
                    <button
                      onClick={() => handleDeleteShowroom(sr)}
                      title="Xóa showroom"
                      className="p-1.5 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Trash size={14} weight="bold" />
                    </button>
                  </div>
                </div>

                {linkedShopName && (
                  <div className="text-[10px] font-bold text-[#ff4655] bg-[#ff4655]/10 border border-[#ff4655]/20 px-2 py-1 rounded flex items-center gap-1.5 w-fit">
                    <Storefront size={13} />
                    <span>Gian hàng: {linkedShopName}</span>
                  </div>
                )}

                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 font-semibold">{sr.address}</p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">Giờ mở cửa: {sr.hours} | ĐT: {sr.phone}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal chỉnh sửa showroom */}
      {editingShowroom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                <PencilSimple size={18} className="text-[#ff4655]" weight="bold" />
                CHỈNH SỬA SHOWROOM
              </h4>
              <button onClick={() => setEditingShowroom(null)} className="text-zinc-400 hover:text-white p-1 rounded">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateShowroom} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Tên showroom *</label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Liên kết gian hàng / Shop trực thuộc</label>
                <select
                  value={editForm.shopId}
                  onChange={(e) => setEditForm({ ...editForm, shopId: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                >
                  <option value="">-- Showroom độc lập (Không liên kết shop) --</option>
                  {availableShops.map((s: any) => (
                    <option key={s._id || s.id} value={s._id || s.id}>
                      🏬 {s.name || s.shop_name} ({s.category || 'Gian hàng'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Thành phố *</label>
                  <select
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="hcm">Hồ Chí Minh</option>
                    <option value="hanoi">Hà Nội</option>
                    <option value="danang">Đà Nẵng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Điện thoại *</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Địa chỉ *</label>
                <input
                  type="text"
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Giờ mở cửa *</label>
                  <input
                    type="text"
                    required
                    value={editForm.hours}
                    onChange={(e) => setEditForm({ ...editForm, hours: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Tiện ích (cách nhau dấu phẩy)</label>
                  <input
                    type="text"
                    value={editForm.featuresString}
                    onChange={(e) => setEditForm({ ...editForm, featuresString: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Vĩ độ (lat) *</label>
                  <input
                    type="number" step="any" required
                    value={editForm.lat}
                    onChange={(e) => setEditForm({ ...editForm, lat: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Kinh độ (lng) *</label>
                  <input
                    type="number" step="any" required
                    value={editForm.lng}
                    onChange={(e) => setEditForm({ ...editForm, lng: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Google Map Embed URL *</label>
                <input
                  type="text"
                  required
                  value={editForm.mapUrl}
                  onChange={(e) => setEditForm({ ...editForm, mapUrl: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingShowroom(null)}
                  className="flex-1 py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#ff4655] hover:bg-[#e03d4b] disabled:opacity-50 text-white font-black uppercase tracking-wider"
                >
                  {editSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  )
}
