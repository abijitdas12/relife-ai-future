-- Create scans table to persist AI Diagnostic Scans & RDE Evaluations
CREATE TABLE IF NOT EXISTS public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  likely_model text,
  visible_condition text NOT NULL,
  possible_faults text[] NOT NULL DEFAULT '{}',
  confidence text NOT NULL DEFAULT 'medium',
  requires_human_inspection boolean NOT NULL DEFAULT true,
  repairability_score integer NOT NULL DEFAULT 50,
  r5_category text NOT NULL,
  reasoning text[] NOT NULL DEFAULT '{}',
  estimated_repair_cost integer NOT NULL DEFAULT 0,
  estimated_replace_cost integer NOT NULL DEFAULT 0,
  cost_ratio numeric(5,2),
  image_url text,
  user_fault_description text,
  raw_gemini_output jsonb,
  raw_rde_output jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS & Grants
GRANT ALL ON public.scans TO anon, authenticated, service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert scan logs" ON public.scans;
CREATE POLICY "Anyone can insert scan logs"
  ON public.scans FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view scan logs" ON public.scans;
CREATE POLICY "Anyone can view scan logs"
  ON public.scans FOR SELECT TO anon, authenticated USING (true);
