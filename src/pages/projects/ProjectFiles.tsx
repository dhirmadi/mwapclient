import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Button, 
  Paper, 
  Title, 
  Text, 
  Group, 
  ActionIcon, 
  Menu, 
  TextInput, 
  Breadcrumbs, 
  Anchor, 
  Table, 
  Checkbox, 
  Tooltip, 
  Modal, 
  Select 
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  IconFolder, 
  IconFile, 
  IconDownload, 
  IconTrash, 
  IconUpload, 
  IconFolderPlus, 
  IconDotsVertical, 
  IconSearch, 
  IconArrowUp, 
  IconArrowLeft, 
  IconRefresh, 
  IconFilter, 
  IconEye 
} from '@tabler/icons-react';
import { PageHeader } from '../../components/layout';
import { useAuth } from '../../context/AuthContext';
import useFiles from '../../hooks/useFiles';
import { useProjects } from '../../hooks/useProjects';
import { File } from '../../types/file';
import { Project } from '../../types/project';
import { LoadingSpinner } from '../../components/common';

const ProjectFiles: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { hasProjectRole } = useAuth();
  const { fetchProjectById } = useProjects();
  const { fetchProjectFiles } = useFiles();
  
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'type' | 'size' | 'modified'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [fileTypeFilter, setFileTypeFilter] = useState<string | null>(null);
  
  // Check if user has edit permissions
  const canEdit = projectId ? hasProjectRole(projectId, 'DEPUTY') : false;

  useEffect(() => {
    const loadData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        // Load project details
        const projectData = await fetchProjectById(projectId);
        setProject(projectData);
        
        // Parse path from URL
        const pathMatch = location.pathname.match(/\/projects\/[^/]+\/files(\/.*)?/);
        const urlPath = pathMatch && pathMatch[1] ? decodeURIComponent(pathMatch[1]) : '/';
        setCurrentPath(urlPath);
        
        // Load files for the current path
        const filesData = await fetchProjectFiles(projectId, {
          folder: urlPath,
          recursive: false,
        });
        setFiles(filesData);
      } catch (error) {
        console.error('Failed to load data:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to load project files',
          color: 'red',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [projectId, location.pathname]);

  const navigateToFolder = (path: string) => {
    navigate(`/projects/${projectId}/files${path === '/' ? '' : path}`);
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateToFolder(parentPath);
  };

  const handleSort = (column: 'name' | 'type' | 'size' | 'modified') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // In a real app, this would trigger a search API call
  };

  const handleRefresh = async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const filesData = await fetchProjectFiles(projectId, {
        folder: currentPath,
        recursive: false,
      });
      setFiles(filesData);
    } catch (error) {
      console.error('Failed to refresh files:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to refresh files',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!projectId || !newFolderName.trim()) return;
    
    // In a real app, this would call an API to create the folder
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      notifications.show({
        title: 'Success',
        message: `Folder "${newFolderName}" created successfully`,
        color: 'green',
      });
      
      setNewFolderModalOpen(false);
      setNewFolderName('');
      handleRefresh();
    } catch (error) {
      console.error('Failed to create folder:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to create folder',
        color: 'red',
      });
    }
  };

  const handleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId) 
        : [...prev, fileId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFiles(files.map(file => file._id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedFiles.length} item(s)?`)) {
      try {
        // In a real app, this would call an API to delete the files
        await new Promise(resolve => setTimeout(resolve, 500));
        
        notifications.show({
          title: 'Success',
          message: `${selectedFiles.length} item(s) deleted successfully`,
          color: 'green',
        });
        
        setSelectedFiles([]);
        handleRefresh();
      } catch (error) {
        console.error('Failed to delete files:', error);
        notifications.show({
          title: 'Error',
          message: 'Failed to delete files',
          color: 'red',
        });
      }
    }
  };

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { title: 'Root', href: '/' },
      ...pathParts.map((part, index) => {
        const path = '/' + pathParts.slice(0, index + 1).join('/');
        return { title: part, href: path };
      }),
    ];
    
    return breadcrumbs.map((crumb, index) => (
      <Anchor
        key={index}
        component="button"
        onClick={() => navigateToFolder(crumb.href)}
        underline="hover"
        fw={index === breadcrumbs.length - 1 ? 'bold' : 'normal'}
      >
        {crumb.title}
      </Anchor>
    ));
  };

  // Sort and filter files
  const filteredFiles = files
    .filter(file => {
      // Apply search filter
      if (searchQuery) {
        return file.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      // Apply file type filter
      if (fileTypeFilter) {
        if (fileTypeFilter === 'folder' && file.type === 'folder') {
          return true;
        }
        if (fileTypeFilter !== 'folder' && file.type === 'file') {
          const extension = file.name.split('.').pop()?.toLowerCase() || '';
          return fileTypeFilter === extension;
        }
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Always sort folders before files
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      // Then apply the selected sort
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'type':
          const aExt = a.name.split('.').pop() || '';
          const bExt = b.name.split('.').pop() || '';
          comparison = aExt.localeCompare(bExt);
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'modified':
          comparison = new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <PageHeader
        title={`Files: ${project?.name || ''}`}
        description="Browse and manage project files"
      />

      <Paper withBorder p="md" radius="md">
        {/* Toolbar */}
        <Group justify="space-between" mb="md">
          <Group>
            <Tooltip label="Go up">
              <ActionIcon 
                variant="light" 
                onClick={navigateUp}
                disabled={currentPath === '/'}
              >
                <IconArrowUp size={16} />
              </ActionIcon>
            </Tooltip>
            
            <Tooltip label="Refresh">
              <ActionIcon variant="light" onClick={handleRefresh}>
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            
            {canEdit && (
              <>
                <Button 
                  variant="light" 
                  size="xs"
                  leftSection={<IconFolderPlus size={16} />}
                  onClick={() => setNewFolderModalOpen(true)}
                >
                  New Folder
                </Button>
                
                <Button 
                  variant="light" 
                  size="xs"
                  leftSection={<IconUpload size={16} />}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </>
            )}
            
            {selectedFiles.length > 0 && (
              <>
                <Button 
                  variant="light" 
                  size="xs"
                  leftSection={<IconDownload size={16} />}
                >
                  Download
                </Button>
                
                {canEdit && (
                  <Button 
                    variant="light" 
                    size="xs"
                    color="red"
                    leftSection={<IconTrash size={16} />}
                    onClick={handleDeleteSelected}
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </Group>
          
          <Group>
            <TextInput
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
              size="xs"
              w={200}
            />
            
            <Tooltip label="Filter">
              <ActionIcon 
                variant="light" 
                onClick={() => setFilterModalOpen(true)}
                color={fileTypeFilter ? 'blue' : 'gray'}
              >
                <IconFilter size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        
        {/* Breadcrumbs */}
        <Breadcrumbs mb="md" separator="/">
          {generateBreadcrumbs()}
        </Breadcrumbs>
        
        {/* Files Table */}
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={40}>
                <Checkbox
                  checked={selectedFiles.length === files.length && files.length > 0}
                  indeterminate={selectedFiles.length > 0 && selectedFiles.length < files.length}
                  onChange={(e) => handleSelectAll(e.currentTarget.checked)}
                />
              </Table.Th>
              <Table.Th 
                onClick={() => handleSort('name')}
                style={{ cursor: 'pointer' }}
              >
                Name {sortBy === 'name' && (
                  sortDirection === 'asc' ? '↑' : '↓'
                )}
              </Table.Th>
              <Table.Th 
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer' }}
              >
                Type {sortBy === 'type' && (
                  sortDirection === 'asc' ? '↑' : '↓'
                )}
              </Table.Th>
              <Table.Th 
                onClick={() => handleSort('size')}
                style={{ cursor: 'pointer' }}
              >
                Size {sortBy === 'size' && (
                  sortDirection === 'asc' ? '↑' : '↓'
                )}
              </Table.Th>
              <Table.Th 
                onClick={() => handleSort('modified')}
                style={{ cursor: 'pointer' }}
              >
                Modified {sortBy === 'modified' && (
                  sortDirection === 'asc' ? '↑' : '↓'
                )}
              </Table.Th>
              <Table.Th w={80}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredFiles.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6} align="center">
                  <Text c="dimmed" py="lg">
                    No files found in this location
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              filteredFiles.map((file) => (
                <Table.Tr key={file._id}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => handleFileSelection(file._id)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {file.type === 'folder' ? (
                        <IconFolder size={16} color="blue" />
                      ) : (
                        <IconFile size={16} />
                      )}
                      {file.type === 'folder' ? (
                        <Anchor 
                          component="button" 
                          onClick={() => navigateToFolder(`${currentPath === '/' ? '' : currentPath}/${file.name}`)}
                        >
                          {file.name}
                        </Anchor>
                      ) : (
                        <Text>{file.name}</Text>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    {file.type === 'folder' ? (
                      'Folder'
                    ) : (
                      file.name.split('.').pop()?.toUpperCase() || 'Unknown'
                    )}
                  </Table.Td>
                  <Table.Td>
                    {file.type === 'folder' ? (
                      '-'
                    ) : (
                      formatFileSize(file.size || 0)
                    )}
                  </Table.Td>
                  <Table.Td>
                    {new Date(file.modifiedAt).toLocaleString()}
                  </Table.Td>
                  <Table.Td>
                    <Menu position="bottom-end" withArrow>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        {file.type !== 'folder' && (
                          <Menu.Item leftSection={<IconEye size={14} />}>
                            Preview
                          </Menu.Item>
                        )}
                        <Menu.Item leftSection={<IconDownload size={14} />}>
                          Download
                        </Menu.Item>
                        {canEdit && (
                          <Menu.Item 
                            leftSection={<IconTrash size={14} />}
                            color="red"
                          >
                            Delete
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      {/* New Folder Modal */}
      <Modal
        opened={newFolderModalOpen}
        onClose={() => setNewFolderModalOpen(false)}
        title="Create New Folder"
      >
        <TextInput
          label="Folder Name"
          placeholder="Enter folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.currentTarget.value)}
          required
          mb="md"
        />
        
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => setNewFolderModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
            Create
          </Button>
        </Group>
      </Modal>

      {/* Upload Modal */}
      <Modal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Files"
        size="lg"
      >
        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
          <IconUpload size={32} className="mx-auto mb-4 text-gray-400" />
          <Text size="sm" mb="xs">
            Drag and drop files here, or click to select files
          </Text>
          <Text size="xs" c="dimmed" mb="md">
            Maximum file size: 100MB
          </Text>
          <Button variant="outline">
            Select Files
          </Button>
        </div>
        
        <Group justify="flex-end" mt="xl">
          <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setUploadModalOpen(false)}>
            Upload
          </Button>
        </Group>
      </Modal>

      {/* Filter Modal */}
      <Modal
        opened={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        title="Filter Files"
      >
        <Select
          label="File Type"
          placeholder="Select file type"
          value={fileTypeFilter}
          onChange={setFileTypeFilter}
          clearable
          data={[
            { value: 'folder', label: 'Folders' },
            { value: 'pdf', label: 'PDF Documents' },
            { value: 'doc', label: 'Word Documents' },
            { value: 'xls', label: 'Excel Spreadsheets' },
            { value: 'jpg', label: 'JPEG Images' },
            { value: 'png', label: 'PNG Images' },
            { value: 'txt', label: 'Text Files' },
          ]}
          mb="md"
        />
        
        <Group justify="flex-end">
          <Button 
            variant="outline" 
            onClick={() => {
              setFileTypeFilter(null);
              setFilterModalOpen(false);
            }}
          >
            Clear Filters
          </Button>
          <Button onClick={() => setFilterModalOpen(false)}>
            Apply
          </Button>
        </Group>
      </Modal>
    </div>
  );
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default ProjectFiles;