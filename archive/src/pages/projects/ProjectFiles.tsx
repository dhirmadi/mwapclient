import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const ProjectFiles: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Project Files</Title>
      <Paper p="md" withBorder>
        <Text>Project files management will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectFiles;