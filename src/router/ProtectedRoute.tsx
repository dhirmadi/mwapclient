import React from 'react';
import { Navigate, Outlet, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import { Permission, usePermissions } from '../utils/permissions';
import { ProjectRole } from '../types/auth';
import { notifications } from '@mantine/notifications';

interface ProtectedRouteProps {
  requiredRoles?: string[];
  requiredPermissions?: Permission[];
  projectIdParam?: string;
  projectRole?: ProjectRole;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles,
  requiredPermissions,
  projectIdParam = 'id',
  projectRole,
}) => {
  const { isAuthenticated, isLoading, roles } = useAuth();
  const permissions = usePermissions(roles);
  const params = useParams();
  const location = useLocation();
  const projectId = params[projectIdParam];

  // Show loading spinner while authentication is in progress
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Verifying access..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles or permissions are required, just check for authentication
  if ((!requiredRoles || requiredRoles.length === 0) && 
      (!requiredPermissions || requiredPermissions.length === 0) &&
      !projectRole) {
    return <Outlet />;
  }

  // Debug permissions
  console.log('Protected Route - Required Permissions:', requiredPermissions);
  console.log('Protected Route - User Permissions:', permissions.getAllPermissions());
  
  // Check for required permissions first (new permission system)
  if (requiredPermissions && requiredPermissions.length > 0) {
    // For project-specific permissions, we need to check if the user has the permission for the specific project
    if (projectId && requiredPermissions.some(p => p.startsWith('VIEW_PROJECT') || p.startsWith('EDIT_PROJECT') || p.startsWith('MANAGE_PROJECT'))) {
      // Check project-specific permissions
      const projectPermissions = requiredPermissions.filter(p => 
        p.startsWith('VIEW_PROJECT') || p.startsWith('EDIT_PROJECT') || p.startsWith('MANAGE_PROJECT')
      );
      
      const hasProjectPermission = projectPermissions.some(permission => {
        // Convert permission to project role
        let requiredRole: ProjectRole = 'MEMBER';
        if (permission === Permission.EDIT_PROJECT) requiredRole = 'DEPUTY';
        if (permission === Permission.MANAGE_PROJECT_MEMBERS) requiredRole = 'OWNER';
        
        return permissions.canInProject(projectId, requiredRole);
      });
      
      if (!hasProjectPermission) {
        notifications.show({
          title: 'Access Denied',
          message: `You don't have permission to access this project resource`,
          color: 'red',
        });
        return <Navigate to="/unauthorized" replace />;
      }
    } else {
      // Check global permissions
      const hasRequiredPermission = requiredPermissions.some(permission => 
        permissions.can(permission)
      );
      
      if (!hasRequiredPermission) {
        notifications.show({
          title: 'Access Denied',
          message: `You don't have the required permissions to access this resource`,
          color: 'red',
        });
        return <Navigate to="/unauthorized" replace />;
      }
    }
  }
  
  // Check for project role if specified (direct project role check)
  if (projectRole && projectId) {
    const hasRequiredProjectRole = permissions.canInProject(projectId, projectRole);
    
    if (!hasRequiredProjectRole) {
      notifications.show({
        title: 'Access Denied',
        message: `You need ${projectRole} role or higher to access this project resource`,
        color: 'red',
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Legacy role checking (for backward compatibility)
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => {
      // Check for SuperAdmin role
      if (role === 'SUPERADMIN') {
        return permissions.isSuperAdmin();
      }
      
      // Check for TenantOwner role
      if (role === 'TENANT_OWNER') {
        return permissions.isTenantOwner();
      }
      
      // Check for Project roles (OWNER, DEPUTY, MEMBER)
      if (['OWNER', 'DEPUTY', 'MEMBER'].includes(role) && projectId) {
        return permissions.canInProject(projectId, role as ProjectRole);
      }
      
      return false;
    });

    if (!hasRequiredRole) {
      notifications.show({
        title: 'Access Denied',
        message: `You need ${requiredRoles.join(' or ')} role to access this resource`,
        color: 'red',
      });
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If we've made it this far, the user has the required permissions/roles
  return <Outlet />;
};

export default ProtectedRoute;