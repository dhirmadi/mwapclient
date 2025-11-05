import React from 'react';
import { Title, Paper, Group, Button, Table, Text, TextInput } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import useProjects from '../hooks/useProjects';

const ProjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects = [], isLoading } = useProjects();
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    if (!projects) return [] as any[];
    if (!query) return projects as any[];
    const q = query.toLowerCase();
    return (projects as any[]).filter((p) =>
      (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div>
      <Title order={2} mb="md">Projects</Title>
      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="md">
          <TextInput placeholder="Search projects" value={query} onChange={(e) => setQuery(e.currentTarget.value)} w={260} />
          <Button onClick={() => navigate('/projects/new')}>Create Project</Button>
        </Group>

        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {(filtered as any[]).map((p) => (
              <Table.Tr key={p.id || p._id}>
                <Table.Td>{p.name}</Table.Td>
                <Table.Td>{p.description}</Table.Td>
                <Table.Td>{p.archived ? 'archived' : 'active'}</Table.Td>
                <Table.Td>
                  <Group justify="flex-end" gap="xs">
                    <Button size="xs" variant="subtle" onClick={() => navigate(`/projects/${p.id || p._id}`)}>View</Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {!isLoading && (filtered as any[]).length === 0 && (
          <Text c="dimmed" size="sm" mt="sm">No projects found.</Text>
        )}
      </Paper>
    </div>
  );
};

export default ProjectListPage;