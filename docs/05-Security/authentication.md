# MWAP Frontend Authentication

**Last Updated:** 2025-10-04  
**Status:** ✅ Optimized with React Query Caching  
**Version:** 2.0 (Sprint 1 & 2 Updates)

> ⚡ **Performance Update (Sprint 1)**: Authentication now includes optimized role caching with React Query and localStorage, reducing API calls by ~95%. See [Current Implementation](#current-optimized-implementation) below.

This document outlines the authentication flow and security considerations for the MWAP frontend application.

## Authentication Flow

The MWAP frontend uses Auth0 for authentication, following the Authorization Code flow with PKCE (Proof Key for Code Exchange) for enhanced security. This flow is recommended for single-page applications (SPAs) and provides a secure way to authenticate users without exposing sensitive credentials.

### Authentication Process

1. **User Initiates Login**: User clicks the login button or attempts to access a protected route
2. **Redirect to Auth0**: The application redirects to Auth0's Universal Login page
3. **User Authentication**: User enters credentials or uses social login
4. **Authorization Code Generation**: Auth0 generates an authorization code
5. **Code Exchange**: The application exchanges the code for tokens using PKCE
6. **Token Storage**: Tokens are securely stored in memory (not localStorage)
7. **Authenticated State**: The application updates its state to reflect the authenticated user
8. **Token Refresh**: Refresh tokens are used to obtain new access tokens when needed
9. **Logout**: User session is terminated and tokens are cleared

### Auth0 Configuration

The Auth0 SDK is configured as follows:

```tsx
// src/auth/auth0-config.ts
import { Auth0Provider } from '@auth0/auth0-react';
import React from 'react';

export const Auth0ProviderWithHistory: React.FC = ({ children }) => {
  const domain = process.env.REACT_APP_AUTH0_DOMAIN || '';
  const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID || '';
  const audience = process.env.REACT_APP_AUTH0_AUDIENCE || '';
  const redirectUri = window.location.origin;
  
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: 'openid profile email',
      }}
      useRefreshTokens={true}
      cacheLocation="memory"
    >
      {children}
    </Auth0Provider>
  );
};
```

### Auth Context

A custom Auth context is created to provide authentication state and functions throughout the application:

```tsx
// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { api } from '../utils/api';
import { User } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: Error | null;
  login: () => void;
  logout: () => void;
  getAccessToken: () => Promise<string | null>;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  hasProjectRole: (projectId: string, role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const { 
    isAuthenticated, 
    isLoading, 
    user: auth0User, 
    error, 
    loginWithRedirect, 
    logout: auth0Logout,
    getAccessTokenSilently 
  } = useAuth0();
  
  const [user, setUser] = useState<User | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTenantOwner, setIsTenantOwner] = useState(false);
  const [projectRoles, setProjectRoles] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && auth0User) {
        try {
          // Fetch user data from the API
          const response = await api.get('/tenants/me');
          const userData = response.data;
          
          setUser({
            id: auth0User.sub,
            email: auth0User.email,
            name: auth0User.name,
            picture: auth0User.picture,
            tenantId: userData._id,
            tenantName: userData.name,
          });
          
          setIsTenantOwner(userData.ownerId === auth0User.sub);
          
          // Check if user is a super admin
          try {
            const adminResponse = await api.get('/admin/check');
            setIsSuperAdmin(adminResponse.data.isSuperAdmin);
          } catch (error) {
            setIsSuperAdmin(false);
          }
          
          // Fetch project roles
          const projectsResponse = await api.get('/projects');
          const projects = projectsResponse.data;
          
          const roles: Record<string, string> = {};
          projects.forEach((project: any) => {
            const member = project.members.find((m: any) => m.userId === auth0User.sub);
            if (member) {
              roles[project._id] = member.role;
            }
          });
          
          setProjectRoles(roles);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    
    fetchUserData();
  }, [isAuthenticated, auth0User]);
  
  const login = () => {
    loginWithRedirect();
  };
  
  const logout = () => {
    auth0Logout({ 
      logoutParams: {
        returnTo: window.location.origin 
      }
    });
    setUser(null);
    setIsSuperAdmin(false);
    setIsTenantOwner(false);
    setProjectRoles({});
  };
  
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };
  
  const hasProjectRole = (projectId: string, role: string) => {
    const userRole = projectRoles[projectId];
    if (!userRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    if (role === 'MEMBER') {
      return ['OWNER', 'DEPUTY', 'MEMBER'].includes(userRole);
    } else if (role === 'DEPUTY') {
      return ['OWNER', 'DEPUTY'].includes(userRole);
    } else if (role === 'OWNER') {
      return userRole === 'OWNER';
    }
    
    return false;
  };
  
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        error,
        login,
        logout,
        getAccessToken,
        isSuperAdmin,
        isTenantOwner,
        hasProjectRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

> ⚠️ **Note**: The above example shows the original pattern. See [Current Optimized Implementation](#current-optimized-implementation) for the production version with performance improvements.

---

## Current Optimized Implementation

**Location:** `src/core/context/AuthContext.tsx`  
**Optimization Date:** October 2025 (Sprint 1)  
**Key Improvement:** React Query caching + localStorage backup

### Performance Enhancements

The current implementation includes the following optimizations:

1. **React Query Integration**: Roles are cached with intelligent staleness detection
2. **localStorage Backup**: Roles persist across page reloads
3. **Reduced API Calls**: ~95% reduction (from 10-50+ to 1-2 per session)
4. **Automatic Cache Invalidation**: Clears on logout and user change

### Current AuthContext Structure

```typescript
// src/core/context/AuthContext.tsx (Simplified)
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth0 } from '@auth0/auth0-react';

const ROLES_CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const ROLES_CACHE_KEY = 'mwap_user_roles_cache';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, getAccessTokenSilently, isLoading: auth0Loading } = useAuth0();
  const queryClient = useQueryClient();

  // Optimized role fetching with React Query
  const { data: roles, error, isLoading: rolesLoading } = useQuery({
    queryKey: ['user', 'roles', user?.sub],
    queryFn: async () => {
      // 1. Check localStorage cache first
      const cachedRoles = getCachedRoles(user?.sub || '');
      if (cachedRoles) {
        return cachedRoles;
      }

      // 2. Fetch from API with auth token
      const token = await getAccessTokenSilently();
      const response = await apiClient.get('/users/me/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 3. Normalize and cache response
      const normalizedRoles = handleApiResponse(response.data);
      setCachedRoles(user?.sub || '', normalizedRoles);
      
      return normalizedRoles;
    },
    enabled: isAuthenticated && !!user?.sub,
    staleTime: ROLES_CACHE_TTL, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Derived role flags
  const isSuperAdmin = roles?.isSuperAdmin ?? false;
  const isTenantOwner = roles?.isTenantOwner ?? false;
  const currentTenant = roles?.tenantId ?? null;

  // Project role checking with hierarchy
  const hasProjectRole = useCallback((projectId: string, requiredRole: string): boolean => {
    if (!roles?.projectRoles) return false;
    
    const projectRole = roles.projectRoles.find(pr => pr.projectId === projectId);
    if (!projectRole) return false;
    
    const roleHierarchy = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
    return roleHierarchy[projectRole.role] >= roleHierarchy[requiredRole];
  }, [roles]);

  // Cache cleanup on logout
  const logout = useCallback(() => {
    queryClient.clear(); // Clear React Query cache
    localStorage.removeItem(ROLES_CACHE_KEY); // Clear localStorage cache
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [queryClient, auth0Logout]);

  // Context value
  const contextValue: AuthContextType = {
    isAuthenticated,
    isLoading: auth0Loading || rolesLoading,
    isReady: isAuthenticated && !auth0Loading && !rolesLoading && roles !== null,
    user,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles,
    currentTenant,
    hasProjectRole,
    getToken: getAccessTokenSilently,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
```

### Cache Implementation Details

#### localStorage Cache Helper Functions

```typescript
// Cache structure
interface RolesCache {
  data: UserRolesResponse;
  timestamp: number;
  userId: string;
}

// Get cached roles if valid and fresh
function getCachedRoles(userId: string): UserRolesResponse | null {
  try {
    const cached = localStorage.getItem(ROLES_CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp, userId: cachedUserId }: RolesCache = JSON.parse(cached);

    // Validate cache
    if (cachedUserId !== userId) return null; // Different user
    if (Date.now() - timestamp > ROLES_CACHE_TTL) return null; // Expired

    return data;
  } catch (error) {
    return null;
  }
}

// Store roles in localStorage
function setCachedRoles(userId: string, data: UserRolesResponse): void {
  try {
    const cache: RolesCache = {
      data,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.warn('Failed to cache roles in localStorage:', error);
  }
}
```

### Performance Comparison

| Metric | Before Optimization | After Optimization | Improvement |
|--------|---------------------|-------------------|-------------|
| **API Calls per Session** | 10-50+ | 1-2 | ~95% reduction |
| **Role Fetch on Navigation** | Every time | Cached | Zero calls |
| **Role Fetch on Component Remount** | Every time | Cached | Zero calls |
| **Page Reload Speed** | Slow (API call) | Fast (localStorage) | < 100ms |
| **Cache Duration** | None | 15 minutes | Configurable |

### Benefits

1. **Performance**: Dramatic reduction in API calls
2. **User Experience**: Faster page loads and navigation
3. **Server Load**: Reduced backend pressure
4. **Offline Resilience**: Roles available from localStorage on reload
5. **Type Safety**: Full TypeScript support with proper typing

### Implementation Reference

For the complete implementation, see:
- **File:** `src/core/context/AuthContext.tsx`
- **Implementation Report:** `docs/09-Reports-and-History/SPRINT_1_IMPLEMENTATION.md`
- **Review:** `docs/09-Reports-and-History/REPOSITORY_REVIEW_2025-10-04.md`

---

## Protected Routes

Protected routes ensure that only authenticated users can access certain parts of the application:

```tsx
// src/routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    // Redirect to login page, but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};
```

## Role-Based Routes

Role-based routes restrict access based on the user's role:

```tsx
// src/routes/RoleRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface RoleRouteProps {
  requiredRoles: ('superAdmin' | 'tenantOwner' | 'projectOwner' | 'projectDeputy' | 'projectMember')[];
  projectId?: string;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ 
  requiredRoles,
  projectId
}) => {
  const { 
    isLoading, 
    isSuperAdmin, 
    isTenantOwner, 
    hasProjectRole 
  } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  const hasRequiredRole = requiredRoles.some(role => {
    if (role === 'superAdmin') return isSuperAdmin;
    if (role === 'tenantOwner') return isTenantOwner;
    if (role === 'projectOwner' && projectId) return hasProjectRole(projectId, 'OWNER');
    if (role === 'projectDeputy' && projectId) return hasProjectRole(projectId, 'DEPUTY');
    if (role === 'projectMember' && projectId) return hasProjectRole(projectId, 'MEMBER');
    return false;
  });
  
  if (!hasRequiredRole) {
    return <Navigate to="/forbidden" replace />;
  }
  
  return <Outlet />;
};
```

## Route Configuration

The routes are configured to use these components:

```tsx
// src/routes/index.tsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { ForgotPassword } from '../pages/auth/ForgotPassword';
import { SuperAdminDashboard } from '../pages/dashboard/SuperAdminDashboard';
import { TenantOwnerDashboard } from '../pages/dashboard/TenantOwnerDashboard';
import { ProjectMemberDashboard } from '../pages/dashboard/ProjectMemberDashboard';
import { NotFound } from '../pages/error/NotFound';
import { Forbidden } from '../pages/error/Forbidden';
import { ServerError } from '../pages/error/ServerError';
// Import other pages...

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            {/* Dashboard routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* SuperAdmin routes */}
            <Route element={<RoleRoute requiredRoles={['superAdmin']} />}>
              <Route path="/admin/dashboard" element={<SuperAdminDashboard />} />
              <Route path="/admin/tenants" element={<TenantList />} />
              <Route path="/admin/project-types" element={<ProjectTypeList />} />
              <Route path="/admin/cloud-providers" element={<CloudProviderList />} />
              {/* Other SuperAdmin routes... */}
            </Route>
            
            {/* Tenant Owner routes */}
            <Route element={<RoleRoute requiredRoles={['tenantOwner']} />}>
              <Route path="/tenant/dashboard" element={<TenantOwnerDashboard />} />
              <Route path="/tenant/settings" element={<TenantSettings />} />
              <Route path="/tenant/integrations" element={<IntegrationList />} />
              {/* Other Tenant Owner routes... */}
            </Route>
            
            {/* Project routes */}
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            
            {/* Project Owner/Deputy routes */}
            <Route path="/projects/:id/settings" element={
              <RoleRoute 
                requiredRoles={['projectOwner', 'projectDeputy']} 
                projectId={/* Get from URL params */}
              >
                <ProjectSettings />
              </RoleRoute>
            } />
            
            {/* Project Owner routes */}
            <Route path="/projects/:id/members" element={
              <RoleRoute 
                requiredRoles={['projectOwner']} 
                projectId={/* Get from URL params */}
              >
                <ProjectMembers />
              </RoleRoute>
            } />
            
            {/* User profile */}
            <Route path="/profile" element={<UserProfile />} />
            
            {/* Error pages */}
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

## Token Management

Access tokens are managed securely:

1. **Token Storage**: Tokens are stored in memory, not in localStorage or cookies
2. **Token Refresh**: Refresh tokens are used to obtain new access tokens
3. **Token Expiration**: Expired tokens trigger a refresh or redirect to login

```tsx
// src/utils/auth.ts
import { useAuth0 } from '@auth0/auth0-react';

export const useTokenManager = () => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  const getAccessToken = async (): Promise<string | null> => {
    if (!isAuthenticated) {
      return null;
    }
    
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  };
  
  return {
    getAccessToken,
  };
};
```

## Security Considerations

### CSRF Protection

Cross-Site Request Forgery (CSRF) protection is implemented:

1. Auth0 uses state parameters to prevent CSRF during authentication
2. API requests include the JWT token, which is verified on the server

### XSS Protection

Cross-Site Scripting (XSS) protection measures:

1. React's built-in XSS protection (automatic escaping)
2. Content Security Policy (CSP) headers
3. Input validation and sanitization
4. Avoiding dangerous patterns like `dangerouslySetInnerHTML`

### Secure Token Handling

1. Tokens are stored in memory, not localStorage
2. Tokens are never exposed to JavaScript
3. Token refresh is handled securely

### Secure Communication

1. All API communication uses HTTPS
2. Sensitive data is never logged or exposed
3. Error messages don't reveal sensitive information

## Logout Process

The logout process ensures complete session termination:

1. Clear local application state
2. Redirect to Auth0 logout endpoint
3. Invalidate the session on the Auth0 side
4. Redirect back to the application

```tsx
const logout = () => {
  auth0Logout({ 
    logoutParams: {
      returnTo: window.location.origin 
    }
  });
  // Clear local state
  setUser(null);
  setIsSuperAdmin(false);
  setIsTenantOwner(false);
  setProjectRoles({});
};
```

## Authentication Race Conditions

### Common Issue: Component Rendering Before Authentication Ready

A common issue in React applications with authentication is components rendering before the authentication state is fully ready. This can cause:

- Role-based UI elements not displaying correctly
- API calls failing due to missing tokens
- Poor user experience with flickering or missing content

### Solution: isReady State Coordination

The AuthContext provides an `isReady` state that indicates when authentication is fully initialized:

```tsx
// In AuthContext
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  const initializeAuth = async () => {
    if (isAuthenticated && user) {
      try {
        // Fetch user roles and permissions
        await loadUserRoles();
        setIsReady(true);
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setIsReady(true); // Still set ready to prevent infinite loading
      }
    } else if (!isLoading) {
      setIsReady(true); // Not authenticated, but ready
    }
  };

  initializeAuth();
}, [isAuthenticated, user, isLoading]);
```

### Best Practices for Components

When building components that depend on authentication state:

1. **Always check isReady before rendering role-based content**:
```tsx
const MyComponent = () => {
  const { isReady, isSuperAdmin } = useAuth();
  
  if (!isReady) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      {isSuperAdmin && <AdminPanel />}
    </div>
  );
};
```

2. **Use loading states for better UX**:
```tsx
const QuickActions = () => {
  const { isReady, isSuperAdmin, isTenantOwner } = useAuth();
  
  if (!isReady) {
    return (
      <Card>
        <Text>Loading user permissions...</Text>
      </Card>
    );
  }
  
  return (
    <div>
      {isSuperAdmin && <SuperAdminActions />}
      {isTenantOwner && <TenantOwnerActions />}
    </div>
  );
};
```

3. **Coordinate with authentication in useEffect**:
```tsx
useEffect(() => {
  if (isReady && isSuperAdmin) {
    // Safe to perform admin-specific operations
    loadAdminData();
  }
}, [isReady, isSuperAdmin]);
```

### Recent Fix: Home Page Quick Actions

**Issue**: SuperAdmin quick actions weren't displaying on the Home page despite API returning correct roles.

**Root Cause**: The Home page (`/`) is not a protected route, so it renders immediately before authentication is ready. Role-based quick actions were evaluated with stale values.

**Solution**: Enhanced Home component to wait for `isReady` state:
- Added `isReady` check to all role-based quick actions
- Added loading state while authentication initializes
- Added debug logging for development troubleshooting

## Conclusion

The MWAP frontend implements a secure, robust authentication system using Auth0 with the Authorization Code flow with PKCE. This approach provides a high level of security while maintaining a good user experience. Role-based access control ensures that users can only access the features and data they are authorized to use.

**Key Takeaway**: Always coordinate component rendering with authentication readiness using the `isReady` state to prevent race conditions and ensure reliable role-based functionality.