
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can view teams from their organizations" ON public.teams;
DROP POLICY IF EXISTS "Users can create teams in their organizations" ON public.teams;
DROP POLICY IF EXISTS "Users can update teams in their organizations" ON public.teams;
DROP POLICY IF EXISTS "Users can delete teams from their organizations" ON public.teams;
DROP POLICY IF EXISTS "Users can view team members from their organization teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can create team members in their organization teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can update team members in their organization teams" ON public.team_members;
DROP POLICY IF EXISTS "Users can delete team members from their organization teams" ON public.team_members;

-- Ensure RLS is enabled on both tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create new policies for teams table
CREATE POLICY "Users can view teams in their organizations" 
  ON public.teams 
  FOR SELECT 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create teams in their organizations" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (
    organization_id IN (
      SELECT id FROM public.organizations WHERE user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update teams in their organizations" 
  ON public.teams 
  FOR UPDATE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete teams in their organizations" 
  ON public.teams 
  FOR DELETE 
  USING (
    organization_id IN (
      SELECT id FROM public.organizations WHERE user_id = auth.uid()
    )
  );

-- Create new policies for team_members table
CREATE POLICY "Users can view team members in their organization teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    team_id IN (
      SELECT t.id FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create team members in their organization teams" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    team_id IN (
      SELECT t.id FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Users can update team members in their organization teams" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    team_id IN (
      SELECT t.id FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team members in their organization teams" 
  ON public.team_members 
  FOR DELETE 
  USING (
    team_id IN (
      SELECT t.id FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE o.user_id = auth.uid()
    )
  );
