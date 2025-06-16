import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { UserRolesResponse } from '../types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  roles: UserRolesResponse | null;
  hasProjectRole: (projectId: string, role: string) => boolean;
  getToken: () => Promise<string>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  login: () => {},
  logout: () => {},
  isSuperAdmin: false,
  isTenantOwner: false,
  roles: null,
  hasProjectRole: () => false,
  getToken: async () => '',
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isTenantOwner, setIsTenantOwner] = useState(false);
  const [roles, setRoles] = useState<UserRolesResponse | null>(null);
  const [rolesLoading, setRolesLoading] = useState(false);

  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Fetch user roles when authenticated
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated && user) {
        try {
          setRolesLoading(true);
          // Get token and store it
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth_token', token);
          
          try {
            // Always use the real API endpoint
            const userRoles = await api.getUserRoles();
            console.log('User roles from API:', userRoles);
            
            setRoles(userRoles);
            
            // Set role flags
            setIsSuperAdmin(userRoles.isSuperAdmin || false);
            setIsTenantOwner(userRoles.isTenantOwner || false);
          } catch (error) {
            console.error('Failed to fetch user roles:', error);
            
            // Only use default roles if explicitly requested
            const useDefaultRoles = false;
            if (useDefaultRoles) {
              console.log('Using default roles for development');
              const defaultRoles: UserRolesResponse = {
                isSuperAdmin: true,
                isTenantOwner: true,
                tenantId: 'dev-tenant-id',
                projectRoles: [
                  { projectId: 'dev-project-id', role: 'OWNER' }
                ]
              };
              setRoles(defaultRoles);
              setIsSuperAdmin(true);
              setIsTenantOwner(true);
            }
          }
        } catch (error) {
          console.error('Failed to get token:', error);
        } finally {
          setRolesLoading(false);
        }
      }
    };

    if (isAuthenticated) {
      fetchUserRoles();
    } else {
      setRolesLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Login function
  const login = () => {
    loginWithRedirect();
  };

  // Logout function
  const logout = () => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    // Call Auth0 logout
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Get token function
  const getToken = async (): Promise<string> => {
    try {
      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return '';
    }
  };

  // Check if user has a specific role in a project
  const hasProjectRole = (projectId: string, requiredRole: string): boolean => {
    if (!roles || !roles.projectRoles) return false;
    
    const projectRole = roles.projectRoles.find(pr => pr.projectId === projectId);
    if (!projectRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    const roleHierarchy = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
    const userRoleValue = roleHierarchy[projectRole.role] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || 0;
    
    return userRoleValue >= requiredRoleValue;
  };

  // Use the actual authentication status, even in development mode
  const isDevelopment = import.meta.env.DEV;
  const effectiveIsAuthenticated = isAuthenticated;
  const effectiveUser = user;
  
  // In development mode, we can use the Auth0 bearer token from environment variable
  // but only for testing purposes. In production, the token comes from Auth0 authentication.
  useEffect(() => {
    if (isDevelopment && !isAuthenticated) {
      // Only use the development token if we're not authenticated through Auth0
      const devToken = import.meta.env.VITE_AUTH0_BEARER_TOKEN;
      if (devToken) {
        console.log('Using development Auth0 token for testing');
        localStorage.setItem('auth_token', devToken);
      }
    }
  }, [isDevelopment, isAuthenticated]);
  
  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: effectiveIsAuthenticated,
        isLoading: auth0Loading || rolesLoading,
        user: effectiveUser,
        login,
        logout,
        isSuperAdmin,
        isTenantOwner,
        roles,
        hasProjectRole,
        getToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;