import { HourglassMedium, CheckCircle, Truck, XCircle, Package } from '@phosphor-icons/react'

// Badge trạng thái đơn hàng dùng thống nhất toàn Seller Centre
// Trạng thái khớp với nghiệp vụ backend: pending | confirmed | shipping | completed | cancelled
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof Package }> = {
  pending: { label: 'Chờ xác nhận', className: 'bg-amber-50 text-amber-700 border-amber-200', icon: HourglassMedium },
  confirmed: { label: 'Đã xác nhận', className: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: CheckCircle },
  shipping: { label: 'Đang giao', className: 'bg-blue-50 text-blue-700 border-blue-200', icon: Truck },
  completed: { label: 'Hoàn thành', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  cancelled: { label: 'Đã hủy', className: 'bg-rose-50 text-rose-700 border-rose-200', icon: XCircle }
}

export default function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold ${cfg.className}`}>
      <Icon size={12} weight="bold" />
      {cfg.label}
    </span>
  )
}

// Trạng thái badge dùng cho sản phẩm
export function ProductStatusBadge({ status, stock }: { status: string; stock: number }) {
  if (status === 'inactive') {
    return <span className="inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-slate-100 text-slate-500 border-slate-200">Ngừng bán</span>
  }
  if (status === 'hidden') {
    return <span className="inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-violet-50 text-violet-700 border-violet-200">Đang ẩn</span>
  }
  if (status === 'out_of_stock' || stock === 0) {
    return <span className="inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-rose-50 text-rose-700 border-rose-200">Hết hàng</span>
  }
  if (stock <= 5) {
    return <span className="inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-amber-50 text-amber-700 border-amber-200">Sắp hết ({stock})</span>
  }
  return <span className="inline-flex px-2 py-0.5 rounded-md border text-[11px] font-semibold bg-emerald-50 text-emerald-700 border-emerald-200">Đang bán ({stock})</span>
}
