import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Auth0Provider } from '@auth0/auth0-react';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';
import NotFound from '../pages/NotFound';
import Unauthorized from '../pages/Unauthorized';

// SuperAdmin Pages
import TenantList from '../pages/tenants/TenantList';
import TenantCreate from '../pages/tenants/TenantCreate';
import TenantDetails from '../pages/tenants/TenantDetails';
import TenantEdit from '../pages/tenants/TenantEdit';
import CloudProviderList from '../pages/cloud-providers/CloudProviderList';
import CloudProviderCreate from '../pages/cloud-providers/CloudProviderCreate';
import CloudProviderEdit from '../pages/cloud-providers/CloudProviderEdit';
import ProjectTypeList from '../pages/project-types/ProjectTypeList';
import ProjectTypeCreate from '../pages/project-types/ProjectTypeCreate';
import ProjectTypeEdit from '../pages/project-types/ProjectTypeEdit';

// TenantOwner Pages
import TenantSettings from '../pages/tenants/TenantSettings';
import TenantIntegrations from '../pages/tenants/TenantIntegrations';

// Project Pages
import ProjectList from '../pages/projects/ProjectList';
import ProjectCreate from '../pages/projects/ProjectCreate';
import ProjectDetails from '../pages/projects/ProjectDetails';
import ProjectEdit from '../pages/projects/ProjectEdit';
import ProjectMembers from '../pages/projects/ProjectMembers';
import ProjectFiles from '../pages/projects/ProjectFiles';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

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
          <QueryClientProvider client={queryClient}>
            <Notifications position={{ top: 'top', right: 'right' }} />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  {/* Common Routes */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tenants/create" element={<TenantCreate />} />

                  {/* SuperAdmin Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['SUPERADMIN']} />}>
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/tenants" element={<TenantList />} />
                    <Route path="/admin/tenants/create" element={<TenantCreate />} />
                    <Route path="/admin/tenants/:id" element={<TenantDetails />} />
                    <Route path="/admin/tenants/:id/edit" element={<TenantEdit />} />
                    <Route path="/admin/cloud-providers" element={<CloudProviderList />} />
                    <Route path="/admin/cloud-providers/create" element={<CloudProviderCreate />} />
                    <Route path="/admin/cloud-providers/:id/edit" element={<CloudProviderEdit />} />
                    <Route path="/admin/project-types" element={<ProjectTypeList />} />
                    <Route path="/admin/project-types/create" element={<ProjectTypeCreate />} />
                    <Route path="/admin/project-types/:id/edit" element={<ProjectTypeEdit />} />
                  </Route>

                  {/* TenantOwner Routes */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/tenant/dashboard" element={<Dashboard />} />
                    <Route path="/tenant/settings" element={<TenantSettings />} />
                    <Route path="/tenant/integrations" element={<TenantIntegrations />} />
                  </Route>

                  {/* Project Routes */}
                  <Route path="/projects" element={<ProjectList />} />
                  
                  {/* Project Create - Only TenantOwner can create projects */}
                  <Route element={<ProtectedRoute requiredRoles={['TENANT_OWNER']} />}>
                    <Route path="/projects/create" element={<ProjectCreate />} />
                  </Route>
                  
                  {/* Project Details - Any project member can view */}
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                  
                  {/* Project Edit - Only Project Owner and Deputy can edit */}
                  <Route path="/projects/:id/edit" element={<ProjectEdit />} />
                  
                  {/* Project Members - Only Project Owner can manage members */}
                  <Route path="/projects/:id/members" element={<ProjectMembers />} />
                  
                  {/* Project Files - Any project member can view */}
                  <Route path="/projects/:id/files" element={<ProjectFiles />} />
                  <Route path="/projects/:id/files/*" element={<ProjectFiles />} />
                </Route>
              </Route>

              {/* Not Found Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </QueryClientProvider>
        </AuthProvider>
      </Auth0Provider>
    </BrowserRouter>
  );
};

export default AppRouter;