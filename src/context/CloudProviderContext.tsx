import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../utils/api';
import { 
  CloudProvider, 
  CloudProviderCreate, 
  CloudProviderUpdate,
  CloudProviderIntegration,
  CloudProviderIntegrationCreate
} from '../types/cloud-provider';
import { useAuth } from './AuthContext';
import { extractData, extractArrayData, createApiError } from '../utils/apiResponseHandler';
import { useLoadingState } from '../hooks/useLoadingState';

interface CloudProviderContextType {
  // Cloud Providers
  cloudProviders: CloudProvider[];
  isLoadingProviders: boolean;
  providersError: Error | null;
  refetchProviders: () => Promise<void>;
  
  // Single Cloud Provider
  getCloudProvider: (id: string) => CloudProvider | undefined;
  fetchCloudProvider: (id: string) => Promise<CloudProvider>;
  isLoadingProvider: (id: string) => boolean;
  providerError: (id: string) => Error | null;
  
  // Cloud Provider Operations (SuperAdmin only)
  createCloudProvider: (data: CloudProviderCreate) => Promise<CloudProvider>;
  updateCloudProvider: (id: string, data: CloudProviderUpdate) => Promise<CloudProvider>;
  deleteCloudProvider: (id: string) => Promise<void>;
  isCreatingProvider: boolean;
  isUpdatingProvider: boolean;
  isDeletingProvider: boolean;
  
  // Tenant Integrations
  tenantIntegrations: CloudProviderIntegration[];
  isLoadingIntegrations: boolean;
  integrationsError: Error | null;
  refetchIntegrations: () => Promise<void>;
  
  // Tenant Integration Operations
  createIntegration: (tenantId: string, data: CloudProviderIntegrationCreate) => Promise<CloudProviderIntegration>;
  updateIntegration: (tenantId: string, integrationId: string, data: Partial<CloudProviderIntegration>) => Promise<CloudProviderIntegration>;
  deleteIntegration: (tenantId: string, integrationId: string) => Promise<void>;
  isCreatingIntegration: boolean;
  isUpdatingIntegration: boolean;
  isDeletingIntegration: boolean;
  
  // Utility Functions
  getProviderById: (id: string) => CloudProvider | undefined;
  getIntegrationById: (id: string) => CloudProviderIntegration | undefined;
  getIntegrationByProviderId: (providerId: string) => CloudProviderIntegration | undefined;
  hasIntegrationForProvider: (providerId: string) => boolean;
}

const CloudProviderContext = createContext<CloudProviderContextType | null>(null);

export const CloudProviderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { isSuperAdmin, roles } = useAuth();
  const tenantId = roles?.tenantId;
  
  // State for tracking loading states of individual providers
  const [loadingProviders, setLoadingProviders] = useState<Record<string, boolean>>({});
  const [providerErrors, setProviderErrors] = useState<Record<string, Error | null>>({});
  
  // Fetch all cloud providers with optimized error handling
  const { 
    data: cloudProviders = [], 
    isLoading: isLoadingProviders, 
    error: providersError,
    refetch: refetchProvidersOriginal
  } = useQuery({
    queryKey: ['cloud-providers'],
    queryFn: async () => {
      try {
        const response = await api.fetchCloudProviders();
        return extractArrayData<CloudProvider>(response);
      } catch (error) {
        console.error('Error fetching cloud providers:', error);
        throw createApiError(error, 'Failed to fetch cloud providers');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });
  
  // Fetch tenant integrations if user has a tenant
  const {
    data: tenantIntegrations = [],
    isLoading: isLoadingIntegrations,
    error: integrationsError,
    refetch: refetchIntegrationsOriginal
  } = useQuery({
    queryKey: ['tenant-integrations', tenantId],
    queryFn: async () => {
      if (!tenantId) {
        return [];
      }
      try {
        const response = await api.fetchTenantIntegrations(tenantId);
        return extractArrayData<CloudProviderIntegration>(response);
      } catch (error) {
        console.error(`Error fetching integrations for tenant ${tenantId}:`, error);
        throw createApiError(error, `Failed to fetch integrations for tenant ${tenantId}`);
      }
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });
  
  // Memoized refetch functions to prevent unnecessary re-renders
  const refetchProviders = useCallback(async () => {
    try {
      await refetchProvidersOriginal();
    } catch (error) {
      console.error('Error refetching cloud providers:', error);
    }
  }, [refetchProvidersOriginal]);
  
  const refetchIntegrations = useCallback(async () => {
    try {
      if (tenantId) {
        await refetchIntegrationsOriginal();
      }
    } catch (error) {
      console.error('Error refetching tenant integrations:', error);
    }
  }, [tenantId, refetchIntegrationsOriginal]);
  
  // Memoized utility functions to prevent unnecessary re-renders
  
  // Utility function to get a provider by ID
  const getProviderById = useCallback((id: string): CloudProvider | undefined => {
    return cloudProviders.find(p => p._id === id || p.id === id);
  }, [cloudProviders]);
  
  // Utility function to get an integration by ID
  const getIntegrationById = useCallback((id: string): CloudProviderIntegration | undefined => {
    return tenantIntegrations.find(i => i._id === id);
  }, [tenantIntegrations]);
  
  // Utility function to get an integration by provider ID
  const getIntegrationByProviderId = useCallback((providerId: string): CloudProviderIntegration | undefined => {
    return tenantIntegrations.find(i => i.providerId === providerId);
  }, [tenantIntegrations]);
  
  // Utility function to check if tenant has an integration for a provider
  const hasIntegrationForProvider = useCallback((providerId: string): boolean => {
    return tenantIntegrations.some(i => i.providerId === providerId);
  }, [tenantIntegrations]);
  
  // Memoized function to fetch a single cloud provider
  const fetchCloudProvider = useCallback(async (id: string): Promise<CloudProvider> => {
    if (!id) {
      throw new Error('Cloud Provider ID is required');
    }
    
    try {
      setLoadingProviders(prev => ({ ...prev, [id]: true }));
      setProviderErrors(prev => ({ ...prev, [id]: null }));
      
      const response = await api.fetchCloudProviderById(id);
      const provider = extractData<CloudProvider>(response);
      
      // Cache the provider in React Query
      queryClient.setQueryData(['cloud-provider', id], provider);
      
      return provider;
    } catch (error) {
      console.error(`Error fetching cloud provider ${id}:`, error);
      const apiError = createApiError(error, `Failed to fetch cloud provider ${id}`);
      setProviderErrors(prev => ({ ...prev, [id]: apiError }));
      throw apiError;
    } finally {
      setLoadingProviders(prev => ({ ...prev, [id]: false }));
    }
  }, [queryClient]);
  
  // Memoized function to get a cloud provider from cache or fetch it
  const getCloudProvider = useCallback((id: string): CloudProvider | undefined => {
    // First check if it's in the cloudProviders array
    const provider = getProviderById(id);
    if (provider) return provider;
    
    // Then check if it's in the React Query cache
    const cachedProvider = queryClient.getQueryData<CloudProvider>(['cloud-provider', id]);
    if (cachedProvider) return cachedProvider;
    
    // If not found, trigger a fetch but return undefined for now
    fetchCloudProvider(id).catch(error => {
      console.error(`Error fetching cloud provider ${id}:`, error);
    });
    
    return undefined;
  }, [getProviderById, queryClient, fetchCloudProvider]);
  
  // Memoized function to check if a provider is loading
  const isLoadingProvider = useCallback((id: string): boolean => {
    return loadingProviders[id] || false;
  }, [loadingProviders]);
  
  // Memoized function to get error for a provider
  const providerError = useCallback((id: string): Error | null => {
    return providerErrors[id] || null;
  }, [providerErrors]);
  
  // Create a new cloud provider (SuperAdmin only)
  const createCloudProviderMutation = useMutation({
    mutationFn: (data: CloudProviderCreate) => api.createCloudProvider(data),
    onSuccess: (newProvider) => {
      // Update the cloud providers list
      queryClient.setQueryData<CloudProvider[]>(['cloud-providers'], (oldProviders = []) => {
        return [...oldProviders, newProvider];
      });
    },
  });
  
  // Update a cloud provider (SuperAdmin only)
  const updateCloudProviderMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CloudProviderUpdate }) => 
      api.updateCloudProvider(id, data),
    onSuccess: (updatedProvider, { id }) => {
      // Update the cloud providers list
      queryClient.setQueryData<CloudProvider[]>(['cloud-providers'], (oldProviders = []) => {
        return oldProviders.map(p => (p._id === id || p.id === id) ? updatedProvider : p);
      });
      
      // Update the individual provider cache
      queryClient.setQueryData(['cloud-provider', id], updatedProvider);
    },
  });
  
  // Delete a cloud provider (SuperAdmin only)
  const deleteCloudProviderMutation = useMutation({
    mutationFn: (id: string) => api.deleteCloudProvider(id),
    onSuccess: (_, id) => {
      // Update the cloud providers list
      queryClient.setQueryData<CloudProvider[]>(['cloud-providers'], (oldProviders = []) => {
        return oldProviders.filter(p => p._id !== id && p.id !== id);
      });
      
      // Remove from individual provider cache
      queryClient.removeQueries({ queryKey: ['cloud-provider', id] });
    },
  });
  
  // Create a tenant integration
  const createIntegrationMutation = useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: CloudProviderIntegrationCreate }) => 
      api.createTenantIntegration(tenantId, data),
    onSuccess: (newIntegration, { tenantId }) => {
      // Update the tenant integrations list
      queryClient.setQueryData<CloudProviderIntegration[]>(['tenant-integrations', tenantId], (oldIntegrations = []) => {
        return [...oldIntegrations, newIntegration];
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  // Update a tenant integration
  const updateIntegrationMutation = useMutation({
    mutationFn: ({ tenantId, integrationId, data }: { tenantId: string; integrationId: string; data: Partial<CloudProviderIntegration> }) => 
      api.updateTenantIntegration(tenantId, integrationId, data),
    onSuccess: (updatedIntegration, { tenantId, integrationId }) => {
      // Update the tenant integrations list
      queryClient.setQueryData<CloudProviderIntegration[]>(['tenant-integrations', tenantId], (oldIntegrations = []) => {
        return oldIntegrations.map(i => (i._id === integrationId) ? updatedIntegration : i);
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
    },
  });
  
  // Delete a tenant integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: ({ tenantId, integrationId }: { tenantId: string; integrationId: string }) => 
      api.deleteTenantIntegration(tenantId, integrationId),
    onSuccess: (_, { tenantId, integrationId }) => {
      // Update the tenant integrations list
      queryClient.setQueryData<CloudProviderIntegration[]>(['tenant-integrations', tenantId], (oldIntegrations = []) => {
        return oldIntegrations.filter(i => i._id !== integrationId);
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      queryClient.invalidateQueries({ queryKey: ['tenant-current'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo<CloudProviderContextType>(() => ({
    // Cloud Providers
    cloudProviders,
    isLoadingProviders,
    providersError: providersError as Error | null,
    refetchProviders,
    
    // Single Cloud Provider
    getCloudProvider,
    fetchCloudProvider,
    isLoadingProvider,
    providerError,
    
    // Cloud Provider Operations
    createCloudProvider: createCloudProviderMutation.mutateAsync,
    updateCloudProvider: updateCloudProviderMutation.mutateAsync,
    deleteCloudProvider: deleteCloudProviderMutation.mutateAsync,
    isCreatingProvider: createCloudProviderMutation.isPending,
    isUpdatingProvider: updateCloudProviderMutation.isPending,
    isDeletingProvider: deleteCloudProviderMutation.isPending,
    
    // Tenant Integrations
    tenantIntegrations,
    isLoadingIntegrations,
    integrationsError: integrationsError as Error | null,
    refetchIntegrations,
    
    // Tenant Integration Operations
    createIntegration: (tenantId: string, data: CloudProviderIntegrationCreate) => 
      createIntegrationMutation.mutateAsync({ tenantId, data }),
    updateIntegration: (tenantId: string, integrationId: string, data: Partial<CloudProviderIntegration>) => 
      updateIntegrationMutation.mutateAsync({ tenantId, integrationId, data }),
    deleteIntegration: (tenantId: string, integrationId: string) => 
      deleteIntegrationMutation.mutateAsync({ tenantId, integrationId }),
    isCreatingIntegration: createIntegrationMutation.isPending,
    isUpdatingIntegration: updateIntegrationMutation.isPending,
    isDeletingIntegration: deleteIntegrationMutation.isPending,
    
    // Utility Functions
    getProviderById,
    getIntegrationById,
    getIntegrationByProviderId,
    hasIntegrationForProvider,
  }), [
    // Dependencies for memoization
    cloudProviders,
    isLoadingProviders,
    providersError,
    refetchProviders,
    getCloudProvider,
    fetchCloudProvider,
    isLoadingProvider,
    providerError,
    createCloudProviderMutation.mutateAsync,
    updateCloudProviderMutation.mutateAsync,
    deleteCloudProviderMutation.mutateAsync,
    createCloudProviderMutation.isPending,
    updateCloudProviderMutation.isPending,
    deleteCloudProviderMutation.isPending,
    tenantIntegrations,
    isLoadingIntegrations,
    integrationsError,
    refetchIntegrations,
    createIntegrationMutation.mutateAsync,
    updateIntegrationMutation.mutateAsync,
    deleteIntegrationMutation.mutateAsync,
    createIntegrationMutation.isPending,
    updateIntegrationMutation.isPending,
    deleteIntegrationMutation.isPending,
    getProviderById,
    getIntegrationById,
    getIntegrationByProviderId,
    hasIntegrationForProvider,
  ]);
  
  return (
    <CloudProviderContext.Provider value={contextValue}>
      {children}
    </CloudProviderContext.Provider>
  );
};

// Custom hook to use the cloud provider context
export const useCloudProvider = () => {
  const context = useContext(CloudProviderContext);
  if (!context) {
    throw new Error('useCloudProvider must be used within a CloudProviderProvider');
  }
  return context;
};

export default CloudProviderContext;