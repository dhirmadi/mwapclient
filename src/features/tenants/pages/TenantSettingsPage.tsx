import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantSettingsPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Tenant Settings</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant settings functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantSettingsPage;