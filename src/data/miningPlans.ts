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
    dailyEarnings: 0.81,
    miningBoost: 1.2,
    totalEarnings: 27,
    withdrawalTime: "48-72 hour USDT withdrawal"
  },
  {
    id: "pro",
    name: "Pro Miner Plan",
    price: 100,
    duration: 28,
    dailyEarnings: 4.67,
    miningBoost: 2,
    totalEarnings: 125,
    withdrawalTime: "24-48 hour USDT withdrawal"
  },
  {
    id: "expert",
    name: "Expert Miner Plan",
    price: 200,
    duration: 39,
    dailyEarnings: 7.21,
    miningBoost: 3,
    totalEarnings: 280,
    withdrawalTime: "24 hour USDT withdrawal"
  },
  {
    id: "master",
    name: "Master Miner Plan",
    price: 500,
    duration: 59,
    dailyEarnings: 13.47,
    miningBoost: 4,
    totalEarnings: 800,
    withdrawalTime: "Instant withdrawal"
  },
  {
    id: "diamond",
    name: "Diamond Miner Plan",
    price: 1000,
    duration: 90,
    dailyEarnings: 22.31,
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
    dailyEarnings: 44.61,
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
    dailyEarnings: 92.00,
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
    dailyEarnings: 142.91,
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
    // Clear localStorage cache
    window.localStorage.removeItem('cachedPlans');
    window.localStorage.removeItem('plansLastUpdated');
    
    // Try to get plans from Firestore
    const firestorePlans = await loadMiningPlansFromFirestore();
    
    if (firestorePlans && firestorePlans.length > 0) {
      console.log("Loaded mining plans from Firestore:", firestorePlans);
      cachedPlans = firestorePlans;
      
      // Store in localStorage for faster access
      window.localStorage.setItem('cachedPlans', JSON.stringify(firestorePlans));
      window.localStorage.setItem('plansLastUpdated', Date.now().toString());
      
      return firestorePlans;
    }
    
    // If no plans in Firestore, use local plans and update Firestore with them
    console.log("Using default mining plans and updating Firestore with them");
    
    // Update Firestore with default plans if nothing was found
    try {
      const { updateMiningPlans } = await import('@/lib/planManagement');
      await updateMiningPlans(miningPlans);
      console.log("Firestore updated with default plans");
    } catch (updateError) {
      console.error("Failed to update Firestore with default plans:", updateError);
    }
    
    return miningPlans;
  } catch (error) {
    console.error("Error loading plans:", error);
    return miningPlans;
  }
};

// Get plans (from cache, Firestore, or local)
export const getPlans = async (): Promise<MiningPlan[]> => {
  // Check if we have a recent cached version in localStorage
  const cachedPlansString = window.localStorage.getItem('cachedPlans');
  const lastUpdated = window.localStorage.getItem('plansLastUpdated');
  
  // Use cached plans if they exist and are less than 5 minutes old
  if (cachedPlansString && lastUpdated) {
    const lastUpdatedTime = parseInt(lastUpdated);
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    if (lastUpdatedTime > fiveMinutesAgo) {
      try {
        const localCachedPlans = JSON.parse(cachedPlansString) as MiningPlan[];
        console.log("Using cached plans from localStorage:", localCachedPlans);
        cachedPlans = localCachedPlans;
        return localCachedPlans;
      } catch (e) {
        console.error("Error parsing cached plans:", e);
      }
    }
  }
  
  // If memory cache exists, use it
  if (cachedPlans) {
    console.log("Returning cached plans from memory:", cachedPlans);
    return cachedPlans;
  }
  
  // Otherwise reload plans
  return await reloadPlans();
};

// Force direct update of plans to Firestore
export const forceUpdatePlansToFirestore = async (): Promise<boolean> => {
  try {
    console.log("Forcing update of plans to Firestore with latest values");
    const { updateMiningPlans } = await import('@/lib/planManagement');
    const result = await updateMiningPlans(miningPlans);
    
    // Clear all caches to force reload
    cachedPlans = null;
    window.localStorage.removeItem('cachedPlans');
    window.localStorage.removeItem('plansLastUpdated');
    
    console.log("Plans forcefully updated in Firestore:", result);
    return result;
  } catch (error) {
    console.error("Error forcing plan update:", error);
    return false;
  }
};
