
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a duration in seconds to "HH:MM:SS" format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  const pad = (num: number) => num.toString().padStart(2, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Format a number with commas for thousands
 */
export function formatNumber(num: number | string): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Calculate future date based on days
 */
export function calculateFutureDate(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * Format currency in USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Calculate daily, weekly, and monthly earnings from active plans
 */
export function calculateEarningsFromPlans(activePlans: any[], plansData: any[]) {
  const dailyEarnings = activePlans.reduce((total, plan) => {
    // Only count plans that haven't expired
    if (new Date() < new Date(plan.expiresAt)) {
      const planInfo = plansData.find(p => p.id === plan.id);
      return total + (planInfo?.dailyEarnings || 0);
    }
    return total;
  }, 0);
  
  return {
    daily: dailyEarnings,
    weekly: dailyEarnings * 7,
    monthly: dailyEarnings * 30
  };
}

/**
 * Returns a formatted date string
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
