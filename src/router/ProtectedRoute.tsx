import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProjectRole } from '../types/auth';
import { LoadingSpinner } from '../components/common';

interface ProtectedRouteProps {
  requireSuperAdmin?: boolean;
  requireTenantOwner?: boolean;
  requireProjectRole?: ProjectRole;
  projectId?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requireSuperAdmin,
  requireTenantOwner,
  requireProjectRole,
  projectId,
}) => {
  const { isAuthenticated, isLoading, isSuperAdmin, isTenantOwner, hasProjectRole } = useAuth();

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

  // Check for super admin requirement
  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for tenant owner requirement
  if (requireTenantOwner && !isTenantOwner) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for project role requirement
  if (requireProjectRole && projectId) {
    if (!hasProjectRole(projectId, requireProjectRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;