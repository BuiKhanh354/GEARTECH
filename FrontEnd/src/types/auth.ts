export type UserRole = 'user' | 'shop' | 'admin';
export type UserStatus = 'active' | 'locked';

export interface AuthUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string;
  shop_id?: string;
  avatar?: string;
  memberRank?: string;
  points?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

