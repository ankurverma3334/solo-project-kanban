
import React, { useState, useRef, useEffect } from 'react';
import { Building2, ChevronDown } from 'lucide-react';
import { Organization } from '@/services/organizationService';

interface OrganizationDropdownProps {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelectOrganization: (organization: Organization) => void;
  isLoading: boolean;
}

const OrganizationDropdown = ({ 
  organizations, 
  selectedOrganization, 
  onSelectOrganization, 
  isLoading 
}: OrganizationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 px-3 py-2 bg-gray-100 rounded-lg">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900">
            {selectedOrganization ? selectedOrganization.name : 'Select Organization'}
          </div>
          <div className="text-xs text-gray-500">
            {organizations.length} organization{organizations.length !== 1 ? 's' : ''}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {organizations.length > 0 ? (
              organizations.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    onSelectOrganization(org);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                    selectedOrganization?.id === org.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{org.name}</div>
                    <div className="text-xs text-gray-500">{org.description}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                No organizations found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationDropdown;
