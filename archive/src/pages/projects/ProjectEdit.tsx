import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectEdit: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Edit Project</Title>
      <Paper p="md" withBorder>
        <Text>Project edit form will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectEdit;