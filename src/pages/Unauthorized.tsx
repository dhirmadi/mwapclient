import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mantine/core';

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Unauthorized Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-4V8m0 0V6m0 0h2M9 6h2m0 0v2m0-2H9m3 10v-2m0 0v-2m0 2h2m-2 0H9"
            />
          </svg>
          <p className="text-gray-600 mt-4">
            Please contact your administrator if you believe this is an error.
          </p>
          <div className="mt-6">
            <Button component={Link} to="/" fullWidth>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;