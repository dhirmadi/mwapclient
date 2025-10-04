import React, { useState } from 'react';
import { Paper, Stack, Text, Group, UnstyledButton, Collapse, LoadingOverlay, Box } from '@mantine/core';
import { IconFolder, IconFolderOpen, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { File } from '../types';

interface FolderTreeProps {
  folders: File[];
  currentPath: string;
  onFolderClick?: (folder: File) => void;
  isLoading: boolean;
}

interface FolderNode {
  folder: File;
  children: FolderNode[];
  isExpanded: boolean;
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  currentPath,
  onFolderClick,
  isLoading,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));

  // Build folder tree structure
  const buildFolderTree = (folders: File[]): FolderNode[] => {
    const tree: FolderNode[] = [];
    const pathMap = new Map<string, FolderNode>();

    // Sort folders by path depth
    const sortedFolders = [...folders].sort((a, b) => {
      const aDepth = a.path.split('/').length;
      const bDepth = b.path.split('/').length;
      return aDepth - bDepth;
    });

    sortedFolders.forEach((folder) => {
      const node: FolderNode = {
        folder,
        children: [],
        isExpanded: expandedFolders.has(folder.path),
      };
      pathMap.set(folder.path, node);

      // Find parent
      const pathParts = folder.path.split('/').filter(Boolean);
      if (pathParts.length === 1) {
        // Root level folder
        tree.push(node);
      } else {
        // Child folder - find parent
        const parentPath = '/' + pathParts.slice(0, -1).join('/');
        const parent = pathMap.get(parentPath);
        if (parent) {
          parent.children.push(node);
        } else {
          // If parent not found, add to root
          tree.push(node);
        }
      }
    });

    return tree;
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const renderFolderNode = (node: FolderNode, depth = 0): React.ReactNode => {
    const isActive = currentPath === node.folder.path;
    const isExpanded = expandedFolders.has(node.folder.path);
    const hasChildren = node.children.length > 0;

    return (
      <Box key={node.folder.fileId}>
        <UnstyledButton
          onClick={() => {
            if (onFolderClick) {
              onFolderClick(node.folder);
            }
            if (hasChildren) {
              toggleFolder(node.folder.path);
            }
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            paddingLeft: `${8 + depth * 20}px`,
            borderRadius: '4px',
            backgroundColor: isActive ? 'var(--mantine-color-blue-light)' : 'transparent',
            transition: 'background-color 0.1s',
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'var(--mantine-color-gray-0)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          <Group gap="xs" wrap="nowrap">
            {hasChildren && (
              isExpanded ? (
                <IconChevronDown size={14} color="var(--mantine-color-gray-6)" />
              ) : (
                <IconChevronRight size={14} color="var(--mantine-color-gray-6)" />
              )
            )}
            {!hasChildren && <Box style={{ width: 14 }} />}
            {isExpanded ? (
              <IconFolderOpen size={18} color="var(--mantine-color-blue-6)" />
            ) : (
              <IconFolder size={18} color="var(--mantine-color-blue-6)" />
            )}
            <Text size="sm" fw={isActive ? 600 : 400} style={{ flex: 1 }} truncate>
              {node.folder.name}
            </Text>
          </Group>
        </UnstyledButton>
        {hasChildren && (
          <Collapse in={isExpanded}>
            {node.children.map((child) => renderFolderNode(child, depth + 1))}
          </Collapse>
        )}
      </Box>
    );
  };

  const folderTree = buildFolderTree(folders);

  if (folders.length === 0 && !isLoading) {
    return (
      <Paper withBorder p="md" radius="md" style={{ width: 250, minHeight: 400 }}>
        <Text size="sm" c="dimmed" ta="center">
          No folders
        </Text>
      </Paper>
    );
  }

  return (
    <Paper withBorder p="xs" radius="md" style={{ width: 250, position: 'relative' }}>
      <LoadingOverlay visible={isLoading} />
      <Stack gap="xs">
        <Text size="sm" fw={600} c="dimmed" px="xs" py="xs">
          FOLDERS
        </Text>
        {/* Root folder */}
        <UnstyledButton
          onClick={() => {
            if (onFolderClick) {
              onFolderClick({ 
                fileId: 'root', 
                name: 'Root', 
                path: '/', 
                mimeType: 'folder', 
                status: 'processed',
                metadata: { isFolder: true }
              });
            }
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: '4px',
            backgroundColor: currentPath === '/' ? 'var(--mantine-color-blue-light)' : 'transparent',
            transition: 'background-color 0.1s',
          }}
        >
          <Group gap="xs">
            <IconFolder size={18} color="var(--mantine-color-blue-6)" />
            <Text size="sm" fw={currentPath === '/' ? 600 : 400}>
              Root
            </Text>
          </Group>
        </UnstyledButton>
        {folderTree.map((node) => renderFolderNode(node))}
      </Stack>
    </Paper>
  );
};

export default FolderTree;

