
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMining } from '@/contexts/MiningContext';
import { Rocket, Clock, ChevronLeft, ChevronRight, Award, CheckCircle2, Star } from 'lucide-react';
import { saveMembershipCard, getActiveMembership } from '@/lib/firebase';
import PaymentModal from '@/components/PaymentModal';
import { cn } from '@/lib/utils';

// Define the membership plans
const membershipPlans = [
  {
    id: 'basic',
    name: 'Basic Membership',
    price: 25,
    durationDays: 30,
    boostMultiplier: 2,
    description: 'Start earning both DMI coins and USDT through our 5-level referral system',
    features: [
      '2x DMI Booster for 30 days',
      'Earn USDT from referrals (5 levels)',
      'Access to referral dashboard',
      'Priority mining speed'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Membership',
    price: 50,
    durationDays: 90,
    boostMultiplier: 4,
    description: 'Triple duration with improved earnings and faster mining',
    features: [
      '4x DMI Booster for 90 days',
      'Enhanced USDT referral earnings',
      'Premium support access',
      'Exclusive mining rewards'
    ]
  },
  {
    id: 'elite',
    name: 'Elite Membership',
    price: 75,
    durationDays: 120,
    boostMultiplier: 7,
    description: 'Maximize your earnings with our most popular membership tier',
    features: [
      '7x DMI Booster for 120 days',
      'VIP referral commissions',
      'Priority withdrawal processing',
      'Exclusive community access'
    ]
  },
  {
    id: 'ultimate',
    name: 'Ultimate Membership',
    price: 100,
    durationDays: 220,
    boostMultiplier: 12,
    description: 'Our highest tier with maximum benefits for serious miners',
    features: [
      '12x DMI Booster for 220 days',
      'Maximum referral earnings',
      'Instant withdrawals',
      'Early access to new features'
    ]
  }
];

const MembershipCards: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { miningRate } = useMining();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeMembership, setActiveMembership] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadActiveMembership();
    }
  }, [user]);

  const loadActiveMembership = async () => {
    if (!user) return;
    
    try {
      const membership = await getActiveMembership(user.id);
      setActiveMembership(membership);
    } catch (error) {
      console.error("Error loading active membership:", error);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === membershipPlans.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? membershipPlans.length - 1 : prev - 1));
  };

  const handlePurchase = (plan: any) => {
    if (isProcessing) return;
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!selectedPlan || !user || isProcessing) return;
    
    setIsProcessing(true);
    setShowPaymentModal(false);
    
    try {
      const cardId = await saveMembershipCard(
        user.id,
        selectedPlan.id,
        selectedPlan.price,
        selectedPlan.durationDays,
        selectedPlan.boostMultiplier,
        transactionId
      );
      
      toast({
        title: "Membership Activated!",
        description: `Your ${selectedPlan.name} is now active for ${selectedPlan.durationDays} days with a ${selectedPlan.boostMultiplier}x DMI booster.`,
      });
      
      // Reload active membership
      await loadActiveMembership();
    } catch (error) {
      console.error("Error activating membership:", error);
      toast({
        title: "Error",
        description: "There was an error activating your membership. Please try again or contact support.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const calculateEstimatedEarnings = (boostMultiplier: number) => {
    // This is a simplified calculation - customize based on your actual earnings formula
    const baseRate = 100; // Example base rate of DMI coins per day
    return baseRate * boostMultiplier;
  };

  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 card-hover-effect animate-fade-in mt-6">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Membership Cards</h3>
            <p className="text-sm text-gray-500 mt-1">
              Boost your earning potential and unlock USDT rewards for referrals
            </p>
          </div>
          <div className="bg-blue-500/10 text-blue-600 p-2 rounded-lg">
            <Award className="h-5 w-5" />
          </div>
        </div>

        {activeMembership && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center">
              <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-800">Active Membership</h4>
            </div>
            <p className="text-sm text-green-700 mt-1">
              You have an active {activeMembership.planId.replace(/-/g, ' ')} that expires in{' '}
              {Math.ceil((new Date(activeMembership.expiresAt.seconds * 1000).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
            </p>
            <div className="mt-2 text-xs bg-white/50 rounded-md p-2 text-green-700">
              Current DMI Boost: {activeMembership.boostMultiplier}x
            </div>
          </div>
        )}

        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {membershipPlans.map((plan) => (
                <div key={plan.id} className="w-full flex-shrink-0">
                  <Card className={cn(
                    "border-2 h-full", 
                    plan.id === 'basic' ? "border-blue-200 bg-blue-50/30" : 
                    plan.id === 'premium' ? "border-purple-200 bg-purple-50/30" : 
                    plan.id === 'elite' ? "border-amber-200 bg-amber-50/30" : 
                    "border-emerald-200 bg-emerald-50/30"
                  )}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <CardDescription className="mt-1">{plan.description}</CardDescription>
                        </div>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-sm font-semibold",
                          plan.id === 'basic' ? "bg-blue-100 text-blue-700" : 
                          plan.id === 'premium' ? "bg-purple-100 text-purple-700" : 
                          plan.id === 'elite' ? "bg-amber-100 text-amber-700" : 
                          "bg-emerald-100 text-emerald-700"
                        )}>
                          ${plan.price}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <Rocket className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">{plan.boostMultiplier}x DMI Booster</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-blue-500 mr-2" />
                          <span className="font-medium">{plan.durationDays} days validity</span>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Membership benefits:</p>
                          <ul className="space-y-2">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                                <span className="text-sm">{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant={plan.id === 'elite' ? "default" : "outline"}
                        onClick={() => handlePurchase(plan)}
                        disabled={isProcessing}
                      >
                        Activate Now
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-200"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white p-2 rounded-full shadow-md border border-gray-200"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          
          <div className="flex justify-center mt-4 space-x-1">
            {membershipPlans.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 w-2 rounded-full ${
                  currentSlide === idx ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              ></button>
            ))}
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg text-sm">
          <p className="font-medium text-blue-700">Why upgrade to membership?</p>
          <ul className="mt-2 space-y-2 text-blue-600">
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Earn both DMI coins AND USDT through the 5-level referral system</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Even without purchasing plans, earn from referrals during membership validity</span>
            </li>
            <li className="flex items-start">
              <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>5 levels of referral system rewards for maximum earning potential</span>
            </li>
          </ul>
        </div>
      </div>
      
      {showPaymentModal && selectedPlan && (
        <PaymentModal
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          onClose={() => setShowPaymentModal(false)}
          onComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
};

export default MembershipCards;
