import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../utils/api';
import { UserRolesResponse } from '../types/auth';
import { extractData, createApiError } from '../utils/apiResponseHandler';
import { notifications } from '@mantine/notifications';

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
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

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
            // Use the API with our new response handler
            const response = await api.getUserRoles();
            const userRoles = extractData<UserRolesResponse>(response);
            
            if (!userRoles) {
              throw new Error('No user roles returned from API');
            }
            
            setRoles(userRoles);
            
            // Set role flags
            setIsSuperAdmin(userRoles.isSuperAdmin || false);
            setIsTenantOwner(userRoles.isTenantOwner || false);
            
            // Show welcome notification
            const roleText = userRoles.isSuperAdmin 
              ? 'SuperAdmin' 
              : userRoles.isTenantOwner 
                ? 'Tenant Owner' 
                : 'User';
                
            // Use setTimeout to ensure the notifications component is mounted
            setTimeout(() => {
              try {
                notifications.show({
                  title: `Welcome, ${user.name || 'User'}`,
                  message: `You are logged in as ${roleText}`,
                  color: 'green',
                  autoClose: 3000,
                });
              } catch (error) {
                console.warn('Could not show welcome notification:', error);
              }
            }, 500);
          } catch (error) {
            console.error('Failed to fetch user roles:', error);
            
            // Show error notification
            setTimeout(() => {
              try {
                notifications.show({
                  title: 'Authentication Error',
                  message: 'Failed to fetch user roles. Some features may be unavailable.',
                  color: 'red',
                });
              } catch (error) {
                console.warn('Could not show error notification:', error);
              }
            }, 500);
            
            // Only use default roles in development mode if explicitly requested
            const isDevelopment = import.meta.env.DEV;
            const useDefaultRoles = isDevelopment && import.meta.env.VITE_USE_DEFAULT_ROLES === 'true';
            
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
              
              setTimeout(() => {
                try {
                  notifications.show({
                    title: 'Development Mode',
                    message: 'Using default roles for development',
                    color: 'blue',
                  });
                } catch (error) {
                  console.warn('Could not show development notification:', error);
                }
              }, 500);
            }
          }
        } catch (error) {
          console.error('Failed to get token:', error);
          
          setTimeout(() => {
            try {
              notifications.show({
                title: 'Authentication Error',
                message: 'Failed to get authentication token. Please try logging in again.',
                color: 'red',
              });
            } catch (error) {
              console.warn('Could not show authentication error notification:', error);
            }
          }, 500);
        } finally {
          setRolesLoading(false);
          setInitialLoadComplete(true);
        }
      } else if (!isAuthenticated) {
        // If not authenticated, mark initial load as complete
        setInitialLoadComplete(true);
        setRolesLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUserRoles();
    } else if (!auth0Loading) {
      // If Auth0 has finished loading and user is not authenticated,
      // mark initial load as complete
      setInitialLoadComplete(true);
      setRolesLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently, auth0Loading]);

  // Login function
  const login = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  // Logout function
  const logout = useCallback(() => {
    // Clear local storage
    localStorage.removeItem('auth_token');
    // Call Auth0 logout
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  // Get token function
  const getToken = useCallback(async (): Promise<string> => {
    try {
      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);
      return token;
    } catch (error) {
      console.error('Failed to get token:', error);
      return '';
    }
  }, [getAccessTokenSilently]);

  // Check if user has a specific role in a project
  const hasProjectRole = useCallback((projectId: string, requiredRole: string): boolean => {
    if (!roles || !roles.projectRoles) return false;
    
    const projectRole = roles.projectRoles.find(pr => pr.projectId === projectId);
    if (!projectRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    const roleHierarchy = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
    const userRoleValue = roleHierarchy[projectRole.role] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || 0;
    
    return userRoleValue >= requiredRoleValue;
  }, [roles]);

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
  
  // Determine if we're still loading
  // We're loading if Auth0 is loading OR if we're authenticated but still loading roles
  const isLoadingState = auth0Loading || (isAuthenticated && rolesLoading) || !initialLoadComplete;
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated: effectiveIsAuthenticated,
    isLoading: isLoadingState,
    user: effectiveUser,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles,
    hasProjectRole,
    getToken,
  }), [
    effectiveIsAuthenticated,
    isLoadingState,
    effectiveUser,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles,
    hasProjectRole,
    getToken
  ]);

  // Provide auth context to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;