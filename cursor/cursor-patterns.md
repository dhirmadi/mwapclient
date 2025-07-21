# 🧩 MWAP Client - Code Patterns for Cursor AI

## 🏗️ Architecture Patterns

### Feature-Based Organization
```typescript
// Standard feature structure
src/features/[feature-name]/
├── components/           # Feature-specific components
│   ├── FeatureCard.tsx
│   ├── FeatureForm.tsx
│   └── index.ts
├── hooks/               # Feature-specific hooks
│   ├── useFeature.ts
│   ├── useFeatureActions.ts
│   └── index.ts
├── pages/               # Feature pages
│   ├── FeatureListPage.tsx
│   ├── FeatureDetailPage.tsx
│   └── index.ts
├── types/               # Feature type definitions
│   ├── feature.types.ts
│   └── index.ts
└── utils/               # Feature utilities
    ├── featureUtils.ts
    └── index.ts
```

### Component Export Pattern
```typescript
// src/features/[feature]/components/index.ts
export { FeatureCard } from './FeatureCard';
export { FeatureForm } from './FeatureForm';
export { FeatureModal } from './FeatureModal';

// Usage
import { FeatureCard, FeatureForm } from '@/features/feature/components';
```

## 🎯 Component Patterns

### Standard Component Structure
```typescript
import React from 'react';
import { 
  Button, 
  Group, 
  Text, 
  Paper,
  LoadingOverlay,
  Alert 
} from '@mantine/core';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface ComponentProps {
  id: string;
  title: string;
  onAction?: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const StandardComponent: React.FC<ComponentProps> = ({
  id,
  title,
  onAction,
  disabled = false,
  loading = false
}) => {
  const handleClick = () => {
    onAction?.(id);
  };

  return (
    <Paper p="md" withBorder pos="relative">
      <LoadingOverlay visible={loading} />
      
      <Group justify="space-between" mb="md">
        <Text fw={500}>{title}</Text>
        <Button
          size="sm"
          disabled={disabled}
          onClick={handleClick}
          leftSection={<IconCheck size={16} />}
        >
          Action
        </Button>
      </Group>
    </Paper>
  );
};
```

### Form Component Pattern
```typescript
import React from 'react';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import {
  TextInput,
  Button,
  Group,
  Stack,
  Alert
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

// Zod schema for validation
const formSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email format'),
  description: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface FormComponentProps {
  initialValues?: Partial<FormData>;
  onSubmit: (data: FormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const FormComponent: React.FC<FormComponentProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  error
}) => {
  const form = useForm<FormData>({
    initialValues: {
      name: '',
      email: '',
      description: '',
      ...initialValues
    },
    validate: zodResolver(formSchema)
  });

  const handleSubmit = async (values: FormData) => {
    try {
      await onSubmit(values);
      form.reset();
    } catch (err) {
      // Error handled by parent component
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <TextInput
          label="Name"
          placeholder="Enter name"
          required
          {...form.getInputProps('name')}
        />

        <TextInput
          label="Email"
          placeholder="Enter email"
          required
          {...form.getInputProps('email')}
        />

        <TextInput
          label="Description"
          placeholder="Enter description (optional)"
          {...form.getInputProps('description')}
        />

        <Group justify="flex-end">
          <Button
            type="submit"
            loading={loading}
            disabled={!form.isValid()}
          >
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
```

## 🔗 Hook Patterns

### Data Fetching Hook Pattern
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/utils/api';
import { AppError } from '@/shared/utils/errors';

interface UseFeatureOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export const useFeature = (id: string, options: UseFeatureOptions = {}) => {
  const queryClient = useQueryClient();

  // Query for single item
  const {
    data: feature,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      const response = await apiClient.get(`/features/${id}`);
      return response.data.data;
    },
    enabled: !!id && options.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: options.refetchInterval
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: FeatureCreate) => {
      const response = await apiClient.post('/features', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['features'] });
    },
    onError: (error: any) => {
      throw new AppError(
        error.response?.data?.message || 'Failed to create feature',
        error.response?.status || 500
      );
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FeatureUpdate }) => {
      const response = await apiClient.patch(`/features/${id}`, data);
      return response.data.data;
    },
    onSuccess: (updatedFeature) => {
      queryClient.setQueryData(['feature', id], updatedFeature);
      queryClient.invalidateQueries({ queryKey: ['features'] });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/features/${id}`);
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['feature', id] });
      queryClient.invalidateQueries({ queryKey: ['features'] });
    }
  });

  return {
    // Data
    feature,
    isLoading,
    error,
    
    // Actions
    refetch,
    createFeature: createMutation.mutateAsync,
    updateFeature: updateMutation.mutateAsync,
    deleteFeature: deleteMutation.mutateAsync,
    
    // States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
};
```

### List Hook Pattern
```typescript
export const useFeatures = (filters: FeatureFilters = {}) => {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['features', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`/features?${params}`);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000
  });

  return {
    features: data?.items || [],
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch
  };
};
```

## 🔐 Authentication Patterns

### Role-Based Access Control
```typescript
import { useAuth } from '@/core/context/AuthContext';

// Hook for role checking
export const useRoleAccess = () => {
  const { user, roles, isLoading } = useAuth();

  const hasRole = (role: string) => {
    return roles?.some(r => r.role === role) || false;
  };

  const hasAnyRole = (roleList: string[]) => {
    return roleList.some(role => hasRole(role));
  };

  const isSuperAdmin = hasRole('SUPER_ADMIN');
  const isTenantOwner = hasRole('TENANT_OWNER');
  const isProjectMember = hasRole('PROJECT_MEMBER');

  return {
    user,
    roles,
    isLoading,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
    isTenantOwner,
    isProjectMember
  };
};

// Component with role-based rendering
export const RoleBasedComponent: React.FC = () => {
  const { isSuperAdmin, isTenantOwner } = useRoleAccess();

  if (isSuperAdmin) {
    return <AdminPanel />;
  }

  if (isTenantOwner) {
    return <TenantPanel />;
  }

  return <UserPanel />;
};
```

### Protected Route Pattern
```typescript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/core/context/AuthContext';
import { LoadingOverlay } from '@mantine/core';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles = [],
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

## 🌐 API Integration Patterns

### API Client Configuration
```typescript
// src/shared/utils/api.ts
import axios from 'axios';
import { AppError } from './errors';

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    const status = error.response?.status || 500;
    
    throw new AppError(message, status);
  }
);
```

### Error Handling Pattern
```typescript
// src/shared/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Error boundary component
import React from 'react';
import { Alert, Button, Group } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="red"
          variant="light"
        >
          <Group justify="space-between">
            <div>
              <strong>Something went wrong</strong>
              <p>{this.state.error?.message}</p>
            </div>
            <Button
              size="sm"
              variant="subtle"
              onClick={() => window.location.reload()}
              leftSection={<IconRefresh size={16} />}
            >
              Reload
            </Button>
          </Group>
        </Alert>
      );
    }

    return this.props.children;
  }
}
```

## 🎨 UI Patterns

### Loading States Pattern
```typescript
import React from 'react';
import { Skeleton, Stack, Group } from '@mantine/core';

export const CardSkeleton: React.FC = () => (
  <Stack gap="md">
    <Group justify="space-between">
      <Skeleton height={20} width="60%" />
      <Skeleton height={32} width={80} />
    </Group>
    <Skeleton height={16} width="80%" />
    <Skeleton height={16} width="40%" />
  </Stack>
);

export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <Stack gap="md">
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </Stack>
);
```

### Modal Pattern
```typescript
import React from 'react';
import { Modal, Button, Group, Text } from '@mantine/core';

interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      centered
    >
      <Text mb="lg">{message}</Text>
      
      <Group justify="flex-end">
        <Button
          variant="subtle"
          onClick={onClose}
          disabled={loading}
        >
          {cancelLabel}
        </Button>
        <Button
          color="red"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
};
```

## 🔄 State Management Patterns

### Context Pattern
```typescript
import React, { createContext, useContext, useReducer } from 'react';

interface State {
  items: Item[];
  selectedItem: Item | null;
  isLoading: boolean;
}

type Action =
  | { type: 'SET_ITEMS'; payload: Item[] }
  | { type: 'SELECT_ITEM'; payload: Item }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: State = {
  items: [],
  selectedItem: null,
  isLoading: false
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload };
    case 'SELECT_ITEM':
      return { ...state, selectedItem: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
};

const StateContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export const StateProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{ state, dispatch }}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within StateProvider');
  }
  return context;
};
```

## 🧪 Testing Patterns

### Component Test Pattern
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { ComponentToTest } from './ComponentToTest';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
};

describe('ComponentToTest', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <ComponentToTest />
      </TestWrapper>
    );

    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const mockOnClick = vi.fn();
    
    render(
      <TestWrapper>
        <ComponentToTest onClick={mockOnClick} />
      </TestWrapper>
    );

    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });
  });
});
```

These patterns provide consistent, maintainable code structures that follow MWAP Client conventions and best practices.