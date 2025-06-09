
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Building, Lock, Unlock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { organizationService, Organization } from '@/services/organizationService';
import { User } from '@supabase/supabase-js';

interface OrganizationManagerProps {
  user: User;
}

const OrganizationManager = ({ user }: OrganizationManagerProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    password: '', 
    isPasswordProtected: false 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setIsLoading(true);
      const data = await organizationService.getOrganizations();
      setOrganizations(data);
    } catch (error) {
      toast({
        title: "Error loading organizations",
        description: "There was a problem loading your organizations",
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
      if (editingOrg) {
        const updatedOrg = await organizationService.updateOrganization({
          ...editingOrg,
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        setOrganizations(organizations.map(org => 
          org.id === updatedOrg.id ? updatedOrg : org
        ));
        toast({
          title: "Organization updated",
          description: "Your organization has been updated successfully",
        });
      } else {
        const newOrg = await organizationService.createOrganization(
          formData.name.trim(),
          formData.description.trim(),
          user,
          formData.isPasswordProtected ? formData.password : undefined
        );
        setOrganizations([newOrg, ...organizations]);
        toast({
          title: "Organization created",
          description: `Your new ${formData.isPasswordProtected ? 'password-protected ' : ''}organization has been created successfully`,
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: editingOrg ? "Error updating organization" : "Error creating organization",
        description: "There was a problem with your request",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditingOrg(org);
    setFormData({ 
      name: org.name, 
      description: org.description || '',
      password: '',
      isPasswordProtected: org.is_password_protected
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return;

    try {
      await organizationService.deleteOrganization(id);
      setOrganizations(organizations.filter(org => org.id !== id));
      toast({
        title: "Organization deleted",
        description: "The organization has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error deleting organization",
        description: "There was a problem deleting the organization",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', password: '', isPasswordProtected: false });
    setShowAddForm(false);
    setEditingOrg(null);
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
          <h2 className="text-2xl font-bold text-gray-900">Organizations</h2>
          <p className="text-gray-600">Manage your organizations</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Organization</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingOrg ? 'Edit Organization' : 'Create New Organization'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization name"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization description"
                rows={3}
                disabled={isSubmitting}
              />
            </div>
            
            {!editingOrg && (
              <>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="passwordProtected"
                    checked={formData.isPasswordProtected}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      isPasswordProtected: e.target.checked,
                      password: e.target.checked ? formData.password : ''
                    })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <label htmlFor="passwordProtected" className="text-sm font-medium text-gray-700">
                    Password protect this organization
                  </label>
                </div>
                
                {formData.isPasswordProtected && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization Password
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter password for organization access"
                      required={formData.isPasswordProtected}
                      disabled={isSubmitting}
                    />
                  </div>
                )}
              </>
            )}
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (editingOrg ? 'Update' : 'Create')}
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

      {/* Organizations List */}
      <div className="space-y-4">
        {organizations.length === 0 ? (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations</h3>
            <p className="text-gray-600">Create your first organization to get started</p>
          </div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">{org.name}</h3>
                    {org.is_password_protected && (
                      <Lock className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  {org.description && (
                    <p className="text-gray-600 mt-1">{org.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <p className="text-sm text-gray-500">
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </p>
                    {org.is_password_protected && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        <Lock className="w-3 h-3 mr-1" />
                        Protected
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(org)}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(org.id)}
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

export default OrganizationManager;
