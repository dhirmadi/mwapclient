import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantCreatePage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Create Tenant</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant creation functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantCreatePage;