import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { TenantCreate, TenantUpdate } from '../types';
import { useAuth } from '../../../core/context/AuthContext';

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
    queryFn: async () => {
      const response = await api.get(`/tenants${includeArchived ? '?includeArchived=true' : ''}`);
      return response.data;
    },
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
    queryFn: async () => {
      const response = await api.get('/tenants?archived=true');
      return response.data;
    },
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
    queryFn: async () => {
      const response = await api.get('/tenants/me');
      return response.data;
    },
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
          const response = await api.get(`/tenants/${id}`);
          const result = response.data;
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
      gcTime: 1000 * 60 * 5,  // Cache for 5 minutes (renamed from cacheTime in v5)
    });
  };

  // Create a new tenant
  const createTenantMutation = useMutation({
    mutationFn: async (data: TenantCreate) => {
      const response = await api.post("/tenants", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  // Update a tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantUpdate }) => {
      const response = await api.patch(`/tenants/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Delete a tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/tenants/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });

  // Tenant integrations
  const useTenantIntegrations = (tenantId?: string) => {
    return useQuery({
      queryKey: ['tenant-integrations', tenantId],
      queryFn: async () => {
        const response = await api.get(`/tenants/${tenantId!}/integrations`);
        return response.data;
      },
      enabled: !!tenantId,
    });
  };

  // Update tenant integration
  const updateTenantIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, integrationId, data }: { 
      tenantId: string; 
      integrationId: string; 
      data: any 
    }) => {
      const response = await api.patch(`/tenants/${tenantId}/integrations/${integrationId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

  // Refresh OAuth token for tenant integration
  const refreshIntegrationTokenMutation = useMutation({
    mutationFn: async ({ tenantId, integrationId }: { 
      tenantId: string; 
      integrationId: string; 
    }) => {
      const response = await api.post(`/oauth/tenants/${tenantId}/integrations/${integrationId}/refresh`);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant-integrations', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant', variables.tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });

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
    updateTenantIntegration: updateTenantIntegrationMutation.mutate,
    refreshIntegrationToken: refreshIntegrationTokenMutation.mutate,
    isUpdatingIntegration: updateTenantIntegrationMutation.isPending,
    isRefreshingToken: refreshIntegrationTokenMutation.isPending,
    updateIntegrationError: updateTenantIntegrationMutation.error,
    refreshTokenError: refreshIntegrationTokenMutation.error,
  };
};

export default useTenants;