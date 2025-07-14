import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectList: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Projects</Title>
      <Paper p="md" withBorder>
        <Text>Project list will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectList;