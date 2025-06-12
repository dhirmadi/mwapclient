import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { PageHeader } from '@/components/layout';
import { Card, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, hasRole } = useAuth();

  const isSuperAdmin = hasRole(UserRole.SUPER_ADMIN);
  const isTenantUser = hasRole([UserRole.TENANT_OWNER, UserRole.TENANT_ADMIN]);
  const isProjectUser = hasRole([UserRole.PROJECT_ADMIN, UserRole.PROJECT_MEMBER]);

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.firstName || 'User'}!`}
        description="Modular Web Application Platform Dashboard"
      />

      <div className="mt-6">
        <SimpleGrid cols={3} spacing="lg" breakpoints={[
          { maxWidth: 'md', cols: 2, spacing: 'md' },
          { maxWidth: 'sm', cols: 1, spacing: 'sm' },
        ]}>
          {isSuperAdmin && (
            <>
              <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/tenants">
                <Title order={3} mb="md">Tenants</Title>
                <Text color="dimmed">Manage platform tenants</Text>
              </Card>
              
              <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/cloud-providers">
                <Title order={3} mb="md">Cloud Providers</Title>
                <Text color="dimmed">Configure cloud provider integrations</Text>
              </Card>
              
              <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/project-types">
                <Title order={3} mb="md">Project Types</Title>
                <Text color="dimmed">Manage available project templates</Text>
              </Card>
            </>
          )}
          
          {(isTenantUser || isProjectUser) && (
            <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/projects">
              <Title order={3} mb="md">Projects</Title>
              <Text color="dimmed">View and manage your projects</Text>
            </Card>
          )}
          
          <Card shadow="sm" p="lg" radius="md" withBorder component={Link} to="/profile">
            <Title order={3} mb="md">Profile</Title>
            <Text color="dimmed">Manage your account settings</Text>
          </Card>
        </SimpleGrid>
      </div>
    </div>
  );
};

export default Dashboard;