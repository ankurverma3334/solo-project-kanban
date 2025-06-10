
import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, LogOut, ChevronDown, Building2 } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface UserDropdownProps {
  user: SupabaseUser;
  onLogout: () => Promise<void>;
}

const UserDropdown = ({ user, onLogout }: UserDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  const handleOrganizationsClick = () => {
    setIsOpen(false);
    navigate('/organizations');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 capitalize">
            {displayName}
          </div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={handleOrganizationsClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>Manage Organizations</span>
            </button>
            <button
              onClick={handleSettingsClick}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>Settings & Account</span>
            </button>
            <hr className="my-1" />
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
