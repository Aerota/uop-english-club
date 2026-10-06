CREATE TABLE public.related_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.related_sites TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.related_sites TO authenticated;
GRANT ALL ON public.related_sites TO service_role;
ALTER TABLE public.related_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "related sites public read" ON public.related_sites FOR SELECT USING (true);
CREATE POLICY "related sites admin all" ON public.related_sites FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER related_sites_updated BEFORE UPDATE ON public.related_sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();