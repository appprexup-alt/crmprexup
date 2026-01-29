-- Agregar columnas de teléfono y avatar a la tabla users

-- Agregar columna phone (ya existe en el tipo pero puede no estar en DB)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;

-- Agregar columna avatar
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;

-- Indices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Comentarios
COMMENT ON COLUMN users.phone IS 'Teléfono de contacto del usuario';
COMMENT ON COLUMN users.avatar IS 'URL de la imagen de avatar del usuario';
