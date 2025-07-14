import React from 'react';
import { Title, Paper, Text } from '@mantine/core';

const CloudProviderList: React.FC = () => {
  return (
    <div>
      <Title order={1} mb="md">Cloud Providers</Title>
      <Paper p="md" withBorder>
        <Text>Cloud Provider list will be implemented here.</Text>
      </Paper>
    </div>
  );
};

export default CloudProviderList;