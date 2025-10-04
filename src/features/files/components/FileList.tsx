import React from 'react';
import { Table, Paper, Text, Badge, Group, ActionIcon, Tooltip, LoadingOverlay, Box } from '@mantine/core';
import { IconFolder, IconFile, IconExternalLink, IconDownload } from '@tabler/icons-react';
import { File } from '../types';
import { formatBytes, formatDate } from '../../../shared/utils/format';

interface FileListProps {
  files: File[];
  folders: File[];
  currentPath: string;
  onFolderClick?: (folder: File) => void;
  isLoading: boolean;
}

const FileList: React.FC<FileListProps> = ({
  files,
  folders,
  currentPath,
  onFolderClick,
  isLoading,
}) => {
  const allItems = [...folders, ...files];

  const getStatusColor = (status: File['status']) => {
    switch (status) {
      case 'processed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleItemClick = (item: File) => {
    if (item.metadata?.isFolder && onFolderClick) {
      onFolderClick(item);
    }
  };

  const handleExternalLink = (item: File) => {
    if (item.metadata?.webViewLink) {
      window.open(item.metadata.webViewLink, '_blank', 'noopener,noreferrer');
    }
  };

  if (allItems.length === 0 && !isLoading) {
    return (
      <Paper withBorder p="xl" radius="md" style={{ flex: 1, minHeight: 400 }}>
        <Text ta="center" c="dimmed" size="lg">
          No files or folders found
        </Text>
        <Text ta="center" c="dimmed" size="sm" mt="xs">
          {currentPath === '/' ? 'This project has no files yet.' : 'This folder is empty.'}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="md" style={{ flex: 1, position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      <Box style={{ overflowX: 'auto' }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Size</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Modified</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {allItems.map((item) => (
              <Table.Tr
                key={item.fileId}
                style={{
                  cursor: item.metadata?.isFolder ? 'pointer' : 'default',
                }}
                onClick={() => handleItemClick(item)}
              >
                <Table.Td>
                  <Group gap="xs">
                    {item.metadata?.isFolder ? (
                      <IconFolder size={20} color="var(--mantine-color-blue-6)" />
                    ) : (
                      <IconFile size={20} color="var(--mantine-color-gray-6)" />
                    )}
                    <Text fw={item.metadata?.isFolder ? 600 : 400}>{item.name}</Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {item.metadata?.isFolder ? 'Folder' : item.mimeType || 'File'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {item.metadata?.isFolder ? '—' : item.size ? formatBytes(item.size) : '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(item.status)} variant="light" size="sm">
                    {item.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {item.modifiedAt ? formatDate(item.modifiedAt) : '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {item.metadata?.webViewLink && (
                      <Tooltip label="Open in provider">
                        <ActionIcon
                          variant="subtle"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExternalLink(item);
                          }}
                        >
                          <IconExternalLink size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                    {!item.metadata?.isFolder && (
                      <Tooltip label="Download (coming soon)">
                        <ActionIcon variant="subtle" color="gray" disabled>
                          <IconDownload size={16} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Paper>
  );
};

export default FileList;

