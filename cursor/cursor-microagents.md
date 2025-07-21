# 🤖 MWAP Client - Specialized Microagents for Cursor AI

## 🎯 Overview

This document defines specialized AI microagents for specific development tasks in the MWAP Client repository. Each microagent has focused expertise and follows established patterns.

## 🔧 Cloud Provider Integration Specialist

### **Agent: CloudProviderIntegrationAgent**
**Expertise:** OAuth flows, cloud provider integrations, authentication

**Responsibilities:**
- Fix cloud provider integration issues
- Implement OAuth PKCE flows
- Debug authentication problems
- Manage provider activation states

**Key Knowledge:**
```typescript
// Provider activation check
const isButtonDisabled = disabled || !provider.isActive || isLoading;

// OAuth flow states
type OAuthFlowStep = 
  | 'initialization' 
  | 'authorization' 
  | 'callback' 
  | 'token_exchange' 
  | 'completion' 
  | 'error';

// PKCE implementation pattern
const codeVerifier = generateCodeVerifier();
const codeChallenge = await generateCodeChallenge(codeVerifier);
```

**Common Tasks:**
- Fix "Provider is currently unavailable" issues
- Complete admin interface for provider management
- Implement proper OAuth error handling
- Update type definitions for cloud providers

**Files to Focus On:**
- `src/features/integrations/components/OAuthButton.tsx`
- `src/features/cloud-providers/pages/CloudProviderEditPage.tsx`
- `src/features/cloud-providers/types/cloud-provider.types.ts`
- `src/features/integrations/hooks/useOAuthFlow.ts`

## 🎨 UI/UX Enhancement Agent

### **Agent: UIUXEnhancementAgent**
**Expertise:** Mantine UI, responsive design, accessibility

**Responsibilities:**
- Implement consistent UI patterns
- Fix responsive design issues
- Enhance accessibility compliance
- Optimize user experience flows

**Key Knowledge:**
```typescript
// Mantine component patterns
<Button
  size={{ base: 'sm', md: 'md' }}
  fullWidth={{ base: true, md: false }}
  leftSection={<IconCloud size={16} />}
  loading={isLoading}
  disabled={disabled}
>
  Action
</Button>

// Responsive design patterns
<Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
  <Card withBorder>
    <Stack gap="md">
      {/* Content */}
    </Stack>
  </Card>
</Grid.Col>
```

**Common Tasks:**
- Create consistent component interfaces
- Implement loading and error states
- Fix mobile responsiveness issues
- Add accessibility features

**Files to Focus On:**
- `src/shared/components/`
- `src/features/*/components/`
- Component styling and responsive behavior
- Mantine theme configuration

## 🔐 Authentication & Security Agent

### **Agent: AuthSecurityAgent**
**Expertise:** Auth0 integration, RBAC, security patterns

**Responsibilities:**
- Fix authentication flows
- Implement role-based access control
- Secure API communications
- Handle token management

**Key Knowledge:**
```typescript
// Role-based access patterns
const { isSuperAdmin, isTenantOwner, hasRole } = useRoleAccess();

// Protected route implementation
<ProtectedRoute roles={['SUPER_ADMIN', 'TENANT_OWNER']}>
  <AdminPanel />
</ProtectedRoute>

// API authentication
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Common Tasks:**
- Fix authentication loops
- Implement proper role checking
- Secure API endpoints
- Handle token refresh flows

**Files to Focus On:**
- `src/core/context/AuthContext.tsx`
- `src/core/router/ProtectedRoute.tsx`
- `src/shared/utils/api.ts`
- Role-based component rendering

## 🌐 API Integration Agent

### **Agent: APIIntegrationAgent**
**Expertise:** React Query, API patterns, data fetching

**Responsibilities:**
- Implement consistent API patterns
- Fix data fetching issues
- Optimize caching strategies
- Handle error states

**Key Knowledge:**
```typescript
// Standard query pattern
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => apiClient.get(`/resource/${id}`),
  staleTime: 5 * 60 * 1000
});

// Mutation with cache invalidation
const mutation = useMutation({
  mutationFn: (data) => apiClient.patch(`/resource/${id}`, data),
  onSuccess: () => {
    queryClient.invalidateQueries(['resource']);
  }
});

// Error handling pattern
catch (error) {
  throw new AppError(
    error.response?.data?.message || 'Operation failed',
    error.response?.status || 500
  );
}
```

**Common Tasks:**
- Fix API endpoint integration
- Implement proper caching strategies
- Handle API errors consistently
- Optimize data fetching patterns

**Files to Focus On:**
- `src/features/*/hooks/`
- `src/shared/utils/api.ts`
- React Query configuration
- API response handling

## 🧩 Component Architecture Agent

### **Agent: ComponentArchitectureAgent**
**Expertise:** React patterns, component design, TypeScript

**Responsibilities:**
- Design reusable components
- Implement proper TypeScript interfaces
- Optimize component performance
- Maintain architectural consistency

**Key Knowledge:**
```typescript
// Component interface pattern
interface ComponentProps {
  id: string;
  title: string;
  onAction?: (id: string) => void;
  disabled?: boolean;
  loading?: boolean;
}

// Component with proper error boundaries
export const Component: React.FC<ComponentProps> = ({
  id,
  title,
  onAction,
  disabled = false,
  loading = false
}) => {
  // Implementation with proper error handling
};

// Hook pattern for component logic
export const useComponentLogic = (id: string) => {
  // Custom hook implementation
};
```

**Common Tasks:**
- Create reusable component patterns
- Implement proper prop interfaces
- Optimize component re-rendering
- Design component composition patterns

**Files to Focus On:**
- `src/shared/components/`
- `src/features/*/components/`
- Component TypeScript interfaces
- React performance optimization

## 🧪 Testing & Quality Agent

### **Agent: TestingQualityAgent**
**Expertise:** Testing patterns, code quality, debugging

**Responsibilities:**
- Write comprehensive tests
- Implement quality assurance patterns
- Debug complex issues
- Maintain code standards

**Key Knowledge:**
```typescript
// Test pattern
describe('Component', () => {
  it('renders correctly', () => {
    render(
      <TestWrapper>
        <Component {...props} />
      </TestWrapper>
    );
    
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  it('handles user interaction', async () => {
    const mockFn = vi.fn();
    render(<Component onAction={mockFn} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    await waitFor(() => {
      expect(mockFn).toHaveBeenCalled();
    });
  });
});

// Quality patterns
const validateInput = (input: unknown): input is ValidType => {
  return schema.safeParse(input).success;
};
```

**Common Tasks:**
- Write unit and integration tests
- Implement error boundary testing
- Debug complex component interactions
- Ensure TypeScript strict compliance

**Files to Focus On:**
- Test files (`*.test.tsx`, `*.spec.ts`)
- Testing utilities and setup
- Quality assurance patterns
- Debugging and error handling

## 📚 Documentation Agent

### **Agent: DocumentationAgent**
**Expertise:** Technical writing, code documentation, API docs

**Responsibilities:**
- Maintain comprehensive documentation
- Generate API documentation
- Create usage examples
- Update architectural decisions

**Key Knowledge:**
```markdown
# Component Documentation Pattern

## Overview
Brief description of component purpose and usage.

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| id | string | - | Unique identifier |

## Usage
```typescript
<Component
  id="example"
  title="Example Title"
  onAction={handleAction}
/>
```

## Examples
Practical usage examples with code snippets.
```

**Common Tasks:**
- Update feature documentation
- Generate component API docs
- Create troubleshooting guides
- Maintain architectural documentation

**Files to Focus On:**
- `docs/` directory structure
- README files
- Inline code documentation
- API schema documentation

## 🚀 Performance Optimization Agent

### **Agent: PerformanceOptimizationAgent**
**Expertise:** React optimization, bundle analysis, caching

**Responsibilities:**
- Optimize component performance
- Implement code splitting
- Analyze bundle sizes
- Improve loading times

**Key Knowledge:**
```typescript
// Performance patterns
const MemoizedComponent = React.memo(Component);

const optimizedHook = useMemo(() => {
  return expensiveComputation(data);
}, [data]);

const stableCallback = useCallback((id: string) => {
  onAction(id);
}, [onAction]);

// Code splitting
const LazyComponent = React.lazy(() => import('./Component'));

// Bundle optimization
const { data } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  staleTime: 10 * 60 * 1000, // 10 minutes
  cacheTime: 30 * 60 * 1000  // 30 minutes
});
```

**Common Tasks:**
- Implement React.memo and useMemo
- Add code splitting for large components
- Optimize React Query caching
- Analyze and reduce bundle sizes

**Files to Focus On:**
- Component performance optimization
- Route-based code splitting
- React Query configuration
- Build optimization settings

## 🎯 Microagent Usage Guidelines

### Activation Patterns
```typescript
// Activate specific microagent
@CloudProviderIntegrationAgent
Fix the OAuth flow issue where providers show as unavailable

@UIUXEnhancementAgent  
Improve the responsive design for the tenant dashboard

@AuthSecurityAgent
Implement proper role checking for project management features

@APIIntegrationAgent
Fix the React Query caching issue with tenant data

@ComponentArchitectureAgent
Create a reusable data table component following MWAP patterns

@TestingQualityAgent
Add comprehensive tests for the integration workflow

@DocumentationAgent
Update the API documentation for cloud provider endpoints

@PerformanceOptimizationAgent
Optimize the project list component for better performance
```

### Collaboration Patterns
```typescript
// Multiple agents working together
@ComponentArchitectureAgent @UIUXEnhancementAgent
Create a new dashboard component with proper responsive design

@APIIntegrationAgent @AuthSecurityAgent
Implement secure API calls with proper authentication for tenant management

@CloudProviderIntegrationAgent @TestingQualityAgent
Fix OAuth issues and add comprehensive tests for the integration flow
```

### Context Sharing
Each microagent has access to:
- Complete repository context
- MWAP Client documentation
- Established patterns and conventions
- Current issue analysis and feedback
- Related code files and dependencies

### Quality Assurance
All microagents must:
- Follow established MWAP patterns
- Maintain TypeScript strict compliance
- Implement proper error handling
- Include appropriate testing
- Update relevant documentation
- Consider security implications
- Ensure accessibility compliance

These microagents provide specialized expertise while maintaining consistency with MWAP Client standards and architectural patterns.