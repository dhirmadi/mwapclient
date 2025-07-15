import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import api from '../../shared/utils/api';
import { handleApiResponse } from '../../shared/utils/dataTransform';
import { UserRolesResponse } from '../../shared/types/auth';

// Helper function to validate and normalize roles response
const validateAndNormalizeRoles = (data: any): UserRolesResponse => {
  if (!data || typeof data !== 'object') {
    console.warn('🚨 Invalid roles data received:', data);
    return {
      userId: '',
      isSuperAdmin: false,
      isTenantOwner: false,
      tenantId: null,
      projectRoles: []
    };
  }

  // Handle wrapped API response format first
  let actualData = data;
  if (data.success && data.data) {
    actualData = data.data;
    if (import.meta.env.DEV) {
      console.log('🔧 Unwrapped API response structure');
    }
  }

  // Handle different possible response structures
  let normalizedData: UserRolesResponse;

  if (actualData.isSuperAdmin !== undefined || actualData.isTenantOwner !== undefined) {
    // Direct roles structure
    normalizedData = {
      userId: actualData.userId || actualData.id || '',
      isSuperAdmin: Boolean(actualData.isSuperAdmin),
      isTenantOwner: Boolean(actualData.isTenantOwner),
      tenantId: actualData.tenantId || null,
      projectRoles: Array.isArray(actualData.projectRoles) ? actualData.projectRoles : []
    };
  } else if (actualData.roles) {
    // Nested roles structure
    normalizedData = {
      userId: actualData.userId || actualData.id || '',
      isSuperAdmin: Boolean(actualData.roles.isSuperAdmin),
      isTenantOwner: Boolean(actualData.roles.isTenantOwner),
      tenantId: actualData.roles.tenantId || actualData.tenantId || null,
      projectRoles: Array.isArray(actualData.roles.projectRoles) ? actualData.roles.projectRoles : []
    };
  } else if (actualData.user && actualData.user.roles) {
    // User object with nested roles
    normalizedData = {
      userId: actualData.user.userId || actualData.user.id || '',
      isSuperAdmin: Boolean(actualData.user.roles.isSuperAdmin),
      isTenantOwner: Boolean(actualData.user.roles.isTenantOwner),
      tenantId: actualData.user.roles.tenantId || actualData.user.tenantId || null,
      projectRoles: Array.isArray(actualData.user.roles.projectRoles) ? actualData.user.roles.projectRoles : []
    };
  } else {
    // Fallback - try to extract any role information
    console.warn('🚨 Unexpected roles data structure, using fallback:', actualData);
    normalizedData = {
      userId: actualData.userId || actualData.id || '',
      isSuperAdmin: Boolean(actualData.isSuperAdmin || actualData.superAdmin || actualData.isAdmin),
      isTenantOwner: Boolean(actualData.isTenantOwner || actualData.tenantOwner || actualData.isOwner),
      tenantId: actualData.tenantId || null,
      projectRoles: Array.isArray(actualData.projectRoles) ? actualData.projectRoles : []
    };
  }

  if (import.meta.env.DEV) {
    console.log('🔧 Role validation result:', {
      original: data,
      actualData: actualData,
      normalized: normalizedData,
      detectedSuperAdmin: normalizedData.isSuperAdmin,
      detectedTenantOwner: normalizedData.isTenantOwner,
      wasWrapped: data !== actualData
    });
  }

  return normalizedData;
};

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
      const userRoles = handleApiResponse(response, false);
      
      // Check if request was aborted
      if (abortController.current?.signal.aborted) {
        if (import.meta.env.DEV) {
          console.log('⚠️ Request was aborted');
          console.groupEnd();
        }
        return;
      }
      
      // Validate and normalize the response data
      const normalizedRoles = validateAndNormalizeRoles(userRoles);
      
      if (import.meta.env.DEV) {
        console.log('✅ User roles received from API:', userRoles);
        console.log('🔍 Raw response object:', response);
        console.log('📊 Response status:', response.status);
        console.log('📦 Response data type:', typeof userRoles);
        console.log('🧪 Response data analysis:', {
          hasData: !!userRoles,
          isObject: typeof userRoles === 'object',
          keys: userRoles ? Object.keys(userRoles) : [],
          isSuperAdminValue: userRoles?.isSuperAdmin,
          isTenantOwnerValue: userRoles?.isTenantOwner,
          tenantIdValue: userRoles?.tenantId,
          userIdValue: userRoles?.userId
        });
        console.log('🔧 Normalized roles:', normalizedRoles);
      }
      
      // Set roles with normalized data
      setRoles(normalizedRoles);
      setIsSuperAdmin(normalizedRoles.isSuperAdmin);
      setIsTenantOwner(normalizedRoles.isTenantOwner);
      
      if (import.meta.env.DEV) {
        console.log('📝 Roles being set in state:', {
          normalizedData: normalizedRoles,
          willSetSuperAdmin: normalizedRoles.isSuperAdmin,
          willSetTenantOwner: normalizedRoles.isTenantOwner,
          projectRoles: normalizedRoles.projectRoles?.length || 0,
          tenantId: normalizedRoles.tenantId
        });
        
        // Async state verification - check state after React updates
        console.log('🔬 Scheduling state verification...');
        setTimeout(() => {
          console.group('🔍 STATE VERIFICATION RESULTS');
          console.log('Expected vs Actual State:');
          console.log('  - Expected isSuperAdmin:', normalizedRoles.isSuperAdmin);
          console.log('  - Actual isSuperAdmin state:', isSuperAdmin);
          console.log('  - Expected isTenantOwner:', normalizedRoles.isTenantOwner);
          console.log('  - Actual isTenantOwner state:', isTenantOwner);
          console.log('  - Roles state:', roles);
          
          // Check for state update issues
          if (normalizedRoles.isSuperAdmin !== isSuperAdmin) {
            console.warn('⚠️ SuperAdmin state mismatch detected!');
          }
          if (normalizedRoles.isTenantOwner !== isTenantOwner) {
            console.warn('⚠️ TenantOwner state mismatch detected!');
          }
          
          console.log('✅ State verification complete');
          console.groupEnd();
        }, 200); // Increased timeout to ensure state updates
        
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
        
        // Type guard for axios error
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.error('🌐 Network error?', !axiosError.response);
          console.error('📊 Status:', axiosError.response?.status);
          console.error('📦 Response data:', axiosError.response?.data);
          
          // Provide specific guidance based on error type
          if (axiosError.response?.status === 404) {
            console.error('🔍 DIAGNOSIS: /users/me/roles endpoint returned 404. Check backend API routes.');
            console.error('💡 SUGGESTION: Verify the /users/me/roles endpoint exists in the backend.');
          } else if (axiosError.response?.status === 401) {
            console.error('🔍 DIAGNOSIS: Authentication failed. Token may be invalid.');
            console.error('💡 SUGGESTION: Check Auth0 token validity and backend authentication.');
          } else if (axiosError.response?.status === 403) {
            console.error('🔍 DIAGNOSIS: Access forbidden. User may not have permission.');
            console.error('💡 SUGGESTION: Check user permissions in backend.');
          } else if (!axiosError.response) {
            console.error('🔍 DIAGNOSIS: Network error. Backend may be unreachable.');
            console.error('💡 SUGGESTION: Check backend server status and network connectivity.');
          } else if (axiosError.response?.status === 200 || axiosError.response?.status === 201) {
            console.error('🔍 DIAGNOSIS: API returned success but response processing failed.');
            console.error('💡 SUGGESTION: Check response format and validation logic.');
          }
        }
        
        console.groupEnd();
        console.groupEnd(); // Close the main group
      } else {
        console.error('Failed to fetch user roles:', error);
      }
      
      // Reset roles on error, but provide fallback for development
      if (import.meta.env.DEV) {
        // In development, check if we have a development override
        const devOverride = localStorage.getItem('dev_user_roles');
        if (devOverride) {
          try {
            const devRoles = JSON.parse(devOverride);
            console.warn('🔧 Using development role override:', devRoles);
            const normalizedDevRoles = validateAndNormalizeRoles(devRoles);
            setRoles(normalizedDevRoles);
            setIsSuperAdmin(normalizedDevRoles.isSuperAdmin);
            setIsTenantOwner(normalizedDevRoles.isTenantOwner);
            return;
          } catch (parseError) {
            console.error('Failed to parse development role override:', parseError);
          }
        }
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