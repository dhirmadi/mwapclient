import React from 'react';
import { Routes, Route, Navigate, Outlet, useParams } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '../components/layout';

// Lazy load pages
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const Login = React.lazy(() => import('../pages/Login'));
const Unauthorized = React.lazy(() => import('../pages/Unauthorized'));
const NotFound = React.lazy(() => import('../pages/NotFound'));
const Profile = React.lazy(() => import('../pages/Profile'));

// Admin pages
const TenantList = React.lazy(() => import('../pages/tenants/TenantList'));
const TenantDetails = React.lazy(() => import('../pages/tenants/TenantDetails'));
const TenantCreate = React.lazy(() => import('../pages/tenants/TenantCreate'));
const TenantEdit = React.lazy(() => import('../pages/tenants/TenantEdit'));
const CloudProviderList = React.lazy(() => import('../pages/cloud-providers/CloudProviderList'));
const CloudProviderCreate = React.lazy(() => import('../pages/cloud-providers/CloudProviderCreate'));
const CloudProviderEdit = React.lazy(() => import('../pages/cloud-providers/CloudProviderEdit'));
const ProjectTypeList = React.lazy(() => import('../pages/project-types/ProjectTypeList'));
const ProjectTypeCreate = React.lazy(() => import('../pages/project-types/ProjectTypeCreate'));
const ProjectTypeEdit = React.lazy(() => import('../pages/project-types/ProjectTypeEdit'));

// Tenant pages
const TenantSettings = React.lazy(() => import('../pages/tenants/TenantEdit'));
const IntegrationList = React.lazy(() => import('../pages/tenants/TenantDetails'));

// Project pages
const ProjectList = React.lazy(() => import('../pages/projects/ProjectList'));
const ProjectDetails = React.lazy(() => import('../pages/projects/ProjectDetails'));
const ProjectCreate = React.lazy(() => import('../pages/projects/ProjectCreate'));
const ProjectEdit = React.lazy(() => import('../pages/projects/ProjectEdit'));
const ProjectSettings = React.lazy(() => import('../pages/projects/ProjectEdit'));
const ProjectMembers = React.lazy(() => import('../pages/projects/ProjectDetails'));
const FileExplorer = React.lazy(() => import('../pages/projects/ProjectDetails'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// Project ID parameter wrapper
const ProjectRouteWrapper = ({ children }: { children: React.ReactNode }) => {
  const { id } = useParams<{ id: string }>();
  return <>{React.cloneElement(children as React.ReactElement, { projectId: id })}</>;
};

const AppRouter: React.FC = () => {
  return (
    <React.Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/404" element={<NotFound />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout><Outlet /></MainLayout>}>
            {/* Dashboard route - redirects based on role */}
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* SuperAdmin Routes */}
            <Route element={<ProtectedRoute requireSuperAdmin={true} />}>
              <Route path="/admin/tenants" element={<TenantList />} />
              <Route path="/admin/tenants/:id" element={<TenantDetails />} />
              <Route path="/admin/tenants/create" element={<TenantCreate />} />
              <Route path="/admin/tenants/:id/edit" element={<TenantEdit />} />
              
              <Route path="/admin/cloud-providers" element={<CloudProviderList />} />
              <Route path="/admin/cloud-providers/create" element={<CloudProviderCreate />} />
              <Route path="/admin/cloud-providers/:id/edit" element={<CloudProviderEdit />} />
              
              <Route path="/admin/project-types" element={<ProjectTypeList />} />
              <Route path="/admin/project-types/create" element={<ProjectTypeCreate />} />
              <Route path="/admin/project-types/:id/edit" element={<ProjectTypeEdit />} />
            </Route>

            {/* TenantOwner Routes */}
            <Route element={<ProtectedRoute requireTenantOwner={true} />}>
              <Route path="/tenant/settings" element={<TenantSettings />} />
              <Route path="/tenant/integrations" element={<IntegrationList />} />
              
              <Route path="/projects" element={<ProjectList />} />
              <Route path="/projects/create" element={<ProjectCreate />} />
            </Route>

            {/* Project Routes - require specific project roles */}
            <Route path="/projects/:id" element={
              <ProjectRouteWrapper>
                <ProtectedRoute requireProjectRole="MEMBER" />
              </ProjectRouteWrapper>
            }>
              <Route index element={<ProjectDetails />} />
              <Route path="files" element={<FileExplorer />} />
            </Route>

            <Route path="/projects/:id/settings" element={
              <ProjectRouteWrapper>
                <ProtectedRoute requireProjectRole="DEPUTY" />
              </ProjectRouteWrapper>
            }>
              <Route index element={<ProjectSettings />} />
            </Route>

            <Route path="/projects/:id/members" element={
              <ProjectRouteWrapper>
                <ProtectedRoute requireProjectRole="OWNER" />
              </ProjectRouteWrapper>
            }>
              <Route index element={<ProjectMembers />} />
            </Route>

            <Route path="/projects/:id/edit" element={
              <ProjectRouteWrapper>
                <ProtectedRoute requireProjectRole="DEPUTY" />
              </ProjectRouteWrapper>
            }>
              <Route index element={<ProjectEdit />} />
            </Route>
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRouter;