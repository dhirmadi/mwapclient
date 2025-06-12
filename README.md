# MWAP Frontend Client

## 🎯 Overview

The MWAP (Modular Web Application Platform) Frontend Client is a modern React application that provides a user-friendly interface to interact with the MWAP backend API. It enables users to manage tenants, projects, cloud provider integrations, and more based on their role in the system.

## 🚀 Features

- **Role-Based Access Control**: Different UIs and capabilities for SuperAdmins, Tenant Owners, and Project Members
- **Tenant Management**: Create and manage tenant workspaces
- **Project Management**: Create, configure, and manage projects within tenants
- **Cloud Provider Integration**: Connect to cloud storage providers like Google Drive, Dropbox, etc.
- **File Management**: Browse and interact with files from connected cloud providers
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## 🛠️ Technology Stack

- **Framework**: React 18+ with TypeScript
- **State Management**: React Query for server state, Context API for client state
- **Styling**: Tailwind CSS with Mantine component library
- **Authentication**: Auth0 React SDK with PKCE flow
- **API Integration**: Axios with React Query
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6+
- **Testing**: Vitest with React Testing Library

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MWAP Backend API running
- Auth0 account and configuration

## 🔧 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mwapclient.git
   cd mwapclient
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_AUTH0_DOMAIN=your-auth0-domain
   VITE_AUTH0_CLIENT_ID=your-auth0-client-id
   VITE_AUTH0_AUDIENCE=your-auth0-audience
   VITE_API_URL=http://localhost:3000
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

```
src/
  features/            # Feature-based modules
    auth/              # Authentication components and hooks
    tenants/           # Tenant management
    projects/          # Project management
    cloud-providers/   # Cloud provider integration
    project-types/     # Project type configuration
    files/             # File management
  components/          # Shared UI components
    common/            # Basic UI elements
    layout/            # Layout components
  hooks/               # Custom hooks
  context/             # React Context providers
  utils/               # Utility functions
  types/               # TypeScript type definitions
  pages/               # Page components
  routes/              # Route definitions
  styles/              # Global styles
  assets/              # Static assets
```

## 👥 User Roles

The application supports three primary user roles:

1. **SuperAdmin**: Platform-level access to manage all aspects of the system
2. **Tenant Owner**: Full control over their tenant and associated projects
3. **Project Member**: Limited access based on their role within a project (Owner, Deputy, or Member)

## 📚 Documentation

For more detailed documentation, please refer to the `docs` directory:

- [Architecture](docs/architecture.md): Frontend architecture and design patterns
- [Component Structure](docs/component-structure.md): Overview of the component structure
- [API Integration](docs/architecture/api-integration.md): How the frontend integrates with the backend API
- [Authentication](docs/authentication.md): Authentication flow and security considerations
- [Role-Based Access Control](docs/rbac.md): Implementation of role-based access control

## 🧪 Running Tests

```bash
npm run test
```

## 🔨 Building for Production

```bash
npm run build
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.