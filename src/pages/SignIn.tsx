
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting login form with email:", email, "and password length:", password.length);
      
      // Convert email to lowercase and trim both fields
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password;
      
      await signIn(trimmedEmail, trimmedPassword);
      // Redirect happens in the signIn function
    } catch (err: any) {
      console.error("Sign in component error:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);
      
      // Display a more user-friendly error message
      if (err.code === 'auth/invalid-credential' || 
          err.code === 'auth/user-not-found' || 
          err.code === 'auth/wrong-password' || 
          err.code === 'auth/invalid-email') {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection and try again.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
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
          
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-gray-600">
            Start mining DMI coins today
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-md flex items-center text-red-800 text-sm">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              <p>{error}</p>
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
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="#" className="text-sm text-dmi hover:underline">Forgot password?</Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-dmi hover:bg-dmi-dark text-white button-hover-effect"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
        
        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-dmi hover:underline font-medium">
              Sign up now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
