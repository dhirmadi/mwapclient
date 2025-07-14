import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectCreate: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Create Project</Title>
      <Paper p="md" withBorder>
        <Text>Project creation form will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectCreate;