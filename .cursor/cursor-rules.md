# MWAP Client - Cursor AI Rules & Guidelines

## 🎯 Project Overview

The Modular Web Application Platform (MWAP) Client is a comprehensive React TypeScript application with feature-based architecture, providing secure multi-tenant project management with cloud provider integrations.

## 🧠 Core Development Principles

### Always Follow These Rules
- 🔁 **Reuse existing patterns**: Follow established components, hooks, types, middleware, and routes
- ✅ **Maintain type safety**: Keep implementations TypeScript-strict and minimal
- 📚 **Follow MWAP standards**: Use `AppError`, `logger`, `SuccessResponse` patterns consistently
- 🔐 **Never skip security**: Always implement authentication/authorization middleware
- 🚫 **Avoid duplication**: Do not create duplicate functions, services, types, or schemas
- 🧪 **Validate inputs**: Use Zod for all input validation
- 🧱 **Maintain modularity**: Follow clean `features/<module>/` structure
- 📖 **Reference documentation**: Use organized docs structure for accurate implementation

### Documentation First Approach
- **Start with**: [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md) for complete project understanding
- **Architecture**: [`docs/02-Architecture/README.md`](../docs/02-Architecture/README.md) for system design
- **Development**: [`docs/06-Guidelines/development-guide.md`](../docs/06-Guidelines/development-guide.md) for coding standards
- **API Integration**: [`docs/04-Backend/README.md`](../docs/04-Backend/README.md) for API patterns
- **Security**: [`docs/05-Security/README.md`](../docs/05-Security/README.md) for auth patterns
- **Features**: [`docs/03-Frontend/README.md`](../docs/03-Frontend/README.md) for feature specs

## 🏗️ Architecture Patterns

### Feature-Based Structure
```
src/features/[module]/
├── hooks/          # Feature-specific hooks
├── pages/          # Feature pages/components
├── types/          # Feature type definitions
└── index.ts        # Feature exports
```

### Shared Resources
```
src/shared/
├── components/     # Reusable UI components
├── hooks/          # Global custom hooks
├── types/          # Global type definitions
└── utils/          # Utility functions and API client
```

### Core Application
```
src/core/
├── context/        # React context providers
├── layouts/        # Layout components
└── router/         # Routing configuration
```

## 🔧 Development Standards

### TypeScript Requirements
- **Strict Mode**: Always maintain strict TypeScript compliance
- **Explicit Types**: Define explicit return types for all functions
- **Interface First**: Use interfaces for object shapes, types for unions
- **Generic Constraints**: Implement proper generic constraints

### React Patterns
- **Functional Components**: Use function components with hooks
- **Custom Hooks**: Extract logic into reusable custom hooks
- **Memoization**: Use `useMemo`, `useCallback` for performance
- **Error Boundaries**: Implement proper error handling

### API Integration
- **React Query**: Use for all server state management
- **Axios Client**: Use configured API client from `src/shared/utils/api.ts`
- **Error Handling**: Implement consistent error patterns with `AppError`
- **Type Safety**: Match API response types exactly

### Security Implementation
- **Auth0 Integration**: Use established Auth0 patterns
- **RBAC**: Implement role-based access control consistently
- **Input Validation**: Use Zod schemas for all user inputs
- **Token Management**: Follow secure token handling patterns

## 🎨 UI/UX Standards

### Mantine UI Framework
- **Component Library**: Use Mantine v8 components consistently
- **Theme System**: Follow established theme configuration
- **Responsive Design**: Implement mobile-first responsive patterns
- **Accessibility**: Ensure WCAG compliance

### Styling Approach
- **Tailwind CSS**: Use for utility-first styling
- **Component Styles**: Keep styles close to components
- **Design System**: Follow established design tokens
- **Performance**: Optimize CSS bundle size

## 🧪 Testing Guidelines

### Testing Strategy
- **Unit Tests**: Test individual functions and hooks
- **Component Tests**: Test component behavior and rendering
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test critical user journeys

### Testing Tools
- **Vitest**: Primary testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking for tests
- **Playwright**: End-to-end testing

## 🚀 Performance Optimization

### Code Splitting
- **Route-based**: Split by feature routes
- **Component-based**: Lazy load heavy components
- **Bundle Analysis**: Monitor bundle size regularly

### React Performance
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Virtual Scrolling**: For large lists
- **Image Optimization**: Lazy loading and proper formats
- **State Management**: Minimize re-renders

## 🔒 Security Best Practices

### Authentication
- **Auth0 PKCE Flow**: Use established authentication flow
- **Token Refresh**: Implement automatic token refresh
- **Route Protection**: Protect routes based on authentication state
- **Role Validation**: Validate user roles on protected actions

### Data Security
- **Input Sanitization**: Sanitize all user inputs
- **XSS Prevention**: Prevent cross-site scripting
- **CSRF Protection**: Implement CSRF protection
- **Secure Headers**: Use appropriate security headers

## 📝 Code Quality Tools

### Linting & Formatting
- **ESLint**: Use configured ESLint rules
- **Prettier**: Maintain consistent code formatting
- **TypeScript**: Leverage TypeScript compiler checks
- **Husky**: Pre-commit hooks for quality gates

### Git Workflow
- **Feature Branches**: Use feature branches for development
- **Conventional Commits**: Follow conventional commit format
- **Pull Requests**: Require PR reviews for main branch
- **Automated Testing**: Run tests on PR creation

## 🎯 Feature Development Workflow

### Before Starting
1. **Read Documentation**: Review relevant documentation sections
2. **Understand Architecture**: Check existing patterns and components
3. **Plan Implementation**: Design approach following established patterns
4. **Identify Reusables**: Find existing components/hooks to reuse

### Implementation Process
1. **Create Types**: Define TypeScript interfaces/types first
2. **Build Components**: Create reusable UI components
3. **Implement Hooks**: Extract business logic into custom hooks
4. **Add Validation**: Implement Zod schemas for inputs
5. **Handle Errors**: Use consistent error handling patterns
6. **Test Thoroughly**: Write comprehensive tests
7. **Document Changes**: Update relevant documentation

### Quality Checklist
- [ ] TypeScript strict compliance
- [ ] Proper error handling with AppError
- [ ] Input validation with Zod
- [ ] Authentication/authorization checks
- [ ] Reuse of existing components/patterns
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Test coverage
- [ ] Documentation updates

## 🔄 API Integration Patterns

### Standard API Call Pattern
```typescript
// Custom hook for API calls
const useFeatureData = () => {
  return useQuery({
    queryKey: ['feature-data'],
    queryFn: async () => {
      const response = await apiClient.get('/api/v1/feature');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Component usage
const FeatureComponent = () => {
  const { data, isLoading, error } = useFeatureData();
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return <FeatureDisplay data={data} />;
};
```

### Mutation Pattern
```typescript
const useFeatureMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: FeatureInput) => {
      const response = await apiClient.post('/api/v1/feature', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-data'] });
      notifications.show({
        title: 'Success',
        message: 'Feature updated successfully',
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

## 🎨 Component Development Patterns

### Standard Component Structure
```typescript
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ 
  // Destructured props
}) => {
  // Hooks
  // State
  // Effects
  // Handlers
  
  return (
    // JSX
  );
};

export default Component;
```

### Custom Hook Pattern
```typescript
interface UseFeatureOptions {
  // Options interface
}

interface UseFeatureReturn {
  // Return type interface
}

const useFeature = (options: UseFeatureOptions): UseFeatureReturn => {
  // Hook implementation
  
  return {
    // Return object
  };
};

export default useFeature;
```

## 🚨 Common Pitfalls to Avoid

### Performance Issues
- ❌ Creating objects/functions in render
- ❌ Missing dependency arrays in useEffect
- ❌ Not memoizing expensive calculations
- ❌ Unnecessary re-renders

### Security Issues
- ❌ Skipping input validation
- ❌ Missing authentication checks
- ❌ Exposing sensitive data in client
- ❌ Not sanitizing user inputs

### Code Quality Issues
- ❌ Duplicate code across features
- ❌ Missing error handling
- ❌ Inconsistent naming conventions
- ❌ Missing TypeScript types

### Architecture Issues
- ❌ Tight coupling between features
- ❌ Business logic in components
- ❌ Direct API calls in components
- ❌ Missing abstraction layers

## 📚 Quick Reference Links

- **Project Documentation**: [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md)
- **Architecture Guide**: [`docs/02-Architecture/README.md`](../docs/02-Architecture/README.md)
- **Development Standards**: [`docs/06-Guidelines/development-guide.md`](../docs/06-Guidelines/development-guide.md)
- **API Documentation**: [`docs/04-Backend/README.md`](../docs/04-Backend/README.md)
- **Security Guide**: [`docs/05-Security/README.md`](../docs/05-Security/README.md)
- **Feature Specifications**: [`docs/03-Frontend/README.md`](../docs/03-Frontend/README.md)
- **Component Library**: [`docs/06-Guidelines/components.md`](../docs/06-Guidelines/components.md)
- **Troubleshooting**: [`docs/troubleshooting.md`](../docs/troubleshooting.md)

## 🎯 Remember

**Always start with documentation, follow established patterns, maintain type safety, implement proper security, and write clean, testable code. The MWAP Client is a production-ready application with comprehensive documentation - use it as your guide for all development decisions.**