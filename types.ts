
export type Role = 'admin' | 'ejecutivo';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: Role;
  active: boolean;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  developer: string;
  units: number;
  phone: string;
  status: 'active' | 'completed' | 'on_hold';
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  budget: number;
  budget_currency: 'USD' | 'PEN';
  interest: string;
  project_id: string;
  advisor_id: string;
  pipeline_stage_id: string;
  chatbot_enabled: boolean;
  created_at: string;
  last_message?: string;
  source_id?: string;
}

export interface Property {
  id: string;
  description: string;
  project_id?: string | null; // Made optional to fix Supabase error
  location?: string;
  price: number;
  currency: 'USD' | 'PEN';
  area: number;
  price_per_m2?: number;
  details?: string;
  status: 'disponible' | 'vendido' | 'separado' | 'bloqueado';
  property_type?: 'terreno' | 'casa' | 'departamento' | 'otro';
  bedrooms?: number;
  bathrooms?: number;
  built_area?: number;
  floors?: number;
  created_at?: string;
}

export interface Message {
  id: string;
  lead_id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  type: string;
  status: string;
  created_at: string;
  whatsapp_id?: string;
  media_url?: string;
  media_type?: 'image' | 'audio' | 'document' | 'text';
  file_name?: string;
  read_at?: string;
  delivered_at?: string;
  metadata?: any;
}

export interface Sale {
  id: string;
  lead_id: string;
  property_id: string;
  advisor_id: string;
  project_id: string;
  sale_amount: number;
  currency: 'USD' | 'PEN';
  sale_type: 'completa' | 'compartida';
  commission_percentage?: number;
  exchange_rate?: number;
  created_at: string;
}

export interface IncomeExpense {
  id: string;
  type: 'ingreso' | 'egreso';
  category: string;
  description: string;
  amount_usd: number;
  amount_pen: number;
  currency: 'USD' | 'PEN';
  exchange_rate: number;
  sale_id?: string;
  created_at: string;
}

export interface Task {
  id: string;
  lead_id?: string;
  description: string;
  datetime: string;
  status: 'pendiente' | 'completado' | 'reprogramado' | 'vencido' | 'descartado';
  notes?: string;
}

export interface LeadSource {
  id: string;
  name: string;
}

export interface AppState {
  leads: Lead[];
  projects: Project[];
  stages: PipelineStage[];
  users: User[];
  properties: Property[];
  tasks: Task[];
  sales: Sale[];
  income_expenses: IncomeExpense[];
  lead_sources: LeadSource[];
}