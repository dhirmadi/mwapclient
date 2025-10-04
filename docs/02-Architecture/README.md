# Architecture & Solution Design

## Overview

The MWAP Client is a modern React application built with TypeScript, following a feature-based architecture with a focus on type safety, reusability, and maintainability. The architecture supports multi-tenant, role-based functionality while providing a seamless user experience.

## Technical Stack

### Core Technologies
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Library**: Mantine UI with Tailwind CSS
- **State Management**: TanStack Query (React Query) for server state, Context API for client state
- **Authentication**: Auth0 React SDK with PKCE flow
- **API Integration**: Axios with React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6+ with protected routes
- **Testing**: Vitest with React Testing Library

### Architecture Principles

#### 1. Feature-Based Organization
The codebase is organized around business features that mirror the backend's domain-driven design:

```
/src
  /features
    /auth                   # Authentication and authorization
    /tenants               # Tenant management
    /projects              # Project management
    /cloud-providers       # Cloud provider integrations
    /project-types         # Project type management
    /files                 # File management
```

**Benefits**:
- Clear separation of concerns
- Easier maintenance and testing
- Scalable code organization
- Reduced coupling between features

#### 2. Atomic Design Pattern
Components follow atomic design methodology for maximum reusability:

- **Atoms**: Basic building blocks (Button, Input, Card)
- **Molecules**: Combinations of atoms (Form fields, Search bars)
- **Organisms**: Complex UI sections (Navigation, DataTable)
- **Templates**: Page layouts with placeholders
- **Pages**: Complete screens with real data

#### 3. Custom Hooks Pattern
Business logic and API calls are encapsulated in custom hooks:

- **Data fetching**: `useProjects`, `useTenants`, `useCloudProviders`
- **Mutations**: `useCreateProject`, `useUpdateTenant`
- **Authentication**: `useAuth`, `useRoles`
- **UI state**: `useModal`, `useForm`

#### 4. Type Safety
Comprehensive TypeScript implementation with:
- Strict mode enabled
- Shared types with backend API
- Zod schemas for runtime validation
- Type-safe API calls and responses

## System Architecture

### Application Structure

```
/src
  /assets                    # Static assets and images
  /components               # Shared UI components
    /notifications          # Notification components
  /core                     # Core application functionality
    /context               # React context providers (auth, etc.)
    /layouts               # Layout components (navbar, footer, etc.)
    /router                # Routing configuration with protected routes
  /features                 # Feature-based modules
    /{feature-name}
      /hooks               # Feature-specific hooks
      /pages               # Feature pages
      /types               # Feature type definitions
  /pages                    # Top-level pages (Home, Dashboard, etc.)
  /shared                   # Shared utilities and components
    /components            # Reusable UI components
    /hooks                 # Shared custom hooks
    /types                 # Global type definitions
    /utils                 # Utility functions and API client
  App.tsx                   # Main App component
  main.tsx                  # Application entry point
```

### Data Flow Architecture

#### Server State Management
React Query handles all server state with:
- Automatic caching and invalidation
- Background refetching
- Optimistic updates
- Error handling and retry logic

```typescript
// Example: Unified query hook pattern
export const useProjects = (options = {}) => {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();
  
  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get('/projects'),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
  
  const createProjectMutation = useMutation({
    mutationFn: (data) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
  
  return {
    projects: projectsQuery.data || [],
    isLoading: projectsQuery.isLoading,
    error: projectsQuery.error,
    createProject: createProjectMutation.mutate,
    isCreating: createProjectMutation.isLoading,
  };
};
```

#### Client State Management
React Context API manages client-side state:
- Authentication state
- User roles and permissions
- UI preferences
- Theme settings

### Authentication Architecture

#### Auth0 Integration
- **Flow**: Authorization Code + PKCE for enhanced security
- **Token Storage**: Memory-based (not localStorage)
- **Token Refresh**: Automatic refresh token handling
- **Session Management**: Secure session termination

#### Role-Based Access Control (RBAC)
Three-tier permission system:

1. **SuperAdmin**: Platform-level access
   - Manage all tenants and projects
   - Configure cloud providers and project types
   - System-wide analytics

2. **Tenant Owner**: Organization-level access
   - Manage their tenant and projects
   - Cloud provider integrations
   - Team member management

3. **Project Member**: Project-level access
   - **Owner**: Full project control
   - **Deputy**: Edit and member management
   - **Member**: View and interact with resources

### API Integration Architecture

#### Vite Proxy Configuration
**Critical Configuration** (DO NOT MODIFY):
```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://mwapss.shibari.photo/api/v1',
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

#### API Client Structure
```typescript
// src/shared/utils/api.ts
const apiClient = axios.create({
  baseURL: '/api',  // Routes through Vite proxy
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});
```

#### Request Flow
1. Frontend: `/api/users/me/roles`
2. Vite Proxy: Forwards to `https://mwapss.shibari.photo/api/v1/users/me/roles`
3. Backend: Returns wrapped response `{success: true, data: {...}}`

## Performance Architecture

### Optimization Strategies
- **Code Splitting**: Route-based lazy loading
- **Memoization**: React.memo for expensive components
- **Virtualization**: For large data lists
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching**: Intelligent React Query caching strategies

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
```

## Security Architecture

### Security Measures
- **CSRF Protection**: Auth0 state parameters and JWT verification
- **XSS Protection**: React's built-in escaping and CSP headers
- **Secure Token Handling**: Memory storage, automatic refresh
- **HTTPS Communication**: All API communication over HTTPS
- **Input Validation**: Zod schemas for all user inputs

### Authentication Race Condition Prevention
Enhanced authentication coordination using `isReady` state:

```typescript
const MyComponent = () => {
  const { isReady, isSuperAdmin } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {isSuperAdmin && <AdminPanel />}
    </div>
  );
};
```

## Error Handling Architecture

### Global Error Boundary
```typescript
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
```

### Consistent Error Handling
- API error interceptors
- User-friendly error messages
- Role-based error information disclosure
- Comprehensive error logging

## Deployment Architecture

### Build Process
- **Development**: Vite dev server with HMR
- **Production**: Static build with optimized bundles
- **Environment**: Environment-specific configuration

### Production Considerations
- Static hosting compatibility
- CDN integration
- Environment variable management
- CORS configuration

## Future Architecture Considerations

### Planned Enhancements
1. **Micro-frontend Architecture**: For larger scale deployments
2. **Real-time Features**: WebSocket integration for live updates
3. **Progressive Web App**: Offline capabilities and mobile optimization
4. **Advanced Caching**: Service worker implementation
5. **Analytics Integration**: User behavior and performance monitoring

---

**References**:
- Source: `src/` directory structure analysis
- Source: `vite.config.ts` configuration
- Source: `docs/architecture.md` original documentation
- Source: `repo.md` architectural overview