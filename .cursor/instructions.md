# MWAP Client - Cursor AI Instructions

## 🎯 Project Context

You are working on the **Modular Web Application Platform (MWAP) Client**, a production-ready React TypeScript application with comprehensive documentation and feature-based architecture.

## 📚 Essential Reading Order

1. **Start Here**: [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md) - Complete project overview
2. **Architecture**: [`docs/02-Architecture/README.md`](../docs/02-Architecture/README.md) - System design patterns
3. **Development**: [`docs/06-Guidelines/development-guide.md`](../docs/06-Guidelines/development-guide.md) - Coding standards
4. **API Integration**: [`docs/04-Backend/README.md`](../docs/04-Backend/README.md) - Critical API configuration
5. **Security**: [`docs/05-Security/README.md`](../docs/05-Security/README.md) - Auth patterns
6. **Features**: [`docs/03-Frontend/README.md`](../docs/03-Frontend/README.md) - Feature specifications

## 🧠 Core Development Mindset

### Always Remember
- **Documentation First**: Read relevant docs before coding
- **Pattern Reuse**: Follow established patterns and components
- **Type Safety**: Maintain strict TypeScript compliance
- **Security First**: Never skip authentication/authorization
- **No Duplication**: Reuse existing functions, services, types
- **Input Validation**: Use Zod for all user inputs
- **Modular Structure**: Follow feature-based organization

### Critical Configuration
- **API Base URL**: `/api` (configured in `src/shared/utils/api.ts`)
- **Vite Proxy**: DO NOT MODIFY `vite.config.ts` proxy configuration
- **Auth0 Integration**: Use established PKCE flow patterns
- **TypeScript**: Maintain strict mode compliance

## 🏗️ Project Structure Understanding

### Feature-Based Architecture
```
src/features/[module]/
├── hooks/          # Feature-specific React hooks
├── pages/          # Feature pages and components
├── types/          # TypeScript type definitions
└── index.ts        # Feature exports
```

### Current Features
- **auth**: Authentication and user management
- **tenants**: Multi-tenant organization management
- **projects**: Project creation and management
- **project-types**: Project type definitions
- **cloud-providers**: Cloud storage integrations
- **files**: File browsing and management

### Shared Resources
```
src/shared/
├── components/     # Reusable UI components
├── hooks/          # Global custom hooks
├── types/          # Global TypeScript types
└── utils/          # Utilities and API client
```

## 🔧 Development Workflow

### Before Any Task
1. **Explore Existing Code**: Use `find`, `grep`, `git` to understand current implementation
2. **Check Documentation**: Review relevant documentation sections
3. **Identify Patterns**: Find similar existing features to follow
4. **Plan Reuse**: Identify components/hooks/types to reuse

### Implementation Steps
1. **Analyze Requirements**: Understand the task completely
2. **Design Approach**: Plan implementation following established patterns
3. **Create Types**: Define TypeScript interfaces first
4. **Build Components**: Create or reuse UI components
5. **Implement Logic**: Extract business logic into custom hooks
6. **Add Validation**: Implement Zod schemas for inputs
7. **Handle Errors**: Use consistent error patterns
8. **Test Thoroughly**: Verify functionality and edge cases
9. **Update Documentation**: Document any new patterns or changes

### Quality Gates
- [ ] TypeScript strict compliance
- [ ] Proper error handling with AppError
- [ ] Input validation with Zod schemas
- [ ] Authentication/authorization checks
- [ ] Reuse of existing components/patterns
- [ ] Performance optimization (memoization, lazy loading)
- [ ] Accessibility compliance
- [ ] Test coverage (if testing environment available)

## 🎨 UI Development Standards

### Mantine UI Framework
- **Version**: Mantine v8
- **Components**: Use Mantine components consistently
- **Theme**: Follow established theme configuration
- **Responsive**: Implement mobile-first design
- **Accessibility**: Ensure WCAG compliance

### Styling Approach
- **Tailwind CSS**: Primary styling framework
- **Component Styles**: Keep styles close to components
- **Design Tokens**: Follow established design system
- **Performance**: Optimize CSS bundle size

## 🔒 Security Implementation

### Authentication Patterns
```typescript
// Use established Auth0 patterns
const { user, isAuthenticated, isLoading } = useAuth0();

// Role-based access control
const { hasRole, hasPermission } = useRoles();

// Protected route pattern
const ProtectedComponent = () => {
  if (!hasRole('REQUIRED_ROLE')) {
    return <UnauthorizedMessage />;
  }
  
  return <ComponentContent />;
};
```

### Input Validation
```typescript
// Always use Zod for validation
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
});

type FormData = z.infer<typeof schema>;
```

## 🚀 API Integration Patterns

### Standard API Call
```typescript
// Custom hook pattern
const useFeatureData = (id: string) => {
  return useQuery({
    queryKey: ['feature', id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/v1/feature/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
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
      queryClient.invalidateQueries({ queryKey: ['feature'] });
      notifications.show({
        title: 'Success',
        message: 'Operation completed successfully',
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

## 🧪 Testing Guidelines

### Testing Strategy
- **Unit Tests**: Test individual functions and hooks
- **Component Tests**: Test component behavior
- **Integration Tests**: Test feature workflows
- **E2E Tests**: Test critical user journeys

### Testing Tools Available
- **Vitest**: Primary testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: End-to-end testing

## 🎯 Common Task Patterns

### Adding New Feature
1. Create feature directory: `src/features/[feature-name]/`
2. Define types: `src/features/[feature-name]/types/index.ts`
3. Create hooks: `src/features/[feature-name]/hooks/`
4. Build pages: `src/features/[feature-name]/pages/`
5. Export feature: `src/features/[feature-name]/index.ts`
6. Update routing: `src/core/router/`
7. Add navigation: Update relevant navigation components

### Modifying Existing Feature
1. Analyze current implementation
2. Identify reusable patterns
3. Follow established conventions
4. Maintain backward compatibility
5. Update related components
6. Test thoroughly

### Adding UI Component
1. Check existing components first
2. Create in appropriate location (`src/shared/components/` or feature-specific)
3. Follow Mantine UI patterns
4. Implement TypeScript interfaces
5. Add proper accessibility
6. Document component usage

## 🚨 Critical Warnings

### Never Do These
- ❌ Modify Vite proxy configuration in `vite.config.ts`
- ❌ Skip authentication/authorization checks
- ❌ Create duplicate functions or components
- ❌ Ignore TypeScript errors or warnings
- ❌ Skip input validation with Zod
- ❌ Hardcode API URLs (use configured client)
- ❌ Create components without proper types
- ❌ Skip error handling

### Always Do These
- ✅ Read documentation before coding
- ✅ Follow established patterns
- ✅ Reuse existing components/hooks
- ✅ Implement proper error handling
- ✅ Use TypeScript strictly
- ✅ Validate all user inputs
- ✅ Test your implementations
- ✅ Update documentation when needed

## 🔄 Development Commands

### Essential Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Run tests (if available)
npm run test

# Preview production build
npm run preview
```

### Useful Git Commands
```bash
# Check current status
git status

# Create feature branch
git checkout -b feature/your-feature-name

# Stage and commit changes
git add .
git commit -m "feat: add your feature description"

# Push changes
git push origin feature/your-feature-name
```

## 📋 Quick Reference

### Key Files to Know
- **API Client**: `src/shared/utils/api.ts`
- **Auth Context**: `src/core/context/AuthContext.tsx`
- **Router Config**: `src/core/router/`
- **Global Types**: `src/shared/types/`
- **Main App**: `src/App.tsx`

### Important Directories
- **Features**: `src/features/` - All feature modules
- **Shared**: `src/shared/` - Reusable components and utilities
- **Core**: `src/core/` - Core application functionality
- **Documentation**: `docs/` - Comprehensive project documentation

### External Resources
- **Mantine UI**: https://mantine.dev/
- **React Query**: https://tanstack.com/query/
- **Auth0 React**: https://auth0.com/docs/quickstart/spa/react
- **Zod**: https://zod.dev/
- **Tailwind CSS**: https://tailwindcss.com/

## 🎯 Success Criteria

Your implementation is successful when:
- ✅ Follows established patterns and conventions
- ✅ Maintains TypeScript strict compliance
- ✅ Implements proper security measures
- ✅ Reuses existing components and utilities
- ✅ Handles errors gracefully
- ✅ Provides good user experience
- ✅ Is well-documented and maintainable
- ✅ Passes all quality gates

**Remember: The MWAP Client is a production-ready application with comprehensive documentation. Always leverage the existing patterns and documentation to build consistent, high-quality features.**