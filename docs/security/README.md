# Security & Authentication

## Overview

The MWAP Client implements comprehensive security measures including secure authentication, role-based access control (RBAC), and protection against common web vulnerabilities. This document covers all security aspects of the application.

## Authentication Architecture

### Auth0 Integration

The application uses Auth0 for authentication with the Authorization Code + PKCE flow, which is the recommended approach for single-page applications.

#### Configuration
```typescript
// src/core/context/AuthContext.tsx
const Auth0ProviderWithHistory: React.FC = ({ children }) => {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
        scope: 'openid profile email',
      }}
      useRefreshTokens={true}
      cacheLocation="memory"  // Secure token storage
    >
      {children}
    </Auth0Provider>
  );
};
```

#### Authentication Flow
1. **User Initiates Login**: User clicks login or accesses protected route
2. **Redirect to Auth0**: Application redirects to Auth0 Universal Login
3. **User Authentication**: User enters credentials or uses social login
4. **Authorization Code Generation**: Auth0 generates authorization code with PKCE
5. **Code Exchange**: Application exchanges code for tokens securely
6. **Token Storage**: Tokens stored in memory (not localStorage)
7. **Authenticated State**: Application updates authentication state
8. **Token Refresh**: Automatic refresh token handling
9. **Logout**: Secure session termination

### Token Management

#### Secure Token Storage
```typescript
// Tokens are stored in memory, never in localStorage
const Auth0Provider = (
  <Auth0Provider
    cacheLocation="memory"  // Critical for security
    useRefreshTokens={true}
  >
```

#### Token Refresh
```typescript
// Automatic token refresh
const getAccessToken = async (): Promise<string | null> => {
  try {
    return await getAccessTokenSilently({
      timeoutInSeconds: 60,
      cacheMode: 'off', // Always get fresh token
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Redirect to login if refresh fails
    loginWithRedirect();
    return null;
  }
};
```

#### API Authentication
```typescript
// src/shared/utils/api.ts
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessTokenSilently();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Role-Based Access Control (RBAC)

### User Roles

#### SuperAdmin
**Platform-level access with full system control:**
- Manage all tenants (view, create, edit, archive, unarchive)
- Manage all projects (view, archive, unarchive)
- Full CRUD operations for ProjectTypes
- Full CRUD operations for CloudProviders
- View system-wide analytics and metrics
- Access to debug information and error details

#### Tenant Owner
**Organization-level access within their tenant:**
- Manage their tenant (view, edit settings)
- Create and manage projects within their tenant
- Manage cloud provider integrations for their tenant
- Invite and manage project members
- View tenant-level analytics
- Cannot access other tenants' data

#### Project Member
**Project-level access with role-specific permissions:**

- **Project Owner**: Full control over specific project
  - Edit project details and settings
  - Manage project members and roles
  - Archive/unarchive project
  - Access all project files and resources

- **Project Deputy**: Limited management capabilities
  - Edit project details (not settings)
  - Manage project members (cannot change owners)
  - Access all project files and resources
  - Cannot archive project

- **Project Member**: Read-only access
  - View project details
  - Access project files and resources
  - Cannot edit project or manage members

### RBAC Implementation

#### Authentication Context
```typescript
// src/core/context/AuthContext.tsx
interface AuthContextType {
  // Authentication state
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;  // Critical for preventing race conditions
  user: User | null;
  
  // Role information
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  tenantId: string | null;
  projectRoles: Record<string, ProjectRole>;
  
  // Methods
  login: () => void;
  logout: () => void;
  hasProjectRole: (projectId: string, role: ProjectRole) => boolean;
}

export const AuthProvider: React.FC = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTenantOwner, setIsTenantOwner] = useState(false);
  const [projectRoles, setProjectRoles] = useState<Record<string, ProjectRole>>({});
  
  // Fetch user roles after authentication
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await api.get('/users/me/roles');
          const { isSuperAdmin, isTenantOwner, projectRoles } = response;
          
          setIsSuperAdmin(isSuperAdmin);
          setIsTenantOwner(isTenantOwner);
          setProjectRoles(projectRoles);
          setIsReady(true);
        } catch (error) {
          console.error('Failed to fetch user roles:', error);
          setIsReady(true); // Still set ready to prevent infinite loading
        }
      } else if (!isLoading) {
        setIsReady(true);
      }
    };
    
    fetchUserRoles();
  }, [isAuthenticated, user, isLoading]);
  
  const hasProjectRole = useCallback((projectId: string, role: ProjectRole): boolean => {
    const userRole = projectRoles[projectId];
    if (!userRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    const roleHierarchy = {
      OWNER: ['OWNER', 'DEPUTY', 'MEMBER'],
      DEPUTY: ['DEPUTY', 'MEMBER'],
      MEMBER: ['MEMBER'],
    };
    
    return roleHierarchy[userRole]?.includes(role) || false;
  }, [projectRoles]);
  
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      isReady,
      user,
      isSuperAdmin,
      isTenantOwner,
      tenantId,
      projectRoles,
      login: loginWithRedirect,
      logout: () => auth0Logout({ logoutParams: { returnTo: window.location.origin } }),
      hasProjectRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

#### Authentication Race Condition Prevention
**Critical Pattern**: Always check `isReady` before role-based rendering:

```typescript
const MyComponent: React.FC = () => {
  const { isReady, isSuperAdmin, isTenantOwner } = useAuth();
  
  // Wait for authentication to be fully ready
  if (!isReady) {
    return <LoadingSpinner message="Loading user permissions..." />;
  }
  
  return (
    <div>
      {/* Safe to check roles after isReady is true */}
      {isReady && isSuperAdmin && <SuperAdminPanel />}
      {isReady && isTenantOwner && <TenantOwnerPanel />}
    </div>
  );
};
```

#### Protected Routes
```typescript
// src/core/router/ProtectedRoute.tsx
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

// Role-based route protection
export const RoleRoute: React.FC<{
  requiredRoles: UserRole[];
  projectId?: string;
}> = ({ requiredRoles, projectId }) => {
  const { 
    isReady,
    isLoading, 
    isSuperAdmin, 
    isTenantOwner, 
    hasProjectRole 
  } = useAuth();
  
  if (isLoading || !isReady) {
    return <LoadingSpinner />;
  }
  
  const hasRequiredRole = requiredRoles.some(role => {
    switch (role) {
      case 'superAdmin':
        return isSuperAdmin;
      case 'tenantOwner':
        return isTenantOwner;
      case 'projectOwner':
        return projectId ? hasProjectRole(projectId, 'OWNER') : false;
      case 'projectDeputy':
        return projectId ? hasProjectRole(projectId, 'DEPUTY') : false;
      case 'projectMember':
        return projectId ? hasProjectRole(projectId, 'MEMBER') : false;
      default:
        return false;
    }
  });
  
  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }
  
  return <Outlet />;
};
```

#### Permission Hooks
```typescript
// src/shared/hooks/usePermissions.ts
export const usePermissions = () => {
  const { isSuperAdmin, isTenantOwner, hasProjectRole, tenantId } = useAuth();
  
  return {
    // Tenant permissions
    canManageTenants: isSuperAdmin,
    canViewTenant: (targetTenantId: string) => 
      isSuperAdmin || (isTenantOwner && tenantId === targetTenantId),
    canEditTenant: (targetTenantId: string) => 
      isSuperAdmin || (isTenantOwner && tenantId === targetTenantId),
    
    // Project permissions
    canCreateProject: isSuperAdmin || isTenantOwner,
    canViewProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'MEMBER'),
    canEditProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'DEPUTY'),
    canManageProject: (projectId: string) => 
      isSuperAdmin || hasProjectRole(projectId, 'OWNER'),
    
    // System permissions
    canManageCloudProviders: isSuperAdmin,
    canManageProjectTypes: isSuperAdmin,
    canViewSystemAnalytics: isSuperAdmin,
  };
};

// Usage in components
const ProjectActions: React.FC<{ project: Project }> = ({ project }) => {
  const { canEditProject, canManageProject } = usePermissions();
  
  return (
    <div>
      <Button>View Details</Button>
      {canEditProject(project.id) && (
        <Button>Edit Project</Button>
      )}
      {canManageProject(project.id) && (
        <Button>Manage Members</Button>
      )}
    </div>
  );
};
```

## Security Measures

### Cross-Site Request Forgery (CSRF) Protection

#### Auth0 CSRF Protection
- **State Parameter**: Auth0 automatically includes state parameter in OAuth flow
- **PKCE**: Proof Key for Code Exchange prevents authorization code interception
- **Origin Validation**: Backend validates request origins

#### API CSRF Protection
```typescript
// JWT tokens provide CSRF protection
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessTokenSilently();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    // JWT in Authorization header prevents CSRF
  }
  return config;
});
```

### Cross-Site Scripting (XSS) Protection

#### React Built-in Protection
```typescript
// React automatically escapes content
const UserProfile: React.FC<{ user: User }> = ({ user }) => (
  <div>
    {/* Automatically escaped - safe */}
    <h1>{user.name}</h1>
    <p>{user.bio}</p>
    
    {/* Dangerous - avoid unless absolutely necessary */}
    <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />
  </div>
);
```

#### Content Security Policy (CSP)
```html
<!-- index.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://cdn.auth0.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://mwapss.shibari.photo https://*.auth0.com;
  font-src 'self' https://fonts.gstatic.com;
">
```

#### Input Validation
```typescript
// Zod schemas for all user inputs
import { z } from 'zod';

const userSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-zA-Z0-9\s-_]+$/),
  email: z.string().email().max(255),
  bio: z.string().max(500).optional(),
});

// Validate all form inputs
const validateUserInput = (data: unknown) => {
  try {
    return userSchema.parse(data);
  } catch (error) {
    throw new Error('Invalid input data');
  }
};
```

### Secure Communication

#### HTTPS Enforcement
```typescript
// All API communication over HTTPS
const apiClient = axios.create({
  baseURL: '/api',
  // Vite proxy forwards to HTTPS backend
});

// Redirect HTTP to HTTPS in production
if (import.meta.env.PROD && location.protocol !== 'https:') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

#### Secure Headers
```typescript
// API client security headers
apiClient.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
apiClient.defaults.headers.common['Cache-Control'] = 'no-cache';
```

### Data Protection

#### Sensitive Data Handling
```typescript
// Never log sensitive data
const logUserAction = (action: string, userId: string) => {
  console.log(`User action: ${action}`, { 
    userId: userId.substring(0, 8) + '...', // Partial ID only
    timestamp: new Date().toISOString(),
  });
  // Never log: passwords, tokens, full user data
};

// Secure error messages
const handleAPIError = (error: unknown, isSuperAdmin: boolean) => {
  const message = isSuperAdmin 
    ? error.message // Full error for admins
    : 'An error occurred. Please try again.'; // Generic for users
  
  return message;
};
```

#### Local Storage Security
```typescript
// Never store sensitive data in localStorage
// ❌ NEVER DO THIS
localStorage.setItem('token', accessToken);
localStorage.setItem('user', JSON.stringify(user));

// ✅ Use secure alternatives
// - Auth0 memory cache for tokens
// - React state for temporary data
// - Encrypted cookies for persistent preferences (if needed)
```

### Environment Security

#### Environment Variables
```env
# .env.local - Never commit to version control
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-api-audience

# Production environment variables should be set in deployment environment
```

#### Build Security
```typescript
// vite.config.ts - Production security
export default defineConfig({
  build: {
    sourcemap: false, // Don't expose source maps in production
    minify: true,     // Minify code
  },
  define: {
    // Remove debug code in production
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
```

## Security Testing

### Authentication Testing
```typescript
// Test authentication flows
describe('Authentication', () => {
  it('redirects unauthenticated users to login', () => {
    render(<ProtectedRoute />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
  
  it('allows authenticated users to access protected routes', async () => {
    const mockUser = { sub: 'user123', email: 'test@example.com' };
    render(<ProtectedRoute />, { 
      wrapper: createAuthWrapper({ user: mockUser, isAuthenticated: true })
    });
    
    await waitFor(() => {
      expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
    });
  });
});
```

### RBAC Testing
```typescript
// Test role-based access
describe('Role-Based Access Control', () => {
  it('shows admin panel only to super admins', async () => {
    const { rerender } = render(<Dashboard />, {
      wrapper: createAuthWrapper({ isSuperAdmin: false })
    });
    
    expect(screen.queryByText(/admin panel/i)).not.toBeInTheDocument();
    
    rerender(<Dashboard />, {
      wrapper: createAuthWrapper({ isSuperAdmin: true })
    });
    
    await waitFor(() => {
      expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
    });
  });
});
```

### Input Validation Testing
```typescript
// Test input validation
describe('Input Validation', () => {
  it('rejects invalid email addresses', async () => {
    render(<UserForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'invalid-email' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    
    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
  });
  
  it('sanitizes user input', async () => {
    render(<UserForm />);
    
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: '<script>alert("xss")</script>' }
    });
    
    // Should be escaped/sanitized
    expect(screen.getByDisplayValue(/&lt;script&gt;/)).toBeInTheDocument();
  });
});
```

## Security Monitoring

### Error Logging
```typescript
// Secure error logging
const logSecurityEvent = (event: string, details: object) => {
  const sanitizedDetails = {
    ...details,
    // Remove sensitive data
    password: undefined,
    token: undefined,
    // Truncate long values
    userId: details.userId?.substring(0, 8) + '...',
  };
  
  console.error(`Security Event: ${event}`, sanitizedDetails);
  
  // Send to monitoring service in production
  if (import.meta.env.PROD) {
    // sendToMonitoringService(event, sanitizedDetails);
  }
};

// Usage
const handleAuthFailure = (error: Error) => {
  logSecurityEvent('AUTH_FAILURE', {
    error: error.message,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
  });
};
```

### Performance Monitoring
```typescript
// Monitor for potential security issues
const monitorAPIPerformance = () => {
  apiClient.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata?.startTime;
      
      // Log slow requests (potential DoS)
      if (duration > 5000) {
        logSecurityEvent('SLOW_API_REQUEST', {
          endpoint: response.config.url,
          duration,
          status: response.status,
        });
      }
      
      return response;
    },
    (error) => {
      // Log failed requests
      logSecurityEvent('API_REQUEST_FAILED', {
        endpoint: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      
      return Promise.reject(error);
    }
  );
};
```

## Security Checklist

### Development
- [ ] All user inputs validated with Zod schemas
- [ ] No sensitive data in localStorage
- [ ] HTTPS enforced in production
- [ ] CSP headers configured
- [ ] Error messages don't expose sensitive information
- [ ] Authentication race conditions prevented with `isReady` state

### Deployment
- [ ] Environment variables secured
- [ ] Source maps disabled in production
- [ ] Debug code removed from production builds
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Monitoring and logging configured

### Testing
- [ ] Authentication flows tested
- [ ] RBAC permissions tested
- [ ] Input validation tested
- [ ] XSS prevention tested
- [ ] Error handling tested

---

**References**:
- Source: `src/core/context/AuthContext.tsx` authentication implementation
- Source: `docs/authentication.md` original authentication documentation
- Source: `docs/rbac.md` role-based access control documentation
- Source: `docs/troubleshooting-authentication.md` authentication troubleshooting
- Source: Auth0 documentation and security best practices