
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Gamepad, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useMiningContext } from '@/contexts/MiningContext';
import { updateUserBalance } from '@/lib/firestore';

export const PlaneGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1);
  const [isFlying, setIsFlying] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const { user, updateUser } = useMiningContext();
  const gameLoopRef = useRef<number>();
  const crashPointRef = useRef(generateCrashPoint());

  // Generate a crash point that's more likely to be low
  function generateCrashPoint() {
    const random = Math.random();
    // Higher chance of early crash (70% chance of crashing before 2x)
    return Math.max(1, Math.pow(random * 3, 2));
  }

  const startGame = () => {
    if (!user) return;
    
    if (betAmount > (user.balance || 0)) {
      toast.error("Insufficient DMI coins!");
      return;
    }

    if (betAmount < 10) {
      toast.error("Minimum bet is 10 DMI coins");
      return;
    }

    // Deduct bet amount immediately
    updateUserBalance(user.id, -betAmount);
    updateUser({ ...user, balance: (user.balance || 0) - betAmount });

    setIsPlaying(true);
    setIsFlying(true);
    setMultiplier(1);
    crashPointRef.current = generateCrashPoint();

    gameLoopRef.current = window.setInterval(() => {
      setMultiplier(prev => {
        const newMultiplier = prev + 0.01;
        if (newMultiplier >= crashPointRef.current) {
          crash();
        }
        return newMultiplier;
      });
    }, 50);
  };

  const cashOut = async () => {
    if (!user || !isFlying) return;

    setIsFlying(false);
    clearInterval(gameLoopRef.current);

    const winnings = Math.floor(betAmount * multiplier);
    const profit = winnings - betAmount;

    // Update user balance with winnings
    await updateUserBalance(user.id, winnings);
    updateUser({ ...user, balance: (user.balance || 0) + winnings });
    
    toast.success(`You won ${profit} DMI coins!`);
    setIsPlaying(false);
  };

  const crash = () => {
    setIsFlying(false);
    clearInterval(gameLoopRef.current);
    toast.error("Crashed! Better luck next time!");
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  if (!showPopup) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white rounded-lg shadow-lg p-4 w-80 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Gamepad className="w-5 h-5 text-dmi" />
          <h3 className="font-semibold">Plane Crash Game</h3>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowPopup(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {!isPlaying ? (
          <>
            <div className="flex gap-2">
              <Input
                type="number"
                min={10}
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                className="w-full"
                placeholder="Bet amount (min 10 DMI)"
              />
            </div>
            <Button 
              onClick={startGame} 
              className="w-full bg-dmi hover:bg-dmi/90"
              disabled={!user || betAmount < 10 || betAmount > (user.balance || 0)}
            >
              Start Game
            </Button>
          </>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-dmi">
                {multiplier.toFixed(2)}x
              </div>
              <div className="text-sm text-gray-500">
                Potential win: {Math.floor(betAmount * multiplier)} DMI
              </div>
            </div>
            {isFlying && (
              <Button 
                onClick={cashOut}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                Cash Out
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
