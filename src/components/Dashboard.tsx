
import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import ProjectSidebar from './ProjectSidebar';
import KanbanBoard from './KanbanBoard';
import UserDropdown from './UserDropdown';
import { User } from '@supabase/supabase-js';
import { projectService, Project } from '@/services/projectService';

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void>;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const userProjects = await projectService.getProjects();
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0]);
      }
    } catch (error) {
      toast({
        title: "Error loading projects",
        description: "There was a problem loading your projects",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addProject = async (projectName: string) => {
    try {
      const newProject = await projectService.createProject(projectName, user);
      setProjects([newProject, ...projects]);
      setSelectedProject(newProject);
      toast({
        title: "Project created",
        description: "Your new project has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error creating project",
        description: "There was a problem creating your project",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await projectService.deleteProject(projectId);
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProjects[0] || null);
      }
      
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error deleting project",
        description: "There was a problem deleting the project",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const renameProject = async (projectId: string, newName: string) => {
    try {
      const projectToRename = projects.find(p => p.id === projectId);
      if (!projectToRename) return;

      const updatedProject = { ...projectToRename, name: newName };
      await projectService.updateProject(updatedProject, user);
      
      const updatedProjects = projects.map(p => 
        p.id === projectId ? updatedProject : p
      );
      setProjects(updatedProjects);
      
      if (selectedProject?.id === projectId) {
        setSelectedProject(updatedProject);
      }
      
      toast({
        title: "Project renamed",
        description: "The project has been renamed successfully",
      });
    } catch (error) {
      toast({
        title: "Error renaming project",
        description: "There was a problem renaming the project",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const updateProject = async (updatedProject: Project) => {
    try {
      await projectService.updateProject(updatedProject, user);
      const updatedProjects = projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      );
      setProjects(updatedProjects);
      setSelectedProject(updatedProject);
    } catch (error) {
      toast({
        title: "Error updating project",
        description: "There was a problem updating the project",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - 15% */}
      <div className="w-[15%] min-w-[250px] bg-white border-r border-gray-200 shadow-sm">
        <ProjectSidebar
          projects={projects}
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          onAddProject={addProject}
          onDeleteProject={deleteProject}
          onRenameProject={renameProject}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content - 85% */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedProject ? selectedProject.name : 'Select a Project'}
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your tasks and track progress
            </p>
          </div>
          <UserDropdown user={user} onLogout={onLogout} />
        </header>

        {/* Kanban Board */}
        <div className="flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading projects...</p>
              </div>
            </div>
          ) : selectedProject ? (
            <KanbanBoard
              project={selectedProject}
              onUpdateProject={updateProject}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Project Selected</h3>
                <p className="text-gray-600">Create a new project or select an existing one to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
