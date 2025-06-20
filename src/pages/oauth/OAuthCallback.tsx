import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Paper, Title, Text, Loader, Alert, Button, Group } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

/**
 * OAuthCallback component handles the OAuth callback from cloud providers
 * It extracts the authorization code from the URL and exchanges it for tokens
 */
const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roles } = useAuth();
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
          setError(`Authentication error: ${error}${errorDescription ? `: ${errorDescription}` : ''}`);
          setLoading(false);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setError('Missing required parameters (code or state)');
          setLoading(false);
          return;
        }

        // Parse state parameter (contains tenantId and providerId)
        let stateData;
        try {
          stateData = JSON.parse(atob(state));
        } catch (e) {
          setError('Invalid state parameter');
          setLoading(false);
          return;
        }

        const { tenantId, providerId } = stateData;

        if (!tenantId || !providerId) {
          setError('Missing tenant ID or provider ID in state parameter');
          setLoading(false);
          return;
        }

        // Exchange authorization code for tokens
        const response = await api.exchangeOAuthCode({
          tenantId,
          providerId,
          code,
          redirectUri: `${window.location.origin}/oauth/callback`
        });

        // Handle success
        setSuccess(true);
        setLoading(false);

        notifications.show({
          title: 'Integration Successful',
          message: 'Cloud provider integration has been successfully set up',
          color: 'green',
          icon: <IconCheck size={16} />
        });

        // Redirect after a short delay
        setTimeout(() => {
          navigate('/tenant/integrations');
        }, 2000);
      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setError(error.message || 'Failed to complete OAuth authentication');
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [location, navigate, roles]);

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

        {loading && (
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