
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { MiningProvider } from "./contexts/MiningContext";

import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Mining from "./pages/Mining";
import Profile from "./pages/Profile";
import Wallet from "./pages/Wallet";
import Plans from "./pages/Plans";
import Rewards from "./pages/Rewards";
import NotFound from "./pages/NotFound";
import BottomBar from "./components/BottomBar";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => {
  // Helper function to determine if bottom bar should be shown
  const shouldShowBottomBar = (path: string) => {
    const mainRoutes = ['/mining', '/rewards', '/wallet', '/profile'];
    return mainRoutes.includes(path);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <MiningProvider>
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
                <Route path="/plans" element={<Plans />} />
                <Route 
                  path="/rewards" 
                  element={
                    <>
                      <Rewards />
                      <BottomBar />
                    </>
                  } 
                />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MiningProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
