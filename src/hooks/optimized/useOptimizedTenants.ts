import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../utils/api';
import { Tenant, TenantCreate, TenantUpdate } from '../../types/tenant';
import { CloudProviderIntegration } from '../../types/cloud-provider';
import { useAuth } from '../../context/AuthContext';
import { extractData, extractArrayData, createApiError } from '../../utils/apiResponseHandler';
import { usePermissions, Permission } from '../../utils/permissions';
import { useOptimizedQuery, defaultQueryConfig } from './useOptimizedQuery';

/**
 * Hook for optimized tenant data fetching and management
 * 
 * This hook provides access to tenant data with optimized API calls:
 * - Tenants are only fetched when explicitly requested
 * - Current tenant uses data from roles when possible
 * - Tenant integrations are only fetched when needed
 */
export const useOptimizedTenants = (includeArchived: boolean = false) => {
  const queryClient = useQueryClient();
  const { roles, isSuperAdmin, isTenantOwner } = useAuth();
  const permissions = usePermissions(roles);
  const canManageTenants = permissions.can(Permission.MANAGE_TENANTS);
  const tenantId = roles?.tenantId;

  // Fetch active tenants (SuperAdmin or users with MANAGE_TENANTS permission)
  // Only fetch when explicitly requested, not on application load
  const { 
    data: tenants = [], 
    isLoading, 
    error,
    refetch 
  } = useOptimizedQuery<Tenant[]>(
    ['tenants', 'active'],
    async () => {
      try {
        const response = await api.fetchTenants(includeArchived);
        return extractArrayData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to fetch tenants');
      }
    },
    { fetchOnMount: false },
    defaultQueryConfig
  );
  
  // Fetch archived tenants separately (SuperAdmin or users with MANAGE_TENANTS permission)
  // Only fetch when explicitly requested
  const {
    data: archivedTenants = [],
    isLoading: isLoadingArchived,
    error: archivedError,
    refetch: refetchArchived
  } = useOptimizedQuery<Tenant[]>(
    ['tenants', 'archived'],
    async () => {
      try {
        const response = await api.fetchArchivedTenants();
        return extractArrayData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to fetch archived tenants');
      }
    },
    { fetchOnMount: false },
    defaultQueryConfig
  );

  // Use the tenant ID from roles directly instead of making an API call
  const { 
    data: currentTenant, 
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError,
    refetch: refetchCurrentTenant
  } = useOptimizedQuery<Tenant | null>(
    ['tenant-current'],
    async () => {
      // If we already have the tenant ID from roles, create a minimal tenant object
      if (roles?.tenantId) {
        // If we need more tenant details, we can fetch them on demand
        // For now, return a minimal tenant object with the ID
        return {
          id: roles.tenantId,
          _id: roles.tenantId,
          name: roles.tenantName || 'My Tenant',
          ownerId: '',
          createdAt: new Date().toISOString(),
          settings: {}
        } as Tenant;
      }
      
      try {
        const response = await api.fetchTenant();
        return extractData<Tenant>(response);
      } catch (error: any) {
        // Don't throw for 404 errors (user doesn't have a tenant yet)
        // This is expected for SuperAdmins or new users
        if (error.response?.status === 404 || 
            (error.message && error.message.includes('Tenant not found'))) {
          console.log('User does not have a tenant yet - this is normal for SuperAdmins');
          return null;
        }
        
        // For other errors, throw a formatted error
        console.error('Error fetching current tenant:', error);
        throw createApiError(error, 'Failed to fetch current tenant');
      }
    },
    { 
      requireTenantId: true,
      requireTenantOwner: true
    },
    {
      ...defaultQueryConfig,
      retry: (failureCount, error: any) => {
        // Don't retry for 404 errors
        if (error.response?.status === 404 || 
            (error.message && error.message.includes('Tenant not found'))) {
          return false;
        }
        // Retry other errors up to 2 times
        return failureCount < 2;
      },
      // Don't show error notifications for 404 errors
      useErrorBoundary: (error: any) => {
        return !(error.response?.status === 404 || 
                (error.message && error.message.includes('Tenant not found')));
      },
    }
  );

  // Fetch a single tenant by ID - only when explicitly requested
  const useTenant = (id?: string) => {
    return useOptimizedQuery<Tenant>(
      ['tenant', id],
      async () => {
        if (!id) throw new Error('Tenant ID is required');

        // If this is the current user's tenant and we already have it, use that
        if (roles?.tenantId === id && currentTenant) {
          return currentTenant;
        }

        try {
          const response = await api.fetchTenantById(id);
          const tenant = extractData<Tenant>(response);

          // Validate the result
          if (!tenant) {
            throw new Error('No tenant data returned from API');
          }

          return tenant;
        } catch (error) {
          throw createApiError(error, `Failed to fetch tenant with ID ${id}`);
        }
      },
      { fetchOnMount: false },
      {
        ...defaultQueryConfig,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      }
    );
  };

  // Fetch tenant integrations - only when explicitly requested
  const useTenantIntegrations = (tenantId?: string) => {
    return useOptimizedQuery<CloudProviderIntegration[]>(
      ['tenant-integrations', tenantId],
      async () => {
        if (!tenantId) {
          throw new Error('Tenant ID is required to fetch integrations');
        }
        
        try {
          const response = await api.fetchTenantIntegrations(tenantId);
          return extractArrayData<CloudProviderIntegration>(response);
        } catch (error) {
          throw createApiError(error, `Failed to fetch integrations for tenant with ID ${tenantId}`);
        }
      },
      { fetchOnMount: false },
      {
        ...defaultQueryConfig,
        staleTime: 5 * 60 * 1000,
      }
    );
  };

  // Mutation for creating a tenant
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantCreate) => {
      try {
        const response = await api.createTenant(data);
        return extractData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to create tenant');
      }
    },
    onSuccess: (newTenant) => {
      // Update the tenants cache
      queryClient.setQueryData(['tenants', 'active'], (oldData: Tenant[] = []) => {
        return [...oldData, newTenant];
      });
      
      // If this is the user's tenant, update the current tenant cache
      if (newTenant.ownerId === roles?.userId) {
        queryClient.setQueryData(['tenant-current'], newTenant);
      }
    },
  });

  // Mutation for updating a tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantUpdate }) => {
      try {
        const response = await api.updateTenant(id, data);
        return extractData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, `Failed to update tenant with ID ${id}`);
      }
    },
    onSuccess: (updatedTenant) => {
      // Update the tenants cache
      queryClient.setQueryData(['tenants', 'active'], (oldData: Tenant[] = []) => {
        const index = oldData.findIndex(t => t.id === updatedTenant.id || t._id === updatedTenant._id);
        if (index >= 0) {
          return [
            ...oldData.slice(0, index),
            updatedTenant,
            ...oldData.slice(index + 1)
          ];
        }
        return oldData;
      });
      
      // If this is the current tenant, update the current tenant cache
      if (updatedTenant.id === roles?.tenantId || updatedTenant._id === roles?.tenantId) {
        queryClient.setQueryData(['tenant-current'], updatedTenant);
      }
      
      // Update the specific tenant cache
      queryClient.setQueryData(['tenant', updatedTenant.id || updatedTenant._id], updatedTenant);
    },
  });

  // Mutation for deleting a tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.deleteTenant(id);
        return id;
      } catch (error) {
        throw createApiError(error, `Failed to delete tenant with ID ${id}`);
      }
    },
    onSuccess: (deletedId) => {
      // Update the tenants cache
      queryClient.setQueryData(['tenants', 'active'], (oldData: Tenant[] = []) => {
        return oldData.filter(t => t.id !== deletedId && t._id !== deletedId);
      });
      
      // If this was the current tenant, clear the current tenant cache
      if (deletedId === roles?.tenantId) {
        queryClient.setQueryData(['tenant-current'], null);
      }
      
      // Remove the specific tenant cache
      queryClient.removeQueries({ queryKey: ['tenant', deletedId] });
    },
  });

  // Wrapper functions for mutations
  const createTenant = async (data: TenantCreate): Promise<Tenant> => {
    return createTenantMutation.mutateAsync(data);
  };

  const updateTenant = async (id: string, data: TenantUpdate): Promise<Tenant> => {
    return updateTenantMutation.mutateAsync({ id, data });
  };

  const deleteTenant = async (id: string): Promise<void> => {
    await deleteTenantMutation.mutateAsync(id);
  };

  return {
    // Tenants
    tenants,
    archivedTenants,
    currentTenant,
    isLoading,
    isLoadingArchived,
    isLoadingCurrentTenant,
    error,
    archivedError,
    currentTenantError,
    refetch,
    refetchArchived,
    refetchCurrentTenant,
    
    // Tenant operations
    createTenant,
    updateTenant,
    deleteTenant,
    isCreatingTenant: createTenantMutation.isPending,
    isUpdatingTenant: updateTenantMutation.isPending,
    isDeletingTenant: deleteTenantMutation.isPending,
    
    // Single tenant
    useTenant,
    
    // Tenant integrations
    useTenantIntegrations,
  };
};

export default useOptimizedTenants;