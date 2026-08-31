export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  domain: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL';
  settings: Record<string, any>;
  created_at: string;
}

export interface User {
  id: string;
  organization_id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  last_login: string | null;
  roles: Role[];
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
  description: string | null;
  permissions?: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  action: string;
  description: string | null;
}

export interface Team {
  id: string;
  name: string;
  type: 'CALLER' | 'SALES' | 'MANAGEMENT' | 'SUPPORT' | 'CUSTOM';
  manager: User | null;
  members: TeamMember[];
  member_count: number;
  created_at: string;
}

export interface TeamMember {
  user: User;
  role_in_team: string | null;
  joined_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  type: 'CALL' | 'FOLLOW_UP' | 'WHATSAPP' | 'EMAIL' | 'SITE_VISIT' | 'MEETING' | 'PAYMENT' | 'DOCUMENT' | 'BOOKING' | 'APPROVAL' | 'CUSTOM';
  assigned_to: User;
  assigned_by: User;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  due_date: string | null;
  due_time: string | null;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'MISSED' | 'CANCELLED';
  notes: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DashboardStats {
  total_users: number;
  total_teams: number;
  total_tasks: number;
  tasks_today: number;
  tasks_overdue: number;
  tasks_completed: number;
  tasks_by_status: Record<string, number>;
  tasks_by_priority: Record<string, number>;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
  organization: Organization;
}

export interface Integration {
  id: string;
  organization_id: string;
  platform: 'facebook' | '99acres' | 'magicbricks' | 'housing' | 'website' | 'custom';
  is_active: boolean;
  api_key: string | null;
  webhook_url: string | null;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type LeadStage = 
  | 'NEW_LEAD'      // New Lead
  | 'ASSIGNED'      // Assigned to Manager / Employee
  | 'CALLING'       // Calling / Follow-up in progress
  | 'INTERESTED'    // High Intent / Qualified
  | 'SITE_VISIT'    // Site Visit Scheduled / Completed
  | 'NEGOTIATION'   // Pricing & Unit Negotiation
  | 'CONVERTED'     // Converted to Customer (Client)
  | 'LOST'          // Not Interested / Budget Mismatch
  | 'SPAM';         // Spam / Duplicate

export type LeadSource = 
  | 'WEBSITE'
  | 'GOOGLE_ADS'
  | 'META_ADS'
  | '99ACRES'
  | 'MAGICBRICKS'
  | 'JUSTDIAL'
  | 'WALKIN'
  | 'OTHER';

export interface CallLog {
  id: string;
  timestamp: string;
  duration_seconds: number;
  agent_name: string;
  outcome: 'CONNECTED' | 'BUSY' | 'SCHEDULED_VISIT' | 'NOT_INTERESTED' | 'CALLBACK' | 'NO_ANSWER';
  notes: string;
  follow_up_date?: string | null;
  recording_url?: string;
  quality_score?: number; // 0-100
  sentiment?: 'VERY_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'HESITANT' | 'NEGATIVE';
  is_first_call?: boolean;
  transcript_snippet?: string;
}

export type ActivityType = 
  | 'INTAKE' 
  | 'FIRST_CALL' 
  | 'FOLLOW_UP_CALL' 
  | 'WHATSAPP' 
  | 'STAGE_CHANGE' 
  | 'ASSIGNMENT' 
  | 'SITE_VISIT' 
  | 'ADMIN_OVERRIDE' 
  | 'NOTE';

export interface LeadActivity {
  id: string;
  lead_id: string;
  type: ActivityType;
  title: string;
  description: string;
  performed_by: string;
  performed_by_role?: string;
  timestamp: string;
  badge?: string;
  metadata?: {
    duration_seconds?: number;
    call_outcome?: string;
    stage_from?: LeadStage;
    stage_to?: LeadStage;
    assigned_from?: string;
    assigned_to?: string;
    recording_available?: boolean;
    channel?: 'CALL' | 'WHATSAPP' | 'SYSTEM' | 'ADMIN';
    reason?: string;
  };
}

export interface Lead {
  id: string;
  organization_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  source: string;
  budget: string;
  property_type?: string;
  project_name?: string;
  pipeline_stage_id: string;
  stage: LeadStage;
  manager_id?: string | null;
  manager_name?: string | null;
  employee_id?: string | null;
  employee_name?: string | null;
  assigned_to?: string | null; // backward compatibility
  assigned_by?: string | null;
  assigned_at?: string | null;
  is_duplicate?: boolean;
  duplicate_reason?: string | null;
  call_logs?: CallLog[];
  activities?: LeadActivity[];
  notes?: string | null;
  admin_notes?: string | null;
  admin_sentiment?: 'VERY_HOT' | 'HOT_PROSPECT' | 'WARM' | 'PRICE_SENSITIVE' | 'ESCALATED';
  last_contacted_at?: string | null;
  next_follow_up?: string | null;
  created_at: string;
  updated_at?: string;
}

export type PropertyType = '1 BHK' | '2 BHK' | '3 BHK' | '4 BHK' | 'Penthouse' | 'Row House' | 'Plot' | 'Commercial';
export type PossessionStatus = 'Ready to Move' | 'Under Construction' | 'Immediate' | 'Dec 2025' | 'Dec 2026' | 'Mid 2027';

export interface Property {
  id: string;
  name: string;
  project_name: string;
  location: string;
  city: string;
  type: PropertyType;
  carpet_area: string;
  price: number;
  price_display: string;
  possession: PossessionStatus;
  rera_number?: string;
  description: string;
  key_highlights: string[];
  status: 'AVAILABLE' | 'FEW_UNITS_LEFT' | 'SOLD_OUT';
  added_by: string;
  added_by_role?: string;
  created_at: string;
}

export interface PropertyMatchResult {
  property: Property;
  lead: Lead;
  matchScore: number;
  budgetFit: 'PERFECT' | 'UNDER_BUDGET' | 'STRETCH' | 'MISMATCH';
  locationFit: 'EXACT' | 'NEARBY' | 'DIFFERENT';
  typeFit: 'EXACT' | 'ALTERNATIVE';
  reasons: string[];
  pitchScript: string;
  whatsappMessage: string;
}
