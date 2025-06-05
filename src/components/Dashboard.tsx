
import React, { useState, useEffect } from 'react';
import ProjectSidebar from './ProjectSidebar';
import KanbanBoard from './KanbanBoard';
import UserDropdown from './UserDropdown';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  user: User;
  onLogout: () => Promise<void>;
}

interface Project {
  id: number;
  name: string;
  columns: Array<{
    id: string;
    title: string;
    cards: Array<any>;
  }>;
}

const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    // Load projects from localStorage
    const savedProjects = localStorage.getItem('kanban_projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) {
        setSelectedProject(parsedProjects[0]);
      }
    }
  }, []);

  useEffect(() => {
    // Save projects to localStorage whenever projects change
    localStorage.setItem('kanban_projects', JSON.stringify(projects));
  }, [projects]);

  const addProject = (projectName: string) => {
    const newProject: Project = {
      id: Date.now(),
      name: projectName,
      columns: [
        { id: 'todo', title: 'To Do', cards: [] },
        { id: 'doing', title: 'Doing', cards: [] },
        { id: 'done', title: 'Done', cards: [] }
      ]
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setSelectedProject(newProject);
  };

  const deleteProject = (projectId: number) => {
    const updatedProjects = projects.filter(p => p.id !== projectId);
    setProjects(updatedProjects);
    if (selectedProject?.id === projectId) {
      setSelectedProject(updatedProjects[0] || null);
    }
  };

  const updateProject = (updatedProject: Project) => {
    const updatedProjects = projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    );
    setProjects(updatedProjects);
    setSelectedProject(updatedProject);
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
          {selectedProject ? (
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
