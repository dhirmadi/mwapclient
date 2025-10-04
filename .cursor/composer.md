# MWAP Client - Cursor Composer Configuration

## 🎯 Composer Context

You are working on the **MWAP Client**, a production-ready React TypeScript application with comprehensive documentation and feature-based architecture. Use this configuration to guide multi-file editing and complex refactoring tasks.

## 📚 Essential Context Files

### Primary Documentation
- [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md) - Complete project overview
- [`docs/02-Architecture/README.md`](../docs/02-Architecture/README.md) - System architecture
- [`docs/06-Guidelines/development-guide.md`](../docs/06-Guidelines/development-guide.md) - Coding standards
- [`docs/04-Backend/README.md`](../docs/04-Backend/README.md) - API integration patterns
- [`docs/05-Security/README.md`](../docs/05-Security/README.md) - Security implementation
- [`docs/03-Frontend/README.md`](../docs/03-Frontend/README.md) - Feature specifications

### Key Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.app.json` - TypeScript configuration with path aliases
- `vite.config.ts` - Build configuration (DO NOT MODIFY proxy settings)
- `tailwind.config.js` - Styling configuration
- `eslint.config.js` - Code quality rules

## 🏗️ Project Architecture

### Feature-Based Structure
```
src/features/[module]/
├── hooks/          # React hooks for business logic
├── pages/          # UI components and pages
├── types/          # TypeScript type definitions
└── index.ts        # Feature exports
```

### Core Application Structure
```
src/
├── features/       # Feature modules (auth, tenants, projects, etc.)
├── shared/         # Reusable components, hooks, types, utilities
├── core/           # Core app functionality (context, layouts, router)
├── components/     # Global UI components
├── pages/          # Top-level pages
└── assets/         # Static assets
```

## 🔧 Development Standards

### TypeScript Configuration
- **Strict Mode**: Always maintain strict TypeScript compliance
- **Path Aliases**: Use configured aliases (@/, @components/, @features/, etc.)
- **Explicit Types**: Define explicit return types for all functions
- **Interface First**: Use interfaces for object shapes

### React Patterns
- **Functional Components**: Use function components with hooks
- **Custom Hooks**: Extract business logic into reusable hooks
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Error Boundaries**: Implement proper error handling

### API Integration
- **React Query**: Use for all server state management
- **Axios Client**: Use configured client from `src/shared/utils/api.ts`
- **Error Handling**: Implement consistent patterns with AppError
- **Type Safety**: Match API response types exactly

## 🎨 UI/UX Standards

### Mantine UI Framework (v8)
- **Components**: Use Mantine components consistently
- **Theme System**: Follow established theme configuration
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG compliance

### Styling Approach
- **Tailwind CSS**: Primary utility-first framework
- **Component Styles**: Keep styles close to components
- **Design Tokens**: Follow established design system
- **Performance**: Optimize bundle size

## 🔒 Security Implementation

### Authentication (Auth0)
- **PKCE Flow**: Use established Auth0 patterns
- **Role-Based Access**: Implement RBAC consistently
- **Token Management**: Secure token handling
- **Route Protection**: Protect routes based on auth state

### Input Validation
- **Zod Schemas**: Use for all user input validation
- **Sanitization**: Sanitize user inputs
- **Error Handling**: Consistent error patterns

## 🚀 Performance Optimization

### Code Splitting
- **Route-based**: Split by feature routes
- **Component-based**: Lazy load heavy components
- **Bundle Analysis**: Monitor bundle size

### React Performance
- **Memoization**: Prevent unnecessary re-renders
- **Virtual Scrolling**: For large data sets
- **Image Optimization**: Lazy loading and proper formats

## 🧪 Testing Strategy

### Testing Tools
- **Vitest**: Primary testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **Playwright**: End-to-end testing

### Testing Patterns
- **Unit Tests**: Individual functions and hooks
- **Component Tests**: UI behavior and rendering
- **Integration Tests**: Feature workflows
- **E2E Tests**: Critical user journeys

## 🎯 Multi-File Editing Guidelines

### Feature Development
When creating or modifying features across multiple files:

1. **Types First**: Define TypeScript interfaces in `types/index.ts`
2. **Hooks Next**: Implement business logic in `hooks/`
3. **Components Last**: Build UI components in `pages/`
4. **Export Everything**: Update `index.ts` with exports
5. **Update Routes**: Modify router configuration if needed
6. **Update Navigation**: Add navigation links if required

### Refactoring Guidelines
When refactoring across multiple files:

1. **Analyze Dependencies**: Understand file relationships
2. **Plan Changes**: Design refactoring approach
3. **Maintain Compatibility**: Ensure backward compatibility
4. **Update Imports**: Fix all import statements
5. **Test Thoroughly**: Verify all functionality works
6. **Update Documentation**: Reflect changes in docs

### Component Library Updates
When updating shared components:

1. **Check Usage**: Find all component usages
2. **Maintain API**: Keep component interface stable
3. **Add Props Gradually**: Use optional props for new features
4. **Update Types**: Ensure TypeScript compliance
5. **Test All Usages**: Verify no breaking changes

## 🔄 Common Multi-File Patterns

### Adding New Feature Module
```
1. Create feature directory structure
2. Define types in types/index.ts
3. Implement hooks in hooks/
4. Create pages in pages/
5. Export in index.ts
6. Update router configuration
7. Add navigation links
8. Update documentation
```

### API Integration Updates
```
1. Update types to match API schema
2. Modify API client calls
3. Update React Query hooks
4. Fix component prop types
5. Update error handling
6. Test API integration
```

### UI Component Refactoring
```
1. Identify component dependencies
2. Plan component API changes
3. Update component implementation
4. Fix all import statements
5. Update component usage
6. Test visual consistency
```

## 🚨 Critical Considerations

### Never Modify
- ❌ Vite proxy configuration in `vite.config.ts`
- ❌ Core TypeScript configuration without review
- ❌ Auth0 configuration without understanding
- ❌ API client base configuration

### Always Maintain
- ✅ TypeScript strict compliance across all files
- ✅ Consistent error handling patterns
- ✅ Security measures (auth, validation)
- ✅ Performance optimizations
- ✅ Accessibility standards
- ✅ Documentation updates

### File Relationship Awareness
- **Types**: Shared across multiple features
- **Hooks**: May depend on multiple API endpoints
- **Components**: May use multiple shared components
- **Routes**: Connected to authentication and authorization
- **Context**: Used throughout the application

## 🎨 Code Quality Standards

### ESLint Configuration
- Follow configured ESLint rules
- Fix all linting errors before committing
- Use consistent formatting with Prettier
- Maintain code quality standards

### Git Workflow
- Use conventional commit messages
- Create feature branches for development
- Require PR reviews for main branch
- Run automated tests on PR creation

## 📋 Multi-File Task Checklist

### Before Starting
- [ ] Read relevant documentation sections
- [ ] Understand file dependencies and relationships
- [ ] Plan changes across all affected files
- [ ] Identify reusable patterns and components

### During Implementation
- [ ] Maintain TypeScript strict compliance
- [ ] Follow established patterns and conventions
- [ ] Implement proper error handling
- [ ] Use consistent naming conventions
- [ ] Add proper input validation
- [ ] Maintain security measures

### After Implementation
- [ ] Test all affected functionality
- [ ] Verify no breaking changes
- [ ] Update relevant documentation
- [ ] Run linting and fix issues
- [ ] Check bundle size impact
- [ ] Verify accessibility compliance

## 🎯 Success Metrics

Your multi-file changes are successful when:
- ✅ All TypeScript errors are resolved
- ✅ All tests pass (if testing environment available)
- ✅ No breaking changes introduced
- ✅ Performance is maintained or improved
- ✅ Security measures are preserved
- ✅ Code quality standards are met
- ✅ Documentation is updated appropriately
- ✅ User experience is maintained or enhanced

## 🔗 Quick Reference Links

- **Project Root**: [`../`](../)
- **Source Code**: [`../src/`](../src/)
- **Documentation**: [`../docs/`](../docs/)
- **Features**: [`../src/features/`](../src/features/)
- **Shared Code**: [`../src/shared/`](../src/shared/)
- **Core App**: [`../src/core/`](../src/core/)

**Remember: The MWAP Client is a production-ready application with comprehensive documentation. Always leverage existing patterns and maintain the high-quality standards established throughout the codebase.**