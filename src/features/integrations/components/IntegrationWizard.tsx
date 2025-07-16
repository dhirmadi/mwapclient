import React, { useState, useEffect } from 'react';
import {
  Stepper,
  Button,
  Group,
  Stack,
  Text,
  Alert,
  Paper,
  Progress,
  Modal,
  Divider,
  TextInput,
  Textarea,
  Switch,
  List,
  Badge,
  ActionIcon,
  Tooltip
} from '@mantine/core';
import {
  IconCheck,
  IconArrowRight,
  IconArrowLeft,
  IconCloud,
  IconSettings,
  IconShield,
  IconAlertCircle,
  IconInfoCircle,
  IconKey,
  IconRefresh,
  IconX
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAuth } from '../../../core/context/AuthContext';
import { useCloudProviders } from '../../cloud-providers/hooks';
import { useCreateIntegration, useOAuthFlow } from '../hooks';
import { ProviderSelector, OAuthButton } from './';
import { CloudProvider } from '../../cloud-providers/types';
import { IntegrationCreateRequest } from '../types';

interface IntegrationWizardProps {
  onComplete?: (integrationId: string) => void;
  onCancel?: () => void;
  initialProvider?: CloudProvider;
  autoAdvance?: boolean;
  showProgress?: boolean;
  allowStepNavigation?: boolean;
}

interface WizardFormData {
  displayName: string;
  description: string;
  isActive: boolean;
  settings: {
    autoRefresh: boolean;
    notifyOnExpiration: boolean;
  };
}

interface WizardStep {
  label: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  isValid: () => boolean;
  canSkip?: boolean;
}

export const IntegrationWizard: React.FC<IntegrationWizardProps> = ({
  onComplete,
  onCancel,
  initialProvider,
  autoAdvance = false,
  showProgress = true,
  allowStepNavigation = true,
}) => {
  const { user, roles } = useAuth();
  
  // State management
  const [activeStep, setActiveStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(initialProvider || null);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);
  const [savedProgress, setSavedProgress] = useState<Partial<WizardFormData> | null>(null);

  // Hooks
  const { data: cloudProviders, isLoading: isLoadingProviders } = useCloudProviders();
  const { mutate: createIntegration, isPending: isCreating } = useCreateIntegration();
  const { flowState, resetFlow } = useOAuthFlow();

  // Form management
  const form = useForm<WizardFormData>({
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

  // Auto-populate display name when provider is selected
  useEffect(() => {
    if (selectedProvider && !form.values.displayName) {
      form.setFieldValue('displayName', `${selectedProvider.name} Integration`);
    }
  }, [selectedProvider]);

  // Load saved progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('integration-wizard-progress');
    if (saved) {
      try {
        const progress = JSON.parse(saved);
        setSavedProgress(progress);
      } catch (error) {
        console.error('Failed to load saved progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = () => {
    const progress = {
      activeStep,
      selectedProvider: selectedProvider?.id,
      formData: form.values,
    };
    localStorage.setItem('integration-wizard-progress', JSON.stringify(progress));
  };

  // Clear saved progress
  const clearProgress = () => {
    localStorage.removeItem('integration-wizard-progress');
    setSavedProgress(null);
  };

  // Restore saved progress
  const restoreProgress = () => {
    if (savedProgress) {
      // Restore form data
      form.setValues(savedProgress as WizardFormData);
      
      // Restore selected provider
      if (savedProgress.selectedProvider && cloudProviders) {
        const provider = cloudProviders.find(p => p.id === savedProgress.selectedProvider);
        if (provider) {
          setSelectedProvider(provider);
        }
      }
      
      setSavedProgress(null);
    }
  };

  // Event handlers
  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider);
    if (autoAdvance) {
      setTimeout(() => handleNextStep(), 500);
    }
  };

  const handleNextStep = () => {
    if (activeStep < steps.length - 1) {
      saveProgress();
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    if (allowStepNavigation && step <= activeStep) {
      setActiveStep(step);
    }
  };

  const handleFormSubmit = (values: WizardFormData) => {
    if (!selectedProvider || !roles?.tenantId) return;

    const integrationData: IntegrationCreateRequest = {
      tenantId: roles.tenantId,
      providerId: selectedProvider.id,
      metadata: {
        displayName: values.displayName,
        description: values.description,
        settings: values.settings,
      },
      isActive: values.isActive,
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
    clearProgress();
    notifications.show({
      title: 'Integration Complete!',
      message: 'Your cloud provider has been successfully connected.',
      color: 'green',
      icon: <IconCheck size={16} />,
    });
    
    onComplete?.(integrationId);
  };

  const handleOAuthError = (error: string) => {
    notifications.show({
      title: 'Authorization Failed',
      message: error,
      color: 'red',
      icon: <IconAlertCircle size={16} />,
    });
  };

  const handleCancel = () => {
    if (activeStep > 0 || form.isDirty()) {
      setShowConfirmCancel(true);
    } else {
      clearProgress();
      onCancel?.();
    }
  };

  const handleConfirmCancel = () => {
    clearProgress();
    setShowConfirmCancel(false);
    onCancel?.();
  };

  // Get scope description
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

  // Define wizard steps
  const steps: WizardStep[] = [
    {
      label: 'Select Provider',
      description: 'Choose your cloud storage provider',
      icon: <IconCloud size={16} />,
      component: (
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
            onProviderDeselect={() => setSelectedProvider(null)}
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
      ),
      isValid: () => !!selectedProvider,
    },
    {
      label: 'Configure',
      description: 'Set up integration details',
      icon: <IconSettings size={16} />,
      component: (
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
      ),
      isValid: () => form.isValid() && !!selectedProvider,
    },
    {
      label: 'Authorize',
      description: 'Connect your account securely',
      icon: <IconShield size={16} />,
      component: (
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
                  >
                    This connection uses OAuth 2.0 with PKCE for maximum security
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
      ),
      isValid: () => flowState.step === 'completion',
    },
  ];

  // Get current step
  const currentStep = steps[activeStep];

  return (
    <Stack gap="md">
      {/* Saved Progress Alert */}
      {savedProgress && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          withCloseButton
          onClose={() => setSavedProgress(null)}
        >
          <Group justify="space-between">
            <Text size="sm">
              You have saved progress from a previous session.
            </Text>
            <Button
              size="xs"
              variant="light"
              onClick={restoreProgress}
            >
              Restore Progress
            </Button>
          </Group>
        </Alert>
      )}

      {/* Progress Bar */}
      {showProgress && (
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>
              Step {activeStep + 1} of {steps.length}
            </Text>
            <Text size="sm" c="dimmed">
              {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
            </Text>
          </Group>
          <Progress
            value={((activeStep + 1) / steps.length) * 100}
            size="sm"
            radius="xl"
          />
        </div>
      )}

      {/* Stepper */}
      <Stepper
        active={activeStep}
        onStepClick={allowStepNavigation ? handleStepClick : undefined}
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
            allowStepSelect={allowStepNavigation && index <= activeStep}
            loading={
              index === 2 && 
              (flowState.step === 'authorization' || 
               flowState.step === 'callback' || 
               flowState.step === 'token_exchange')
            }
          />
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper withBorder p="lg" radius="md" style={{ minHeight: 400 }}>
        {currentStep.component}
      </Paper>

      {/* Navigation */}
      <Group justify="space-between">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={activeStep === 0 ? handleCancel : handlePrevStep}
        >
          {activeStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        {activeStep < steps.length - 1 && (
          <Button
            rightSection={<IconArrowRight size={16} />}
            onClick={activeStep === 1 ? form.onSubmit(handleFormSubmit) : handleNextStep}
            disabled={!currentStep.isValid()}
            loading={isCreating}
          >
            {activeStep === 1 ? 'Create Integration' : 'Next'}
          </Button>
        )}
      </Group>

      {/* Cancel Confirmation Modal */}
      <Modal
        opened={showConfirmCancel}
        onClose={() => setShowConfirmCancel(false)}
        title="Cancel Integration Setup"
        centered
      >
        <Stack gap="md">
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            variant="light"
          >
            <Text size="sm">
              Are you sure you want to cancel? Your progress will be saved and you can resume later.
            </Text>
          </Alert>
          
          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              onClick={() => setShowConfirmCancel(false)}
            >
              Continue Setup
            </Button>
            <Button
              color="red"
              onClick={handleConfirmCancel}
              leftSection={<IconX size={16} />}
            >
              Cancel Setup
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};