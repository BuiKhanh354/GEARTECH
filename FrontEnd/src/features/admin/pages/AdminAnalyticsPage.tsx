import { useState, useEffect, useCallback } from 'react'
import {
  CurrencyDollar, ShoppingCart, Package, Users, WarningCircle, ArrowClockwise, ChartLineUp
} from '@phosphor-icons/react'
import { formatPrice } from '../../../utils/format'
import { adminService, type AdminOverview } from '../../../services/adminService'
import KpiCard from '../../shop/components/seller/KpiCard'

const TIME_RANGES = [
  { days: 7, label: '7 ngày' },
  { days: 30, label: '30 ngày' }
]

// Báo cáo & thống kê toàn sàn — chỉ hiển thị số liệu tính được từ dữ liệu thực.
// Doanh thu = giá trị đơn COMPLETED (doanh thu bán hàng của các shop).
// Nền tảng chưa có quy tắc tính phí/hoa hồng nên không hiển thị "doanh thu nền tảng".
export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30)
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
  const maxNewUsers = Math.max(...(data?.series.map(p => p.newUsers) ?? [1]), 1)
  const maxOrders = Math.max(...(data?.series.map(p => p.orders) ?? [1]), 1)

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ChartLineUp size={20} className="text-[#2563EB]" weight="fill" />
            Báo cáo & thống kê
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Doanh thu thống nhất tính từ đơn hàng <b>hoàn thành</b>. Đơn hủy không tính doanh thu.
          </p>
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
          <p className="text-xs font-semibold text-slate-600 mb-2">Không tải được báo cáo.</p>
          <button
            onClick={() => fetchOverview(days)}
            className="text-xs font-bold text-[#2563EB] hover:text-blue-700 underline cursor-pointer inline-flex items-center gap-1"
          >
            <ArrowClockwise size={12} /> Thử lại
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KpiCard label="Giá trị đơn hoàn tất" value={formatPrice(data?.orderValue.completed ?? 0)}
              hint={`${data?.orderStatus.completed ?? 0} đơn hoàn thành (mọi thời gian)`}
              icon={<CurrencyDollar size={18} weight="bold" />} accent="emerald" loading={loading} />
            <KpiCard label="Tổng giá trị đơn" value={formatPrice(data?.orderValue.totalAll ?? 0)}
              hint={`${data?.counts.totalOrders ?? 0} đơn toàn sàn`}
              icon={<ShoppingCart size={18} weight="bold" />} accent="blue" loading={loading} />
            <KpiCard label="Tổng sản phẩm" value={data?.counts.totalProducts ?? 0}
              hint="Mọi trạng thái"
              icon={<Package size={18} weight="bold" />} accent="violet" loading={loading} />
            <KpiCard label="Tổng người dùng" value={data?.counts.totalUsers ?? 0}
              hint={`${data?.counts.totalCustomers ?? 0} khách hàng · ${data?.counts.totalShopOwners ?? 0} chủ shop`}
              icon={<Users size={18} weight="bold" />} accent="amber" loading={loading} />
          </div>

          {/* Biểu đồ doanh thu theo ngày */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Doanh thu theo ngày (đơn hoàn tất)</h3>
              <span className="text-[11px] text-slate-400">{days} ngày qua · VND</span>
            </div>
            {loading ? (
              <div className="h-48 bg-slate-100 rounded-lg animate-pulse" />
            ) : (data?.series ?? []).every(p => p.revenue === 0) ? (
              <div className="h-48 flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs font-semibold">Chưa có đơn hoàn tất nào trong kỳ đã chọn</p>
              </div>
            ) : (
              <div className="flex items-end gap-[3px] h-48">
                {data!.series.map((p) => (
                  <div key={p.date} className="flex-1 flex flex-col justify-end h-full relative group" title={`${p.date}: ${formatPrice(p.revenue)}`}>
                    <div className="w-full rounded-t bg-[#2563EB]/85 group-hover:bg-[#2563EB] transition-colors"
                      style={{ height: `${Math.max((p.revenue / maxRevenue) * 100, p.revenue > 0 ? 4 : 1.5)}%` }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tăng trưởng tài khoản & đơn hàng */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Tăng trưởng tài khoản mới</h3>
              {loading ? (
                <div className="h-36 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <div className="flex items-end gap-[3px] h-36">
                  {data!.series.map((p) => (
                    <div key={p.date} className="flex-1 flex flex-col justify-end h-full group" title={`${p.date}: ${p.newUsers} tài khoản mới`}>
                      <div className={`w-full rounded-t ${p.newUsers > 0 ? 'bg-emerald-400 group-hover:bg-emerald-500' : 'bg-slate-100'}`}
                        style={{ height: `${Math.max((p.newUsers / maxNewUsers) * 100, p.newUsers > 0 ? 8 : 2)}%` }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-4">Số đơn hàng mới theo ngày</h3>
              {loading ? (
                <div className="h-36 bg-slate-100 rounded-lg animate-pulse" />
              ) : (
                <div className="flex items-end gap-[3px] h-36">
                  {data!.series.map((p) => (
                    <div key={p.date} className="flex-1 flex flex-col justify-end h-full group" title={`${p.date}: ${p.orders} đơn mới`}>
                      <div className={`w-full rounded-t ${p.orders > 0 ? 'bg-amber-400 group-hover:bg-amber-500' : 'bg-slate-100'}`}
                        style={{ height: `${Math.max((p.orders / maxOrders) * 100, p.orders > 0 ? 8 : 2)}%` }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ghi chú phương pháp tính */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4">
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <b>Phương pháp tính:</b> Doanh thu = tổng <code className="px-1 bg-white rounded">finalAmount</code> của đơn có
              trạng thái <code className="px-1 bg-white rounded">completed</code> (mỗi đơn chỉ đếm một lần dù có nhiều sản phẩm).
              Đơn <code className="px-1 bg-white rounded">cancelled</code> không tính doanh thu. Nền tảng hiện chưa có quy tắc
              tính phí/hoa hồng với shop nên chưa hiển thị chỉ tiêu "doanh thu nền tảng".
            </p>
          </div>
        </>
      )}
    </div>
  )
}
