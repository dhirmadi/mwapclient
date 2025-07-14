import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const TenantIntegrationsPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Tenant Integrations</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Tenant integrations functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantIntegrationsPage;