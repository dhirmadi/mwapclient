# MWAP Client Repository Guide for OpenHands with Claude 3.7

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

The codebase is currently organized as follows:

```
/src
  /assets           # Static assets and images
  /components       # Reusable UI components
    /common         # Common UI components (buttons, forms, etc.)
    /layout         # Layout components (navbar, footer, etc.)
    /notifications  # Notification components
  /context          # React context providers (auth, etc.)
  /hooks            # Custom React hooks for data fetching and logic
  /pages            # Page components organized by feature
    /cloud-providers  # Cloud provider management pages
    /project-types    # Project type management pages
    /projects         # Project management pages
    /tenants          # Tenant management pages
  /router           # Routing configuration with protected routes
  /types            # TypeScript type definitions
  /utils            # Utility functions and API client
  App.tsx           # Main App component
  main.tsx          # Application entry point
```

However, the project is undergoing a refactoring to a feature-based architecture as outlined in the development guide.

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

## API Documentation

The application communicates with a RESTful API. The API documentation can be found in:

- `/docs/api/v3-openAPI-schema.md`: OpenAPI schema documentation
- `/docs/api/v3-openAPI.yaml`: OpenAPI specification file
- `/docs/api/cloud-providers.md`: Cloud provider API documentation

### Key API Endpoints

- `/api/tenants`: Tenant management
- `/api/projects`: Project management
- `/api/cloud-providers`: Cloud provider management
- `/api/project-types`: Project type management
- `/api/files`: File management

## Authentication Flow

1. User visits the application
2. If unauthenticated, redirected to login page
3. Auth0 handles authentication
4. Upon successful login, user roles are fetched
5. User is directed to appropriate dashboard based on role

## Development Challenges and Priorities

### Current Issues

1. **Inconsistent Data Fetching**: The application has issues with conditional data fetching based on user roles, particularly affecting SuperAdmin functionality
2. **Cloud Provider Integration**: Recent changes to cloud provider handling have caused issues with tenant management
3. **Component Redundancy**: Many components have similar patterns that could be abstracted
4. **Architecture Deviations**: The actual implementation deviates from the documented architecture

### Development Priorities

1. Refactor to a feature-based architecture
2. Standardize data fetching patterns
3. Implement proper role-based access control
4. Reduce redundancy in components
5. Optimize performance with code splitting and memoization

## Additional Documentation

- `/docs/architecture.md`: Overall architecture design
- `/docs/component-structure.md`: Component organization
- `/docs/rbac.md`: Role-based access control implementation
- `/docs/UserFlowSpecification.md`: User flow specifications
- `/docs/development-guide.md`: Comprehensive guide for harmonizing the codebase

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

1. Implement the feature-based architecture refactoring
2. Enhance cloud provider integration capabilities
3. Add advanced file management features
4. Implement real-time collaboration tools
5. Add analytics and reporting features

## Conclusion

The MWAP Client is a sophisticated React application with complex state management and role-based access control. By following the architecture recommendations in the development guide, the codebase can be harmonized to create a more maintainable, efficient, and consistent application that meets world-class standards for 2025 and beyond.