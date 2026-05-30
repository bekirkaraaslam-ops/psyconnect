-- Blog kapak resimleri için public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'blog-kapaklar',
  'blog-kapaklar',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "psikolog blog kapak yukleyebilir"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'blog-kapaklar'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

CREATE POLICY "psikolog blog kapak guncelleyebilir"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'blog-kapaklar'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

CREATE POLICY "psikolog blog kapak silebilir"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'blog-kapaklar'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

CREATE POLICY "blog kapaklari herkese acik"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'blog-kapaklar');
