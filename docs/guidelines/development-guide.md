# MWAP Client Development Guide

This guide provides recommendations for harmonizing the MWAP Client codebase based on a comprehensive review of the current implementation and documentation. It aims to address identified inconsistencies, redundancies, and architectural deviations to create a more maintainable and efficient application.

## Table of Contents

1. [Current State Assessment](#current-state-assessment)
2. [Architecture Recommendations](#architecture-recommendations)
3. [Data Fetching Strategy](#data-fetching-strategy)
4. [Component Structure](#component-structure)
5. [State Management](#state-management)
6. [Role-Based Access Control](#role-based-access-control)
7. [Error Handling](#error-handling)
8. [Performance Optimization](#performance-optimization)
9. [Implementation Roadmap](#implementation-roadmap)

## Current State Assessment

### Identified Issues

1. **Architecture Inconsistencies**
   - Deviation between documented architecture and actual implementation
   - Lack of consistent feature-based organization
   - Inconsistent application of design patterns

2. **Data Fetching Problems**
   - Inconsistent data fetching strategies across components
   - Conditional query execution (`enabled: isSuperAdmin`) causing data availability issues
   - Redundant API call patterns across different resource types

3. **Component Structure Issues**
   - Lack of atomic design implementation despite documentation
   - Redundant component patterns across different features
   - Inconsistent component organization

4. **State Management Challenges**
   - Over-reliance on a single AuthContext with too many responsibilities
   - Missing context providers for other global state concerns
   - Inconsistent state management patterns

5. **Role-Based Access Control Implementation**
   - Simplified implementation compared to documented approach
   - Inconsistent permission checking across components
   - Role-based UI adaptation not systematically implemented
   - **FIXED**: Authentication race conditions causing role-based UI elements to not display

6. **Error Handling Inconsistencies**
   - Varied approaches to error handling across components
   - Missing global error boundary
   - Inconsistent error feedback to users

## Architecture Recommendations

### Proposed Architecture

We recommend transitioning to a **feature-based architecture** with clear separation of concerns:

```
/src
  /features                 # Feature modules
    /auth                   # Authentication feature
    /tenants                # Tenant management feature
    /projects               # Project management feature
    /cloud-providers        # Cloud provider feature
    /project-types          # Project type feature
    /files                  # File management feature
  /shared                   # Shared resources
    /components             # Shared UI components
    /hooks                  # Shared custom hooks
    /utils                  # Shared utilities
    /types                  # Shared type definitions
    /api                    # API client and utilities
  /core                     # Core application resources
    /context                # Global context providers
    /router                 # Routing configuration
    /layouts                # Layout components
    /styles                 # Global styles
  App.tsx                   # Main application component
  main.tsx                  # Application entry point
```

### Feature Module Structure

Each feature module should follow a consistent structure:

```
/features/tenants
  /components               # Feature-specific components
    TenantList.tsx
    TenantForm.tsx
    TenantCard.tsx
  /hooks                    # Feature-specific hooks
    useTenants.ts
    useTenantIntegrations.ts
  /pages                    # Feature pages
    TenantListPage.tsx
    TenantDetailsPage.tsx
  /utils                    # Feature-specific utilities
    tenantUtils.ts
  /types                    # Feature-specific types
    tenant.types.ts
  index.ts                  # Public API for the feature
```

## Data Fetching Strategy

### Unified Query Hook Pattern

Implement a consistent pattern for data fetching hooks:

```typescript
// Example of a unified query hook pattern
export const useTenants = (options = {}) => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  
  // Base query options
  const baseOptions = {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  };
  
  // Fetch all tenants
  const tenantsQuery = useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.fetchTenants(),
    ...baseOptions,
    // Always enabled, but endpoint changes based on role
    select: (data) => isSuperAdmin ? data : data.filter(t => t.ownerId === user.sub),
  });
  
  // Mutations with consistent patterns
  const createTenantMutation = useMutation({
    mutationFn: (data) => api.createTenant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    },
  });
  
  // Return everything needed by components
  return {
    tenants: tenantsQuery.data || [],
    isLoading: tenantsQuery.isLoading,
    error: tenantsQuery.error,
    refetch: tenantsQuery.refetch,
    createTenant: createTenantMutation.mutate,
    isCreating: createTenantMutation.isLoading,
    // Additional methods and properties
  };
};
```

### API Client Refactoring

Implement a more generic API client with resource-based methods:

```typescript
// Generic API client
const api = {
  // Generic methods
  get: (endpoint, params) => apiClient.get(endpoint, { params }),
  post: (endpoint, data) => apiClient.post(endpoint, data),
  put: (endpoint, data) => apiClient.put(endpoint, data),
  patch: (endpoint, data) => apiClient.patch(endpoint, data),
  delete: (endpoint) => apiClient.delete(endpoint),
  
  // Resource-based methods
  resource: (resourceName) => ({
    getAll: (params) => api.get(`/${resourceName}`, params),
    getById: (id, params) => api.get(`/${resourceName}/${id}`, params),
    create: (data) => api.post(`/${resourceName}`, data),
    update: (id, data) => api.patch(`/${resourceName}/${id}`, data),
    delete: (id) => api.delete(`/${resourceName}/${id}`),
  }),
  
  // Specific resource instances
  tenants: api.resource('tenants'),
  projects: api.resource('projects'),
  cloudProviders: api.resource('cloud-providers'),
  // etc.
};
```

## Component Structure

### Atomic Design Implementation

Implement a true atomic design pattern for components:

```
/shared/components
  /atoms                    # Basic building blocks
    Button.tsx
    Input.tsx
    Card.tsx
  /molecules               # Combinations of atoms
    FormField.tsx
    SearchBar.tsx
    Pagination.tsx
  /organisms              # Complex UI sections
    DataTable.tsx
    Navigation.tsx
    FormSection.tsx
  /templates              # Page layouts
    DashboardTemplate.tsx
    FormPageTemplate.tsx
```

### Component Composition

Use component composition to reduce redundancy:

```tsx
// Example of a reusable resource list component
const ResourceList = ({ 
  title,
  items,
  isLoading,
  error,
  renderItem,
  onCreateNew,
  createButtonLabel = "Create New",
}) => (
  <>
    <PageHeader title={title}>
      {onCreateNew && (
        <Button onClick={onCreateNew}>{createButtonLabel}</Button>
      )}
    </PageHeader>
    
    {isLoading && <LoadingSpinner />}
    {error && <ErrorDisplay error={error} />}
    {!isLoading && !error && items.length === 0 && (
      <EmptyState message={`No ${title.toLowerCase()} found`} />
    )}
    {!isLoading && !error && items.length > 0 && (
      <div className="resource-list">
        {items.map(item => renderItem(item))}
      </div>
    )}
  </>
);

// Usage
const TenantListPage = () => {
  const { tenants, isLoading, error } = useTenants();
  const navigate = useNavigate();
  
  return (
    <ResourceList
      title="Tenants"
      items={tenants}
      isLoading={isLoading}
      error={error}
      renderItem={(tenant) => <TenantCard key={tenant.id} tenant={tenant} />}
      onCreateNew={() => navigate('/tenants/create')}
      createButtonLabel="Create Tenant"
    />
  );
};
```

## State Management

### Context Separation

Separate the AuthContext into more focused contexts:

```
/core/context
  /auth
    AuthContext.tsx         # Authentication state only
    AuthProvider.tsx
  /roles
    RoleContext.tsx         # User roles and permissions
    RoleProvider.tsx
  /ui
    UIContext.tsx           # UI state (theme, notifications)
    UIProvider.tsx
  /app
    AppContext.tsx          # Application-wide state
    AppProvider.tsx
```

### Context Provider Composition

Compose context providers for better organization:

```tsx
// App.tsx
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RoleProvider>
        <UIProvider>
          <AppProvider>
            <AppRouter />
          </AppProvider>
        </UIProvider>
      </RoleProvider>
    </AuthProvider>
  </QueryClientProvider>
);
```

## Role-Based Access Control

### Authentication Race Condition Fix (2025-07-14)

**Problem**: Role-based UI elements (like SuperAdmin quick actions) weren't displaying despite correct API responses because components rendered before authentication was fully ready.

**Solution**: Enhanced authentication coordination using `isReady` state:

```tsx
// Best Practice: Always check isReady before role-based rendering
const MyComponent = () => {
  const { isReady, isSuperAdmin, isTenantOwner } = useAuth();
  
  // Wait for authentication to be ready
  if (!isReady) {
    return <LoadingSpinner message="Loading user permissions..." />;
  }
  
  return (
    <div>
      {/* Safe to check roles after isReady is true */}
      {isReady && isSuperAdmin && <SuperAdminPanel />}
      {isReady && isTenantOwner && <TenantOwnerPanel />}
    </div>
  );
};
```

**Key Principles**:
1. Always use `isReady && roleCheck` for role-based UI elements
2. Provide loading states while authentication initializes
3. Add debug logging in development for troubleshooting
4. Apply this pattern consistently across all components

### Comprehensive RBAC Implementation

Implement a more systematic RBAC approach:

```tsx
// RoleRoute component
const RoleRoute = ({ 
  requiredRoles, 
  children 
}) => {
  const { hasRole, isLoading } = useRoles();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  const hasRequiredRole = requiredRoles.some(role => hasRole(role));
  
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return children;
};

// Usage in router
<Routes>
  <Route path="/admin/*" element={
    <RoleRoute requiredRoles={['superAdmin']}>
      <AdminRoutes />
    </RoleRoute>
  } />
</Routes>
```

### Permission Hooks

Create specialized hooks for permission checking:

```typescript
// usePermissions hook
export const usePermissions = () => {
  const { isSuperAdmin, isTenantOwner, hasProjectRole } = useRoles();
  
  return {
    canManageTenants: isSuperAdmin,
    canManageCloudProviders: isSuperAdmin,
    canManageProjectTypes: isSuperAdmin,
    canViewTenant: (tenantId) => isSuperAdmin || (isTenantOwner && currentTenantId === tenantId),
    canEditTenant: (tenantId) => isSuperAdmin || (isTenantOwner && currentTenantId === tenantId),
    canManageProject: (projectId) => isSuperAdmin || hasProjectRole(projectId, 'OWNER'),
    canEditProject: (projectId) => isSuperAdmin || hasProjectRole(projectId, 'OWNER') || hasProjectRole(projectId, 'DEPUTY'),
    canViewProject: (projectId) => isSuperAdmin || hasProjectRole(projectId, 'OWNER') || hasProjectRole(projectId, 'DEPUTY') || hasProjectRole(projectId, 'MEMBER'),
  };
};

// Usage in components
const ProjectActions = ({ project }) => {
  const { canEditProject, canManageProject } = usePermissions();
  
  return (
    <div>
      <Button>View Details</Button>
      {canEditProject(project.id) && <Button>Edit Project</Button>}
      {canManageProject(project.id) && <Button>Manage Members</Button>}
    </div>
  );
};
```

## Error Handling

### Global Error Boundary

Implement a global error boundary:

```tsx
// ErrorBoundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to monitoring service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}

// Usage in App
const App = () => (
  <ErrorBoundary>
    <AppContent />
  </ErrorBoundary>
);
```

### Consistent Error Handling

Create a unified error handling approach:

```typescript
// useErrorHandler hook
export const useErrorHandler = () => {
  const { isSuperAdmin } = useRoles();
  
  const handleError = (error, options = {}) => {
    const { 
      showNotification = true,
      logToConsole = true,
      logToService = true,
    } = options;
    
    if (logToConsole) {
      console.error('Error:', error);
    }
    
    if (logToService) {
      // Log to monitoring service
    }
    
    if (showNotification) {
      notifications.show({
        title: 'Error',
        message: isSuperAdmin ? error.message : 'An error occurred. Please try again.',
        color: 'red',
      });
    }
    
    return error;
  };
  
  return { handleError };
};

// Usage in components
const { handleError } = useErrorHandler();

try {
  // Some operation
} catch (error) {
  handleError(error);
}
```

## Performance Optimization

### Code Splitting

Implement code splitting for routes:

```tsx
// Lazy-loaded components
const TenantManagement = React.lazy(() => import('../features/tenants/pages/TenantManagement'));
const ProjectManagement = React.lazy(() => import('../features/projects/pages/ProjectManagement'));

// Usage in router
<Routes>
  <Route path="/tenants/*" element={
    <React.Suspense fallback={<LoadingSpinner />}>
      <TenantManagement />
    </React.Suspense>
  } />
</Routes>
```

### Memoization

Use memoization for expensive computations and components:

```tsx
// Memoized component
const MemoizedTenantList = React.memo(TenantList);

// Memoized selector
const selectFilteredTenants = (tenants, filter) => {
  return useMemo(() => {
    return tenants.filter(tenant => 
      tenant.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [tenants, filter]);
};
```

### Optimized React Query Configuration

Configure React Query for optimal performance:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: import.meta.env.PROD, // Only in production
      
      // Custom error handling
      onError: (error) => {
        console.error('Query error:', error);
      },
    },
    mutations: {
      // Mutation defaults
      onError: (error) => {
        console.error('Mutation error:', error);
        notifications.show({
          title: 'Error',
          message: 'Operation failed. Please try again.',
          color: 'red',
        });
      },
    },
  },
});
```

## Implementation Roadmap

### Phase 1: Refactor Core Architecture

1. Reorganize project structure according to feature-based architecture
2. Implement context separation
3. Create unified API client

### Phase 2: Standardize Data Fetching

1. Refactor query hooks with consistent patterns
2. Remove conditional query execution (`enabled: isSuperAdmin`)
3. Implement proper data fetching strategies for all components

### Phase 3: Enhance Component Structure

1. Implement atomic design pattern
2. Create reusable component compositions
3. Reduce redundancy in page components

### Phase 4: Improve RBAC Implementation

1. Create comprehensive role and permission system
2. Implement RoleRoute component
3. Add permission hooks for UI adaptation

### Phase 5: Optimize Performance

1. Implement code splitting
2. Add memoization for expensive operations
3. Optimize React Query configuration

### Phase 6: Enhance Error Handling

1. Implement global error boundary
2. Create unified error handling approach
3. Improve error feedback to users

## Conclusion

By implementing these recommendations, the MWAP Client codebase will become more maintainable, efficient, and consistent. The harmonized architecture will provide a solid foundation for building new features while ensuring existing functionality works correctly across all user roles.

The most critical issues to address immediately are:

1. The inconsistent data fetching strategies that cause problems with tenant management
2. The role-based conditional query execution that prevents SuperAdmins from accessing necessary data
3. The redundant code patterns that make maintenance difficult

Following this guide will help create a world-class React application that meets the standards for 2025 and beyond.