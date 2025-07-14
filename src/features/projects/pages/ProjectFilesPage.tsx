import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectFilesPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Project Files</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project files functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectFilesPage;