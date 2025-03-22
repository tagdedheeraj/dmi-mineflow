
import { updateUsdtEarnings } from './earningsUpdater';
import { canClaimPlanEarnings } from './claimStatus';
import { recordPlanClaim } from './claimRecorder';

// Function to claim USDT earnings for a plan
export const claimPlanEarnings = async (userId: string, planId: string, dailyEarnings: number): Promise<boolean> => {
  try {
    console.log(`Attempting to claim ${dailyEarnings} USDT for plan ${planId} by user ${userId}`);
    // Check if user can claim
    const canClaim = await canClaimPlanEarnings(userId, planId);
    
    if (!canClaim) {
      console.log(`User ${userId} cannot claim earnings for plan ${planId} yet`);
      return false;
    }
    
    // Update user's USDT earnings
    const updatedUser = await updateUsdtEarnings(
      userId,
      dailyEarnings,
      planId,
      true,
      'manual_claim'
    );
    
    if (!updatedUser) {
      console.error(`Failed to update USDT earnings for user ${userId}`);
      return false;
    }
    
    // Record the claim
    const claimRecorded = await recordPlanClaim(userId, planId, dailyEarnings);
    if (!claimRecorded) {
      console.error(`Failed to record claim for user ${userId}, plan ${planId}`);
      // We'll continue anyway since the earnings were already added
    }
    
    console.log(`Successfully claimed ${dailyEarnings} USDT for plan ${planId} by user ${userId}`);
    return true;
  } catch (error) {
    console.error("Error claiming plan earnings:", error);
    return false;
  }
};
