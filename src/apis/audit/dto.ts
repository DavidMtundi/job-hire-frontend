export interface IAuditLog {
  id: string;
  user_id: string;
  user_role: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  action_details: Record<string, any> | null;
  ai_used: boolean;
  ai_model: string | null;
  ai_cost_estimate: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface IAuditLogsResponse {
  success: boolean;
  message: string;
  data: {
    items: IAuditLog[];
    total_count: number;
    page: number;
    page_size: number;
  };
}

export interface IAIUsageStat {
  date: string;
  total_ai_actions: number;
  total_cost: number;
  action_type: string;
  unique_users: number;
}

export interface IAIUsageStatsResponse {
  success: boolean;
  message: string;
  data: IAIUsageStat[];
}

