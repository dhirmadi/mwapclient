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
    // Handle both response formats: { success: true, data: {...} } or directly the object
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
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
    console.log('Tenants API response:', response.data);
    
    // Handle the specific response format: { success: true, data: Array(1) }
    if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.warn('Unexpected tenants response format:', response.data);
      return [];
    }
  }),
  
  fetchTenant: debugApiCall('fetchTenant', async (id?: string): Promise<Tenant> => {
    const url = id ? `/tenants/${id}` : '/tenants/me';
    const response = await apiClient.get(url);
    
    // Handle different response formats
    if (response.data && response.data.success === true && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }),
  
  // Fetch a tenant by ID with enhanced error handling and data validation
  fetchTenantById: debugApiCall('fetchTenantById', async (id: string): Promise<Tenant> => {
    if (!id) {
      throw new Error('Tenant ID is required');
    }
    
    console.log(`Fetching tenant by ID: ${id}`);
    
    try {
      // Try the direct endpoint
      const response = await apiClient.get(`/tenants/${id}`);
      console.log('Direct tenant response:', response.data);
      
      // Handle different response formats
      if (response.data && response.data.success === true && response.data.data) {
        const tenantData = response.data.data;
        console.log('Returning tenant from success.data format:', tenantData);
        
        // Validate the tenant data
        if (!tenantData.name) {
          console.warn('Tenant data is missing required fields:', tenantData);
        }
        
        // Ensure the tenant has an ID (either id or _id)
        if (!tenantData.id && !tenantData._id) {
          tenantData.id = id; // Use the requested ID if none is present
        }
        
        return tenantData;
      } else if (response.data && typeof response.data === 'object' && (response.data.id || response.data._id)) {
        const tenantData = response.data;
        console.log('Returning tenant from direct object format:', tenantData);
        
        // Validate the tenant data
        if (!tenantData.name) {
          console.warn('Tenant data is missing required fields:', tenantData);
        }
        
        return tenantData;
      } else {
        console.log('Unexpected response format, falling back to workaround');
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.log('Error fetching tenant by ID directly, falling back to workaround', error);
      
      try {
        // Fallback: Fetch all tenants and filter by ID
        const allTenantsResponse = await apiClient.get('/tenants');
        console.log('All tenants response:', allTenantsResponse.data);
        
        let allTenants = [];
        
        // Handle different response formats
        if (allTenantsResponse.data && allTenantsResponse.data.success === true && Array.isArray(allTenantsResponse.data.data)) {
          allTenants = allTenantsResponse.data.data;
        } else if (Array.isArray(allTenantsResponse.data)) {
          allTenants = allTenantsResponse.data;
        } else {
          throw new Error('Unexpected response format when fetching all tenants');
        }
        
        console.log('All tenants array:', allTenants);
        
        // Find the tenant with the matching ID
        const tenant = allTenants.find((t: any) => (t.id === id || t._id === id));
        console.log('Found tenant:', tenant);
        
        if (!tenant) {
          throw new Error(`Tenant with ID ${id} not found`);
        }
        
        // Ensure the tenant has an ID (either id or _id)
        if (!tenant.id && !tenant._id) {
          tenant.id = id; // Use the requested ID if none is present
        }
        
        return tenant;
      } catch (fallbackError) {
        console.error('Both direct and fallback methods failed:', fallbackError);
        
        // Last resort: Create a minimal tenant object with the ID
        // This is just to prevent UI errors, and should be replaced with real data ASAP
        console.warn('Creating minimal tenant object as last resort');
        return {
          id: id,
          _id: id,
          name: 'Loading...',
          ownerId: '',
          createdAt: new Date().toISOString(),
          settings: {}
        };
      }
    }
  }),
  
  createTenant: debugApiCall('createTenant', async (data: TenantCreate): Promise<Tenant> => {
    const response = await apiClient.post('/tenants', data);
    return response.data;
  }),
  
  updateTenant: debugApiCall('updateTenant', async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    try {
      const response = await apiClient.patch(`/tenants/${id}`, data);
      
      // Handle different response formats
      if (response.data && response.data.success === true && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      console.error('Error updating tenant directly, attempting workaround', error);
      
      // If the direct update fails, try to use the PUT method instead
      try {
        // First get the current tenant data
        const currentTenant = await api.fetchTenantById(id);
        
        // Merge the current data with the updates
        const updatedData = { ...currentTenant, ...data };
        
        // Try PUT instead of PATCH
        const putResponse = await apiClient.put(`/tenants/${id}`, updatedData);
        
        if (putResponse.data && putResponse.data.success === true && putResponse.data.data) {
          return putResponse.data.data;
        }
        return putResponse.data;
      } catch (putError) {
        console.error('Both PATCH and PUT methods failed for tenant update', putError);
        throw putError;
      }
    }
  }),
  
  deleteTenant: debugApiCall('deleteTenant', async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  }),

  // Cloud Provider endpoints
  fetchCloudProviders: debugApiCall('fetchCloudProviders', async (): Promise<CloudProvider[]> => {
    const response = await apiClient.get('/cloud-providers');
    // Handle both response formats: { success: true, data: [...] } or directly the array
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }),
  
  fetchCloudProviderById: debugApiCall('fetchCloudProviderById', async (id: string): Promise<CloudProvider> => {
    const response = await apiClient.get(`/cloud-providers/${id}`);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }),
  
  createCloudProvider: debugApiCall('createCloudProvider', async (data: CloudProviderCreate): Promise<CloudProvider> => {
    const response = await apiClient.post('/cloud-providers', data);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }),
  
  updateCloudProvider: debugApiCall('updateCloudProvider', async (id: string, data: CloudProviderUpdate): Promise<CloudProvider> => {
    const response = await apiClient.patch(`/cloud-providers/${id}`, data);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
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
    // Handle both response formats: { success: true, data: [...] } or directly the array
    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }),
  
  fetchProjectTypeById: debugApiCall('fetchProjectTypeById', async (id: string): Promise<ProjectType> => {
    const response = await apiClient.get(`/project-types/${id}`);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }),
  
  createProjectType: debugApiCall('createProjectType', async (data: Omit<ProjectType, '_id'>): Promise<ProjectType> => {
    const response = await apiClient.post('/project-types', data);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data;
  }),
  
  updateProjectType: debugApiCall('updateProjectType', async (id: string, data: Partial<ProjectType>): Promise<ProjectType> => {
    const response = await apiClient.patch(`/project-types/${id}`, data);
    // Handle both response formats
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
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