
import React, { useState } from 'react';
import { Plus, Trash2, Folder, Loader2 } from 'lucide-react';
import { Project } from '@/services/projectService';

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: (projectName: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  isLoading: boolean;
}

const ProjectSidebar = ({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onAddProject, 
  onDeleteProject,
  isLoading
}: ProjectSidebarProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      try {
        setIsAdding(true);
        await onAddProject(newProjectName.trim());
        setNewProjectName('');
        setShowAddForm(false);
      } finally {
        setIsAdding(false);
      }
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      setDeletingId(projectId);
      await onDeleteProject(projectId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Projects</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          disabled={isAdding}
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Add Project Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleAddProject}>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Project name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
              disabled={isAdding}
            />
            <div className="flex space-x-2 mt-2">
              <button
                type="submit"
                className="flex-1 px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center justify-center"
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProjectName('');
                }}
                className="flex-1 px-3 py-1 bg-gray-400 text-white text-sm rounded hover:bg-gray-500 transition-colors"
                disabled={isAdding}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <Folder className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm">No projects yet</p>
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedProject?.id === project.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => onSelectProject(project)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Folder className={`w-4 h-4 flex-shrink-0 ${
                    selectedProject?.id === project.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <span className={`truncate text-sm ${
                    selectedProject?.id === project.id ? 'text-blue-900 font-medium' : 'text-gray-700'
                  }`}>
                    {project.name}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteProject(project.id);
                  }}
                  className={`p-1 transition-all ${
                    deletingId === project.id 
                      ? 'opacity-100' 
                      : 'opacity-0 group-hover:opacity-100'
                  } ${
                    deletingId === project.id ? 'text-gray-400' : 'text-red-500 hover:text-red-700'
                  }`}
                  disabled={deletingId === project.id}
                >
                  {deletingId === project.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
