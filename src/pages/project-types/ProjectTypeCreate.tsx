import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProjectType } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { ErrorDisplay } from '@/components/common';
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
  active: z.boolean().default(true),
});

type ProjectTypeFormValues = z.infer<typeof projectTypeSchema>;

const ProjectTypeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { mutate, isLoading, error } = useCreateProjectType();

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

  return (
    <div>
      <PageHeader
        title="Create Project Type"
        description="Add a new project template"
      >
        <Button leftIcon={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {error && <ErrorDisplay error={error} className="mt-4" />}

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
              loading={isLoading}
            >
              Save
            </Button>
          </Group>
        </form>
      </Card>
    </div>
  );
};

export default ProjectTypeCreate;