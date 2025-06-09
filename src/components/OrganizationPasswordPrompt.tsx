
import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Organization } from '@/services/organizationService';

interface OrganizationPasswordPromptProps {
  organization: Organization;
  onPasswordSubmit: (password: string) => Promise<boolean>;
  onCancel: () => void;
  isVerifying?: boolean;
}

const OrganizationPasswordPrompt = ({
  organization,
  onPasswordSubmit,
  onCancel,
  isVerifying = false
}: OrganizationPasswordPromptProps) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    try {
      const isValid = await onPasswordSubmit(password);
      if (!isValid) {
        setError('Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (error) {
      setError('Failed to verify password. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Password Protected</h3>
            <p className="text-sm text-gray-600">Enter password for "{organization.name}"</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter organization password"
                disabled={isVerifying}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isVerifying}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={!password.trim() || isVerifying}
            >
              {isVerifying ? 'Verifying...' : 'Access Organization'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              disabled={isVerifying}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizationPasswordPrompt;
