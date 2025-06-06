
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

// Type for Supabase's Project table row
type SupabaseProject = {
  id: string;
  name: string;
  user_id: string;
  columns: Json;
  created_at: string;
  updated_at: string;
};

// Type for our application's Project model
export interface Project {
  id: string;
  name: string;
  columns: Array<{
    id: string;
    title: string;
    cards: Array<{
      id: number;
      title: string;
      description: string;
      createdAt: string;
    }>;
  }>;
}

// Convert from Supabase model to our application model
const mapToProject = (supabaseProject: SupabaseProject): Project => {
  return {
    id: supabaseProject.id,
    name: supabaseProject.name,
    // Parse the JSON string or use the JSON object directly, depending on what Supabase returns
    columns: (typeof supabaseProject.columns === 'string' 
      ? JSON.parse(supabaseProject.columns as string) 
      : supabaseProject.columns) as Project['columns']
  };
};

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    // Map the Supabase results to our Project type
    return (data || []).map(project => mapToProject(project as SupabaseProject));
  },

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return null;
    }

    // Map the Supabase result to our Project type
    return data ? mapToProject(data as SupabaseProject) : null;
  },

  async createProject(name: string): Promise<Project> {
    // Get the current user's ID
    const { user } = useAuth();
    
    if (!user) {
      throw new Error("User must be logged in to create a project");
    }

    const newProjectData = {
      name,
      user_id: user.id,
      columns: [
        { id: "todo", title: "To Do", cards: [] },
        { id: "doing", title: "Doing", cards: [] },
        { id: "done", title: "Done", cards: [] },
      ],
    };

    const { data, error } = await supabase
      .from("projects")
      .insert({
        name: newProjectData.name,
        user_id: newProjectData.user_id,
        columns: newProjectData.columns as Json
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      throw error;
    }

    // Map the Supabase result to our Project type
    return mapToProject(data as SupabaseProject);
  },

  async updateProject(project: Project): Promise<Project> {
    // Get the current user's ID
    const { user } = useAuth();
    
    if (!user) {
      throw new Error("User must be logged in to update a project");
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name: project.name,
        columns: project.columns as unknown as Json,
        user_id: user.id
      })
      .eq("id", project.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      throw error;
    }

    // Map the Supabase result to our Project type
    return mapToProject(data as SupabaseProject);
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};
