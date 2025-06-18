import React, { useState } from 'react';
import { Tabs, Title, Text, Paper, Group, Button, Card, Badge, ActionIcon, Tooltip, Breadcrumbs } from '@mantine/core';
import { Link, useNavigate } from 'react-router-dom';
import { IconFolder, IconCloud, IconPlus, IconEdit, IconTrash, IconEye, IconArrowLeft } from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay, EmptyState } from '../../components/common';
import { useAuth } from '../../context/AuthContext';
import { useTenants } from '../../hooks/useTenants';
import { useProjects } from '../../hooks/useProjects';
import useProjectAccess from '../../hooks/useProjectAccess';
import TenantIntegrations from './TenantIntegrations';

const TenantManagement: React.FC = () => {
  const navigate = useNavigate();
  const { roles, isTenantOwner } = useAuth();
  const { currentTenant, isLoadingCurrentTenant } = useTenants();
  const { projects, isLoading: isLoadingProjects, error: projectsError } = useProjects();
  const { getUserRole } = useProjectAccess();
  const [activeTab, setActiveTab] = useState<string | null>('projects');

  if (isLoadingCurrentTenant || isLoadingProjects) {
    return <LoadingSpinner size="xl" text="Loading tenant data..." />;
  }

  if (!currentTenant) {
    return (
      <ErrorDisplay 
        title="No Tenant Found" 
        message="You don't have access to any tenant. Please contact your administrator." 
      />
    );
  }

  if (projectsError) {
    return <ErrorDisplay error={projectsError} />;
  }

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleViewProject = (id: string) => {
    navigate(`/projects/${id}`);
  };

  const handleEditProject = (id: string) => {
    navigate(`/projects/${id}/edit`);
  };

  return (
    <div>
      <Breadcrumbs 
        items={[
          { title: 'Dashboard', href: '/' },
          { title: 'Tenant Management' }
        ]}
      />
      
      <Group mb="md">
        <Button 
          component={Link} 
          to="/" 
          variant="subtle" 
          leftSection={<IconArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </Group>
      
      <PageHeader
        title="Tenant Management"
        description={`Manage your tenant: ${currentTenant.name}`}
      />

      <Tabs value={activeTab} onChange={setActiveTab} mt="md">
        <Tabs.List>
          <Tabs.Tab value="projects" leftSection={<IconFolder size={16} />}>
            Projects
          </Tabs.Tab>
          <Tabs.Tab value="integrations" leftSection={<IconCloud size={16} />}>
            Cloud Integrations
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="projects" pt="xl">
          <Group justify="flex-end" mb="md">
            {isTenantOwner && (
              <Button 
                leftSection={<IconPlus size={16} />} 
                onClick={handleCreateProject}
              >
                Create Project
              </Button>
            )}
          </Group>

          {!projects || projects.length === 0 ? (
            <EmptyState
              title="No projects found"
              description="Get started by creating your first project"
              actionText={isTenantOwner ? "Create Project" : undefined}
              onAction={isTenantOwner ? handleCreateProject : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card key={project.id} withBorder shadow="sm" radius="md" p="md">
                  <Card.Section p="md" withBorder>
                    <Group justify="space-between">
                      <Title order={4}>{project.name}</Title>
                      <Badge
                        color={project.status === 'ACTIVE' ? 'green' : 
                              project.status === 'ARCHIVED' ? 'gray' : 
                              project.status === 'PENDING' ? 'yellow' : 'red'}
                      >
                        {project.status}
                      </Badge>
                    </Group>
                  </Card.Section>
                  
                  <Text mt="md" mb="md" size="sm" c="dimmed">
                    {project.description || 'No description provided'}
                  </Text>
                  
                  <Group mt="md" justify="space-between">
                    <Badge 
                      color={getUserRole(project) === 'ADMIN' ? 'blue' : 'green'}
                    >
                      {getUserRole(project)}
                    </Badge>
                    
                    <Group gap="xs">
                      <Tooltip label="View project">
                        <ActionIcon
                          color="blue"
                          onClick={() => handleViewProject(project.id)}
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                      </Tooltip>
                      
                      {/* Only show edit button for ADMIN role */}
                      {getUserRole(project) === 'ADMIN' && (
                        <Tooltip label="Edit project">
                          <ActionIcon
                            color="yellow"
                            onClick={() => handleEditProject(project.id)}
                          >
                            <IconEdit size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                      
                      {/* Only show delete button for ADMIN role */}
                      {getUserRole(project) === 'ADMIN' && (
                        <Tooltip label="Delete project">
                          <ActionIcon
                            color="red"
                            disabled
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </Group>
                  </Group>
                </Card>
              ))}
            </div>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="integrations" pt="xl">
          <TenantIntegrations />
        </Tabs.Panel>
      </Tabs>
    </div>
  );
};

export default TenantManagement;