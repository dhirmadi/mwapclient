import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantEditPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Edit Tenant</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant editing functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantEditPage;