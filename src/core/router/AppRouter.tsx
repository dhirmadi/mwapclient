import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Notifications } from '@mantine/notifications';
import AuthProvider from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../layouts/MainLayout';

// Pages
import Home from '../../pages/Home';
import Dashboard from '../../pages/Dashboard';
import NotFound from '../../pages/NotFound';
import Unauthorized from '../../pages/Unauthorized';

// Feature Pages
import { LoginPage, ProfilePage } from '../../features/auth';
import { 
  TenantListPage, 
  TenantCreatePage, 
  TenantDetailsPage, 
  TenantEditPage,
  TenantSettingsPage,
  TenantIntegrationsPage,
  TenantManagementPage
} from '../../features/tenants';
import {
  CloudProviderListPage,
  CloudProviderCreatePage,
  CloudProviderEditPage
} from '../../features/cloud-providers';
import {
  ProjectTypeListPage,
  ProjectTypeCreatePage,
  ProjectTypeEditPage
} from '../../features/project-types';
import {
  ProjectListPage,
  ProjectCreatePage,
  ProjectDetailsPage,
  ProjectEditPage,
  ProjectMembersPage,
  ProjectFilesPage
} from '../../features/projects';

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
              <Route path="/login" element={<LoginPage />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/tenants/create" element={<TenantCreatePage />} />

                  {/* Tenant Routes - Accessible to all authenticated users */}
                  <Route path="/admin/tenants/:id" element={<TenantDetailsPage />} />
                  <Route path="/admin/tenants/:id/edit" element={<TenantEditPage />} />

                  {/* SuperAdmin Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN']} />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/tenants" element={<TenantListPage />} />
                    <Route path="/admin/tenants/create" element={<TenantCreatePage />} />
                    <Route path="/admin/cloud-providers" element={<CloudProviderListPage />} />
                    <Route path="/admin/cloud-providers/create" element={<CloudProviderCreatePage />} />
                    <Route path="/admin/cloud-providers/:id/edit" element={<CloudProviderEditPage />} />
                    <Route path="/admin/project-types" element={<ProjectTypeListPage />} />
                    <Route path="/admin/project-types/create" element={<ProjectTypeCreatePage />} />
                    <Route path="/admin/project-types/:id/edit" element={<ProjectTypeEditPage />} />
                    <Route path="/admin/projects" element={<ProjectListPage />} />
                  </Route>

                  {/* TenantOwner Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/tenant/dashboard" element={<Dashboard />} />
                    <Route path="/tenant/settings" element={<TenantSettingsPage />} />
                    <Route path="/tenant/integrations" element={<TenantIntegrationsPage />} />
                    <Route path="/tenant/management" element={<TenantManagementPage />} />
                  </Route>

                  {/* Project Routes */}
                  <Route path="/projects" element={<ProjectListPage />} />
                  
                  {/* Project Create - Only TenantOwner can create projects */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/projects/create" element={<ProjectCreatePage />} />
                  </Route>
                  
                  {/* Project Details - Any project member can view */}
                  <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                  
                  {/* Project Edit - Only Project Owner and Deputy can edit */}
                  <Route path="/projects/:id/edit" element={<ProjectEditPage />} />
                  
                  {/* Project Members - Only Project Owner can manage members */}
                  <Route path="/projects/:id/members" element={<ProjectMembersPage />} />
                  
                  {/* Project Files - Any project member can view */}
                  <Route path="/projects/:id/files" element={<ProjectFilesPage />} />
                  <Route path="/projects/:id/files/*" element={<ProjectFilesPage />} />
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