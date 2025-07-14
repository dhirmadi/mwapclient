import React from 'react';
import { Title, Text, Paper } from '@mantine/core';

const ProjectMembersPage: React.FC = () => {
  return (
    <div>
      <Title order={2} mb="md">Project Members</Title>
      <Paper withBorder p="md" radius="md">
        <Text>Project members functionality will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default ProjectMembersPage;