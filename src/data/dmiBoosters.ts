
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
    miningMultiplier: 2,
    durationHours: 24
  },
  {
    id: "premium_booster",
    name: "Premium Booster",
    description: "Get a significant mining boost for a longer period",
    price: 15,
    miningMultiplier: 3,
    durationHours: 72
  },
  {
    id: "ultimate_booster",
    name: "Ultimate Booster",
    description: "Maximize your mining speed for an extended period",
    price: 30,
    miningMultiplier: 5,
    durationHours: 120
  }
];
