
import { MiningSession, ActivePlan } from '@/lib/storage';

export interface MiningContextType {
  currentMining: MiningSession | null;
  miningProgress: number; // 0-100 percentage
  currentEarnings: number;
  timeRemaining: number; // in seconds
  miningRate: number; // coins per hour
  startMining: () => void;
  stopMining: () => void;
  isMining: boolean;
  activePlans: ActivePlan[];
  updateMiningBoost: (miningBoost: number, durationDays: number, planId: string, dailyEarnings: number, planPrice: number) => Promise<ActivePlan | null>;
  dailyEarningsUpdateTime: string;
}

export interface MiningProviderProps {
  children: React.ReactNode;
}
