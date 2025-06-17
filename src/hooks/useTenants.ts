import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { Tenant, TenantCreate, TenantUpdate } from '../types/tenant';
import { useAuth } from '../context/AuthContext';

export const useTenants = () => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  // Fetch all tenants (SuperAdmin only)
  const { 
    data: tenants, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.fetchTenants(),
    enabled: isSuperAdmin,
  });

  // Fetch current tenant (TenantOwner)
  const { 
    data: currentTenant, 
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError,
    refetch: refetchCurrentTenant
  } = useQuery({
    queryKey: ['tenant-current'],
    queryFn: () => api.fetchTenant(),
    enabled: !isSuperAdmin,
  });

  // Fetch a single tenant by ID
  const useTenant = (id?: string) => {
    return useQuery({
      queryKey: ['tenant', id],
      queryFn: () => api.fetchTenantById(id!),
      enabled: !!id, // Allow fetching tenant details regardless of user role
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
    currentTenant,
    isLoading,
    isLoadingCurrentTenant,
    error,
    currentTenantError,
    refetch,
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