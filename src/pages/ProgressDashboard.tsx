
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from '@/components/UserDropdown';
import OrganizationSelector from '@/components/OrganizationSelector';
import { organizationService, Organization } from '@/services/organizationService';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

const ProgressDashboard = () => {
  const { user, signOut } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isOrganizationsLoading, setIsOrganizationsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsOrganizationsLoading(true);
      const userOrganizations = await organizationService.getOrganizations();
      setOrganizations(userOrganizations);
      
      if (userOrganizations.length > 0) {
        setSelectedOrganization(userOrganizations[0]);
      }
    } catch (error) {
      toast({
        title: "Error loading organizations",
        description: "There was a problem loading your organizations",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsOrganizationsLoading(false);
    }
  };

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
            <p className="text-gray-600 text-sm">
              Track progress and analytics across your projects
            </p>
          </div>
          <OrganizationSelector
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onSelectOrganization={handleOrganizationSelect}
            isLoading={isOrganizationsLoading}
          />
        </div>
        <UserDropdown user={user} onLogout={signOut} />
      </header>

      {/* Main Content */}
      <div className="p-6">
        {isOrganizationsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading organizations...</p>
            </div>
          </div>
        ) : selectedOrganization ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Progress Dashboard Coming Soon</h3>
              <p className="text-gray-600">Charts, progress bars, and analytics will be displayed here for {selectedOrganization.name}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Organization Selected</h3>
              <p className="text-gray-600">Select an organization to view progress dashboard</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressDashboard;
