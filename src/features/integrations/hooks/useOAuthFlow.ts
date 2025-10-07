import { useState, useCallback } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../core/context/AuthContext';
import { useCloudProviders } from '../../cloud-providers/hooks';
import { useCreateIntegration, useUpdateIntegration } from './';
import { useIntegrations } from './useIntegrations';
import { 
  OAuthFlowState, 
  OAuthFlowStep, 
  OAuthError, 
  Integration,
  IntegrationCreateRequest,
} from '../types';
// Backend-driven OAuth: no client-side PKCE or redirect handling
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/apiResponse';
import { CloudProvider } from '../../cloud-providers/types';

/**
 * Hook for managing complete OAuth flow lifecycle
 */
export const useOAuthFlow = () => {
  const { currentTenant, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cloudProviders } = useCloudProviders();
  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();
  const { data: integrations } = useIntegrations();

  const [flowState, setFlowState] = useState<OAuthFlowState>({
    step: 'initialization',
    isLoading: false,
    progress: 0,
  });

  /**
   * Initiate OAuth flow for a cloud provider
   */
  const initiateOAuth = useCallback(async (
    providerId: string,
    metadata?: Record<string, unknown>,
    existingIntegrationId?: string
  ): Promise<{ success: boolean; authUrl?: string; error?: string }> => {
    if (!currentTenant || !user?.sub) return { success: false, error: 'Invalid tenant or user' };
    const provider: CloudProvider | undefined = (cloudProviders as CloudProvider[] | undefined)?.find((p: CloudProvider) => p.id === providerId);
    if (!provider) return { success: false, error: 'Provider not found' };
    try {
      setFlowState({ step: 'initialization', isLoading: true, progress: 10 });
      // Backend-driven: if an integration already exists (created in previous step), reuse it
      let integration: Integration | { id: string };
      if (existingIntegrationId) {
        integration = { id: existingIntegrationId } as { id: string };
      } else {
        // Create integration if not provided
        const integrationRequest: IntegrationCreateRequest = {
          providerId,
          metadata: {
            displayName: (metadata?.displayName as string) || `${provider.name} Integration`,
            description: (metadata?.description as string) || `Integration with ${provider.name}`,
            ...metadata
          },
        };
        try {
          integration = await createIntegration.mutateAsync(integrationRequest);
        } catch (createError: any) {
          if (createError.response?.status === 409) {
            throw new Error('Integration already exists for this provider');
          }
          throw createError;
        }
      }

      setFlowState(prev => ({ ...prev, step: 'authorization', integrationId: integration.id, progress: 30 }));
      const initiateResponse = await api.post(`/oauth/tenants/${currentTenant}/integrations/${integration.id}/initiate`, {});
      const initiateResult = handleApiResponse<{authorizationUrl: string}>(initiateResponse);
      if (!initiateResult?.authorizationUrl) throw new Error('Initiation failed');
      const authUrl = initiateResult.authorizationUrl;
      setFlowState(prev => ({ ...prev, progress: 50 }));
      return { success: true, authUrl };
    } catch (error: any) {
      setFlowState({ step: 'error', error: { error: 'server_error', error_description: error.message }, isLoading: false, progress: 0 });
      return { success: false, error: error.message };
    }
  }, [currentTenant, user?.sub, cloudProviders, createIntegration, updateIntegration, api]);

  const resetFlow = useCallback(() => {
    setFlowState({ step: 'initialization', isLoading: false, progress: 0 });
  }, []);

  const cancelFlow = useCallback(async () => {
    if (flowState.integrationId && flowState.step !== 'completion') {
      try {
        await api.delete(`/tenants/${currentTenant}/integrations/${flowState.integrationId}`);
        queryClient.invalidateQueries({ queryKey: ['integrations', currentTenant] });
      } catch (error) {
        console.error('Failed to cleanup cancelled OAuth flow:', error);
      }
    }
    resetFlow();
  }, [flowState.integrationId, flowState.step, currentTenant, queryClient, resetFlow]);

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((error?: OAuthError): string => {
    if (!error) return 'Unknown error occurred';
    
    const errorMessages: Record<string, string> = {
      access_denied: 'You denied access to the application',
      invalid_request: 'Invalid OAuth request parameters',
      invalid_client: 'Invalid client credentials',
      invalid_grant: 'Invalid authorization grant',
      unauthorized_client: 'Client not authorized for this grant type',
      unsupported_grant_type: 'Grant type not supported',
      invalid_scope: 'Invalid or unknown scope requested',
      server_error: 'Authorization server error',
      temporarily_unavailable: 'Service temporarily unavailable',
      state_mismatch: 'OAuth state parameter mismatch',
      code_expired: 'Authorization code has expired',
      pkce_verification_failed: 'PKCE verification failed',
    };
    
    return error.error_description || 
           errorMessages[error.error] || 
           `OAuth error: ${error.error}`;
  }, []);

  return {
    flowState,
    isLoading: flowState.isLoading || createIntegration.isPending || updateIntegration.isPending,
    initiateOAuth,
    resetFlow,
    cancelFlow,
    getErrorMessage,
    isInitializing: flowState.step === 'initialization',
    isAuthorizing: flowState.step === 'authorization',
    isCompleted: flowState.step === 'completion',
    hasError: flowState.step === 'error',
  };
};

// Add verification
export const verifyIntegration = async (tenantId: string, integrationId: string) => {
  const response = await api.get(`/tenants/${tenantId}/integrations/${integrationId}`);
  return handleApiResponse(response);
};

// Add health query
export const useOAuthHealth = () => {
  return useQuery({
    queryKey: ['oauthHealth'],
    queryFn: async () => {
      const response = await api.get('/oauth/health');  // Assume endpoint exists
      return handleApiResponse(response);
    },
  });
};