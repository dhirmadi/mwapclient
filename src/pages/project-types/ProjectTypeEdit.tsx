import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectType, useUpdateProjectType } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { LoadingSpinner, ErrorDisplay } from '@/components/common';
import { Button, TextInput, Textarea, Switch, Card, Group } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';

const projectTypeSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  templateData: z.object({
    repositoryUrl: z.string().url('Must be a valid URL').optional(),
    configSchema: z.string().optional(),
  }).optional(),
  active: z.boolean(),
});

type ProjectTypeFormValues = z.infer<typeof projectTypeSchema>;

const ProjectTypeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: projectType, isLoading: isFetching, error: fetchError } = useProjectType(id || '');
  const { mutate, isLoading: isUpdating, error: updateError } = useUpdateProjectType(id || '');

  const form = useForm<ProjectTypeFormValues>({
    initialValues: {
      name: '',
      description: '',
      templateData: {
        repositoryUrl: '',
        configSchema: '',
      },
      active: true,
    },
    validate: zodResolver(projectTypeSchema),
  });

  useEffect(() => {
    if (projectType) {
      form.setValues({
        name: projectType.name,
        description: projectType.description || '',
        templateData: {
          repositoryUrl: projectType.templateData?.repositoryUrl || '',
          configSchema: projectType.templateData?.configSchema || '',
        },
        active: projectType.active,
      });
    }
  }, [projectType]);

  const handleSubmit = (values: ProjectTypeFormValues) => {
    mutate(values, {
      onSuccess: () => {
        navigate('/project-types');
      },
    });
  };

  const handleBack = () => {
    navigate('/project-types');
  };

  if (isFetching) {
    return <LoadingSpinner size="xl" text="Loading project type..." />;
  }

  const error = fetchError || updateError;

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!projectType) {
    return (
      <div>
        <PageHeader
          title="Project Type Not Found"
          description="The requested project type could not be found"
        >
          <Button leftIcon={<IconArrowLeft size={16} />} onClick={() => navigate('/project-types')}>
            Back to Project Types
          </Button>
        </PageHeader>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Project Type: ${projectType.name}`}
        description={`Project Type ID: ${projectType.id}`}
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Project Type Name"
            placeholder="Enter project type name"
            required
            {...form.getInputProps('name')}
            className="mb-4"
          />

          <Textarea
            label="Description"
            placeholder="Enter project type description"
            {...form.getInputProps('description')}
            className="mb-4"
          />

          <TextInput
            label="Repository URL"
            placeholder="Enter template repository URL"
            {...form.getInputProps('templateData.repositoryUrl')}
            className="mb-4"
          />

          <Textarea
            label="Configuration Schema"
            placeholder="Enter JSON schema for configuration"
            minRows={5}
            {...form.getInputProps('templateData.configSchema')}
            className="mb-4"
          />

          <Switch
            label="Active"
            {...form.getInputProps('active', { type: 'checkbox' })}
            className="mb-6"
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

export default ProjectTypeEdit;