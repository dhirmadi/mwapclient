import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantDetails: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Tenant Details</Title>
      <Paper p="md" withBorder>
        <Text>Tenant details will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantDetails;