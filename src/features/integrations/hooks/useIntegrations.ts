import { useQuery } from '@tanstack/react-query';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';
import { useAuth } from '../../../core/context/AuthContext';
import { Integration, IntegrationListFilters } from '../types';

/**
 * Hook to fetch integrations for the current tenant
 * @param filters - Optional filters for the integration list
 * @returns React Query result with integrations data
 */
export const useIntegrations = (filters?: IntegrationListFilters) => {
  const { currentTenant, isReady } = useAuth();

  return useQuery({
    queryKey: ['integrations', currentTenant?.id, filters],
    queryFn: async (): Promise<Integration[]> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 INTEGRATIONS QUERY: Fetching tenant integrations');
        console.log('📊 Query State:', {
          tenantId: currentTenant.id,
          filters,
          isReady,
          timestamp: new Date().toISOString()
        });
      }

      try {
        // Build query parameters
        const params = new URLSearchParams();
        
        if (filters?.status) {
          if (Array.isArray(filters.status)) {
            filters.status.forEach(status => params.append('status', status));
          } else {
            params.append('status', filters.status);
          }
        }
        
        if (filters?.providerId) {
          params.append('providerId', filters.providerId);
        }
        
        if (filters?.search) {
          params.append('search', filters.search);
        }
        
        if (filters?.sortBy) {
          params.append('sortBy', filters.sortBy);
        }
        
        if (filters?.sortOrder) {
          params.append('sortOrder', filters.sortOrder);
        }

        const queryString = params.toString();
        const url = `/tenants/${currentTenant.id}/integrations${queryString ? `?${queryString}` : ''}`;
        
        const response = await api.get(url);
        
        if (import.meta.env.DEV) {
          console.log('✅ Integrations fetched successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, true);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integrations data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch integrations:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    enabled: isReady && !!currentTenant?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to fetch a specific integration by ID
 * @param integrationId - The integration ID to fetch
 * @returns React Query result with integration data
 */
export const useIntegration = (integrationId: string | undefined) => {
  const { currentTenant, isReady } = useAuth();

  return useQuery({
    queryKey: ['integration', integrationId],
    queryFn: async (): Promise<Integration> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }
      
      if (!integrationId) {
        throw new Error('Integration ID is required');
      }

      if (import.meta.env.DEV) {
        console.group('🔗 INTEGRATION QUERY: Fetching specific integration');
        console.log('📊 Query State:', {
          tenantId: currentTenant.id,
          integrationId,
          isReady,
          timestamp: new Date().toISOString()
        });
      }

      try {
        const response = await api.get(`/tenants/${currentTenant.id}/integrations/${integrationId}`);
        
        if (import.meta.env.DEV) {
          console.log('✅ Integration fetched successfully:', response.data);
        }
        
        const transformedData = handleApiResponse(response, false);
        
        if (import.meta.env.DEV) {
          console.log('✅ Transformed integration data:', transformedData);
          console.groupEnd();
        }
        
        return transformedData;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('❌ Failed to fetch integration:', error);
          console.groupEnd();
        }
        throw error;
      }
    },
    enabled: isReady && !!currentTenant?.id && !!integrationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};