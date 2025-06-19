import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Tenant, TenantCreate, TenantUpdate } from '../types/tenant';
import { CloudProviderIntegration } from '../types/cloud-provider';
import { useAuth } from '../context/AuthContext';
import { extractData, extractArrayData, createApiError } from '../utils/apiResponseHandler';
import { usePermissions, Permission } from '../utils/permissions';

export const useTenants = (includeArchived: boolean = false) => {
  const queryClient = useQueryClient();
  const { roles } = useAuth();
  const permissions = usePermissions(roles);
  const isSuperAdmin = permissions.isSuperAdmin();
  const canManageTenants = permissions.can(Permission.MANAGE_TENANTS);

  // Fetch active tenants (SuperAdmin or users with MANAGE_TENANTS permission)
  const { 
    data: tenants, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['tenants', 'active'],
    queryFn: async () => {
      try {
        const response = await api.fetchTenants(includeArchived);
        return extractArrayData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to fetch tenants');
      }
    },
    enabled: isSuperAdmin || canManageTenants,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
  
  // Fetch archived tenants separately (SuperAdmin or users with MANAGE_TENANTS permission)
  const {
    data: archivedTenants,
    isLoading: isLoadingArchived,
    error: archivedError,
    refetch: refetchArchived
  } = useQuery({
    queryKey: ['tenants', 'archived'],
    queryFn: async () => {
      try {
        const response = await api.fetchArchivedTenants();
        return extractArrayData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to fetch archived tenants');
      }
    },
    enabled: isSuperAdmin || canManageTenants,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });

  // Fetch current tenant (non-SuperAdmin users)
  const { 
    data: currentTenant, 
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError,
    refetch: refetchCurrentTenant
  } = useQuery({
    queryKey: ['tenant-current'],
    queryFn: async () => {
      try {
        const response = await api.fetchTenant();
        return extractData<Tenant>(response);
      } catch (error) {
        // Don't throw for 404 errors (user doesn't have a tenant yet)
        if (error.response?.status === 404) {
          return null;
        }
        throw createApiError(error, 'Failed to fetch current tenant');
      }
    },
    // Enable for all users - SuperAdmins might have a tenant too
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });

  // Fetch a single tenant by ID
  const useTenant = (id?: string) => {
    return useQuery({
      queryKey: ['tenant', id],
      queryFn: async () => {
        if (!id) throw new Error('Tenant ID is required');
        
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
      enabled: !!id, // Allow fetching tenant details regardless of user role
      retry: 3,      // Retry failed requests up to 3 times
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
      staleTime: 5 * 60 * 1000,  // Consider data stale after 5 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnMount: true,      // Refetch when component mounts
      refetchOnReconnect: true,  // Refetch when reconnecting
      gcTime: 10 * 60 * 1000,    // Garbage collect after 10 minutes
    });
  };

  // Create a new tenant
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
      // Update queries
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
      
      // Add the new tenant to the cache
      queryClient.setQueryData<Tenant[]>(['tenants', 'active'], (oldTenants = []) => {
        return [...oldTenants, newTenant];
      });
      
      // Set the current tenant if the user doesn't have one
      if (!currentTenant) {
        queryClient.setQueryData(['tenant-current'], newTenant);
      }
    },
    onError: (error) => {
      console.error('Error creating tenant:', error);
    }
  });

  // Update a tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: TenantUpdate }) => {
      try {
        const response = await api.updateTenant(id, data);
        return extractData<Tenant>(response);
      } catch (error) {
        throw createApiError(error, `Failed to update tenant with ID ${id}`);
      }
    },
    onSuccess: (updatedTenant, variables) => {
      const { id } = variables;
      
      // Update queries
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      
      // Update the individual tenant cache
      queryClient.setQueryData(['tenant', id], updatedTenant);
      
      // Update current tenant if it's the same ID
      if (currentTenant && (currentTenant._id === id || currentTenant.id === id)) {
        queryClient.setQueryData(['tenant-current'], updatedTenant);
      }
    },
    onError: (error, variables) => {
      console.error(`Error updating tenant with ID ${variables.id}:`, error);
    }
  });

  // Delete a tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.deleteTenant(id);
        return id; // Return the ID for use in onSuccess
      } catch (error) {
        throw createApiError(error, `Failed to delete tenant with ID ${id}`);
      }
    },
    onSuccess: (deletedId) => {
      // Update the tenants list
      queryClient.setQueryData<Tenant[]>(['tenants', 'active'], (oldTenants = []) => {
        return oldTenants.filter(t => t._id !== deletedId && t.id !== deletedId);
      });
      
      // Remove from individual tenant cache
      queryClient.removeQueries({ queryKey: ['tenant', deletedId] });
      
      // Invalidate other related queries
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
    onError: (error, id) => {
      console.error(`Error deleting tenant with ID ${id}:`, error);
    }
  });

  // Tenant integrations
  const useTenantIntegrations = (tenantId?: string) => {
    return useQuery({
      queryKey: ['tenant-integrations', tenantId],
      queryFn: async () => {
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
      enabled: !!tenantId,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes
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