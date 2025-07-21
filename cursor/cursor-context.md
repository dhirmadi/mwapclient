# 🏗️ MWAP Client - Repository Context for Cursor AI

## 📋 Project Overview

**Modular Web Application Platform (MWAP) Client** is a comprehensive React TypeScript application serving as the frontend for a multi-tenant cloud resource management platform.

### 🎯 Core Purpose
- **Multi-tenant project management** with role-based access control
- **Cloud provider integrations** (Dropbox, Google Drive, OneDrive)
- **OAuth-based authentication** with Auth0 and PKCE flow
- **File management** through cloud provider APIs
- **Administrative interfaces** for system management

## 🏛️ Architecture Overview

### Feature-Based Structure
```
src/
├── features/           # Feature modules (self-contained)
│   ├── auth/          # Authentication feature
│   ├── cloud-providers/  # Cloud provider management
│   ├── integrations/  # Cloud provider integrations & OAuth
│   ├── projects/      # Project management
│   ├── tenants/       # Tenant management
│   ├── files/         # File management
│   └── project-types/ # Project type management
├── shared/            # Shared utilities and components
├── core/              # Core application functionality
└── pages/             # Top-level pages
```

### Key Technologies
- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Mantine UI + Tailwind CSS
- **State Management**: React Query + Context API
- **Authentication**: Auth0 React SDK with PKCE
- **Build Tool**: Vite
- **Testing**: Vitest + React Testing Library

## 👥 User Roles & Permissions

### SuperAdmin
- Manage all tenants and projects
- CRUD operations for CloudProviders and ProjectTypes
- System-wide analytics and configuration

### Tenant Owner
- Manage their tenant and projects
- Cloud provider integrations for their tenant
- Invite and manage project members

### Project Member Roles
- **Project Owner**: Full project control
- **Project Deputy**: Edit project and manage members
- **Project Member**: View and interact with resources

## 🔌 Cloud Provider Integration System

### Current Implementation Status
**95% Complete** - Professional OAuth implementation with PKCE flow

### Architecture Components
```
src/features/integrations/
├── components/        # UI components for integration flow
│   ├── OAuthButton.tsx       # Main OAuth initiation button
│   ├── IntegrationWizard.tsx # Step-by-step integration setup
│   └── IntegrationCard.tsx   # Integration status display
├── hooks/            # React hooks for integration logic
│   ├── useIntegrations.ts    # CRUD operations for integrations
│   └── useOAuthFlow.ts       # OAuth flow state management
├── pages/            # Integration management pages
├── types/            # TypeScript definitions
└── utils/            # OAuth utilities and helpers
```

### OAuth Flow Implementation
1. **Initialization**: User selects cloud provider
2. **Authorization**: PKCE challenge generation and redirect
3. **Callback**: Handle OAuth callback with authorization code
4. **Token Exchange**: Exchange code for access/refresh tokens
5. **Completion**: Store tokens and establish integration

### Known Issues (Current Focus)
- **Provider Unavailability**: `provider.isActive` field missing/false
- **Admin Interface Gaps**: Missing controls for provider activation
- **Type Definition Issues**: Incomplete `CloudProviderUpdate` interface
- **Status Display Problems**: Hardcoded vs. real status inconsistencies

## 🔐 Authentication & Security

### Auth0 Integration
- **Flow**: Authorization Code with PKCE
- **Token Storage**: Secure token management
- **Role Management**: Dynamic role fetching and caching
- **Route Protection**: Role-based route access

### Security Patterns
```typescript
// Role-based access control
const { isSuperAdmin, isTenantOwner } = useAuth();

// Protected routes
<ProtectedRoute roles={['SUPER_ADMIN']}>
  <AdminPanel />
</ProtectedRoute>

// API authentication
const apiClient = axios.create({
  headers: { Authorization: `Bearer ${token}` }
});
```

## 🌐 API Integration

### Configuration
- **Base URL**: `/api` (proxied by Vite)
- **Proxy Target**: `https://mwapss.shibari.photo/api/v1`
- **Response Format**: `{success: boolean, data: any, error?: string}`

### Key Endpoints
```
/api/v1/tenants                    # Tenant management
/api/v1/projects                   # Project management
/api/v1/cloud-providers            # Provider configuration
/api/v1/tenants/{id}/integrations  # Cloud integrations
/api/v1/users/me/roles             # User role information
```

### API Patterns
- **Methods**: PATCH for updates (not PUT)
- **Validation**: Zod schemas for all inputs
- **Error Handling**: Consistent `AppError` usage
- **Caching**: React Query with 5-minute default cache

## 🧩 Component Patterns

### Mantine UI Integration
```typescript
// Standard component structure
import { Button, Group, Text, Alert } from '@mantine/core';
import { IconCloud, IconCheck } from '@tabler/icons-react';

const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return (
    <Group gap="md">
      <Button leftSection={<IconCloud size={16} />}>
        Action
      </Button>
    </Group>
  );
};
```

### Form Patterns
```typescript
// React Hook Form with Mantine
import { useForm } from '@mantine/form';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(3),
  email: z.string().email()
});

const form = useForm({
  initialValues: { name: '', email: '' },
  validate: zodResolver(schema)
});
```

## 📊 Data Flow Patterns

### React Query Usage
```typescript
// Standard query pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => apiClient.get(`/resource/${id}`),
  staleTime: 5 * 60 * 1000 // 5 minutes
});

// Mutation pattern
const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/resource', data),
  onSuccess: () => {
    queryClient.invalidateQueries(['resource']);
  }
});
```

### Error Handling
```typescript
// Consistent error handling
try {
  const result = await apiCall();
  return result.data;
} catch (error) {
  throw new AppError(
    error.response?.data?.message || 'Operation failed',
    error.response?.status || 500
  );
}
```

## 🎨 UI/UX Patterns

### Loading States
- Skeleton loaders for content
- Button loading states during actions
- Progress indicators for multi-step processes
- Overlay loading for full-page operations

### Error States
- Alert components for user-facing errors
- Toast notifications for action feedback
- Error boundaries for component failures
- Retry mechanisms for failed operations

### Responsive Design
- Mobile-first approach with Mantine breakpoints
- Adaptive layouts using Mantine Grid system
- Touch-friendly interactions on mobile devices

## 🔧 Development Workflow

### Code Organization
- **Feature-first**: Group by business functionality
- **Shared utilities**: Common code in `src/shared/`
- **Type definitions**: Co-located with features
- **API clients**: Centralized in `src/shared/utils/`

### Testing Strategy
- **Unit tests**: Component and hook testing
- **Integration tests**: Feature workflow testing
- **E2E tests**: Critical user journey testing
- **Type checking**: Strict TypeScript validation

### Build & Deployment
- **Development**: `npm run dev` with hot reload
- **Production**: `npm run build` with optimization
- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint` with ESLint + Prettier

## 🚀 Performance Considerations

### Code Splitting
- Route-based splitting with React.lazy
- Feature-based chunks for large modules
- Dynamic imports for heavy components

### Optimization
- React Query caching for API responses
- Memoization for expensive computations
- Image optimization and lazy loading
- Bundle analysis and size monitoring

## 📚 Documentation Structure

### Comprehensive Docs
- **Architecture**: System design and patterns
- **Development**: Coding standards and workflows
- **API**: Complete endpoint documentation
- **Security**: Authentication and authorization
- **Features**: Detailed feature specifications
- **Components**: UI component library
- **Troubleshooting**: Common issues and solutions

### Living Documentation
- Auto-generated API docs from OpenAPI schema
- Component documentation with Storybook
- Architecture decision records (ADRs)
- Feature specification documents

## 🎯 Current Development Focus

### Immediate Priorities
1. **Cloud Provider Integration Fixes**
   - Complete admin interface for provider management
   - Fix type definitions and status handling
   - Ensure proper OAuth flow functionality

2. **Performance Optimization**
   - Implement code splitting strategies
   - Optimize bundle size and loading times
   - Enhance caching mechanisms

3. **Testing Coverage**
   - Increase unit test coverage
   - Add integration tests for critical flows
   - Implement E2E testing for user journeys

### Future Roadmap
- Real-time collaboration features
- Advanced analytics and reporting
- Enhanced file management capabilities
- Mobile application development
- API rate limiting and optimization

This context provides Cursor AI with comprehensive understanding of the MWAP Client architecture, patterns, and current development focus areas.