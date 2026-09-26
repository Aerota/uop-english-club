GRANT SELECT ON public.activity_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activity_posts TO authenticated;
GRANT ALL ON public.activity_posts TO service_role;

GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon;
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;