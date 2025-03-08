
export interface DMIBooster {
  id: string;
  name: string;
  description: string;
  price: number;
  miningMultiplier: number;
  durationHours: number;
}

export const dmiBoosters: DMIBooster[] = [
  {
    id: "standard_booster",
    name: "Standard Booster",
    description: "Boost your mining speed for a short period",
    price: 5,
    miningMultiplier: 3, // Changed from 2x to 3x
    durationHours: 24
  },
  {
    id: "premium_booster",
    name: "Premium Booster",
    description: "Get a significant mining boost for a longer period",
    price: 20, // Changed from $15 to $20
    miningMultiplier: 5, // Changed from 3x to 5x
    durationHours: 72
  },
  {
    id: "ultimate_booster",
    name: "Ultimate Booster",
    description: "Maximize your mining speed for an extended period",
    price: 80, // Changed from $30 to $80
    miningMultiplier: 10, // Changed from 5x to 10x
    durationHours: 290 // Changed from 120 hours to 290 hours
  }
];
