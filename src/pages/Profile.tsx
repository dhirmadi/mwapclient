import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Avatar, Text, Group, Badge, Button, Title } from '@mantine/core';
import { IconLogout } from '@tabler/icons-react';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return null;
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'red';
      case 'TENANT_OWNER':
        return 'blue';
      case 'TENANT_ADMIN':
        return 'indigo';
      case 'PROJECT_ADMIN':
        return 'green';
      case 'PROJECT_MEMBER':
        return 'teal';
      default:
        return 'gray';
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    
    const nameParts = user.name.split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div>
      <Group justify="space-between" align="center" mb="md">
        <Title order={1}>Profile</Title>
        <Text c="dimmed">Manage your account settings</Text>
      </Group>

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <Group justify="apart" align="flex-start">
          <Group>
            <Avatar
              size="xl"
              radius="xl"
              color="blue"
              src={user.picture}
            >
              {getUserInitials()}
            </Avatar>
            <div>
              <Text size="xl" fw={700}>
                {user.name}
              </Text>
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
              <Group gap="xs" mt="md">
                {user.roles.map((role: string) => (
                  <Badge key={role} color={getRoleBadgeColor(role)}>
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
          <Button 
            color="red" 
            variant="outline" 
            onClick={logout}
            leftSection={<IconLogout size={16} />}
          >
            Logout
          </Button>
        </Group>

        <div className="mt-6">
          <Text size="sm" c="dimmed" mb="xs">
            Account Information
          </Text>
          <div className="border-t border-gray-200 pt-4">
            <dl className="divide-y divide-gray-200">
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">User ID</dt>
                <dd className="text-sm text-gray-900 col-span-2">{user.id}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900 col-span-2">{user.email}</dd>
              </div>
              {user.tenantId && (
                <div className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
                  <dd className="text-sm text-gray-900 col-span-2">{user.tenantId}</dd>
                </div>
              )}
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Roles</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <Group gap="xs">
                    {user.roles.map((role: string) => (
                      <Badge key={role} color={getRoleBadgeColor(role)}>
                        {role.replace('_', ' ')}
                      </Badge>
                    ))}
                  </Group>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;