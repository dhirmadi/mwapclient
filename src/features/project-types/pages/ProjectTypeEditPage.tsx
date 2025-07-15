import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Text,
  Skeleton,
  Badge
} from '@mantine/core';
import { 
  IconAlertCircle, 
  IconCheck, 
  IconDeviceFloppy, 
  IconArrowLeft,
  IconInfoCircle,
  IconEdit
} from '@tabler/icons-react';
import { useProjectTypes } from '../hooks/useProjectTypes';
import { ProjectTypeUpdate } from '../types';

const DEFAULT_CONFIG_SCHEMA = {
  inputFolder: "string",
  outputFolder: "string"
};

const ProjectTypeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { 
    useProjectType, 
    updateProjectType, 
    isUpdating, 
    updateError 
  } = useProjectTypes();
  
  // Fetch the project type data
  const { 
    data: projectType, 
    isLoading: isLoadingProjectType, 
    error: fetchError 
  } = useProjectType(id);

  const [activeTab, setActiveTab] = useState<string | null>('general');
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [schemaJson, setSchemaJson] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  // Form for project type editing
  const form = useForm<ProjectTypeUpdate>({
    initialValues: {
      name: '',
      description: '',
      configSchema: DEFAULT_CONFIG_SCHEMA,
      isActive: true,
    },
    validate: {
      name: (value) => (value && value.length < 3 ? 'Name must be at least 3 characters' : null),
      description: (value) => (!value ? 'Description is required' : null),
    },
  });

  // Initialize form when project type data is loaded
  useEffect(() => {
    if (projectType) {
      const initialValues = {
        name: projectType.name,
        description: projectType.description,
        configSchema: projectType.configSchema,
        isActive: projectType.isActive,
      };
      
      form.setValues(initialValues);
      setSchemaJson(JSON.stringify(projectType.configSchema, null, 2));
    }
  }, [projectType]);

  // Track form changes
  useEffect(() => {
    if (projectType) {
      const currentValues = form.values;
      const originalValues = {
        name: projectType.name,
        description: projectType.description,
        configSchema: projectType.configSchema,
        isActive: projectType.isActive,
      };
      
      const changed = (
        currentValues.name !== originalValues.name ||
        currentValues.description !== originalValues.description ||
        currentValues.isActive !== originalValues.isActive ||
        JSON.stringify(currentValues.configSchema) !== JSON.stringify(originalValues.configSchema)
      );
      
      setHasChanges(changed);
    }
  }, [form.values, projectType]);

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

  // Reset schema to original
  const resetSchema = () => {
    if (projectType) {
      const originalSchema = JSON.stringify(projectType.configSchema, null, 2);
      setSchemaJson(originalSchema);
      form.setFieldValue('configSchema', projectType.configSchema);
      setSchemaError(null);
    }
  };

  // Reset form to original values
  const resetForm = () => {
    if (projectType) {
      form.setValues({
        name: projectType.name,
        description: projectType.description,
        configSchema: projectType.configSchema,
        isActive: projectType.isActive,
      });
      setSchemaJson(JSON.stringify(projectType.configSchema, null, 2));
      setSchemaError(null);
    }
  };

  // Handle form submission
  const handleSubmit = async (values: ProjectTypeUpdate) => {
    if (!id) return;
    
    try {
      // Validate schema JSON
      if (schemaError) {
        console.error('Please fix the schema errors before submitting');
        setActiveTab('schema');
        return;
      }
      
      // Only send changed fields
      const changedFields: ProjectTypeUpdate = {};
      
      if (projectType) {
        if (values.name !== projectType.name) changedFields.name = values.name;
        if (values.description !== projectType.description) changedFields.description = values.description;
        if (values.isActive !== projectType.isActive) changedFields.isActive = values.isActive;
        if (JSON.stringify(values.configSchema) !== JSON.stringify(projectType.configSchema)) {
          changedFields.configSchema = values.configSchema;
        }
      }
      
      // If no changes, just navigate back
      if (Object.keys(changedFields).length === 0) {
        navigate('/admin/project-types');
        return;
      }
      
      // Update project type
      await updateProjectType({ id, data: changedFields });
      
      // Success message
      console.log('Project type updated successfully');
      
      // Navigate back to list
      navigate('/admin/project-types');
    } catch (error) {
      console.error('Failed to update project type:', error);
      console.error(error instanceof Error ? error.message : 'Failed to update project type');
    }
  };

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  // Loading state
  if (isLoadingProjectType) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Skeleton height={32} width={200} mb="xs" />
            <Skeleton height={20} width={300} />
          </div>
        </Group>

        <Group justify="flex-start" mb="md">
          <Skeleton height={36} width={180} />
        </Group>

        <Paper withBorder p="md" radius="md">
          <Skeleton height={24} width={150} mb="md" />
          <Skeleton height={40} mb="md" />
          <Skeleton height={40} mb="md" />
          <Skeleton height={100} />
        </Paper>
      </div>
    );
  }

  // Error state
  if (fetchError || !projectType) {
    return (
      <div>
        <Group justify="space-between" mb="md">
          <div>
            <Title order={2}>Edit Project Type</Title>
            <Text c="dimmed">Modify project type settings</Text>
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

        <Alert 
          icon={<IconAlertCircle size={16} />} 
          title="Error" 
          color="red"
        >
          {fetchError instanceof Error ? fetchError.message : 'Project type not found'}
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Group align="center" gap="sm">
            <Title order={2}>Edit Project Type</Title>
            <Badge 
              color={projectType.isActive ? 'green' : 'gray'} 
              variant="light"
            >
              {projectType.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </Group>
          <Text c="dimmed">Modify project type settings</Text>
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
              <Tabs.Tab value="metadata">Metadata</Tabs.Tab>
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
                  Reset to Original
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

            <Tabs.Panel value="metadata">
              <Title order={3} mb="md">Metadata</Title>
              
              <Stack gap="md">
                <Group>
                  <Text fw={500} size="sm">ID:</Text>
                  <Code>{projectType._id}</Code>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Created:</Text>
                  <Text size="sm">{new Date(projectType.createdAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Last Updated:</Text>
                  <Text size="sm">{new Date(projectType.updatedAt).toLocaleString()}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Created By:</Text>
                  <Text size="sm">{projectType.createdBy}</Text>
                </Group>
                
                <Group>
                  <Text fw={500} size="sm">Status:</Text>
                  <Badge 
                    color={projectType.isActive ? 'green' : 'gray'} 
                    variant="light"
                  >
                    {projectType.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </Group>
              </Stack>
            </Tabs.Panel>
          </Tabs>
          
          <Group justify="space-between" mt="xl">
            <Group>
              <Button 
                variant="default" 
                onClick={handleBack}
              >
                Cancel
              </Button>
              {hasChanges && (
                <Button 
                  variant="subtle" 
                  onClick={resetForm}
                >
                  Reset Changes
                </Button>
              )}
            </Group>
            
            <Button 
              type="submit" 
              leftSection={<IconDeviceFloppy size={16} />}
              loading={isUpdating}
              disabled={!!schemaError || !form.isValid() || !hasChanges}
            >
              {hasChanges ? 'Save Changes' : 'No Changes'}
            </Button>
          </Group>
        </form>
      </Paper>
    </div>
  );
};

export default ProjectTypeEdit;