import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectDetailsPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Project Details</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project details functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectDetailsPage;