# 🎯 MWAP Client - Cursor AI Prompt Templates

## 🧩 Feature Development Prompts

### New Feature Implementation
```
Create a new [FEATURE_NAME] feature following MWAP patterns:

**Requirements:**
- Follow feature-based architecture in `src/features/[feature-name]/`
- Include: components/, hooks/, pages/, types/, utils/
- Use Mantine UI components with consistent styling
- Implement proper RBAC for [ROLE_REQUIREMENTS]
- Use React Query for data fetching
- Add Zod validation for all inputs
- Follow TypeScript strict mode

**Integration Points:**
- API endpoints: [LIST_ENDPOINTS]
- Authentication: [AUTH_REQUIREMENTS]
- Navigation: [NAVIGATION_UPDATES]
- Permissions: [PERMISSION_CHECKS]

**Reference Documentation:**
- `docs/features/README.md` for feature patterns
- `docs/development/README.md` for coding standards
- `docs/api/README.md` for API integration
```

### Component Creation
```
Create a [COMPONENT_NAME] component following MWAP standards:

**Requirements:**
- Use Mantine UI components and Tabler icons
- Implement proper TypeScript interfaces
- Include loading and error states
- Follow accessibility best practices
- Use existing patterns from `src/shared/components/`

**Props Interface:**
```typescript
interface [ComponentName]Props {
  // Define props here
}
```

**Styling:**
- Use Mantine component props for styling
- Apply Tailwind classes where appropriate
- Ensure responsive design

**Reference:** Check similar components in the codebase for patterns
```

### API Integration
```
Implement API integration for [ENDPOINT_NAME]:

**Requirements:**
- Use React Query with proper caching
- Follow API patterns in `src/shared/utils/api.ts`
- Implement error handling with AppError
- Add proper TypeScript types matching API schema
- Use PATCH for updates, not PUT

**Endpoint Details:**
- URL: `/api/v1/[endpoint]`
- Method: [GET/POST/PATCH/DELETE]
- Authentication: Required
- Response format: `{success: boolean, data: any}`

**Reference:** `docs/api/README.md` for API patterns
```

## 🔧 Bug Fix Prompts

### Cloud Provider Integration Fix
```
Fix cloud provider integration issue:

**Problem:** [DESCRIBE_ISSUE]

**Root Cause Analysis:**
- Check `provider.isActive` field status
- Verify OAuth flow implementation
- Review admin interface completeness
- Examine type definitions

**Files to Check:**
- `src/features/integrations/components/OAuthButton.tsx`
- `src/features/cloud-providers/pages/CloudProviderEditPage.tsx`
- `src/features/cloud-providers/types/cloud-provider.types.ts`

**Fix Requirements:**
- Maintain existing OAuth PKCE implementation
- Follow established error handling patterns
- Update admin interface if needed
- Ensure type safety throughout
```

### Authentication Issue Fix
```
Fix authentication/authorization issue:

**Problem:** [DESCRIBE_ISSUE]

**Investigation Steps:**
1. Check Auth0 configuration in `src/core/context/AuthContext.tsx`
2. Verify role-based access control implementation
3. Review protected route configuration
4. Examine token management patterns

**Requirements:**
- Maintain security standards
- Follow existing Auth0 patterns
- Ensure proper role checking
- Update route protection if needed

**Reference:** `docs/security/README.md` for auth patterns
```

### Performance Optimization
```
Optimize performance for [COMPONENT/FEATURE]:

**Current Issues:**
- [LIST_PERFORMANCE_ISSUES]

**Optimization Strategies:**
- Implement React.memo for expensive components
- Add useMemo/useCallback for expensive computations
- Optimize React Query caching strategies
- Consider code splitting for large components

**Requirements:**
- Maintain existing functionality
- Follow React best practices
- Measure performance impact
- Update documentation if patterns change
```

## 🎨 UI/UX Enhancement Prompts

### Mantine UI Component Enhancement
```
Enhance [COMPONENT_NAME] with better UX:

**Current State:** [DESCRIBE_CURRENT]
**Desired State:** [DESCRIBE_DESIRED]

**Requirements:**
- Use Mantine UI components consistently
- Implement proper loading states
- Add error handling with user feedback
- Ensure accessibility compliance
- Follow existing design patterns

**Mantine Components to Consider:**
- Notifications for user feedback
- Skeleton loaders for loading states
- Modal/Drawer for complex interactions
- Alert components for errors/warnings

**Reference:** `docs/components/README.md` for UI patterns
```

### Responsive Design Improvement
```
Improve responsive design for [COMPONENT/PAGE]:

**Requirements:**
- Use Mantine breakpoint system
- Implement mobile-first approach
- Ensure touch-friendly interactions
- Test across different screen sizes

**Breakpoints:**
- xs: 576px
- sm: 768px
- md: 992px
- lg: 1200px
- xl: 1400px

**Components to Update:**
- [LIST_COMPONENTS]
```

## 🧪 Testing Prompts

### Unit Test Creation
```
Create unit tests for [COMPONENT/HOOK]:

**Requirements:**
- Use Vitest and React Testing Library
- Test all major functionality
- Include edge cases and error scenarios
- Mock external dependencies appropriately
- Follow existing test patterns

**Test Cases:**
- [LIST_TEST_CASES]

**Mock Requirements:**
- API calls with MSW
- Auth context with test providers
- React Query with test client

**Reference:** Existing tests in `src/` for patterns
```

### Integration Test Creation
```
Create integration tests for [FEATURE]:

**User Journey:**
1. [STEP_1]
2. [STEP_2]
3. [STEP_3]

**Requirements:**
- Test complete user workflows
- Include authentication scenarios
- Test different user roles
- Verify API interactions
- Check error handling

**Setup:**
- Mock authentication state
- Setup test data
- Configure API mocks
```

## 📚 Documentation Prompts

### Feature Documentation
```
Create documentation for [FEATURE_NAME]:

**Structure:**
- Overview and purpose
- User roles and permissions
- API endpoints used
- Component architecture
- Usage examples
- Troubleshooting guide

**Requirements:**
- Follow existing documentation patterns
- Include code examples
- Add screenshots for UI components
- Reference related features
- Update DOCUMENTATION_INDEX.md

**Location:** `docs/features/[feature-name].md`
```

### API Documentation Update
```
Update API documentation for [ENDPOINT]:

**Requirements:**
- Document request/response schemas
- Include authentication requirements
- Add example requests and responses
- Note any breaking changes
- Update OpenAPI schema if needed

**Reference:** `docs/api/README.md` for format
```

## 🔍 Code Review Prompts

### Code Review Checklist
```
Review this code change for MWAP standards:

**Checklist:**
- [ ] Follows feature-based architecture
- [ ] Uses existing patterns and components
- [ ] Implements proper TypeScript typing
- [ ] Includes authentication/authorization checks
- [ ] Handles errors consistently
- [ ] Uses React Query for data fetching
- [ ] Validates inputs with Zod
- [ ] Follows Mantine UI patterns
- [ ] Maintains accessibility standards
- [ ] Updates relevant documentation

**Security Review:**
- [ ] Proper RBAC implementation
- [ ] Input validation and sanitization
- [ ] Secure API communication
- [ ] No sensitive data exposure

**Performance Review:**
- [ ] Efficient re-rendering patterns
- [ ] Proper memoization usage
- [ ] Optimized API calls
- [ ] Bundle size impact
```

### Refactoring Review
```
Review refactoring for [COMPONENT/FEATURE]:

**Changes Made:**
- [LIST_CHANGES]

**Impact Assessment:**
- Breaking changes: [YES/NO]
- Performance impact: [POSITIVE/NEGATIVE/NEUTRAL]
- Maintainability: [IMPROVED/SAME/DEGRADED]
- Test coverage: [MAINTAINED/IMPROVED/REDUCED]

**Requirements:**
- Maintain backward compatibility where possible
- Update all related imports and references
- Keep the same API contracts
- Test thoroughly after changes
- Update documentation if patterns change
```

## 🚀 Deployment Prompts

### Production Readiness Check
```
Verify production readiness for [FEATURE/CHANGE]:

**Checklist:**
- [ ] All TypeScript errors resolved
- [ ] Tests passing (unit, integration, e2e)
- [ ] Performance benchmarks met
- [ ] Security review completed
- [ ] Documentation updated
- [ ] Error handling comprehensive
- [ ] Accessibility compliance verified
- [ ] Cross-browser testing completed

**Build Verification:**
- [ ] Production build successful
- [ ] Bundle size within limits
- [ ] No console errors/warnings
- [ ] Environment variables configured
```

## 💡 Troubleshooting Prompts

### Debug Issue
```
Debug [ISSUE_DESCRIPTION]:

**Investigation Steps:**
1. Reproduce the issue consistently
2. Check browser console for errors
3. Verify API responses and status codes
4. Check authentication state
5. Review React Query cache state
6. Examine component re-render patterns

**Common Causes:**
- Authentication/authorization issues
- API endpoint problems
- React Query caching issues
- Component state management
- Type definition mismatches

**Tools:**
- React Developer Tools
- Network tab for API calls
- React Query DevTools
- TypeScript compiler output
```

### Performance Investigation
```
Investigate performance issue in [COMPONENT/PAGE]:

**Metrics to Check:**
- Component render times
- API response times
- Bundle size impact
- Memory usage patterns
- Network request efficiency

**Tools:**
- React Profiler
- Chrome DevTools Performance tab
- Bundle analyzer
- Lighthouse audit
- React Query DevTools

**Common Issues:**
- Unnecessary re-renders
- Large bundle sizes
- Inefficient API calls
- Memory leaks
- Unoptimized images/assets
```

These prompt templates provide structured approaches to common development tasks while ensuring consistency with MWAP Client standards and patterns.