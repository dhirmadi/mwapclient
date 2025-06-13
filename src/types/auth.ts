export type ProjectRole = 'OWNER' | 'DEPUTY' | 'MEMBER';

export interface ProjectRoleInfo {
  projectId: string;
  role: ProjectRole;
}

export interface UserRolesResponse {
  userId: string;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  tenantId: string | null;
  projectRoles: ProjectRoleInfo[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  roles: UserRolesResponse | null;
  error: Error | null;
}

export interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  hasProjectRole: (projectId: string, requiredRole: ProjectRole) => boolean;
}