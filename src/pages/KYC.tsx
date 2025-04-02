
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import KYCVerificationForm from '@/components/KYCVerificationForm';
import { useKYC } from '@/hooks/useKYC';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import BottomBar from '@/components/BottomBar';
import KYCApprovedStatus from '@/components/kyc/KYCApprovedStatus';
import KYCRejectedStatus from '@/components/kyc/KYCRejectedStatus';
import KYCPendingStatus from '@/components/kyc/KYCPendingStatus';
import { getUserKYCStatus, KYCDocument } from '@/lib/firestore/kyc';

const KYC: React.FC = () => {
  const { user } = useAuth();
  const { isKYCEnabled } = useKYC();
  const navigate = useNavigate();
  const [kycStatus, setKycStatus] = useState<KYCDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Redirect to signin if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/signin');
    }
  }, [user, navigate]);
  
  // Only redirect to wallet if KYC is explicitly disabled
  // This prevents automatic redirects during the verification process
  useEffect(() => {
    if (user && isKYCEnabled === false) { // Only redirect if explicitly false, not undefined
      console.log("KYC is disabled, redirecting to wallet");
      navigate('/wallet');
    }
  }, [user, isKYCEnabled, navigate]);

  // Fetch KYC status when user is available
  useEffect(() => {
    const fetchKYCStatus = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const status = await getUserKYCStatus(user.id);
          console.log("Current KYC status:", status);
          setKycStatus(status);
        } catch (error) {
          console.error("Error fetching KYC status:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchKYCStatus();
    
    // Set up an interval to periodically check for KYC status updates
    const statusCheckInterval = setInterval(fetchKYCStatus, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(statusCheckInterval);
    };
  }, [user]);
  
  if (!user) {
    return null;
  }
  
  const renderKYCContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!kycStatus) {
      return <KYCVerificationForm />;
    }

    switch (kycStatus.status) {
      case 'approved':
        return <KYCApprovedStatus kycStatus={kycStatus} />;
      case 'rejected':
        return <KYCRejectedStatus kycStatus={kycStatus} />;
      case 'pending':
        return <KYCPendingStatus kycStatus={kycStatus} />;
      default:
        return <KYCVerificationForm />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-24 animate-fade-in">
      <Header />
      
      <main className="pt-24 px-4 max-w-screen-lg mx-auto">
        <Button 
          variant="ghost"
          className="mb-6 flex items-center text-gray-600"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Button>
        
        {renderKYCContent()}
      </main>
      
      <BottomBar />
    </div>
  );
};

export default KYC;
