import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Text
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconInfoCircle
} from '@tabler/icons-react';
import { useProjectTypes } from '../hooks/useProjectTypes';
import { ProjectTypeCreate as ProjectTypeCreateType } from '../types';

const DEFAULT_CONFIG_SCHEMA = {
  inputFolder: "string",
  outputFolder: "string"
};

const ProjectTypeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createProjectType, isCreating, createError } = useProjectTypes();
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Form for project type creation
  const form = useForm<ProjectTypeCreateType>({
    initialValues: {
      name: '',
      description: 'Flat config for testing',
      configSchema: DEFAULT_CONFIG_SCHEMA,
      isActive: true,
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>(JSON.stringify(DEFAULT_CONFIG_SCHEMA, null, 2));

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
  const handleSubmit = async (values: ProjectTypeCreateType) => {
    try {
      // Validate schema JSON
      if (schemaError) {
        console.error('Please fix the schema errors before submitting');
        setActiveTab('schema');
        return;
      }
      
      // Create project type
      await createProjectType(values);
      
      // Success message
      console.log('Project type created successfully');
      
      // Navigate back to list
      navigate('/admin/project-types');
    } catch (error) {
      console.error('Failed to create project type:', error);
      console.error(error instanceof Error ? error.message : 'Failed to create project type');
    }
  };

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Create Project Type</Title>
          <Text c="dimmed">Define a new project template</Text>
        </div>
      </Group>

      <Group justify="flex-start" mb="md">
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Project Types
        </Button>
      </Group>

      {createError && (
        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red" 
          mb="md"
        >
          {createError instanceof Error ? createError.message : 'An error occurred while creating the project type'}
        </Alert>
      )}

      <Paper withBorder p="md" radius="md" pos="relative">
        <LoadingOverlay visible={isCreating} />
        
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
              loading={isCreating}
              disabled={!!schemaError || !form.isValid()}
            >
              Create Project Type
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default ProjectTypeCreate;