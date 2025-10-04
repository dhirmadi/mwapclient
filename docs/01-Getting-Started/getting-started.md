# Getting Started

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

## Quick Setup

### 1. Clone the Repository
```bash
git clone https://github.com/dhirmadi/mwapclient.git
cd mwapclient
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-auth0-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=your-api-audience

# API Configuration (DO NOT CHANGE)
VITE_API_BASE_URL=/api
```

### 4. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## Development Workflow

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Project Structure Overview
```
src/
├── features/          # Feature-based modules
├── shared/           # Shared components and utilities
├── core/             # Core application functionality
├── pages/            # Top-level pages
└── assets/           # Static assets
```

## Key Concepts

### Authentication
- Uses Auth0 with PKCE flow
- Role-based access control (SuperAdmin, Tenant Owner, Project Member)
- Always check `isReady` state before role-based rendering

### API Integration
- All API calls go through `/api` (proxied by Vite)
- Uses React Query for data fetching and caching
- Responses are wrapped in `{success: true, data: {...}}` format

### Component Architecture
- Follows atomic design principles
- Feature-based organization
- TypeScript strict mode throughout

## Next Steps

1. **Read the Architecture Guide**: [Architecture & Solution Design](./architecture/README.md)
2. **Review Developer Guidelines**: [Developer Guidelines](./development/README.md)
3. **Understand Security**: [Security & Authentication](./security/README.md)
4. **Explore Features**: [Features Documentation](./features/README.md)

## Common Issues

### API Configuration
- **DO NOT** modify the Vite proxy configuration in `vite.config.ts`
- **DO NOT** change the API base URL from `/api`
- See [API Configuration](./api/README.md) for details

### Authentication Issues
- Ensure Auth0 environment variables are correctly set
- Check that redirect URIs are configured in Auth0 dashboard
- See [Troubleshooting](./troubleshooting.md) for common auth issues

### Development Server Issues
- Clear node_modules and reinstall if experiencing dependency issues
- Ensure you're using the correct Node.js version
- Check that all environment variables are properly set

## Support

For questions or issues:
1. Check the [Troubleshooting Guide](./troubleshooting.md)
2. Review the relevant documentation sections
3. Check existing GitHub issues
4. Create a new issue with detailed information

---

**Happy coding!** 🚀