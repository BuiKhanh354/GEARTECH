import type { ReactNode } from 'react'

interface KpiCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  hint?: string
  loading?: boolean
  accent?: 'blue' | 'emerald' | 'amber' | 'violet' | 'rose'
}

const ACCENT_STYLES: Record<NonNullable<KpiCardProps['accent']>, string> = {
  blue: 'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
  rose: 'bg-rose-50 text-rose-600'
}

// Thẻ KPI dùng chung cho Seller Centre (dữ liệu truyền vào từ API, không hardcode)
export default function KpiCard({ label, value, icon, hint, loading, accent = 'blue' }: KpiCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{label}</span>
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ACCENT_STYLES[accent]}`}>
          {icon}
        </span>
      </div>
      {loading ? (
        <div className="h-7 w-24 bg-slate-100 rounded animate-pulse mt-2" />
      ) : (
        <div className="text-xl font-bold text-slate-900 mt-1.5 leading-tight truncate">{value}</div>
      )}
      {hint && !loading && <div className="text-[11px] text-slate-400 mt-1">{hint}</div>}
    </div>
  )
}
