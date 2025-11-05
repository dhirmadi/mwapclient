import React from 'react';
import { Title, Paper, Stepper, Button, Group, Stack, Text } from '@mantine/core';
import ProjectForm, { ProjectFormValues } from '../components/ProjectForm';
import FolderBrowserModal from '../../integrations/components/FolderBrowserModal';
import useProjects from '../hooks/useProjects';
import { useAuth } from '@/core/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProjectCreatePage: React.FC = () => {
  const { createProject } = useProjects();
  const { currentTenant } = useAuth();
  const navigate = useNavigate();
  const [active, setActive] = React.useState(0);

  const [formValues, setFormValues] = React.useState<ProjectFormValues>({
    name: '',
    description: '',
    projectTypeId: '',
    integrationId: '',
  });

  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  const [browserOpen, setBrowserOpen] = React.useState(false);

  const canNext = () => {
    if (active === 0) return !!formValues.name && !!formValues.projectTypeId && !!formValues.integrationId;
    if (active === 1) return !!selectedFolder;
    return true;
  };

  const handleCreate = () => {
    // Align with current backend schema in api-reference.md
    // {
    //   tenantId, projectTypeId, cloudIntegrationId, folderpath, name, description?, archived?, members?
    // }
    if (!currentTenant) return;
    createProject({
      tenantId: currentTenant,
      projectTypeId: formValues.projectTypeId,
      cloudIntegrationId: formValues.integrationId,
      folderpath: selectedFolder,
      name: formValues.name,
      description: formValues.description,
      members: [],
    } as any, {
      onSuccess: (created: any) => {
        if (created?._id) navigate(`/projects/${created._id}`);
      },
    });
  };

  return (
    <div>
      <Title order={2} mb="md">Create Project</Title>
      <Paper withBorder p="md" radius="md">
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false} mb="md">
          <Stepper.Step label="Basic Info" description="Name, description, type & integration" />
          <Stepper.Step label="Select Folder" description="Browse provider folders" />
          <Stepper.Completed>Review & Create</Stepper.Completed>
        </Stepper>

        {active === 0 && (
          <ProjectForm values={formValues} onChange={setFormValues} />
        )}

        {active === 1 && (
          <>
            <Group gap="xs" mb="sm">
              <Button variant="light" onClick={() => setBrowserOpen(true)} disabled={!formValues.integrationId}>
                Browse Folders...
              </Button>
              <Text size="sm">{selectedFolder || 'No folder selected'}</Text>
            </Group>
            <FolderBrowserModal
              opened={browserOpen}
              onClose={() => setBrowserOpen(false)}
              integrationId={formValues.integrationId}
              initialPath={'/'}
              onConfirm={(path) => setSelectedFolder(path)}
            />
          </>
        )}

        {active === 2 && (
          <Stack gap="xs">
            <div><strong>Name:</strong> {formValues.name}</div>
            <div><strong>Type:</strong> {formValues.projectTypeId}</div>
            <div><strong>Integration:</strong> {formValues.integrationId}</div>
            <div><strong>Folder:</strong> {selectedFolder}</div>
          </Stack>
        )}

        <Group justify="space-between" mt="lg">
          <Button variant="default" onClick={() => setActive((v) => Math.max(0, v - 1))} disabled={active === 0}>Back</Button>
          {active < 2 ? (
            <Button onClick={() => canNext() && setActive((v) => v + 1)} disabled={!canNext()}>Next</Button>
          ) : (
            <Button onClick={handleCreate}>Create Project</Button>
          )}
        </Group>
      </Paper>
    </div>
  );
};

export default ProjectCreatePage;