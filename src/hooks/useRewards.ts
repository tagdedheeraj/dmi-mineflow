
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTaskCompletion } from './useTaskCompletion';
import { fetchRewardsData, updateRewardsData } from '@/lib/rewards/rewardsTracking';

const useRewards = () => {
  const { user } = useAuth();
  const [rewardsData, setRewardsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const taskCompletion = useTaskCompletion();

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchRewardsData(user.id)
        .then(data => {
          setRewardsData(data);
        })
        .catch(error => {
          console.error("Error fetching rewards data:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const updateRewards = async (adsWatched: number, earnings: number) => {
    if (!user || !rewardsData) return false;
    
    setLoading(true);
    try {
      const success = await updateRewardsData(
        user.id, 
        rewardsData.adsWatched + adsWatched, 
        rewardsData.earnings + earnings
      );
      
      if (success) {
        setRewardsData(prev => ({
          ...prev,
          adsWatched: prev.adsWatched + adsWatched,
          earnings: prev.earnings + earnings
        }));
      }
      
      return success;
    } catch (error) {
      console.error("Error updating rewards:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    rewardsData,
    loading,
    updateRewards,
    taskCompletion
  };
};

export default useRewards;
