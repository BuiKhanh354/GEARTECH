import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import {
  Package, MagnifyingGlass, WarningCircle, ArrowClockwise, Eye, EyeSlash, ArrowRight
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { productService, type ProductItem } from '../../../services/productService'
import { ProductStatusBadge } from '../../shop/components/seller/StatusBadge'

// Quản lý sản phẩm toàn sàn — dùng API công khai /api/products với includeInactive
// và PUT /api/products/:id/status (backend đã chặn quyền: chỉ shop chủ sở hữu hoặc admin)
export default function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const statusParam = searchParams.get('status')

  const [products, setProducts] = useState<ProductItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [actionId, setActionId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const params: any = { includeInactive: true, status: 'all', limit: 200 }
      if (query.trim()) params.search = query.trim()
      const res = await productService.getProducts(params)
      let list = res.products || []
      if (statusParam === 'hidden') {
        // Nhóm "Bị ẩn / ngừng bán" gồm cả hidden và inactive
        list = list.filter(p => p.status === 'hidden' || p.status === 'inactive')
      }
      setProducts(list)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [query, statusParam])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  useEffect(() => {
    if (notice) {
      const t = setTimeout(() => setNotice(null), 3500)
      return () => clearTimeout(t)
    }
  }, [notice])

  const handleToggleStatus = async (p: ProductItem) => {
    const nextStatus = p.status === 'active' ? 'hidden' : 'active'
    const confirmText = nextStatus === 'hidden'
      ? `Ẩn sản phẩm "${p.title}" khỏi sàn? Sản phẩm sẽ không hiển thị với khách hàng.`
      : `Hiện lại sản phẩm "${p.title}" trên sàn?`
    if (!window.confirm(confirmText)) return

    try {
      setActionId(p._id)
      await productService.updateProductStatus(p._id, nextStatus as any)
      setNotice({ type: 'success', text: `Đã chuyển "${p.title}" sang trạng thái ${nextStatus === 'hidden' ? 'Ẩn' : 'Đang bán'}.` })
      await loadProducts()
    } catch (err: any) {
      setNotice({ type: 'error', text: err.response?.data?.error || 'Không thể cập nhật trạng thái sản phẩm.' })
    } finally {
      setActionId(null)
    }
  }

  const TABS = [
    { key: null, label: 'Tất cả' },
    { key: 'active', label: 'Đang bán' },
    { key: 'hidden', label: 'Bị ẩn / ngừng bán' }
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Package size={20} className="text-[#2563EB]" weight="fill" />
            Sản phẩm toàn sàn
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Giám sát mọi sản phẩm của các shop — Admin chỉ ẩn/hiện theo nghiệp vụ, không sửa tồn kho của shop</p>
        </div>
        <button
          onClick={() => loadProducts()}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-[#2563EB] transition-colors cursor-pointer"
        >
          <ArrowClockwise size={13} /> Làm mới
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col sm:flex-row gap-2">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.label}
              onClick={() => setSearchParams(t.key ? { status: t.key } : {})}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                (statusParam || null) === t.key ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); setQuery(search) }}
          className="sm:ml-auto flex items-center gap-2"
        >
          <div className="relative">
            <MagnifyingGlass size={14} className="absolute left-2.5 top-2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên sản phẩm..."
              className="pl-8 pr-3 py-1.5 w-56 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#2563EB] bg-slate-50"
            />
          </div>
          <button type="submit" className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-[#2563EB] text-white cursor-pointer">Tìm</button>
        </form>
      </div>

      {notice && (
        <div className={`p-3 rounded-lg border text-xs font-semibold ${
          notice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          {notice.type === 'success' ? '✅' : '⚠️'} {notice.text}
        </div>
      )}

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <WarningCircle size={26} className="mx-auto text-rose-500 mb-2" />
          <p className="text-xs font-semibold text-slate-600 mb-2">Không tải được danh sách sản phẩm.</p>
          <button onClick={() => loadProducts()} className="text-xs font-bold text-[#2563EB] underline cursor-pointer">Thử lại</button>
        </div>
      ) : loading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl py-12 text-center">
          <Package size={30} className="mx-auto text-slate-300 mb-2" />
          <p className="text-xs font-semibold text-slate-400">Không tìm thấy sản phẩm nào phù hợp bộ lọc</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-left min-w-[760px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Shop sở hữu</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {p.imageEmoji && p.imageEmoji.startsWith('http')
                          ? <img src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                          : (p.imageEmoji || '📦')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[240px]">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{p.categoryName || p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {typeof p.shopId === 'object' && p.shopId?.name
                      ? <Link to={`/shop/${p.shopId._id || ''}`} className="hover:text-[#2563EB] flex items-center gap-0.5">{p.shopId.name} <ArrowRight size={9} /></Link>
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold text-slate-800">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{p.stock}</td>
                  <td className="px-4 py-3"><ProductStatusBadge status={p.status} stock={p.stock} /></td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(p)}
                      disabled={actionId === p._id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                        p.status === 'active'
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {p.status === 'active' ? <><EyeSlash size={12} /> Ẩn</> : <><Eye size={12} /> Hiện lại</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
