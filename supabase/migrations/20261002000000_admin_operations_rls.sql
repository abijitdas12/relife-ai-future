-- Migration to enable full CRUD & Admin operations on pickup_requests, job_applications, and fault_rules

-- 1. Pickup Requests Policies
GRANT ALL ON public.pickup_requests TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can view pickup requests"
  ON public.pickup_requests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can update pickup requests"
  ON public.pickup_requests FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete pickup requests" ON public.pickup_requests;
CREATE POLICY "Anyone can delete pickup requests"
  ON public.pickup_requests FOR DELETE TO anon, authenticated USING (true);


-- 2. Job Applications Policies
GRANT ALL ON public.job_applications TO anon, authenticated, service_role;

DROP POLICY IF EXISTS "Anyone can view job applications" ON public.job_applications;
CREATE POLICY "Anyone can view job applications"
  ON public.job_applications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can update job applications" ON public.job_applications;
CREATE POLICY "Anyone can update job applications"
  ON public.job_applications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete job applications" ON public.job_applications;
CREATE POLICY "Anyone can delete job applications"
  ON public.job_applications FOR DELETE TO anon, authenticated USING (true);


-- 3. Fault Rules Policies
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

DROP POLICY IF EXISTS "Anyone can view fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can view fault rules"
  ON public.fault_rules FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can insert fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can insert fault rules"
  ON public.fault_rules FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can update fault rules"
  ON public.fault_rules FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can delete fault rules" ON public.fault_rules;
CREATE POLICY "Anyone can delete fault rules"
  ON public.fault_rules FOR DELETE TO anon, authenticated USING (true);
