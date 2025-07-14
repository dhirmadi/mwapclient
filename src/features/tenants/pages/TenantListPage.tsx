import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantListPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Tenant List</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant list functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantListPage;