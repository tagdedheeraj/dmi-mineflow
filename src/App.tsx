
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { MiningProvider } from "@/contexts/MiningContext";
import SignIn from "@/pages/SignIn";
import SignUp from "@/pages/SignUp";
import Mining from "@/pages/Mining";
import Wallet from "@/pages/Wallet";
import Profile from "@/pages/Profile";
import Plans from "@/pages/Plans";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Rewards from "@/pages/Rewards";
import Admin from "@/pages/Admin";
import AppLock from "@/components/AppLock";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import "./App.css";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <MiningProvider>
            <AppLock>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/mining" element={<Mining />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/rewards" element={<Rewards />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLock>
            <Toaster />
          </MiningProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
