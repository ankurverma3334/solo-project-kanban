import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { ChartLine } from 'lucide-react';
import ProjectSidebar from './ProjectSidebar';
import KanbanBoard from './KanbanBoard';
import UserDropdown from './UserDropdown';
import OrganizationSelector from './OrganizationSelector';
import { User } from '@supabase/supabase-js';
import { projectService, Project } from '@/services/projectService';
import { organizationService, Organization } from '@/services/organizationService';

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void>;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOrganizationsLoading, setIsOrganizationsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrganization) {
      loadProjects(selectedOrganization.id);
    }
  }, [selectedOrganization]);

  const loadOrganizations = async () => {
    try {
      setIsOrganizationsLoading(true);
      const userOrganizations = await organizationService.getOrganizations();
      setOrganizations(userOrganizations);
      
      if (userOrganizations.length > 0) {
        setSelectedOrganization(userOrganizations[0]);
      }
    } catch (error) {
      toast({
        title: "Error loading organizations",
        description: "There was a problem loading your organizations",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsOrganizationsLoading(false);
    }
  };

  const loadProjects = async (organizationId: string) => {
    try {
      setIsLoading(true);
      const userProjects = await projectService.getProjects(organizationId);
      setProjects(userProjects);
      
      if (userProjects.length > 0) {
        setSelectedProject(userProjects[0]);
      } else {
        setSelectedProject(null);
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
    if (!selectedOrganization) {
      toast({
        title: "No organization selected",
        description: "Please select an organization first",
        variant: "destructive",
      });
      return;
    }

    try {
      const newProject = await projectService.createProject(projectName, user, selectedOrganization.id);
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

  const handleOrganizationSelect = (organization: Organization) => {
    setSelectedOrganization(organization);
    setSelectedProject(null);
    setProjects([]);
  };

  const handleProgressDashboardClick = () => {
    navigate('/progress');
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
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {selectedProject ? selectedProject.name : 'Select a Project'}
              </h1>
              <p className="text-gray-600 text-sm">
                Manage your tasks and track progress
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <OrganizationSelector
                organizations={organizations}
                selectedOrganization={selectedOrganization}
                onSelectOrganization={handleOrganizationSelect}
                isLoading={isOrganizationsLoading}
              />
              {selectedOrganization && (
                <button
                  onClick={handleProgressDashboardClick}
                  className="flex items-center justify-center w-10 h-10 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  title="Progress Dashboard"
                >
                  <ChartLine className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <UserDropdown user={user} onLogout={onLogout} />
        </header>

        {/* Kanban Board */}
        <div className="flex-1 p-6">
          {isLoading || isOrganizationsLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">
                  {isOrganizationsLoading ? 'Loading organizations...' : 'Loading projects...'}
                </p>
              </div>
            </div>
          ) : selectedProject ? (
            <KanbanBoard
              project={selectedProject}
              onUpdateProject={updateProject}
            />
          ) : selectedOrganization ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Projects in {selectedOrganization.name}</h3>
                <p className="text-gray-600">Create a new project to get started</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Organization Selected</h3>
                <p className="text-gray-600">Select an organization to view and manage projects</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
