import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantManagement: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Tenant Management</Title>
      <Paper p="md" withBorder>
        <Text>Tenant management will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantManagement;