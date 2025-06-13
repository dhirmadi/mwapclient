import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../../hooks';
import { PageHeader } from '../../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../../components/common';
import { Button, Card, Group, Text, Badge, Tabs } from '@mantine/core';
import { IconEdit, IconArrowLeft, IconUsers, IconSettings, IconFiles, IconCloud } from '@tabler/icons-react';

const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id || '');

  const handleBack = () => {
    navigate('/projects');
  };

  const handleEdit = () => {
    navigate(`/projects/${id}/edit`);
  };

  if (isLoading) {
    return <LoadingSpinner size="xl" text="Loading project details..." />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!project) {
    return (
      <div>
        <PageHeader
          title="Project Not Found"
          description="The requested project could not be found"
        >
          <Button leftSection={<IconArrowLeft size={16} />} onClick={handleBack}>
            Back to Projects
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={project.name}
        description={`Project ID: ${project.id}`}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack} className="mr-2">
          Back
        </Button>
        <Button leftSection={<IconEdit size={16} />} onClick={handleEdit}>
          Edit
        </Button>
      </PageHeader>

      <div className="mt-6">
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Group style={{ justifyContent: 'space-between' }} mb="md">
            <div>
              <Text fw={500} size="lg">Project Information</Text>
            </div>
            <Badge color={
              project.status === 'ACTIVE' ? 'green' : 
              project.status === 'ARCHIVED' ? 'gray' : 
              project.status === 'PENDING' ? 'yellow' : 'red'
            }>
              {project.status}
            </Badge>
          </Group>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Text size="sm" color="dimmed">Name</Text>
              <Text>{project.name}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Description</Text>
              <Text>{project.description || 'No description'}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Project Type</Text>
              <Text>{project.projectType?.name || 'Custom'}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Created</Text>
              <Text>{new Date(project.createdAt).toLocaleString()}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Last Updated</Text>
              <Text>{new Date(project.updatedAt).toLocaleString()}</Text>
            </div>
            <div>
              <Text size="sm" color="dimmed">Tenant</Text>
              <Text>{project.tenant?.name || 'Unknown'}</Text>
            </div>
          </div>
        </Card>

        <div className="mt-6">
          <Tabs defaultValue="files">
            <Tabs.List>
              <Tabs.Tab value="files" icon={<IconFiles size={14} />}>Files</Tabs.Tab>
              <Tabs.Tab value="members" icon={<IconUsers size={14} />}>Members</Tabs.Tab>
              <Tabs.Tab value="cloud" icon={<IconCloud size={14} />}>Cloud Resources</Tabs.Tab>
              <Tabs.Tab value="settings" icon={<IconSettings size={14} />}>Settings</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="files" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Project files will be displayed here</Text>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="members" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Project members will be displayed here</Text>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="cloud" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Cloud resources will be displayed here</Text>
              </Card>
            </Tabs.Panel>

            <Tabs.Panel value="settings" pt="xs">
              <Card shadow="sm" p="lg" radius="md" withBorder mt="md">
                <Text>Project settings will be displayed here</Text>
              </Card>
            </Tabs.Panel>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;