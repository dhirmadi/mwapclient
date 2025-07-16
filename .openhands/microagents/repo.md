
# Model Guidance
Always keep output concise and strictly technical. Only use technical language. Avoid any filler, fluff, or informal conversation. 
Limit answers to bullet points or tight prose, with no extra explanation. No metaphors or analogies. 
Never imitate non-technical personas; always respond as an engineer or developer.

# MWAP Client Repository Guide for OpenHands with Claude 4 Sonnet

## 🎯 OpenHands Integration Instructions

**Claude, when working on this repository:**

- 🧠 **Read comprehensive documentation**: Start with [`DOCUMENTATION_INDEX.md`](../../DOCUMENTATION_INDEX.md) for complete project understanding
- 🔁 **Reuse existing patterns**: Follow established components, hooks, types, middleware, and routes
- ✅ **Maintain type safety**: Keep implementations TypeScript-strict and minimal
- 📚 **Follow MWAP standards**: Use `AppError`, `logger`, `SuccessResponse` patterns consistently
- 🔐 **Never skip security**: Always implement authentication/authorization middleware
- 🚫 **Avoid duplication**: Do not create duplicate functions, services, types, or schemas
- 🧪 **Validate inputs**: Use Zod for all input validation
- 🧱 **Maintain modularity**: Follow clean `features/<module>/` structure
- 📖 **Reference documentation**: Use organized docs structure for accurate implementation

## Project Overview

The Modular Web Application Platform (MWAP) Client is a comprehensive frontend application designed to provide a secure, role-based interface for managing cloud-based projects, tenants, and resources. This React-based application serves as the user interface for the MWAP ecosystem, enabling organizations to efficiently manage their cloud resources and project workflows.

### Key Features

- **Multi-tenant Architecture**: Support for organizations with complex project management needs
- **Role-Based Access Control**: Dynamic UI and permissions based on user roles (SuperAdmin, Tenant Owner, Project Member)
- **Cloud Provider Integration**: Connect to various cloud storage providers
- **Project Management**: Create and manage projects with specific types and cloud integrations
- **Resource Management**: Browse, view, and manage files stored in connected cloud providers

## Technical Stack

- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine UI with Tailwind CSS
- **State Management**: React Query for server state, Context API for client state
- **Authentication**: Auth0 React SDK with PKCE flow
- **API Integration**: Axios with React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6+
- **Testing**: Vitest with React Testing Library

## Project Structure

The codebase has been successfully refactored to a feature-based architecture:

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
    /auth                   # Authentication feature
      /hooks               # Auth-specific hooks
      /pages               # Auth pages (login, etc.)
      /types               # Auth type definitions
    /cloud-providers        # Cloud provider management
      /hooks               # Cloud provider hooks
      /pages               # Cloud provider pages
      /types               # Cloud provider types
    /files                  # File management
      /hooks               # File-related hooks
      /types               # File type definitions
    /project-types          # Project type management
      /hooks               # Project type hooks
      /pages               # Project type pages
      /types               # Project type types
    /projects               # Project management
      /hooks               # Project-related hooks
      /pages               # Project pages
      /types               # Project type definitions
    /tenants                # Tenant management
      /hooks               # Tenant-related hooks
      /pages               # Tenant pages
      /types               # Tenant type definitions
  /pages                    # Top-level pages (Home, Dashboard, etc.)
  /shared                   # Shared utilities and components
    /components            # Reusable UI components
    /hooks                 # Shared custom hooks
    /types                 # Global type definitions
    /utils                 # Utility functions and API client
  App.tsx                   # Main App component
  main.tsx                  # Application entry point
```

This feature-based architecture provides better organization, maintainability, and scalability.

## User Roles and Permissions

### SuperAdmin
- Manage all tenants (view, create, edit, archive, unarchive)
- Manage all projects (view, archive, unarchive)
- Full CRUD operations for ProjectTypes
- Full CRUD operations for CloudProviders
- View system-wide analytics and metrics

### Tenant Owner
- Manage their tenant (view, edit)
- Create and manage projects within their tenant
- Manage cloud provider integrations for their tenant
- Invite and manage project members
- View tenant-level analytics

### Project Member
- **Project Owner**: Full control over a specific project
- **Project Deputy**: Can edit project details and manage members
- **Project Member**: Can view and interact with project resources

## 📚 Comprehensive Documentation Structure

**Complete documentation is organized in [`docs/`](../../docs/) directory:**

### Core Documentation
- **[Architecture & Solution Design](../../docs/architecture/README.md)** - System architecture, design patterns, technical decisions
- **[Developer Guidelines](../../docs/development/README.md)** - Coding standards, conventions, best practices
- **[API Integration](../../docs/api/README.md)** - Complete API documentation including critical Vite configuration
- **[Security & Authentication](../../docs/security/README.md)** - Authentication flows, security measures, RBAC
- **[Features](../../docs/features/README.md)** - Detailed description of each application feature
- **[Components & UI Patterns](../../docs/components/README.md)** - Component structure, UI patterns, file organization
- **[Changelog & Feature Status](../../docs/changelog/README.md)** - Feature status, migration history, release notes

### Quick Reference
- **[Getting Started](../../docs/getting-started.md)** - Setup and initial development guide
- **[Troubleshooting](../../docs/troubleshooting.md)** - Common issues and solutions
- **[Contributing](../../docs/contributing.md)** - Guidelines for contributing to the project

## API Documentation

**⚠️ CRITICAL: Always reference [API Documentation](../../docs/api/README.md) for complete details**

The application communicates with a RESTful API. Key documentation files:

- [`docs/api/README.md`](../../docs/api/README.md): Complete API integration guide
- [`docs/api/v3-openAPI-schema.md`](../../docs/api/v3-openAPI-schema.md): OpenAPI schema documentation
- [`docs/api/cloud-providers.md`](../../docs/api/cloud-providers.md): Cloud provider API documentation


### Key API Endpoints (v3)

**⚠️ CRITICAL: API Configuration Requirements**
- **API Base URL:** `/api` (configured in `src/shared/utils/api.ts`)
- **Vite Proxy Configuration:** Current setup in `vite.config.ts` is correct and must NOT be changed
- **Proxy Target:** `https://mwapss.shibari.photo/api/v1`
- **URL Rewriting:** Vite automatically rewrites `/api/*` requests to `/*` on the target server

**Example API Call Flow:**
1. Frontend makes request to: `/api/users/me/roles`
2. Vite proxy forwards to: `https://mwapss.shibari.photo/api/v1/users/me/roles`
3. Backend processes and returns wrapped response: `{success: true, data: {...}}`

- `/api/v1/tenants`: Tenant management
- `/api/v1/projects`: Project management
- `/api/v1/cloud-providers`: Cloud provider management
- `/api/v1/project-types`: Project type management
- `/api/v1/users`: User management
- `/api/v1/tenants/{tenantId}/integrations`: Cloud provider integrations
- File access is read-only through cloud provider integrations

## Authentication Flow

1. User visits the application
2. If unauthenticated, redirected to login page
3. Auth0 handles authentication
4. Upon successful login, user roles are fetched
5. User is directed to appropriate dashboard based on role

## Current Status and Architecture

### Completed Improvements

1. **✅ Feature-Based Architecture**: Successfully refactored to feature-based organization
2. **✅ API v3 Migration**: Updated all endpoints and types to match v3 API specification
3. **✅ Consistent HTTP Methods**: All updates now use PATCH instead of PUT
4. **✅ Type Safety**: All TypeScript types match API schemas exactly
5. **✅ Cloud Provider Integration**: Fixed integration endpoints and OAuth token refresh

### Current Architecture Benefits

1. **Modular Organization**: Each feature is self-contained with its own hooks, pages, and types
2. **Consistent Data Fetching**: Standardized patterns using React Query
3. **Role-Based Access Control**: Proper RBAC implementation throughout
4. **API Compatibility**: Full compatibility with v3 API specification
5. **Type Safety**: Comprehensive TypeScript coverage

### Future Development Priorities

1. Optimize performance with code splitting and memoization
2. Add comprehensive testing coverage
3. Implement real-time features
4. Enhance error handling and user feedback
5. Add analytics and reporting capabilities

## 🔧 Development Workflow for OpenHands

### Before Starting Any Task
1. **Read Documentation**: Review [`DOCUMENTATION_INDEX.md`](../../DOCUMENTATION_INDEX.md) and relevant sections
2. **Understand Architecture**: Check [`docs/architecture/README.md`](../../docs/architecture/README.md) for system design
3. **Review Standards**: Follow [`docs/development/README.md`](../../docs/development/README.md) for coding conventions
4. **Check Security**: Understand [`docs/security/README.md`](../../docs/security/README.md) for authentication patterns

### Task Implementation Pattern
1. **Analyze existing code**: Use `find`, `grep`, and `git` commands to understand current implementation
2. **Reuse components**: Check `src/shared/components/` and `src/features/*/` for existing solutions
3. **Follow patterns**: Use established hooks, types, and API patterns from similar features
4. **Validate inputs**: Implement Zod schemas for all user inputs
5. **Handle errors**: Use `AppError` and consistent error handling patterns
6. **Test thoroughly**: Verify functionality and edge cases

### Critical Implementation Rules
- **API Configuration**: Never modify Vite proxy configuration in `vite.config.ts`
- **Authentication**: Always implement proper RBAC checks using existing patterns
- **Type Safety**: Maintain strict TypeScript compliance
- **Performance**: Use React Query for data fetching and proper memoization
- **Security**: Follow established Auth0 and security patterns

## Development Guidelines

When working with this codebase, follow these principles:

1. **DRY (Don't Repeat Yourself)**: Identify and eliminate redundancies
2. **Feature-Based Organization**: Group related components, hooks, and utilities by feature
3. **Consistent Data Fetching**: Use standardized patterns for API calls
4. **Role-Based UI Adaptation**: Ensure UI elements adapt based on user permissions
5. **Performance Optimization**: Implement code splitting, memoization, and proper caching
6. **Comprehensive Error Handling**: Use consistent error handling patterns
7. **Type Safety**: Leverage TypeScript for type safety throughout the codebase

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file based on `.env.example`
4. Start the development server with `npm run dev`

## Testing

- Unit tests: `npm run test`
- Component tests: `npm run test:components`
- End-to-end tests: `npm run test:e2e`

## Deployment

The application is built for production with `npm run build` and can be deployed to any static hosting service.

## Future Roadmap

1. ✅ ~~Implement the feature-based architecture refactoring~~ (Completed)
2. ✅ ~~Enhance cloud provider integration capabilities~~ (Completed with v3 API)
3. Add advanced file management features (read-only access currently implemented)
4. Implement real-time collaboration tools
5. Add analytics and reporting features
6. Implement comprehensive testing suite
7. Add performance optimizations and code splitting

## 🚀 OpenHands Task Template

Use this template for feature development:

```markdown
## Task: [Feature Name]
**Target Files**: `src/features/[module]/[files]`
**Documentation**: Reference [`docs/features/README.md`](../../docs/features/README.md)

### Requirements
- Follow [`docs/development/README.md`](../../docs/development/README.md) coding standards
- Implement proper RBAC using patterns from [`docs/security/README.md`](../../docs/security/README.md)
- Use existing components from `src/shared/components/` and `src/features/*/`
- Validate inputs with Zod schemas
- Handle errors with `AppError` pattern
- Use React Query for data fetching

### Implementation Checklist
- [ ] Analyze existing similar features
- [ ] Reuse established patterns and components
- [ ] Implement proper TypeScript types
- [ ] Add authentication/authorization checks
- [ ] Validate all user inputs
- [ ] Handle errors consistently
- [ ] Test functionality thoroughly
- [ ] Update relevant documentation
```

## 📋 Repository Status Summary

**Current State**: Production-ready React application with comprehensive documentation

### ✅ Completed Architecture
- **Feature-Based Organization**: Modular `src/features/` structure
- **API v3 Integration**: Full compatibility with backend API
- **Type Safety**: Comprehensive TypeScript implementation
- **Security**: Auth0 integration with RBAC
- **Documentation**: Organized, comprehensive documentation structure
- **Performance**: React Query, code splitting, optimized builds

### 🎯 Development Standards
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Testing**: Vitest with React Testing Library setup
- **Security**: Authentication middleware, input validation, secure patterns
- **Performance**: Lazy loading, memoization, efficient data fetching
- **Maintainability**: Clear separation of concerns, reusable components

### 📖 Documentation Excellence
- **Complete Coverage**: All aspects documented in organized structure
- **Developer-Friendly**: Clear guidelines, examples, troubleshooting
- **Up-to-Date**: Reflects current codebase state and best practices
- **Searchable**: Well-organized with clear navigation and cross-references

**For any development task, start with [`DOCUMENTATION_INDEX.md`](../../DOCUMENTATION_INDEX.md) to understand the complete system.**

## 🐙 GitHub Issues Management

### Repository Context
- **Repository**: `dhirmadi/mwapclient`
- **GitHub API Base**: `https://api.github.com/repos/dhirmadi/mwapclient`
- **Authentication**: Uses `GITHUB_TOKEN` environment variable

### GitHub Issues CRUD Operations

#### CREATE - Create New Issue
```bash
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues \
  -d '{
    "title": "Issue title",
    "body": "Issue description with markdown support",
    "labels": ["bug", "enhancement", "documentation"],
    "assignees": ["username"],
    "milestone": 1
  }'
```

#### READ - Get Issues
```bash
# List all issues (open by default)
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues

# Get specific issue by number
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues/34

# Filter issues by state, labels, assignee
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?state=closed&labels=bug,enhancement&assignee=username"
```

#### UPDATE - Modify Existing Issue
```bash
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34 \
  -d '{
    "title": "Updated title",
    "body": "Updated description",
    "state": "open",
    "labels": ["updated-label"],
    "assignees": ["new-assignee"]
  }'
```

#### DELETE - Close/Lock Issue
```bash
# Close an issue
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34 \
  -d '{"state": "closed", "state_reason": "completed"}'

# Lock an issue (prevents further comments)
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34/lock \
  -d '{"lock_reason": "resolved"}'

# Reopen a closed issue
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34 \
  -d '{"state": "open"}'
```

### Advanced GitHub Operations

#### Comments Management
```bash
# Create comment
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34/comments \
  -d '{"body": "Comment with **markdown** support"}'

# List comments
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues/34/comments

# Update comment
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/comments/COMMENT_ID \
  -d '{"body": "Updated comment"}'
```

#### Labels Management
```bash
# Add labels to issue
curl -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34/labels \
  -d '["bug", "enhancement"]'

# Remove specific label
curl -X DELETE \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34/labels/bug

# Replace all labels
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/dhirmadi/mwapclient/issues/34/labels \
  -d '["new-label", "another-label"]'

# List repository labels
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/dhirmadi/mwapclient/labels
```

### Issue Management Workflows

#### Common Issue Lifecycle Patterns
1. **Bug Report Workflow**:
   - Create issue with `bug` label
   - Assign to developer
   - Update with investigation findings
   - Close when fixed with `state_reason: "completed"`

2. **Feature Request Workflow**:
   - Create issue with `enhancement` label
   - Add to milestone for planning
   - Update with implementation details
   - Close when feature is deployed

3. **Documentation Task**:
   - Create issue with `documentation` label
   - Assign to technical writer
   - Update with progress
   - Close when documentation is complete

#### Bulk Operations
```bash
# Get all open issues for bulk processing
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?state=open&per_page=100" \
     | jq '.[] | {number: .number, title: .title, labels: [.labels[].name]}'

# Close multiple issues (requires scripting)
for issue_number in 32 33 34; do
  curl -X PATCH \
    -H "Authorization: token $GITHUB_TOKEN" \
    https://api.github.com/repos/dhirmadi/mwapclient/issues/$issue_number \
    -d '{"state": "closed"}'
done
```

### GitHub API Best Practices

#### Rate Limiting
- **Authenticated requests**: 5,000 requests per hour
- **Check rate limit**: `curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit`
- **Headers to monitor**: `X-RateLimit-Remaining`, `X-RateLimit-Reset`

#### Error Handling
- **HTTP 404**: Issue not found or no access
- **HTTP 422**: Validation failed (invalid data)
- **HTTP 403**: Rate limit exceeded or insufficient permissions
- **Always check response status** before processing data

#### Security Considerations
- **Never log GITHUB_TOKEN** in scripts or outputs
- **Use minimal permissions** for tokens
- **Validate input data** before API calls
- **Handle sensitive information** in issue bodies carefully

### Common Query Patterns

#### Filter Examples
```bash
# Issues created in last 7 days
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?since=$(date -d '7 days ago' -Iseconds)"

# Issues with specific labels
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?labels=bug,critical"

# Issues assigned to specific user
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?assignee=dhirmadi"

# Closed issues
curl -H "Authorization: token $GITHUB_TOKEN" \
     "https://api.github.com/repos/dhirmadi/mwapclient/issues?state=closed"
```

#### Useful jq Filters
```bash
# Extract issue numbers and titles
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues \
     | jq '.[] | {number: .number, title: .title}'

# Count issues by label
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues \
     | jq '[.[] | .labels[].name] | group_by(.) | map({label: .[0], count: length})'

# Get issues updated in last 24 hours
curl -H "Authorization: token $GITHUB_TOKEN" \
     https://api.github.com/repos/dhirmadi/mwapclient/issues \
     | jq --arg date "$(date -d '1 day ago' -Iseconds)" \
     '.[] | select(.updated_at > $date) | {number: .number, title: .title, updated: .updated_at}'
```