# Components & UI Patterns

## Overview

The MWAP Client follows a systematic component architecture based on atomic design principles, feature-based organization, and consistent UI patterns. This document provides comprehensive guidance on component structure, UI patterns, and file organization.

## Component Architecture

### Atomic Design Methodology

The application follows atomic design principles for maximum reusability and maintainability:

#### Atoms (Basic Building Blocks)
```
/src/shared/components/atoms/
  Button/
    Button.tsx
    Button.test.tsx
    Button.types.ts
    Button.stories.tsx
    index.ts
  Input/
  Card/
  Badge/
  Avatar/
  Spinner/
```

**Characteristics**:
- Single responsibility
- No business logic
- Highly reusable
- Minimal dependencies

**Example Implementation**:
```typescript
// src/shared/components/atoms/Button/Button.tsx
import React from 'react';
import { Button as MantineButton } from '@mantine/core';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({
  variant = 'filled',
  size = 'md',
  loading = false,
  disabled = false,
  children,
  onClick,
  ...props
}) => {
  return (
    <MantineButton
      variant={variant}
      size={size}
      loading={loading}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </MantineButton>
  );
};

export default Button;
```

#### Molecules (Combinations of Atoms)
```
/src/shared/components/molecules/
  FormField/
    FormField.tsx
    FormField.test.tsx
    FormField.types.ts
    index.ts
  SearchBar/
  Pagination/
  DataTableRow/
  NotificationItem/
```

**Characteristics**:
- Combine multiple atoms
- Handle simple interactions
- Reusable across features
- Minimal state management

**Example Implementation**:
```typescript
// src/shared/components/molecules/FormField/FormField.tsx
import React from 'react';
import { TextInput, Textarea, Select } from '@mantine/core';
import { FormFieldProps } from './FormField.types';

export const FormField: React.FC<FormFieldProps> = ({
  type = 'text',
  label,
  error,
  required = false,
  placeholder,
  value,
  onChange,
  options,
  ...props
}) => {
  const commonProps = {
    label,
    error,
    required,
    placeholder,
    value,
    onChange,
    ...props,
  };

  switch (type) {
    case 'textarea':
      return <Textarea {...commonProps} />;
    case 'select':
      return <Select {...commonProps} data={options || []} />;
    default:
      return <TextInput {...commonProps} />;
  }
};

export default FormField;
```

#### Organisms (Complex UI Sections)
```
/src/shared/components/organisms/
  DataTable/
    DataTable.tsx
    DataTable.test.tsx
    DataTable.types.ts
    components/
      TableHeader.tsx
      TableRow.tsx
      TablePagination.tsx
    index.ts
  Navigation/
  FormSection/
  FileExplorer/
```

**Characteristics**:
- Complex functionality
- Manage local state
- Compose molecules and atoms
- Feature-agnostic but sophisticated

**Example Implementation**:
```typescript
// src/shared/components/organisms/DataTable/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { Table, Pagination, TextInput } from '@mantine/core';
import { DataTableProps } from './DataTable.types';

export const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  searchable = false,
  paginated = false,
  pageSize = 10,
  loading = false,
  onRowClick,
  ...props
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!searchable || !search) return data;
    
    return data.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search, searchable]);

  const paginatedData = useMemo(() => {
    if (!paginated) return filteredData;
    
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, paginated, page, pageSize]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  return (
    <div className="data-table" {...props}>
      {searchable && (
        <TextInput
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          mb="md"
        />
      )}
      
      <Table striped highlightOnHover>
        <thead>
          <tr>
            {columns.map(column => (
              <th key={column.key}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr
              key={item.id || index}
              onClick={() => onRowClick?.(item)}
              style={{ cursor: onRowClick ? 'pointer' : 'default' }}
            >
              {columns.map(column => (
                <td key={column.key}>
                  {column.render ? column.render(item[column.key], item) : item[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
      
      {paginated && totalPages > 1 && (
        <Pagination
          value={page}
          onChange={setPage}
          total={totalPages}
          mt="md"
        />
      )}
    </div>
  );
};

export default DataTable;
```

#### Templates (Page Layouts)
```
/src/core/layouts/
  DashboardLayout/
    DashboardLayout.tsx
    DashboardLayout.types.ts
    components/
      Sidebar.tsx
      Header.tsx
      Footer.tsx
    index.ts
  FormLayout/
  ListLayout/
```

**Characteristics**:
- Define page structure
- Handle layout-specific logic
- Compose organisms and molecules
- Responsive design implementation

#### Pages (Complete Screens)
```
/src/features/{feature}/pages/
  FeatureListPage.tsx
  FeatureDetailPage.tsx
  FeatureCreatePage.tsx
  FeatureEditPage.tsx
```

**Characteristics**:
- Complete user interfaces
- Handle business logic
- Integrate with APIs
- Manage complex state

## File Structure & Organization

### Feature-Based Organization
```
/src
  /assets/                     # Static assets
    /images/
    /icons/
    /fonts/
  
  /components/                 # Legacy shared components (being migrated)
    /notifications/
    DebugPanel.tsx
  
  /core/                       # Core application functionality
    /context/                  # React context providers
      AuthContext.tsx
      ThemeContext.tsx
    /layouts/                  # Layout components
      AppLayout.tsx
      DashboardLayout.tsx
    /router/                   # Routing configuration
      AppRouter.tsx
      ProtectedRoute.tsx
      RoleRoute.tsx
    index.ts
  
  /features/                   # Feature-based modules
    /auth/
      /hooks/
        useAuth.ts
        useLogin.ts
      /pages/
        LoginPage.tsx
        LogoutPage.tsx
      /types/
        auth.types.ts
      index.ts
    
    /tenants/
      /components/
        TenantCard.tsx
        TenantForm.tsx
      /hooks/
        useTenants.ts
        useTenantIntegrations.ts
      /pages/
        TenantListPage.tsx
        TenantDetailPage.tsx
        TenantSettingsPage.tsx
      /types/
        tenant.types.ts
      index.ts
    
    /projects/
      /components/
        ProjectCard.tsx
        ProjectForm.tsx
        ProjectMemberList.tsx
      /hooks/
        useProjects.ts
        useProjectMembers.ts
      /pages/
        ProjectListPage.tsx
        ProjectDetailPage.tsx
        ProjectSettingsPage.tsx
      /types/
        project.types.ts
      index.ts
    
    /cloud-providers/
      /components/
        CloudProviderCard.tsx
        IntegrationForm.tsx
        OAuthCallback.tsx
      /hooks/
        useCloudProviders.ts
        useIntegrations.ts
      /pages/
        CloudProviderListPage.tsx
        IntegrationSetupPage.tsx
      /types/
        cloud-provider.types.ts
      index.ts
    
    /project-types/
      /components/
        ProjectTypeCard.tsx
        ProjectTypeForm.tsx
      /hooks/
        useProjectTypes.ts
      /pages/
        ProjectTypeListPage.tsx
        ProjectTypeDetailPage.tsx
      /types/
        project-type.types.ts
      index.ts
    
    /files/
      /components/
        FileBrowser.tsx
        FileItem.tsx
        FolderItem.tsx
      /hooks/
        useFiles.ts
        useFileContent.ts
      /types/
        file.types.ts
      index.ts
  
  /pages/                      # Top-level pages
    Home.tsx
    Dashboard.tsx
    NotFound.tsx
    Unauthorized.tsx
    OAuthCallbackPage.tsx
  
  /shared/                     # Shared utilities and components
    /components/               # Reusable UI components
      /atoms/
        Button/
        Input/
        Card/
        Badge/
        Avatar/
        Spinner/
      /molecules/
        FormField/
        SearchBar/
        Pagination/
        NotificationItem/
      /organisms/
        DataTable/
        Navigation/
        FormSection/
        FileExplorer/
    /hooks/                    # Shared custom hooks
      useApi.ts
      useDebounce.ts
      useLocalStorage.ts
      usePermissions.ts
    /types/                    # Global type definitions
      api.types.ts
      common.types.ts
      user.types.ts
    /utils/                    # Utility functions
      api.ts
      auth.ts
      validation.ts
      formatting.ts
    index.ts
  
  App.tsx                      # Main application component
  main.tsx                     # Application entry point
  index.css                    # Global styles
  vite-env.d.ts               # Vite type definitions
```

### Component File Structure
Each component follows a consistent file structure:

```
ComponentName/
  ComponentName.tsx           # Main component implementation
  ComponentName.test.tsx      # Unit tests
  ComponentName.types.ts      # TypeScript type definitions
  ComponentName.stories.tsx   # Storybook stories (optional)
  ComponentName.styles.css    # Component-specific styles (if needed)
  index.ts                    # Export file
  README.md                   # Component documentation (for complex components)
```

### Index File Pattern
```typescript
// index.ts - Clean exports
export { ComponentName } from './ComponentName';
export type { ComponentNameProps } from './ComponentName.types';
export default ComponentName;
```

## UI Patterns & Design System

### Design Tokens
```typescript
// src/shared/styles/tokens.ts
export const designTokens = {
  colors: {
    primary: {
      50: '#e3f2fd',
      100: '#bbdefb',
      500: '#2196f3',
      900: '#0d47a1',
    },
    semantic: {
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196f3',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  },
};
```

### Common UI Patterns

#### Loading States
```typescript
// Loading state pattern
export const LoadingSpinner: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex flex-col items-center justify-center p-8">
    <Loader size="lg" />
    <Text mt="md" color="dimmed">{message}</Text>
  </div>
);

// Skeleton loading for lists
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, index) => (
      <Skeleton key={index} height={60} radius="md" />
    ))}
  </div>
);
```

#### Error States
```typescript
// Error display pattern
export const ErrorDisplay: React.FC<{ 
  error: Error; 
  onRetry?: () => void;
}> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <IconAlertCircle size={48} color="red" />
    <Text size="lg" weight={500} mt="md">
      Something went wrong
    </Text>
    <Text color="dimmed" mt="xs">
      {error.message}
    </Text>
    {onRetry && (
      <Button onClick={onRetry} mt="md" variant="outline">
        Try Again
      </Button>
    )}
  </div>
);
```

#### Empty States
```typescript
// Empty state pattern
export const EmptyState: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({ title, description, action, icon }) => (
  <div className="flex flex-col items-center justify-center p-12 text-center">
    {icon || <IconInbox size={64} color="gray" />}
    <Text size="xl" weight={500} mt="md">
      {title}
    </Text>
    {description && (
      <Text color="dimmed" mt="xs" size="sm">
        {description}
      </Text>
    )}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
```

#### Form Patterns
```typescript
// Form wrapper with consistent styling
export const FormWrapper: React.FC<{
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}> = ({ title, description, children, onSubmit, loading = false }) => (
  <Card shadow="sm" padding="lg" radius="md">
    <form onSubmit={onSubmit}>
      <Text size="xl" weight={500} mb="xs">
        {title}
      </Text>
      {description && (
        <Text color="dimmed" size="sm" mb="lg">
          {description}
        </Text>
      )}
      
      <div className="space-y-4">
        {children}
      </div>
      
      <Group position="right" mt="xl">
        <Button type="submit" loading={loading}>
          Submit
        </Button>
      </Group>
    </form>
  </Card>
);
```

#### Modal Patterns
```typescript
// Confirmation modal pattern
export const ConfirmationModal: React.FC<{
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  loading = false,
}) => (
  <Modal opened={opened} onClose={onClose} title={title}>
    <Text mb="lg">{message}</Text>
    <Group position="right">
      <Button variant="outline" onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button onClick={onConfirm} loading={loading} color="red">
        {confirmLabel}
      </Button>
    </Group>
  </Modal>
);
```

### Responsive Design Patterns

#### Responsive Grid
```typescript
// Responsive grid component
export const ResponsiveGrid: React.FC<{
  children: React.ReactNode;
  minItemWidth?: string;
  gap?: string;
}> = ({ 
  children, 
  minItemWidth = '300px', 
  gap = '1rem' 
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(${minItemWidth}, 1fr))`,
      gap,
    }}
  >
    {children}
  </div>
);
```

#### Mobile-First Breakpoints
```typescript
// Breakpoint utilities
export const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px',
};

export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState('xs');
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1400) setBreakpoint('xxl');
      else if (width >= 1200) setBreakpoint('xl');
      else if (width >= 992) setBreakpoint('lg');
      else if (width >= 768) setBreakpoint('md');
      else if (width >= 576) setBreakpoint('sm');
      else setBreakpoint('xs');
    };
    
    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);
  
  return breakpoint;
};
```

## Component Testing Patterns

### Unit Testing
```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
  
  it('shows loading state', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Testing
```typescript
// Feature integration test
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectListPage } from './ProjectListPage';

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

describe('ProjectListPage', () => {
  it('displays projects after loading', async () => {
    render(<ProjectListPage />, { wrapper: createWrapper() });
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText(/my project/i)).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Component Memoization
```typescript
// Memoized component
export const ExpensiveComponent = React.memo<Props>(({ data, onAction }) => {
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
```

### Code Splitting
```typescript
// Lazy loading for large components
const LazyDataTable = React.lazy(() => import('./DataTable'));
const LazyFileExplorer = React.lazy(() => import('./FileExplorer'));

export const DashboardPage: React.FC = () => (
  <div>
    <Suspense fallback={<LoadingSpinner />}>
      <LazyDataTable />
    </Suspense>
    
    <Suspense fallback={<LoadingSpinner />}>
      <LazyFileExplorer />
    </Suspense>
  </div>
);
```

## Accessibility Guidelines

### ARIA Implementation
```typescript
// Accessible component example
export const AccessibleButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}> = ({ children, onClick, loading, disabled, ariaLabel }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    aria-label={ariaLabel}
    aria-busy={loading}
    aria-disabled={disabled || loading}
  >
    {loading ? <Spinner aria-hidden="true" /> : null}
    <span className={loading ? 'sr-only' : undefined}>
      {children}
    </span>
  </button>
);
```

### Keyboard Navigation
```typescript
// Keyboard navigation support
export const NavigableList: React.FC<{ items: Item[] }> = ({ items }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Handle selection
        break;
    }
  };
  
  return (
    <ul role="listbox" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <li
          key={item.id}
          role="option"
          aria-selected={index === focusedIndex}
          tabIndex={index === focusedIndex ? 0 : -1}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
};
```

## Migration Guidelines

### Legacy Component Migration
When migrating existing components to the new structure:

1. **Identify Component Type**: Determine if it's an atom, molecule, organism, or template
2. **Extract Reusable Logic**: Move business logic to custom hooks
3. **Standardize Props**: Use consistent prop interfaces
4. **Add Type Safety**: Ensure full TypeScript coverage
5. **Write Tests**: Add comprehensive test coverage
6. **Update Imports**: Update all import statements

### Best Practices for New Components
1. **Start Small**: Begin with atoms and build up
2. **Single Responsibility**: Each component should have one clear purpose
3. **Composition over Inheritance**: Use composition patterns
4. **Consistent Naming**: Follow established naming conventions
5. **Document Thoroughly**: Include clear documentation and examples

---

**References**:
- Source: `src/` directory structure analysis
- Source: `src/shared/components/` existing component implementations
- Source: `src/features/` feature-specific component patterns
- Source: `docs/component-structure.md` original component documentation
- Source: Mantine UI component library documentation
- Source: React Testing Library best practices