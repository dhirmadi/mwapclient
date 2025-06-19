import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Notifications } from '@mantine/notifications';
import { AuthProvider } from '../context/OptimizedAuthContext';
import OptimizedProtectedRoute from './OptimizedProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import { Permission } from '../utils/permissions';

// Pages
import Home from '../pages/Home';
import OptimizedLogin from '../pages/OptimizedLogin';
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
import TenantManagement from '../pages/tenants/TenantManagement';

// Project Pages
import ProjectList from '../pages/projects/ProjectList';
import ProjectCreate from '../pages/projects/ProjectCreate';
import ProjectDetails from '../pages/projects/ProjectDetails';
import ProjectEdit from '../pages/projects/ProjectEdit';
import ProjectMembers from '../pages/projects/ProjectMembers';
import ProjectFiles from '../pages/projects/ProjectFiles';

/**
 * OptimizedAppRouter component
 * 
 * This component provides the application routing with optimized authentication
 * and permission checks to prevent unnecessary API calls and UI flashing.
 */
const OptimizedAppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN || ''}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || ''}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE,
        }}
        cacheLocation="localstorage"
      >
        <AuthProvider>
          <Notifications position="top-right" zIndex={1000} />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<OptimizedLogin />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<OptimizedProtectedRoute />}>
              <Route element={<MainLayout />}>
                {/* Common Routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tenants/create" element={<TenantCreate />} />

                {/* Tenant Routes - Accessible to all authenticated users */}
                <Route path="/admin/tenants/:id" element={<TenantDetails />} />
                <Route path="/admin/tenants/:id/edit" element={<TenantEdit />} />

                {/* SuperAdmin Routes - Using Permission System */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.MANAGE_TENANTS, Permission.MANAGE_CLOUD_PROVIDERS, Permission.MANAGE_PROJECT_TYPES]} />}>
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/tenants" element={<TenantList />} />
                  <Route path="/admin/tenants/create" element={<TenantCreate />} />
                  <Route path="/admin/cloud-providers" element={<CloudProviderList />} />
                  <Route path="/admin/cloud-providers/create" element={<CloudProviderCreate />} />
                  <Route path="/admin/cloud-providers/:id/edit" element={<CloudProviderEdit />} />
                  <Route path="/admin/project-types" element={<ProjectTypeList />} />
                  <Route path="/admin/project-types/create" element={<ProjectTypeCreate />} />
                  <Route path="/admin/project-types/:id/edit" element={<ProjectTypeEdit />} />
                  <Route path="/admin/projects" element={<ProjectList />} />
                </Route>

                {/* TenantOwner Routes - Using Permission System */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.MANAGE_TENANT_SETTINGS]} />}>
                  <Route path="/tenant/dashboard" element={<Dashboard />} />
                  <Route path="/tenant/settings" element={<TenantSettings />} />
                  <Route path="/tenant/management" element={<TenantManagement />} />
                </Route>
                
                {/* Tenant Integrations - Specific permission */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.MANAGE_TENANT_INTEGRATIONS]} />}>
                  <Route path="/tenant/integrations" element={<TenantIntegrations />} />
                </Route>

                {/* Project Routes - All authenticated users can view projects list */}
                <Route path="/projects" element={<ProjectList />} />
                
                {/* Project Create - Only users with CREATE_PROJECTS permission */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.CREATE_PROJECTS]} />}>
                  <Route path="/projects/create" element={<ProjectCreate />} />
                </Route>
                
                {/* Project Details - Any project member can view */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.VIEW_PROJECT]} projectIdParam="id" />}>
                  <Route path="/projects/:id" element={<ProjectDetails />} />
                </Route>
                
                {/* Project Edit - Only users with EDIT_PROJECT permission */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.EDIT_PROJECT]} projectIdParam="id" />}>
                  <Route path="/projects/:id/edit" element={<ProjectEdit />} />
                </Route>
                
                {/* Project Members - Only users with MANAGE_PROJECT_MEMBERS permission */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.MANAGE_PROJECT_MEMBERS]} projectIdParam="id" />}>
                  <Route path="/projects/:id/members" element={<ProjectMembers />} />
                </Route>
                
                {/* Project Files - Any project member can view */}
                <Route element={<OptimizedProtectedRoute requiredPermissions={[Permission.VIEW_PROJECT]} projectIdParam="id" />}>
                  <Route path="/projects/:id/files" element={<ProjectFiles />} />
                  <Route path="/projects/:id/files/*" element={<ProjectFiles />} />
                </Route>
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

export default OptimizedAppRouter;