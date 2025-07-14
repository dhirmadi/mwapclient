import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantManagementPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Tenant Management</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant management functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantManagementPage;