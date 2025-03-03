
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

// DMI coin value in USD
export const DMI_COIN_VALUE = 0.0521;

// NowPayments API key
export const NOW_PAYMENTS_API_KEY = "0BYK16S-PK24G13-NQ0TYHR-61DR2R4";
