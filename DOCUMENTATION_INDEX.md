# MWAP Client Documentation Index

**Last Updated:** 2025-10-04  
**Version:** 2.0

This document serves as the central index for all MWAP Client documentation. Use this as your starting point to navigate the complete documentation suite.

## 📚 Quick Navigation

### For New Developers
1. **[Getting Started Guide](./docs/01-Getting-Started/getting-started.md)** - Setup, installation, and first steps
2. **[Architecture Overview](./docs/02-Architecture/README.md)** - System design and technical stack
3. **[Development Guidelines](./docs/06-Guidelines/development-guide.md)** - Coding standards and best practices

### For Feature Development
1. **[Features Documentation](./docs/03-Frontend/README.md)** - Complete feature descriptions and implementation
2. **[Component Guidelines](./docs/06-Guidelines/components.md)** - Component structure and patterns
3. **[API Integration](./docs/04-Backend/README.md)** - Backend API documentation

### For Security & Auth
1. **[Security Overview](./docs/05-Security/README.md)** - Authentication and authorization
2. **[OAuth/PKCE Guide](./docs/04-Backend/oauth-frontend-complete-guide.md)** - Complete OAuth implementation
3. **[RBAC Documentation](./docs/05-Security/rbac.md)** - Role-based access control

### For Troubleshooting
1. **[Troubleshooting Guide](./docs/06-Guidelines/troubleshooting.md)** - Common issues and solutions
2. **[Authentication Issues](./docs/05-Security/troubleshooting-authentication.md)** - Auth-specific debugging
3. **[Project Status](./docs/09-Reports-and-History/project-status.md)** - Current status and known issues

## 📋 Complete Documentation Structure

### 01-Getting-Started
- **[getting-started.md](./docs/01-Getting-Started/getting-started.md)** - Installation, setup, and first run

### 02-Architecture
- **[README.md](./docs/02-Architecture/README.md)** - Architecture overview and patterns
- **[architecture.md](./docs/02-Architecture/architecture.md)** - Detailed architecture documentation
- **[frontend.md](./docs/02-Architecture/frontend.md)** - Frontend-specific architecture
- **[component-structure.md](./docs/02-Architecture/component-structure.md)** - Component organization
- **[UserFlowSpecification.md](./docs/02-Architecture/UserFlowSpecification.md)** - Complete user flow documentation
- **[v3-domainmap.md](./docs/02-Architecture/v3-domainmap.md)** - Domain model mapping

### 03-Frontend
- **[README.md](./docs/03-Frontend/README.md)** - Frontend features overview
- **[integration-management.md](./docs/03-Frontend/integration-management.md)** - Cloud provider integration feature

### 04-Backend
- **[README.md](./docs/04-Backend/README.md)** - Backend API overview
- **[api-reference.md](./docs/04-Backend/api-reference.md)** - Complete API endpoint documentation
- **[api-quickreference.md](./docs/04-Backend/api-quickreference.md)** - Quick API reference
- **[oauth-frontend-complete-guide.md](./docs/04-Backend/oauth-frontend-complete-guide.md)** - Complete OAuth implementation guide
- **[oauth-integration-guide.md](./docs/04-Backend/oauth-integration-guide.md)** - OAuth integration mechanics
- **[oauth-security.md](./docs/04-Backend/oauth-security.md)** - OAuth security best practices
- **[pkce-implementation-guide.md](./docs/04-Backend/pkce-implementation-guide.md)** - PKCE implementation details
- **[public-route-security-model.md](./docs/04-Backend/public-route-security-model.md)** - Public route security

### 05-Security
- **[README.md](./docs/05-Security/README.md)** - Security overview
- **[authentication.md](./docs/05-Security/authentication.md)** - Authentication implementation
- **[rbac.md](./docs/05-Security/rbac.md)** - Role-based access control
- **[troubleshooting-authentication.md](./docs/05-Security/troubleshooting-authentication.md)** - Auth troubleshooting

### 06-Guidelines
- **[development-guide.md](./docs/06-Guidelines/development-guide.md)** - Development standards and patterns
- **[components.md](./docs/06-Guidelines/components.md)** - Component guidelines
- **[troubleshooting.md](./docs/06-Guidelines/troubleshooting.md)** - General troubleshooting

### 08-Contribution
- **[contributing.md](./docs/08-Contribution/contributing.md)** - Contribution guidelines

### 09-Reports-and-History
- **[project-status.md](./docs/09-Reports-and-History/project-status.md)** - Current status and roadmap

## 🎯 Documentation by Role

### SuperAdmin
**Key Documents:**
1. [Getting Started](./docs/01-Getting-Started/getting-started.md)
2. [Architecture Overview](./docs/02-Architecture/README.md)
3. [Security Overview](./docs/05-Security/README.md)
4. [Project Status](./docs/09-Reports-and-History/project-status.md)

**Relevant Features:**
- Cloud Provider Management (SuperAdmin only)
- Project Type Management (SuperAdmin only)
- Tenant Management (view all tenants)
- System Administration

### Tenant Owner
**Key Documents:**
1. [Getting Started](./docs/01-Getting-Started/getting-started.md)
2. [Integration Management](./docs/03-Frontend/integration-management.md)
3. [OAuth Complete Guide](./docs/04-Backend/oauth-frontend-complete-guide.md)
4. [Troubleshooting](./docs/06-Guidelines/troubleshooting.md)

**Relevant Features:**
- Tenant Settings Management
- Cloud Provider Integration (OAuth/PKCE)
- Project Creation and Management
- Member Management

### Project Member/Developer
**Key Documents:**
1. [Getting Started](./docs/01-Getting-Started/getting-started.md)
2. [Development Guidelines](./docs/06-Guidelines/development-guide.md)
3. [Component Guidelines](./docs/06-Guidelines/components.md)
4. [API Reference](./docs/04-Backend/api-reference.md)
5. [Troubleshooting](./docs/06-Guidelines/troubleshooting.md)

**Relevant Features:**
- Project Access (based on role)
- File Management
- Resource Viewing

## 🔍 Quick Reference Guides

### API Endpoints
See **[API Quick Reference](./docs/04-Backend/api-quickreference.md)**

Key endpoints:
- `GET /api/v1/users/me/roles` - Get user roles
- `GET /api/v1/tenants/me` - Get current tenant
- `GET /api/v1/projects` - List projects
- `POST /api/v1/oauth/tenants/{tenantId}/integrations/{integrationId}/initiate` - Start OAuth flow

### Authentication Flow
```
1. User logs in via Auth0 → JWT token obtained
2. Frontend fetches roles: GET /api/v1/users/me/roles
3. Roles cached and used for RBAC
4. Protected routes check roles before rendering
```

See **[Authentication Documentation](./docs/05-Security/authentication.md)** for details.

### OAuth/PKCE Flow
```
1. Generate PKCE challenge/verifier
2. Create integration with PKCE metadata
3. Initiate OAuth flow → Get authorization URL
4. Open popup with authorization URL
5. User authorizes
6. Backend processes callback
7. Frontend receives success/error via postMessage
```

See **[OAuth Complete Guide](./docs/04-Backend/oauth-frontend-complete-guide.md)** for full implementation.

### Component Structure
```
/src/features/{feature-name}
  /components     # Feature-specific UI components
  /hooks          # Custom hooks for data fetching and logic
  /pages          # Page components
  /types          # TypeScript types
  /utils          # Feature-specific utilities
  index.ts        # Public API exports
```

See **[Component Guidelines](./docs/06-Guidelines/components.md)** for details.

## 🐛 Common Issues

### Authentication Issues
- **Problem**: Roles not loading
- **Solution**: Check browser console for API errors, verify Auth0 token
- **Doc**: [Authentication Troubleshooting](./docs/05-Security/troubleshooting-authentication.md)

### OAuth Integration Issues
- **Problem**: OAuth popup not closing
- **Solution**: Check postMessage listener and callback URL configuration
- **Doc**: [OAuth Complete Guide](./docs/04-Backend/oauth-frontend-complete-guide.md)

### API Response Issues
- **Problem**: Unexpected response format
- **Solution**: Use `handleApiResponse` utility for consistent transformation
- **Doc**: [API Reference](./docs/04-Backend/api-reference.md)

## 📊 Current Project Status

**Completion:** ~80%  
**Status:** Late Alpha - Ready for optimization and testing  
**Next Steps:** See [Project Status](./docs/09-Reports-and-History/project-status.md)

**Critical Tasks:**
1. Optimize role caching (high priority)
2. Implement code splitting (high priority)
3. Add comprehensive testing (high priority)
4. Complete file management UI (medium priority)

## 🔗 External Resources

- **Auth0 Documentation**: https://auth0.com/docs
- **React Query Documentation**: https://tanstack.com/query/latest
- **Mantine UI Documentation**: https://mantine.dev/
- **Vite Documentation**: https://vitejs.dev/
- **TypeScript Documentation**: https://www.typescriptlang.org/docs/

## 📝 Documentation Conventions

### File Naming
- Use kebab-case for file names: `getting-started.md`
- Use descriptive names that indicate content
- Group related docs in numbered folders (nn-FolderName)

### Content Structure
- Start with overview/purpose
- Include table of contents for long documents
- Use code examples liberally
- Link to related documentation
- Include troubleshooting sections

### Markdown Style
- Use `#` for main title (only one per document)
- Use `##` for major sections
- Use `###` for subsections
- Use code blocks with language specification
- Use tables for structured data

## 🚀 Contributing to Documentation

See **[Contributing Guidelines](./docs/08-Contribution/contributing.md)** for how to contribute to documentation.

**Quick tips:**
- Keep documentation in sync with code
- Update this index when adding new docs
- Test all code examples before committing
- Use consistent formatting and style
- Include "Last Updated" dates

---

**Maintained by:** MWAP Development Team  
**Questions?** Check [Troubleshooting](./docs/06-Guidelines/troubleshooting.md) or create an issue

