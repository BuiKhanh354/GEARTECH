import { useState } from 'react'
import { ChartBar, Warning } from '@phosphor-icons/react'
import { formatPrice } from '../../../../utils/format'

export interface SeriesPoint {
  date: string
  revenue: number
  orders: number
}

interface SalesChartProps {
  series: SeriesPoint[]
  loading?: boolean
  error?: boolean
  onRetry?: () => void
}

// Biểu đồ cột doanh thu theo ngày (SVG thuần, không thêm thư viện).
// Dữ liệu đến từ /api/shops/me/analytics, khớp với bộ lọc thời gian đã chọn.
export default function SalesChart({ series, loading, error, onRetry }: SalesChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="h-4 w-40 bg-slate-100 rounded animate-pulse mb-4" />
        <div className="h-48 flex items-end gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex-1 bg-slate-100 rounded-t animate-pulse" style={{ height: `${30 + ((i * 37) % 60)}%` }} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm text-center">
        <Warning size={28} className="mx-auto text-rose-500 mb-2" />
        <p className="text-xs font-semibold text-slate-600 mb-3">Không tải được dữ liệu biểu đồ.</p>
        {onRetry && (
          <button onClick={onRetry} className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer">
            Thử lại
          </button>
        )}
      </div>
    )
  }

  const max = Math.max(...series.map(p => p.revenue), 1)
  const hasData = series.some(p => p.revenue > 0 || p.orders > 0)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ChartBar size={16} className="text-blue-600" weight="fill" />
          Doanh thu theo ngày
        </h3>
        <span className="text-[11px] text-slate-400">Đơn hoàn tất · VND</span>
      </div>

      {!hasData ? (
        <div className="h-48 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-lg mt-3">
          <ChartBar size={28} className="mb-2 opacity-40" />
          <p className="text-xs font-semibold">Chưa có đơn hàng nào trong kỳ đã chọn</p>
          <p className="text-[11px] mt-0.5">Thử mở rộng khoảng thời gian lên 30 ngày</p>
        </div>
      ) : (
        <div className="relative mt-4">
          <div className="flex items-end gap-[3px] h-44">
            {series.map((p, i) => {
              const h = Math.max((p.revenue / max) * 100, p.revenue > 0 ? 4 : 1.5)
              const isHover = hoverIdx === i
              return (
                <div
                  key={p.date}
                  className="flex-1 flex flex-col justify-end h-full relative"
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  {isHover && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-slate-900 text-white text-[10px] rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-lg pointer-events-none">
                      <div className="font-bold">{formatPrice(p.revenue)}</div>
                      <div className="text-slate-300">{p.orders} đơn mới · {p.date.slice(8)}/{p.date.slice(5, 7)}</div>
                    </div>
                  )}
                  <div
                    className={`w-full rounded-t transition-colors ${isHover ? 'bg-blue-500' : 'bg-blue-400/80 hover:bg-blue-500'}`}
                    style={{ height: `${h}%` }}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1.5">
            <span>{formatShortDate(series[0]?.date)}</span>
            <span>{formatShortDate(series[series.length - 1]?.date)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

function formatShortDate(date?: string) {
  if (!date) return ''
  return `${date.slice(8)}/${date.slice(5, 7)}`
}
