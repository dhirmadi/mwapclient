import React, { useState } from 'react';
import { Stack, Group, Button, TextInput, Select } from '@mantine/core';
import { IconSearch, IconRefresh, IconFilter } from '@tabler/icons-react';
import FileList from './FileList';
import FolderTree from './FolderTree';
import { File } from '../types';

interface FileBrowserProps {
  files: File[];
  isLoading: boolean;
  currentPath?: string;
  onPathChange?: (path: string) => void;
  onRefresh?: () => void;
}

const FileBrowser: React.FC<FileBrowserProps> = ({
  files,
  isLoading,
  currentPath = '/',
  onPathChange,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string | null>('all');

  // Filter files based on search and type
  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'folders' && file.metadata?.isFolder) ||
      (filterType === 'files' && !file.metadata?.isFolder);
    return matchesSearch && matchesType;
  });

  // Separate folders and files
  const folders = filteredFiles.filter((f) => f.metadata?.isFolder);
  const regularFiles = filteredFiles.filter((f) => !f.metadata?.isFolder);

  // File type options for filter
  const fileTypeOptions = [
    { value: 'all', label: 'All Items' },
    { value: 'folders', label: 'Folders Only' },
    { value: 'files', label: 'Files Only' },
  ];

  const handleFolderClick = (folder: File) => {
    if (onPathChange) {
      onPathChange(folder.path);
    }
  };

  return (
    <Stack gap="md">
      {/* Toolbar */}
      <Group justify="space-between">
        <Group style={{ flex: 1, maxWidth: 600 }}>
          <TextInput
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            leftSection={<IconSearch size={16} />}
            style={{ flex: 1 }}
          />
          <Select
            data={fileTypeOptions}
            value={filterType}
            onChange={setFilterType}
            leftSection={<IconFilter size={16} />}
            style={{ width: 150 }}
          />
        </Group>
        <Button
          variant="light"
          leftSection={<IconRefresh size={16} />}
          onClick={onRefresh}
          loading={isLoading}
        >
          Refresh
        </Button>
      </Group>

      {/* Folder Tree and File List */}
      <Group align="flex-start" gap="md">
        {/* Folder Tree Sidebar */}
        <FolderTree
          folders={folders}
          currentPath={currentPath}
          onFolderClick={handleFolderClick}
          isLoading={isLoading}
        />

        {/* File List Main Area */}
        <FileList
          files={regularFiles}
          folders={folders}
          currentPath={currentPath}
          onFolderClick={handleFolderClick}
          isLoading={isLoading}
        />
      </Group>
    </Stack>
  );
};

export default FileBrowser;

