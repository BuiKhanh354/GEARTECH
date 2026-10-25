import apiClient from '../api/client'

export interface ShowroomItem {
  _id?: string
  id?: string
  name: string
  address: string
  phone: string
  hours: string
  features: string[]
  lat: number
  lng: number
  city: 'hcm' | 'hanoi' | 'danang'
  mapUrl: string
  shopId?: string | { _id: string; name?: string; shop_name?: string; logo?: string; category?: string } | null
}

export interface ShowroomPayload {
  name: string
  address: string
  phone: string
  hours: string
  features: string[]
  lat: number
  lng: number
  city: 'hcm' | 'hanoi' | 'danang'
  mapUrl: string
  shopId?: string | null
}

export const showroomService = {
  getShowrooms: async () => {
    const res = await apiClient.get<ShowroomItem[]>('/showrooms')
    return res.data
  },

  // D2: Admin thêm showroom mới
  createShowroom: async (payload: ShowroomPayload): Promise<{ message: string; showroom: ShowroomItem }> => {
    const res = await apiClient.post<{ message: string; showroom: ShowroomItem }>('/showrooms', payload)
    return res.data
  },

  // D2: Admin cập nhật showroom
  updateShowroom: async (id: string, payload: Partial<ShowroomPayload>): Promise<{ message: string; showroom: ShowroomItem }> => {
    const res = await apiClient.put<{ message: string; showroom: ShowroomItem }>(`/showrooms/${id}`, payload)
    return res.data
  },

  // D2: Admin xóa showroom
  deleteShowroom: async (id: string): Promise<{ message: string }> => {
    const res = await apiClient.delete<{ message: string }>(`/showrooms/${id}`)
    return res.data
  }
}
