/**
 * Company DTOs
 */

export interface ICompany {
  id: string;
  name: string;
  domain: string;
  website?: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  size?: string;
  settings?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ICreateCompanyRequest {
  name: string;
  domain: string;
  website?: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
}

export interface IUpdateCompanyRequest {
  name?: string;
  website?: string;
  logo_url?: string;
  description?: string;
  industry?: string;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
  settings?: Record<string, any>;
}

export interface ICompanyResponse {
  success: boolean;
  message: string;
  data: ICompany;
}

export interface ICompanyUser {
  id: string;
  company_id: string;
  user_id: string;
  role: "owner" | "admin" | "recruiter";
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  is_active: boolean;
  email?: string;
  username?: string;
  company_name?: string;
}

export interface IInviteRecruiterRequest {
  email: string;
  role?: "owner" | "admin" | "recruiter";
}

export interface ICompanySettings {
  id: string;
  company_id: string;
  auto_send_on_application_received: boolean;
  auto_send_on_status_update: boolean;
  email_templates: Record<string, any>;
  notification_settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ICompanySettingsRequest {
  auto_send_on_application_received?: boolean;
  auto_send_on_status_update?: boolean;
  email_templates?: Record<string, any>;
  notification_settings?: Record<string, any>;
}

export interface ICompanySettingsResponse {
  success: boolean;
  message: string;
  data: ICompanySettings;
}

export interface IPublicCompanyRegistrationRequest {
  company_name: string;
  company_domain: string;
  website?: string;
  description?: string;
  industry?: string;
  size?: "startup" | "small" | "medium" | "large" | "enterprise";
  owner_email: string;
  owner_username: string;
  owner_password: string;
}

