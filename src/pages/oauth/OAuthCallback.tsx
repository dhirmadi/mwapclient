import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Title, Text, Loader, Alert, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useCloudProviders } from '../../hooks/useCloudProviders';
import { getOAuthRedirectUri, parseOAuthState } from '../../utils/oauth';
import api from '../../utils/api';

/**
 * OAuthCallback component handles the OAuth callback from cloud providers
 * It extracts the authorization code from the URL and exchanges it for tokens
 * using the dedicated token update endpoint
 */
const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles } = useAuth();
  const { updateIntegrationTokens, isUpdatingIntegrationTokens, deleteIntegration } = useCloudProviders();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract query parameters
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        // Handle error from OAuth provider
        if (error) {
          const errorMsg = `Authentication error: ${error}${errorDescription ? `: ${errorDescription}` : ''}`;
          setError(errorMsg);
          
          // If we have state data, try to delete the pending integration
          if (state) {
            try {
              const stateData = parseOAuthState(state);
              if (stateData && stateData.tenantId && stateData.integrationId) {
                // Delete the pending integration since OAuth failed
                await deleteIntegration({
                  tenantId: stateData.tenantId,
                  integrationId: stateData.integrationId
                });
                console.log('Deleted pending integration after OAuth failure');
              }
            } catch (deleteError) {
              console.error('Failed to delete pending integration:', deleteError);
            }
          }
          
          setLoading(false);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setError('Missing required parameters (code or state)');
          setLoading(false);
          return;
        }

        // Parse state parameter (contains tenantId and integrationId)
        console.log('Raw state parameter:', state);
        const stateData = parseOAuthState(state);
        console.log('Parsed state data:', stateData);
        
        if (!stateData) {
          setError('Invalid state parameter');
          setLoading(false);
          return;
        }

        // In the new approach, state contains tenantId and integrationId (not providerId)
        const { tenantId, integrationId, timestamp } = stateData;
        console.log('Extracted tenantId:', tenantId);
        console.log('Extracted integrationId:', integrationId);
        console.log('Extracted timestamp:', timestamp);

        if (!tenantId || !integrationId) {
          console.error('Missing tenant ID or integration ID in state parameter');
          console.error('Full state data:', stateData);
          setError('Missing tenant ID or integration ID in state parameter');
          setLoading(false);
          return;
        }

        // Check for state expiration (optional, 15 minutes)
        if (timestamp) {
          const stateAge = Date.now() - timestamp;
          if (stateAge > 15 * 60 * 1000) {
            setError('OAuth state has expired. Please try again.');
            setLoading(false);
            return;
          }
        }

        // Update the integration tokens using the dedicated endpoint
        try {
          console.log('Calling updateIntegrationTokens with:', {
            tenantId,
            integrationId,
            authorizationCode: code,
            redirectUri: getOAuthRedirectUri()
          });
          
          // Use the API client directly as a fallback
          if (typeof updateIntegrationTokens !== 'function') {
            console.log('updateIntegrationTokens is not a function, using API client directly');
            await api.updateIntegrationTokens(
              tenantId,
              integrationId,
              {
                authorizationCode: code,
                redirectUri: getOAuthRedirectUri()
              }
            );
          } else {
            await updateIntegrationTokens({
              tenantId,
              integrationId,
              authorizationCode: code,
              redirectUri: getOAuthRedirectUri()
            });
          }
        } catch (tokenError) {
          console.error('Error updating integration tokens:', tokenError);
          throw tokenError;
        }

        // Handle success
        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          notifications.show({
            title: 'Integration Successful',
            message: 'Cloud provider integration has been successfully set up',
            color: 'green',
            icon: <IconCheck size={16} />
          });
        }, 100);

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/tenant/integrations');
        }, 2000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Failed to complete OAuth authentication');
        
        // Try to delete the pending integration if we have the state data
        try {
          const params = new URLSearchParams(location.search);
          const state = params.get('state');
          
          if (state) {
            const stateData = parseOAuthState(state);
            if (stateData && stateData.tenantId && stateData.integrationId) {
              // Delete the pending integration since OAuth failed
              await deleteIntegration({
                tenantId: stateData.tenantId,
                integrationId: stateData.integrationId
              });
              console.log('Deleted pending integration after OAuth error');
            }
          }
        } catch (deleteError) {
          console.error('Failed to delete pending integration:', deleteError);
        }
        
        setLoading(false);
        
        setTimeout(() => {
          notifications.show({
            title: 'Authentication Failed',
            message: error.message || 'Failed to complete OAuth authentication',
            color: 'red'
          });
        }, 100);
      }
    };

    handleOAuthCallback();
  }, [location, navigate, updateIntegrationTokens, deleteIntegration]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px'
    }}>
      <Paper shadow="md" p="xl" radius="md" style={{ maxWidth: '500px', width: '100%' }}>
        <Title order={2} mb="md">Cloud Provider Authentication</Title>

        {(loading || isUpdatingIntegrationTokens) && (
          <div style={{ textAlign: 'center', padding: '30px' }}>
            <Loader size="lg" variant="dots" mb="md" />
            <Text>Processing authentication response...</Text>
          </div>
        )}

        {error && (
          <Alert 
            icon={<IconAlertCircle size={16} />} 
            title="Authentication Failed" 
            color="red" 
            mb="xl"
          >
            {error}
            <Group mt="md">
              <Button onClick={() => navigate('/tenant/integrations')}>
                Return to Integrations
              </Button>
            </Group>
          </Alert>
        )}

        {success && (
          <Alert 
            icon={<IconCheck size={16} />} 
            title="Authentication Successful" 
            color="green" 
            mb="xl"
          >
            Your cloud provider integration has been successfully set up. 
            You will be redirected to the integrations page shortly.
          </Alert>
        )}
      </Paper>
    </div>
  );
};

export default OAuthCallback;