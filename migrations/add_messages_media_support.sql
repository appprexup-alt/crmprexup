-- Add media support to messages table

-- Add media columns
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS media_url TEXT,
  ADD COLUMN IF NOT EXISTS media_type VARCHAR(20), 
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMP;

-- Add index for media queries
CREATE INDEX IF NOT EXISTS idx_messages_media 
  ON messages(media_type) 
  WHERE media_type IS NOT NULL;

-- Add index for performance on lead messages
CREATE INDEX IF NOT EXISTS idx_messages_lead_created 
  ON messages(lead_id, created_at DESC);

-- Comments
COMMENT ON COLUMN messages.media_url IS 'URL to media file in Supabase Storage';
COMMENT ON COLUMN messages.media_type IS 'Type of media: image, audio, document, text';
COMMENT ON COLUMN messages.file_name IS 'Original filename of uploaded media';
COMMENT ON COLUMN messages.delivered_at IS 'Timestamp when message was delivered';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when message was read';
