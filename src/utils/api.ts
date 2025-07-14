import axios, { AxiosError, AxiosInstance } from 'axios';
import { UserRolesResponse } from '../types/auth';
import { Project, ProjectCreate } from '../types/project';
import { Tenant, TenantCreate } from '../types/tenant';
import { 
  CloudProvider, 
  CloudProviderCreate, 
  CloudProviderUpdate,
  CloudProviderIntegration,
  CloudProviderIntegrationCreate
} from '../types/cloud-provider';
import { ProjectType } from '../types/project-type';
import { ProjectMember } from '../types/project';
import { File } from '../types/file';
import { handleApiResponse, handleApiError } from './apiResponseHandler';

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
    try {
      const response = await apiClient.get('/users/me/roles');
      return handleApiResponse<UserRolesResponse>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
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
  fetchTenants: debugApiCall('fetchTenants', async (includeArchived: boolean = false): Promise<Tenant[]> => {
    try {
      const url = includeArchived ? '/tenants?includeArchived=true' : '/tenants';
      const response = await apiClient.get(url);
      return handleApiResponse<Tenant[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      // For tenant fetching, return empty array on error to prevent UI breaks
      console.warn(`Failed to fetch tenants: ${apiError.message}`);
      return [];
    }
  }),
  
  // Fetch archived tenants specifically
  fetchArchivedTenants: debugApiCall('fetchArchivedTenants', async (): Promise<Tenant[]> => {
    try {
      const response = await apiClient.get('/tenants?includeArchived=true');
      const allTenants = handleApiResponse<Tenant[]>(response);
      // Filter to only include archived tenants
      return allTenants.filter((tenant: Tenant) => tenant.archived === true);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch archived tenants: ${apiError.message}`);
      return [];
    }
  }),
  
  fetchTenant: debugApiCall('fetchTenant', async (id?: string): Promise<Tenant> => {
    try {
      const url = id ? `/tenants/${id}` : '/tenants/me';
      const response = await apiClient.get(url);
      return handleApiResponse<Tenant>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  // Fetch a tenant by ID with enhanced error handling and data validation
  fetchTenantById: debugApiCall('fetchTenantById', async (id: string): Promise<Tenant> => {
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    
    try {
      // Try the direct endpoint first
      const response = await apiClient.get(`/tenants/${id}`);
      const tenant = handleApiResponse<Tenant>(response);
      
      // Ensure the tenant has an ID (either id or _id)
      if (!tenant.id && !tenant._id) {
        tenant.id = id;
      }
      
      return tenant;
    } catch (error) {
      const apiError = handleApiError(error);
      
      // If direct fetch fails, try fallback: fetch all tenants and filter
      try {
        console.log('Direct fetch failed, trying fallback method');
        const allTenantsResponse = await apiClient.get('/tenants');
        const allTenants = handleApiResponse<Tenant[]>(allTenantsResponse);
        
        const tenant = allTenants.find((t: Tenant) => (t.id === id || t._id === id));
        
        if (!tenant) {
          throw new Error(`Tenant with ID ${id} not found`);
        }
        
        // Ensure the tenant has an ID
        if (!tenant.id && !tenant._id) {
          tenant.id = id;
        }
        
        return tenant;
      } catch (fallbackError) {
        console.error('Both direct and fallback methods failed:', fallbackError);
        throw new Error(`Failed to fetch tenant ${id}: ${apiError.message}`);
      }
    }
  }),
  
  createTenant: debugApiCall('createTenant', async (data: TenantCreate): Promise<Tenant> => {
    try {
      const response = await apiClient.post('/tenants', data);
      return handleApiResponse<Tenant>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateTenant: debugApiCall('updateTenant', async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    try {
      const response = await apiClient.patch(`/tenants/${id}`, data);
      return handleApiResponse<Tenant>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      
      // If PATCH fails, try PUT as fallback
      try {
        console.log('PATCH failed, trying PUT method');
        // First get the current tenant data
        const currentTenant = await api.fetchTenantById(id);
        // Merge the current data with the updates
        const updatedData = { ...currentTenant, ...data };
        
        const putResponse = await apiClient.put(`/tenants/${id}`, updatedData);
        return handleApiResponse<Tenant>(putResponse);
      } catch (putError) {
        const putApiError = handleApiError(putError);
        throw new Error(`Failed to update tenant: ${putApiError.message}`);
      }
    }
  }),
  
  deleteTenant: debugApiCall('deleteTenant', async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  }),

  // Cloud Provider endpoints
  fetchCloudProviders: debugApiCall('fetchCloudProviders', async (): Promise<CloudProvider[]> => {
    try {
      const response = await apiClient.get('/cloud-providers');
      return handleApiResponse<CloudProvider[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch cloud providers: ${apiError.message}`);
      return [];
    }
  }),
  
  fetchCloudProviderById: debugApiCall('fetchCloudProviderById', async (id: string): Promise<CloudProvider> => {
    try {
      const response = await apiClient.get(`/cloud-providers/${id}`);
      return handleApiResponse<CloudProvider>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  createCloudProvider: debugApiCall('createCloudProvider', async (data: CloudProviderCreate): Promise<CloudProvider> => {
    try {
      const response = await apiClient.post('/cloud-providers', data);
      return handleApiResponse<CloudProvider>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateCloudProvider: debugApiCall('updateCloudProvider', async (id: string, data: CloudProviderUpdate): Promise<CloudProvider> => {
    try {
      const response = await apiClient.patch(`/cloud-providers/${id}`, data);
      return handleApiResponse<CloudProvider>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  deleteCloudProvider: debugApiCall('deleteCloudProvider', async (id: string): Promise<void> => {
    await apiClient.delete(`/cloud-providers/${id}`);
  }),

  // Tenant Integration endpoints
  fetchTenantIntegrations: debugApiCall('fetchTenantIntegrations', async (tenantId: string): Promise<CloudProviderIntegration[]> => {
    try {
      const response = await apiClient.get(`/tenants/${tenantId}/integrations`);
      return handleApiResponse<CloudProviderIntegration[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch tenant integrations: ${apiError.message}`);
      return [];
    }
  }),
  
  createTenantIntegration: debugApiCall('createTenantIntegration', async (tenantId: string, data: CloudProviderIntegrationCreate): Promise<CloudProviderIntegration> => {
    try {
      const response = await apiClient.post(`/tenants/${tenantId}/integrations`, data);
      return handleApiResponse<CloudProviderIntegration>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateTenantIntegration: debugApiCall('updateTenantIntegration', async (tenantId: string, integrationId: string, data: Partial<CloudProviderIntegration>): Promise<CloudProviderIntegration> => {
    try {
      const response = await apiClient.patch(`/tenants/${tenantId}/integrations/${integrationId}`, data);
      return handleApiResponse<CloudProviderIntegration>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  deleteTenantIntegration: debugApiCall('deleteTenantIntegration', async (tenantId: string, integrationId: string): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/integrations/${integrationId}`);
  }),

  // Project Type endpoints
  fetchProjectTypes: debugApiCall('fetchProjectTypes', async (): Promise<ProjectType[]> => {
    try {
      const response = await apiClient.get('/project-types');
      return handleApiResponse<ProjectType[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch project types: ${apiError.message}`);
      return [];
    }
  }),
  
  fetchProjectTypeById: debugApiCall('fetchProjectTypeById', async (id: string): Promise<ProjectType> => {
    try {
      const response = await apiClient.get(`/project-types/${id}`);
      return handleApiResponse<ProjectType>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  createProjectType: debugApiCall('createProjectType', async (data: Omit<ProjectType, '_id'>): Promise<ProjectType> => {
    try {
      const response = await apiClient.post('/project-types', data);
      return handleApiResponse<ProjectType>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateProjectType: debugApiCall('updateProjectType', async (id: string, data: Partial<ProjectType>): Promise<ProjectType> => {
    try {
      const response = await apiClient.patch(`/project-types/${id}`, data);
      return handleApiResponse<ProjectType>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  deleteProjectType: debugApiCall('deleteProjectType', async (id: string): Promise<void> => {
    await apiClient.delete(`/project-types/${id}`);
  }),

  // Project endpoints
  fetchProjects: debugApiCall('fetchProjects', async (): Promise<Project[]> => {
    try {
      const response = await apiClient.get('/projects');
      return handleApiResponse<Project[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch projects: ${apiError.message}`);
      return [];
    }
  }),
  
  fetchProjectById: debugApiCall('fetchProjectById', async (id: string): Promise<Project> => {
    try {
      const response = await apiClient.get(`/projects/${id}`);
      return handleApiResponse<Project>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  createProject: debugApiCall('createProject', async (data: ProjectCreate): Promise<Project> => {
    try {
      const response = await apiClient.post('/projects', data);
      return handleApiResponse<Project>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateProject: debugApiCall('updateProject', async (id: string, data: Partial<Project>): Promise<Project> => {
    try {
      const response = await apiClient.patch(`/projects/${id}`, data);
      return handleApiResponse<Project>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  deleteProject: debugApiCall('deleteProject', async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  }),

  // Project Members endpoints
  fetchProjectMembers: debugApiCall('fetchProjectMembers', async (projectId: string): Promise<ProjectMember[]> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/members`);
      return handleApiResponse<ProjectMember[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch project members: ${apiError.message}`);
      return [];
    }
  }),
  
  addProjectMember: debugApiCall('addProjectMember', async (projectId: string, data: { email: string; role: string }): Promise<ProjectMember> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/members`, data);
      return handleApiResponse<ProjectMember>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  updateProjectMember: debugApiCall('updateProjectMember', async (projectId: string, memberId: string, data: { role: string }): Promise<ProjectMember> => {
    try {
      const response = await apiClient.patch(`/projects/${projectId}/members/${memberId}`, data);
      return handleApiResponse<ProjectMember>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  removeProjectMember: debugApiCall('removeProjectMember', async (projectId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  }),

  // Project Files endpoints
  fetchProjectFiles: debugApiCall('fetchProjectFiles', async (projectId: string): Promise<File[]> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/files`);
      return handleApiResponse<File[]>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      console.warn(`Failed to fetch project files: ${apiError.message}`);
      return [];
    }
  }),
  
  uploadProjectFile: debugApiCall('uploadProjectFile', async (projectId: string, formData: FormData): Promise<File> => {
    try {
      const response = await apiClient.post(`/projects/${projectId}/files`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return handleApiResponse<File>(response);
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
  
  deleteProjectFile: debugApiCall('deleteProjectFile', async (projectId: string, fileId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/files/${fileId}`);
  }),
  
  getFileDownloadUrl: debugApiCall('getFileDownloadUrl', async (projectId: string, fileId: string): Promise<string> => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/files/${fileId}/download-url`);
      const data = handleApiResponse<{ url: string }>(response);
      return data.url;
    } catch (error) {
      const apiError = handleApiError(error);
      throw new Error(apiError.message);
    }
  }),
};

export default api;