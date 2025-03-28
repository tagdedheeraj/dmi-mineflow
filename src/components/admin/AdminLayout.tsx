
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if not admin
  React.useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/signin');
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dmi"></div>
          <p className="text-gray-600">Checking admin permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <AdminHeader user={user} signOut={signOut} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
