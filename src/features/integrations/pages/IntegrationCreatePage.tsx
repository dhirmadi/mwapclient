import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Title,
  Text,
  Paper,
  Button,
  Group,
  Stack,
  Alert,
  Container,
  Stepper,
  TextInput,
  Textarea,
  Switch,
  Divider,
  Progress,
  Badge,
  ActionIcon,
  Modal,
  List
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconCloud,
  IconSettings,
  IconShield,
  IconAlertCircle,
  IconInfoCircle,
  IconExternalLink,
  IconKey,
  IconRefresh
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../core/context/AuthContext';
import { useCloudProviders } from '../../cloud-providers/hooks';
import { useCreateIntegration, useOAuthFlow } from '../hooks';
import { ProviderSelector, OAuthButton } from '../components';
import { CloudProvider } from '../../cloud-providers/types';
import { IntegrationCreateRequest } from '../types';

interface IntegrationFormData extends Record<string, unknown> {
  displayName: string;
  description: string;
  isActive: boolean;
  settings: {
    autoRefresh: boolean;
    notifyOnExpiration: boolean;
  };
}

const IntegrationCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, roles } = useAuth();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null);
  const [showOAuthInfo, setShowOAuthInfo] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // Hooks
  const { data: cloudProviders, isLoading: isLoadingProviders } = useCloudProviders();
  const { mutate: createIntegration, isPending: isCreating } = useCreateIntegration();
  const { flowState, resetFlow } = useOAuthFlow();

  // Form management
  const form = useForm<IntegrationFormData>({
    initialValues: {
      displayName: '',
      description: '',
      isActive: true,
      settings: {
        autoRefresh: true,
        notifyOnExpiration: true,
      },
    },
    validate: {
      displayName: (value) => 
        value.length < 2 ? 'Display name must be at least 2 characters' : null,
    },
  });

  // Check for OAuth callback success
  useEffect(() => {
    const oauthSuccess = searchParams.get('oauth') === 'success';
    const integrationId = searchParams.get('integration_id');
    
    if (oauthSuccess && integrationId) {
      // OAuth completed successfully
      setIsCompleting(true);
      notifications.show({
        title: 'Integration Created Successfully!',
        message: 'Your cloud provider has been connected and is ready to use.',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Navigate to integration details or list
      setTimeout(() => {
        navigate(`/integrations/${integrationId}`);
      }, 2000);
    }
  }, [searchParams, navigate]);

  // Step definitions
  const steps = [
    {
      label: 'Select Provider',
      description: 'Choose your cloud storage provider',
      icon: <IconCloud size={16} />,
    },
    {
      label: 'Configure',
      description: 'Set up integration details',
      icon: <IconSettings size={16} />,
    },
    {
      label: 'Authorize',
      description: 'Connect your account securely',
      icon: <IconShield size={16} />,
    },
  ];

  // Event handlers
  const handleBack = () => {
    navigate('/integrations');
  };

  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    // Auto-populate display name
    if (!form.values.displayName) {
      form.setFieldValue('displayName', `${provider.name} Integration`);
    }
  };

  const handleProviderDeselect = () => {
    setSelectedProvider(null);
  };

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleFormSubmit = (values: IntegrationFormData) => {
    if (!selectedProvider || !roles?.tenantId) return;

    const integrationData: IntegrationCreateRequest = {

      providerId: selectedProvider.id,
      metadata: {
        displayName: values.displayName,
        description: values.description,
        settings: values.settings,
      },
    };

    createIntegration(integrationData, {
      onSuccess: (integration) => {
        // Move to OAuth step
        setActiveStep(2);
        notifications.show({
          title: 'Integration Created',
          message: 'Now authorize access to your cloud provider account.',
          color: 'blue',
        });
      },
      onError: (error) => {
        notifications.show({
          title: 'Failed to Create Integration',
          message: error.message || 'Please try again.',
          color: 'red',
        });
      },
    });
  };

  const handleOAuthSuccess = (integrationId: string) => {
    notifications.show({
      title: 'Authorization Successful!',
      message: 'Your cloud provider has been connected.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    
    // Navigate to integration details
    navigate(`/integrations/${integrationId}`);
  };

  const handleOAuthError = (error: string) => {
    notifications.show({
      title: 'Authorization Failed',
      message: error,
      color: 'red',
      icon: <IconAlertCircle size={16} />,
    });
  };

  // Check if step is complete
  const isStepComplete = (step: number) => {
    switch (step) {
      case 0:
        return !!selectedProvider;
      case 1:
        return form.isValid() && !!selectedProvider;
      case 2:
        return flowState.step === 'completion';
      default:
        return false;
    }
  };

  // Check if can proceed to next step
  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!selectedProvider;
      case 1:
        return form.isValid() && !!selectedProvider;
      case 2:
        return false; // OAuth step doesn't have next
      default:
        return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">Choose Cloud Provider</Text>
              <Text size="sm" c="dimmed" mb="md">
                Select the cloud storage service you want to connect to your MWAP account.
              </Text>
            </div>
            
            <ProviderSelector
              selectedProviderId={selectedProvider?.id}
              onProviderSelect={handleProviderSelect}
              onProviderDeselect={handleProviderDeselect}
              showSelected={true}
            />
            
            {selectedProvider && (
              <Alert
                icon={<IconInfoCircle size={16} />}
                color="blue"
                variant="light"
              >
                <Text size="sm">
                  <strong>{selectedProvider.name}</strong> will be connected using secure OAuth 2.0 
                  authentication. No passwords will be stored on our servers.
                </Text>
              </Alert>
            )}
          </Stack>
        );

      case 1:
        return (
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">Configure Integration</Text>
              <Text size="sm" c="dimmed" mb="md">
                Customize your integration settings and preferences.
              </Text>
            </div>

            <form onSubmit={form.onSubmit(handleFormSubmit)}>
              <Stack gap="md">
                <TextInput
                  label="Display Name"
                  description="A friendly name for this integration"
                  placeholder="My Google Drive"
                  required
                  {...form.getInputProps('displayName')}
                />

                <Textarea
                  label="Description"
                  description="Optional description for this integration"
                  placeholder="Personal files and documents"
                  minRows={3}
                  {...form.getInputProps('description')}
                />

                <Divider />

                <div>
                  <Text fw={500} mb="sm">Settings</Text>
                  
                  <Stack gap="sm">
                    <Switch
                      label="Enable integration"
                      description="Integration will be active and accessible immediately"
                      {...form.getInputProps('isActive', { type: 'checkbox' })}
                    />
                    
                    <Switch
                      label="Auto-refresh tokens"
                      description="Automatically refresh access tokens before they expire"
                      {...form.getInputProps('settings.autoRefresh', { type: 'checkbox' })}
                    />
                    
                    <Switch
                      label="Expiration notifications"
                      description="Receive notifications when tokens are about to expire"
                      {...form.getInputProps('settings.notifyOnExpiration', { type: 'checkbox' })}
                    />
                  </Stack>
                </div>

                {selectedProvider && (
                  <>
                    <Divider />
                    <Alert
                      icon={<IconKey size={16} />}
                      color="blue"
                      variant="light"
                    >
                      <Text size="sm" fw={500} mb="xs">
                        Permissions Required
                      </Text>
                      <List size="sm" spacing="xs">
                        {selectedProvider.scopes.map((scope, index) => (
                          <List.Item key={index}>
                            {getScopeDescription(scope)}
                          </List.Item>
                        ))}
                      </List>
                    </Alert>
                  </>
                )}
              </Stack>
            </form>
          </Stack>
        );

      case 2:
        return (
          <Stack gap="md">
            <div>
              <Text fw={500} mb="xs">Authorize Access</Text>
              <Text size="sm" c="dimmed" mb="md">
                Connect your {selectedProvider?.name} account to complete the integration.
              </Text>
            </div>

            {selectedProvider && (
              <Paper withBorder p="md" radius="md">
                <Group gap="md" mb="md">
                  <div style={{ flex: 1 }}>
                    <Text fw={500} mb="xs">
                      Ready to Connect {selectedProvider.name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      Click the button below to securely authorize MWAP to access your account.
                    </Text>
                  </div>
                </Group>

                <Stack gap="md">
                  <OAuthButton
                    provider={selectedProvider}
                    metadata={form.values}
                    onSuccess={handleOAuthSuccess}
                    onError={handleOAuthError}
                    showProgress={true}
                    showSecurityInfo={true}
                    fullWidth
                  />

                  <Group justify="center">
                    <Button
                      variant="subtle"
                      size="xs"
                      leftSection={<IconInfoCircle size={14} />}
                      onClick={() => setShowOAuthInfo(true)}
                    >
                      Security Information
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            )}

            {flowState.step === 'error' && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
              >
                <Group justify="space-between">
                  <Text size="sm">
                    Authorization failed. Please try again.
                  </Text>
                  <Button
                    size="xs"
                    variant="subtle"
                    leftSection={<IconRefresh size={14} />}
                    onClick={resetFlow}
                  >
                    Retry
                  </Button>
                </Group>
              </Alert>
            )}
          </Stack>
        );

      default:
        return null;
    }
  };

  const getScopeDescription = (scope: string): string => {
    const descriptions: Record<string, string> = {
      'read': 'Read access to your files and folders',
      'write': 'Create and modify files and folders',
      'delete': 'Delete files and folders',
      'profile': 'Access to basic profile information',
      'email': 'Access to your email address',
      'offline_access': 'Access when you\'re not actively using the app',
    };
    
    return descriptions[scope] || `Access to ${scope}`;
  };

  if (isCompleting) {
    return (
      <Container size="sm">
        <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
          <Stack gap="md" align="center">
            <IconCheck size={64} color="var(--mantine-color-green-6)" />
            <div>
              <Title order={2} mb="xs">Integration Complete!</Title>
              <Text c="dimmed">
                Your cloud provider has been successfully connected.
              </Text>
            </div>
            <Progress value={100} size="sm" color="green" style={{ width: '100%' }} />
            <Text size="sm" c="dimmed">
              Redirecting to integration details...
            </Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="md">
      {/* Header */}
      <Group justify="space-between" mb="lg">
        <div>
          <Group gap="sm" mb="xs">
            <ActionIcon variant="subtle" onClick={handleBack}>
              <IconArrowLeft size={16} />
            </ActionIcon>
            <Title order={2}>Create Integration</Title>
          </Group>
          <Text c="dimmed">
            Connect a cloud storage provider to your MWAP account
          </Text>
        </div>
      </Group>

      {/* Progress Stepper */}
      <Paper withBorder p="md" radius="md" mb="lg">
        <Stepper
          active={activeStep}
          onStepClick={setActiveStep}
          allowNextStepsSelect={false}
          size="sm"
        >
          {steps.map((step, index) => (
            <Stepper.Step
              key={index}
              label={step.label}
              description={step.description}
              icon={step.icon}
              completedIcon={<IconCheck size={16} />}
              allowStepSelect={index <= activeStep}
            />
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper withBorder p="lg" radius="md" mb="lg">
        {renderStepContent()}
      </Paper>

      {/* Navigation */}
      <Group justify="space-between">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={activeStep === 0 ? handleBack : handlePrevStep}
        >
          {activeStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {activeStep < 2 && (
          <Button
            rightSection={<IconArrowRight size={16} />}
            onClick={activeStep === 1 ? () => form.onSubmit(handleFormSubmit)() : handleNextStep}
            disabled={!canProceed()}
            loading={isCreating}
          >
            {activeStep === 1 ? 'Create Integration' : 'Next'}
          </Button>
        )}
      </Group>

      {/* Security Information Modal */}
      <Modal
        opened={showOAuthInfo}
        onClose={() => setShowOAuthInfo(false)}
        title={
          <Group gap="sm">
            <IconShield size={20} color="var(--mantine-color-green-6)" />
            <Text fw={500}>OAuth 2.0 Security</Text>
          </Group>
        }
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconShield size={16} />}
            color="green"
            variant="light"
          >
            <Text size="sm">
              Your connection is secured with industry-standard OAuth 2.0 with PKCE (Proof Key for Code Exchange).
            </Text>
          </Alert>

          <div>
            <Text fw={500} mb="xs">How it works:</Text>
            <List size="sm" spacing="xs">
              <List.Item>You'll be redirected to {selectedProvider?.name}'s secure login page</List.Item>
              <List.Item>You authorize MWAP to access your account with specific permissions</List.Item>
              <List.Item>A secure access token is created for API communication</List.Item>
              <List.Item>No passwords are ever stored on our servers</List.Item>
              <List.Item>You can revoke access at any time from your provider's settings</List.Item>
            </List>
          </div>

          <div>
            <Text fw={500} mb="xs">Security features:</Text>
            <List size="sm" spacing="xs">
              <List.Item>PKCE (Proof Key for Code Exchange) for enhanced security</List.Item>
              <List.Item>State parameter validation to prevent CSRF attacks</List.Item>
              <List.Item>Secure token storage with automatic refresh</List.Item>
              <List.Item>Encrypted communication using HTTPS</List.Item>
            </List>
          </div>

          <Group justify="flex-end">
            <Button onClick={() => setShowOAuthInfo(false)}>
              Got it
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
};

export default IntegrationCreatePage;