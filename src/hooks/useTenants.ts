import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { TenantCreate, TenantUpdate } from '../types/tenant';
import { useAuth } from '../context/AuthContext';

export const useTenants = (includeArchived: boolean = false) => {
  const queryClient = useQueryClient();

  // Fetch active tenants - let server handle access control
  const { 
    data: tenants, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['tenants', 'active'],
    queryFn: () => api.fetchTenants(includeArchived),
    // Removed enabled: isSuperAdmin - let server handle role-based access
  });
  
  // Fetch archived tenants separately - let server handle access control
  const {
    data: archivedTenants,
    isLoading: isLoadingArchived,
    error: archivedError,
    refetch: refetchArchived
  } = useQuery({
    queryKey: ['tenants', 'archived'],
    queryFn: () => api.fetchArchivedTenants(),
    // Removed enabled: isSuperAdmin - let server handle role-based access
  });

  // Fetch current tenant - let server handle access control
  const { 
    data: currentTenant, 
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError,
    refetch: refetchCurrentTenant
  } = useQuery({
    queryKey: ['tenant-current'],
    queryFn: () => api.fetchTenant(),
    // Removed enabled: !isSuperAdmin - let server handle role-based access
  });

  // Fetch a single tenant by ID
  const useTenant = (id?: string) => {
    return useQuery({
      queryKey: ['tenant', id],
      queryFn: async () => {
        if (!id) throw new Error('Tenant ID is required');
        
        console.log('useTenant hook - Fetching tenant with ID:', id);
        try {
          const result = await api.fetchTenantById(id);
          console.log('useTenant hook - Fetch result:', result);
          
          // Validate the result
          if (!result) {
            throw new Error('No tenant data returned from API');
          }
          
          // Return the validated result
          return result;
        } catch (error) {
          console.error('useTenant hook - Error fetching tenant:', error);
          throw error;
        }
      },
      enabled: !!id, // Allow fetching tenant details regardless of user role
      retry: 3,      // Retry failed requests up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      staleTime: 0,  // Consider data stale immediately (always refetch)
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true,      // Refetch when component mounts
      refetchOnReconnect: true,  // Refetch when reconnecting
      cacheTime: 1000 * 60 * 5,  // Cache for 5 minutes
    });
  };

  // Create a new tenant
  const createTenantMutation = useMutation({
    mutationFn: (data: TenantCreate) => api.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  // Update a tenant
  const updateTenantMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TenantUpdate }) => 
      api.updateTenant(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Delete a tenant
  const deleteTenantMutation = useMutation({
    mutationFn: (id: string) => api.deleteTenant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  // Tenant integrations
  const useTenantIntegrations = (tenantId?: string) => {
    return useQuery({
      queryKey: ['tenant-integrations', tenantId],
      queryFn: () => api.fetchTenantIntegrations(tenantId!),
      enabled: !!tenantId,
    });
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
    useTenant,
    createTenant: createTenantMutation.mutate,
    updateTenant: updateTenantMutation.mutate,
    deleteTenant: deleteTenantMutation.mutate,
    isCreating: createTenantMutation.isPending,
    isUpdating: updateTenantMutation.isPending,
    isDeleting: deleteTenantMutation.isPending,
    createError: createTenantMutation.error,
    updateError: updateTenantMutation.error,
    deleteError: deleteTenantMutation.error,
    
    // Tenant integrations
    useTenantIntegrations,
  };
};

export default useTenants;