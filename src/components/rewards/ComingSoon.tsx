
import React from 'react';
import { Gift } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
      <div className="py-8">
        <Gift className="h-12 w-12 mx-auto text-gray-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-700">Coming Soon</h3>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
