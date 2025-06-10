
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings & Account</h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>

        <div className="space-y-6">
          <PasswordChangeForm />
        </div>
      </div>
    </div>
  );
};

export default Settings;
