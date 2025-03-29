import { loadMiningPlansFromFirestore } from '@/lib/planManagement';
import { getDmiCoinValue } from '@/lib/firestore/settingsService';

export interface MiningPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  dailyEarnings: number;
  miningBoost: number;
  totalEarnings: number;
  withdrawalTime: string;
  limitedTo?: string;
}

export const miningPlans: MiningPlan[] = [
  {
    id: "starter",
    name: "Starter Plan",
    price: 20,
    duration: 28,
    dailyEarnings: 0.96,
    miningBoost: 1.2,
    totalEarnings: 27,
    withdrawalTime: "48-72 hour USDT withdrawal"
  },
  {
    id: "pro",
    name: "Pro Miner Plan",
    price: 100,
    duration: 28,
    dailyEarnings: 4.46,
    miningBoost: 2,
    totalEarnings: 125,
    withdrawalTime: "24-48 hour USDT withdrawal"
  },
  {
    id: "expert",
    name: "Expert Miner Plan",
    price: 200,
    duration: 39,
    dailyEarnings: 7.18,
    miningBoost: 3,
    totalEarnings: 280,
    withdrawalTime: "24 hour USDT withdrawal"
  },
  {
    id: "master",
    name: "Master Miner Plan",
    price: 500,
    duration: 59,
    dailyEarnings: 13.56,
    miningBoost: 4,
    totalEarnings: 800,
    withdrawalTime: "Instant withdrawal"
  },
  {
    id: "diamond",
    name: "Diamond Miner Plan",
    price: 1000,
    duration: 90,
    dailyEarnings: 24.44,
    miningBoost: 5,
    totalEarnings: 2200,
    withdrawalTime: "Instant withdrawal",
    limitedTo: "Limited to first 300 users"
  },
  {
    id: "ultimate",
    name: "Ultimate Miner Plan",
    price: 2000,
    duration: 102,
    dailyEarnings: 44.12,
    miningBoost: 6,
    totalEarnings: 4500,
    withdrawalTime: "Instant withdrawal",
    limitedTo: "Limited to first 200 users"
  },
  {
    id: "legend",
    name: "Legend Miner Plan",
    price: 5000,
    duration: 125,
    dailyEarnings: 96,
    miningBoost: 7,
    totalEarnings: 11200,
    withdrawalTime: "Instant withdrawal",
    limitedTo: "Limited to first 100 users"
  },
  {
    id: "supreme",
    name: "Supreme Miner Plan",
    price: 10000,
    duration: 169,
    dailyEarnings: 130.18,
    miningBoost: 20,
    totalEarnings: 22000,
    withdrawalTime: "Instant withdrawal",
    limitedTo: "Limited to first 50 users"
  }
];

// Default DMI coin value in USD (this will be used as fallback)
export const DEFAULT_DMI_COIN_VALUE = 0.1732;

// DMI coin value in USD - initially set to default value but will be updated
export let DMI_COIN_VALUE = DEFAULT_DMI_COIN_VALUE;

// Function to get the current DMI coin value (fetches from Firestore)
export const getCurrentDmiCoinValue = async (): Promise<number> => {
  try {
    const value = await getDmiCoinValue();
    DMI_COIN_VALUE = value; // Update the global value
    return value;
  } catch (error) {
    console.error("Error getting current DMI coin value:", error);
    return DEFAULT_DMI_COIN_VALUE;
  }
};

// Cache for loaded plans
let cachedPlans: MiningPlan[] | null = null;

// Add a dynamic import method for loading from Firestore
export const reloadPlans = async (): Promise<MiningPlan[]> => {
  try {
    // Try to get plans from Firestore
    const firestorePlans = await loadMiningPlansFromFirestore();
    
    // Also update the DMI coin value while we're at it
    await getCurrentDmiCoinValue();
    
    if (firestorePlans && firestorePlans.length > 0) {
      console.log("Loaded mining plans from Firestore:", firestorePlans.length);
      cachedPlans = firestorePlans;
      return firestorePlans;
    }
    
    // If no plans in Firestore, use local plans
    console.log("Using default mining plans");
    return miningPlans;
  } catch (error) {
    console.error("Error loading plans:", error);
    return miningPlans;
  }
};

// Get plans (from cache, Firestore, or local)
export const getPlans = async (): Promise<MiningPlan[]> => {
  if (cachedPlans) {
    return cachedPlans;
  }
  
  return await reloadPlans();
};
