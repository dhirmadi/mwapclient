import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectTypeList: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Project Types</Title>
      <Paper p="md" withBorder>
        <Text>Project Type list will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectTypeList;