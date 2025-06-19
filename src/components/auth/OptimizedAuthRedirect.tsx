import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/OptimizedAuthContext';
import { LoadingSpinner } from '../common';

/**
 * OptimizedAuthRedirect component
 * 
 * This component handles authentication redirects with improved loading states:
 * - If user is authenticated, redirects to the home page or the requested page
 * - If user is not authenticated, shows the login page
 * - Prevents UI flashing during authentication
 */
const OptimizedAuthRedirect: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
  // This prevents the login button from flashing before redirect
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Authenticating..." />
      </div>
    );
  }

  // If authenticated, we'll be redirected by the useEffect above
  // If not authenticated, show the login page
  return <>{children}</>;
};

export default OptimizedAuthRedirect;