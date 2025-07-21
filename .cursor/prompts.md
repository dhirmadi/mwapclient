# MWAP Client - Cursor AI Prompts & Templates

## 🎯 Prompt Engineering for MWAP Client

This file contains optimized prompts and templates for working with the MWAP Client codebase using Cursor AI. These prompts are designed to leverage the comprehensive documentation and established patterns.

## 📚 Context-Setting Prompts

### Initial Project Context
```
You are working on the MWAP Client, a production-ready React TypeScript application with comprehensive documentation and feature-based architecture. 

Key Context:
- Read DOCUMENTATION_INDEX.md for complete project understanding
- Follow established patterns in src/features/ structure
- Use TypeScript strictly with proper error handling
- Implement Auth0 RBAC patterns consistently
- Never modify vite.config.ts proxy configuration
- Always validate inputs with Zod schemas

Before any task, reference the relevant documentation in docs/ directory.
```

### Feature Development Context
```
I'm working on a new feature for the MWAP Client. Please help me:

1. First, analyze the existing feature structure in src/features/
2. Reference docs/features/README.md for feature patterns
3. Follow the established architecture in docs/architecture/README.md
4. Apply coding standards from docs/development/README.md
5. Implement security patterns from docs/security/README.md

The feature should follow the pattern:
- types/index.ts for TypeScript definitions
- hooks/ for business logic
- pages/ for UI components
- index.ts for exports

Ensure proper RBAC, input validation, and error handling.
```

## 🏗️ Architecture-Focused Prompts

### Component Analysis
```
Analyze this React component in the MWAP Client codebase:

[PASTE COMPONENT CODE]

Please review for:
1. Adherence to patterns in docs/development/README.md
2. Proper TypeScript usage and type safety
3. Mantine UI v8 component usage
4. React Query integration patterns
5. Error handling and loading states
6. Security considerations (auth, validation)
7. Performance optimizations (memoization, etc.)
8. Accessibility compliance

Suggest improvements following established patterns.
```

### API Integration Review
```
Review this API integration code for the MWAP Client:

[PASTE API CODE]

Check against docs/api/README.md for:
1. Proper use of configured API client
2. Correct endpoint patterns (/api/v1/...)
3. React Query hook implementation
4. Error handling with AppError patterns
5. Type safety with API response types
6. Authentication token handling
7. Loading and error states
8. Cache invalidation strategies

Ensure it follows established API patterns.
```

## 🔧 Development Task Prompts

### Bug Fix Prompt
```
I'm experiencing this issue in the MWAP Client:

[DESCRIBE ISSUE]

Please help me debug by:
1. Checking docs/troubleshooting.md for common issues
2. Analyzing the error in context of the architecture
3. Reviewing relevant code patterns in the affected feature
4. Suggesting fixes that maintain established patterns
5. Ensuring the fix doesn't break other functionality
6. Recommending testing approaches

Provide a step-by-step solution following project standards.
```

### Performance Optimization
```
I need to optimize performance for this part of the MWAP Client:

[DESCRIBE PERFORMANCE ISSUE]

Please analyze and suggest optimizations:
1. Review current implementation against docs/development/README.md
2. Identify performance bottlenecks
3. Suggest React optimization patterns (memoization, lazy loading)
4. Recommend bundle size optimizations
5. Propose caching strategies with React Query
6. Ensure optimizations maintain code quality
7. Consider accessibility and user experience

Provide specific code improvements with explanations.
```

### Security Review
```
Please review this code for security compliance with MWAP Client standards:

[PASTE CODE]

Check against docs/security/README.md for:
1. Proper Auth0 integration patterns
2. Role-based access control implementation
3. Input validation with Zod schemas
4. Secure token handling
5. Protection against common vulnerabilities
6. Proper error handling without information leakage
7. Authentication state management

Suggest security improvements following established patterns.
```

## 🎨 UI/UX Development Prompts

### Component Creation
```
I need to create a new UI component for the MWAP Client with these requirements:

[DESCRIBE REQUIREMENTS]

Please help me create a component that:
1. Follows patterns in docs/components/README.md
2. Uses Mantine UI v8 components consistently
3. Implements proper TypeScript interfaces
4. Includes responsive design with Tailwind CSS
5. Ensures accessibility compliance
6. Handles loading and error states
7. Integrates with the design system
8. Follows established naming conventions

Provide the complete component implementation.
```

### Form Implementation
```
I need to implement a form in the MWAP Client with these fields:

[DESCRIBE FORM FIELDS]

Please create a form that:
1. Uses React Hook Form with Zod validation
2. Implements Mantine UI form components
3. Includes proper TypeScript types
4. Handles form submission with React Query
5. Provides user feedback (loading, success, error)
6. Follows accessibility guidelines
7. Implements proper error handling
8. Uses established form patterns from the codebase

Include validation schemas and submission logic.
```

## 🔄 Refactoring Prompts

### Code Refactoring
```
I want to refactor this code in the MWAP Client to improve maintainability:

[PASTE CODE TO REFACTOR]

Please refactor following these principles:
1. Maintain established patterns from docs/development/README.md
2. Improve TypeScript type safety
3. Extract reusable logic into custom hooks
4. Optimize performance with proper memoization
5. Ensure backward compatibility
6. Maintain security measures
7. Improve code readability and organization
8. Follow DRY principles

Provide the refactored code with explanations.
```

### Feature Migration
```
I need to migrate this feature to follow the current MWAP Client architecture:

[DESCRIBE CURRENT IMPLEMENTATION]

Please help migrate to:
1. Feature-based structure (src/features/[module]/)
2. Proper TypeScript definitions in types/
3. Business logic in hooks/
4. UI components in pages/
5. Proper exports in index.ts
6. Updated routing configuration
7. Consistent error handling
8. Security implementation

Provide a migration plan and updated code structure.
```

## 🧪 Testing Prompts

### Test Implementation
```
I need to write tests for this MWAP Client component/hook:

[PASTE CODE TO TEST]

Please create tests that:
1. Follow testing patterns in docs/development/README.md
2. Use Vitest and React Testing Library
3. Test component behavior and rendering
4. Mock API calls appropriately
5. Test error handling scenarios
6. Verify accessibility compliance
7. Include edge cases and boundary conditions
8. Maintain good test coverage

Provide comprehensive test implementation.
```

### Test Review
```
Please review these tests for the MWAP Client:

[PASTE TEST CODE]

Check for:
1. Proper testing patterns and best practices
2. Adequate coverage of functionality
3. Appropriate mocking strategies
4. Error scenario testing
5. Accessibility testing
6. Performance considerations
7. Maintainability and readability
8. Integration with existing test suite

Suggest improvements and additional test cases.
```

## 📝 Documentation Prompts

### Code Documentation
```
Please help me document this code for the MWAP Client:

[PASTE CODE]

Create documentation that:
1. Follows project documentation standards
2. Explains the purpose and functionality
3. Provides usage examples
4. Documents API interfaces and types
5. Includes implementation notes
6. References related documentation
7. Explains design decisions
8. Provides troubleshooting information

Format as markdown following project conventions.
```

### Feature Documentation
```
I've implemented a new feature in the MWAP Client. Please help create documentation:

Feature: [FEATURE NAME]
Implementation: [DESCRIBE IMPLEMENTATION]

Create documentation that includes:
1. Feature overview and purpose
2. User flows and functionality
3. Technical implementation details
4. API endpoints and data models
5. Security considerations
6. Integration points
7. Testing approach
8. Future enhancements

Follow the format in docs/features/README.md.
```

## 🎯 Specialized Prompts

### Auth0 Integration
```
I need help with Auth0 integration in the MWAP Client:

[DESCRIBE AUTH REQUIREMENT]

Please provide implementation that:
1. Follows patterns in docs/security/README.md
2. Uses established Auth0 PKCE flow
3. Implements proper role-based access control
4. Handles token refresh automatically
5. Manages authentication state correctly
6. Provides proper error handling
7. Ensures security best practices
8. Integrates with existing auth context

Include complete implementation with error handling.
```

### React Query Integration
```
I need to implement data fetching with React Query in the MWAP Client:

[DESCRIBE DATA REQUIREMENTS]

Please create implementation that:
1. Uses established API client patterns
2. Implements proper query keys and functions
3. Handles loading and error states
4. Provides optimistic updates where appropriate
5. Implements proper cache invalidation
6. Follows established mutation patterns
7. Includes proper TypeScript types
8. Provides user feedback

Include hooks and component integration.
```

### Mantine UI Implementation
```
I need to implement UI components using Mantine UI v8 for the MWAP Client:

[DESCRIBE UI REQUIREMENTS]

Please create components that:
1. Use Mantine UI v8 components consistently
2. Follow established theming patterns
3. Implement responsive design
4. Ensure accessibility compliance
5. Integrate with Tailwind CSS utilities
6. Handle different states (loading, error, empty)
7. Follow component composition patterns
8. Maintain design system consistency

Provide complete component implementation.
```

## 🚀 Quick Action Prompts

### Quick Fix
```
Quick fix needed for MWAP Client:
Issue: [BRIEF DESCRIPTION]
Code: [PASTE RELEVANT CODE]

Provide a minimal fix that maintains project standards.
```

### Pattern Check
```
Does this code follow MWAP Client patterns?
[PASTE CODE]

Quick review against established standards.
```

### Type Safety Check
```
Review TypeScript usage in this MWAP Client code:
[PASTE CODE]

Check for type safety and suggest improvements.
```

### Security Check
```
Security review for this MWAP Client code:
[PASTE CODE]

Quick security assessment against project standards.
```

## 📋 Prompt Templates

### General Template
```
Context: MWAP Client - [TASK TYPE]
Documentation: Reference docs/[RELEVANT_SECTION]/README.md
Requirements: [LIST REQUIREMENTS]
Code: [PASTE CODE IF APPLICABLE]

Please [SPECIFIC REQUEST] following established patterns and documentation.
```

### Feature Template
```
Feature: [FEATURE NAME] for MWAP Client
Location: src/features/[MODULE]/
Requirements: [LIST REQUIREMENTS]
Patterns: Follow existing [SIMILAR_FEATURE] patterns
Security: Implement RBAC for [ROLES]
API: Integrate with /api/v1/[ENDPOINTS]

Create complete feature implementation.
```

### Review Template
```
Review: [CODE TYPE] in MWAP Client
Standards: docs/development/README.md
Security: docs/security/README.md
Architecture: docs/architecture/README.md
Code: [PASTE CODE]

Provide comprehensive review with improvement suggestions.
```

**Remember: These prompts are designed to leverage the comprehensive documentation and established patterns in the MWAP Client. Always reference the relevant documentation sections and maintain the high-quality standards established throughout the codebase.**