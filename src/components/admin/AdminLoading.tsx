
import React from 'react';

interface AdminLoadingProps {
  message?: string;
}

const AdminLoading: React.FC<AdminLoadingProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dmi"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default AdminLoading;
