
import { supabase } from "@/integrations/supabase/client";
import { User } from '@supabase/supabase-js';

export interface Organization {
  id: string;
  name: string;
  description?: string;
  user_id: string;
  is_password_protected: boolean;
  password_hash?: string;
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

  async createOrganization(
    name: string, 
    description: string, 
    user: User,
    password?: string
  ): Promise<Organization> {
    if (!user) {
      throw new Error("User must be logged in to create an organization");
    }

    const orgData: any = {
      name,
      description,
      user_id: user.id,
      is_password_protected: !!password,
    };

    // If password is provided, hash it (in a real app, this should be done server-side)
    if (password) {
      // Simple hash for demo purposes - in production, use proper bcrypt on server
      orgData.password_hash = btoa(password);
    }

    const { data, error } = await supabase
      .from("organizations")
      .insert(orgData)
      .select()
      .single();

    if (error) {
      console.error("Error creating organization:", error);
      throw error;
    }

    return data;
  },

  async updateOrganization(organization: Organization): Promise<Organization> {
    const updateData: any = {
      name: organization.name,
      description: organization.description,
      updated_at: new Date().toISOString(),
    };

    // If password-related fields are being updated
    if ('is_password_protected' in organization) {
      updateData.is_password_protected = organization.is_password_protected;
    }
    
    if ('password_hash' in organization) {
      updateData.password_hash = organization.password_hash;
    }

    const { data, error } = await supabase
      .from("organizations")
      .update(updateData)
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

  async verifyOrganizationPassword(organizationId: string, password: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("organizations")
      .select("password_hash")
      .eq("id", organizationId)
      .eq("is_password_protected", true)
      .single();

    if (error || !data) {
      console.error("Error verifying password:", error);
      return false;
    }

    // Simple comparison for demo purposes - in production, use proper bcrypt comparison
    return data.password_hash === btoa(password);
  },
};
