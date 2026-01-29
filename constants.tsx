
import { AppState, PipelineStage, LeadSource } from './types';

export const PRIMARY_GRADIENT = "linear-gradient(90deg, #fcc669 0%, #e94c74 50%, #8a3ab9 100%)";

export const INITIAL_STAGES: PipelineStage[] = [
  { id: '1', name: 'Nuevo', color: '#8a3ab9', order: 0 },
  { id: '2', name: 'Calificado', color: '#fcc669', order: 1 },
  { id: '3', name: 'Visita Programada', color: '#10b981', order: 2 },
  { id: '4', name: 'Negociación', color: '#e94c74', order: 3 },
  { id: '5', name: 'Vendido', color: '#8b5cf6', order: 4 },
];

export const MOCK_LEAD_SOURCES: LeadSource[] = [
  { id: 'ls1', name: 'Web' },
  { id: 'ls2', name: 'Facebook' },
  { id: 'ls3', name: 'Instagram' },
  { id: 'ls4', name: 'TikTok' },
  { id: 'ls5', name: 'Youtube' },
  { id: 'ls6', name: 'Portal Inmobiliario' },
  { id: 'ls7', name: 'Referido' },
  { id: 'ls8', name: 'Otro' },
];

const now = new Date();
const tomorrow = new Date(now);
tomorrow.setDate(now.getDate() + 1);
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);
const nextWeek = new Date(now);
nextWeek.setDate(now.getDate() + 7);

export const MOCK_DATA: AppState = {
  users: [
    { id: 'u1', name: 'Admin User', email: 'admin@immoflow.com', role: 'admin', active: true, created_at: new Date().toISOString() },
    { id: 'u2', name: 'Juan Perez', email: 'juan@immoflow.com', role: 'ejecutivo', active: true, created_at: new Date().toISOString() },
  ],
  projects: [
    { id: 'p1', name: 'Residencial Los Olivos', developer: 'Constructora Alfa', units: 45, phone: '+51987654321', status: 'active' },
    { id: 'p2', name: 'Villa del Campo', developer: 'Hogar Verde', units: 120, phone: '+51912345678', status: 'active' },
  ],
  stages: INITIAL_STAGES,
  lead_sources: MOCK_LEAD_SOURCES,
  leads: [
    { id: 'l1', name: 'Carlos Sanchez', phone: '+51900111222', budget: 150000, budget_currency: 'USD', interest: 'Departamento 3 dorm', project_id: 'p1', advisor_id: 'u2', pipeline_stage_id: '1', chatbot_enabled: true, created_at: now.toISOString(), source_id: 'ls1' },
    { id: 'l2', name: 'Maria Lopez', phone: '+51933444555', budget: 85000, budget_currency: 'USD', interest: 'Terreno Campo', project_id: 'p2', advisor_id: 'u2', pipeline_stage_id: '2', chatbot_enabled: false, created_at: yesterday.toISOString(), source_id: 'ls2' },
    { id: 'l3', name: 'Roberto Gomez', phone: '+51966777888', budget: 210000, budget_currency: 'USD', interest: 'Penthouse', project_id: 'p1', advisor_id: 'u2', pipeline_stage_id: '3', chatbot_enabled: true, created_at: new Date(now.getTime() - 2 * 86400000).toISOString(), source_id: 'ls6' },
    { id: 'l4', name: 'Ana Torres', phone: '+51911222333', budget: 120000, budget_currency: 'USD', interest: 'Casa de campo', project_id: 'p2', advisor_id: 'u2', pipeline_stage_id: '4', chatbot_enabled: true, created_at: new Date(now.getTime() - 5 * 86400000).toISOString(), source_id: 'ls7' },
     { id: 'l5', name: 'Luis Mendoza', phone: '+51955888777', budget: 95000, budget_currency: 'USD', interest: 'Departamento 2 dorm', project_id: 'p1', advisor_id: 'u1', pipeline_stage_id: '1', chatbot_enabled: true, created_at: now.toISOString(), source_id: 'ls1' },
  ],
  properties: [
    { id: 'prop1', description: 'Departamento 201 Torre A', project_id: 'p1', price: 145000, currency: 'USD', area: 85, price_per_m2: 1705, details: 'Vista al parque, balcón', created_at: '2024-01-10T10:00:00Z', status: 'disponible' },
    { id: 'prop2', description: 'Lote 45 Sector B', project_id: 'p2', price: 235000, currency: 'PEN', area: 200, price_per_m2: 1175, details: 'Cerca a club house', created_at: '2024-02-15T15:30:00Z', status: 'disponible' },
     { id: 'prop3', description: 'Casa Modelo C', project_id: 'p2', price: 320000, currency: 'USD', area: 150, price_per_m2: 2133, details: 'Piscina privada', created_at: '2024-03-20T11:00:00Z', status: 'vendido' },
  ],
  tasks: [
    { id: 't1', lead_id: 'l1', description: 'Llamar para coordinar visita', datetime: now.toISOString(), status: 'pendiente' },
    { id: 't2', lead_id: 'l2', description: 'Enviar brochure por WhatsApp', datetime: tomorrow.toISOString(), status: 'pendiente' },
    { id: 't3', lead_id: 'l3', description: 'Firma de contrato de reserva', datetime: nextWeek.toISOString(), status: 'pendiente' },
    { id: 't4', lead_id: 'l1', description: 'Seguimiento inicial', datetime: new Date(now.getTime() - 86400000).toISOString(), status: 'completado' },
    { id: 't5', lead_id: 'l4', description: 'Preparar propuesta económica', datetime: yesterday.toISOString(), status: 'vencido' },
    { id: 't6', lead_id: 'l5', description: 'Primer contacto', datetime: now.toISOString(), status: 'pendiente' },
    { id: 't7', description: 'Reunión de equipo semanal', datetime: tomorrow.toISOString(), status: 'pendiente' },
  ],
  sales: [
    { id: 's1', lead_id: 'l1', property_id: 'prop1', advisor_id: 'u2', project_id: 'p1', sale_amount: 142000, currency: 'USD', sale_type: 'completa', created_at: new Date(now.getFullYear(), now.getMonth(), 15).toISOString() },
    { id: 's2', lead_id: 'l2', property_id: 'prop2', advisor_id: 'u2', project_id: 'p2', sale_amount: 63000, currency: 'PEN', sale_type: 'compartida', created_at: new Date(now.getFullYear(), now.getMonth(), 18).toISOString() },
  ],
  income_expenses: []
};
