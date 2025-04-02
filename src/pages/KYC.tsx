
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import KYCVerificationForm from '@/components/KYCVerificationForm';
import { useKYC } from '@/hooks/useKYC';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BottomBar from '@/components/BottomBar';

const KYC: React.FC = () => {
  const { user } = useAuth();
  const { isKYCEnabled, loadKycStatus } = useKYC();
  const navigate = useNavigate();
  
  // Redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    } else {
      // Ensure we load the latest KYC status when the page is visited
      loadKycStatus();
    }
  }, [user, navigate, loadKycStatus]);
  
  // Only redirect to wallet if KYC is explicitly disabled
  useEffect(() => {
    if (user && isKYCEnabled === false) { // Only redirect if explicitly false, not undefined
      console.log("KYC is disabled, redirecting to wallet");
      navigate('/wallet');
    }
  }, [isKYCEnabled, navigate, user]);
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-lg mx-auto">
        <Button 
          variant="ghost"
          className="mb-6 flex items-center text-gray-600"
          onClick={() => navigate('/profile')}
          type="button"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
        
        <KYCVerificationForm />
      </main>
      
      <BottomBar />
    </div>
  );
};

export default KYC;
