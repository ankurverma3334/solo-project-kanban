
import React from 'react';
import { Building } from 'lucide-react';
import { Organization } from '@/services/organizationService';
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
  const handleValueChange = (value: string) => {
    const organization = organizations.find(org => org.id === value);
    if (organization) {
      onSelectOrganization(organization);
    }
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
    <div className="flex items-center space-x-2">
      <Building className="w-4 h-4 text-gray-600" />
      <Select value={selectedOrganization?.id || ""} onValueChange={handleValueChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OrganizationSelector;
