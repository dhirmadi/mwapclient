import React from 'react';
import { Stack, TextInput, Textarea, Select } from '@mantine/core';
import { useProjectTypes } from '../../project-types/hooks/useProjectTypes';
import { useIntegrations } from '../../integrations/hooks/useIntegrations';

export interface ProjectFormValues {
  name: string;
  description?: string;
  projectTypeId: string;
  integrationId: string;
}

interface ProjectFormProps {
  values: ProjectFormValues;
  onChange: (values: ProjectFormValues) => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ values, onChange }) => {
  const { projectTypes = [], isLoading } = useProjectTypes();
  const { data: integrations = [] } = useIntegrations();
  const typeOptions = (projectTypes || []).map((t: any) => ({ value: t.id || t._id, label: t.name }));
  const integrationOptions = (integrations as any[]).map((i) => ({ value: i.id, label: String(i.metadata?.displayName || i.provider?.name || 'Integration') }));

  return (
    <Stack gap="md">
      <TextInput
        label="Project Name"
        placeholder="Enter project name"
        value={values.name}
        onChange={(e) => onChange({ ...values, name: e.currentTarget.value })}
        required
      />

      <Textarea
        label="Description"
        placeholder="Optional description"
        value={values.description || ''}
        onChange={(e) => onChange({ ...values, description: e.currentTarget.value })}
        autosize
        minRows={3}
      />

      <Select
        label="Project Type"
        placeholder="Select type"
        data={typeOptions}
        value={values.projectTypeId}
        onChange={(value) => onChange({ ...values, projectTypeId: value || '' })}
        required
        searchable
        disabled={isLoading || typeOptions.length === 0}
      />

      <Select
        label="Integration"
        placeholder="Select tenant integration"
        data={integrationOptions}
        value={values.integrationId}
        onChange={(value) => onChange({ ...values, integrationId: value || '' })}
        required
        searchable
        disabled={integrationOptions.length === 0}
      />
    </Stack>
  );
};

export default ProjectForm;


