const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
require('dotenv').config({ path: './.env.local' });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3001'],
    credentials: true
}));

app.use(express.json());

// API Key authentication middleware
const apiKeyAuth = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (process.env.API_KEY && apiKey !== process.env.API_KEY) {
        return res.status(401).json({ success: false, error: 'Invalid API key' });
    }

    next();
};

app.use('/api', apiKeyAuth);

// ============ PROPERTIES ROUTES ============
app.post('/api/properties/search', async (req, res) => {
    try {
        const filters = req.body;
        const limit = filters.limit || 10;

        let query = supabase
            .from('properties')
            .select('id, description, location, price, currency, area, price_per_m2, status, details');

        if (filters.status) {
            query = query.eq('status', filters.status);
        } else {
            query = query.eq('status', 'disponible');
        }

        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }

        if (filters.minPrice !== undefined) {
            query = query.gte('price', filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            query = query.lte('price', filters.maxPrice);
        }

        if (filters.minArea !== undefined) {
            query = query.gte('area', filters.minArea);
        }

        if (filters.maxArea !== undefined) {
            query = query.lte('area', filters.maxArea);
        }

        query = query.limit(limit).order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error searching properties:', error);
            return res.status(500).json({
                success: false,
                error: 'Error buscando propiedades',
                details: error.message
            });
        }

        res.json({
            success: true,
            data: data || [],
            count: data?.length || 0,
            filters
        });
    } catch (error) {
        console.error('Error in search endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.get('/api/properties/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Propiedad no encontrada'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting property:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ============ APPOINTMENTS ROUTES ============
app.post('/api/appointments/create', async (req, res) => {
    try {
        const appointment = req.body;

        if (!appointment.property_id || !appointment.client_name ||
            !appointment.client_phone || !appointment.scheduled_date ||
            !appointment.scheduled_time) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos',
                required: ['property_id', 'client_name', 'client_phone', 'scheduled_date', 'scheduled_time']
            });
        }

        // Get available agent
        const { data: agents, error: agentsError } = await supabase
            .from('users')
            .select('id, name, email, phone')
            .eq('active', true)
            .limit(1);

        if (agentsError || !agents || agents.length === 0) {
            return res.status(500).json({
                success: false,
                error: 'No hay agentes disponibles en este momento'
            });
        }

        const assignedAgent = agents[0];

        // Create appointment
        const { data: newAppointment, error: appointmentError } = await supabase
            .from('appointments')
            .insert({
                property_id: appointment.property_id,
                agent_id: assignedAgent.id,
                client_name: appointment.client_name,
                client_phone: appointment.client_phone,
                scheduled_date: appointment.scheduled_date,
                scheduled_time: appointment.scheduled_time,
                status: 'agendado',
                notes: appointment.notes || null
            })
            .select('*')
            .single();

        if (appointmentError) {
            console.error('Error creating appointment:', appointmentError);
            return res.status(500).json({
                success: false,
                error: 'Error al crear la cita',
                details: appointmentError.message
            });
        }

        res.json({
            success: true,
            data: {
                ...newAppointment,
                agent_name: assignedAgent.name,
                agent_email: assignedAgent.email,
                agent_phone: assignedAgent.phone
            }
        });
    } catch (error) {
        console.error('Error in create appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.get('/api/appointments/client/:phone', async (req, res) => {
    try {
        const { phone } = req.params;

        const { data, error } = await supabase
            .from('appointments')
            .select(`
        *,
        properties (description, location),
        users (name, email, phone)
      `)
            .eq('client_phone', phone)
            .order('scheduled_date', { ascending: false });

        if (error) {
            return res.status(500).json({
                success: false,
                error: 'Error consultando citas'
            });
        }

        res.json({
            success: true,
            data: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error getting appointments:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.patch('/api/appointments/:id/cancel', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('appointments')
            .update({ status: 'cancelado' })
            .eq('id', id)
            .select('*')
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Cita no encontrada'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error canceling appointment:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// ============ USERS ROUTES ============
app.get('/api/users/available', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role')
            .eq('active', true)
            .order('name');

        if (error) {
            console.error('Error getting available users:', error);
            return res.status(500).json({
                success: false,
                error: 'Error consultando asesores',
                details: error.message
            });
        }

        res.json({
            success: true,
            data: data || [],
            count: data?.length || 0
        });
    } catch (error) {
        console.error('Error in available users endpoint:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('users')
            .select('id, name, email, phone, role, active')
            .eq('id', id)
            .single();

        if (error || !data) {
            return res.status(404).json({
                success: false,
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
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
