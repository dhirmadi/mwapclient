import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantIntegrations: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Tenant Integrations</Title>
      <Paper p="md" withBorder>
        <Text>Tenant integrations will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantIntegrations;