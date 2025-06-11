
-- Create a table for team members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see team members from teams in organizations they have access to
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view team members from teams in their organizations
CREATE POLICY "Users can view team members from their organization teams" 
  ON public.team_members 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE t.id = team_members.team_id 
      AND o.user_id = auth.uid()
    )
  );

-- Create policy that allows users to create team members in teams within their organizations
CREATE POLICY "Users can create team members in their organization teams" 
  ON public.team_members 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE t.id = team_members.team_id 
      AND o.user_id = auth.uid()
    )
  );

-- Create policy that allows users to update team members in teams within their organizations
CREATE POLICY "Users can update team members in their organization teams" 
  ON public.team_members 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE t.id = team_members.team_id 
      AND o.user_id = auth.uid()
    )
  );

-- Create policy that allows users to delete team members from teams within their organizations
CREATE POLICY "Users can delete team members from their organization teams" 
  ON public.team_members 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.organizations o ON t.organization_id = o.id
      WHERE t.id = team_members.team_id 
      AND o.user_id = auth.uid()
    )
  );
