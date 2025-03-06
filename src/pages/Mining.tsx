
import React, { useEffect } from 'react';
import MiningCard from '@/components/MiningCard';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import GamificationSection from '@/components/gamification/GamificationSection';

const Mining = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !user) {
      navigate('/signin');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mining Dashboard</h1>
      
      <MiningCard />
      
      {/* Add the new Gamification Section */}
      <GamificationSection />
    </div>
  );
};

export default Mining;
