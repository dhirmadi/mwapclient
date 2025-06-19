import { UserRolesResponse, ProjectRole } from '../types/auth';

/**
 * Permission types for the application
 */
export enum Permission {
  // System-level permissions
  MANAGE_TENANTS = 'MANAGE_TENANTS',
  MANAGE_CLOUD_PROVIDERS = 'MANAGE_CLOUD_PROVIDERS',
  MANAGE_PROJECT_TYPES = 'MANAGE_PROJECT_TYPES',
  VIEW_ALL_PROJECTS = 'VIEW_ALL_PROJECTS',
  
  // Tenant-level permissions
  MANAGE_TENANT_SETTINGS = 'MANAGE_TENANT_SETTINGS',
  MANAGE_TENANT_INTEGRATIONS = 'MANAGE_TENANT_INTEGRATIONS',
  CREATE_PROJECTS = 'CREATE_PROJECTS',
  
  // Project-level permissions
  VIEW_PROJECT = 'VIEW_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  MANAGE_PROJECT_MEMBERS = 'MANAGE_PROJECT_MEMBERS',
  MANAGE_PROJECT_FILES = 'MANAGE_PROJECT_FILES',
}

/**
 * Maps user roles to permissions
 * @param roles User roles from the API
 * @returns Set of permissions the user has
 */
export function mapRolesToPermissions(roles: UserRolesResponse | null): Set<Permission> {
  const permissions = new Set<Permission>();
  
  if (!roles) {
    return permissions;
  }
  
  // SuperAdmin has all permissions
  if (roles.isSuperAdmin) {
    Object.values(Permission).forEach(permission => {
      permissions.add(permission);
    });
    return permissions;
  }
  
  // TenantOwner permissions
  if (roles.isTenantOwner && roles.tenantId) {
    permissions.add(Permission.MANAGE_TENANT_SETTINGS);
    permissions.add(Permission.MANAGE_TENANT_INTEGRATIONS);
    permissions.add(Permission.CREATE_PROJECTS);
  }
  
  // Project-specific permissions based on role
  roles.projectRoles.forEach(projectRole => {
    // All project members can view the project
    permissions.add(Permission.VIEW_PROJECT);
    
    // Project owners and deputies can edit the project
    if (projectRole.role === 'OWNER' || projectRole.role === 'DEPUTY') {
      permissions.add(Permission.EDIT_PROJECT);
      permissions.add(Permission.MANAGE_PROJECT_FILES);
    }
    
    // Only project owners can manage members
    if (projectRole.role === 'OWNER') {
      permissions.add(Permission.MANAGE_PROJECT_MEMBERS);
    }
  });
  
  return permissions;
}

/**
 * Checks if a user has a specific permission
 * @param userPermissions Set of permissions the user has
 * @param requiredPermission Permission to check for
 * @returns True if the user has the permission, false otherwise
 */
export function hasPermission(
  userPermissions: Set<Permission>,
  requiredPermission: Permission
): boolean {
  return userPermissions.has(requiredPermission);
}

/**
 * Checks if a user has a specific project-level permission
 * @param roles User roles from the API
 * @param projectId ID of the project to check permissions for
 * @param requiredRole Minimum role required for the permission
 * @returns True if the user has the required role or higher, false otherwise
 */
export function hasProjectPermission(
  roles: UserRolesResponse | null,
  projectId: string,
  requiredRole: ProjectRole
): boolean {
  if (!roles) return false;
  
  // SuperAdmin has all permissions
  if (roles.isSuperAdmin) {
    return true;
  }
  
  const projectRole = roles.projectRoles.find(pr => pr.projectId === projectId);
  if (!projectRole) return false;
  
  // Role hierarchy: OWNER > DEPUTY > MEMBER
  const roleHierarchy = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
  const userRoleValue = roleHierarchy[projectRole.role] || 0;
  const requiredRoleValue = roleHierarchy[requiredRole] || 0;
  
  return userRoleValue >= requiredRoleValue;
}

/**
 * Custom hook to check permissions
 * @param roles User roles from the API
 * @returns Object with permission checking functions
 */
export function usePermissions(roles: UserRolesResponse | null) {
  const permissions = mapRolesToPermissions(roles);
  
  return {
    /**
     * Check if the user has a specific permission
     */
    can: (permission: Permission): boolean => {
      return hasPermission(permissions, permission);
    },
    
    /**
     * Check if the user has a specific project permission
     */
    canInProject: (projectId: string, requiredRole: ProjectRole): boolean => {
      return hasProjectPermission(roles, projectId, requiredRole);
    },
    
    /**
     * Get all permissions the user has
     */
    getAllPermissions: (): Permission[] => {
      return Array.from(permissions);
    },
    
    /**
     * Check if the user is a SuperAdmin
     */
    isSuperAdmin: (): boolean => {
      return roles?.isSuperAdmin || false;
    },
    
    /**
     * Check if the user is a TenantOwner
     */
    isTenantOwner: (): boolean => {
      return roles?.isTenantOwner || false;
    },
    
    /**
     * Get the user's tenant ID
     */
    getTenantId: (): string | null => {
      return roles?.tenantId || null;
    },
  };
}