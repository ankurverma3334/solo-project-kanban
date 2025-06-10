
-- Create a table for teams within organizations
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see teams from organizations they have access to
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view teams from organizations they own
CREATE POLICY "Users can view teams from their organizations" 
  ON public.teams 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE organizations.id = teams.organization_id 
      AND organizations.user_id = auth.uid()
    )
  );

-- Create policy that allows users to create teams in their organizations
CREATE POLICY "Users can create teams in their organizations" 
  ON public.teams 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE organizations.id = teams.organization_id 
      AND organizations.user_id = auth.uid()
    )
  );

-- Create policy that allows users to update teams in their organizations
CREATE POLICY "Users can update teams in their organizations" 
  ON public.teams 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE organizations.id = teams.organization_id 
      AND organizations.user_id = auth.uid()
    )
  );

-- Create policy that allows users to delete teams from their organizations
CREATE POLICY "Users can delete teams from their organizations" 
  ON public.teams 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE organizations.id = teams.organization_id 
      AND organizations.user_id = auth.uid()
    )
  );
