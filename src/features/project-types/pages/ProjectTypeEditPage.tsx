import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Title, 
  Group, 
  Text
} from '@mantine/core';
import { 
  IconArrowLeft
} from '@tabler/icons-react';

const ProjectTypeEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleBack = () => {
    navigate('/admin/project-types');
  };

  return (
    <div>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Edit Project Type</Title>
          <Text c="dimmed">Modify project type settings</Text>
        </div>
      </Group>

      <Group justify="flex-start" mb="md">
        <Button 
          variant="outline" 
          leftSection={<IconArrowLeft size={16} />}
          onClick={handleBack}
        >
          Back to Project Types
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Text>Project Type Edit functionality will be implemented here.</Text>
        <Text size="sm" c="dimmed">ID: {id}</Text>
      </Paper>
    </div>
  );
};

export default ProjectTypeEdit;