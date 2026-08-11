CREATE TABLE public.pickup_requests (
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

GRANT INSERT ON public.pickup_requests TO anon, authenticated;
GRANT ALL ON public.pickup_requests TO service_role;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit a pickup request"
  ON public.pickup_requests FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE TABLE public.job_applications (
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

GRANT INSERT ON public.job_applications TO anon, authenticated;
GRANT ALL ON public.job_applications TO service_role;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can apply for a job"
  ON public.job_applications FOR INSERT TO anon, authenticated WITH CHECK (true);