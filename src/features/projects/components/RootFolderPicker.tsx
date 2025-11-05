import React from 'react';
import { Stack, Select, TextInput, Group, Button, Table, Text } from '@mantine/core';
import { useIntegrations } from '../../integrations/hooks/useIntegrations';
import { useIntegrationFolders } from '../../integrations/hooks/useIntegrationFolders';
import FolderBrowserModal from '../../integrations/components/FolderBrowserModal';

export interface RootFolderSelection {
  integrationId: string;
  mode: 'create' | 'use_existing';
  pathOrName: string;
}

interface RootFolderPickerProps {
  values: RootFolderSelection;
  onChange: (values: RootFolderSelection) => void;
}

const RootFolderPicker: React.FC<RootFolderPickerProps> = ({ values, onChange }) => {
  const { data: integrations = [] } = useIntegrations();
  const [browsePath, setBrowsePath] = React.useState('/');
  const { data: folders = [] } = useIntegrationFolders(values.integrationId, browsePath);
  const [browserOpen, setBrowserOpen] = React.useState(false);

  return (
    <Stack gap="md">
      <Select
        label="Integration"
        placeholder="Select tenant integration"
        data={integrations.map((i: any) => ({ value: i.id, label: (i.metadata?.displayName || i.provider?.name || 'Integration') }))}
        value={values.integrationId}
        onChange={(value) => onChange({ ...values, integrationId: value || '' })}
        required
        searchable
      />

      <Select
        label="Root Folder Mode"
        data={[
          { value: 'create', label: 'Create new folder' },
          { value: 'use_existing', label: 'Use existing folder' },
        ]}
        value={values.mode}
        onChange={(value) => onChange({ ...values, mode: (value as 'create' | 'use_existing') || 'create' })}
        required
      />

      <TextInput
        label={values.mode === 'create' ? 'Folder Name' : 'Existing Path/ID'}
        placeholder={values.mode === 'create' ? 'e.g., Projects/Website-Redesign' : 'e.g., Projects/Existing-Folder'}
        value={values.pathOrName}
        onChange={(e) => onChange({ ...values, pathOrName: e.currentTarget.value })}
        required
      />

      {values.mode === 'use_existing' && (
        <Group>
          <Button variant="light" onClick={() => setBrowserOpen(true)} disabled={!values.integrationId}>
            Browse...
          </Button>
          <FolderBrowserModal
            opened={browserOpen}
            onClose={() => setBrowserOpen(false)}
            integrationId={values.integrationId}
            initialPath={'/'}
            onConfirm={(selected) => onChange({ ...values, pathOrName: selected })}
          />
        </Group>
      )}

      {values.mode === 'use_existing' && values.integrationId && (
        <Stack gap="xs">
          <Group gap="xs">
            <TextInput label="Browse Path" placeholder="/" value={browsePath} onChange={(e) => setBrowsePath(e.currentTarget.value)} w={260} />
            <Button variant="light" onClick={() => { /* query auto-updates via state */ }}>Refresh</Button>
          </Group>
          <Table striped withTableBorder highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Path</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(folders as any[]).map((f) => (
                <Table.Tr key={f.id || f.path}>
                  <Table.Td>{f.name}</Table.Td>
                  <Table.Td>{f.path}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="subtle" onClick={() => onChange({ ...values, pathOrName: f.path })}>Select</Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          {(folders as any[]).length === 0 && (
            <Text c="dimmed" size="xs">No folders listed for this path.</Text>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default RootFolderPicker;


