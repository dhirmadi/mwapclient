# MWAP Client - Cursor AI Templates

## 🎯 Development Templates for MWAP Client

This file contains comprehensive templates for common development tasks in the MWAP Client, designed to maintain consistency and follow established patterns.

## 🏗️ Feature Development Templates

### New Feature Module Template

#### Directory Structure
```
src/features/[feature-name]/
├── hooks/
│   ├── use[FeatureName]Data.ts
│   ├── use[FeatureName]Mutation.ts
│   └── index.ts
├── pages/
│   ├── [FeatureName]List.tsx
│   ├── [FeatureName]Detail.tsx
│   ├── [FeatureName]Form.tsx
│   └── index.ts
├── types/
│   └── index.ts
└── index.ts
```

#### Feature Types Template (`types/index.ts`)
```typescript
// [FeatureName] Types

export interface [EntityName] {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Feature-specific properties
}

export interface Create[EntityName]Request {
  name: string;
  description?: string;
  // Required fields for creation
}

export interface Update[EntityName]Request {
  name?: string;
  description?: string;
  // Optional fields for update
}

export interface [EntityName]ListResponse {
  data: [EntityName][];
  total: number;
  page: number;
  limit: number;
}

export interface [EntityName]Response {
  data: [EntityName];
}

// Form types
export interface [EntityName]FormData {
  name: string;
  description?: string;
  // Form-specific fields
}

// Filter types
export interface [EntityName]Filters {
  search?: string;
  status?: string;
  // Filter-specific fields
}
```

#### Data Fetching Hook Template (`hooks/use[FeatureName]Data.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/utils/api';
import type { [EntityName], [EntityName]ListResponse } from '../types';

// Single item query
export const use[EntityName] = (id: string) => {
  return useQuery({
    queryKey: ['[feature-name]', id],
    queryFn: async (): Promise<[EntityName]> => {
      const response = await apiClient.get(`/api/v1/[feature-name]/${id}`);
      return response.data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// List query
export const use[EntityName]List = (filters?: [EntityName]Filters) => {
  return useQuery({
    queryKey: ['[feature-name]', 'list', filters],
    queryFn: async (): Promise<[EntityName]ListResponse> => {
      const response = await apiClient.get('/api/v1/[feature-name]', {
        params: filters,
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
```

#### Mutation Hook Template (`hooks/use[FeatureName]Mutation.ts`)
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/shared/utils/api';
import type { 
  [EntityName], 
  Create[EntityName]Request, 
  Update[EntityName]Request 
} from '../types';

// Create mutation
export const useCreate[EntityName] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Create[EntityName]Request): Promise<[EntityName]> => {
      const response = await apiClient.post('/api/v1/[feature-name]', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[feature-name]'] });
      notifications.show({
        title: 'Success',
        message: '[EntityName] created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });
};

// Update mutation
export const useUpdate[EntityName] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: Update[EntityName]Request 
    }): Promise<[EntityName]> => {
      const response = await apiClient.patch(`/api/v1/[feature-name]/${id}`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['[feature-name]'] });
      queryClient.setQueryData(['[feature-name]', data.id], data);
      notifications.show({
        title: 'Success',
        message: '[EntityName] updated successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });
};

// Delete mutation
export const useDelete[EntityName] = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await apiClient.delete(`/api/v1/[feature-name]/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['[feature-name]'] });
      notifications.show({
        title: 'Success',
        message: '[EntityName] deleted successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      notifications.show({
        title: 'Error',
        message: error.message,
        color: 'red',
      });
    },
  });
};
```

## 🎨 Component Templates

### List Component Template (`pages/[FeatureName]List.tsx`)
```typescript
import React, { useState } from 'react';
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  TextInput,
  Table,
  ActionIcon,
  LoadingOverlay,
  Alert,
  Pagination,
} from '@mantine/core';
import {
  IconPlus,
  IconSearch,
  IconEdit,
  IconTrash,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '@/core/context/AuthContext';
import { use[EntityName]List, useDelete[EntityName] } from '../hooks';
import type { [EntityName]Filters } from '../types';

interface [FeatureName]ListProps {
  onEdit?: (item: [EntityName]) => void;
  onCreate?: () => void;
}

const [FeatureName]List: React.FC<[FeatureName]ListProps> = ({
  onEdit,
  onCreate,
}) => {
  const { isAuthenticated } = useAuth0();
  const { hasRole } = useRoles();
  const [filters, setFilters] = useState<[EntityName]Filters>({});
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = use[EntityName]List(filters);
  const deleteMutation = useDelete[EntityName]();

  const handleSearch = (search: string) => {
    setFilters({ ...filters, search });
    setPage(1);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteMutation.mutate(id);
    }
  };

  if (!isAuthenticated) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        Please log in to access this page.
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red">
        Error loading data: {error.message}
      </Alert>
    );
  }

  return (
    <Container size="xl">
      <Stack>
        <Group justify="space-between">
          <Title order={2}>[FeatureName] Management</Title>
          {hasRole('ADMIN') && onCreate && (
            <Button leftSection={<IconPlus size={16} />} onClick={onCreate}>
              Create [EntityName]
            </Button>
          )}
        </Group>

        <Group>
          <TextInput
            placeholder="Search [feature-name]..."
            leftSection={<IconSearch size={16} />}
            value={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
            style={{ flex: 1 }}
          />
        </Group>

        <div style={{ position: 'relative' }}>
          <LoadingOverlay visible={isLoading} />
          
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Created</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data?.data.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.description || '-'}</Table.Td>
                  <Table.Td>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {hasRole('ADMIN') && onEdit && (
                        <ActionIcon
                          variant="subtle"
                          onClick={() => onEdit(item)}
                        >
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                      {hasRole('ADMIN') && (
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          onClick={() => handleDelete(item.id)}
                          loading={deleteMutation.isPending}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {data && data.total > 0 && (
            <Group justify="center" mt="md">
              <Pagination
                value={page}
                onChange={setPage}
                total={Math.ceil(data.total / 10)}
              />
            </Group>
          )}
        </div>
      </Stack>
    </Container>
  );
};

export default [FeatureName]List;
```

### Form Component Template (`pages/[FeatureName]Form.tsx`)
```typescript
import React from 'react';
import {
  Modal,
  Button,
  TextInput,
  Textarea,
  Stack,
  Group,
} from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { z } from 'zod';
import { useCreate[EntityName], useUpdate[EntityName] } from '../hooks';
import type { [EntityName] } from '../types';

const [entityName]Schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof [entityName]Schema>;

interface [FeatureName]FormProps {
  opened: boolean;
  onClose: () => void;
  item?: [EntityName];
}

const [FeatureName]Form: React.FC<[FeatureName]FormProps> = ({
  opened,
  onClose,
  item,
}) => {
  const isEditing = !!item;
  const createMutation = useCreate[EntityName]();
  const updateMutation = useUpdate[EntityName]();

  const form = useForm<FormData>({
    validate: zodResolver([entityName]Schema),
    initialValues: {
      name: item?.name || '',
      description: item?.description || '',
    },
  });

  const handleSubmit = async (values: FormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: item.id,
          data: values,
        });
      } else {
        await createMutation.mutateAsync(values);
      }
      form.reset();
      onClose();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEditing ? 'Edit [EntityName]' : 'Create [EntityName]'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="Enter name"
            required
            {...form.getInputProps('name')}
          />

          <Textarea
            label="Description"
            placeholder="Enter description"
            rows={3}
            {...form.getInputProps('description')}
          />

          <Group justify="flex-end">
            <Button variant="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isLoading}>
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default [FeatureName]Form;
```

## 🔒 Security Templates

### Protected Route Template
```typescript
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRoles } from '@/core/context/AuthContext';
import { LoadingSpinner } from '@/shared/components/LoadingSpinner';
import { UnauthorizedMessage } from '@/shared/components/UnauthorizedMessage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const { hasRole, hasPermission } = useRoles();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <UnauthorizedMessage message="Please log in to access this page" />
    );
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <UnauthorizedMessage message="You don't have permission to access this page" />
    );
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <UnauthorizedMessage message="You don't have permission to perform this action" />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
```

### Role-Based Component Template
```typescript
import React from 'react';
import { useRoles } from '@/core/context/AuthContext';

interface RoleBasedComponentProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles,
  fallback = null,
}) => {
  const { hasAnyRole } = useRoles();

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleBasedComponent;
```

## 🧪 Testing Templates

### Component Test Template
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { vi } from 'vitest';
import [ComponentName] from '../[ComponentName]';

// Mock dependencies
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'test-user' },
  }),
}));

vi.mock('@/core/context/AuthContext', () => ({
  useRoles: () => ({
    hasRole: vi.fn(() => true),
    hasPermission: vi.fn(() => true),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe('[ComponentName]', () => {
  it('renders correctly', () => {
    render(<[ComponentName] />, { wrapper: createWrapper() });
    
    expect(screen.getByText('[Expected Text]')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockOnClick = vi.fn();
    
    render(<[ComponentName] onClick={mockOnClick} />, { 
      wrapper: createWrapper() 
    });
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalled();
    });
  });

  it('displays loading state', () => {
    render(<[ComponentName] loading />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    const error = new Error('Test error');
    
    render(<[ComponentName] error={error} />, { wrapper: createWrapper() });
    
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });
});
```

### Hook Test Template
```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { use[HookName] } from '../use[HookName]';

// Mock API client
vi.mock('@/shared/utils/api', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('use[HookName]', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: '1', name: 'Test' };
    
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { data: mockData },
    });

    const { result } = renderHook(() => use[HookName]('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });

  it('handles error state', async () => {
    const error = new Error('API Error');
    
    vi.mocked(apiClient.get).mockRejectedValue(error);

    const { result } = renderHook(() => use[HookName]('1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });
});
```

## 📝 Documentation Templates

### Feature Documentation Template
```markdown
# [FeatureName] Feature

## Overview

Brief description of the feature and its purpose in the MWAP Client.

## Architecture

### Components
- **[FeatureName]List**: List view with filtering and pagination
- **[FeatureName]Detail**: Detailed view of individual items
- **[FeatureName]Form**: Create/edit form with validation

### Hooks
- **use[EntityName]**: Fetch single item
- **use[EntityName]List**: Fetch list with filtering
- **useCreate[EntityName]**: Create new item
- **useUpdate[EntityName]**: Update existing item
- **useDelete[EntityName]**: Delete item

### Types
- **[EntityName]**: Main entity interface
- **Create[EntityName]Request**: Creation payload
- **Update[EntityName]Request**: Update payload
- **[EntityName]ListResponse**: List response format

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/[feature-name]` | List items |
| GET | `/api/v1/[feature-name]/:id` | Get single item |
| POST | `/api/v1/[feature-name]` | Create item |
| PATCH | `/api/v1/[feature-name]/:id` | Update item |
| DELETE | `/api/v1/[feature-name]/:id` | Delete item |

## Security

### Required Roles
- **View**: [ROLE_NAME]
- **Create**: [ROLE_NAME]
- **Update**: [ROLE_NAME]
- **Delete**: [ROLE_NAME]

### Validation
- Input validation using Zod schemas
- Server-side validation on API endpoints
- Role-based access control on all operations

## Usage Examples

### Basic Usage
```typescript
import { [FeatureName]List } from '@/features/[feature-name]';

const MyComponent = () => {
  return <[FeatureName]List />;
};
```

### With Custom Handlers
```typescript
import { [FeatureName]List, [FeatureName]Form } from '@/features/[feature-name]';

const MyComponent = () => {
  const [formOpened, setFormOpened] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  return (
    <>
      <[FeatureName]List
        onCreate={() => setFormOpened(true)}
        onEdit={(item) => {
          setEditingItem(item);
          setFormOpened(true);
        }}
      />
      <[FeatureName]Form
        opened={formOpened}
        onClose={() => {
          setFormOpened(false);
          setEditingItem(null);
        }}
        item={editingItem}
      />
    </>
  );
};
```

## Testing

### Component Tests
```bash
npm test src/features/[feature-name]/pages/[FeatureName]List.test.tsx
```

### Hook Tests
```bash
npm test src/features/[feature-name]/hooks/use[EntityName].test.ts
```

## Future Enhancements

- [ ] Advanced filtering options
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Real-time updates
```

## 🎯 Usage Guidelines

### When to Use These Templates
1. **New Feature**: Use feature module template for complete new features
2. **New Component**: Use component templates for UI components
3. **API Integration**: Use hook templates for data fetching
4. **Security**: Use security templates for protected routes
5. **Testing**: Use test templates for comprehensive testing
6. **Documentation**: Use documentation templates for feature docs

### Customization Guidelines
1. **Replace Placeholders**: Update all `[FeatureName]`, `[EntityName]`, etc.
2. **Adapt to Requirements**: Modify fields, validation, and logic as needed
3. **Follow Patterns**: Maintain established naming and structure conventions
4. **Add Security**: Ensure proper authentication and authorization
5. **Include Testing**: Add comprehensive test coverage
6. **Update Documentation**: Keep documentation current with implementation

### Quality Checklist
- [ ] All placeholders replaced with actual values
- [ ] TypeScript strict compliance maintained
- [ ] Security measures implemented (auth, validation)
- [ ] Error handling included
- [ ] Loading states handled
- [ ] Accessibility considerations included
- [ ] Performance optimizations applied
- [ ] Tests written and passing
- [ ] Documentation updated

**Remember: These templates are starting points that should be customized to fit specific requirements while maintaining the established patterns and quality standards of the MWAP Client.**