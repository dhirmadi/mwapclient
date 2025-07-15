import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../shared/utils/api';
import { UserRolesResponse } from '../../shared/types/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean; // New: indicates auth is complete and ready for API calls
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
  isReady: false,
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
    const timestamp = new Date().toISOString();
    
    // Enhanced debugging for auth flow
    if (import.meta.env.DEV) {
      console.group(`🔐 AUTH: fetchUserRoles called - ${timestamp}`);
      console.log('📊 Auth State:', {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.sub,
        userEmail: user?.email,
        fetchingRoles: fetchingRoles.current,
        rolesLoading
      });
    }
    
    // Prevent multiple simultaneous fetches
    if (fetchingRoles.current || !isAuthenticated || !user) {
      if (import.meta.env.DEV) {
        console.log('❌ Skipping role fetch:', {
          fetchingRoles: fetchingRoles.current,
          isAuthenticated,
          hasUser: !!user
        });
        console.groupEnd();
      }
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
      
      if (import.meta.env.DEV) {
        console.log('🎫 Getting Auth0 token...');
      }
      
      // Get token and store it
      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);
      
      if (import.meta.env.DEV) {
        console.log('✅ Token obtained:', {
          tokenLength: token.length,
          tokenPreview: `${token.substring(0, 20)}...${token.substring(token.length - 20)}`,
          storedInLocalStorage: true
        });
        console.log('🚀 Making API call to /users/me/roles...');
      }
      
      // Fetch user roles from API
      const response = await api.get('/users/me/roles');
      const userRoles = response.data;
      
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        if (import.meta.env.DEV) {
          console.log('⚠️ Request was aborted');
          console.groupEnd();
        }
        return;
      }
      
      if (import.meta.env.DEV) {
        console.log('✅ User roles received:', userRoles);
      }
      
      setRoles(userRoles);
      setIsSuperAdmin(userRoles.isSuperAdmin || false);
      setIsTenantOwner(userRoles.isTenantOwner || false);
      
      if (import.meta.env.DEV) {
        console.log('📝 Roles set:', {
          isSuperAdmin: userRoles.isSuperAdmin || false,
          isTenantOwner: userRoles.isTenantOwner || false,
          projectRoles: userRoles.projectRoles?.length || 0
        });
        console.groupEnd();
      }
      
    } catch (error) {
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        if (import.meta.env.DEV) {
          console.log('⚠️ Request was aborted during error handling');
          console.groupEnd();
        }
        return;
      }
      
      // Enhanced error logging for development
      if (import.meta.env.DEV) {
        console.group('🚨 Auth Error: Failed to fetch user roles');
        console.error('❌ Error details:', error);
        console.error('👤 User:', user);
        console.error('🔐 Is Authenticated:', isAuthenticated);
        console.error('🌐 Network error?', !error.response);
        console.error('📊 Status:', error.response?.status);
        console.error('📦 Response data:', error.response?.data);
        console.groupEnd();
        console.groupEnd(); // Close the main group
      } else {
        console.error('Failed to fetch user roles:', error);
      }
      
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
    const timestamp = new Date().toISOString();
    
    if (import.meta.env.DEV) {
      console.group(`🔄 AUTH EFFECT: Authentication state changed - ${timestamp}`);
      console.log('📊 Current State:', {
        isAuthenticated,
        hasUser: !!user,
        userId: user?.sub,
        userEmail: user?.email,
        auth0Loading,
        rolesLoading,
        currentRoles: roles
      });
    }
    
    if (isAuthenticated && user) {
      if (import.meta.env.DEV) {
        console.log('✅ User is authenticated, fetching roles...');
        console.groupEnd();
      }
      fetchUserRoles();
    } else {
      if (import.meta.env.DEV) {
        console.log('❌ User not authenticated, resetting state...');
        console.groupEnd();
      }
      
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
  
  // Calculate if auth is ready for API calls
  const isReady = isAuthenticated && !auth0Loading && !rolesLoading && roles !== null;
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    isAuthenticated,
    isLoading: auth0Loading || rolesLoading,
    isReady,
    user,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles,
    hasProjectRole,
    getToken,
  }), [
    isAuthenticated,
    auth0Loading,
    rolesLoading,
    isReady,
    user,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles,
    hasProjectRole,
    getToken,
  ]);
  
  // Provide auth context to children
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;