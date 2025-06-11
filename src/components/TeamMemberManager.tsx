
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, User, Mail, UserCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { teamMemberService, TeamMember } from '@/services/teamMemberService';
import { Team } from '@/services/teamService';
import { User as AuthUser } from '@supabase/supabase-js';

interface TeamMemberManagerProps {
  team: Team;
  user: AuthUser;
}

const TeamMemberManager = ({ team, user }: TeamMemberManagerProps) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, [team.id]);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const data = await teamMemberService.getTeamMembersByTeam(team.id);
      setTeamMembers(data);
    } catch (error) {
      toast({
        title: "Error loading team members",
        description: "There was a problem loading the team members",
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
      if (editingMember) {
        const updatedMember = await teamMemberService.updateTeamMember({
          ...editingMember,
          name: formData.name.trim(),
          email: formData.email.trim() || null,
          role: formData.role.trim() || null,
        });
        setTeamMembers(teamMembers.map(member => 
          member.id === updatedMember.id ? updatedMember : member
        ));
        toast({
          title: "Team member updated",
          description: "The team member has been updated successfully",
        });
      } else {
        const newMember = await teamMemberService.createTeamMember(
          formData.name.trim(),
          formData.email.trim(),
          formData.role.trim(),
          team.id,
          user
        );
        setTeamMembers([newMember, ...teamMembers]);
        toast({
          title: "Team member added",
          description: "The new team member has been added successfully",
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: editingMember ? "Error updating team member" : "Error adding team member",
        description: "There was a problem with your request",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({ 
      name: member.name, 
      email: member.email || '',
      role: member.role || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      await teamMemberService.deleteTeamMember(id);
      setTeamMembers(teamMembers.filter(member => member.id !== id));
      toast({
        title: "Team member removed",
        description: "The team member has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Error removing team member",
        description: "There was a problem removing the team member",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: '' });
    setShowAddForm(false);
    setEditingMember(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
          <p className="text-gray-600">Manage members for "{team.name}"</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter member name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter member email"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role (Optional)
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Developer, Designer, Manager"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingMember ? 'Update' : 'Add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Team Members List */}
      <div className="space-y-4">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Team Members</h4>
            <p className="text-gray-600">Add your first team member to get started</p>
          </div>
        ) : (
          teamMembers.map((member) => (
            <div key={member.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <h4 className="text-md font-semibold text-gray-900">{member.name}</h4>
                  </div>
                  <div className="space-y-1">
                    {member.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.role && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <UserCheck className="w-4 h-4" />
                        <span>{member.role}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Added {new Date(member.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeamMemberManager;
