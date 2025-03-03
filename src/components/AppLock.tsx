
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

  useEffect(() => {
    if (authMethod === 'biometric') {
      requestBiometricAuth();
    }
  }, []);

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
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-8">
        <div className="text-center">
          <img 
            src="/lovable-uploads/0dad5230-9381-4a8d-a415-7ba365276bdd.png" 
            alt="DMI Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          
          {authMethod === 'pin' ? (
            <div className="mb-6">
              <div className="bg-dmi-light/10 h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4">
                <Lock className="h-8 w-8 text-dmi" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Enter PIN</h2>
              <p className="text-gray-600 mt-1">Please enter your PIN to access the app</p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-dmi-light/10 h-16 w-16 rounded-full mx-auto flex items-center justify-center mb-4">
                <Fingerprint className="h-8 w-8 text-dmi" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Biometric Authentication</h2>
              <p className="text-gray-600 mt-1">Use your fingerprint to unlock the app</p>
            </div>
          )}
        </div>

        {authMethod === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-md text-red-800 text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                id="pin"
                type="password"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="text-center text-xl py-6"
                required
                autoFocus
              />
            </div>
            
            <Button type="submit" className="w-full bg-dmi hover:bg-dmi-dark">
              Unlock
            </Button>
            
            {getAuthPreferences().biometricEnabled && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setAuthMethod('biometric');
                  requestBiometricAuth();
                }}
              >
                <Fingerprint className="mr-2 h-4 w-4" />
                Use Biometric
              </Button>
            )}
          </form>
        )}
        
        {authMethod === 'biometric' && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <Button 
                type="button" 
                variant="outline" 
                className="animate-pulse"
                onClick={requestBiometricAuth}
              >
                <Fingerprint className="h-6 w-6 text-dmi" />
              </Button>
            </div>
            
            {getAuthPreferences().pin && (
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => setAuthMethod('pin')}
              >
                <Lock className="mr-2 h-4 w-4" />
                Use PIN Instead
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppLock;
