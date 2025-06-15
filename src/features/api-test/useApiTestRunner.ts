import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiTest {
  id: string;
  name: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  description?: string;
}

export interface TestResult {
  id: string;
  name: string;
  method: string;
  url: string;
  success: boolean;
  status?: number;
  statusText?: string;
  duration: number;
  error?: string;
  requestData?: any;
  responseData?: any;
  responseHeaders?: any;
}

export const useApiTestRunner = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  // Predefined tests
  const predefinedTests: ApiTest[] = [
    {
      id: 'get-tenants',
      name: 'Get All Tenants',
      method: 'GET',
      url: '/api/tenants',
      description: 'Fetch all tenants (requires SuperAdmin role)'
    },
    {
      id: 'get-cloud-providers',
      name: 'Get Cloud Providers',
      method: 'GET',
      url: '/api/cloud-providers',
      description: 'Fetch all cloud providers'
    },
    {
      id: 'get-project-types',
      name: 'Get Project Types',
      method: 'GET',
      url: '/api/project-types',
      description: 'Fetch all project types'
    },
    {
      id: 'get-user-roles',
      name: 'Get User Roles',
      method: 'GET',
      url: '/api/users/me/roles',
      description: 'Fetch current user roles'
    },
    {
      id: 'get-projects',
      name: 'Get Projects',
      method: 'GET',
      url: '/api/projects',
      description: 'Fetch all projects accessible to the current user'
    }
  ];

  // Toggle test selection
  const toggleTestSelection = useCallback((testId: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  }, []);

  // Initialize with all tests selected
  useState(() => {
    setSelectedTests(predefinedTests.map(test => test.id));
  });

  // Run a single test
  const runTest = useCallback(async (test: ApiTest): Promise<TestResult> => {
    const startTime = performance.now();
    
    try {
      const config: AxiosRequestConfig = {
        method: test.method,
        url: test.url,
        data: test.data,
        headers: {
          'Content-Type': 'application/json',
          ...test.headers
        }
      };
      
      // Get token from localStorage
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers = {
          ...config.headers,
          'Authorization': `Bearer ${token}`
        };
      }
      
      const response: AxiosResponse = await axios(config);
      const endTime = performance.now();
      
      return {
        id: test.id,
        name: test.name,
        method: test.method,
        url: test.url,
        success: true,
        status: response.status,
        statusText: response.statusText,
        duration: endTime - startTime,
        requestData: test.data,
        responseData: response.data,
        responseHeaders: response.headers
      };
    } catch (error) {
      const endTime = performance.now();
      const axiosError = error as AxiosError;
      
      return {
        id: test.id,
        name: test.name,
        method: test.method,
        url: test.url,
        success: false,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        duration: endTime - startTime,
        error: axiosError.message,
        requestData: test.data,
        responseData: axiosError.response?.data,
        responseHeaders: axiosError.response?.headers
      };
    }
  }, []);

  // Run all selected tests
  const runAllTests = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setResults([]);
    
    const testsToRun = predefinedTests.filter(test => 
      selectedTests.includes(test.id)
    );
    
    const newResults: TestResult[] = [];
    
    for (const test of testsToRun) {
      const result = await runTest(test);
      newResults.push(result);
      setResults(prev => [...prev, result]);
    }
    
    setIsRunning(false);
    return newResults;
  }, [isRunning, selectedTests, predefinedTests, runTest]);

  return {
    results,
    isRunning,
    runAllTests,
    predefinedTests,
    selectedTests,
    toggleTestSelection
  };
};