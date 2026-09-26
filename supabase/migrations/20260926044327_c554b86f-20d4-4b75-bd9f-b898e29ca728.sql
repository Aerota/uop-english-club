CREATE POLICY "posts bucket read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "posts bucket insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'posts');

CREATE POLICY "posts bucket update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'posts')
  WITH CHECK (bucket_id = 'posts');

CREATE POLICY "posts bucket delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'posts');