import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import propertiesRouter from './routes/properties';
import appointmentsRouter from './routes/appointments';
import usersRouter from './routes/users';

// Tipos de entorno
declare global {
    namespace NodeJS {
        interface ProcessEnv {
            VITE_SUPABASE_URL: string;
            VITE_SUPABASE_ANON_KEY: string;
            API_PORT?: string;
            API_KEY?: string;
        }
    }
}

// Cargar variables de entorno desde .env.local
import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(__dirname, '../.env.local') });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Supabase client
export const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!
);

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

// API Key authentication middleware (opcional)
const apiKeyAuth = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['x-api-key'];

    // Si hay API_KEY configurada, validarla
    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
        return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    next();
};

// Aplicar middleware de autenticación a todas las rutas /api
app.use('/api', apiKeyAuth);

// Rutas
app.use('/api/properties', propertiesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/users', usersRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});
