import React, { useState } from 'react';
import { TestResult } from './useApiTestRunner';

interface TestResultCardProps {
  result: TestResult;
}

export const TestResultCard: React.FC<TestResultCardProps> = ({ result }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mb-4 border rounded-lg overflow-hidden shadow-sm">
      <div 
        className={`p-4 flex justify-between items-center cursor-pointer ${
          result.success ? 'bg-green-50' : 'bg-red-50'
        }`}
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="flex items-center">
          <span 
            className={`inline-flex items-center justify-center w-8 h-8 rounded-full mr-3 ${
              result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
          >
            {result.success ? '✓' : '✗'}
          </span>
          <div>
            <h3 className="font-medium">{result.name}</h3>
            <p className="text-sm text-gray-600">
              {result.method} {result.url}
            </p>
          </div>
        </div>
        <div className="flex items-center">
          {result.status && (
            <span 
              className={`px-2 py-1 text-xs rounded-md mr-3 ${
                result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {result.status} {result.statusText}
            </span>
          )}
          <span className="text-sm text-gray-500">{result.duration.toFixed(0)}ms</span>
          <svg 
            className={`w-5 h-5 ml-2 transform transition-transform ${showDetails ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {showDetails && (
        <div className="p-4 border-t">
          {result.error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-red-700">
              <strong>Error:</strong> {result.error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Request</h4>
              <div className="bg-gray-50 p-3 rounded border">
                <p className="text-sm font-mono mb-2">{result.method} {result.url}</p>
                {result.requestData && (
                  <>
                    <p className="text-xs text-gray-500 mt-2 mb-1">Request Data:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.requestData, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Response</h4>
              <div className="bg-gray-50 p-3 rounded border">
                {result.status && (
                  <p className="text-sm font-mono mb-2">
                    {result.status} {result.statusText}
                  </p>
                )}
                
                {result.responseHeaders && (
                  <>
                    <p className="text-xs text-gray-500 mt-2 mb-1">Headers:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-20">
                      {JSON.stringify(result.responseHeaders, null, 2)}
                    </pre>
                  </>
                )}
                
                {result.responseData && (
                  <>
                    <p className="text-xs text-gray-500 mt-2 mb-1">Response Body:</p>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.responseData, null, 2)}
                    </pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};