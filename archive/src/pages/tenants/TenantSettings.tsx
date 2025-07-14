import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantSettings: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Tenant Settings</Title>
      <Paper p="md" withBorder>
        <Text>Tenant settings will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantSettings;