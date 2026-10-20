import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Package, ArrowDownLeft, ArrowUpRight, ArrowClockwise, Warning, CheckCircle, 
  Plus, Buildings, X
} from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'
import { stockMovementService } from '../../../../services/stockMovementService'
import { supplierService } from '../../../../services/supplierService'

interface ShopInventoryTabProps {
  allProducts: any[];
  onRefreshProducts?: () => void;
}

export default function ShopInventoryTab({ allProducts, onRefreshProducts }: ShopInventoryTabProps) {
  const [movements, setMovements] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [filterType, setFilterType] = useState('all')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'import' | 'export' | 'adjustment'>('import')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unitCost, setUnitCost] = useState(0)
  const [selectedSupplierId, setSelectedSupplierId] = useState('')
  const [reference, setReference] = useState('')
  const [note, setNote] = useState('')
  const [actualStock, setActualStock] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      setErrorMsg(null)
      const [movData, supData, sumData] = await Promise.all([
        stockMovementService.getStockMovements(filterType !== 'all' ? { type: filterType } : undefined),
        supplierService.getSuppliers(),
        stockMovementService.getStockSummary()
      ])
      setMovements(Array.isArray(movData) ? movData : [])
      setSuppliers(Array.isArray(supData) ? supData : [])
      setSummary(sumData)
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi tải thông tin biến động kho.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [filterType])

  const handleOpenModal = (mode: 'import' | 'export' | 'adjustment') => {
    setModalMode(mode)
    if (allProducts.length > 0 && !selectedProductId) {
      setSelectedProductId(allProducts[0]._id || allProducts[0].id)
    }
    setQuantity(10)
    setUnitCost(0)
    setReference(`PN-${Date.now().toString().slice(-6)}`)
    setNote('')
    setShowModal(true)
  }

  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductId) {
      setErrorMsg('Vui lòng chọn sản phẩm.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg(null)

      const payload: any = {
        productId: selectedProductId,
        type: modalMode,
        reference,
        note
      }

      if (modalMode === 'adjustment') {
        payload.actualStock = Number(actualStock)
      } else {
        payload.quantity = Number(quantity)
        if (modalMode === 'import') {
          payload.unitCost = Number(unitCost)
          if (selectedSupplierId) payload.supplierId = selectedSupplierId
        }
      }

      const res = await stockMovementService.createStockMovement(payload)
      setSuccessMsg(res.message || 'Cập nhật kho thành công!')
      setShowModal(false)
      await fetchData()
      if (onRefreshProducts) onRefreshProducts()
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Lỗi thực hiện biến động kho.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'import':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1 w-fit">
            <ArrowDownLeft size={11} weight="bold" /> Nhập kho
          </span>
        )
      case 'export':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-red-500 bg-red-500/10 border border-red-500/20 flex items-center gap-1 w-fit">
            <ArrowUpRight size={11} weight="bold" /> Xuất kho
          </span>
        )
      case 'sale':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-blue-500 bg-blue-500/10 border border-blue-500/20 flex items-center gap-1 w-fit">
            <ArrowUpRight size={11} weight="bold" /> Bán hàng
          </span>
        )
      case 'return':
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-500/10 border border-amber-500/20 flex items-center gap-1 w-fit">
            <ArrowDownLeft size={11} weight="bold" /> Hoàn kho
          </span>
        )
      case 'adjustment':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-purple-500 bg-purple-500/10 border border-purple-500/20 flex items-center gap-1 w-fit">
            <ArrowClockwise size={11} weight="bold" /> Kiểm kê
          </span>
        )
    }
  }

  return (
    <motion.div
      key="shop-inventory-tab"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      className="bg-white dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg p-6 shadow-sm dark:shadow-xl space-y-6"
    >
      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-900 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black uppercase text-zinc-900 dark:text-white tracking-wider flex items-center gap-2">
            <Package size={18} className="text-[#ff4655]" />
            QUẢN LÝ KHO & LỊCH SỬ BIẾN ĐỘNG TỒN
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Theo dõi nhập xuất, kiểm kê kho và lịch sử bán hàng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('import')}
            className="px-3 py-1.5 bg-[#ff4655] hover:bg-[#e03d4b] text-white rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all"
          >
            <Plus size={13} weight="bold" /> Nhập kho
          </button>
          <button
            onClick={() => handleOpenModal('adjustment')}
            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-850 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
          >
            <ArrowClockwise size={13} /> Kiểm kê
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-850 rounded-lg">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">TỔNG TỒN KHẢ DỤNG</span>
            <span className="text-xl font-black text-emerald-500 mt-1 block">
              {summary.currentTotalStock} <span className="text-xs font-normal text-zinc-400">cái</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-850 rounded-lg">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">ĐÃ NHẬP KHO</span>
            <span className="text-xl font-black text-cyan-500 mt-1 block">
              +{summary.totalImported} <span className="text-xs font-normal text-zinc-400">cái</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-850 rounded-lg">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">ĐÃ XUẤT BÁN</span>
            <span className="text-xl font-black text-[#ff4655] mt-1 block">
              -{summary.totalSold} <span className="text-xs font-normal text-zinc-400">cái</span>
            </span>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-850 rounded-lg">
            <span className="text-[9px] font-mono text-zinc-400 block uppercase">HOÀN TỒN KHO</span>
            <span className="text-xl font-black text-amber-500 mt-1 block">
              +{summary.totalReturned} <span className="text-xs font-normal text-zinc-400">cái</span>
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'all', label: 'Tất cả biến động' },
          { key: 'import', label: 'Nhập kho' },
          { key: 'sale', label: 'Bán hàng' },
          { key: 'return', label: 'Hoàn trả' },
          { key: 'export', label: 'Xuất hủy' },
          { key: 'adjustment', label: 'Kiểm kê' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
              filterType === tab.key
                ? 'bg-[#ff4655] text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
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

      {/* Table Lịch sử biến động */}
      {loading ? (
        <div className="text-center py-12 text-xs font-bold text-zinc-400">
          <div className="inline-block animate-spin text-xl mb-2">⏳</div>
          <div>Đang tải dữ liệu biến động kho...</div>
        </div>
      ) : movements.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
          <Package size={36} className="mx-auto text-zinc-400 mb-2 opacity-50" />
          <div className="font-bold text-xs uppercase text-zinc-450 dark:text-zinc-600">Chưa có bản ghi biến động nào</div>
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100 dark:bg-zinc-900/80 text-[9px] uppercase font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-3">Thời gian</th>
                <th className="p-3">Sản phẩm</th>
                <th className="p-3">Loại</th>
                <th className="p-3">Số lượng</th>
                <th className="p-3">Giá nhập (VNĐ)</th>
                <th className="p-3">Nguồn / Nhà CC</th>
                <th className="p-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 font-sans">
              {movements.map((m) => {
                const prodTitle = m.product_id?.title || m.productId?.title || 'Sản phẩm'
                const prodSku = m.product_id?.sku || m.productId?.sku || ''
                const supplierName = m.supplier_id?.name || m.supplierId?.name || m.reference || '-'
                const cost = m.unitCost || (m.unit_cost ? parseFloat(m.unit_cost.toString()) : 0)

                return (
                  <tr key={m._id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 text-[10px] text-zinc-400 font-mono">
                      {m.created_at ? new Date(m.created_at).toLocaleString('vi-VN') : ''}
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-zinc-800 dark:text-zinc-200">{prodTitle}</div>
                      {prodSku && <span className="text-[9px] font-mono text-zinc-400">SKU: {prodSku}</span>}
                    </td>
                    <td className="p-3">{getTypeBadge(m.type)}</td>
                    <td className="p-3 font-mono font-black">
                      <span className={m.quantity > 0 ? 'text-emerald-500' : 'text-red-500'}>
                        {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-zinc-600 dark:text-zinc-300">
                      {cost > 0 ? formatPrice(cost) : '-'}
                    </td>
                    <td className="p-3 text-zinc-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Buildings size={12} className="text-[#ff4655]" />
                        <span>{supplierName}</span>
                      </div>
                    </td>
                    <td className="p-3 text-zinc-400 text-[10px] max-w-xs truncate">
                      {m.note || '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nhập kho / Kiểm kê */}
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
                  <Package size={18} className="text-[#ff4655]" />
                  {modalMode === 'import' ? 'Nhập kho sản phẩm' : modalMode === 'adjustment' ? 'Kiểm kê điều chỉnh kho' : 'Xuất kho sản phẩm'}
                </h4>
                <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-white p-1 rounded">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitMovement} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Chọn sản phẩm *
                  </label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  >
                    {allProducts.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.title} (Tồn hiện tại: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {modalMode === 'adjustment' ? (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Số lượng thực tế sau kiểm kê *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={actualStock}
                      onChange={(e) => setActualStock(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                      Số lượng {modalMode === 'import' ? 'nhập' : 'xuất'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      required
                    />
                  </div>
                )}

                {modalMode === 'import' && (
                  <>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Nhà cung cấp (Tùy chọn)
                      </label>
                      <select
                        value={selectedSupplierId}
                        onChange={(e) => setSelectedSupplierId(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      >
                        <option value="">-- Không chọn nhà cung cấp --</option>
                        {suppliers.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.phone})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                        Đơn giá nhập (VNĐ)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={unitCost}
                        onChange={(e) => setUnitCost(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Mã chứng từ / Tham chiếu
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="VD: Nhập linh kiện đợt tháng 10"
                    className="w-full p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white"
                  />
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
                    {isSubmitting ? 'Đang lưu...' : 'Xác nhận lưu'}
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
