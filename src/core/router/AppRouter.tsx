import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Notifications } from '@mantine/notifications';
import { Loader, Center, Stack, Text } from '@mantine/core';
import AuthProvider from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RedirectRoute from './RedirectRoute';
import MainLayout from '../layouts/MainLayout';

// Loading component for Suspense fallback
const PageLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <Center style={{ minHeight: '60vh' }}>
    <Stack align="center" gap="md">
      <Loader size="lg" />
      <Text c="dimmed">{message}</Text>
    </Stack>
  </Center>
);

// Eagerly loaded pages (needed immediately)
import Home from '../../pages/Home';
import NotFound from '../../pages/NotFound';
import Unauthorized from '../../pages/Unauthorized';

// Lazy-loaded pages and features (code-split)
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const OAuthCallbackPage = lazy(() => import('../../pages/OAuthCallbackPage'));

// Auth Feature (lazy-loaded)
const LoginPage = lazy(() => import('../../features/auth').then(m => ({ default: m.LoginPage })));
const ProfilePage = lazy(() => import('../../features/auth').then(m => ({ default: m.ProfilePage })));

// Tenant Feature (lazy-loaded)
const TenantListPage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantListPage })));
const TenantCreatePage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantCreatePage })));
const TenantDetailsPage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantDetailsPage })));
const TenantEditPage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantEditPage })));
const TenantSettingsPage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantSettingsPage })));
const TenantManagementPage = lazy(() => import('../../features/tenants').then(m => ({ default: m.TenantManagementPage })));

// Cloud Provider Feature (lazy-loaded)
const CloudProviderListPage = lazy(() => import('../../features/cloud-providers').then(m => ({ default: m.CloudProviderListPage })));
const CloudProviderCreatePage = lazy(() => import('../../features/cloud-providers').then(m => ({ default: m.CloudProviderCreatePage })));
const CloudProviderEditPage = lazy(() => import('../../features/cloud-providers').then(m => ({ default: m.CloudProviderEditPage })));

// Project Type Feature (lazy-loaded)
const ProjectTypeListPage = lazy(() => import('../../features/project-types').then(m => ({ default: m.ProjectTypeListPage })));
const ProjectTypeCreatePage = lazy(() => import('../../features/project-types').then(m => ({ default: m.ProjectTypeCreatePage })));
const ProjectTypeEditPage = lazy(() => import('../../features/project-types').then(m => ({ default: m.ProjectTypeEditPage })));

// Project Feature (lazy-loaded)
const ProjectListPage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectListPage })));
const ProjectCreatePage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectCreatePage })));
const ProjectDetailsPage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectDetailsPage })));
const ProjectEditPage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectEditPage })));
const ProjectMembersPage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectMembersPage })));
const ProjectFilesPage = lazy(() => import('../../features/projects').then(m => ({ default: m.ProjectFilesPage })));

// Integration Feature (lazy-loaded)
const IntegrationListPage = lazy(() => import('../../features/integrations').then(m => ({ default: m.IntegrationListPage })));
const IntegrationCreatePage = lazy(() => import('../../features/integrations').then(m => ({ default: m.IntegrationCreatePage })));
const IntegrationDetailsPage = lazy(() => import('../../features/integrations').then(m => ({ default: m.IntegrationDetailsPage })));

// Note: QueryClient is now created in App.tsx to avoid duplication
// This ensures React Query Devtools work correctly

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
      >
        <AuthProvider>
          <Notifications position="top-right" />
          <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={
                <Suspense fallback={<PageLoader message="Loading login..." />}>
                  <LoginPage />
                </Suspense>
              } />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/oauth/success" element={
                <Suspense fallback={<PageLoader message="Processing OAuth..." />}>
                  <OAuthCallbackPage />
                </Suspense>
              } />
              <Route path="/oauth/error" element={
                <Suspense fallback={<PageLoader message="Processing OAuth..." />}>
                  <OAuthCallbackPage />
                </Suspense>
              } />
              <Route path="/oauth/callback" element={
                <Suspense fallback={<PageLoader message="Processing OAuth..." />}>
                  <OAuthCallbackPage />
                </Suspense>
              } />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={
                    <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
                      <Dashboard />
                    </Suspense>
                  } />
                  <Route path="/profile" element={
                    <Suspense fallback={<PageLoader message="Loading profile..." />}>
                      <ProfilePage />
                    </Suspense>
                  } />
                  <Route path="/tenants/create" element={
                    <Suspense fallback={<PageLoader message="Loading form..." />}>
                      <TenantCreatePage />
                    </Suspense>
                  } />

                  {/* Tenant Routes - Accessible to all authenticated users */}
                  <Route path="/admin/tenants/:id" element={
                    <Suspense fallback={<PageLoader message="Loading tenant..." />}>
                      <TenantDetailsPage />
                    </Suspense>
                  } />
                  <Route path="/admin/tenants/:id/edit" element={
                    <Suspense fallback={<PageLoader message="Loading editor..." />}>
                      <TenantEditPage />
                    </Suspense>
                  } />

                  {/* SuperAdmin Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN']} />}>
                    <Route path="/admin/dashboard" element={
                      <Suspense fallback={<PageLoader message="Loading admin dashboard..." />}>
                        <Dashboard />
                      </Suspense>
                    } />
                    <Route path="/admin/tenants" element={
                      <Suspense fallback={<PageLoader message="Loading tenants..." />}>
                        <TenantListPage />
                      </Suspense>
                    } />
                    <Route path="/admin/tenants/create" element={
                      <Suspense fallback={<PageLoader message="Loading form..." />}>
                        <TenantCreatePage />
                      </Suspense>
                    } />
                    <Route path="/admin/cloud-providers" element={
                      <Suspense fallback={<PageLoader message="Loading providers..." />}>
                        <CloudProviderListPage />
                      </Suspense>
                    } />
                    <Route path="/admin/cloud-providers/create" element={
                      <Suspense fallback={<PageLoader message="Loading form..." />}>
                        <CloudProviderCreatePage />
                      </Suspense>
                    } />
                    <Route path="/admin/cloud-providers/:id/edit" element={
                      <Suspense fallback={<PageLoader message="Loading editor..." />}>
                        <CloudProviderEditPage />
                      </Suspense>
                    } />
                    <Route path="/admin/project-types" element={
                      <Suspense fallback={<PageLoader message="Loading project types..." />}>
                        <ProjectTypeListPage />
                      </Suspense>
                    } />
                    <Route path="/admin/project-types/create" element={
                      <Suspense fallback={<PageLoader message="Loading form..." />}>
                        <ProjectTypeCreatePage />
                      </Suspense>
                    } />
                    <Route path="/admin/project-types/:id/edit" element={
                      <Suspense fallback={<PageLoader message="Loading editor..." />}>
                        <ProjectTypeEditPage />
                      </Suspense>
                    } />
                    <Route path="/admin/projects" element={
                      <Suspense fallback={<PageLoader message="Loading projects..." />}>
                        <ProjectListPage />
                      </Suspense>
                    } />
                  </Route>

                  {/* TenantOwner Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/tenant/dashboard" element={
                      <Suspense fallback={<PageLoader message="Loading dashboard..." />}>
                        <Dashboard />
                      </Suspense>
                    } />
                    <Route path="/tenant/settings" element={
                      <Suspense fallback={<PageLoader message="Loading settings..." />}>
                        <TenantSettingsPage />
                      </Suspense>
                    } />
                    <Route path="/tenant/management" element={
                      <Suspense fallback={<PageLoader message="Loading management..." />}>
                        <TenantManagementPage />
                      </Suspense>
                    } />
                    
                    {/* New Integration Routes */}
                    <Route path="/integrations" element={
                      <Suspense fallback={<PageLoader message="Loading integrations..." />}>
                        <IntegrationListPage />
                      </Suspense>
                    } />
                    <Route path="/integrations/create" element={
                      <Suspense fallback={<PageLoader message="Loading form..." />}>
                        <IntegrationCreatePage />
                      </Suspense>
                    } />
                    <Route path="/integrations/:id" element={
                      <Suspense fallback={<PageLoader message="Loading integration..." />}>
                        <IntegrationDetailsPage />
                      </Suspense>
                    } />
                    
                    {/* Backward Compatibility Redirects */}
                    <Route 
                      path="/tenant/integrations" 
                      element={
                        <RedirectRoute 
                          to="/integrations" 
                          showNotification={true}
                          notificationMessage="Integration management has moved to a dedicated section. You've been redirected to the new location."
                        />
                      } 
                    />
                  </Route>

                  {/* Project Routes */}
                  <Route path="/projects" element={
                    <Suspense fallback={<PageLoader message="Loading projects..." />}>
                      <ProjectListPage />
                    </Suspense>
                  } />
                  
                  {/* Project Create - Only TenantOwner can create projects */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/projects/create" element={
                      <Suspense fallback={<PageLoader message="Loading form..." />}>
                        <ProjectCreatePage />
                      </Suspense>
                    } />
                  </Route>
                  
                  {/* Project Details - Any project member can view */}
                  <Route path="/projects/:id" element={
                    <Suspense fallback={<PageLoader message="Loading project..." />}>
                      <ProjectDetailsPage />
                    </Suspense>
                  } />
                  
                  {/* Project Edit - Only Project Owner and Deputy can edit */}
                  <Route path="/projects/:id/edit" element={
                    <Suspense fallback={<PageLoader message="Loading editor..." />}>
                      <ProjectEditPage />
                    </Suspense>
                  } />
                  
                  {/* Project Members - Only Project Owner can manage members */}
                  <Route path="/projects/:id/members" element={
                    <Suspense fallback={<PageLoader message="Loading members..." />}>
                      <ProjectMembersPage />
                    </Suspense>
                  } />
                  
                  {/* Project Files - Any project member can view */}
                  <Route path="/projects/:id/files" element={
                    <Suspense fallback={<PageLoader message="Loading files..." />}>
                      <ProjectFilesPage />
                    </Suspense>
                  } />
                  <Route path="/projects/:id/files/*" element={
                    <Suspense fallback={<PageLoader message="Loading files..." />}>
                      <ProjectFilesPage />
                    </Suspense>
                  } />
                </Route>
              </Route>

              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
};

export { AppRouter };
export default AppRouter;