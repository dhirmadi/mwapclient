import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/layout';
import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { LoadingSpinner } from '../components/common';

// SuperAdmin Dashboard Component
const SuperAdminDashboard: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Super Admin Dashboard"
        description="Manage the MWAP platform"
      />

      <div className="mt-6">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} gap="lg">
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/admin/tenants">
            <Title order={3} mb="md">Tenants</Title>
            <Text c="dimmed">Manage platform tenants</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/admin/cloud-providers">
            <Title order={3} mb="md">Cloud Providers</Title>
            <Text c="dimmed">Configure cloud provider integrations</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/admin/project-types">
            <Title order={3} mb="md">Project Types</Title>
            <Text c="dimmed">Manage available project templates</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/admin/api-test">
            <Title order={3} mb="md">API Test Console</Title>
            <Text c="dimmed">Run API tests and view results</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/profile">
            <Title order={3} mb="md">Profile</Title>
            <Text c="dimmed">Manage your account settings</Text>
          </Card>
        </SimpleGrid>
      </div>
    </div>
  );
};

// TenantOwner Dashboard Component
const TenantOwnerDashboard: React.FC = () => {
  const { user, roles } = useAuth();
  
  return (
    <div>
      <PageHeader
        title={`Tenant Dashboard: ${roles?.tenantId || ''}`}
        description="Manage your organization's projects and integrations"
      />

      <div className="mt-6">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} gap="lg">
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/projects">
            <Title order={3} mb="md">Projects</Title>
            <Text c="dimmed">Manage your organization's projects</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/tenant/settings">
            <Title order={3} mb="md">Tenant Settings</Title>
            <Text c="dimmed">Configure your organization settings</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/tenant/integrations">
            <Title order={3} mb="md">Cloud Integrations</Title>
            <Text c="dimmed">Manage cloud provider connections</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/profile">
            <Title order={3} mb="md">Profile</Title>
            <Text c="dimmed">Manage your account settings</Text>
          </Card>
        </SimpleGrid>
      </div>
    </div>
  );
};

// ProjectMember Dashboard Component
const ProjectMemberDashboard: React.FC = () => {
  const { user, roles } = useAuth();
  
  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name || 'User'}`}
        description="Access your projects"
      />

      <div className="mt-6">
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} gap="lg">
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/projects">
            <Title order={3} mb="md">My Projects</Title>
            <Text c="dimmed">View and access your projects</Text>
          </Card>
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/profile">
            <Title order={3} mb="md">Profile</Title>
            <Text c="dimmed">Manage your account settings</Text>
          </Card>
        </SimpleGrid>
      </div>
    </div>
  );
};

// Main Dashboard Component - Redirects based on role
const Dashboard: React.FC = () => {
  const { isLoading, isSuperAdmin, isTenantOwner } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isSuperAdmin) {
        navigate('/admin/dashboard');
      } else if (isTenantOwner) {
        navigate('/tenant/dashboard');
      } else {
        navigate('/projects');
      }
    }
  }, [isLoading, isSuperAdmin, isTenantOwner, navigate]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Render appropriate dashboard based on role
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  } else if (isTenantOwner) {
    return <TenantOwnerDashboard />;
  } else {
    return <ProjectMemberDashboard />;
  }
};

export default Dashboard;