
import { supabase } from "@/integrations/supabase/client";

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

    return data || [];
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

    return data;
  },

  async createProject(name: string): Promise<Project> {
    const newProject = {
      name,
      columns: [
        { id: "todo", title: "To Do", cards: [] },
        { id: "doing", title: "Doing", cards: [] },
        { id: "done", title: "Done", cards: [] },
      ],
    };

    const { data, error } = await supabase
      .from("projects")
      .insert(newProject)
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      throw error;
    }

    return data;
  },

  async updateProject(project: Project): Promise<Project> {
    const { data, error } = await supabase
      .from("projects")
      .update(project)
      .eq("id", project.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      throw error;
    }

    return data;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  },
};
