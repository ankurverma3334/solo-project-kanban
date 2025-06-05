
import React from 'react';
import Dashboard from '../components/Dashboard';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, signOut } = useAuth();

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  return <Dashboard user={user} onLogout={signOut} />;
};

export default Index;
