import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../core/context/AuthContext';
import { useCloudProviders } from '../../cloud-providers/hooks';
import { useCreateIntegration, useUpdateIntegration } from './';
import { 
  OAuthFlowState, 
  OAuthFlowStep, 
  OAuthError, 
  Integration,
  IntegrationCreateRequest 
} from '../types';
import { 
  buildOAuthUrl, 
  buildAuthorizationUrl, 
  validateOAuthCallback,
  getOAuthCallbackUri,
  createTokenExchangePayload,
  validateScopes
} from '../utils/oauthUtils';
import { notifications } from '@mantine/notifications';
import api from '../../../shared/utils/api';
import { handleApiResponse } from '../../../shared/utils/dataTransform';

/**
 * Hook for managing complete OAuth flow lifecycle
 */
export const useOAuthFlow = () => {
  const { currentTenant, user } = useAuth();
  const queryClient = useQueryClient();
  const { data: cloudProviders } = useCloudProviders();
  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();

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
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; authUrl?: string; error?: string }> => {
    if (!currentTenant?.id) {
      return { success: false, error: 'No current tenant available' };
    }

    if (!user?.sub) {
      return { success: false, error: 'User not authenticated' };
    }

    const provider = cloudProviders?.find(p => p.id === providerId);
    if (!provider) {
      return { success: false, error: 'Cloud provider not found' };
    }

    try {
      setFlowState({
        step: 'initialization',
        isLoading: true,
        progress: 10,
      });

      if (import.meta.env.DEV) {
        console.group('🔗 OAUTH FLOW: Initiating OAuth flow');
        console.log('📊 Flow Data:', {
          providerId,
          tenantId: currentTenant.id,
          userId: user.sub,
          metadata,
          timestamp: new Date().toISOString()
        });
      }

      // Create integration placeholder
      const integrationRequest: IntegrationCreateRequest = {
        providerId,
        metadata: {
          displayName: metadata?.displayName || `${provider.name} Integration`,
          description: metadata?.description || `Integration with ${provider.name}`,
          ...metadata,
        },
      };

      const integration = await createIntegration.mutateAsync(integrationRequest);

      setFlowState(prev => ({
        ...prev,
        step: 'authorization',
        integrationId: integration.id,
        progress: 30,
      }));

      // Build OAuth URL with PKCE
      const redirectUri = getOAuthCallbackUri();
      const oauthConfig = await buildOAuthUrl(
        provider,
        integration.id,
        currentTenant.id,
        redirectUri,
        user.sub
      );

      const authUrl = buildAuthorizationUrl(oauthConfig);

      setFlowState(prev => ({
        ...prev,
        progress: 50,
      }));

      if (import.meta.env.DEV) {
        console.log('✅ OAuth URL generated:', authUrl);
        console.groupEnd();
      }

      return { success: true, authUrl };

    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to initiate OAuth flow';

      setFlowState({
        step: 'error',
        error: {
          error: 'server_error',
          error_description: errorMessage,
        },
        isLoading: false,
        progress: 0,
      });

      if (import.meta.env.DEV) {
        console.error('❌ OAuth flow initiation failed:', error);
        console.groupEnd();
      }

      return { success: false, error: errorMessage };
    }
  }, [currentTenant?.id, user?.sub, cloudProviders, createIntegration]);

  /**
   * Handle OAuth callback and complete token exchange
   */
  const handleCallback = useMutation({
    mutationFn: async (searchParams: URLSearchParams): Promise<Integration> => {
      if (!currentTenant?.id) {
        throw new Error('No current tenant available');
      }

      setFlowState({
        step: 'callback',
        isLoading: true,
        progress: 60,
      });

      if (import.meta.env.DEV) {
        console.group('🔗 OAUTH CALLBACK: Processing OAuth callback');
        console.log('📊 Callback Data:', {
          tenantId: currentTenant.id,
          searchParams: Object.fromEntries(searchParams.entries()),
          timestamp: new Date().toISOString()
        });
      }

      // Validate callback parameters
      const validation = validateOAuthCallback(searchParams);
      if (!validation.isValid) {
        throw new Error(validation.errorMessage || 'Invalid OAuth callback');
      }

      const { code, state } = validation;
      if (!code || !state) {
        throw new Error('Missing required callback parameters');
      }

      setFlowState(prev => ({
        ...prev,
        step: 'token_exchange',
        integrationId: state.integrationId,
        progress: 80,
      }));

      // Exchange authorization code for tokens
      const response = await api.post(
        `/tenants/${currentTenant.id}/integrations/${state.integrationId}/oauth/callback`,
        {
          code,
          codeVerifier: state.codeVerifier,
          redirectUri: getOAuthCallbackUri(),
        }
      );

      const updatedIntegration = handleApiResponse(response, false);

      setFlowState({
        step: 'completion',
        integrationId: state.integrationId,
        isLoading: false,
        progress: 100,
      });

      if (import.meta.env.DEV) {
        console.log('✅ OAuth callback processed successfully:', updatedIntegration);
        console.groupEnd();
      }

      return updatedIntegration;
    },
    onSuccess: (integration) => {
      // Update integration in cache
      queryClient.setQueryData(
        ['integration', integration.id],
        integration
      );
      
      // Update integrations list
      queryClient.setQueryData(
        ['integrations', currentTenant?.id],
        (oldData: Integration[] | undefined) => {
          if (!oldData) return [integration];
          return oldData.map(item => 
            item.id === integration.id ? integration : item
          );
        }
      );

      // Show success notification
      notifications.show({
        title: 'Integration Connected',
        message: `Successfully connected ${integration.provider?.name || 'cloud provider'}`,
        color: 'green',
      });

      if (import.meta.env.DEV) {
        console.log('✅ OAuth flow completed successfully');
      }
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error?.message || 
                          error?.message || 
                          'Failed to complete OAuth flow';

      setFlowState({
        step: 'error',
        error: {
          error: 'server_error',
          error_description: errorMessage,
        },
        isLoading: false,
        progress: 0,
      });

      // Show error notification
      notifications.show({
        title: 'Integration Failed',
        message: errorMessage,
        color: 'red',
      });

      if (import.meta.env.DEV) {
        console.error('❌ OAuth callback processing failed:', error);
      }
    },
  });

  /**
   * Reset OAuth flow state
   */
  const resetFlow = useCallback(() => {
    setFlowState({
      step: 'initialization',
      isLoading: false,
      progress: 0,
    });
  }, []);

  /**
   * Cancel ongoing OAuth flow
   */
  const cancelFlow = useCallback(async () => {
    if (flowState.integrationId && flowState.step !== 'completion') {
      try {
        // Delete the placeholder integration if flow is cancelled
        await api.delete(
          `/tenants/${currentTenant?.id}/integrations/${flowState.integrationId}`
        );
        
        // Invalidate integrations cache
        queryClient.invalidateQueries({ 
          queryKey: ['integrations', currentTenant?.id] 
        });
      } catch (error) {
        console.error('Failed to cleanup cancelled OAuth flow:', error);
      }
    }
    
    resetFlow();
  }, [flowState.integrationId, flowState.step, currentTenant?.id, queryClient, resetFlow]);

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
    // State
    flowState,
    isLoading: flowState.isLoading || createIntegration.isPending || handleCallback.isPending,
    
    // Actions
    initiateOAuth,
    handleCallback: handleCallback.mutateAsync,
    resetFlow,
    cancelFlow,
    
    // Utilities
    getErrorMessage,
    
    // Status checks
    isInitializing: flowState.step === 'initialization',
    isAuthorizing: flowState.step === 'authorization',
    isProcessingCallback: flowState.step === 'callback',
    isExchangingToken: flowState.step === 'token_exchange',
    isCompleted: flowState.step === 'completion',
    hasError: flowState.step === 'error',
  };
};