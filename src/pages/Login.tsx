import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@mantine/core';
import { LoadingSpinner } from '@/components/common';

const Login: React.FC = () => {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="animated-bg"></div>
      <div className="glass-panel p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center futuristic-gradient">
              <span className="text-3xl font-bold text-white">MW</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 futuristic-text">
            Welcome to MWAP
          </h2>
          <p className="text-center text-gray-300 mb-6">
            Modular Web Application Platform
          </p>
        </div>
        <div className="mt-8">
          <Button
            onClick={login}
            fullWidth
            size="lg"
            className="glass-button"
            style={{
              background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
              border: 'none',
              padding: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }}
          >
            Sign in with Auth0
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;