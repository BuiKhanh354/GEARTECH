import { apiClient } from '../api/client';

export interface CareBookingItem {
  _id: string;
  bookingCode: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  } | null;
  fullName: string;
  phone: string;
  address?: string;
  deviceType: 'laptop' | 'desktop' | 'vga' | 'other';
  servicePackage: 'deep-clean' | 'hardware-repair' | 'data-recovery' | 'care-plus';
  servicePackageName: string;
  price: number;
  issueDescription?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  technicianName?: string;
  adminNote?: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareBookingPayload {
  fullName: string;
  phone: string;
  address?: string;
  deviceType: string;
  servicePackage: string;
  issueDescription?: string;
}

export interface CareStats {
  total: number;
  pending: number;
  confirmed: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

export interface GetAdminBookingsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetAdminBookingsResponse {
  bookings: CareBookingItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const careService = {
  createBooking: async (payload: CreateCareBookingPayload): Promise<{ message: string; booking: CareBookingItem }> => {
    const res = await apiClient.post('/care/bookings', payload);
    return res.data;
  },

  getMyBookings: async (): Promise<CareBookingItem[]> => {
    const res = await apiClient.get('/care/bookings/my');
    return res.data;
  },

  getAdminBookings: async (params?: GetAdminBookingsParams): Promise<GetAdminBookingsResponse> => {
    const res = await apiClient.get('/care/admin/bookings', { params });
    return res.data;
  },

  updateBooking: async (
    id: string,
    payload: { status?: string; technicianName?: string; adminNote?: string; price?: number }
  ): Promise<{ message: string; booking: CareBookingItem }> => {
    const res = await apiClient.put(`/care/admin/bookings/${id}`, payload);
    return res.data;
  },

  getAdminStats: async (): Promise<CareStats> => {
    const res = await apiClient.get('/care/admin/stats');
    return res.data;
  }
};

