
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface TeamMember {
  id: string;
  team_id: string;
  name: string;
  email: string | null;
  role: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const teamMemberService = {
  async getTeamMembersByTeam(teamId: string): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createTeamMember(
    name: string,
    email: string,
    role: string,
    teamId: string,
    user: User
  ): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name,
        email: email || null,
        role: role || null,
        team_id: teamId,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTeamMember(teamMember: TeamMember): Promise<TeamMember> {
    const { data, error } = await supabase
      .from('team_members')
      .update({
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        updated_at: new Date().toISOString(),
      })
      .eq('id', teamMember.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTeamMember(id: string): Promise<void> {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
