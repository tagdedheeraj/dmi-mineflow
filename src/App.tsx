
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from './contexts/AuthContext';
import { MiningProvider } from './contexts/MiningContext';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Mining from './pages/Mining';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import Plans from './pages/Plans';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';
import Rewards from './pages/Rewards';
import AppLock from './components/AppLock';
import AppUpdateNotification from './components/AppUpdateNotification';

function App() {
  return (
    <Router>
      <AuthProvider>
        <MiningProvider>
          <div className="app">
            <Routes>
              <Route path="/" element={<Mining />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/mining" element={<Mining />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AppLock />
            <AppUpdateNotification />
            <Toaster />
          </div>
        </MiningProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
