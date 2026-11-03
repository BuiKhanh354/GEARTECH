import api from '../api/client';

export interface ProvinceItem {
  ProvinceID: number;
  ProvinceName: string;
  Code?: string;
}

export interface DistrictItem {
  DistrictID: number;
  ProvinceID: number;
  DistrictName: string;
  Code?: string;
}

export interface WardItem {
  WardCode: string;
  DistrictID: number;
  WardName: string;
}

export interface CalculateFeeParams {
  shopId?: string;
  fromDistrictId?: number;
  toDistrictId: number;
  toWardCode: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  insuranceValue?: number;
  serviceTypeId?: number;
}

export interface CreateShipmentParams {
  orderId: string;
  weight?: number;
  length?: number;
  width?: number;
  height?: number;
  note?: string;
  requiredNote?: 'CHOTHUHANG' | 'CHOXEMHANGKHONGTHU' | 'KHONGCHOXEMHANG';
}

export interface ShipmentTrackingResponse {
  hasShipment: boolean;
  trackingCode?: string;
  shippingStatus?: string;
  carrier?: string;
  expectedDeliveryDate?: string;
  shipment?: any;
  liveDetail?: any;
  timeline?: Array<{
    status: string;
    description: string;
    updated_at: string;
    location?: string;
  }>;
  message?: string;
}

export const shippingService = {
  // Lấy danh sách Tỉnh/Thành
  getProvinces: async (): Promise<ProvinceItem[]> => {
    const res = await api.get('/shipping/provinces');
    return Array.isArray(res.data) ? res.data : [];
  },

  // Lấy danh sách Quận/Huyện
  getDistricts: async (provinceId: number | string): Promise<DistrictItem[]> => {
    const res = await api.get(`/shipping/districts?province_id=${provinceId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // Lấy danh sách Phường/Xã
  getWards: async (districtId: number | string): Promise<WardItem[]> => {
    const res = await api.get(`/shipping/wards?district_id=${districtId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  // Tính phí vận chuyển GHN
  calculateFee: async (params: CalculateFeeParams) => {
    const res = await api.post('/shipping/calculate-fee', params);
    return res.data;
  },

  // Chủ shop tạo vận đơn GHN
  createShipment: async (params: CreateShipmentParams) => {
    const res = await api.post('/shipping/create', params);
    return res.data;
  },

  // Tra cứu hành trình vận chuyển
  getTracking: async (orderId: string): Promise<ShipmentTrackingResponse> => {
    const res = await api.get(`/shipping/track/${orderId}`);
    return res.data;
  },

  // Hủy vận đơn GHN
  cancelShipment: async (orderId: string, reason?: string) => {
    const res = await api.post(`/shipping/cancel/${orderId}`, { reason });
    return res.data;
  }
};
