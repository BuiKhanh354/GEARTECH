import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../../api/client'
import AdminShowroomsTab from '../../profile/components/admin/AdminShowroomsTab'

// Showroom GPS — tái sử dụng AdminShowroomsTab (thêm/sửa/xóa showroom bản đồ)
export default function AdminShowroomsPage() {
  const [showrooms, setShowrooms] = useState<any[]>([])
  const [shopsList, setShopsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async () => {
    try {
      setError(false)
      const [srRes, shopRes] = await Promise.all([
        apiClient.get('/showrooms'),
        apiClient.get('/shops')
      ])
      setShowrooms(Array.isArray(srRes.data) ? srRes.data : [])
      setShopsList(Array.isArray(shopRes.data) ? shopRes.data : [])
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

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
        <p className="text-xs font-semibold text-slate-600">Không tải được dữ liệu showroom.</p>
        <button onClick={() => load()} className="mt-2 text-xs font-bold text-[#2563EB] underline cursor-pointer">Thử lại</button>
      </div>
    )
  }

  return <AdminShowroomsTab token={localStorage.getItem('token')} dbShowrooms={showrooms} shopsList={shopsList} onRefresh={load} />
}
