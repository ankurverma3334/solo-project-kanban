
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import OrganizationManager from '@/components/OrganizationManager';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="team-members">Team Members</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <PasswordChangeForm />
          </TabsContent>
          
          <TabsContent value="organizations" className="space-y-6">
            <OrganizationManager user={user} />
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teams Management</h3>
              <p className="text-gray-600">Team management functionality will be available here. Please select an organization first to manage its teams.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="team-members" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Members</h3>
              <p className="text-gray-600">Team member management functionality will be available here. Please select a team first to manage its members.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
