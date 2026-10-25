import { useState, useEffect, useCallback } from 'react'
import {
  CurrencyDollar, ShoppingCart, Package, Users, WarningCircle,
  ArrowClockwise, ChartLineUp, Receipt
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { shopService, type ShopAnalytics } from '../../../services/shopService'
import KpiCard from '../components/seller/KpiCard'
import SalesChart from '../components/seller/SalesChart'
import { ProductStatusBadge } from '../components/seller/StatusBadge'

const TIME_RANGES = [
  { days: 1, label: 'Hôm nay' },
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' }
]

// Phân tích kinh doanh — dữ liệu thật từ /api/shops/me/analytics
// Chỉ hiển thị các chỉ số có nguồn dữ liệu: doanh thu đơn hoàn tất, đơn hàng,
// sản phẩm đã bán, người theo dõi. Không tạo chỉ số giả (lượt xem, chuyển đổi...).
export default function SellerAnalyticsPage() {
  const [days, setDays] = useState(30)
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ChartLineUp size={20} className="text-blue-600" weight="fill" />
            Phân tích kinh doanh
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh thu tính từ đơn hàng <b>hoàn thành</b> — nhất quán với chính sách trạng thái đơn hiện tại
          </p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 w-fit">
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
          <p className="text-xs font-semibold text-slate-600 mb-2">Không tải được dữ liệu phân tích.</p>
          <button
            onClick={() => fetchAnalytics(days)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowClockwise size={12} /> Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard
              label="Doanh thu"
              value={formatPrice(data?.kpis.revenue ?? 0)}
              hint={`${data?.kpis.completedCount ?? 0} đơn hoàn thành`}
              icon={<CurrencyDollar size={18} weight="bold" />}
              accent="emerald"
              loading={loading}
            />
            <KpiCard
              label="Tổng đơn hàng"
              value={data?.kpis.ordersCount ?? 0}
              hint={`Trong ${days === 1 ? 'hôm nay' : `${days} ngày qua`}`}
              icon={<ShoppingCart size={18} weight="bold" />}
              accent="blue"
              loading={loading}
            />
            <KpiCard
              label="Số lượng bán"
              value={data?.kpis.itemsSold ?? 0}
              hint="Sản phẩm từ đơn hoàn thành"
              icon={<Package size={18} weight="bold" />}
              accent="violet"
              loading={loading}
            />
            <KpiCard
              label="Giá trị đơn TB"
              value={formatPrice(data?.kpis.aov ?? 0)}
              hint="AOV = Doanh thu / đơn hoàn thành"
              icon={<Receipt size={18} weight="bold" />}
              accent="amber"
              loading={loading}
            />
          </div>

          {/* Biểu đồ */}
          <SalesChart
            series={data?.series ?? []}
            loading={loading}
            error={error}
            onRetry={() => fetchAnalytics(days)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Hiệu suất sản phẩm */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Hiệu suất sản phẩm</h3>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}
                </div>
              ) : (data?.topProducts.length ?? 0) === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400 font-semibold">Chưa có dữ liệu sản phẩm</p>
              ) : (
                <div className="space-y-2.5">
                  {data!.topProducts.map((p, i) => (
                    <div key={p._id} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-300 w-4">{i + 1}</span>
                      <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center text-base shrink-0 overflow-hidden">
                        {p.imageEmoji && p.imageEmoji.startsWith('http') ? (
                          <img src={p.imageEmoji} alt={p.title} className="w-full h-full object-cover" />
                        ) : (p.imageEmoji || '📦')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 truncate">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{formatPrice(p.price)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-blue-600">{p.soldCount} đã bán</p>
                        <p className="text-[10px] text-slate-400">Tồn: {p.stock}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Theo dõi & tồn kho */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Lượt theo dõi gian hàng</h3>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Users size={19} weight="bold" />
                  </span>
                  <div>
                    <p className="text-xl font-bold text-slate-900">{data?.kpis.followersCount ?? 0}</p>
                    <p className="text-[11px] text-slate-400">Người dùng đang theo dõi shop (dữ liệu follow thực tế)</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-bold text-slate-800 mb-3">Cảnh báo tồn kho</h3>
                {loading ? (
                  <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ) : (data?.inventoryAlerts.lowStockCount ?? 0) === 0 && (data?.inventoryAlerts.outOfStockCount ?? 0) === 0 ? (
                  <p className="text-xs text-slate-400 font-semibold py-3 text-center">Tồn kho ổn — không có cảnh báo</p>
                ) : (
                  <div className="space-y-1.5">
                    {data!.inventoryAlerts.outOfStock.map((p) => (
                      <div key={p._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-rose-50/70">
                        <span className="text-xs font-semibold text-slate-700 truncate">{p.title}</span>
                        <ProductStatusBadge status="out_of_stock" stock={0} />
                      </div>
                    ))}
                    {data!.inventoryAlerts.lowStock.map((p) => (
                      <div key={p._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50/70">
                        <span className="text-xs font-semibold text-slate-700 truncate">{p.title}</span>
                        <ProductStatusBadge status="active" stock={p.stock} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
