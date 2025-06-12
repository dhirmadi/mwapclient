import React from 'react';
import { ApiError } from '@/types';

interface ErrorDisplayProps {
  error: Error | ApiError | null;
  className?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, className }) => {
  if (!error) return null;

  const isApiError = 'code' in error;
  const message = isApiError ? error.message : error.message || 'An unknown error occurred';
  const code = isApiError ? error.code : 'ERROR';

  return (
    <div className={`bg-red-900/30 backdrop-blur-sm border border-red-500/30 text-red-200 rounded-md p-4 shadow-glow ${className || ''}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-300">{code}</h3>
          <div className="mt-1 text-sm text-red-200">{message}</div>
          {isApiError && error.details && (
            <div className="mt-2 text-xs text-red-300/80">
              <pre className="whitespace-pre-wrap bg-red-950/30 p-2 rounded border border-red-500/20">
                {JSON.stringify(error.details, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;