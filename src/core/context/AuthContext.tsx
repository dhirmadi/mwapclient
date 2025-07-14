import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../shared/utils/api';
import { UserRolesResponse } from '../../types/auth';

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
  
  // Use refs to track ongoing operations and prevent race conditions
  const fetchingRoles = useRef(false);
  const abortController = useRef<AbortController | null>(null);

  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Memoized function to fetch user roles
  const fetchUserRoles = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (fetchingRoles.current || !isAuthenticated || !user) {
      return;
    }

    // Cancel any ongoing request
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Create new abort controller for this request
    abortController.current = new AbortController();
    fetchingRoles.current = true;
    
    try {
      setRolesLoading(true);
      
      // Get token and store it
      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);
      
      // Fetch user roles from API
      const response = await api.get('/user/roles');
      const userRoles = response.data;
      
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }
      
      console.log('User roles from API:', userRoles);
      
      setRoles(userRoles);
      setIsSuperAdmin(userRoles.isSuperAdmin || false);
      setIsTenantOwner(userRoles.isTenantOwner || false);
      
    } catch (error) {
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        return;
      }
      
      console.error('Failed to fetch user roles:', error);
      
      // Reset roles on error
      setRoles(null);
      setIsSuperAdmin(false);
      setIsTenantOwner(false);
    } finally {
      fetchingRoles.current = false;
      setRolesLoading(false);
    }
  }, [isAuthenticated, user, getAccessTokenSilently]);

  // Effect to fetch roles when authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserRoles();
    } else {
      // Reset state when not authenticated
      setRoles(null);
      setIsSuperAdmin(false);
      setIsTenantOwner(false);
      setRolesLoading(false);
      fetchingRoles.current = false;
      
      // Cancel any ongoing request
      if (abortController.current) {
        abortController.current.abort();
        abortController.current = null;
      }
    }
    
    // Cleanup function
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };
  }, [isAuthenticated, user, fetchUserRoles]);

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

  // Memoized get token function
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

  // Memoized function to check if user has a specific role in a project
  const hasProjectRole = useCallback((projectId: string, requiredRole: string): boolean => {
    if (!roles || !roles.projectRoles) return false;
    
    const projectRole = roles.projectRoles.find((pr: any) => pr.projectId === projectId);
    if (!projectRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    const roleHierarchy: { [key: string]: number } = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
    const userRoleValue = roleHierarchy[projectRole.role] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || 0;
    
    return userRoleValue >= requiredRoleValue;
  }, [roles]);

  // Development token setup (runs only once)
  useEffect(() => {
    const isDevelopment = import.meta.env.DEV;
    if (isDevelopment && !isAuthenticated) {
      // Only use the development token if we're not authenticated through Auth0
      const devToken = import.meta.env.VITE_AUTH0_BEARER_TOKEN;
      if (devToken && !localStorage.getItem('auth_token')) {
        console.log('Using development Auth0 token for testing');
        localStorage.setItem('auth_token', devToken);
      }
    }
  }, [isAuthenticated]); // Include isAuthenticated to avoid stale closure
  
  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading: auth0Loading || rolesLoading,
        user,
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

export { AuthContext };
export default AuthProvider;