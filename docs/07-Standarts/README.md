# Developer Guidelines & Coding Standards

## Overview

This document provides comprehensive guidelines for developing the MWAP Client application. It covers coding standards, conventions, best practices, and development workflows to ensure consistent, maintainable, and high-quality code.

## Coding Standards & Conventions

### TypeScript Standards

#### Strict Mode Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

#### Type Definitions
- **Interfaces over Types**: Use interfaces for object shapes, types for unions/primitives
- **Explicit Return Types**: Always specify return types for functions
- **Generic Constraints**: Use generic constraints for reusable components

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

const fetchUser = async (id: string): Promise<User> => {
  // implementation
};

// ❌ Avoid
const fetchUser = async (id) => {
  // implementation
};
```

#### Naming Conventions
- **PascalCase**: Components, interfaces, types, enums
- **camelCase**: Variables, functions, methods
- **SCREAMING_SNAKE_CASE**: Constants
- **kebab-case**: File names, CSS classes

```typescript
// ✅ Good
interface UserProfile {
  userId: string;
}

const UserProfileCard: React.FC<UserProfile> = ({ userId }) => {
  const API_BASE_URL = 'https://api.example.com';
  return <div className="user-profile-card">...</div>;
};

// File: user-profile-card.tsx
```

### React Standards

#### Component Structure
```typescript
// Component template
import React from 'react';
import { ComponentProps } from './component-name.types';
import './component-name.styles.css';

interface ComponentNameProps {
  // Props interface
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  prop1,
  prop2,
  ...props
}) => {
  // Hooks
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = useCallback(() => {
    // implementation
  }, []);
  
  // Effects
  useEffect(() => {
    // implementation
  }, []);
  
  // Early returns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  // Main render
  return (
    <div className="component-name" {...props}>
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

#### Hook Guidelines
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Hook Dependencies**: Always include all dependencies in useEffect/useCallback
- **Hook Naming**: Prefix with 'use' and be descriptive

```typescript
// ✅ Good - Custom hook
export const useProjects = (tenantId?: string) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/projects${tenantId ? `?tenantId=${tenantId}` : ''}`);
        setProjects(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [tenantId]);
  
  return { projects, loading, error };
};
```

### File Organization Standards

#### Feature-Based Structure
```
/src/features/{feature-name}/
  /components/          # Feature-specific components
    ComponentName.tsx
    ComponentName.test.tsx
    ComponentName.types.ts
    index.ts
  /hooks/              # Feature-specific hooks
    useFeatureData.ts
    useFeatureActions.ts
  /pages/              # Feature pages
    FeaturePage.tsx
    FeatureDetailPage.tsx
  /types/              # Feature type definitions
    feature.types.ts
  /utils/              # Feature utilities
    featureUtils.ts
  index.ts             # Public API exports
```

#### Import/Export Standards
```typescript
// ✅ Good - Named exports
export const ComponentName: React.FC = () => {};
export const utilityFunction = () => {};

// ✅ Good - Barrel exports
// index.ts
export { ComponentName } from './ComponentName';
export { utilityFunction } from './utils';

// ✅ Good - Import organization
// External libraries
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@mantine/core';

// Internal imports - absolute paths
import { useAuth } from '@/core/context/AuthContext';
import { api } from '@/shared/utils/api';

// Relative imports
import { ComponentName } from './ComponentName';
import { utilityFunction } from '../utils';
```

## Development Patterns

### Data Fetching Pattern
```typescript
// Unified query hook pattern
export const useResourceData = <T>(
  endpoint: string,
  options: UseQueryOptions<T> = {}
) => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: [endpoint],
    queryFn: () => api.get<T>(endpoint),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
};

// Usage
const { data: projects, isLoading, error } = useResourceData<Project[]>('/projects');
```

### Error Handling Pattern
```typescript
// Global error handler
export const useErrorHandler = () => {
  const { isSuperAdmin } = useAuth();
  
  const handleError = useCallback((error: Error, context?: string) => {
    // Log error
    console.error(`Error in ${context}:`, error);
    
    // Show user-friendly message
    const message = isSuperAdmin 
      ? error.message 
      : 'An error occurred. Please try again.';
    
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
    });
  }, [isSuperAdmin]);
  
  return { handleError };
};
```

### Form Handling Pattern
```typescript
// Form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export const UserForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/users', data);
      notifications.show({ message: 'User created successfully' });
    } catch (error) {
      handleError(error, 'UserForm.onSubmit');
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        {...register('name')}
        error={errors.name?.message}
        label="Name"
      />
      <TextInput
        {...register('email')}
        error={errors.email?.message}
        label="Email"
      />
      <Button type="submit" loading={isSubmitting}>
        Submit
      </Button>
    </form>
  );
};
```

## Performance Guidelines

### React Performance
```typescript
// ✅ Good - Memoization
const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
  const processedData = useMemo(() => {
    return data.map(item => ({
      ...item,
      computed: expensiveComputation(item),
    }));
  }, [data]);
  
  const handleAction = useCallback((id: string) => {
    onAction(id);
  }, [onAction]);
  
  return (
    <div>
      {processedData.map(item => (
        <ItemComponent
          key={item.id}
          item={item}
          onAction={handleAction}
        />
      ))}
    </div>
  );
});

// ✅ Good - Code splitting
const LazyComponent = React.lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
  </Suspense>
);
```

### Bundle Optimization
```typescript
// ✅ Good - Tree shaking friendly imports
import { Button } from '@mantine/core';
import { debounce } from 'lodash-es';

// ❌ Avoid - Imports entire library
import * as Mantine from '@mantine/core';
import _ from 'lodash';
```

## Testing Standards

### Unit Testing
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { UserForm } from './UserForm';

describe('UserForm', () => {
  const mockOnSubmit = vi.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });
  
  it('renders form fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
  
  it('submits valid data', async () => {
    render(<UserForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });
});
```

### Hook Testing
```typescript
// Hook test example
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useProjects } from './useProjects';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useProjects', () => {
  it('fetches projects successfully', async () => {
    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.projects).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });
});
```

## Security Guidelines

### Input Validation
```typescript
// ✅ Good - Zod validation
const userSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'user']),
});

// Validate on both client and server
const validateUser = (data: unknown) => {
  return userSchema.parse(data);
};
```

### Authentication Patterns
```typescript
// ✅ Good - Protected component
const ProtectedComponent: React.FC = () => {
  const { isReady, isAuthenticated, isSuperAdmin } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return (
    <div>
      {isSuperAdmin && <AdminPanel />}
      <UserContent />
    </div>
  );
};
```

### Secure API Calls
```typescript
// ✅ Good - Token handling
const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessTokenSilently();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "react/prop-types": "off",
    "react-hooks/exhaustive-deps": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Git Workflow

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat(auth): add role-based route protection
fix(api): handle network timeout errors
docs(readme): update installation instructions
```

### Branch Naming
- **Feature**: `feature/feature-name`
- **Bug Fix**: `fix/bug-description`
- **Hotfix**: `hotfix/critical-issue`
- **Release**: `release/v1.2.0`

### Pull Request Guidelines
1. **Clear Title**: Descriptive and concise
2. **Description**: What, why, and how
3. **Testing**: How was it tested
4. **Screenshots**: For UI changes
5. **Breaking Changes**: Clearly documented

## Development Workflow

### Local Development Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### Environment Variables
```env
# .env.local
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience
VITE_API_BASE_URL=/api
```

### Debugging Guidelines
```typescript
// ✅ Good - Structured logging
const debugAuth = debug('mwap:auth');
const debugApi = debug('mwap:api');

debugAuth('User authenticated: %o', user);
debugApi('API call failed: %s', error.message);

// ✅ Good - Error boundaries
const ErrorBoundary: React.FC = ({ children }) => {
  return (
    <ErrorBoundaryComponent
      onError={(error, errorInfo) => {
        console.error('Error boundary caught:', error, errorInfo);
        // Send to monitoring service
      }}
      fallback={<ErrorFallback />}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};
```

## Documentation Standards

### Code Documentation
```typescript
/**
 * Fetches user projects with optional filtering
 * @param tenantId - Optional tenant ID to filter projects
 * @param options - Additional query options
 * @returns Query result with projects data
 */
export const useProjects = (
  tenantId?: string,
  options: UseQueryOptions<Project[]> = {}
): UseQueryResult<Project[]> => {
  // Implementation
};
```

## Integration Feature Development Patterns

### Feature Architecture Example
The Integration Management feature serves as a reference implementation for clean feature architecture:

```typescript
// src/features/integrations/
├── hooks/                    # React hooks for data management
│   ├── useIntegrations.ts    # Query hooks for data fetching
│   ├── useCreateIntegration.ts # Mutation hooks for data modification
│   ├── useOAuthFlow.ts       # Complex business logic hooks
│   └── useTokenManagement.ts # Specialized functionality hooks
├── pages/                    # Feature pages with clear responsibilities
│   ├── IntegrationListPage.tsx    # List/dashboard pages
│   ├── IntegrationCreatePage.tsx  # Creation/form pages
│   └── IntegrationDetailsPage.tsx # Detail/management pages
├── components/               # Reusable UI components
│   ├── IntegrationCard.tsx   # Display components
│   ├── TokenStatusBadge.tsx  # Status/indicator components
│   └── OAuthButton.tsx       # Action components
├── types/                    # TypeScript definitions
│   ├── integration.types.ts  # Core domain types
│   └── oauth.types.ts        # Specialized types
└── utils/                    # Business logic and utilities
    ├── constants.ts          # Configuration constants
    ├── integrationUtils.ts   # Business logic functions
    └── oauthUtils.ts         # Specialized utilities
```

### Hook Development Patterns

#### Query Hooks (Data Fetching)
```typescript
// Pattern: useEntityName() for listing, useEntity() for single item
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations'),
    enabled: isTenantOwner, // Role-based enabling
  });
};

export const useIntegration = (id: string) => {
  return useQuery({
    queryKey: ['integrations', id],
    queryFn: () => api.get(`/integrations/${id}`),
    enabled: !!id,
  });
};
```

#### Mutation Hooks (Data Modification)
```typescript
// Pattern: useVerbEntity() for actions
export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: IntegrationCreateRequest) => api.post('/integrations', data),
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'Integration created successfully',
        color: 'green',
      });
    },
    onError: (error) => {
      // Handle errors consistently
      notifications.show({
        title: 'Error',
        message: getErrorMessage(error),
        color: 'red',
      });
    },
  });
};
```

#### Complex Business Logic Hooks
```typescript
// Pattern: useFeatureFlow() for multi-step processes
export const useOAuthFlow = () => {
  const [flowState, setFlowState] = useState<OAuthFlowState>('idle');
  const createIntegration = useCreateIntegration();
  
  const initiateOAuth = useCallback(async (providerId: string) => {
    setFlowState('initiating');
    try {
      // Complex business logic
      const pkceChallenge = generatePKCEChallenge();
      const oauthState = createOAuthState(providerId);
      const authUrl = buildOAuthUrl(providerId, pkceChallenge, oauthState);
      
      // Redirect to OAuth provider
      window.location.href = authUrl;
    } catch (error) {
      setFlowState('error');
      throw error;
    }
  }, []);
  
  return {
    flowState,
    initiateOAuth,
    resetFlow: () => setFlowState('idle'),
  };
};
```

### Component Development Patterns

#### Display Components
```typescript
// Pattern: Clear props interface, memoization for performance
interface IntegrationCardProps {
  integration: Integration;
  onRefresh?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = React.memo(({
  integration,
  onRefresh,
  onDelete,
  showActions = true,
}) => {
  // Component implementation with proper error boundaries
  return (
    <Card>
      <TokenStatusBadge status={integration.tokenStatus} />
      {/* Component content */}
      {showActions && (
        <Group>
          <Button onClick={() => onRefresh?.(integration.id)}>
            Refresh
          </Button>
          <Button color="red" onClick={() => onDelete?.(integration.id)}>
            Delete
          </Button>
        </Group>
      )}
    </Card>
  );
});
```

#### Form/Action Components
```typescript
// Pattern: Controlled components with validation
export const IntegrationCreateForm: React.FC = () => {
  const form = useForm<IntegrationCreateRequest>({
    validate: zodResolver(integrationCreateSchema),
    initialValues: {
      name: '',
      cloudProviderId: '',
      description: '',
    },
  });
  
  const createIntegration = useCreateIntegration();
  
  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createIntegration.mutateAsync(values);
      form.reset();
    } catch (error) {
      // Error handling is done in the hook
    }
  });
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields with proper validation */}
    </form>
  );
};
```

### Security Implementation Patterns

#### OAuth Flow Security
```typescript
// Pattern: Comprehensive security measures
export const generatePKCEChallenge = (): PKCEChallenge => {
  // Use cryptographically secure random generation
  const codeVerifier = generateRandomString(128);
  const codeChallenge = base64URLEncode(sha256(codeVerifier));
  
  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: 'S256'
  };
};

export const createOAuthState = (integrationId: string): OAuthState => {
  return {
    integrationId,
    nonce: generateRandomString(32), // CSRF protection
    timestamp: Date.now(), // Expiration tracking
    csrfToken: generateCSRFToken(), // Additional CSRF protection
  };
};
```

#### Input Validation Patterns
```typescript
// Pattern: Zod schemas for comprehensive validation
export const integrationCreateSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s-_]+$/, 'Name contains invalid characters'),
  cloudProviderId: z.string().uuid('Invalid provider ID'),
  description: z.string().max(500, 'Description too long').optional(),
  settings: z.record(z.any()).optional(),
});

// Use in components
const form = useForm({
  validate: zodResolver(integrationCreateSchema),
});
```

### Error Handling Patterns

#### Consistent Error Processing
```typescript
// Pattern: Centralized error handling utility
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || 'Network error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Pattern: Error boundaries for graceful degradation
export const IntegrationErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ErrorBoundary
      fallback={<IntegrationErrorFallback />}
      onError={(error) => {
        console.error('Integration error:', error);
        // Log to monitoring service
      }}
    >
      {children}
    </ErrorBoundary>
  );
};
```

### Testing Patterns

#### Hook Testing
```typescript
// Pattern: Comprehensive hook testing with React Query
describe('useIntegrations', () => {
  it('should fetch integrations successfully', async () => {
    const mockIntegrations = [mockIntegration()];
    mockApi.get.mockResolvedValue({ data: mockIntegrations });
    
    const { result } = renderHook(() => useIntegrations(), {
      wrapper: createQueryWrapper(),
    });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
    
    expect(result.current.data).toEqual(mockIntegrations);
  });
});
```

#### Component Testing
```typescript
// Pattern: User-centric testing approach
describe('IntegrationCard', () => {
  it('should display integration information correctly', () => {
    const mockIntegration = createMockIntegration();
    
    render(<IntegrationCard integration={mockIntegration} />);
    
    expect(screen.getByText(mockIntegration.name)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });
  
  it('should handle refresh action', async () => {
    const onRefresh = jest.fn();
    const mockIntegration = createMockIntegration();
    
    render(
      <IntegrationCard 
        integration={mockIntegration} 
        onRefresh={onRefresh} 
      />
    );
    
    await user.click(screen.getByRole('button', { name: /refresh/i }));
    
    expect(onRefresh).toHaveBeenCalledWith(mockIntegration.id);
  });
});
```

### Performance Optimization Patterns

#### React Query Optimization
```typescript
// Pattern: Efficient caching and background updates
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['integrations'],
    queryFn: () => api.get('/integrations'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Pattern: Optimistic updates for better UX
export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: UpdateParams) => api.patch(`/integrations/${id}`, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['integrations', id] });
      
      // Snapshot previous value
      const previousIntegration = queryClient.getQueryData(['integrations', id]);
      
      // Optimistically update
      queryClient.setQueryData(['integrations', id], (old: Integration) => ({
        ...old,
        ...data,
      }));
      
      return { previousIntegration };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousIntegration) {
        queryClient.setQueryData(['integrations', variables.id], context.previousIntegration);
      }
    },
  });
};
```

### README Standards
- **Purpose**: Clear description of what the component/feature does
- **Usage**: Code examples showing how to use it
- **Props/Parameters**: Detailed parameter documentation
- **Examples**: Real-world usage examples

---

**References**:
- Source: `docs/development-guide.md` comprehensive development recommendations
- Source: `eslint.config.js` and `tsconfig.json` configuration files
- Source: `src/` directory structure and implementation patterns
- Source: `package.json` scripts and dependencies