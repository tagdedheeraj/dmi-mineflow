
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Info, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ANNOUNCEMENT_SEEN_KEY = 'dmi_announcement_kyc_seen';

const AnnouncementPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has already seen the announcement
    const hasSeenAnnouncement = localStorage.getItem(ANNOUNCEMENT_SEEN_KEY) === 'true';
    
    if (!hasSeenAnnouncement) {
      // Show popup after a short delay to ensure page is loaded
      const timer = setTimeout(() => {
        setOpen(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    // Mark announcement as seen
    localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, 'true');
    setOpen(false);
  };

  const handleGoToKYC = () => {
    localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, 'true');
    setOpen(false);
    navigate('/kyc');
  };

  const handleGoToStaking = () => {
    localStorage.setItem(ANNOUNCEMENT_SEEN_KEY, 'true');
    setOpen(false);
    navigate('/wallet');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center justify-center mb-2 text-dmi">
            <AlertCircle className="h-8 w-8" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-dmi">Important Announcement</DialogTitle>
        </DialogHeader>
        
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-dmi/20">
          <DialogDescription className="text-gray-800 font-medium">
            <p className="mb-3"><span className="font-bold">Good news for all DMI users!</span> KYC verification is now active for all users.</p>
            
            <div className="bg-white p-3 rounded-md border border-gray-200 mb-3">
              <h4 className="font-bold mb-1 text-dmi">For users with Staking or Arbitrage plans:</h4>
              <p>You can withdraw 50% of your airdrop coins. Complete your KYC as soon as possible!</p>
            </div>
            
            <div className="bg-white p-3 rounded-md border border-gray-200 mb-3">
              <h4 className="font-bold mb-1 text-red-500">For other users - Last Chance:</h4>
              <p>If you haven't taken a staking or arbitrage plan, this is your final opportunity. <span className="font-bold text-red-500">After April 10, 2025</span>, your coins will not be available!</p>
            </div>
            
            <p className="font-bold text-center text-dmi">Complete your KYC and start staking as soon as possible!</p>
          </DialogDescription>
        </div>
        
        <DialogFooter className="flex sm:justify-center gap-2 flex-col sm:flex-row">
          <Button variant="default" className="bg-dmi hover:bg-dmi/90 flex-1" onClick={handleGoToKYC}>
            Complete KYC Now
          </Button>
          <Button variant="outline" className="border-dmi text-dmi hover:bg-dmi/10 flex-1" onClick={handleGoToStaking}>
            Go to Staking
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleClose}>
            Later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
