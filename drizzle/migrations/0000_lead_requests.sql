CREATE TABLE public.lead_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  needs text[] NOT NULL DEFAULT '{}',
  business text NOT NULL DEFAULT '' CHECK (char_length(business) <= 1000),
  goal text CHECK (char_length(goal) <= 100),
  existing text CHECK (char_length(existing) <= 100),
  timeline text CHECK (char_length(timeline) <= 100),
  budget text CHECK (char_length(budget) <= 100),
  consent boolean NOT NULL,
  status text NOT NULL DEFAULT 'new'
);
GRANT ALL ON public.lead_requests TO service_role;
ALTER TABLE public.lead_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX lead_requests_email_created_idx ON public.lead_requests (email, created_at DESC);