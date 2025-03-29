import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "./contexts/AuthContext";
import { MiningProvider } from "./contexts/MiningContext";
import { isAuthRequired } from "./lib/secureStorage";
import AppLock from "./components/AppLock";
import { getAppSettings } from "./lib/firestore";

const queryClient = new QueryClient();

const App = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check if authentication is required
    const authRequired = isAuthRequired();
    setIsLocked(authRequired);
    
    // Check and apply the Lovable badge setting
    const showLovableBadge = localStorage.getItem('showLovableBadge');
    if (showLovableBadge === 'false') {
      window.HIDE_LOVABLE_BADGE = true;
      document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
    }
    
    // Fetch app settings to initialize app version
    const fetchAppSettings = async () => {
      try {
        const settings = await getAppSettings();
        if (settings) {
          // Initialize app version in localStorage if it doesn't exist
          if (!localStorage.getItem('appVersion')) {
            localStorage.setItem('appVersion', settings.version || '0.0.0');
          }
          
          // Update badge visibility setting if it's defined in the settings
          if (settings.showLovableBadge !== undefined) {
            localStorage.setItem('showLovableBadge', settings.showLovableBadge ? 'true' : 'false');
            
            // Apply the setting immediately
            if (!settings.showLovableBadge) {
              window.HIDE_LOVABLE_BADGE = true;
              document.documentElement.setAttribute('data-hide-lovable-badge', 'true');
            }
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
                  <Route path="/" element={<Index />} />
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
