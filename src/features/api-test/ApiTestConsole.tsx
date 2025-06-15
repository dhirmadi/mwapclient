import React from 'react';
import { useApiTestRunner, ApiTest } from './useApiTestRunner';
import { TestResultCard } from './TestResultCard';

export const ApiTestConsole: React.FC = () => {
  const { 
    results, 
    isRunning, 
    runAllTests, 
    predefinedTests,
    selectedTests,
    toggleTestSelection
  } = useApiTestRunner();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">API Test Console</h1>
        <p className="text-gray-600 mb-4">
          Run predefined API tests to verify endpoints are working correctly.
        </p>
        
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md font-medium ${
              isRunning 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Tests...
              </span>
            ) : (
              'Run All Tests'
            )}
          </button>
          
          <div className="text-sm text-gray-500">
            {results.length > 0 && (
              <>
                {results.filter(r => r.success).length} of {results.length} tests passed
              </>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Available Tests</h2>
          <div className="flex flex-wrap gap-2">
            {predefinedTests.map((test) => (
              <label 
                key={test.id}
                className="inline-flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedTests.includes(test.id)}
                  onChange={() => toggleTestSelection(test.id)}
                  className="mr-2"
                />
                <span>{test.name}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
      
      {results.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {results.map((result) => (
            <TestResultCard key={result.id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
};