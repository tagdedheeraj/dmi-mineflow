
import { loadMiningPlansFromFirestore } from '@/lib/planManagement';

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
    dailyEarnings: 0.81,  // Updated from 0.1
    miningBoost: 1.2,
    totalEarnings: 27,
    withdrawalTime: "48-72 hour USDT withdrawal"
  },
  {
    id: "pro",
    name: "Pro Miner Plan",
    price: 100,
    duration: 28,
    dailyEarnings: 4.67,  // Updated from 1.1
    miningBoost: 2,
    totalEarnings: 125,
    withdrawalTime: "24-48 hour USDT withdrawal"
  },
  {
    id: "expert",
    name: "Expert Miner Plan",
    price: 200,
    duration: 39,
    dailyEarnings: 7.21,  // Updated from 2.08
    miningBoost: 3,
    totalEarnings: 280,
    withdrawalTime: "24 hour USDT withdrawal"
  },
  {
    id: "master",
    name: "Master Miner Plan",
    price: 500,
    duration: 59,
    dailyEarnings: 13.47,  // Updated from 5
    miningBoost: 4,
    totalEarnings: 800,
    withdrawalTime: "Instant withdrawal"
  },
  {
    id: "diamond",
    name: "Diamond Miner Plan",
    price: 1000,
    duration: 90,
    dailyEarnings: 22.31,  // Updated from 11.2
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
    dailyEarnings: 44.61,  // Updated from 25
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
    dailyEarnings: 92.00,  // Updated from 52
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
    dailyEarnings: 142.91,  // Updated from 89
    miningBoost: 20,
    totalEarnings: 22000,
    withdrawalTime: "Instant withdrawal",
    limitedTo: "Limited to first 50 users"
  }
];

// DMI coin value in USD
export const DMI_COIN_VALUE = 0.0521;

// NowPayments API key
export const NOW_PAYMENTS_API_KEY = "0BYK16S-PK24G13-NQ0TYHR-61DR2R4";

// Cache for loaded plans
let cachedPlans: MiningPlan[] | null = null;

// Add a dynamic import method for loading from Firestore
export const reloadPlans = async (): Promise<MiningPlan[]> => {
  try {
    console.log("Reloading mining plans from Firestore...");
    // Clear cache to force fresh reload
    cachedPlans = null;
    
    // Try to get plans from Firestore
    const firestorePlans = await loadMiningPlansFromFirestore();
    
    if (firestorePlans && firestorePlans.length > 0) {
      console.log("Loaded mining plans from Firestore:", firestorePlans);
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
