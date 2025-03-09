
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert email to lowercase and trim
      const trimmedEmail = email.trim().toLowerCase();
      
      await resetPassword(trimmedEmail);
      setSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      // Display a user-friendly error message
      if (err.code === 'auth/user-not-found') {
        setError('No account exists with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again later.');
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
          
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Reset your password</h2>
          <p className="mt-2 text-gray-600">
            Enter your email address and we'll send you a link to reset your password
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
              <p>Password reset email sent. Please check your inbox including spam folder.</p>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-dmi hover:bg-dmi-dark text-white button-hover-effect"
              disabled={isSubmitting || success}
            >
              {isSubmitting ? "Sending..." : "Send Reset Link"}
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

export default ForgotPassword;
