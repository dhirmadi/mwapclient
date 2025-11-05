import React from 'react';
import { Modal, Stack, Group, Button, Text, ScrollArea, Alert } from '@mantine/core';
import { IconChevronRight, IconChevronDown, IconFolder, IconAlertCircle } from '@tabler/icons-react';
import { useAuth } from '@/core/context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import api from '@/shared/utils/api';
import { notifications } from '@mantine/notifications';

interface FolderBrowserModalProps {
  opened: boolean;
  onClose: () => void;
  integrationId?: string;
  initialPath?: string;
  onConfirm: (selectedPath: string) => void;
}

const normalizePath = (p: string) => {
  if (!p) return '/';
  if (!p.startsWith('/')) return `/${p}`;
  return p;
};

type Capabilities = {
  supportsPath: boolean;
  supportsId: boolean;
  supportsContainers: boolean;
  maxPageSize: number | null;
} | null;

type FolderItem = {
  id?: string;
  name: string;
  path?: string | null;
  isFolder: boolean;
  isContainer?: boolean;
};

type ListResponse = {
  success: boolean;
  data: FolderItem[];
  nextCursor?: string | null;
  hasMore?: boolean;
  capabilities?: Capabilities;
};

type TreeNode = {
  key: string; // stable key (id or path or containerId)
  name: string;
  depth: number;
  isContainer: boolean;
  isFolder: boolean;
  path?: string | null;
  id?: string;
  containerId?: string;
  expanded?: boolean;
  loading?: boolean;
  children?: TreeNode[];
  hasMore?: boolean;
  nextCursor?: string | null;
};

const FolderBrowserModal: React.FC<FolderBrowserModalProps> = ({ opened, onClose, integrationId, initialPath = '/', onConfirm }) => {
  const { currentTenant } = useAuth();
  const queryClient = useQueryClient();

  const [capabilities, setCapabilities] = React.useState<Capabilities>(null);
  const [rootNodes, setRootNodes] = React.useState<TreeNode[]>([]);
  const [selectedNodeKey, setSelectedNodeKey] = React.useState<string>('');
  const [loadingRoot, setLoadingRoot] = React.useState(false);

  const fetchList = React.useCallback(async (params: { containerId?: string; folderId?: string; path?: string; cursor?: string | null; }): Promise<ListResponse> => {
    if (!currentTenant || !integrationId) return { success: true, data: [], nextCursor: null, hasMore: false, capabilities: null };
    const res = await queryClient.fetchQuery({
      queryKey: ['integration-folders-tree', currentTenant, integrationId, params.containerId, params.folderId, params.path, params.cursor],
      queryFn: async () => {
        const response = await api.get(`/tenants/${currentTenant}/integrations/${integrationId}/folders`, { params });
        return response.data as ListResponse;
      },
      staleTime: 30_000,
    });
    return res;
  }, [currentTenant, integrationId, queryClient]);

  const toNodes = (items: FolderItem[], depth: number, containerId?: string): TreeNode[] => {
    return items.filter(i => i.isFolder || i.isContainer).map((i) => ({
      key: (i.isContainer ? `container:${i.id}` : (i.id ? `id:${i.id}` : `path:${i.path}`))!,
      name: i.name,
      depth,
      isContainer: !!i.isContainer,
      isFolder: !!i.isFolder,
      id: i.id,
      path: i.path ?? null,
      containerId,
      expanded: false,
      loading: false,
      children: undefined,
      hasMore: false,
      nextCursor: null,
    }));
  };

  const loadRoot = React.useCallback(async () => {
    try {
      setLoadingRoot(true);
      const result = await fetchList({});
      setCapabilities(result.capabilities ?? null);
      setRootNodes(toNodes(result.data ?? [], 0, undefined));
    } catch (e: any) {
      notifications.show({ title: 'Folder Browser', message: 'Unable to load folders', color: 'red' });
      setRootNodes([]);
    } finally {
      setLoadingRoot(false);
    }
  }, [fetchList]);

  React.useEffect(() => {
    if (opened) {
      setSelectedNodeKey('');
      loadRoot();
    }
  }, [opened, loadRoot]);

  const expandNode = async (nodeKey: string) => {
    const updateNode = (updater: (n: TreeNode) => TreeNode) => setRootNodes(prev => prev.map(n => applyNodeUpdate(n, nodeKey, updater)));
    updateNode(n => ({ ...n, loading: true }));
    try {
      const target = findNode(rootNodes, nodeKey);
      if (!target) return;
      const params: any = {};
      if (target.isContainer) params.containerId = target.id;
      if (!target.isContainer) {
        if (capabilities?.supportsId && target.id) params.folderId = target.id;
        else if (capabilities?.supportsPath && target.path) params.path = target.path;
      }
      const result = await fetchList(params);
      const children = toNodes(result.data ?? [], (target.depth + 1), params.containerId || target.containerId);
      updateNode(n => ({ ...n, expanded: true, loading: false, children, hasMore: !!result.hasMore, nextCursor: result.nextCursor ?? null }));
    } catch (e: any) {
      notifications.show({ title: 'Folder Browser', message: 'Failed to expand folder', color: 'red' });
      updateNode(n => ({ ...n, loading: false }));
    }
  };

  const loadMore = async (nodeKey: string) => {
    const updateNode = (updater: (n: TreeNode) => TreeNode) => setRootNodes(prev => prev.map(n => applyNodeUpdate(n, nodeKey, updater)));
    const target = findNode(rootNodes, nodeKey);
    if (!target || !target.nextCursor) return;
    updateNode(n => ({ ...n, loading: true }));
    try {
      const params: any = { cursor: target.nextCursor };
      if (target.isContainer) params.containerId = target.id;
      if (!target.isContainer) {
        if (capabilities?.supportsId && target.id) params.folderId = target.id;
        else if (capabilities?.supportsPath && target.path) params.path = target.path;
      }
      const result = await fetchList(params);
      const more = toNodes(result.data ?? [], target.depth + 1, params.containerId || target.containerId);
      updateNode(n => ({ ...n, loading: false, children: [ ...(n.children || []), ...more ], hasMore: !!result.hasMore, nextCursor: result.nextCursor ?? null }));
    } catch (e: any) {
      notifications.show({ title: 'Folder Browser', message: 'Failed to load more', color: 'red' });
      updateNode(n => ({ ...n, loading: false }));
    }
  };

  const toggleExpand = (node: TreeNode) => {
    if (node.expanded) {
      // collapse only toggles flag (retain children for re-expand speed)
      setRootNodes(prev => prev.map(n => applyNodeUpdate(n, node.key, x => ({ ...x, expanded: false }))));
    } else {
      void expandNode(node.key);
    }
  };

  const confirmSelection = () => {
    const node = findNode(rootNodes, selectedNodeKey);
    if (!node) return;
    const selectedPath = normalizePath(node.path || '/');
    onConfirm(selectedPath);
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Browse Folders" size="lg" centered>
      <Stack gap="md">
        {!loadingRoot && rootNodes.length === 0 && (
          <Alert icon={<IconAlertCircle size={16} />} color="yellow" variant="light">
            <Text size="sm">Folder browsing is not available for this integration.</Text>
          </Alert>
        )}

        <ScrollArea.Autosize mah={420}>
          <Stack gap={4} styles={{ root: { cursor: 'default' } }}>
            {renderTree(
              rootNodes,
              {
                onToggle: toggleExpand,
                onSelect: (key: string) => setSelectedNodeKey(key),
                onLoadMore: loadMore,
                selectedKey: selectedNodeKey,
              }
            )}
          </Stack>
        </ScrollArea.Autosize>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button disabled={!selectedNodeKey} onClick={confirmSelection}>OK</Button>
        </Group>
      </Stack>
    </Modal>
  );
};

function applyNodeUpdate(node: TreeNode, key: string, updater: (n: TreeNode) => TreeNode): TreeNode {
  if (node.key === key) return updater(node);
  if (!node.children) return node;
  return { ...node, children: node.children.map(child => applyNodeUpdate(child, key, updater)) };
}

function findNode(nodeList: TreeNode[], key: string): TreeNode | null {
  for (const n of nodeList) {
    if (n.key === key) return n;
    if (n.children) {
      const found = findNode(n.children, key);
      if (found) return found;
    }
  }
  return null;
}

// New: recursive renderer for the tree so that deeper levels display correctly
function renderTree(
  nodes: TreeNode[],
  handlers: {
    onToggle: (node: TreeNode) => void;
    onSelect: (key: string) => void;
    onLoadMore: (key: string) => void;
    selectedKey: string;
  }
): React.ReactNode {
  return nodes.map(node => (
    <React.Fragment key={node.key}>
      <TreeRow
        node={node}
        onToggle={() => handlers.onToggle(node)}
        onSelect={() => handlers.onSelect(node.key)}
        onLoadMore={() => handlers.onLoadMore(node.key)}
        selected={handlers.selectedKey === node.key}
      />
      {node.expanded && node.children && node.children.length > 0 && (
        renderTree(node.children, handlers)
      )}
    </React.Fragment>
  ));
}

type TreeRowProps = {
  node: TreeNode;
  onToggle: () => void;
  onSelect: () => void;
  onLoadMore: () => void;
  selected: boolean;
};

function TreeRow({ node, onToggle, onSelect, onLoadMore, selected }: TreeRowProps) {
  const indent = node.depth * 16;
  return (
    <Group
      gap={8}
      style={{ marginLeft: indent, padding: '4px 6px', borderRadius: 6, background: selected ? 'rgba(0,0,0,0.05)' : 'transparent' }}
    >
      <Button
        variant="subtle"
        size="compact-xs"
        onClick={onToggle}
        disabled={node.loading}
        leftSection={node.expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
      >
        {/* caret only */}
      </Button>
      <IconFolder size={16} />
      <Button variant="subtle" size="compact-xs" onClick={onSelect}>
        <Text size="sm">{node.name}</Text>
      </Button>
      {node.loading && (
        <Text size="xs" c="dimmed">Loading…</Text>
      )}
      {node.expanded && node.hasMore && !node.loading && (
        <Button variant="light" size="compact-xs" onClick={onLoadMore}>Load more</Button>
      )}
    </Group>
  );
}

export default FolderBrowserModal;


