
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    const { data, error } = await supabase
      .from("organizations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching organizations:", error);
      throw error;
    }

    return data || [];
  },

  async createOrganization(name: string, description: string, user: User): Promise<Organization> {
    if (!user) {
      throw new Error("User must be logged in to create an organization");
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert({
        name,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating organization:", error);
      throw error;
    }

    return data;
  },

  async updateOrganization(organization: Organization): Promise<Organization> {
    const { data, error } = await supabase
      .from("organizations")
      .update({
        name: organization.name,
        description: organization.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", organization.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating organization:", error);
      throw error;
    }

    return data;
  },

  async deleteOrganization(id: string): Promise<void> {
    const { error } = await supabase
      .from("organizations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting organization:", error);
      throw error;
    }
  },
};
