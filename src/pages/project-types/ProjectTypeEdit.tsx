import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from '@mantine/form';
import { 
  TextInput, 
  Textarea, 
  Switch, 
  Button, 
  Paper, 
  Title, 
  Group, 
  LoadingOverlay, 
  Tabs, 
  Code, 
  Alert 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { PageHeader } from '../../../../components/layout';
import { useProjectTypes } from '../../../../hooks/useProjectTypes';
import { ProjectType, ProjectTypeUpdate } from '../../../../types/project-type';
import { LoadingSpinner } from '../../../../components/common';

const ProjectTypeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProjectType, updateProjectType, isUpdating } = useProjectTypes();
  const { data: projectType, isLoading, error } = useProjectType(id);
  
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Form for project type editing
  const form = useForm<ProjectTypeUpdate>({
    initialValues: {
      name: '',
      description: '',
      configSchema: {},
      isActive: true,
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>('{}');

  // Load project type data
  useEffect(() => {
    if (projectType) {
      form.setValues({
        name: projectType.name,
        description: projectType.description,
        configSchema: projectType.configSchema,
        isActive: projectType.isActive,
      });
      
      // Set schema JSON
      setSchemaJson(JSON.stringify(projectType.configSchema || {}, null, 2));
    }
  }, [projectType]);

  // Handle schema changes
  const handleSchemaChange = (value: string) => {
    setSchemaJson(value);
    setSchemaError(null);
    
    try {
      const parsed = JSON.parse(value);
      form.setFieldValue('configSchema', parsed);
    } catch (error) {
      if (error instanceof Error) {
        setSchemaError(error.message);
      } else {
        setSchemaError('Invalid JSON');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (values: ProjectTypeUpdate) => {
    if (!id) return;
    
    try {
      // Validate schema JSON
      if (schemaError) {
        notifications.show({
          title: 'Error',
          message: 'Please fix the schema errors before submitting',
          color: 'red',
        });
        setActiveTab('schema');
        return;
      }
      
      // Update project type
      await updateProjectType({ id, data: values });
      
      notifications.show({
        title: 'Success',
        message: 'Project type updated successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Navigate back to list
      navigate('/admin/project-types');
    } catch (error) {
      console.error('Failed to update project type:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update project type',
        color: 'red',
      });
    }
  };

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Error"
          description="Failed to load project type"
        />
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mt="md"
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
        <Group mt="xl">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Project Types
          </Button>
        </Group>
      </div>
    );
  }

  if (!projectType) {
    return (
      <div>
        <PageHeader
          title="Project Type Not Found"
          description="The requested project type could not be found"
        />
        <Group mt="md">
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
          >
            Back to Project Types
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Edit Project Type: ${projectType.name}`}
        description={`Project Type ID: ${projectType._id}`}
      />

      <Group justify="flex-start" mb="md">
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Project Types
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isUpdating} />
        
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List mb="md">
              <Tabs.Tab value="general">General Information</Tabs.Tab>
              <Tabs.Tab value="schema">Configuration Schema</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="general">
              <Title order={3} mb="md">General Information</Title>
              
              <TextInput
                label="Name"
                placeholder="Enter project type name"
                required
                mb="md"
                {...form.getInputProps('name')}
              />
              
              <Textarea
                label="Description"
                placeholder="Enter project type description"
                minRows={3}
                mb="md"
                {...form.getInputProps('description')}
              />
              
              <Switch
                label="Active"
                description="Inactive project types cannot be used for new projects"
                checked={form.values.isActive}
                mb="xl"
                {...form.getInputProps('isActive', { type: 'checkbox' })}
              />
            </Tabs.Panel>

            <Tabs.Panel value="schema">
              <Title order={3} mb="md">Configuration Schema</Title>
              
              <Alert 
                icon={<IconAlertCircle size={16} />} 
                title="JSON Schema" 
                color="blue" 
                mb="md"
              >
                Define the configuration schema for this project type using JSON Schema format. 
                This schema will be used to validate project configurations.
              </Alert>
              
              {schemaError && (
                <Alert 
                  icon={<IconAlertCircle size={16} />} 
                  title="Schema Error" 
                  color="red" 
                  mb="md"
                >
                  {schemaError}
                </Alert>
              )}
              
              <Textarea
                placeholder="Enter JSON schema"
                minRows={10}
                value={schemaJson}
                onChange={(e) => handleSchemaChange(e.currentTarget.value)}
                mb="md"
                styles={{ input: { fontFamily: 'monospace' } }}
              />
              
              <Title order={4} mb="md">Schema Preview</Title>
              <Code block mb="xl">
                {schemaError ? 'Invalid JSON' : JSON.stringify(form.values.configSchema, null, 2)}
              </Code>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="xl">
            <Button 
              variant="outline" 
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
              disabled={!!schemaError}
            >
              Save Changes
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default ProjectTypeEdit;