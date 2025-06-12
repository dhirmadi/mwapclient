import React from 'react';
import { useAuth } from '@/hooks';
import { PageHeader } from '@/components/layout';
import { Card, Avatar, Text, Group, Badge, Button } from '@mantine/core';

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

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account settings" />

      <Card shadow="sm" p="lg" radius="md" withBorder className="mt-6">
        <Group justify="apart" align="flex-start">
          <Group>
            <Avatar
              size="xl"
              radius="xl"
              color="blue"
              src={null}
            >
              {user.firstName.charAt(0) + user.lastName.charAt(0)}
            </Avatar>
            <div>
              <Text size="xl" fw={700}>
                {user.firstName} {user.lastName}
              </Text>
              <Text size="sm" c="dimmed">
                {user.email}
              </Text>
              <Group gap="xs" mt="md">
                {user.roles.map((role) => (
                  <Badge key={role} color={getRoleBadgeColor(role)}>
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
          <Button color="red" variant="outline" onClick={logout}>
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
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
                <dd className="text-sm text-gray-900 col-span-2">{user.tenantId || 'N/A'}</dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {new Date(user.createdAt).toLocaleString()}
                </dd>
              </div>
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {new Date(user.updatedAt).toLocaleString()}
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