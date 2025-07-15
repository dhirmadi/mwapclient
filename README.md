# MWAP Client

The Modular Web Application Platform (MWAP) Client is a comprehensive frontend application designed to provide a secure, role-based interface for managing cloud-based projects, tenants, and resources. This React-based application serves as the user interface for the MWAP ecosystem, enabling organizations to efficiently manage their cloud resources and project workflows.

## 🌟 Overview

MWAP Client is built to support multi-tenant organizations with complex project management needs. It provides a secure, role-based interface that adapts to different user types:

- **Super Administrators**: Manage the entire platform, including tenants, cloud providers, and project types
- **Tenant Owners**: Manage their organization's projects, cloud integrations, and team members
- **Project Members**: Access and work with project resources based on their assigned roles

## 🔑 Key Features

### Authentication & Authorization
- **Secure Authentication**: Integration with Auth0 using Authorization Code + PKCE flow
- **Role-Based Access Control (RBAC)**: Dynamic UI and permissions based on user roles
- **Multi-level Authorization**: System-wide, tenant-level, and project-level permission enforcement

### Tenant Management
- **Tenant Creation & Configuration**: For new organizations joining the platform
- **Tenant Settings**: Customize organization settings and preferences
- **Cloud Provider Integrations**: Connect to various cloud storage providers

### Project Management
- **Project Creation & Configuration**: Set up new projects with specific types and cloud integrations
- **Team Management**: Add and manage project members with different roles (Owner, Deputy, Member)
- **Project Settings**: Configure project-specific settings and parameters

### Resource Management
- **File Explorer**: Browse, view, and manage files stored in connected cloud providers
- **Virtual File System**: Access files across different cloud providers through a unified interface
- **Metadata Management**: View and manage file metadata and properties

### Administration
- **Cloud Provider Management**: Configure and manage supported cloud storage providers
- **Project Type Management**: Define and customize different project templates
- **System Monitoring**: Monitor platform usage and performance (future feature)

## 🛠️ Tech Stack

### Frontend Framework
- **React 18+**: Modern component-based UI library
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Vite**: Fast, modern build tool and development server

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Mantine UI**: Component library with accessible, customizable elements
- **Responsive Design**: Mobile-friendly interface that works across devices

### State Management & Data Fetching
- **React Context API**: For global state management
- **TanStack Query (React Query)**: For efficient API data fetching, caching, and state management
- **Zod**: Runtime type validation for API responses and form data

### Routing & Navigation
- **React Router v6**: Client-side routing with protected routes
- **Role-based Navigation**: Dynamic navigation based on user permissions

### Authentication
- **Auth0 SDK**: Secure, standards-based authentication
- **JWT Handling**: Secure token management and validation

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/dhirmadi/mwapclient.git
cd mwapclient
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Update the `.env` file with your Auth0 credentials and API URL.

### ⚠️ Critical API Configuration

**DO NOT MODIFY** the following configurations - they are correctly set up:

- **API Base URL:** `/api` (in `src/shared/utils/api.ts`)
- **Vite Proxy:** Current setup in `vite.config.ts` is correct
- **Backend Target:** `https://mwapss.shibari.photo/api/v1`

The Vite proxy automatically handles routing from `/api/*` to the backend server. See `docs/API_CONFIGURATION.md` for detailed information.

### Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

## 📂 Project Structure

```
src/
  ├── assets/           # Static assets and images
  ├── components/       # Reusable UI components
  │   ├── common/       # Common UI components (buttons, forms, etc.)
  │   └── layout/       # Layout components (navbar, footer, etc.)
  ├── context/          # React context providers (auth, etc.)
  ├── hooks/            # Custom React hooks for data fetching and logic
  ├── pages/            # Page components organized by feature
  │   ├── cloud-providers/  # Cloud provider management pages
  │   ├── project-types/    # Project type management pages
  │   ├── projects/         # Project management pages
  │   └── tenants/          # Tenant management pages
  ├── router/           # Routing configuration with protected routes
  ├── types/            # TypeScript type definitions
  ├── utils/            # Utility functions and API client
  ├── App.tsx           # Main App component
  └── main.tsx          # Application entry point
```

## 🔄 User Flows

### Authentication Flow
1. User visits the application
2. If unauthenticated, redirected to login page
3. Auth0 handles authentication
4. Upon successful login, user roles are fetched
5. User is directed to appropriate dashboard based on role

### Role-Based Experiences
- **Super Admin**: Access to tenant management, cloud provider configuration, and project type management
- **Tenant Owner**: Access to tenant settings, cloud integrations, and project management
- **Project Member**: Access to assigned projects and their resources

### Project Management Flow
1. Tenant owner creates a new project
2. Selects project type and cloud integration
3. Assigns initial project members and roles
4. Project is created and available to assigned members
5. Members can access project resources based on their roles

## 📚 Documentation

Comprehensive documentation is available in the `docs/` directory, organized for developers, architects, and testers:

### 🎯 Core Documentation
- **[Architecture & Solution Design](./docs/architecture/README.md)** - System architecture, design patterns, and technical decisions
- **[Developer Guidelines](./docs/development/README.md)** - Coding standards, conventions, and best practices
- **[API Integration](./docs/api/README.md)** - Complete API documentation including critical Vite configuration
- **[Security & Authentication](./docs/security/README.md)** - Authentication flows, security measures, and RBAC
- **[Features](./docs/features/README.md)** - Detailed description of each application feature
- **[Components & UI Patterns](./docs/components/README.md)** - Component structure, UI patterns, and file organization
- **[Changelog & Status](./docs/changelog/README.md)** - Feature status, migration history, and release notes

### 🚀 Quick Reference
- **[Getting Started](./docs/getting-started.md)** - Setup and initial development guide
- **[Troubleshooting](./docs/troubleshooting.md)** - Common issues and solutions
- **[Contributing](./docs/contributing.md)** - Guidelines for contributing to the project

### 📋 Complete Documentation Index
See **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** for a complete overview of the consolidated documentation structure.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
