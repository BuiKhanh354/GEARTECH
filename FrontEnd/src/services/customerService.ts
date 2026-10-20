import apiClient from '../api/client';

export interface CustomerShippingAddress {
  receiverName?: string;
  receiverPhone?: string;
  detailAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
}

export interface CustomerItem {
  _id: string;
  userId?: any;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  shippingAddress?: CustomerShippingAddress;
  addresses?: Array<{
    _id?: string;
    title: string;
    receiverName: string;
    receiverPhone: string;
    detailAddress: string;
    province?: string;
    district?: string;
    ward?: string;
    isDefault: boolean;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCheckoutInfo {
  customerId: string;
  userId?: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress: CustomerShippingAddress;
}

export interface CustomerListResponse {
  customers: CustomerItem[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export const customerService = {
  // 1. Khách hàng lấy thông tin hồ sơ của chính mình
  async getMyProfile(): Promise<{ message: string; customer: CustomerItem }> {
    const res = await apiClient.get('/customers/me');
    return res.data;
  },

  // 2. Khách hàng cập nhật thông tin hồ sơ của chính mình
  async updateMyProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
    address?: string;
    shippingAddress?: CustomerShippingAddress;
  }): Promise<{ message: string; customer: CustomerItem; user: any }> {
    const res = await apiClient.put('/customers/me', data);
    return res.data;
  },

  // 3. Lấy thông tin khách hàng phục vụ đặt hàng & checkout
  async getCheckoutInfo(): Promise<CustomerCheckoutInfo> {
    const res = await apiClient.get('/customers/checkout-info');
    return res.data;
  },

  // 4. Lấy chi tiết khách hàng bằng ID
  async getCustomerById(id: string): Promise<CustomerItem> {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data;
  },

  // 5. Admin lấy danh sách khách hàng
  async getCustomers(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<CustomerListResponse> {
    const res = await apiClient.get('/customers', { params });
    return res.data;
  },

  // 6. Admin thêm mới hồ sơ khách hàng thủ công
  async createCustomer(data: {
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    status?: 'active' | 'inactive';
    shippingAddress?: CustomerShippingAddress;
  }): Promise<{ message: string; customer: CustomerItem }> {
    const res = await apiClient.post('/customers', data);
    return res.data;
  }
};

export default customerService;
