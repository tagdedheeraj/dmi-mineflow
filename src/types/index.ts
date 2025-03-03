
export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  balance: number;
  usdtAddress?: string;
  usdtEarnings: number;
  isAdmin?: boolean;
  deviceId?: string;
}
