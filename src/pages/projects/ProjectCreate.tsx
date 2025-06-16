import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProject, useProjectTypes } from '../../hooks';
import { PageHeader } from '../../components/layout';
import { ErrorDisplay, LoadingSpinner } from '../../components/common';
import { Button, TextInput, Textarea, Select, Card, Group, Alert, Text } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { IconArrowLeft, IconDeviceFloppy, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().optional(),
  projectTypeId: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

const ProjectCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createProject, isCreating, error: createError } = useCreateProject();
  const { projectTypes, isLoading: isLoadingTypes, error: typesError } = useProjectTypes();
  const { roles, isTenantOwner } = useAuth();
  const [hasTenant, setHasTenant] = useState<boolean>(false);
  const [isCheckingTenant, setIsCheckingTenant] = useState<boolean>(true);
  const [tenantError, setTenantError] = useState<string | null>(null);

  // Check if user has a tenant
  useEffect(() => {
    const checkTenant = async () => {
      try {
        setIsCheckingTenant(true);
        // If user is a tenant owner, they should have a tenant
        if (isTenantOwner && roles?.tenantId) {
          setHasTenant(true);
        } else {
          // Try to fetch the user's tenant
          try {
            const tenant = await api.fetchTenant();
            setHasTenant(!!tenant);
          } catch (error) {
            console.error('Error fetching tenant:', error);
            setHasTenant(false);
          }
        }
      } catch (error) {
        console.error('Error checking tenant:', error);
        setTenantError('Failed to check if you have a tenant. Please try again.');
      } finally {
        setIsCheckingTenant(false);
      }
    };

    checkTenant();
  }, [isTenantOwner, roles]);

  const form = useForm<ProjectFormValues>({
    initialValues: {
      name: '',
      description: '',
      projectTypeId: undefined,
    },
    validate: zodResolver(projectSchema),
  });

  const handleSubmit = (values: ProjectFormValues) => {
    if (!hasTenant) {
      setTenantError('You need to have a tenant to create a project.');
      return;
    }

    createProject(values, {
      onSuccess: () => {
        navigate('/projects');
      },
    });
  };

  const handleBack = () => {
    navigate('/projects');
  };

  const handleCreateTenant = () => {
    navigate('/tenants/create');
  };

  if (isCheckingTenant || isLoadingTypes) {
    return <LoadingSpinner size="xl" text="Loading..." />;
  }

  const error = createError || typesError || tenantError;

  return (
    <div>
      <PageHeader
        title="Create Project"
        description="Add a new project"
      >
        <Button leftSection={<IconArrowLeft size={16} />} variant="outline" onClick={handleBack}>
          Back
        </Button>
      </PageHeader>

      {error && <ErrorDisplay error={error} className="mt-4" />}

      {!hasTenant ? (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="No Tenant Found" 
          color="red" 
          className="mt-6"
        >
          <Text mb="md">You need to have a tenant to create a project. Please create a tenant first.</Text>
          <Button onClick={handleCreateTenant} color="red">
            Create Tenant
          </Button>
        </Alert>
      ) : (
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
              data={Array.isArray(projectTypes) ? projectTypes.map((type: any) => ({ value: type._id, label: type.name })) : []}
              {...form.getInputProps('projectTypeId')}
              className="mb-6"
              clearable
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
                loading={isCreating}
                disabled={!hasTenant}
              >
                Save
              </Button>
            </Group>
          </form>
        </Card>
      )}
    </div>
  );
};

export default ProjectCreate;