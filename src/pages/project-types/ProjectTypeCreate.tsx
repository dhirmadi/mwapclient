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
  Alert 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconCheck, IconDeviceFloppy, IconArrowLeft } from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useProjectTypes } from '../../hooks/useProjectTypes';
import { ProjectTypeCreate as ProjectTypeCreateType } from '../../types/project-type';

const ProjectTypeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createProjectType, isCreating } = useProjectTypes();
  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Form for project type creation
  const form = useForm<ProjectTypeCreateType>({
    initialValues: {
      name: '',
      description: '',
      configSchema: {},
      isActive: true,
    },
    validate: {
      name: (value) => (value.length < 3 ? 'Name must be at least 3 characters' : null),
    },
  });

  // Schema editor state
  const [schemaJson, setSchemaJson] = useState<string>('{\n  "type": "object",\n  "properties": {\n    "example": {\n      "type": "string",\n      "description": "Example field"\n    }\n  },\n  "required": []\n}');

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
  const handleSubmit = async (values: ProjectTypeCreateType) => {
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
      
      // Create project type
      await createProjectType(values);
      
      notifications.show({
        title: 'Success',
        message: 'Project type created successfully',
        color: 'green',
        icon: <IconCheck size={16} />,
      });
      
      // Navigate back to list
      navigate('/admin/project-types');
    } catch (error) {
      console.error('Failed to create project type:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create project type',
        color: 'red',
      });
    }
  };

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  return (
    <div>
      <PageHeader
        title="Create Project Type"
        description="Define a new project template"
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
        <LoadingOverlay visible={isCreating} overlayBlur={2} />
        
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
              loading={isCreating}
              disabled={!!schemaError}
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