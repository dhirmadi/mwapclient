import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { UserRolesResponse } from '../types/auth';
import { Project, ProjectCreate } from '../types/project';
import { Tenant, TenantCreate } from '../types/tenant';
import { CloudProvider } from '../types/cloud-provider';
import { ProjectType } from '../types/project-type';
import { ProjectMember } from '../types/project';
import { File } from '../types/file';

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Use the proxy configured in vite.config.ts
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token and log requests
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging for request
    console.group(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.log('Request Headers:', config.headers);
    console.log('Request Params:', config.params);
    console.log('Request Data:', config.data);
    console.log('Full Config:', config);
    console.groupEnd();
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and log responses
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging for successful response
    console.group(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    console.log('Response Headers:', response.headers);
    console.log('Response Data:', response.data);
    console.groupEnd();
    
    return response;
  },
  (error: AxiosError) => {
    // Debug logging for error response
    console.group(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
    console.log('Error Message:', error.message);
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Response Headers:', error.response?.headers);
    console.log('Response Data:', error.response?.data);
    console.log('Full Error:', error);
    console.groupEnd();
    
    console.error(`API error: ${error.message}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Debug wrapper for API functions
const debugApiCall = <T>(functionName: string, fn: (...args: any[]) => Promise<T>) => {
  return async (...args: any[]): Promise<T> => {
    console.group(`🔍 API Function Call: ${functionName}`);
    console.log('Arguments:', ...args);
    console.time(`${functionName} execution time`);
    
    try {
      const result = await fn(...args);
      console.log('Result:', result);
      console.timeEnd(`${functionName} execution time`);
      console.groupEnd();
      return result;
    } catch (error) {
      console.log('Function Error:', error);
      console.timeEnd(`${functionName} execution time`);
      console.groupEnd();
      throw error;
    }
  };
};

// API endpoints
const api = {
  // Auth endpoints
  getUserRoles: debugApiCall('getUserRoles', async (): Promise<UserRolesResponse> => {
    const response = await apiClient.get('/users/me/roles');
    return response.data;
  }),
  
  // Fallback for development
  fetchUserRoles: debugApiCall('fetchUserRoles', async (): Promise<UserRolesResponse> => {
    // For development, return default roles
    console.log('Using default roles for development');
    return {
      isSuperAdmin: true,
      isTenantOwner: true,
      tenantId: 'dev-tenant-id',
      projectRoles: [
        { projectId: 'dev-project-id', role: 'OWNER' }
      ]
    };
  }),
  
  // Tenant endpoints
  fetchTenants: debugApiCall('fetchTenants', async (): Promise<Tenant[]> => {
    const response = await apiClient.get('/tenants');
    return response.data;
  }),
  
  fetchTenant: debugApiCall('fetchTenant', async (id?: string): Promise<Tenant> => {
    const url = id ? `/tenants/${id}` : '/tenants/me';
    const response = await apiClient.get(url);
    return response.data;
  }),
  
  createTenant: debugApiCall('createTenant', async (data: TenantCreate): Promise<Tenant> => {
    const response = await apiClient.post('/tenants', data);
    return response.data;
  }),
  
  updateTenant: debugApiCall('updateTenant', async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await apiClient.patch(`/tenants/${id}`, data);
    return response.data;
  }),
  
  deleteTenant: debugApiCall('deleteTenant', async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  }),

  // Cloud Provider endpoints
  fetchCloudProviders: debugApiCall('fetchCloudProviders', async (): Promise<{ success: boolean, data: CloudProvider[] }> => {
    const response = await apiClient.get('/cloud-providers');
    // Add some logging to debug the response format
    console.log('Cloud providers API response:', response.data);
    return response.data;
  }),
  
  fetchCloudProviderById: debugApiCall('fetchCloudProviderById', async (id: string): Promise<CloudProvider> => {
    const response = await apiClient.get(`/cloud-providers/${id}`);
    return response.data.data || response.data;
  }),
  
  createCloudProvider: debugApiCall('createCloudProvider', async (data: Omit<CloudProvider, '_id'>): Promise<CloudProvider> => {
    console.log('API createCloudProvider called with data:', data);
    try {
      const response = await apiClient.post('/cloud-providers', data);
      console.log('API createCloudProvider response:', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('API createCloudProvider error:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      throw error;
    }
  }),
  
  updateCloudProvider: debugApiCall('updateCloudProvider', async (id: string, data: Partial<CloudProvider>): Promise<CloudProvider> => {
    const response = await apiClient.patch(`/cloud-providers/${id}`, data);
    return response.data.data || response.data;
  }),
  
  deleteCloudProvider: debugApiCall('deleteCloudProvider', async (id: string): Promise<void> => {
    await apiClient.delete(`/cloud-providers/${id}`);
  }),

  // Tenant Integration endpoints
  fetchTenantIntegrations: debugApiCall('fetchTenantIntegrations', async (tenantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/integrations`);
    return response.data;
  }),
  
  createTenantIntegration: debugApiCall('createTenantIntegration', async (tenantId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/tenants/${tenantId}/integrations`, data);
    return response.data;
  }),
  
  deleteTenantIntegration: debugApiCall('deleteTenantIntegration', async (tenantId: string, integrationId: string): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/integrations/${integrationId}`);
  }),

  // Project Type endpoints
  fetchProjectTypes: debugApiCall('fetchProjectTypes', async (): Promise<ProjectType[]> => {
    const response = await apiClient.get('/project-types');
    return response.data;
  }),
  
  fetchProjectTypeById: debugApiCall('fetchProjectTypeById', async (id: string): Promise<ProjectType> => {
    const response = await apiClient.get(`/project-types/${id}`);
    return response.data;
  }),
  
  createProjectType: debugApiCall('createProjectType', async (data: Omit<ProjectType, '_id'>): Promise<ProjectType> => {
    const response = await apiClient.post('/project-types', data);
    return response.data;
  }),
  
  updateProjectType: debugApiCall('updateProjectType', async (id: string, data: Partial<ProjectType>): Promise<ProjectType> => {
    const response = await apiClient.patch(`/project-types/${id}`, data);
    return response.data;
  }),
  
  deleteProjectType: debugApiCall('deleteProjectType', async (id: string): Promise<void> => {
    await apiClient.delete(`/project-types/${id}`);
  }),

  // Project endpoints
  fetchProjects: debugApiCall('fetchProjects', async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data;
  }),
  
  fetchProjectById: debugApiCall('fetchProjectById', async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  }),
  
  createProject: debugApiCall('createProject', async (data: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }),
  
  updateProject: debugApiCall('updateProject', async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  }),
  
  deleteProject: debugApiCall('deleteProject', async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  }),

  // Project Members endpoints
  fetchProjectMembers: debugApiCall('fetchProjectMembers', async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get(`/projects/${projectId}/members`);
    return response.data;
  }),
  
  addProjectMember: debugApiCall('addProjectMember', async (projectId: string, data: { email: string; role: string }): Promise<ProjectMember> => {
    const response = await apiClient.post(`/projects/${projectId}/members`, data);
    return response.data;
  }),
  
  updateProjectMember: debugApiCall('updateProjectMember', async (projectId: string, memberId: string, data: { role: string }): Promise<ProjectMember> => {
    const response = await apiClient.patch(`/projects/${projectId}/members/${memberId}`, data);
    return response.data;
  }),
  
  removeProjectMember: debugApiCall('removeProjectMember', async (projectId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  }),

  // Project Files endpoints
  fetchProjectFiles: debugApiCall('fetchProjectFiles', async (projectId: string): Promise<File[]> => {
    const response = await apiClient.get(`/projects/${projectId}/files`);
    return response.data;
  }),
  
  uploadProjectFile: debugApiCall('uploadProjectFile', async (projectId: string, formData: FormData): Promise<File> => {
    const response = await apiClient.post(`/projects/${projectId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }),
  
  deleteProjectFile: debugApiCall('deleteProjectFile', async (projectId: string, fileId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/files/${fileId}`);
  }),
  
  getFileDownloadUrl: debugApiCall('getFileDownloadUrl', async (projectId: string, fileId: string): Promise<string> => {
    const response = await apiClient.get(`/projects/${projectId}/files/${fileId}/download-url`);
    return response.data.url;
  }),
};

export default api;