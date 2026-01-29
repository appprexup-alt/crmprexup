import { Router } from 'express';
import { supabase } from '../index';

const router = Router();

interface SearchFilters {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    minArea?: number;
    maxArea?: number;
    status?: 'disponible' | 'vendido' | 'separado' | 'bloqueado';
    limit?: number;
}

// POST /api/properties/search
router.post('/search', async (req, res) => {
    try {
        const filters: SearchFilters = req.body;
        const limit = filters.limit || 10;

        let query = supabase
            .from('properties')
            .select('id, description, location, price, currency, area, price_per_m2, status, details');

        // Aplicar filtros
        if (filters.status) {
            query = query.eq('status', filters.status);
        } else {
            // Por defecto solo mostrar disponibles
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

// GET /api/properties/:id
router.get('/:id', async (req, res) => {
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

export default router;
