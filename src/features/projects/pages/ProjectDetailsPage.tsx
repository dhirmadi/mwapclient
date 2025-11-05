import React from 'react';
import { Title, Paper, Tabs, Stack, Group, Button, Table, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import useProjects from '../hooks/useProjects';
import AddMemberModal from '../components/AddMemberModal';
import { useParams } from 'react-router-dom';

const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { useProject, useProjectMembers, addProjectMember, updateProjectMember, removeProjectMember, updateProject, deleteProject } = useProjects();
  const { data: project } = useProject(id);
  const { data: members = [] } = useProjectMembers(id);

  const [activeTab, setActiveTab] = React.useState<string>('overview');

  const [addOpen, setAddOpen] = React.useState(false);
  const handleAddMember = () => setAddOpen(true);
  const handleSubmitAdd = (userId: string, role: 'OWNER' | 'DEPUTY' | 'MEMBER') => {
    if (!id) return;
    (addProjectMember as any)({ projectId: id, data: { userId, role } });
  };

  return (
    <div>
      <Title order={2} mb="md">Project Details</Title>
      <Paper withBorder p="md" radius="md">
        <Tabs value={activeTab} onChange={(v) => setActiveTab(v || 'overview')}>
          <Tabs.List>
            <Tabs.Tab value="overview">Overview</Tabs.Tab>
            <Tabs.Tab value="members">Members</Tabs.Tab>
            <Tabs.Tab value="settings">Settings</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Stack gap="xs">
              <div><strong>Name:</strong> {project?.name}</div>
              <div><strong>Type:</strong> {(project as any)?.projectTypeId}</div>
              <div><strong>Integration:</strong> {(project as any)?.cloudIntegrationId}</div>
              <div><strong>Folder:</strong> {(project as any)?.folderpath}</div>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="members" pt="md">
            <Group justify="space-between" mb="sm">
              <Title order={5}>Members</Title>
              <Button size="xs" variant="light" onClick={handleAddMember}>Add Member</Button>
            </Group>
            <AddMemberModal opened={addOpen} onClose={() => setAddOpen(false)} onAdd={handleSubmitAdd} />
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Role</Table.Th>
                  <Table.Th></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(members as any[]).map((m) => (
                  <Table.Tr key={m.userId}>
                    <Table.Td>{m.userId}</Table.Td>
                    <Table.Td>{m.role}</Table.Td>
                    <Table.Td>
                      <Group gap="xs" justify="flex-end">
                        <Button size="xs" variant="subtle" onClick={() => {
                          // Promote/demote with guard: never leave project without an OWNER
                          const owners = (members as any[]).filter(mm => mm.role === 'OWNER');
                          if (m.role === 'OWNER' && owners.length <= 1) return; // guard: cannot demote last owner
                          updateProjectMember({ projectId: id!, userId: m.userId, role: m.role === 'OWNER' ? 'DEPUTY' : 'OWNER' });
                        }}>{m.role === 'OWNER' ? 'Make Deputy' : 'Make Owner'}</Button>
                        <Button size="xs" color="red" variant="subtle" onClick={() => {
                          const owners = (members as any[]).filter(mm => mm.role === 'OWNER');
                          if (m.role === 'OWNER' && owners.length <= 1) return; // guard: cannot remove last owner
                          removeProjectMember({ projectId: id!, userId: m.userId });
                        }}>Remove</Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            {members?.length === 0 && (
              <Text c="dimmed" size="sm" mt="sm">No members yet.</Text>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => updateProject({ id: id!, data: { archived: !(project as any)?.archived } })}>
                {(project as any)?.archived ? 'Unarchive' : 'Archive'}
              </Button>
              <Button size="xs" color="red" variant="outline" onClick={() => deleteProject(id!, { onSuccess: () => navigate('/projects') })}>
                Delete Project
              </Button>
            </Group>
          </Tabs.Panel>
        </Tabs>
      </Paper>
    </div>
  );
};

export default ProjectDetailsPage;