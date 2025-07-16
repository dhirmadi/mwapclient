# API Integration Documentation

## Overview

This document provides comprehensive documentation for API integration in the MWAP Client, including critical configuration requirements, endpoint specifications, and integration patterns.

## ⚠️ Critical Configuration Requirements

### Vite Proxy Configuration
**DO NOT MODIFY** - This configuration is tested and verified to work correctly:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'https://mwapss.shibari.photo/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

### API Client Configuration
**DO NOT MODIFY** - Base URL must remain `/api`:

```typescript
// src/shared/utils/api.ts
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',  // ← MUST remain '/api'
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});
```

## API Request Flow

### Step-by-Step Process
1. **Frontend Request**: Application makes API call using `/api` base URL
   ```typescript
   api.get('/users/me/roles')  // Becomes: /api/users/me/roles
   ```

2. **Vite Proxy Intercept**: Development server intercepts `/api/*` requests
   - Matches pattern: `/api/users/me/roles`
   - Target server: `https://mwapss.shibari.photo/api/v1`

3. **URL Rewriting**: Proxy removes `/api` prefix from path
   - Original: `/api/users/me/roles`
   - Rewritten: `/users/me/roles`

4. **Backend Request**: Final request sent to backend
   ```
   https://mwapss.shibari.photo/api/v1/users/me/roles
   ```

5. **Response Processing**: Backend returns wrapped response
   ```json
   {
     "success": true,
     "data": {
       "isSuperAdmin": true,
       "isTenantOwner": false,
       "userId": "google-oauth2|123456789",
       "tenantId": "tenant-id",
       "projectRoles": []
     }
   }
   ```

## API Endpoints (v1)

### Authentication Endpoints

#### Get User Roles
```typescript
GET /api/users/me/roles

Response:
{
  "success": true,
  "data": {
    "isSuperAdmin": boolean,
    "isTenantOwner": boolean,
    "userId": string,
    "tenantId": string,
    "projectRoles": ProjectRole[]
  }
}
```

### Tenant Management

#### Get Current Tenant
```typescript
GET /api/tenants/me

Response:
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "ownerId": string,
    "settings": {
      "allowPublicProjects": boolean,
      "maxProjects": number
    },
    "archived": boolean,
    "createdAt": string,
    "updatedAt": string
  }
}
```

#### Update Tenant
```typescript
PATCH /api/tenants/{tenantId}

Request Body:
{
  "name"?: string,
  "settings"?: {
    "allowPublicProjects"?: boolean,
    "maxProjects"?: number
  },
  "archived"?: boolean
}

Response:
{
  "success": true,
  "data": Tenant
}
```

### Integration Management

#### Core Integration Operations
```typescript
// List tenant integrations
GET /api/integrations

// Get integration details
GET /api/integrations/{integrationId}

// Create new integration
POST /api/integrations
{
  "name": string,
  "cloudProviderId": string,
  "description"?: string,
  "settings"?: object
}

// Update integration
PATCH /api/integrations/{integrationId}
{
  "name"?: string,
  "description"?: string,
  "settings"?: object
}

// Delete integration
DELETE /api/integrations/{integrationId}
```

#### OAuth Flow Management
```typescript
// Initiate OAuth flow
POST /api/integrations/{integrationId}/oauth/initiate
{
  "providerId": string
}

// Handle OAuth callback (internal)
POST /api/oauth/callback
{
  "code": string,
  "state": string
}
```

#### Token Management
```typescript
// Refresh OAuth token
POST /api/integrations/{integrationId}/tokens/refresh

// Check token health
GET /api/integrations/{integrationId}/tokens/health

// Response format for token operations
{
  "success": boolean,
  "data": {
    "tokenStatus": "active" | "expired" | "error",
    "expiresAt": string,
    "lastRefresh": string,
    "health": "healthy" | "warning" | "error"
  }
}
```

#### Integration Operations
```typescript
// Test integration connection
POST /api/integrations/{integrationId}/test

// Get integration usage statistics
GET /api/integrations/{integrationId}/usage

// Get integration health status
GET /api/integrations/{integrationId}/health
```

### Project Management

#### List Projects
```typescript
GET /api/projects

Response:
{
  "success": true,
  "data": Project[]
}
```

#### Get Project
```typescript
GET /api/projects/{projectId}

Response:
{
  "success": true,
  "data": {
    "id": string,
    "name": string,
    "description": string,
    "tenantId": string,
    "projectTypeId": string,
    "cloudProviderIntegrationId": string,
    "members": ProjectMember[],
    "settings": object,
    "archived": boolean,
    "createdAt": string,
    "updatedAt": string
  }
}
```

#### Create Project
```typescript
POST /api/projects

Request Body:
{
  "name": string,
  "description": string,
  "projectTypeId": string,
  "cloudProviderIntegrationId": string,
  "settings"?: object
}

Response:
{
  "success": true,
  "data": Project
}
```

#### Update Project
```typescript
PATCH /api/projects/{projectId}

Request Body:
{
  "name"?: string,
  "description"?: string,
  "settings"?: object,
  "archived"?: boolean
}

Response:
{
  "success": true,
  "data": Project
}
```

### Cloud Provider Management

#### List Cloud Providers
```typescript
GET /api/cloud-providers

Response:
{
  "success": true,
  "data": CloudProvider[]
}
```

#### Create Cloud Provider
```typescript
POST /api/cloud-providers

Request Body:
{
  "name": string,
  "type": "google-drive" | "dropbox" | "onedrive",
  "config": {
    "clientId": string,
    "clientSecret": string,
    "redirectUri": string
  }
}

Response:
{
  "success": true,
  "data": CloudProvider
}
```

#### Update Cloud Provider
```typescript
PATCH /api/cloud-providers/{providerId}

Request Body:
{
  "name"?: string,
  "config"?: object,
  "archived"?: boolean
}

Response:
{
  "success": true,
  "data": CloudProvider
}
```

### Project Type Management

#### List Project Types
```typescript
GET /api/project-types

Response:
{
  "success": true,
  "data": ProjectType[]
}
```

#### Create Project Type
```typescript
POST /api/project-types

Request Body:
{
  "name": string,
  "description": string,
  "schema": object,
  "defaultSettings": object
}

Response:
{
  "success": true,
  "data": ProjectType
}
```

#### Update Project Type
```typescript
PATCH /api/project-types/{typeId}

Request Body:
{
  "name"?: string,
  "description"?: string,
  "schema"?: object,
  "defaultSettings"?: object,
  "archived"?: boolean
}

Response:
{
  "success": true,
  "data": ProjectType
}
```

### File Management

#### List Files
```typescript
GET /api/projects/{projectId}/files?path={path}

Response:
{
  "success": true,
  "data": {
    "files": FileItem[],
    "folders": FolderItem[],
    "currentPath": string,
    "parentPath": string | null
  }
}
```

#### Get File Content
```typescript
GET /api/projects/{projectId}/files/{fileId}/content

Response: File content (binary or text)
```

## API Client Implementation

### Base API Client
```typescript
// src/shared/utils/api.ts
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor for authentication
apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessTokenSilently();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Extract data from wrapped response
    return response.data.success ? response.data.data : response.data;
  },
  (error) => {
    // Handle API errors
    const message = error.response?.data?.message || error.message;
    throw new Error(message);
  }
);

export const api = {
  get: <T>(url: string, params?: object): Promise<T> =>
    apiClient.get(url, { params }),
  
  post: <T>(url: string, data?: object): Promise<T> =>
    apiClient.post(url, data),
  
  patch: <T>(url: string, data?: object): Promise<T> =>
    apiClient.patch(url, data),
  
  delete: <T>(url: string): Promise<T> =>
    apiClient.delete(url),
};
```

### Resource-Based API Utilities
```typescript
// src/shared/utils/api-resources.ts
export const createResourceAPI = <T>(resourceName: string) => ({
  getAll: (params?: object): Promise<T[]> =>
    api.get(`/${resourceName}`, params),
  
  getById: (id: string): Promise<T> =>
    api.get(`/${resourceName}/${id}`),
  
  create: (data: Partial<T>): Promise<T> =>
    api.post(`/${resourceName}`, data),
  
  update: (id: string, data: Partial<T>): Promise<T> =>
    api.patch(`/${resourceName}/${id}`, data),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/${resourceName}/${id}`),
});

// Usage
export const tenantsAPI = createResourceAPI<Tenant>('tenants');
export const projectsAPI = createResourceAPI<Project>('projects');
export const cloudProvidersAPI = createResourceAPI<CloudProvider>('cloud-providers');
```

## React Query Integration

### Query Hook Patterns
```typescript
// src/shared/hooks/useQuery.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useResourceQuery = <T>(
  key: string[],
  endpoint: string,
  options: UseQueryOptions<T> = {}
) => {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get<T>(endpoint),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    ...options,
  });
};

// Feature-specific hooks
export const useProjects = (tenantId?: string) => {
  const endpoint = tenantId ? `/projects?tenantId=${tenantId}` : '/projects';
  return useResourceQuery<Project[]>(['projects', tenantId], endpoint);
};

export const useTenants = () => {
  return useResourceQuery<Tenant[]>(['tenants'], '/tenants');
};

export const useCloudProviders = () => {
  return useResourceQuery<CloudProvider[]>(['cloud-providers'], '/cloud-providers');
};
```

### Mutation Hook Patterns
```typescript
// src/shared/hooks/useMutation.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../utils/api';

export const useResourceMutation = <T, TVariables = Partial<T>>(
  endpoint: string,
  method: 'post' | 'patch' | 'delete',
  invalidateKeys: string[][]
) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (variables: TVariables) => {
      switch (method) {
        case 'post':
          return api.post<T>(endpoint, variables);
        case 'patch':
          return api.patch<T>(endpoint, variables);
        case 'delete':
          return api.delete<T>(endpoint);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    onSuccess: () => {
      invalidateKeys.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

// Usage examples
export const useCreateProject = () => {
  return useResourceMutation<Project>('/projects', 'post', [['projects']]);
};

export const useUpdateProject = (projectId: string) => {
  return useResourceMutation<Project>(
    `/projects/${projectId}`,
    'patch',
    [['projects'], ['projects', projectId]]
  );
};
```

## Error Handling

### API Error Types
```typescript
// src/shared/types/api.types.ts
export interface APIError {
  message: string;
  code?: string;
  status?: number;
  details?: object;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  error?: APIError;
}
```

### Error Handling Utilities
```typescript
// src/shared/utils/error-handling.ts
export const handleAPIError = (error: unknown): APIError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
  
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }
  
  return {
    message: 'An unknown error occurred',
  };
};

export const useAPIErrorHandler = () => {
  const { isSuperAdmin } = useAuth();
  
  return useCallback((error: unknown, context?: string) => {
    const apiError = handleAPIError(error);
    
    console.error(`API Error in ${context}:`, apiError);
    
    // Show user-friendly message
    const message = isSuperAdmin 
      ? apiError.message 
      : 'An error occurred. Please try again.';
    
    notifications.show({
      title: 'Error',
      message,
      color: 'red',
    });
    
    return apiError;
  }, [isSuperAdmin]);
};
```

## Authentication Integration

### Token Management
```typescript
// src/core/context/AuthContext.tsx
export const AuthProvider: React.FC = ({ children }) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  
  // Configure API client with token
  useEffect(() => {
    const setupAPIClient = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          console.error('Failed to get access token:', error);
        }
      } else {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    };
    
    setupAPIClient();
  }, [isAuthenticated, getAccessTokenSilently]);
  
  // Rest of AuthProvider implementation
};
```

## Special Cases & Considerations

### Vite Development vs Production
- **Development**: Vite proxy handles API routing
- **Production**: Static hosting requires server-side routing configuration
- **Environment Variables**: Different configurations for different environments

### CORS Handling
- **Development**: Handled by Vite proxy
- **Production**: Backend must configure CORS headers
- **Credentials**: Include credentials for authenticated requests

### Rate Limiting
- **Implementation**: Backend implements rate limiting
- **Client Handling**: Exponential backoff for rate limit errors
- **User Feedback**: Clear messaging for rate limit scenarios

### File Upload/Download
```typescript
// File upload with progress
export const uploadFile = async (
  projectId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  
  await apiClient.post(`/projects/${projectId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = (progressEvent.loaded / progressEvent.total) * 100;
        onProgress(progress);
      }
    },
  });
};

// File download
export const downloadFile = async (
  projectId: string,
  fileId: string,
  filename: string
): Promise<void> => {
  const response = await apiClient.get(
    `/projects/${projectId}/files/${fileId}/content`,
    { responseType: 'blob' }
  );
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
```

## Troubleshooting

### Common Issues
1. **404 Errors**: Usually indicate proxy configuration issues
2. **CORS Errors**: May indicate missing proxy or incorrect target
3. **Network Errors**: Could indicate backend server unavailability
4. **Authentication Errors**: Token expiration or invalid credentials

### Debugging Tools
```typescript
// API request/response logging
if (import.meta.env.DEV) {
  apiClient.interceptors.request.use(request => {
    console.log('API Request:', request);
    return request;
  });
  
  apiClient.interceptors.response.use(
    response => {
      console.log('API Response:', response);
      return response;
    },
    error => {
      console.error('API Error:', error);
      return Promise.reject(error);
    }
  );
}
```

---

**References**:
- Source: `vite.config.ts` proxy configuration
- Source: `src/shared/utils/api.ts` API client implementation
- Source: `docs/API_CONFIGURATION.md` critical configuration documentation
- Source: `docs/api/v3-openAPI-schema.md` API schema documentation
- Source: `docs/v3-api.md` complete API documentation