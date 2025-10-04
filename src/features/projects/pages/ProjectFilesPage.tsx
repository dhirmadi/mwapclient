import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title, Alert, Stack } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useFiles } from '../../files/hooks/useFiles';
import { FileBrowser } from '../../files/components';

const ProjectFilesPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [currentPath, setCurrentPath] = useState('/');

  const { files, isLoading, error, refetch } = useFiles(projectId!, { 
    folder: currentPath === '/' ? undefined : currentPath 
  });

  if (!projectId) {
    return (
      <Alert icon={<IconInfoCircle size={16} />} title="Error" color="red">
        Project ID is required to view files.
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      <Title order={2}>Project Files</Title>

      {error && (
        <Alert icon={<IconInfoCircle size={16} />} title="Error loading files" color="red">
          {error instanceof Error ? error.message : 'Failed to load project files'}
        </Alert>
      )}

      <FileBrowser
        files={files}
        isLoading={isLoading}
        currentPath={currentPath}
        onPathChange={setCurrentPath}
        onRefresh={refetch}
      />
    </Stack>
  );
};

export default ProjectFilesPage;