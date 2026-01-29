import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

// GET /api/users/available - Listar asesores disponibles
router.get('/available', async (req, res) => {
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

// GET /api/users/:id - Obtener información de un asesor
router.get('/:id', async (req, res) => {
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

export default router;
