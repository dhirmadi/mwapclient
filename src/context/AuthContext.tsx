import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthContextType, AuthState, User, UserRole } from '@/types/auth';
import api from '@/utils/api';

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,
  login: () => {},
  logout: () => {},
  getAccessToken: async () => null,
  hasRole: () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
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

  // Use Auth0 user information directly
  useEffect(() => {
    const setupUserProfile = async () => {
      if (isAuthenticated && auth0User) {
        try {
          // Get token and store it
          const token = await getAccessTokenSilently();
          localStorage.setItem('auth_token', token);

          // Extract roles from Auth0 user metadata or token claims
          // This assumes Auth0 is configured to include roles in the token
          // You may need to adjust this based on your Auth0 configuration
          const roles = auth0User['https://mwap.com/roles'] || [];
          
          // Create user object from Auth0 user
          const user: User = {
            id: auth0User.sub || '',
            email: auth0User.email || '',
            name: auth0User.name || '',
            roles: Array.isArray(roles) ? roles : [],
            picture: auth0User.picture || '',
          };

          setState({
            isAuthenticated: true,
            isLoading: false,
            user: user,
            error: null,
          });
        } catch (error) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: null,
            error: error instanceof Error ? error : new Error('An unknown error occurred'),
          });
        }
      } else if (!auth0Loading) {
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: auth0Error || null,
        });
      }
    };

    setupUserProfile();
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

  // Check if user has a specific role
  const hasRole = (role: UserRole | UserRole[]) => {
    if (!state.user) return false;
    
    if (Array.isArray(role)) {
      return role.some(r => state.user?.roles.includes(r));
    }
    
    return state.user.roles.includes(role);
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        getAccessToken,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;