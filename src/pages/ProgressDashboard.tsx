
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import UserDropdown from '@/components/UserDropdown';
import OrganizationDropdown from '@/components/OrganizationDropdown';
import { organizationService, Organization } from '@/services/organizationService';
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User } from 'lucide-react';

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
        </div>
        <div className="flex items-center space-x-3">
          <OrganizationDropdown
            organizations={organizations}
            selectedOrganization={selectedOrganization}
            onSelectOrganization={handleOrganizationSelect}
            isLoading={isOrganizationsLoading}
          />
          <UserDropdown user={user} onLogout={signOut} />
        </div>
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Progress tracking for {selectedOrganization.name}
              </h2>
              <p className="text-gray-600">
                Monitor team and individual performance across your organization
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Track Team's Progress */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Track Team's Progress</CardTitle>
                      <CardDescription>
                        Monitor team performance and project milestones
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Get insights into team productivity, project completion rates, and collaboration metrics across all teams in your organization.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-600">View Team Analytics</span>
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>

              {/* Track Individual Contributor */}
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Track Individual Contributor</CardTitle>
                      <CardDescription>
                        Monitor individual performance and contributions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Track individual team member contributions, task completion, and performance metrics to support professional development.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-600">View Individual Metrics</span>
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
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
