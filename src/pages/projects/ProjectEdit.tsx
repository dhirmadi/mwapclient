import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject, useProjectTypes } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { LoadingSpinner, ErrorDisplay } from '../../components/common';
import { Button, TextInput, Textarea, Select, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  projectTypeId: z.string().optional(),
  status: z.enum(['ACTIVE', 'ARCHIVED', 'PENDING', 'FAILED']),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: isFetching, error: fetchError } = useProject(id || '');
  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateProject(id || '');
  const { data: projectTypes, isLoading: isLoadingTypes, error: typesError } = useProjectTypes();

  const form = useForm<ProjectFormValues>({
    initialValues: {
      name: '',
      description: '',
      projectTypeId: undefined,
      status: 'ACTIVE',
    },
    validate: zodResolver(projectSchema),
  });

  useEffect(() => {
    if (project) {
      form.setValues({
        name: project.name,
        description: project.description || '',
        projectTypeId: project.projectTypeId,
        status: project.status,
      });
    }
  }, [project]);

  const handleSubmit = (values: ProjectFormValues) => {
    mutate(values, {
      onSuccess: () => {
        navigate(`/projects/${id}`);
      },
    });
  };

  const handleBack = () => {
    navigate(`/projects/${id}`);
  };

  if (isFetching || isLoadingTypes) {
    return <LoadingSpinner size="xl" text="Loading project..." />;
  }

  const error = fetchError || updateError || typesError;

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
          <Button leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Project: ${project.name}`}
        description={`Project ID: ${project.id}`}
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Project Name"
            placeholder="Enter project name"
            required
            {...form.getInputProps('name')}
            className="mb-4"
          />

          <Textarea
            label="Description"
            placeholder="Enter project description"
            {...form.getInputProps('description')}
            className="mb-4"
          />

          <Select
            label="Project Type"
            placeholder="Select a project type"
            data={projectTypes?.map(type => ({ value: type.id, label: type.name })) || []}
            {...form.getInputProps('projectTypeId')}
            className="mb-4"
            clearable
          />

          <Select
            label="Status"
            placeholder="Select status"
            data={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ARCHIVED', label: 'Archived' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'FAILED', label: 'Failed' },
            ]}
            {...form.getInputProps('status')}
            className="mb-6"
          />

          <Group style={{ justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default ProjectEdit;