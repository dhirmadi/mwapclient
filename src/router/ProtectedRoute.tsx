import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';
import { Permission, usePermissions } from '../utils/permissions';
import { ProjectRole } from '../types/auth';

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
  const projectId = params[projectIdParam];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
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
    const hasRequiredPermission = requiredPermissions.some(permission => 
      permissions.can(permission)
    );
    
    if (!hasRequiredPermission) {
      console.log('User lacks required permissions:', requiredPermissions);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Check for project role if specified
  if (projectRole && projectId) {
    const hasRequiredProjectRole = permissions.canInProject(projectId, projectRole);
    
    if (!hasRequiredProjectRole) {
      console.log(`User lacks required project role ${projectRole} for project ${projectId}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  // Legacy role checking (for backward compatibility)
  if (requiredRoles && requiredRoles.length > 0) {
    // Debug roles
    console.log('Protected Route - Required Roles:', requiredRoles);
    console.log('Protected Route - User Roles:', { 
      isSuperAdmin: permissions.isSuperAdmin(), 
      isTenantOwner: permissions.isTenantOwner() 
    });
    
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
      console.log('User lacks required roles:', requiredRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If we've made it this far, the user has the required permissions/roles
  return <Outlet />;
};

export default ProtectedRoute;