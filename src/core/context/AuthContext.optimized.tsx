/**
 * OPTIMIZED AuthContext with Role Caching
 * 
 * This is a reference implementation showing how to optimize the AuthContext
 * to cache user roles efficiently and avoid unnecessary API calls.
 * 
 * Key improvements:
 * 1. React Query for role fetching with built-in caching
 * 2. localStorage backup for offline/fast restoration
 * 3. TTL-based cache invalidation (15 minutes)
 * 4. Proper cleanup and cache management
 * 
 * To implement: Replace src/core/context/AuthContext.tsx with this file
 * (after backing up the original)
 */

import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../shared/utils';
import { UserRolesResponse } from '../../shared/types/auth';

// Cache configuration
const ROLES_CACHE_KEY = 'mwap_user_roles_cache';
const ROLES_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

interface RolesCache {
  data: UserRolesResponse;
  timestamp: number;
  userId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  isReady: boolean;
  user: any;
  login: () => void;
  logout: () => void;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  roles: UserRolesResponse | null;
  currentTenant: string | null;
  hasProjectRole: (projectId: string, role: string) => boolean;
  getToken: () => Promise<string>;
}

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
  currentTenant: null,
  hasProjectRole: () => false,
  getToken: async () => '',
});

export const useAuth = () => useContext(AuthContext);

/**
 * Get cached roles from localStorage
 */
const getCachedRoles = (userId: string): UserRolesResponse | null => {
  try {
    const cached = localStorage.getItem(ROLES_CACHE_KEY);
    if (!cached) return null;

    const cache: RolesCache = JSON.parse(cached);
    
    // Check if cache is for the same user
    if (cache.userId !== userId) {
      localStorage.removeItem(ROLES_CACHE_KEY);
      return null;
    }

    // Check if cache is still valid (TTL)
    const age = Date.now() - cache.timestamp;
    if (age > ROLES_CACHE_TTL) {
      localStorage.removeItem(ROLES_CACHE_KEY);
      return null;
    }

    if (import.meta.env.DEV) {
      console.log('✅ Using cached roles from localStorage', {
        age: `${Math.round(age / 1000)}s`,
        expiresIn: `${Math.round((ROLES_CACHE_TTL - age) / 1000)}s`,
      });
    }

    return cache.data;
  } catch (error) {
    console.error('Failed to read cached roles:', error);
    localStorage.removeItem(ROLES_CACHE_KEY);
    return null;
  }
};

/**
 * Save roles to localStorage cache
 */
const setCachedRoles = (userId: string, roles: UserRolesResponse): void => {
  try {
    const cache: RolesCache = {
      data: roles,
      timestamp: Date.now(),
      userId,
    };
    localStorage.setItem(ROLES_CACHE_KEY, JSON.stringify(cache));
    
    if (import.meta.env.DEV) {
      console.log('💾 Cached roles to localStorage');
    }
  } catch (error) {
    console.error('Failed to cache roles:', error);
  }
};

/**
 * Clear roles cache
 */
const clearCachedRoles = (): void => {
  localStorage.removeItem(ROLES_CACHE_KEY);
  if (import.meta.env.DEV) {
    console.log('🗑️ Cleared roles cache');
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  /**
   * Fetch user roles with React Query caching
   */
  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
  } = useQuery({
    queryKey: ['user', 'roles', user?.sub],
    queryFn: async (): Promise<UserRolesResponse> => {
      if (!user?.sub) {
        throw new Error('No user ID available');
      }

      if (import.meta.env.DEV) {
        console.group('🔐 Fetching user roles');
        console.log('User ID:', user.sub);
      }

      // Check localStorage cache first
      const cached = getCachedRoles(user.sub);
      if (cached) {
        if (import.meta.env.DEV) {
          console.log('Using cached roles');
          console.groupEnd();
        }
        return cached;
      }

      // Fetch from API
      if (import.meta.env.DEV) {
        console.log('Fetching from API...');
      }

      const token = await getAccessTokenSilently();
      localStorage.setItem('auth_token', token);

      const response = await api.get('/users/me/roles');
      
      // Handle wrapped response format
      let rolesData: UserRolesResponse;
      if (response.data?.success && response.data?.data) {
        rolesData = response.data.data;
      } else {
        rolesData = response.data;
      }

      // Normalize and validate
      const normalizedRoles: UserRolesResponse = {
        userId: rolesData.userId || user.sub,
        isSuperAdmin: Boolean(rolesData.isSuperAdmin),
        isTenantOwner: Boolean(rolesData.isTenantOwner),
        tenantId: rolesData.tenantId || null,
        projectRoles: Array.isArray(rolesData.projectRoles) ? rolesData.projectRoles : [],
      };

      // Cache the result
      setCachedRoles(user.sub, normalizedRoles);

      if (import.meta.env.DEV) {
        console.log('✅ Roles fetched and cached:', normalizedRoles);
        console.groupEnd();
      }

      return normalizedRoles;
    },
    enabled: isAuthenticated && !!user?.sub,
    staleTime: ROLES_CACHE_TTL, // Consider data fresh for 15 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes (formerly cacheTime)
    retry: 1,
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Handle errors separately (onError is deprecated in React Query v5)
  if (rolesError) {
    console.error('Failed to fetch user roles:', rolesError);
    if (import.meta.env.DEV) {
      console.group('🚨 Role Fetch Error');
      console.error(rolesError);
      console.groupEnd();
    }
  }

  // Derived role flags - safely access with optional chaining
  const isSuperAdmin = (roles as any)?.isSuperAdmin ?? false;
  const isTenantOwner = (roles as any)?.isTenantOwner ?? false;
  const currentTenant = (roles as any)?.tenantId ?? null;

  /**
   * Check if user has a specific role in a project
   */
  const hasProjectRole = useCallback((projectId: string, requiredRole: string): boolean => {
    if (!(roles as any)?.projectRoles) return false;
    
    const projectRole = (roles as any).projectRoles.find((pr: any) => pr.projectId === projectId);
    if (!projectRole) return false;
    
    // Role hierarchy: OWNER > DEPUTY > MEMBER
    const roleHierarchy: { [key: string]: number } = { 
      'OWNER': 3, 
      'DEPUTY': 2, 
      'MEMBER': 1 
    };
    
    const userRoleValue = roleHierarchy[projectRole.role] || 0;
    const requiredRoleValue = roleHierarchy[requiredRole] || 0;
    
    return userRoleValue >= requiredRoleValue;
  }, [roles]);

  /**
   * Get access token
   */
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

  /**
   * Login function
   */
  const login = useCallback(() => {
    loginWithRedirect();
  }, [loginWithRedirect]);

  /**
   * Logout function with cache cleanup
   */
  const logout = useCallback(() => {
    // Clear all caches
    clearCachedRoles();
    localStorage.removeItem('auth_token');
    
    // Invalidate React Query cache
    queryClient.clear();
    
    // Auth0 logout
    auth0Logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  }, [auth0Logout, queryClient]);

  /**
   * Clean up cache when user changes
   */
  useEffect(() => {
    if (!isAuthenticated && !auth0Loading) {
      clearCachedRoles();
    }
  }, [isAuthenticated, auth0Loading]);

  // Calculate if auth is ready for API calls
  const isReady = isAuthenticated && !auth0Loading && !rolesLoading && roles !== null;

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo((): AuthContextType => ({
    isAuthenticated,
    isLoading: auth0Loading || rolesLoading,
    isReady,
    user,
    login,
    logout,
    isSuperAdmin,
    isTenantOwner,
    roles: (roles as any) ?? null,
    currentTenant,
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
    currentTenant,
    hasProjectRole,
    getToken,
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
export default AuthProvider;

