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
  baseURL: import.meta.env.VITE_API_URL || 'https://mwapss.shibari.photo/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Redirect to login or refresh token
          window.location.href = '/login';
          break;
        case 403:
          // Handle forbidden
          window.location.href = '/unauthorized';
          break;
      }
    }
    return Promise.reject(error);
  }
);

// API client functions
const api = {
  // User endpoints
  fetchUserRoles: async (): Promise<UserRolesResponse> => {
    const response = await apiClient.get('/users/me/roles');
    return response.data;
  },

  // Tenant endpoints
  fetchTenant: async (): Promise<Tenant> => {
    const response = await apiClient.get('/tenants/me');
    return response.data;
  },
  
  fetchTenants: async (): Promise<Tenant[]> => {
    const response = await apiClient.get('/tenants');
    return response.data;
  },
  
  fetchTenantById: async (id: string): Promise<Tenant> => {
    const response = await apiClient.get(`/tenants/${id}`);
    return response.data;
  },
  
  createTenant: async (data: TenantCreate): Promise<Tenant> => {
    const response = await apiClient.post('/tenants', data);
    return response.data;
  },
  
  updateTenant: async (id: string, data: Partial<Tenant>): Promise<Tenant> => {
    const response = await apiClient.patch(`/tenants/${id}`, data);
    return response.data;
  },
  
  deleteTenant: async (id: string): Promise<void> => {
    await apiClient.delete(`/tenants/${id}`);
  },

  // Cloud Provider endpoints
  fetchCloudProviders: async (): Promise<CloudProvider[]> => {
    const response = await apiClient.get('/cloud-providers');
    return response.data;
  },
  
  fetchCloudProviderById: async (id: string): Promise<CloudProvider> => {
    const response = await apiClient.get(`/cloud-providers/${id}`);
    return response.data;
  },
  
  createCloudProvider: async (data: Omit<CloudProvider, '_id'>): Promise<CloudProvider> => {
    const response = await apiClient.post('/cloud-providers', data);
    return response.data;
  },
  
  updateCloudProvider: async (id: string, data: Partial<CloudProvider>): Promise<CloudProvider> => {
    const response = await apiClient.patch(`/cloud-providers/${id}`, data);
    return response.data;
  },
  
  deleteCloudProvider: async (id: string): Promise<void> => {
    await apiClient.delete(`/cloud-providers/${id}`);
  },

  // Tenant Integration endpoints
  fetchTenantIntegrations: async (tenantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/tenants/${tenantId}/integrations`);
    return response.data;
  },
  
  createTenantIntegration: async (tenantId: string, data: any): Promise<any> => {
    const response = await apiClient.post(`/tenants/${tenantId}/integrations`, data);
    return response.data;
  },
  
  deleteTenantIntegration: async (tenantId: string, integrationId: string): Promise<void> => {
    await apiClient.delete(`/tenants/${tenantId}/integrations/${integrationId}`);
  },

  // Project Type endpoints
  fetchProjectTypes: async (): Promise<ProjectType[]> => {
    const response = await apiClient.get('/project-types');
    return response.data;
  },
  
  fetchProjectTypeById: async (id: string): Promise<ProjectType> => {
    const response = await apiClient.get(`/project-types/${id}`);
    return response.data;
  },
  
  createProjectType: async (data: Omit<ProjectType, '_id'>): Promise<ProjectType> => {
    const response = await apiClient.post('/project-types', data);
    return response.data;
  },
  
  updateProjectType: async (id: string, data: Partial<ProjectType>): Promise<ProjectType> => {
    const response = await apiClient.patch(`/project-types/${id}`, data);
    return response.data;
  },
  
  deleteProjectType: async (id: string): Promise<void> => {
    await apiClient.delete(`/project-types/${id}`);
  },

  // Project endpoints
  fetchProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get('/projects');
    return response.data;
  },
  
  fetchProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },
  
  createProject: async (data: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },
  
  updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await apiClient.patch(`/projects/${id}`, data);
    return response.data;
  },
  
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  // Project Member endpoints
  fetchProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get(`/projects/${projectId}/members`);
    return response.data;
  },
  
  addProjectMember: async (projectId: string, data: ProjectMember): Promise<void> => {
    await apiClient.post(`/projects/${projectId}/members`, data);
  },
  
  updateProjectMember: async (projectId: string, userId: string, role: string): Promise<void> => {
    await apiClient.patch(`/projects/${projectId}/members/${userId}`, { role });
  },
  
  removeProjectMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },

  // File endpoints
  fetchProjectFiles: async (
    projectId: string, 
    params: { folder?: string; recursive?: boolean; fileTypes?: string[]; limit?: number; page?: number }
  ): Promise<File[]> => {
    const response = await apiClient.get(`/projects/${projectId}/files`, { params });
    return response.data;
  },
};

export default api;