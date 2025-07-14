import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectListPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Projects</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project list functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectListPage;