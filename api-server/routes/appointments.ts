import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

interface CreateAppointmentRequest {
    property_id: string;
    client_name: string;
    client_phone: string;
    scheduled_date: string; // YYYY-MM-DD
    scheduled_time: string; // HH:MM
    notes?: string;
}

// POST /api/appointments/create
router.post('/create', async (req, res) => {
    try {
        const appointment: CreateAppointmentRequest = req.body;

        // Validar campos requeridos
        if (!appointment.property_id || !appointment.client_name ||
            !appointment.client_phone || !appointment.scheduled_date ||
            !appointment.scheduled_time) {
            return res.status(400).json({
                success: false,
                error: 'Faltan campos requeridos',
                required: ['property_id', 'client_name', 'client_phone', 'scheduled_date', 'scheduled_time']
            });
        }

        // 1. Obtener un agente disponible (active = true)
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

        // 2. Crear la cita
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

        // 3. Devolver datos completos incluyendo info del agente
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

// GET /api/appointments/:phone - Obtener citas por teléfono del cliente
router.get('/client/:phone', async (req, res) => {
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

// PATCH /api/appointments/:id/cancel - Cancelar una cita
router.patch('/:id/cancel', async (req, res) => {
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

export default router;
