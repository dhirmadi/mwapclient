import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const TenantEdit: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Edit Tenant</Title>
      <Paper p="md" withBorder>
        <Text>Tenant edit form will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default TenantEdit;