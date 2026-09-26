CREATE TABLE public.activity_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id uuid NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  activity_id uuid NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
  slug text NOT NULL,
  title text NOT NULL,
  excerpt text,
  header_image_url text,
  post_date date NOT NULL DEFAULT current_date,
  blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  likes_count integer NOT NULL DEFAULT 0,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT activity_posts_status_check CHECK (status IN ('draft','published')),
  CONSTRAINT activity_posts_slug_unique UNIQUE (group_id, activity_id, slug)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_posts TO authenticated;
GRANT SELECT ON public.activity_posts TO anon;
GRANT ALL ON public.activity_posts TO service_role;

ALTER TABLE public.activity_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "posts public read published"
  ON public.activity_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "posts own group read"
  ON public.activity_posts FOR SELECT TO authenticated
  USING (group_id = public.current_group_id());

CREATE POLICY "posts own group write"
  ON public.activity_posts FOR ALL TO authenticated
  USING (group_id = public.current_group_id())
  WITH CHECK (group_id = public.current_group_id());

CREATE POLICY "posts admin all"
  ON public.activity_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER activity_posts_updated_at
  BEFORE UPDATE ON public.activity_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX activity_posts_group_activity_idx
  ON public.activity_posts (group_id, activity_id, post_date DESC);

CREATE TABLE public.post_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id uuid NOT NULL REFERENCES public.activity_posts(id) ON DELETE CASCADE,
  client_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_likes_unique UNIQUE (post_id, client_key)
);

GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;

ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "post likes public read"
  ON public.post_likes FOR SELECT
  USING (true);

CREATE POLICY "post likes public insert"
  ON public.post_likes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.activity_posts p
      WHERE p.id = post_id AND p.status = 'published'
    )
  );

CREATE POLICY "post likes public delete"
  ON public.post_likes FOR DELETE
  USING (true);

CREATE OR REPLACE FUNCTION public.sync_post_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.activity_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSE
    UPDATE public.activity_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER post_likes_count_sync
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_post_likes_count();

UPDATE public.activities
SET slug = 'creative-corner', title = 'Creative Corner'
WHERE slug = 'assignments';