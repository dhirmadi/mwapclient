import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectEditPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Edit Project</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project edit functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectEditPage;