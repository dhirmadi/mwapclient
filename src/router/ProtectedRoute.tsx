import React from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common';

interface ProtectedRouteProps {
  requiredRoles?: string[];
  projectIdParam?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRoles,
  projectIdParam = 'id',
}) => {
  const { isAuthenticated, isLoading, isSuperAdmin, isTenantOwner, hasProjectRole } = useAuth();
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

  // If no specific roles are required, just check for authentication
  if (!requiredRoles || requiredRoles.length === 0) {
    return <Outlet />;
  }

  // Debug roles
  console.log('Protected Route - Required Roles:', requiredRoles);
  console.log('Protected Route - User Roles:', { isSuperAdmin, isTenantOwner });
  
  // Check for required roles
  const hasRequiredRole = requiredRoles.some(role => {
    // Check for SuperAdmin role
    if (role === 'SUPERADMIN') {
      console.log('Checking SUPERADMIN role:', isSuperAdmin);
      return isSuperAdmin;
    }
    
    // Check for TenantOwner role
    if (role === 'TENANT_OWNER') {
      console.log('Checking TENANT_OWNER role:', isTenantOwner);
      return isTenantOwner;
    }
    
    // Check for Project roles (OWNER, DEPUTY, MEMBER)
    if (['OWNER', 'DEPUTY', 'MEMBER'].includes(role) && projectId) {
      const hasRole = hasProjectRole(projectId, role);
      console.log(`Checking project role ${role} for project ${projectId}:`, hasRole);
      return hasRole;
    }
    
    return false;
  });

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;