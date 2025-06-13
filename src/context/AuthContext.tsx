import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthContextType, AuthState, User, UserRolesResponse, ProjectRole } from '../types/auth';
import axios from 'axios';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  roles: null,
  error: null,
  login: () => {},
  logout: () => {},
  getAccessToken: async () => null,
  isSuperAdmin: false,
  isTenantOwner: false,
  hasProjectRole: () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    roles: null,
    error: null,
  });

  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    error: auth0Error,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  // Fetch user roles from API
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (isAuthenticated && auth0User) {
        try {
          // Get token
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth_token', token);

          // Create user object from Auth0 user
          const user: User = {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            name: auth0User.name || '',
            picture: auth0User.picture || '',
          };

          // Fetch user roles from API
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const response = await axios.get<UserRolesResponse>(`${apiUrl}/api/v1/users/me/roles`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const userRoles = response.data;

          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            roles: userRoles,
            error: null,
          });
        } catch (error) {
          console.error('Failed to fetch user roles:', error);
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: null,
            roles: null,
            error: error instanceof Error ? error : new Error('An unknown error occurred'),
          });
        }
      } else if (!auth0Loading) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          roles: null,
          error: auth0Error || null,
        });
      }
    };

    fetchUserRoles();
  }, [isAuthenticated, auth0User, auth0Loading, auth0Error, getAccessTokenSilently]);

  // Login function
  const login = () => {
    loginWithRedirect();
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  };

  // Get access token function
  const getAccessToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Failed to get access token', error);
      return null;
    }
  };

  // Check if user has a specific project role
  const hasProjectRole = (projectId: string, requiredRole: ProjectRole) => {
    if (!state.roles) return false;
    
    const projectRole = state.roles.projectRoles.find(pr => pr.projectId === projectId);
    if (!projectRole) return false;
    
    const roleHierarchy = { 'OWNER': 3, 'DEPUTY': 2, 'MEMBER': 1 };
    return roleHierarchy[projectRole.role] >= roleHierarchy[requiredRole];
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        getAccessToken,
        isSuperAdmin: state.roles?.isSuperAdmin || false,
        isTenantOwner: state.roles?.isTenantOwner || false,
        hasProjectRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;