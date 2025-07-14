import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectTypeCreate: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Create Project Type</Title>
      <Paper p="md" withBorder>
        <Text>Project Type creation form will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectTypeCreate;