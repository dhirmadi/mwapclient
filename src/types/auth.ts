/**
 * Authentication Types
 * These types define the structure of authentication-related data
 */

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  TENANT_OWNER = 'TENANT_OWNER',
  TENANT_ADMIN = 'TENANT_ADMIN',
  PROJECT_ADMIN = 'PROJECT_ADMIN',
  PROJECT_MEMBER = 'PROJECT_MEMBER',
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  roles: UserRole[];
  tenantId?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}