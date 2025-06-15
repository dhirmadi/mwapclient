import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Title, 
  Text, 
  Group, 
  Avatar, 
  Table, 
  Select, 
  ActionIcon, 
  Modal, 
  TextInput, 
  Badge, 
  Menu, 
  Tooltip 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconUserPlus, 
  IconTrash, 
  IconEdit, 
  IconDotsVertical, 
  IconSearch, 
  IconMail, 
  IconUser 
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import { useProjects } from '../../hooks/useProjects';
import { ProjectMember } from '../../types/project';
import { LoadingSpinner } from '../../components/common';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

const ProjectMembers: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { hasProjectRole } = useAuth();
  const { fetchProjectById, fetchProjectMembers, addProjectMember, updateProjectMember, removeProjectMember } = useProjects();
  
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('MEMBER');
  const [editRole, setEditRole] = useState<string>('MEMBER');
  
  // Check if user has owner permissions
  const isOwner = projectId ? hasProjectRole(projectId, 'OWNER') : false;

  // Mock users for search (in a real app, this would be an API call)
  const [users, setUsers] = useState<User[]>([
    { _id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { _id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
    { _id: 'user3', name: 'Bob Johnson', email: 'bob@example.com' },
    { _id: 'user4', name: 'Alice Williams', email: 'alice@example.com' },
    { _id: 'user5', name: 'Charlie Brown', email: 'charlie@example.com' },
  ]);

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        // Load project members
        const membersData = await fetchProjectMembers(projectId);
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to load members:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load project members',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId]);

  const handleInvite = async () => {
    if (!projectId || !inviteEmail.trim()) return;
    
    try {
      // In a real app, this would validate the email and find the user
      const user = users.find(u => u.email === inviteEmail);
      
      if (!user) {
        notifications.show({
          title: 'Error',
          message: 'User not found with this email',
          color: 'red',
        });
        return;
      }
      
      // Add member to project
      await addProjectMember(projectId, {
        userId: user._id,
        role: inviteRole,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
      
      // Refresh members list
      const membersData = await fetchProjectMembers(projectId);
      setMembers(membersData);
      
      notifications.show({
        title: 'Success',
        message: `${user.name} has been added to the project`,
        color: 'green',
      });
      
      setInviteModalOpen(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
    } catch (error) {
      console.error('Failed to add member:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to add member to project',
        color: 'red',
      });
    }
  };

  const handleEditMember = async () => {
    if (!projectId || !selectedMember) return;
    
    try {
      // Update member role
      await updateProjectMember(projectId, selectedMember.userId, editRole);
      
      // Refresh members list
      const membersData = await fetchProjectMembers(projectId);
      setMembers(membersData);
      
      notifications.show({
        title: 'Success',
        message: `${selectedMember.user.name}'s role has been updated`,
        color: 'green',
      });
      
      setEditModalOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Failed to update member:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update member role',
        color: 'red',
      });
    }
  };

  const handleRemoveMember = async (member: ProjectMember) => {
    if (!projectId) return;
    
    if (window.confirm(`Are you sure you want to remove ${member.user.name} from the project?`)) {
      try {
        // Remove member from project
        await removeProjectMember(projectId, member.userId);
        
        // Refresh members list
        const membersData = await fetchProjectMembers(projectId);
        setMembers(membersData);
        
        notifications.show({
          title: 'Success',
          message: `${member.user.name} has been removed from the project`,
          color: 'green',
        });
      } catch (error) {
        console.error('Failed to remove member:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to remove member from project',
          color: 'red',
        });
      }
    }
  };

  const openEditModal = (member: ProjectMember) => {
    setSelectedMember(member);
    setEditRole(member.role);
    setEditModalOpen(true);
  };

  const filteredMembers = members.filter(member => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      member.user.name.toLowerCase().includes(query) ||
      member.user.email.toLowerCase().includes(query)
    );
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'blue';
      case 'DEPUTY':
        return 'green';
      case 'MEMBER':
        return 'gray';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title="Project Members"
        description="Manage project team members and permissions"
      />

      <Group justify="space-between" mb="md">
        <TextInput
          placeholder="Search members..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          w={300}
        />
        
        {isOwner && (
          <Button 
            leftSection={<IconUserPlus size={16} />} 
            onClick={() => setInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        )}
      </Group>

      <Paper withBorder p="md" radius="md">
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Joined</Table.Th>
              {isOwner && <Table.Th w={80}>Actions</Table.Th>}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredMembers.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={isOwner ? 5 : 4} align="center">
                  <Text c="dimmed" py="lg">
                    No members found
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredMembers.map((member) => (
                <Table.Tr key={member.userId}>
                  <Table.Td>
                    <Group gap="sm">
                      <Avatar 
                        src={member.user.avatar} 
                        radius="xl" 
                        size="sm" 
                        color="blue"
                      >
                        {getInitials(member.user.name)}
                      </Avatar>
                      <Text>{member.user.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{member.user.email}</Table.Td>
                  <Table.Td>
                    <Badge color={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </Table.Td>
                  {isOwner && (
                    <Table.Td>
                      <Menu position={{ top: 'bottom', right: 'end' }} withArrow>
                        <Menu.Target>
                          <ActionIcon variant="subtle">
                            <IconDotsVertical size={16} />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item 
                            leftSection={<IconEdit size={14} />}
                            onClick={() => openEditModal(member)}
                          >
                            Change Role
                          </Menu.Item>
                          <Menu.Item 
                            leftSection={<IconMail size={14} />}
                          >
                            Send Message
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item 
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleRemoveMember(member)}
                          >
                            Remove from Project
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  )}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* Invite Member Modal */}
      <Modal
        opened={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Member"
      >
        <TextInput
          label="Email Address"
          placeholder="Enter email address"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.currentTarget.value)}
          required
          mb="md"
          leftSection={<IconMail size={16} />}
        />
        
        <Select
          label="Role"
          placeholder="Select role"
          value={inviteRole}
          onChange={(value) => setInviteRole(value || 'MEMBER')}
          data={[
            { value: 'OWNER', label: 'Owner - Full control over the project' },
            { value: 'DEPUTY', label: 'Deputy - Can edit but not delete the project' },
            { value: 'MEMBER', label: 'Member - Can view and use project resources' },
          ]}
          mb="xl"
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!inviteEmail.trim()}>
            Invite
          </Button>
        </Group>
      </Modal>

      {/* Edit Member Modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Member Role"
      >
        {selectedMember && (
          <>
            <Group mb="md">
              <Avatar 
                src={selectedMember.user.avatar} 
                radius="xl" 
                size="md" 
                color="blue"
              >
                {getInitials(selectedMember.user.name)}
              </Avatar>
              <div>
                <Text fw={500}>{selectedMember.user.name}</Text>
                <Text size="sm" c="dimmed">{selectedMember.user.email}</Text>
              </div>
            </Group>
            
            <Select
              label="Role"
              placeholder="Select role"
              value={editRole}
              onChange={(value) => setEditRole(value || 'MEMBER')}
              data={[
                { value: 'OWNER', label: 'Owner - Full control over the project' },
                { value: 'DEPUTY', label: 'Deputy - Can edit but not delete the project' },
                { value: 'MEMBER', label: 'Member - Can view and use project resources' },
              ]}
              mb="xl"
            />
            
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditMember}>
                Save Changes
              </Button>
            </Group>
          </>
        )}
      </Modal>
    </div>
  );
};

// Helper function to get initials from name
const getInitials = (name: string): string => {
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default ProjectMembers;