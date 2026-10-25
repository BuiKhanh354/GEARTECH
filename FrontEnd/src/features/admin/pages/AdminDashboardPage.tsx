import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Storefront, Package, Receipt, CurrencyDollar, LockSimple,
  HourglassMedium, WarningCircle, ArrowRight, ArrowClockwise,
  ShoppingCart, SealCheck
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { adminService, type AdminOverview } from '../../../services/adminService'
import KpiCard from '../../shop/components/seller/KpiCard'
import StatusBadge from '../../shop/components/seller/StatusBadge'

const TIME_RANGES = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' }
]

// Dashboard tổng quan toàn sàn — toàn bộ số liệu từ /api/auth/admin/overview
export default function AdminDashboardPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchOverview = useCallback(async (d: number) => {
    try {
      setLoading(true)
      setError(false)
      const res = await adminService.getOverview(d)
      setData(res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview(days)
  }, [days, fetchOverview])

  const maxRevenue = Math.max(...(data?.series.map(p => p.revenue) ?? [1]), 1)
  const maxOrders = Math.max(...(data?.series.map(p => p.orders) ?? [1]), 1)

  return (
    <div className="space-y-5">
      {/* Header + bộ lọc thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">Dashboard tổng quan</h1>
          <p className="text-xs text-slate-500 mt-0.5">Tình hình hoạt động toàn sàn GearTech — dữ liệu thời gian thực từ MongoDB</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 w-fit">
          {TIME_RANGES.map((r) => (
            <button
              key={r.days}
              onClick={() => setDays(r.days)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                days === r.days ? 'bg-[#2563EB] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
          <WarningCircle size={26} className="mx-auto text-rose-500 mb-2" />
          <p className="text-xs font-semibold text-slate-600 mb-2">Không tải được dữ liệu tổng quan.</p>
          <button
            onClick={() => fetchOverview(days)}
            className="text-xs font-bold text-[#2563EB] hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowClockwise size={12} /> Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* ============ 5.1 KPI ============ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Tổng người dùng" value={data?.counts.totalUsers ?? 0}
              hint={`${data?.counts.totalCustomers ?? 0} khách hàng · ${data?.counts.totalShopOwners ?? 0} chủ shop`}
              icon={<Users size={18} weight="bold" />} accent="blue" loading={loading} />
            <KpiCard label="Tổng cửa hàng" value={data?.counts.totalShops ?? 0}
              hint={`${data?.counts.activeShops ?? 0} đang hoạt động`}
              icon={<Storefront size={18} weight="bold" />} accent="violet" loading={loading} />
            <KpiCard label="Tổng sản phẩm" value={data?.counts.totalProducts ?? 0}
              hint="Toàn sàn, mọi trạng thái"
              icon={<Package size={18} weight="bold" />} accent="amber" loading={loading} />
            <KpiCard label="Tổng đơn hàng" value={data?.counts.totalOrders ?? 0}
              hint={`${data?.orderStatus.completed ?? 0} đã hoàn thành`}
              icon={<Receipt size={18} weight="bold" />} accent="emerald" loading={loading} />
            <KpiCard label="Tổng giá trị đơn hàng" value={formatPrice(data?.orderValue.totalAll ?? 0)}
              hint="Mọi trạng thái, toàn sàn"
              icon={<ShoppingCart size={18} weight="bold" />} accent="emerald" loading={loading} />
            <KpiCard label="Giá trị đơn hoàn tất" value={formatPrice(data?.orderValue.completed ?? 0)}
              hint="Doanh thu bán hàng của các shop"
              icon={<CurrencyDollar size={18} weight="bold" />} accent="blue" loading={loading} />
            <KpiCard label="Shop chờ duyệt" value={data?.counts.pendingShops ?? 0}
              hint="Yêu cầu mở shop cần xử lý"
              icon={<HourglassMedium size={18} weight="bold" />} accent="amber" loading={loading} />
            <KpiCard label="Tài khoản bị khóa" value={data?.counts.lockedUsers ?? 0}
              hint="Không thể đăng nhập & thao tác"
              icon={<LockSimple size={18} weight="bold" />} accent="rose" loading={loading} />
          </div>

          {/* ============ 5.2 Biểu đồ + 5.3 Cảnh báo ============ */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Biểu đồ tự vẽ SVG: giá trị đơn hoàn tất + số đơn mới theo ngày */}
            <div className="xl:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800">Hoạt động {days} ngày qua</h3>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-[#2563EB]" /> Giá trị hoàn tất</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-400" /> Đơn mới</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-400" /> TK mới</span>
                </div>
              </div>
              {loading ? (
                <div className="h-44 bg-slate-100 rounded-lg animate-pulse" />
              ) : (data?.series ?? []).length === 0 ? (
                <p className="py-12 text-center text-xs text-slate-400 font-semibold">Chưa có dữ liệu</p>
              ) : (
                <div className="flex items-end gap-[3px] h-44">
                  {data!.series.map((p) => {
                    const hR = Math.max((p.revenue / maxRevenue) * 100, p.revenue > 0 ? 4 : 1.5)
                    const hO = Math.max((p.orders / maxOrders) * 100, p.orders > 0 ? 6 : 1.5)
                    return (
                      <div key={p.date} className="flex-1 flex flex-col justify-end gap-[2px] group relative" title={`${p.date}: ${formatPrice(p.revenue)} · ${p.orders} đơn · ${p.newUsers} TK mới`}>
                        <div className={`w-full rounded-t ${p.newUsers > 0 ? 'bg-emerald-400' : 'bg-slate-100'}`} style={{ height: `${p.newUsers > 0 ? Math.min(p.newUsers * 10 + 4, 24) : 2}%` }} />
                        <div className="w-full rounded-t bg-amber-300/80" style={{ height: `${hO}%` }} />
                        <div className="w-full rounded-t bg-[#2563EB]/85 group-hover:bg-[#2563EB] transition-colors" style={{ height: `${hR}%` }} />
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5">
                <span>{data?.series[0]?.date?.slice(8)}/{data?.series[0]?.date?.slice(5, 7)}</span>
                <span>{data?.series[data.series.length - 1]?.date?.slice(8)}/{data?.series[data.series.length - 1]?.date?.slice(5, 7)}</span>
              </div>
            </div>

            {/* Cảnh báo + tình trạng đơn */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Đơn hàng theo trạng thái</h3>
                {loading ? (
                  <div className="h-24 bg-slate-100 rounded-lg animate-pulse" />
                ) : (
                  <div className="space-y-1.5">
                    {(['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as const).map((st) => (
                      <div key={st} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-50">
                        <StatusBadge status={st} />
                        <span className="text-xs font-bold text-slate-700">{data?.orderStatus[st] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Cảnh báo nghiệp vụ</h3>
                {loading ? (
                  <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                ) : (data?.alerts.pendingShops.length ?? 0) === 0 && (data?.counts.lockedUsers ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-3 text-center">Không có cảnh báo nào</p>
                ) : (
                  <div className="space-y-2">
                    {data!.alerts.pendingShops.length > 0 && (
                      <Link to="/admin/shops" className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/70 border border-amber-100 hover:border-amber-200 transition-colors group">
                        <HourglassMedium size={17} className="text-amber-500 shrink-0" />
                        <p className="text-xs text-slate-700 flex-1">
                          <b>{data!.alerts.pendingShops.length} yêu cầu mở shop</b> đang chờ duyệt
                        </p>
                        <ArrowRight size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )}
                    {data!.counts.lockedUsers > 0 && (
                      <Link to="/admin/users" className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/70 border border-rose-100 hover:border-rose-200 transition-colors group">
                        <LockSimple size={17} className="text-rose-500 shrink-0" />
                        <p className="text-xs text-slate-700 flex-1">
                          <b>{data!.counts.lockedUsers} tài khoản đang bị khóa</b>
                        </p>
                        <ArrowRight size={12} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ============ 5.4 Bảng dữ liệu nhanh ============ */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Đơn hàng mới nhất */}
            <QuickTable
              title="Đơn hàng mới nhất"
              link={{ to: '/admin/orders', label: 'Tất cả đơn hàng' }}
              loading={loading}
              empty="Chưa có đơn hàng nào"
              rows={data?.recent.orders ?? []}
              render={(o: AdminOverview['recent']['orders'][number]) => (
                <Link to="/admin/orders" key={o._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <span className="text-xs font-bold text-slate-700 font-mono w-20 shrink-0">#{String(o._id).slice(-8).toUpperCase()}</span>
                  <span className="text-[11px] text-slate-400 flex-1">{o.itemCount} mặt hàng</span>
                  <span className="text-xs font-bold text-slate-800 w-28 text-right">{formatPrice(o.total)}</span>
                  <StatusBadge status={o.status} />
                </Link>
              )}
            />

            {/* Shop mới */}
            <QuickTable
              title="Cửa hàng mới đăng ký"
              link={{ to: '/admin/shops', label: 'Quản lý shop' }}
              loading={loading}
              empty="Chưa có cửa hàng nào"
              rows={data?.recent.shops ?? []}
              render={(s: AdminOverview['recent']['shops'][number]) => (
                <Link to="/admin/shops" key={s._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <Storefront size={15} className="text-slate-300 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 flex-1 truncate">{s.name || s.shop_name}</span>
                  <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${
                    s.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : s.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'}`}
                  >{s.status}</span>
                  <span className="text-[10px] text-slate-400 w-16 text-right">{new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
                </Link>
              )}
            />

            {/* Tài khoản mới */}
            <QuickTable
              title="Tài khoản mới tạo"
              link={{ to: '/admin/users', label: 'Quản lý tài khoản' }}
              loading={loading}
              empty="Chưa có tài khoản nào"
              rows={data?.recent.users ?? []}
              render={(u: AdminOverview['recent']['users'][number]) => (
                <Link to="/admin/users" key={u._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <span className="w-6 h-6 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-black flex items-center justify-center shrink-0 uppercase">{u.name.slice(0, 1)}</span>
                  <span className="text-xs font-semibold text-slate-700 flex-1 truncate">
                    {u.name} <span className="text-slate-400 font-normal">· {u.email}</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    u.role === 'admin' ? 'bg-blue-50 text-[#2563EB]' : u.role === 'shop' ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500'
                  }`}>{u.role}</span>
                  {u.status === 'locked' && <LockSimple size={13} className="text-rose-500" />}
                </Link>
              )}
            />

            {/* Sản phẩm mới */}
            <QuickTable
              title="Sản phẩm mới thêm"
              link={{ to: '/admin/products', label: 'Quản lý sản phẩm' }}
              loading={loading}
              empty="Chưa có sản phẩm nào"
              rows={data?.recent.products ?? []}
              render={(p: AdminOverview['recent']['products'][number]) => (
                <Link to="/admin/products" key={p._id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors">
                  <SealCheck size={15} className="text-slate-300 shrink-0" />
                  <span className="text-xs font-semibold text-slate-700 flex-1 truncate">
                    {p.title} {p.shopId?.name && <span className="text-slate-400 font-normal">· {p.shopId.name}</span>}
                  </span>
                  <span className="text-xs font-bold text-slate-800 w-24 text-right">{formatPrice(p.price)}</span>
                  <span className="text-[10px] text-slate-400 w-14 text-right">Tồn: {p.stock}</span>
                </Link>
              )}
            />
          </div>
        </>
      )}
    </div>
  )
}

function QuickTable<T extends { _id: string }>({ title, link, rows, render, loading, empty }: {
  title: string
  link: { to: string; label: string }
  rows: T[]
  render: (row: T) => React.ReactNode
  loading: boolean
  empty: string
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <Link to={link.to} className="text-[11px] font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-0.5">
          {link.label} <ArrowRight size={10} weight="bold" />
        </Link>
      </div>
      {loading ? (
        <div className="p-4 space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-9 bg-slate-100 rounded-lg animate-pulse" />)}
        </div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-slate-400 font-semibold">{empty}</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {rows.map((row) => render(row))}
        </div>
      )}
    </div>
  )
}
