import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantDetailsPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Tenant Details</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant details functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantDetailsPage;