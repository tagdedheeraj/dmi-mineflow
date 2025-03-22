
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingPlans: React.FC = () => {
  return (
    <div className="w-full rounded-xl overflow-hidden bg-white shadow-md border border-gray-100 p-6 animate-fade-in mt-6">
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-dmi" />
        <span className="ml-2 text-gray-600">Loading plans...</span>
      </div>
    </div>
  );
};

export default LoadingPlans;
