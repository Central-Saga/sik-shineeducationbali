export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: string[];
  permissions_count: number;
  users_count: number;
  created_at: string;
  updated_at: string;
}

export interface RoleFormData {
  name: string;
  guard_name?: 'web' | 'api';
  permissions?: string[];
}

