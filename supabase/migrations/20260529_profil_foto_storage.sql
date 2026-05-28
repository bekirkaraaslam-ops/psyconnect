-- Profil fotoğrafları için public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profil-resimleri',
  'profil-resimleri',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Psikologlar kendi klasörlerine yükleyebilir
CREATE POLICY "psikolog kendi fotosunu yukleyebilir"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profil-resimleri'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

-- Psikologlar kendi fotosunu güncelleyebilir / silebilir
CREATE POLICY "psikolog kendi fotosunu guncelleyebilir"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profil-resimleri'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

CREATE POLICY "psikolog kendi fotosunu silebilir"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profil-resimleri'
  AND (storage.foldername(name))[1] = (
    SELECT id::text FROM psychologists WHERE auth_user_id = auth.uid() LIMIT 1
  )
);

-- Herkes public URL üzerinden görebilir
CREATE POLICY "profil fotograflari herkese acik"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profil-resimleri');
