export interface Account {
  id: number;
  accountId: number;
  username: string;
  password?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'DISABLED';
  balance: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  role?: string;
}
