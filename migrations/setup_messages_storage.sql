-- Create storage bucket for message media
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'messages-media',
  'messages-media',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Public read access policy
CREATE POLICY "Public read access to message media"
ON storage.objects FOR SELECT
USING (bucket_id = 'messages-media');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload message media"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'messages-media' 
  AND auth.role() = 'authenticated'
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own message media"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'messages-media' 
  AND auth.role() = 'authenticated'
);
