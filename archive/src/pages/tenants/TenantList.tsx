import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantList: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Tenants</Title>
      <Paper p="md" withBorder>
        <Text>Tenant list will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantList;