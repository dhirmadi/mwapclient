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
  Alert,
  Stack,
  Divider,
  Skeleton,
  Text
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconInfoCircle,
  IconRefresh
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import { ProjectType, ProjectTypeUpdate } from '../../types/project-type';
import { LoadingSpinner } from '../../components/common';

const DEFAULT_CONFIG_SCHEMA = {
  inputFolder: "string",
  outputFolder: "string"
};

const ProjectTypeEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProjectType, updateProjectType, isUpdating, updateError } = useProjectTypes();
  const { data: projectType, isLoading, error, refetch } = useProjectType(id);
  
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Form for project type editing
  const form = useForm<ProjectTypeUpdate>({
    initialValues: {
      name: '',
      description: 'Flat config for testing',
      configSchema: DEFAULT_CONFIG_SCHEMA,
      isActive: true,
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>(JSON.stringify(DEFAULT_CONFIG_SCHEMA, null, 2));

  // Load project type data
  useEffect(() => {
    if (projectType) {
      form.setValues({
        name: projectType.name,
        description: projectType.description || 'Flat config for testing',
        configSchema: projectType.configSchema || DEFAULT_CONFIG_SCHEMA,
        isActive: projectType.isActive,
      });
      
      // Set schema JSON
      setSchemaJson(JSON.stringify(projectType.configSchema || DEFAULT_CONFIG_SCHEMA, null, 2));
    }
  }, [projectType]);

  // Handle schema changes
  const handleSchemaChange = (value: string) => {
    setSchemaJson(value);
    setSchemaError(null);
    
    try {
      const parsed = JSON.parse(value);
      
      // Validate that the schema has the required structure
      if (typeof parsed !== 'object') {
        setSchemaError('Schema must be a JSON object');
        return;
      }
      
      // Check if inputFolder and outputFolder are present
      if (!parsed.inputFolder || !parsed.outputFolder) {
        setSchemaError('Schema must include "inputFolder" and "outputFolder" properties');
        return;
      }
      
      form.setFieldValue('configSchema', parsed);
    } catch (error) {
      if (error instanceof Error) {
        setSchemaError(error.message);
      } else {
        setSchemaError('Invalid JSON');
      }
    }
  };

  // Reset schema to default
  const resetSchema = () => {
    const defaultSchema = JSON.stringify(DEFAULT_CONFIG_SCHEMA, null, 2);
    setSchemaJson(defaultSchema);
    form.setFieldValue('configSchema', DEFAULT_CONFIG_SCHEMA);
    setSchemaError(null);
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
          icon: <IconAlertCircle size={16} />,
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
        message: error instanceof Error ? error.message : 'Failed to update project type',
        color: 'red',
        icon: <IconAlertCircle size={16} />,
      });
    }
  };

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  const handleRetry = () => {
    refetch();
  };

  // Loading state
  if (isLoading) {
    return (
      <div>
        <PageHeader
          title="Edit Project Type"
          description="Loading project type details..."
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
        
        <Paper withBorder p="md" radius="md">
          <Skeleton height={40} mb="md" width="50%" />
          <Skeleton height={100} mb="md" width="100%" />
          <Skeleton height={30} mb="md" width="30%" />
          <Skeleton height={200} width="100%" />
        </Paper>
      </div>
    );
  }

  // Error state
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
          mb="xl"
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
        <Group>
          <Button 
            leftSection={<IconArrowLeft size={16} />}
            onClick={handleBack}
            variant="outline"
          >
            Back to Project Types
          </Button>
          <Button 
            leftSection={<IconRefresh size={16} />}
            onClick={handleRetry}
          >
            Retry
          </Button>
        </Group>
      </div>
    );
  }

  // Not found state
  if (!projectType) {
    return (
      <div>
        <PageHeader
          title="Project Type Not Found"
          description="The requested project type could not be found"
        />
        <Alert 
          icon={<IconInfoCircle size={16} />} 
          title="Not Found" 
          color="yellow" 
          mt="md"
          mb="xl"
        >
          The project type with ID {id} does not exist or has been deleted.
        </Alert>
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

      {updateError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {updateError instanceof Error ? updateError.message : 'An error occurred while updating the project type'}
        </Alert>
      )}

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
                icon={<IconInfoCircle size={16} />} 
                title="Configuration Schema" 
                color="blue" 
                mb="md"
              >
                Define the configuration schema for this project type. The schema must include 
                <Code>inputFolder</Code> and <Code>outputFolder</Code> properties.
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
                error={schemaError}
              />
              
              <Group justify="flex-end" mb="md">
                <Button 
                  variant="subtle" 
                  onClick={resetSchema}
                  size="sm"
                >
                  Reset to Default
                </Button>
              </Group>
              
              <Divider my="md" />
              
              <Stack gap="xs" mb="xl">
                <Title order={4}>Schema Preview</Title>
                <Text size="sm" c="dimmed">
                  This is how your configuration schema will be stored:
                </Text>
                <Code block>
                  {schemaError ? 'Invalid JSON' : JSON.stringify(form.values.configSchema, null, 2)}
                </Code>
              </Stack>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="flex-end" mt="xl">
            <Button 
              variant="default" 
              onClick={handleBack}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
              disabled={!!schemaError || !form.isValid()}
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