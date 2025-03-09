
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { confirmPasswordReset } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!oobCode) {
      setError('Invalid password reset link. Please request a new one.');
    }
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!oobCode) {
      setError('Invalid password reset link. Please request a new one.');
      return;
    }
    
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await confirmPasswordReset(oobCode, newPassword);
      setSuccess(true);
      // Redirect to sign in page after 3 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      console.error("Password reset confirmation error:", err);
      
      if (err.code === 'auth/invalid-action-code') {
        setError('The reset link has expired or has already been used. Please request a new one.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to reset password. Please try again later.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* DMI Logo at the top */}
          <img 
            src="/lovable-uploads/51c75bd9-9eaf-46e5-86a8-c39bdc1354d5.png" 
            alt="DMI Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Set new password</h2>
          <p className="mt-2 text-gray-600">
            Create a new password for your account
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-md flex items-center text-green-800 text-sm">
              <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>Password has been reset successfully! Redirecting to login...</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={!oobCode || success}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={!oobCode || success}
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-dmi hover:bg-dmi-dark text-white button-hover-effect"
              disabled={isSubmitting || success || !oobCode}
            >
              {isSubmitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link to="/signin" className="text-dmi hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
