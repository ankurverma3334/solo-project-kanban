
import React, { useState } from 'react';
import { Building, Lock } from 'lucide-react';
import { Organization, organizationService } from '@/services/organizationService';
import OrganizationPasswordPrompt from './OrganizationPasswordPrompt';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrganizationSelectorProps {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelectOrganization: (organization: Organization) => void;
  isLoading?: boolean;
}

const OrganizationSelector = ({ 
  organizations, 
  selectedOrganization, 
  onSelectOrganization,
  isLoading = false
}: OrganizationSelectorProps) => {
  const [pendingOrganization, setPendingOrganization] = useState<Organization | null>(null);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const handleValueChange = async (value: string) => {
    const organization = organizations.find(org => org.id === value);
    if (!organization) return;

    // If the organization is password protected, show password prompt
    if (organization.is_password_protected) {
      setPendingOrganization(organization);
    } else {
      onSelectOrganization(organization);
    }
  };

  const handlePasswordSubmit = async (password: string): Promise<boolean> => {
    if (!pendingOrganization) return false;

    try {
      setIsVerifyingPassword(true);
      const isValid = await organizationService.verifyOrganizationPassword(
        pendingOrganization.id, 
        password
      );

      if (isValid) {
        onSelectOrganization(pendingOrganization);
        setPendingOrganization(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  const handlePasswordCancel = () => {
    setPendingOrganization(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
        <Building className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-500">Loading organizations...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <Building className="w-4 h-4 text-gray-600" />
        <Select value={selectedOrganization?.id || ""} onValueChange={handleValueChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select organization" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center space-x-2">
                  <span>{org.name}</span>
                  {org.is_password_protected && (
                    <Lock className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Password Prompt Modal */}
      {pendingOrganization && (
        <OrganizationPasswordPrompt
          organization={pendingOrganization}
          onPasswordSubmit={handlePasswordSubmit}
          onCancel={handlePasswordCancel}
          isVerifying={isVerifyingPassword}
        />
      )}
    </>
  );
};

export default OrganizationSelector;
