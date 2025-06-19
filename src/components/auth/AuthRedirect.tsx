import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common';

/**
 * AuthRedirect component
 * 
 * This component handles authentication redirects:
 * - If user is authenticated, redirects to the home page or the requested page
 * - If user is not authenticated, shows the login page
 * - Handles loading states during authentication
 */
const AuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the requested page from location state or default to home
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    // If authenticated and not on the login page, redirect to the requested page
    if (isAuthenticated && location.pathname === '/login') {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, location.pathname]);

  // Show loading spinner while authentication is in progress
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  // If not authenticated, show the login page
  // If authenticated, show the children (which should be the login UI)
  return <>{children}</>;
};

export default AuthRedirect;