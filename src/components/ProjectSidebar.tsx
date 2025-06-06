
import React, { useState } from 'react';
import { Plus, Trash2, Folder, Loader2, Edit } from 'lucide-react';
import { Project } from '@/services/projectService';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  onAddProject: (projectName: string) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
  onRenameProject: (projectId: string, newName: string) => Promise<void>;
  isLoading: boolean;
}

const ProjectSidebar = ({ 
  projects, 
  selectedProject, 
  onSelectProject, 
  onAddProject, 
  onDeleteProject,
  onRenameProject,
  isLoading
}: ProjectSidebarProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState('');
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

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
      setOpenPopoverId(null);
      await onDeleteProject(projectId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleRenameProject = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingProjectName(project.name);
    setOpenPopoverId(null);
  };

  const handleRenameSubmit = async (e: React.FormEvent, project: Project) => {
    e.preventDefault();
    if (editingProjectName.trim() && editingProjectName !== project.name) {
      try {
        await onRenameProject(project.id, editingProjectName.trim());
      } catch (error) {
        console.error('Error renaming project:', error);
      }
    }
    setEditingProjectId(null);
    setEditingProjectName('');
  };

  const handleRenameCancel = () => {
    setEditingProjectId(null);
    setEditingProjectName('');
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
                  {editingProjectId === project.id ? (
                    <form onSubmit={(e) => handleRenameSubmit(e, project)} className="flex-1">
                      <input
                        type="text"
                        value={editingProjectName}
                        onChange={(e) => setEditingProjectName(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onBlur={handleRenameCancel}
                        onKeyDown={(e) => {
                          if (e.key === 'Escape') {
                            handleRenameCancel();
                          }
                        }}
                      />
                    </form>
                  ) : (
                    <span className={`truncate text-sm ${
                      selectedProject?.id === project.id ? 'text-blue-900 font-medium' : 'text-gray-700'
                    }`}>
                      {project.name}
                    </span>
                  )}
                </div>
                {editingProjectId !== project.id && (
                  <Popover open={openPopoverId === project.id} onOpenChange={(open) => {
                    setOpenPopoverId(open ? project.id : null);
                  }}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className={`p-1 transition-all ${
                          deletingId === project.id 
                            ? 'opacity-100' 
                            : 'opacity-0 group-hover:opacity-100'
                        } ${
                          deletingId === project.id ? 'text-gray-400' : 'text-gray-500 hover:text-blue-600'
                        }`}
                        disabled={deletingId === project.id}
                      >
                        {deletingId === project.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit className="w-4 h-4" />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-1" align="end">
                      <div className="flex flex-col">
                        <button
                          onClick={() => handleRenameProject(project)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Rename</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectSidebar;
