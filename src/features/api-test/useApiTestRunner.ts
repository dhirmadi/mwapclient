import { useState } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import apiClient from '../../utils/api';

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
    
    try {
      const config: AxiosRequestConfig = {
        url: test.url,
        method: test.method,
        data: test.data,
        headers: test.headers
      };
      
      const response: AxiosResponse = await apiClient.request(config);
      
      const endTime = performance.now();
      
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
    
    for (const test of testsToRun) {
      const result = await runTest(test);
      setResults(prev => [...prev, result]);
    }
    
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