import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Buildings, Plus, PencilSimple, Trash, Phone, EnvelopeSimple, MapPin, 
  CheckCircle, Warning, X
} from '@phosphor-icons/react'
import { supplierService, type SupplierPayload } from '../../../../services/supplierService'

export default function ShopSuppliersTab() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<any | null>(null)
  const [formData, setFormData] = useState<SupplierPayload>({
    name: '',
    contactName: '',
    phone: '',
    email: '',
    address: '',
    status: 'active'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const data = await supplierService.getSuppliers()
      setSuppliers(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi tải danh sách nhà cung cấp.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const handleOpenAdd = () => {
    setEditingSupplier(null)
    setFormData({
      name: '',
      contactName: '',
      phone: '',
      email: '',
      address: '',
      status: 'active'
    })
    setShowModal(true)
  }

  const handleOpenEdit = (sup: any) => {
    setEditingSupplier(sup)
    setFormData({
      name: sup.name || '',
      contactName: sup.contactName || sup.contact_name || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
      status: sup.status || 'active'
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ tên, số điện thoại và email nhà cung cấp.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)

      if (editingSupplier) {
        await supplierService.updateSupplier(editingSupplier._id, formData)
        setSuccessMsg('Cập nhật nhà cung cấp thành công!')
      } else {
        await supplierService.createSupplier(formData)
        setSuccessMsg('Thêm nhà cung cấp mới thành công!')
      }

      setShowModal(false)
      await fetchSuppliers()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi lưu thông tin nhà cung cấp.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoặc vô hiệu hóa nhà cung cấp "${name}"?`)) {
      return
    }

    try {
      setErrorMsg(null)
      const res = await supplierService.deleteSupplier(id)
      setSuccessMsg(res.message || 'Xóa nhà cung cấp thành công!')
      await fetchSuppliers()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi xóa nhà cung cấp.')
    }
  }

  return (
    <motion.div
      key="shop-suppliers-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Buildings size={18} className="text-[#ff4655]" />
            QUẢN LÝ ĐỐI TÁC & NHÀ CUNG CẤP ({suppliers.length})
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Lưu trữ thông tin liên hệ và đối tác nhập hàng cho kho cửa hàng
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
        >
          <Plus size={13} weight="bold" /> Thêm nhà cung cấp
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded flex items-center gap-2 font-semibold">
          <Warning size={16} />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded flex items-center gap-2 font-semibold">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-zinc-400">
          <div className="inline-block animate-spin text-xl mb-2">⏳</div>
          <div>Đang tải dữ liệu nhà cung cấp...</div>
        </div>
      ) : suppliers.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Buildings size={36} className="mx-auto text-zinc-400 mb-2 opacity-50" />
          <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">Chưa có nhà cung cấp nào</div>
          <p className="text-[10px] text-zinc-400 mt-1">Bấm "Thêm nhà cung cấp" để bắt đầu quản lý nguồn hàng</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup._id}
              className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-850 rounded-lg space-y-3 relative group"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-black uppercase text-zinc-900 dark:text-white tracking-wide">
                    {sup.name}
                  </h4>
                  {(sup.contactName || sup.contact_name) && (
                    <span className="text-[10px] text-zinc-400 block mt-0.5">
                      Đại diện: <strong className="text-zinc-700 dark:text-zinc-300">{sup.contactName || sup.contact_name}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    sup.status === 'active'
                      ? 'text-emerald-500 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-zinc-400 bg-zinc-200 dark:bg-zinc-800'
                  }`}>
                    {sup.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                  </span>

                  <button
                    onClick={() => handleOpenEdit(sup)}
                    className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded transition-colors"
                    title="Chỉnh sửa"
                  >
                    <PencilSimple size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(sup._id, sup.name)}
                    className="p-1 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    title="Xóa"
                  >
                    <Trash size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-[10px] text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <Phone size={12} className="text-[#ff4655] shrink-0" />
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{sup.phone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <EnvelopeSimple size={12} className="text-[#ff4655] shrink-0" />
                  <span className="truncate">{sup.email}</span>
                </div>
                {sup.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#ff4655] shrink-0" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa nhà cung cấp */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <h4 className="text-sm font-black uppercase text-zinc-900 dark:text-white flex items-center gap-2">
                  <Buildings size={18} className="text-[#ff4655]" />
                  {editingSupplier ? 'Chỉnh sửa nhà cung cấp' : 'Thêm mới nhà cung cấp'}
                </h4>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white p-1 rounded">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Tên nhà cung cấp / Doanh nghiệp *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Công ty TNHH Phân Phối Linh Kiện PC"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Người liên hệ / Đại diện
                  </label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="VD: Anh Nam (Phòng Kinh Doanh)"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="VD: 0988777666"
                      className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="VD: info@supplier.vn"
                      className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Địa chỉ trụ sở / Kho hàng
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    <option value="active">Đang hợp tác (active)</option>
                    <option value="inactive">Tạm dừng (inactive)</option>
                  </select>
                </div>

                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2.5 px-3 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-3 rounded-lg bg-[#ff4655] hover:bg-[#e03d4b] text-white font-black uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thông tin'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
