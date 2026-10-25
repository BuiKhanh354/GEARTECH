import { useState, useEffect, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Storefront, PlusCircle, Receipt, HourglassMedium, Truck,
  CurrencyDollar, ShoppingCart, Package, Users, WarningCircle, Tag, ArrowRight,
  ArrowClockwise
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { shopService, type ShopAnalytics } from '../../../services/shopService'
import KpiCard from '../components/seller/KpiCard'
import StatusBadge from '../components/seller/StatusBadge'
import SalesChart from '../components/seller/SalesChart'

interface OverviewContext {
  shop: { _id: string; name: string; status: string } | null
}

const TIME_RANGES = [
  { days: 1, label: 'Hôm nay' },
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' }
]

// Trang Tổng quan Seller Centre — toàn bộ số liệu lấy từ /api/shops/me/analytics (MongoDB thực tế)
export default function SellerOverviewPage() {
  const { shop } = useOutletContext<OverviewContext>()
  const [days, setDays] = useState(7)
  const [data, setData] = useState<ShopAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchAnalytics = useCallback(async (d: number) => {
    try {
      setLoading(true)
      setError(false)
      const res = await shopService.getMyAnalytics(d)
      setData(res)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnalytics(days)
  }, [days, fetchAnalytics])

  const statusCounts = data?.statusCounts

  // Khu vực công việc cần xử lý — chỉ hiện các trạng thái tồn tại trong nghiệp vụ
  const workQueue = statusCounts ? [
    { label: 'Chờ xác nhận', count: statusCounts.pending, to: '/shop/orders?status=pending', icon: HourglassMedium, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { label: 'Đang giao', count: statusCounts.shipping, to: '/shop/orders?status=shipping', icon: Truck, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    { label: 'Cần chuẩn bị', count: statusCounts.confirmed, to: '/shop/orders?status=confirmed', icon: Package, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
    ...(data && data.inventoryAlerts.lowStockCount > 0 ? [{ label: 'Sắp hết hàng', count: data.inventoryAlerts.lowStockCount, to: '/shop/inventory', icon: WarningCircle, color: 'text-orange-600 bg-orange-50 border-orange-200' }] : []),
    ...(data && data.inventoryAlerts.outOfStockCount > 0 ? [{ label: 'Hết hàng', count: data.inventoryAlerts.outOfStockCount, to: '/shop/inventory', icon: WarningCircle, color: 'text-rose-600 bg-rose-50 border-rose-200' }] : [])
  ] : []

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối'

  return (
    <div className="space-y-5">
      {/* ============ A. CHÀO MỪNG ============ */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 truncate">
              {greeting}, {shop?.name || 'Chủ shop'}!
            </h1>
            {shop && (
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${
                shop.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {shop.status === 'active' ? 'Đang hoạt động' : `Trạng thái: ${shop.status}`}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Đây là tình hình kinh doanh của gian hàng bạn hôm nay. Hãy xử lý các đơn hàng chờ xác nhận trước tiên.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {shop && (
            <Link
              to={`/shop/${shop._id}`}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50/50 transition-colors"
            >
              <Storefront size={15} /> Xem gian hàng
            </Link>
          )}
          <Link
            to="/shop/products"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <PlusCircle size={15} weight="fill" /> Sản phẩm
          </Link>
        </div>
      </div>

      {/* ============ B. CÔNG VIỆC CẦN XỬ LÝ ============ */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 h-20 animate-pulse" />
          ))}
        </div>
      ) : workQueue.length > 0 ? (
        <div>
          <h2 className="text-sm font-bold text-slate-800 mb-2.5">Cần xử lý hôm nay</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {workQueue.map((w) => {
              const Icon = w.icon
              return (
                <Link
                  key={w.label}
                  to={w.to}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-8 h-8 rounded-lg border flex items-center justify-center ${w.color}`}>
                      <Icon size={16} weight="bold" />
                    </span>
                    <span className="text-xl font-bold text-slate-900">{w.count}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-500 mt-2 flex items-center gap-1 group-hover:text-blue-700 transition-colors">
                    {w.label} <ArrowRight size={10} weight="bold" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}

      {/* ============ C. CHỈ SỐ KINH DOANH ============ */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-bold text-slate-800">Chỉ số kinh doanh</h2>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {TIME_RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                  days === r.days ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
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
            <p className="text-xs font-semibold text-slate-600 mb-2">Không tải được chỉ số kinh doanh.</p>
            <button
              onClick={() => fetchAnalytics(days)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowClockwise size={12} /> Thử lại
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Doanh thu"
              value={formatPrice(data?.kpis.revenue ?? 0)}
              hint={`${data?.kpis.completedCount ?? 0} đơn hoàn thành trong kỳ`}
              icon={<CurrencyDollar size={18} weight="bold" />}
              accent="emerald"
              loading={loading}
            />
            <KpiCard
              label="Tổng đơn hàng"
              value={data?.kpis.ordersCount ?? 0}
              hint={`Đơn mới trong ${days === 1 ? 'hôm nay' : `${days} ngày`}`}
              icon={<ShoppingCart size={18} weight="bold" />}
              accent="blue"
              loading={loading}
            />
            <KpiCard
              label="Sản phẩm đã bán"
              value={data?.kpis.itemsSold ?? 0}
              hint="Từ đơn hoàn thành trong kỳ"
              icon={<Package size={18} weight="bold" />}
              accent="violet"
              loading={loading}
            />
            <KpiCard
              label="Giá trị đơn TB"
              value={formatPrice(data?.kpis.aov ?? 0)}
              hint="Doanh thu / đơn hoàn thành"
              icon={<Receipt size={18} weight="bold" />}
              accent="amber"
              loading={loading}
            />
            <KpiCard
              label="Người theo dõi"
              value={data?.kpis.followersCount ?? 0}
              hint="Từ dữ liệu follow thực tế"
              icon={<Users size={18} weight="bold" />}
              accent="blue"
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* ============ D. BIỂU ĐỒ + E. SẢN PHẨM BÁN CHẠY ============ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <SalesChart
            series={data?.series ?? []}
            loading={loading}
            error={error}
            onRetry={() => fetchAnalytics(days)}
          />
        </div>

        {/* E. Sản phẩm bán chạy (soldCount thực tế) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-800">Sản phẩm bán chạy</h3>
            <Link to="/shop/products" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
              Tất cả <ArrowRight size={10} weight="bold" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (data?.topProducts.length ?? 0) === 0 ? (
            <div className="py-8 text-center">
              <Package size={26} className="mx-auto text-slate-300 mb-2" />
              <p className="text-xs text-slate-400 font-semibold">Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {data!.topProducts.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-300 w-4 shrink-0">{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-base shrink-0 overflow-hidden">
                    {p.imageEmoji && p.imageEmoji.startsWith('http') ? (
                      <img src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      p.imageEmoji || '📦'
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                    <p className="text-[10px] text-slate-400">{formatPrice(p.price)} · Tồn: {p.stock}</p>
                  </div>
                  <span className="text-[11px] font-bold text-blue-600 shrink-0">{p.soldCount} đã bán</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ F. ĐƠN HÀNG GẦN ĐÂY ============ */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Đơn hàng gần đây</h3>
          <Link to="/shop/orders" className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
            Xem tất cả <ArrowRight size={10} weight="bold" />
          </Link>
        </div>
        {loading ? (
          <div className="px-5 pb-5 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : (data?.recentOrders.length ?? 0) === 0 ? (
          <div className="px-5 pb-8 pt-2 text-center">
            <Receipt size={26} className="mx-auto text-slate-300 mb-2" />
            <p className="text-xs text-slate-400 font-semibold">Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-y border-slate-100">
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-5 py-2.5">Mã đơn</th>
                  <th className="px-5 py-2.5">Sản phẩm</th>
                  <th className="px-5 py-2.5">Thời gian</th>
                  <th className="px-5 py-2.5">Tổng tiền</th>
                  <th className="px-5 py-2.5">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data!.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 text-xs font-bold text-slate-700 font-mono">
                      #{String(o._id).slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600 max-w-[220px] truncate">
                      {o.itemNames.join(', ')}
                      {o.itemCount > 2 ? ` +${o.itemCount - 2}` : ''}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(o.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-xs font-bold text-slate-800">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={o.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============ G. THÔNG BÁO & NHẮC NHỞ (chỉ khi có dữ liệu thật) ============ */}
      {data && (data.inventoryAlerts.lowStockCount > 0 || data.inventoryAlerts.outOfStockCount > 0 || data.expiringVouchers.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-3">Thông báo & nhắc nhở</h3>
          <div className="space-y-2">
            {data.inventoryAlerts.outOfStockCount > 0 && (
              <Link to="/shop/inventory" className="flex items-center gap-3 p-3 rounded-lg bg-rose-50/60 border border-rose-100 hover:border-rose-200 transition-colors group">
                <WarningCircle size={17} className="text-rose-500 shrink-0" />
                <p className="text-xs text-slate-700 flex-1">
                  <b>{data.inventoryAlerts.outOfStockCount} sản phẩm đã hết hàng</b> — đang mất khả năng bán
                </p>
                <ArrowRight size={12} className="text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {data.inventoryAlerts.lowStockCount > 0 && (
              <Link to="/shop/inventory" className="flex items-center gap-3 p-3 rounded-lg bg-amber-50/60 border border-amber-100 hover:border-amber-200 transition-colors group">
                <WarningCircle size={17} className="text-amber-500 shrink-0" />
                <p className="text-xs text-slate-700 flex-1">
                  <b>{data.inventoryAlerts.lowStockCount} sản phẩm sắp hết hàng</b> (≤5 cái): {data.inventoryAlerts.lowStock.slice(0, 2).map(p => p.title).join(', ')}{data.inventoryAlerts.lowStockCount > 2 ? '...' : ''}
                </p>
                <ArrowRight size={12} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
            {data.expiringVouchers.length > 0 && (
              <Link to="/shop/vouchers" className="flex items-center gap-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100 hover:border-blue-200 transition-colors group">
                <Tag size={17} className="text-blue-500 shrink-0" />
                <p className="text-xs text-slate-700 flex-1">
                  <b>{data.expiringVouchers.length} voucher sắp hết hạn</b> trong 7 ngày tới
                </p>
                <ArrowRight size={12} className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
