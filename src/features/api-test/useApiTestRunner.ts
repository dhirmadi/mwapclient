import { useState } from 'react';
import axios, { AxiosResponse, AxiosError } from 'axios';
import apiClient from '../../utils/api';

// Use the same baseURL as the main API client for consistency
const API_BASE_URL = '/api';

export interface TestResult {
  id: string;
  name: string;
  url: string;
  method: string;
  requestData?: any;
  status?: number;
  statusText?: string;
  responseHeaders?: Record<string, string>;
  responseData?: any;
  error?: string;
  success: boolean;
  duration: number;
}

export interface ApiTest {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  headers?: Record<string, string>;
}

const predefinedTests: ApiTest[] = [
  {
    id: 'user-roles',
    name: 'Get User Roles',
    url: '/users/me/roles',
    method: 'GET'
  },
  {
    id: 'tenants-list',
    name: 'List All Tenants',
    url: '/tenants',
    method: 'GET'
  },
  {
    id: 'cloud-providers',
    name: 'List Cloud Providers',
    url: '/cloud-providers',
    method: 'GET'
  },
  {
    id: 'project-types',
    name: 'List Project Types',
    url: '/project-types',
    method: 'GET'
  },
  {
    id: 'projects',
    name: 'List Projects',
    url: '/projects',
    method: 'GET'
  }
];

export const useApiTestRunner = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTests, setSelectedTests] = useState<string[]>(
    predefinedTests.map(test => test.id)
  );

  const runTest = async (test: ApiTest): Promise<TestResult> => {
    const startTime = performance.now();
    console.log(`🚀 Starting API test: ${test.method} ${test.url}`);
    
    try {
      // Get token from localStorage (should be set by the auth system)
      const token = localStorage.getItem('auth_token');
      
      // Create a direct axios instance for testing
      const axiosInstance = axios.create({
        baseURL: API_BASE_URL, // Use the configured API base URL
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(test.headers || {})
        },
      });
      
      console.log(`🔌 Using API base URL: ${API_BASE_URL}`);
      console.log(`🔑 Auth token ${token ? 'present' : 'not found'} for API request`);
      
      // Log the request details
      console.group(`📤 API Test Request: ${test.method} ${test.url}`);
      console.log('Request Headers:', axiosInstance.defaults.headers);
      console.log('Request Data:', test.data);
      console.groupEnd();
      
      // Make the request - use the appropriate method based on HTTP verb
      let response: AxiosResponse;
      
      switch (test.method) {
        case 'GET':
          response = await axiosInstance.get(test.url);
          break;
        case 'POST':
          response = await axiosInstance.post(test.url, test.data);
          break;
        case 'PUT':
          response = await axiosInstance.put(test.url, test.data);
          break;
        case 'PATCH':
          response = await axiosInstance.patch(test.url, test.data);
          break;
        case 'DELETE':
          response = await axiosInstance.delete(test.url);
          break;
        default:
          // Fallback to generic request
          response = await axiosInstance({
            url: test.url,
            method: test.method,
            data: test.data
          });
      }
      
      const endTime = performance.now();
      
      // Log the response details
      console.group(`📥 API Test Response: ${test.method} ${test.url}`);
      console.log('Status:', response.status, response.statusText);
      console.log('Response Headers:', response.headers);
      console.log('Response Data:', response.data);
      console.log('Duration:', (endTime - startTime).toFixed(2), 'ms');
      console.groupEnd();
      
      return {
        id: test.id,
        name: test.name,
        url: test.url,
        method: test.method,
        requestData: test.data,
        status: response.status,
        statusText: response.statusText,
        responseHeaders: response.headers as Record<string, string>,
        responseData: response.data,
        success: response.status >= 200 && response.status < 300,
        duration: endTime - startTime
      };
    } catch (error) {
      const endTime = performance.now();
      const axiosError = error as AxiosError;
      
      // Log the error details
      console.group(`❌ API Test Error: ${test.method} ${test.url}`);
      console.log('Error Message:', axiosError.message);
      console.log('Status:', axiosError.response?.status, axiosError.response?.statusText);
      console.log('Response Headers:', axiosError.response?.headers);
      console.log('Response Data:', axiosError.response?.data);
      console.log('Duration:', (endTime - startTime).toFixed(2), 'ms');
      console.groupEnd();
      
      return {
        id: test.id,
        name: test.name,
        url: test.url,
        method: test.method,
        requestData: test.data,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseHeaders: axiosError.response?.headers as Record<string, string>,
        responseData: axiosError.response?.data,
        error: axiosError.message,
        success: false,
        duration: endTime - startTime
      };
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    const testsToRun = predefinedTests.filter(test => 
      selectedTests.includes(test.id)
    );
    
    console.group('🧪 Running API Tests');
    console.log(`Selected tests: ${testsToRun.length} of ${predefinedTests.length}`);
    console.log('Tests to run:', testsToRun.map(t => t.name));
    console.groupEnd();
    
    const allResults: TestResult[] = [];
    
    for (const test of testsToRun) {
      try {
        const result = await runTest(test);
        allResults.push(result);
        setResults([...allResults]);
      } catch (error) {
        console.error(`Failed to run test ${test.name}:`, error);
        // Add a failed result
        const failedResult: TestResult = {
          id: test.id,
          name: test.name,
          url: test.url,
          method: test.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false,
          duration: 0
        };
        allResults.push(failedResult);
        setResults([...allResults]);
      }
    }
    
    // Log summary
    const successCount = allResults.filter(r => r.success).length;
    const failCount = allResults.length - successCount;
    
    console.group('📊 API Tests Summary');
    console.log(`Total: ${allResults.length}, Success: ${successCount}, Failed: ${failCount}`);
    console.log('Results:', allResults);
    console.groupEnd();
    
    setIsRunning(false);
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTests(prev => {
      if (prev.includes(testId)) {
        return prev.filter(id => id !== testId);
      } else {
        return [...prev, testId];
      }
    });
  };

  return {
    results,
    isRunning,
    runAllTests,
    predefinedTests,
    selectedTests,
    toggleTestSelection
  };
};