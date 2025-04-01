import React, { useState, useEffect } from 'react';
import { 
  validatePin, 
  getAuthMethod, 
  getAuthPreferences
} from '@/lib/secureStorage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AppLockProps {
  onUnlock: () => void;
}

const AppLock: React.FC<AppLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState(getAuthMethod());
  const { toast } = useToast();

  // Auto unlock immediately
  useEffect(() => {
    // Automatically unlock the app
    onUnlock();
  }, [onUnlock]);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validatePin(pin)) {
      toast({
        title: "Authentication Successful",
        description: "Welcome back to DMI Mining!",
      });
      onUnlock();
    } else {
      setError('Incorrect PIN. Please try again.');
      setPin('');
    }
  };

  const requestBiometricAuth = async () => {
    // Check if Web Authentication API is available
    if (window.PublicKeyCredential) {
      try {
        // Show a toast message since we're simulating biometric auth
        toast({
          title: "Biometric Authentication",
          description: "Please authenticate using your biometric scanner.",
        });
        
        // In a real implementation, we would use the Web Authentication API
        // For now, we'll simulate success after a short delay
        setTimeout(() => {
          toast({
            title: "Authentication Successful",
            description: "Biometric verification complete.",
          });
          onUnlock();
        }, 2000);
      } catch (error) {
        console.error('Biometric authentication error:', error);
        toast({
          title: "Biometric Authentication Failed",
          description: "Please use your PIN instead.",
          variant: "destructive",
        });
        setAuthMethod('pin');
      }
    } else {
      toast({
        title: "Biometric Not Supported",
        description: "Your device doesn't support biometric authentication. Please use your PIN.",
        variant: "destructive",
      });
      setAuthMethod('pin');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
      {/* Auto-unlocking, this UI is just for fallback */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/0dad5230-9381-4a8d-a415-7ba365276bdd.png" 
            alt="DMI Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          
          <div className="mb-6">
            <div className="bg-dmi-light/10 h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4">
              <Fingerprint className="h-8 w-8 text-dmi" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Auto-Unlocking...</h2>
            <p className="text-gray-600 mt-1">Please wait while the app unlocks</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppLock;
