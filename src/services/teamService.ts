
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Team {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const teamService = {
  async getTeamsByOrganization(organizationId: string): Promise<Team[]> {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTeam(
    name: string,
    description: string,
    organizationId: string,
    user: User
  ): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name,
        description: description || null,
        organization_id: organizationId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeam(team: Team): Promise<Team> {
    const { data, error } = await supabase
      .from('teams')
      .update({
        name: team.name,
        description: team.description,
        updated_at: new Date().toISOString(),
      })
      .eq('id', team.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTeam(id: string): Promise<void> {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
