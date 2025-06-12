import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserRole } from '@/types';
import ProtectedRoute from './ProtectedRoute';
import { MainLayout } from '@/components/layout';

// Lazy load pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Login = React.lazy(() => import('@/pages/Login'));
const Unauthorized = React.lazy(() => import('@/pages/Unauthorized'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Profile = React.lazy(() => import('@/pages/Profile'));

// Tenant pages
const TenantList = React.lazy(() => import('@/pages/tenants/TenantList'));
const TenantDetails = React.lazy(() => import('@/pages/tenants/TenantDetails'));
const TenantCreate = React.lazy(() => import('@/pages/tenants/TenantCreate'));
const TenantEdit = React.lazy(() => import('@/pages/tenants/TenantEdit'));

// Project pages
const ProjectList = React.lazy(() => import('@/pages/projects/ProjectList'));
const ProjectDetails = React.lazy(() => import('@/pages/projects/ProjectDetails'));
const ProjectCreate = React.lazy(() => import('@/pages/projects/ProjectCreate'));
const ProjectEdit = React.lazy(() => import('@/pages/projects/ProjectEdit'));

// Cloud Provider pages
const CloudProviderList = React.lazy(() => import('@/pages/cloud-providers/CloudProviderList'));
const CloudProviderCreate = React.lazy(() => import('@/pages/cloud-providers/CloudProviderCreate'));
const CloudProviderEdit = React.lazy(() => import('@/pages/cloud-providers/CloudProviderEdit'));

// Project Type pages
const ProjectTypeList = React.lazy(() => import('@/pages/project-types/ProjectTypeList'));
const ProjectTypeCreate = React.lazy(() => import('@/pages/project-types/ProjectTypeCreate'));
const ProjectTypeEdit = React.lazy(() => import('@/pages/project-types/ProjectTypeEdit'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <React.Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout><Outlet /></MainLayout>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />

              {/* Super Admin routes */}
              <Route element={<ProtectedRoute requiredRoles={[UserRole.SUPER_ADMIN]} />}>
                <Route path="/tenants" element={<TenantList />} />
                <Route path="/tenants/create" element={<TenantCreate />} />
                <Route path="/tenants/:id" element={<TenantDetails />} />
                <Route path="/tenants/:id/edit" element={<TenantEdit />} />

                <Route path="/cloud-providers" element={<CloudProviderList />} />
                <Route path="/cloud-providers/create" element={<CloudProviderCreate />} />
                <Route path="/cloud-providers/:id/edit" element={<CloudProviderEdit />} />

                <Route path="/project-types" element={<ProjectTypeList />} />
                <Route path="/project-types/create" element={<ProjectTypeCreate />} />
                <Route path="/project-types/:id/edit" element={<ProjectTypeEdit />} />
              </Route>

              {/* Tenant Owner/Admin routes */}
              <Route 
                element={
                  <ProtectedRoute 
                    requiredRoles={[
                      UserRole.TENANT_OWNER, 
                      UserRole.TENANT_ADMIN, 
                      UserRole.PROJECT_ADMIN, 
                      UserRole.PROJECT_MEMBER
                    ]} 
                  />
                }
              >
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/create" element={<ProjectCreate />} />
                <Route path="/projects/:id" element={<ProjectDetails />} />
                <Route path="/projects/:id/edit" element={<ProjectEdit />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback routes */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </React.Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;