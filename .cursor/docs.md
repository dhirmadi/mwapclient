# MWAP Client - Cursor Documentation Guide

## 📚 Complete Documentation Navigation

This guide provides comprehensive navigation through the MWAP Client documentation structure, helping Cursor AI understand the project's extensive documentation system.

## 🎯 Documentation Philosophy

The MWAP Client follows a **documentation-first approach** where:
- All architectural decisions are documented
- Development patterns are clearly defined
- API integration is thoroughly explained
- Security measures are well-documented
- Feature specifications are comprehensive
- Troubleshooting guides are available

## 📖 Primary Documentation Structure

### 1. Project Overview
**File**: [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md)
**Purpose**: Central hub for all documentation
**Contains**:
- Complete documentation structure overview
- Quick navigation to all sections
- Documentation philosophy and organization
- Essential reading order for new developers

### 2. Architecture & Solution Design
**Location**: [`docs/architecture/README.md`](../docs/architecture/README.md)
**Purpose**: System design and technical architecture
**Contains**:
- High-level system architecture
- Technical stack decisions and rationale
- Data flow and state management patterns
- Component architecture and relationships
- Performance and scalability considerations
- Deployment architecture and considerations

### 3. Developer Guidelines & Standards
**Location**: [`docs/development/README.md`](../docs/development/README.md)
**Purpose**: Comprehensive coding standards and conventions
**Contains**:
- TypeScript and React coding standards
- Component development patterns and best practices
- Testing guidelines and examples
- Performance optimization techniques
- Security implementation best practices
- Git workflow and code quality tools
- ESLint and Prettier configurations

### 4. API Integration Documentation
**Location**: [`docs/api/README.md`](../docs/api/README.md)
**Purpose**: Complete API integration guide
**Contains**:
- **CRITICAL**: Vite proxy configuration (DO NOT MODIFY)
- Complete API endpoint specifications
- Request/response examples and patterns
- Authentication integration with Auth0
- Error handling patterns and best practices
- Special cases and troubleshooting
- API versioning and migration guides

**Additional API Files**:
- [`docs/api/v3-openAPI-schema.md`](../docs/api/v3-openAPI-schema.md) - OpenAPI schema
- [`docs/api/cloud-providers.md`](../docs/api/cloud-providers.md) - Cloud provider APIs

### 5. Security & Authentication
**Location**: [`docs/security/README.md`](../docs/security/README.md)
**Purpose**: Security implementation and best practices
**Contains**:
- Auth0 integration and PKCE flow implementation
- Role-based access control (RBAC) patterns
- Security measures and protection strategies
- Authentication race condition prevention
- Token management and refresh strategies
- Security testing and validation approaches

### 6. Features Documentation
**Location**: [`docs/features/README.md`](../docs/features/README.md)
**Purpose**: Complete feature specifications and implementation
**Contains**:
- Detailed feature specifications for all modules
- User flows and technical implementation details
- Role-based feature access and permissions
- API endpoints and data models for each feature
- Feature status, roadmap, and migration notes
- Integration points between features

### 7. Components & UI Patterns
**Location**: [`docs/components/README.md`](../docs/components/README.md)
**Purpose**: UI component library and design patterns
**Contains**:
- Component architecture and organization
- Mantine UI integration patterns
- Reusable component specifications
- Design system and theming guidelines
- Accessibility implementation standards
- Component testing strategies

### 8. Changelog & Feature Status
**Location**: [`docs/changelog/README.md`](../docs/changelog/README.md)
**Purpose**: Project evolution and feature tracking
**Contains**:
- Feature development status and progress
- Migration history and breaking changes
- Release notes and version history
- Deprecated features and migration paths
- Future roadmap and planned improvements

## 🚀 Quick Reference Documentation

### Getting Started Guide
**File**: [`docs/getting-started.md`](../docs/getting-started.md)
**Purpose**: Initial setup and development guide
**Contains**:
- Environment setup instructions
- Development server configuration
- Initial project structure overview
- First-time developer onboarding

### Troubleshooting Guide
**File**: [`docs/troubleshooting.md`](../docs/troubleshooting.md)
**Purpose**: Common issues and solutions
**Contains**:
- Common development issues and fixes
- Build and deployment troubleshooting
- API integration problem resolution
- Authentication and authorization issues
- Performance problem diagnosis

### Contributing Guidelines
**File**: [`docs/contributing.md`](../docs/contributing.md)
**Purpose**: Guidelines for contributing to the project
**Contains**:
- Code contribution workflow
- Pull request guidelines and templates
- Code review standards and checklist
- Documentation contribution guidelines
- Community standards and expectations

## 🏗️ Feature-Specific Documentation

### Authentication Module
**Location**: `src/features/auth/`
**Documentation**: Covered in [`docs/security/README.md`](../docs/security/README.md)
**Key Concepts**:
- Auth0 PKCE flow implementation
- User role management and RBAC
- Protected route patterns
- Token refresh and management

### Tenant Management
**Location**: `src/features/tenants/`
**Documentation**: Covered in [`docs/features/README.md`](../docs/features/README.md)
**Key Concepts**:
- Multi-tenant architecture patterns
- Tenant-specific data isolation
- Tenant owner permissions and management
- Tenant-level analytics and reporting

### Project Management
**Location**: `src/features/projects/`
**Documentation**: Covered in [`docs/features/README.md`](../docs/features/README.md)
**Key Concepts**:
- Project lifecycle management
- Project type integration
- Cloud provider connections
- Project member role management

### Cloud Provider Integration
**Location**: `src/features/cloud-providers/`
**Documentation**: Covered in [`docs/api/cloud-providers.md`](../docs/api/cloud-providers.md)
**Key Concepts**:
- OAuth integration patterns
- Cloud storage API integration
- File browsing and management
- Provider-specific configurations

## 🔧 Technical Documentation

### TypeScript Configuration
**Files**: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
**Documentation**: Covered in [`docs/development/README.md`](../docs/development/README.md)
**Key Concepts**:
- Strict TypeScript configuration
- Path aliases and module resolution
- Build optimization settings
- Development vs production configurations

### Build Configuration
**Files**: `vite.config.ts`, `package.json`
**Documentation**: Covered in [`docs/api/README.md`](../docs/api/README.md) (proxy config)
**Key Concepts**:
- Vite build optimization
- Development server proxy configuration
- Environment variable handling
- Production build optimization

### Styling Configuration
**Files**: `tailwind.config.js`, `postcss.config.js`
**Documentation**: Covered in [`docs/components/README.md`](../docs/components/README.md)
**Key Concepts**:
- Tailwind CSS configuration
- Mantine UI theme integration
- Responsive design breakpoints
- CSS optimization strategies

## 📋 Documentation Usage Patterns

### For New Features
1. **Start**: [`docs/features/README.md`](../docs/features/README.md) - Understand existing patterns
2. **Architecture**: [`docs/architecture/README.md`](../docs/architecture/README.md) - Follow system design
3. **Development**: [`docs/development/README.md`](../docs/development/README.md) - Apply coding standards
4. **API**: [`docs/api/README.md`](../docs/api/README.md) - Implement API integration
5. **Security**: [`docs/security/README.md`](../docs/security/README.md) - Add security measures

### For Bug Fixes
1. **Troubleshooting**: [`docs/troubleshooting.md`](../docs/troubleshooting.md) - Check common issues
2. **Architecture**: [`docs/architecture/README.md`](../docs/architecture/README.md) - Understand system design
3. **Development**: [`docs/development/README.md`](../docs/development/README.md) - Follow debugging patterns
4. **API**: [`docs/api/README.md`](../docs/api/README.md) - Check API integration issues

### For Refactoring
1. **Architecture**: [`docs/architecture/README.md`](../docs/architecture/README.md) - Understand current design
2. **Development**: [`docs/development/README.md`](../docs/development/README.md) - Follow refactoring guidelines
3. **Components**: [`docs/components/README.md`](../docs/components/README.md) - Update component patterns
4. **Features**: [`docs/features/README.md`](../docs/features/README.md) - Maintain feature integrity

### For Performance Optimization
1. **Architecture**: [`docs/architecture/README.md`](../docs/architecture/README.md) - Performance architecture
2. **Development**: [`docs/development/README.md`](../docs/development/README.md) - Optimization techniques
3. **Components**: [`docs/components/README.md`](../docs/components/README.md) - Component optimization
4. **API**: [`docs/api/README.md`](../docs/api/README.md) - API optimization patterns

## 🎯 Documentation Quality Standards

### All Documentation Includes
- **Clear Purpose**: What the document covers
- **Practical Examples**: Code examples and implementations
- **Best Practices**: Recommended approaches and patterns
- **Common Pitfalls**: What to avoid and why
- **Cross-References**: Links to related documentation
- **Up-to-Date Information**: Reflects current codebase state

### Documentation Maintenance
- **Regular Updates**: Documentation stays current with code changes
- **Accuracy Verification**: All examples and patterns are tested
- **Comprehensive Coverage**: All features and patterns are documented
- **Clear Navigation**: Easy to find relevant information
- **Practical Focus**: Actionable information for developers

## 🔗 External Documentation References

### Framework Documentation
- **React**: https://react.dev/ - Latest React patterns and APIs
- **TypeScript**: https://www.typescriptlang.org/ - TypeScript language reference
- **Vite**: https://vitejs.dev/ - Build tool documentation
- **Mantine**: https://mantine.dev/ - UI component library

### Library Documentation
- **React Query**: https://tanstack.com/query/ - Server state management
- **Auth0 React**: https://auth0.com/docs/quickstart/spa/react - Authentication
- **React Router**: https://reactrouter.com/ - Client-side routing
- **Zod**: https://zod.dev/ - Schema validation
- **Tailwind CSS**: https://tailwindcss.com/ - Utility-first CSS

### Development Tools
- **ESLint**: https://eslint.org/ - Code linting
- **Prettier**: https://prettier.io/ - Code formatting
- **Vitest**: https://vitest.dev/ - Testing framework
- **Playwright**: https://playwright.dev/ - End-to-end testing

## 📚 Documentation Reading Strategy

### For Cursor AI
1. **Always Start**: [`DOCUMENTATION_INDEX.md`](../DOCUMENTATION_INDEX.md) for context
2. **Understand Architecture**: [`docs/architecture/README.md`](../docs/architecture/README.md) for system design
3. **Follow Standards**: [`docs/development/README.md`](../docs/development/README.md) for coding patterns
4. **Check API Patterns**: [`docs/api/README.md`](../docs/api/README.md) for integration
5. **Implement Security**: [`docs/security/README.md`](../docs/security/README.md) for auth patterns
6. **Reference Features**: [`docs/features/README.md`](../docs/features/README.md) for specifications

### For Developers
1. **Getting Started**: [`docs/getting-started.md`](../docs/getting-started.md) for setup
2. **Development Guide**: [`docs/development/README.md`](../docs/development/README.md) for standards
3. **Feature Specs**: [`docs/features/README.md`](../docs/features/README.md) for requirements
4. **Troubleshooting**: [`docs/troubleshooting.md`](../docs/troubleshooting.md) for issues
5. **Contributing**: [`docs/contributing.md`](../docs/contributing.md) for workflow

**Remember: The MWAP Client documentation is comprehensive, well-organized, and designed to support both AI assistants and human developers. Always reference the appropriate documentation sections to understand context, patterns, and requirements before making any changes or recommendations.**