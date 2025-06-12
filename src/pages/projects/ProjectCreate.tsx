import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject, useProjectTypes } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { ErrorDisplay, LoadingSpinner } from '@/components/common';
import { Button, TextInput, Textarea, Select, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  projectTypeId: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, isLoading: isCreating, error: createError } = useCreateProject();
  const { data: projectTypes, isLoading: isLoadingTypes, error: typesError } = useProjectTypes();

  const form = useForm<ProjectFormValues>({
    initialValues: {
      name: '',
      description: '',
      projectTypeId: undefined,
    },
    validate: zodResolver(projectSchema),
  });

  const handleSubmit = (values: ProjectFormValues) => {
    mutate(values, {
      onSuccess: () => {
        navigate('/projects');
      },
    });
  };

  const handleBack = () => {
    navigate('/projects');
  };

  if (isLoadingTypes) {
    return <LoadingSpinner size="xl" text="Loading project types..." />;
  }

  const error = createError || typesError;

  return (
    <div>
      <PageHeader
        title="Create Project"
        description="Add a new project"
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {error && <ErrorDisplay error={error} className="mt-4" />}

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
            className="mb-6"
            clearable
          />

          <Group position="right">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              leftIcon={<IconDeviceFloppy size={16} />}
              loading={isCreating}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default ProjectCreate;