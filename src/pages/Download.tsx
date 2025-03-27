
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppDownloadButton from '@/components/AppDownloadButton';
import AppUpdateNotification from '@/components/AppUpdateNotification';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Download: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-6">
        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-6">Download DMI App</h1>
        
        <AppUpdateNotification />
        
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/0dad5230-9381-4a8d-a415-7ba365276bdd.png" 
            alt="DMI Logo" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <p className="text-gray-600 mb-6">
            Download the latest version of the DMI app for the best mining experience on your device.
          </p>
          
          <div className="flex justify-center">
            <AppDownloadButton />
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h2 className="text-lg font-semibold mb-2">App Features:</h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Mine DMI coins on the go</li>
            <li>Manage your wallet anytime, anywhere</li>
            <li>Get real-time notifications</li>
            <li>Access all plans and rewards</li>
            <li>Secure authentication</li>
          </ul>
        </div>
        
        {!user && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link to="/signin" className="text-dmi hover:underline">Sign In</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Download;
