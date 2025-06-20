
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Users, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { teamService, Team } from '@/services/teamService';
import { Organization } from '@/services/organizationService';
import { User } from '@supabase/supabase-js';
import TeamMemberManager from './TeamMemberManager';

interface TeamManagerProps {
  organization: Organization;
  user: User;
}

const TeamManager = ({ organization, user }: TeamManagerProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, [organization.id]);

  const loadTeams = async () => {
    try {
      setIsLoading(true);
      const data = await teamService.getTeamsByOrganization(organization.id);
      setTeams(data);
    } catch (error) {
      toast({
        title: "Error loading teams",
        description: "There was a problem loading teams for this organization",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setIsSubmitting(true);
      if (editingTeam) {
        const updatedTeam = await teamService.updateTeam({
          ...editingTeam,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        });
        setTeams(teams.map(team => 
          team.id === updatedTeam.id ? updatedTeam : team
        ));
        toast({
          title: "Team updated",
          description: "The team has been updated successfully",
        });
      } else {
        const newTeam = await teamService.createTeam(
          formData.name.trim(),
          formData.description.trim(),
          organization.id,
          user
        );
        setTeams([newTeam, ...teams]);
        toast({
          title: "Team created",
          description: "The new team has been created successfully",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: editingTeam ? "Error updating team" : "Error creating team",
        description: "There was a problem with your request",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({ 
      name: team.name, 
      description: team.description || '' 
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamService.deleteTeam(id);
      setTeams(teams.filter(team => team.id !== id));
      if (expandedTeamId === id) {
        setExpandedTeamId(null);
      }
      toast({
        title: "Team deleted",
        description: "The team has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error deleting team",
        description: "There was a problem deleting the team",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setShowAddForm(false);
    setEditingTeam(null);
  };

  const toggleTeamExpanded = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Teams</h3>
          <p className="text-sm text-gray-600">Manage teams within {organization.name}</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            {editingTeam ? 'Edit Team' : 'Create New Team'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter team name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Enter team description"
                rows={2}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingTeam ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-3 py-1.5 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Teams List */}
      <div className="space-y-2">
        {teams.length === 0 ? (
          <div className="text-center py-6">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No teams yet</p>
            <p className="text-xs text-gray-500">Create your first team to get started</p>
          </div>
        ) : (
          teams.map((team) => (
            <div key={team.id} className="bg-white rounded-md border border-gray-200">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <button
                        onClick={() => toggleTeamExpanded(team.id)}
                        className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded transition-colors"
                      >
                        {expandedTeamId === team.id ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        <h4 className="text-md font-medium text-gray-900">{team.name}</h4>
                      </button>
                    </div>
                    {team.description && (
                      <p className="text-sm text-gray-600 mt-1 ml-6">{team.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 ml-6">
                      Created {new Date(team.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleEdit(team)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(team.id)}
                      className="p-1.5 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Team Members Section */}
              {expandedTeamId === team.id && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <TeamMemberManager team={team} user={user} />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamManager;
