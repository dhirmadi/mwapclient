import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container,
  Paper,
  Title,
  Text,
  Button,
  Group,
} from '@mantine/core';
import { 
  IconArrowLeft,
} from '@tabler/icons-react';

const CloudProviderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => navigate('/admin/cloud-providers');

  return (
    <Container size="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Edit Cloud Provider</Title>
          <Text c="dimmed">Edit cloud provider configuration</Text>
        </div>
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Cloud Providers
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Text>Cloud Provider Edit Form - ID: {id}</Text>
        <Text c="dimmed" size="sm">This feature is under development.</Text>
      </Paper>
    </Container>
  );
};

export default CloudProviderEditPage;