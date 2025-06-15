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

  // Check for required roles
  const hasRequiredRole = requiredRoles.some(role => {
    // Check for SuperAdmin role
    if (role === 'SUPERADMIN') {
      return isSuperAdmin;
    }
    
    // Check for TenantOwner role
    if (role === 'TENANT_OWNER') {
      return isTenantOwner;
    }
    
    // Check for Project roles (OWNER, DEPUTY, MEMBER)
    if (['OWNER', 'DEPUTY', 'MEMBER'].includes(role) && projectId) {
      return hasProjectRole(projectId, role);
    }
    
    return false;
  });

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;