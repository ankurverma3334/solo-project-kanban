
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import OrganizationManager from '@/components/OrganizationManager';
import { ArrowLeft, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { organizationService, Organization } from '@/services/organizationService';
import { teamService, Team } from '@/services/teamService';
import TeamMemberManager from '@/components/TeamMemberManager';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  if (!user) {
    return null; // ProtectedRoute will handle the redirect
  }

  const loadOrganizations = async () => {
    try {
      setIsLoadingOrganizations(true);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      console.error('Error loading organizations:', error);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  const loadTeams = async (organizationId: string) => {
    try {
      setIsLoadingTeams(true);
      const data = await teamService.getTeamsByOrganization(organizationId);
      setTeams(data);
    } catch (error) {
      console.error('Error loading teams:', error);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleOrganizationSelect = async (orgId: string) => {
    setSelectedTeam(null);
    await loadTeams(orgId);
  };

  const TeamMembersContent = () => {
    React.useEffect(() => {
      loadOrganizations();
    }, []);

    if (selectedTeam) {
      return (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSelectedTeam(null)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Teams</span>
            </button>
          </div>
          <TeamMemberManager team={selectedTeam} user={user} />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select a Team to Manage Members</h3>
          <p className="text-gray-600 mb-6">Choose an organization and team to view and manage its members.</p>
        </div>

        {/* Organizations Selection */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Organizations</h4>
          {isLoadingOrganizations ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : organizations.length === 0 ? (
            <p className="text-gray-600">No organizations found. Create an organization first in the Organizations tab.</p>
          ) : (
            <div className="space-y-2">
              {organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleOrganizationSelect(org.id)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <h5 className="font-medium text-gray-900">{org.name}</h5>
                  {org.description && (
                    <p className="text-sm text-gray-600 mt-1">{org.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Teams Selection */}
        {teams.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="text-md font-semibold text-gray-900 mb-4">Teams</h4>
            {isLoadingTeams ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team)}
                    className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <h5 className="font-medium text-gray-900">{team.name}</h5>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-6">{team.description}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white border border-gray-200 p-1 rounded-lg">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700 font-medium py-2 px-4 rounded-md transition-all"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="organizations"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700 font-medium py-2 px-4 rounded-md transition-all"
            >
              Organizations
            </TabsTrigger>
            <TabsTrigger 
              value="teams"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700 font-medium py-2 px-4 rounded-md transition-all"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger 
              value="team-members"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-700 font-medium py-2 px-4 rounded-md transition-all"
            >
              Team Members
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6 mt-6">
            <PasswordChangeForm />
          </TabsContent>
          
          <TabsContent value="organizations" className="space-y-6 mt-6">
            <OrganizationManager user={user} />
          </TabsContent>
          
          <TabsContent value="teams" className="space-y-6 mt-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teams Management</h3>
              <p className="text-gray-600">Team management functionality will be available here. Please select an organization first to manage its teams.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="team-members" className="space-y-6 mt-6">
            <TeamMembersContent />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
