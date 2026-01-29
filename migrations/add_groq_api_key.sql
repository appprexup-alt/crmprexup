-- Drop old constraint and add new one with 'groq'
ALTER TABLE settings 
DROP CONSTRAINT IF EXISTS settings_ai_provider_check;

ALTER TABLE settings
ADD CONSTRAINT settings_ai_provider_check 
CHECK (ai_provider IN ('gemini', 'openai', 'groq', 'disabled'));
