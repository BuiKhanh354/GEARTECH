import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../../api/client'
import AdminVouchersTab from '../../profile/components/admin/AdminVouchersTab'

// Khuyến mãi — tái sử dụng AdminVouchersTab. Tải TẤT CẢ voucher (gồm cả
// voucher toàn sàn và voucher của shop) qua /api/vouchers/admin để Admin
// phân biệt và vô hiệu hóa đúng quyền (cập nhật trạng thái, không xóa bản ghi).
export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadVouchers = useCallback(async () => {
    try {
      setError(false)
      const res = await apiClient.get('/vouchers/admin')
      setVouchers(Array.isArray(res.data) ? res.data : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadVouchers()
  }, [loadVouchers])

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-sm">
        <p className="text-xs font-semibold text-slate-600">Không tải được danh sách voucher.</p>
        <button onClick={() => loadVouchers()} className="mt-2 text-xs font-bold text-[#2563EB] underline cursor-pointer">Thử lại</button>
      </div>
    )
  }

  return <AdminVouchersTab token={localStorage.getItem('token')} dbVouchers={vouchers} onRefresh={loadVouchers} />
}
