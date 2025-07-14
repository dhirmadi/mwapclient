import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectDetails: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Project Details</Title>
      <Paper p="md" withBorder>
        <Text>Project details will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectDetails;