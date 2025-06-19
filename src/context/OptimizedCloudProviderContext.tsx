import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
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
import { useOptimizedQuery, defaultQueryConfig } from '../hooks/optimized/useOptimizedQuery';
import { Permission } from '../utils/permissions';

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
  
  // Fetch all cloud providers with optimized error handling and role-based fetching
  const { 
    data: cloudProviders = [], 
    isLoading: isLoadingProviders, 
    error: providersError,
    refetch: refetchProvidersOriginal
  } = useOptimizedQuery<CloudProvider[]>(
    ['cloud-providers'],
    async () => {
      try {
        const response = await api.fetchCloudProviders();
        return extractArrayData<CloudProvider>(response);
      } catch (error) {
        console.error('Error fetching cloud providers:', error);
        throw createApiError(error, 'Failed to fetch cloud providers');
      }
    },
    { requireSuperAdmin: true },
    {
      ...defaultQueryConfig,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    }
  );
  
  // Fetch tenant integrations if user has a tenant and is a tenant owner
  const {
    data: tenantIntegrations = [],
    isLoading: isLoadingIntegrations,
    error: integrationsError,
    refetch: refetchIntegrationsOriginal
  } = useOptimizedQuery<CloudProviderIntegration[]>(
    ['tenant-integrations', tenantId],
    async () => {
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
    { 
      requireTenantOwner: true,
      requireTenantId: true
    },
    {
      ...defaultQueryConfig,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    }
  );
  
  // Memoized refetch functions to prevent unnecessary re-renders
  const refetchProviders = useCallback(async () => {
    try {
      await refetchProvidersOriginal();
    } catch (error) {
      console.error('Error refetching providers:', error);
    }
  }, [refetchProvidersOriginal]);
  
  const refetchIntegrations = useCallback(async () => {
    try {
      await refetchIntegrationsOriginal();
    } catch (error) {
      console.error('Error refetching integrations:', error);
    }
  }, [refetchIntegrationsOriginal]);
  
  // Function to get a cloud provider by ID
  const getProviderById = useCallback((id: string): CloudProvider | undefined => {
    return cloudProviders.find(provider => provider.id === id || provider._id === id);
  }, [cloudProviders]);
  
  // Function to get an integration by ID
  const getIntegrationById = useCallback((id: string): CloudProviderIntegration | undefined => {
    return tenantIntegrations.find(integration => integration.id === id || integration._id === id);
  }, [tenantIntegrations]);
  
  // Function to get an integration by provider ID
  const getIntegrationByProviderId = useCallback((providerId: string): CloudProviderIntegration | undefined => {
    return tenantIntegrations.find(integration => integration.providerId === providerId);
  }, [tenantIntegrations]);
  
  // Function to check if a tenant has an integration for a provider
  const hasIntegrationForProvider = useCallback((providerId: string): boolean => {
    return tenantIntegrations.some(integration => integration.providerId === providerId);
  }, [tenantIntegrations]);
  
  // Function to fetch a single cloud provider
  const fetchCloudProvider = useCallback(async (id: string): Promise<CloudProvider> => {
    try {
      setLoadingProviders(prev => ({ ...prev, [id]: true }));
      setProviderErrors(prev => ({ ...prev, [id]: null }));
      
      // Check if we already have this provider in our cache
      const cachedProvider = getProviderById(id);
      if (cachedProvider) {
        return cachedProvider;
      }
      
      const response = await api.fetchCloudProviderById(id);
      const provider = extractData<CloudProvider>(response);
      
      // Update the cache
      queryClient.setQueryData(['cloud-providers'], (oldData: CloudProvider[] = []) => {
        const index = oldData.findIndex(p => p.id === id || p._id === id);
        if (index >= 0) {
          return [
            ...oldData.slice(0, index),
            provider,
            ...oldData.slice(index + 1)
          ];
        }
        return [...oldData, provider];
      });
      
      return provider;
    } catch (error) {
      const apiError = createApiError(error, `Failed to fetch cloud provider with ID ${id}`);
      setProviderErrors(prev => ({ ...prev, [id]: apiError }));
      throw apiError;
    } finally {
      setLoadingProviders(prev => ({ ...prev, [id]: false }));
    }
  }, [getProviderById, queryClient]);
  
  // Function to check if a provider is loading
  const isLoadingProvider = useCallback((id: string): boolean => {
    return loadingProviders[id] || false;
  }, [loadingProviders]);
  
  // Function to get the error for a provider
  const providerError = useCallback((id: string): Error | null => {
    return providerErrors[id] || null;
  }, [providerErrors]);
  
  // Mutation for creating a cloud provider
  const createProviderMutation = useMutation({
    mutationFn: async (data: CloudProviderCreate) => {
      try {
        const response = await api.createCloudProvider(data);
        return extractData<CloudProvider>(response);
      } catch (error) {
        throw createApiError(error, 'Failed to create cloud provider');
      }
    },
    onSuccess: (newProvider) => {
      // Update the cloud providers cache
      queryClient.setQueryData(['cloud-providers'], (oldData: CloudProvider[] = []) => {
        return [...oldData, newProvider];
      });
    },
  });
  
  // Mutation for updating a cloud provider
  const updateProviderMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CloudProviderUpdate }) => {
      try {
        const response = await api.updateCloudProvider(id, data);
        return extractData<CloudProvider>(response);
      } catch (error) {
        throw createApiError(error, `Failed to update cloud provider with ID ${id}`);
      }
    },
    onSuccess: (updatedProvider) => {
      // Update the cloud providers cache
      queryClient.setQueryData(['cloud-providers'], (oldData: CloudProvider[] = []) => {
        const index = oldData.findIndex(p => p.id === updatedProvider.id || p._id === updatedProvider._id);
        if (index >= 0) {
          return [
            ...oldData.slice(0, index),
            updatedProvider,
            ...oldData.slice(index + 1)
          ];
        }
        return oldData;
      });
    },
  });
  
  // Mutation for deleting a cloud provider
  const deleteProviderMutation = useMutation({
    mutationFn: async (id: string) => {
      try {
        await api.deleteCloudProvider(id);
        return id;
      } catch (error) {
        throw createApiError(error, `Failed to delete cloud provider with ID ${id}`);
      }
    },
    onSuccess: (deletedId) => {
      // Update the cloud providers cache
      queryClient.setQueryData(['cloud-providers'], (oldData: CloudProvider[] = []) => {
        return oldData.filter(p => p.id !== deletedId && p._id !== deletedId);
      });
    },
  });
  
  // Mutation for creating a tenant integration
  const createIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: CloudProviderIntegrationCreate }) => {
      try {
        const response = await api.createTenantIntegration(tenantId, data);
        return extractData<CloudProviderIntegration>(response);
      } catch (error) {
        throw createApiError(error, `Failed to create integration for tenant with ID ${tenantId}`);
      }
    },
    onSuccess: (newIntegration) => {
      // Update the tenant integrations cache
      queryClient.setQueryData(['tenant-integrations', tenantId], (oldData: CloudProviderIntegration[] = []) => {
        return [...oldData, newIntegration];
      });
    },
  });
  
  // Mutation for updating a tenant integration
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, integrationId, data }: { tenantId: string; integrationId: string; data: Partial<CloudProviderIntegration> }) => {
      try {
        const response = await api.updateTenantIntegration(tenantId, integrationId, data);
        return extractData<CloudProviderIntegration>(response);
      } catch (error) {
        throw createApiError(error, `Failed to update integration with ID ${integrationId}`);
      }
    },
    onSuccess: (updatedIntegration) => {
      // Update the tenant integrations cache
      queryClient.setQueryData(['tenant-integrations', tenantId], (oldData: CloudProviderIntegration[] = []) => {
        const index = oldData.findIndex(i => i.id === updatedIntegration.id || i._id === updatedIntegration._id);
        if (index >= 0) {
          return [
            ...oldData.slice(0, index),
            updatedIntegration,
            ...oldData.slice(index + 1)
          ];
        }
        return oldData;
      });
    },
  });
  
  // Mutation for deleting a tenant integration
  const deleteIntegrationMutation = useMutation({
    mutationFn: async ({ tenantId, integrationId }: { tenantId: string; integrationId: string }) => {
      try {
        await api.deleteTenantIntegration(tenantId, integrationId);
        return integrationId;
      } catch (error) {
        throw createApiError(error, `Failed to delete integration with ID ${integrationId}`);
      }
    },
    onSuccess: (deletedId) => {
      // Update the tenant integrations cache
      queryClient.setQueryData(['tenant-integrations', tenantId], (oldData: CloudProviderIntegration[] = []) => {
        return oldData.filter(i => i.id !== deletedId && i._id !== deletedId);
      });
    },
  });
  
  // Wrapper functions for mutations
  const createCloudProvider = useCallback(async (data: CloudProviderCreate): Promise<CloudProvider> => {
    return createProviderMutation.mutateAsync(data);
  }, [createProviderMutation]);
  
  const updateCloudProvider = useCallback(async (id: string, data: CloudProviderUpdate): Promise<CloudProvider> => {
    return updateProviderMutation.mutateAsync({ id, data });
  }, [updateProviderMutation]);
  
  const deleteCloudProvider = useCallback(async (id: string): Promise<void> => {
    await deleteProviderMutation.mutateAsync(id);
  }, [deleteProviderMutation]);
  
  const createIntegration = useCallback(async (tenantId: string, data: CloudProviderIntegrationCreate): Promise<CloudProviderIntegration> => {
    return createIntegrationMutation.mutateAsync({ tenantId, data });
  }, [createIntegrationMutation]);
  
  const updateIntegration = useCallback(async (tenantId: string, integrationId: string, data: Partial<CloudProviderIntegration>): Promise<CloudProviderIntegration> => {
    return updateIntegrationMutation.mutateAsync({ tenantId, integrationId, data });
  }, [updateIntegrationMutation]);
  
  const deleteIntegration = useCallback(async (tenantId: string, integrationId: string): Promise<void> => {
    await deleteIntegrationMutation.mutateAsync({ tenantId, integrationId });
  }, [deleteIntegrationMutation]);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Cloud Providers
    cloudProviders,
    isLoadingProviders,
    providersError,
    refetchProviders,
    
    // Single Cloud Provider
    getCloudProvider: getProviderById,
    fetchCloudProvider,
    isLoadingProvider,
    providerError,
    
    // Cloud Provider Operations
    createCloudProvider,
    updateCloudProvider,
    deleteCloudProvider,
    isCreatingProvider: createProviderMutation.isPending,
    isUpdatingProvider: updateProviderMutation.isPending,
    isDeletingProvider: deleteProviderMutation.isPending,
    
    // Tenant Integrations
    tenantIntegrations,
    isLoadingIntegrations,
    integrationsError,
    refetchIntegrations,
    
    // Tenant Integration Operations
    createIntegration,
    updateIntegration,
    deleteIntegration,
    isCreatingIntegration: createIntegrationMutation.isPending,
    isUpdatingIntegration: updateIntegrationMutation.isPending,
    isDeletingIntegration: deleteIntegrationMutation.isPending,
    
    // Utility Functions
    getProviderById,
    getIntegrationById,
    getIntegrationByProviderId,
    hasIntegrationForProvider,
  }), [
    cloudProviders,
    isLoadingProviders,
    providersError,
    refetchProviders,
    getProviderById,
    fetchCloudProvider,
    isLoadingProvider,
    providerError,
    createCloudProvider,
    updateCloudProvider,
    deleteCloudProvider,
    createProviderMutation.isPending,
    updateProviderMutation.isPending,
    deleteProviderMutation.isPending,
    tenantIntegrations,
    isLoadingIntegrations,
    integrationsError,
    refetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    createIntegrationMutation.isPending,
    updateIntegrationMutation.isPending,
    deleteIntegrationMutation.isPending,
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