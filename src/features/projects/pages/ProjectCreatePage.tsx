import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectCreatePage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Create Project</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project creation functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectCreatePage;