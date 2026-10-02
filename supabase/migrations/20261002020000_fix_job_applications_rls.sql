-- Migration to grant full permissions and enable permissive RLS for job_applications, pickup_requests, fault_rules, and scans tables

-- 1. Job Applications Table & Policies
CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title text NOT NULL,
  track text NOT NULL,
  applicant_name text NOT NULL,
  phone text NOT NULL,
  email text,
  city text,
  experience text NOT NULL,
  skills text,
  status text NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.job_applications TO anon, authenticated, service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert job applications" ON public.job_applications;
CREATE POLICY "Anyone can insert job applications"
  ON public.job_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view job applications" ON public.job_applications;
CREATE POLICY "Anyone can view job applications"
  ON public.job_applications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update job applications" ON public.job_applications;
CREATE POLICY "Anyone can update job applications"
  ON public.job_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete job applications" ON public.job_applications;
CREATE POLICY "Anyone can delete job applications"
  ON public.job_applications FOR DELETE TO anon, authenticated USING (true);


-- 2. Pickup Requests Table & Policies
CREATE TABLE IF NOT EXISTS public.pickup_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address_line text NOT NULL,
  landmark text,
  city text NOT NULL,
  pincode text NOT NULL,
  slot text NOT NULL,
  notes text,
  device text NOT NULL,
  faults text[] NOT NULL DEFAULT '{}',
  urgency text NOT NULL,
  estimated_total integer NOT NULL,
  amount_paid_now integer NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_mode text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.pickup_requests TO anon, authenticated, service_role;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a pickup request" ON public.pickup_requests;
CREATE POLICY "Anyone can submit a pickup request"
  ON public.pickup_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can view pickup requests"
  ON public.pickup_requests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can update pickup requests"
  ON public.pickup_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can delete pickup requests"
  ON public.pickup_requests FOR DELETE TO anon, authenticated USING (true);


-- 3. Fault Rules Table & Policies
CREATE TABLE IF NOT EXISTS public.fault_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device text NOT NULL,
  component text NOT NULL,
  condition text NOT NULL,
  fault text NOT NULL,
  severity text NOT NULL,
  five_r text NOT NULL,
  recommendation text NOT NULL,
  safety_warning text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.fault_rules TO anon, authenticated, service_role;
ALTER TABLE public.fault_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can insert fault rules"
  ON public.fault_rules FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can view fault rules"
  ON public.fault_rules FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can update fault rules"
  ON public.fault_rules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can delete fault rules"
  ON public.fault_rules FOR DELETE TO anon, authenticated USING (true);


-- 4. Scans Table & Policies
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

GRANT ALL ON public.scans TO anon, authenticated, service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert scan logs" ON public.scans;
CREATE POLICY "Anyone can insert scan logs"
  ON public.scans FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can view scan logs" ON public.scans;
CREATE POLICY "Anyone can view scan logs"
  ON public.scans FOR SELECT TO anon, authenticated USING (true);
