
// Add startDate to ActivePlan interface
export interface ActivePlan {
  id: string;
  boostMultiplier: number;
  startDate: string; // ISO date string
  expiresAt: string; // ISO date string
  active: boolean;
}
