
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MiningProvider } from './contexts/MiningContext';
import { Toaster } from './components/ui/toaster';
import AppLock from './components/AppLock';

// Page imports
import Index from './pages/Index';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Mining from './pages/Mining';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Admin from './pages/Admin';
import Download from './pages/Download';
import Wallet from './pages/Wallet';
import Rewards from './pages/Rewards';
import NotFound from './pages/NotFound';
import KYC from './pages/KYC';

import './App.css';
import './lovableBadgeControl.css';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) return <Navigate to="/signin" replace />;
  
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) return <Navigate to="/signin" replace />;
  
  if (!isAdmin) return <Navigate to="/mining" replace />;
  
  return <>{children}</>;
}

function AppWithProviders() {
  const [isLocked, setIsLocked] = useState(false);
  
  useEffect(() => {
    const shouldLock = localStorage.getItem('dmi_app_lock') === 'true';
    setIsLocked(shouldLock);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.setItem('dmi_app_lock', 'true');
      } else if (document.visibilityState === 'visible') {
        setIsLocked(localStorage.getItem('dmi_app_lock') === 'true');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  const handleUnlock = () => {
    localStorage.removeItem('dmi_app_lock');
    setIsLocked(false);
  };
  
  if (isLocked) {
    return <AppLock onUnlock={handleUnlock} />;
  }

  return (
    <Router>
      <AuthProvider>
        <MiningProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/download" element={<Download />} />
            
            <Route 
              path="/mining" 
              element={
                <AuthGuard>
                  <Mining />
                </AuthGuard>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              } 
            />
            <Route 
              path="/plans" 
              element={
                <AuthGuard>
                  <Plans />
                </AuthGuard>
              } 
            />
            <Route 
              path="/wallet" 
              element={
                <AuthGuard>
                  <Wallet />
                </AuthGuard>
              } 
            />
            <Route 
              path="/rewards" 
              element={
                <AuthGuard>
                  <Rewards />
                </AuthGuard>
              } 
            />
            <Route 
              path="/kyc" 
              element={
                <AuthGuard>
                  <KYC />
                </AuthGuard>
              } 
            />
            
            <Route 
              path="/admin" 
              element={
                <AdminGuard>
                  <Admin />
                </AdminGuard>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </MiningProvider>
      </AuthProvider>
    </Router>
  );
}

function App() {
  return <AppWithProviders />;
}

export default App;
