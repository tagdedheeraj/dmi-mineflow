
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
import { getAppSettings } from "./lib/firestore";

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
import Download from "./pages/Download";

const queryClient = new QueryClient();

const App = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [showLovableBadge, setShowLovableBadge] = useState(false);

  useEffect(() => {
    // Check if authentication is required
    const authRequired = isAuthRequired();
    setIsLocked(authRequired);
    
    // Fetch app settings to check if Lovable badge should be shown
    const fetchAppSettings = async () => {
      try {
        const settings = await getAppSettings();
        if (settings) {
          setShowLovableBadge(settings.showLovableBadge || false);
          
          // Initialize app version in localStorage if it doesn't exist
          if (!localStorage.getItem('appVersion')) {
            localStorage.setItem('appVersion', settings.version || '0.0.0');
          }
        }
        setAppReady(true);
      } catch (error) {
        console.error("Error fetching app settings:", error);
        setAppReady(true);
      }
    };
    
    fetchAppSettings();
  }, []);

  // Dynamically add/remove the Lovable script based on the setting
  useEffect(() => {
    const lovableScript = document.getElementById('lovable-script');
    
    if (showLovableBadge && !lovableScript) {
      // Add the script if it should be shown and doesn't exist
      const script = document.createElement('script');
      script.id = 'lovable-script';
      script.src = 'https://cdn.gpteng.co/gptengineer.js';
      script.type = 'module';
      document.body.appendChild(script);
    } else if (!showLovableBadge && lovableScript) {
      // Remove the script if it shouldn't be shown but exists
      lovableScript.remove();
    }
  }, [showLovableBadge]);

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
                <Routes>
                  <Route path="/" element={<Navigate to="/mining" replace />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/download" element={<Download />} />
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
              </MiningProvider>
            </AuthProvider>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
