
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import OrganizationManager from '@/components/OrganizationManager';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Organizations = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <OrganizationManager user={user} />
      </div>
    </div>
  );
};

export default Organizations;
