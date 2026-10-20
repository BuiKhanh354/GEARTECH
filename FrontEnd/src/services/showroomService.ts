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
}

export const showroomService = {
  getShowrooms: async () => {
    const res = await apiClient.get<ShowroomItem[]>('/showrooms')
    return res.data
  }
}
