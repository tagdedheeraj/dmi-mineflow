import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMining } from '@/contexts/MiningContext';
import { useMiningCalculations } from '@/hooks/useMiningCalculations';
import { usePlanManagement } from '@/hooks/usePlanManagement';
import { ActivePlan } from '@/lib/storage';
import { formatDuration, formatDate } from '@/lib/utils';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, Pause, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import Header from '@/components/Header';
import LeaderboardTabs from '@/components/leaderboard/LeaderboardTabs';

const Mining: React.FC = () => {
  const { user } = useAuth();
  const { 
    miningSession, 
    startMiningSession, 
    stopMiningSession, 
    activePlans, 
    fetchActivePlans 
  } = useMining();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [miningButtonState, setMiningButtonState] = useState<'idle' | 'mining' | 'complete'>('idle');
  const [miningStartTime, setMiningStartTime] = useState<number | null>(null);
  const [miningEndTime, setMiningEndTime] = useState<number | null>(null);
  const [miningDuration, setMiningDuration] = useState<number>(0);
  const [miningRate, setMiningRate] = useState<number>(1);
  const [planExpiryDates, setPlanExpiryDates] = useState<string[]>([]);
  
  const { 
    miningProgress,
    setMiningProgress,
    currentEarnings,
    setCurrentEarnings,
    timeRemaining,
    setTimeRemaining,
    calculateTotalMiningRate,
    updateMiningProgress
  } = useMiningCalculations({ activePlans: activePlans || [] });
  
  const { updateMiningBoost } = usePlanManagement(user?.uid);
  
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    if (user) {
      fetchActivePlans(user.uid);
    }
  }, [user, fetchActivePlans]);
  
  useEffect(() => {
    if (activePlans && activePlans.length > 0) {
      const expiryDates = activePlans.map(plan => formatDate(plan.expiresAt));
      setPlanExpiryDates(expiryDates);
    } else {
      setPlanExpiryDates([]);
    }
  }, [activePlans]);
  
  useEffect(() => {
    const totalRate = calculateTotalMiningRate();
    setMiningRate(totalRate);
  }, [activePlans, calculateTotalMiningRate]);
  
  useEffect(() => {
    if (miningSession) {
      const { progress, earnings, remainingSec } = updateMiningProgress(miningSession);
      setMiningProgress(progress);
      setCurrentEarnings(earnings);
      setTimeRemaining(remainingSec);
      
      if (miningSession.status === 'active') {
        setMiningButtonState('mining');
        setMiningStartTime(miningSession.startTime);
        setMiningEndTime(miningSession.endTime);
        setMiningDuration(miningSession.endTime - miningSession.startTime);
      } else if (miningSession.status === 'complete') {
        setMiningButtonState('complete');
      }
    } else {
      setMiningButtonState('idle');
      setMiningProgress(0);
      setCurrentEarnings(0);
      setTimeRemaining(0);
    }
  }, [miningSession, updateMiningProgress, setMiningProgress, setCurrentEarnings, setTimeRemaining]);
  
  const handleStartMining = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated.",
        description: "Please sign in to start mining.",
      });
      return;
    }
    
    const now = Date.now();
    const endTime = now + (60 * 60 * 1000); // Mining duration: 1 hour
    
    try {
      setMiningButtonState('mining');
      setMiningStartTime(now);
      setMiningEndTime(endTime);
      setMiningDuration(endTime - now);
      
      await startMiningSession(user.uid, now, endTime, miningRate);
      
      toast({
        title: "Mining started!",
        description: "Your DMI mining session has started.",
      });
    } catch (error: any) {
      console.error("Error starting mining session:", error);
      setMiningButtonState('idle');
      toast({
        variant: "destructive",
        title: "Failed to start mining.",
        description: error.message || "There was an error starting your mining session.",
      });
    }
  };
  
  const handleStopMining = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not authenticated.",
        description: "Please sign in to stop mining.",
      });
      return;
    }
    
    try {
      setMiningButtonState('complete');
      await stopMiningSession(user.uid, currentEarnings);
      
      toast({
        title: "Mining stopped!",
        description: `You've earned ${currentEarnings} DMI.`,
      });
    } catch (error: any) {
      console.error("Error stopping mining session:", error);
      setMiningButtonState('mining');
      toast({
        variant: "destructive",
        title: "Failed to stop mining.",
        description: error.message || "There was an error stopping your mining session.",
      });
    }
  };
  
  const MiningCard: React.FC = () => (
    <Card className="w-full shadow-md">
      <CardHeader className="bg-gradient-to-r from-dmi/10 to-dmi/5 pb-2">
        <CardTitle className="text-lg font-semibold">
          DMI Mining
        </CardTitle>
        <CardDescription>
          Mine DMI and earn rewards.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">
              Mining Progress
            </span>
            <span className="text-sm text-gray-500">
              {miningProgress}%
            </span>
          </div>
          <Progress value={miningProgress} />
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Time Remaining:
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {formatDuration(timeRemaining)}
          </span>
        </div>
        
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-sm font-medium text-gray-700">
              Current Earnings:
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {currentEarnings} DMI
          </span>
        </div>
        
        {planExpiryDates.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center mb-2">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">
                Active Plans:
              </span>
            </div>
            <div>
              {planExpiryDates.map((date, index) => (
                <Badge key={index} variant="secondary" className="mr-1">
                  Expires: {date}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center">
        {miningButtonState === 'idle' && (
          <Button onClick={handleStartMining} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start Mining
          </Button>
        )}
        
        {miningButtonState === 'mining' && (
          <Button onClick={handleStopMining} variant="destructive" className="w-full">
            <Pause className="h-4 w-4 mr-2" />
            Stop Mining
          </Button>
        )}
        
        {miningButtonState === 'complete' && (
          <Button variant="outline" disabled className="w-full">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mining Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-6 pb-24">
        <MiningCard />
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Leaderboards</h2>
          <LeaderboardTabs />
        </div>
      </div>
    </>
  );
};

export default Mining;
