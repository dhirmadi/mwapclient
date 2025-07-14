import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantCreate: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Create Tenant</Title>
      <Paper p="md" withBorder>
        <Text>Tenant creation form will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantCreate;