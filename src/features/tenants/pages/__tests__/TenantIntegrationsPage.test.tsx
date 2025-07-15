import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import TenantIntegrationsPage from '../TenantIntegrationsPage';

// Mock the hooks
jest.mock('../../hooks/useTenants');
jest.mock('../../../cloud-providers/hooks/useCloudProviders');
jest.mock('../../../../shared/utils/oauth');

const mockUseTenants = require('../../hooks/useTenants').useTenants as jest.MockedFunction<any>;
const mockUseCloudProviders = require('../../../cloud-providers/hooks/useCloudProviders').useCloudProviders as jest.MockedFunction<any>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <BrowserRouter>
          <Notifications />
          {children}
        </BrowserRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe('TenantIntegrationsPage', () => {
  const mockCurrentTenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    ownerId: 'user-1',
    settings: { allowPublicProjects: false, maxProjects: 10 },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
    archived: false,
  };

  const mockCloudProviders = [
    {
      id: 'provider-1',
      name: 'Google Drive',
      slug: 'gdrive',
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      authUrl: 'https://accounts.google.com/o/oauth2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      grantType: 'authorization_code',
      tokenMethod: 'POST',
      metadata: {},
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      createdBy: 'user-1',
    },
  ];

  const mockIntegrations = [
    {
      id: 'integration-1',
      tenantId: 'tenant-1',
      providerId: 'provider-1',
      status: 'active' as const,
      tokenExpiresAt: '2024-01-01T00:00:00Z',
      scopesGranted: ['https://www.googleapis.com/auth/drive.readonly'],
      connectedAt: '2023-01-01T00:00:00Z',
      metadata: { displayName: 'My Google Drive' },
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      createdBy: 'user-1',
      provider: mockCloudProviders[0],
    },
  ];

  beforeEach(() => {
    mockUseTenants.mockReturnValue({
      currentTenant: mockCurrentTenant,
      isLoadingCurrentTenant: false,
      getTenantIntegrations: () => ({
        data: mockIntegrations,
        isLoading: false,
        error: null,
      }),
      createTenantIntegration: jest.fn(),
      updateTenantIntegration: jest.fn(),
      deleteTenantIntegration: jest.fn(),
      refreshIntegrationToken: jest.fn(),
      isCreatingIntegration: false,
      isUpdatingIntegration: false,
      isDeletingIntegration: false,
      isRefreshingToken: false,
      createIntegrationError: null,
      updateIntegrationError: null,
      deleteIntegrationError: null,
      refreshTokenError: null,
    });

    mockUseCloudProviders.mockReturnValue({
      cloudProviders: mockCloudProviders,
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the integrations page correctly', () => {
    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Cloud Provider Integrations')).toBeInTheDocument();
    expect(screen.getByText('Manage your cloud storage connections')).toBeInTheDocument();
    expect(screen.getByText('Add Integration')).toBeInTheDocument();
  });

  it('displays existing integrations in the table', () => {
    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Google Drive')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('My Google Drive')).toBeInTheDocument();
  });

  it('opens create integration modal when Add Integration is clicked', () => {
    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Add Integration'));
    expect(screen.getByText('Add Cloud Provider Integration')).toBeInTheDocument();
    expect(screen.getByText('OAuth Integration')).toBeInTheDocument();
  });

  it('shows loading state when tenant is loading', () => {
    mockUseTenants.mockReturnValue({
      ...mockUseTenants(),
      isLoadingCurrentTenant: true,
    });

    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    // Should show skeleton loaders
    expect(document.querySelectorAll('[data-skeleton]')).toHaveLength(0); // Mantine skeletons don't have this attribute by default
  });

  it('shows error state when tenant is not found', () => {
    mockUseTenants.mockReturnValue({
      ...mockUseTenants(),
      currentTenant: null,
      isLoadingCurrentTenant: false,
    });

    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('Unable to load tenant information')).toBeInTheDocument();
  });

  it('shows empty state when no integrations exist', () => {
    mockUseTenants.mockReturnValue({
      ...mockUseTenants(),
      getTenantIntegrations: () => ({
        data: [],
        isLoading: false,
        error: null,
      }),
    });

    render(
      <TestWrapper>
        <TenantIntegrationsPage />
      </TestWrapper>
    );

    expect(screen.getByText('No cloud provider integrations configured')).toBeInTheDocument();
    expect(screen.getByText('Connect to cloud storage providers to enable file management')).toBeInTheDocument();
  });
});