
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { MiningProvider } from "./contexts/MiningContext";
import { isAuthRequired } from "./lib/secureStorage";
import AppLock from "./components/AppLock";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { AppUpdateNotification, useAppVersionCheck } from "./components/AppUpdateNotification";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Mining from "./pages/Mining";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Plans from "./pages/Plans";
import Rewards from "./pages/Rewards";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import BottomBar from "./components/BottomBar";

const queryClient = new QueryClient();

const AppContent = () => {
  const { checkForUpdates, sendUpdateNotification } = useAppVersionCheck();
  const { isUpdateRequired, userVersion, latestVersion, updateUrl } = checkForUpdates();
  
  useEffect(() => {
    // Set current app version in localStorage if not present
    if (!localStorage.getItem('app_version')) {
      localStorage.setItem('app_version', '1.0.0');
    }
    
    // Set up notification schedule - 3 times a day
    // Morning (8 AM), Afternoon (2 PM), Evening (8 PM)
    const checkAndNotify = () => {
      const now = new Date();
      const hours = now.getHours();
      
      // Check if within notification hours (8 AM, 2 PM, 8 PM)
      if (hours === 8 || hours === 14 || hours === 20) {
        sendUpdateNotification();
      }
    };
    
    // Check immediately on app load
    checkAndNotify();
    
    // Set up periodic check (every hour)
    const interval = setInterval(checkAndNotify, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [sendUpdateNotification]);
  
  return (
    <>
      <div className="fixed top-4 left-4 right-4 z-50">
        <AppUpdateNotification 
          userVersion={userVersion}
          latestVersion={latestVersion}
          updateUrl={updateUrl}
          show={isUpdateRequired}
        />
      </div>
      <div className="fixed top-4 right-4 z-50">
        <NotificationsPanel />
      </div>
      <Routes>
        <Route path="/" element={<Navigate to="/mining" replace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/mining" 
          element={
            <>
              <Mining />
              <BottomBar />
            </>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <>
              <Profile />
              <BottomBar />
            </>
          } 
        />
        <Route 
          path="/wallet" 
          element={
            <>
              <Wallet />
              <BottomBar />
            </>
          } 
        />
        <Route 
          path="/plans" 
          element={
            <>
              <Plans />
              <BottomBar />
            </>
          } 
        />
        <Route path="/admin" element={<Admin />} />
        <Route 
          path="/rewards" 
          element={
            <>
              <Rewards />
              <BottomBar />
            </>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check if authentication is required
    const authRequired = isAuthRequired();
    setIsLocked(authRequired);
    setAppReady(true);
  }, []);

  const handleUnlock = () => {
    setIsLocked(false);
  };

  if (!appReady) {
    return <div className="min-h-screen bg-gray-50"></div>; // Loading state
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {isLocked ? (
          <AppLock onUnlock={handleUnlock} />
        ) : (
          <BrowserRouter>
            <AuthProvider>
              <MiningProvider>
                <AppContent />
              </MiningProvider>
            </AuthProvider>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
