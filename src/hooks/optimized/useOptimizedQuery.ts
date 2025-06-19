import { QueryKey, UseQueryOptions, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import { Permission, usePermissions } from '../../utils/permissions';

/**
 * Configuration for role-based query optimization
 */
interface RoleBasedQueryConfig {
  requireSuperAdmin?: boolean;
  requireTenantOwner?: boolean;
  requirePermissions?: Permission[];
  requireTenantId?: boolean;
  fetchOnMount?: boolean;
}

/**
 * A hook that optimizes data fetching based on user roles and permissions
 * 
 * @param queryKey - The React Query key
 * @param queryFn - The function that fetches data
 * @param config - Role-based configuration for when to fetch data
 * @param options - Additional React Query options
 * @returns The React Query result
 */
export function useOptimizedQuery<TData, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  config: RoleBasedQueryConfig = {},
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn' | 'enabled'>
) {
  const { roles, isSuperAdmin, isTenantOwner } = useAuth();
  const permissions = usePermissions(roles);
  
  // Determine if the query should be enabled based on roles and permissions
  const shouldEnable = () => {
    // If fetchOnMount is explicitly set to false, don't fetch on mount
    if (config.fetchOnMount === false) {
      return false;
    }
    
    // Check for required roles
    if (config.requireSuperAdmin && !isSuperAdmin) {
      return false;
    }
    
    if (config.requireTenantOwner && !isTenantOwner) {
      return false;
    }
    
    // Check for required permissions
    if (config.requirePermissions && config.requirePermissions.length > 0) {
      const hasRequiredPermission = config.requirePermissions.some(
        permission => permissions.can(permission)
      );
      
      if (!hasRequiredPermission) {
        return false;
      }
    }
    
    // Check for tenant ID if required
    if (config.requireTenantId && !roles?.tenantId) {
      return false;
    }
    
    return true;
  };
  
  // Use React Query with optimized enabled state
  return useQuery<TData, TError, TData>({
    queryKey,
    queryFn,
    enabled: shouldEnable(),
    ...options
  });
}

/**
 * Default query configuration with sensible defaults for performance
 */
export const defaultQueryConfig: Partial<UseQueryOptions<any, Error, any>> = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  refetchOnWindowFocus: false, // Don't refetch when window regains focus
  refetchOnMount: false, // Don't refetch when component mounts
};

export default useOptimizedQuery;