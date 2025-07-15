# Features Documentation

## Overview

The MWAP Client provides a comprehensive set of features for managing multi-tenant cloud-based projects. This document describes each feature in detail, including functionality, user flows, and technical implementation.

## Feature Overview

### Core Features
1. **[Authentication & Authorization](#authentication--authorization)** - Secure user authentication and role-based access control
2. **[Tenant Management](#tenant-management)** - Organization-level management and settings
3. **[Project Management](#project-management)** - Project creation, configuration, and lifecycle management
4. **[Cloud Provider Integration](#cloud-provider-integration)** - Connect and manage cloud storage providers
5. **[Project Type Management](#project-type-management)** - Define and manage project templates
6. **[File Management](#file-management)** - Browse and manage files across cloud providers
7. **[User Management](#user-management)** - Manage users and their roles within projects

### Administrative Features
- **System Administration** - Platform-wide configuration and monitoring
- **Analytics & Reporting** - Usage analytics and system metrics
- **Audit Logging** - Track user actions and system events

## Authentication & Authorization

### Description
Secure authentication system using Auth0 with comprehensive role-based access control.

### Key Functionality
- **Single Sign-On (SSO)**: Auth0 Universal Login with social providers
- **Multi-Factor Authentication (MFA)**: Optional MFA for enhanced security
- **Role-Based Access Control**: Three-tier permission system
- **Session Management**: Secure token handling and automatic refresh

### User Roles
1. **SuperAdmin**: Platform-wide access and control
2. **Tenant Owner**: Organization-level management
3. **Project Member**: Project-specific access (Owner/Deputy/Member)

### User Flows
```
Login Flow:
User → Login Page → Auth0 Universal Login → Authentication → Role Fetching → Dashboard

Logout Flow:
User → Logout Action → Token Cleanup → Auth0 Logout → Redirect to Home

Role Check Flow:
Component Render → Auth Ready Check → Role Validation → Conditional UI Rendering
```

### Technical Implementation
- **Auth0 SDK**: Authorization Code + PKCE flow
- **Token Storage**: Memory-based (secure)
- **API Integration**: JWT tokens in Authorization headers
- **Race Condition Prevention**: `isReady` state coordination

### API Endpoints
- `GET /api/users/me/roles` - Fetch user roles and permissions
- `POST /api/auth/logout` - Logout and invalidate session

---

## Tenant Management

### Description
Organization-level management allowing tenant owners to configure their organization settings, manage cloud integrations, and oversee projects.

### Key Functionality
- **Tenant Configuration**: Organization name, settings, and preferences
- **Cloud Provider Integrations**: Connect and manage cloud storage providers
- **Project Oversight**: View and manage all tenant projects
- **Member Management**: Invite and manage organization members
- **Settings Management**: Configure tenant-specific settings

### Features by Role

#### SuperAdmin
- View all tenants across the platform
- Create new tenant organizations
- Archive/unarchive tenants
- Modify tenant settings and configurations
- Access tenant analytics and metrics

#### Tenant Owner
- View and edit their tenant information
- Manage tenant settings and preferences
- Create and configure cloud provider integrations
- Oversee all projects within their tenant
- Invite and manage project members

### User Flows
```
Tenant Creation (SuperAdmin):
SuperAdmin Dashboard → Tenant Management → Create Tenant → Form Submission → Tenant Created

Tenant Configuration (Tenant Owner):
Tenant Dashboard → Settings → Edit Configuration → Save Changes → Updated Tenant

Cloud Integration Setup:
Tenant Settings → Integrations → Add Provider → OAuth Flow → Integration Created
```

### Technical Implementation
```typescript
// Tenant management hooks
export const useTenants = () => {
  return useQuery({
    queryKey: ['tenants'],
    queryFn: () => api.get('/tenants'),
    enabled: isSuperAdmin, // Only for SuperAdmins
  });
};

export const useCurrentTenant = () => {
  return useQuery({
    queryKey: ['tenants', 'me'],
    queryFn: () => api.get('/tenants/me'),
    enabled: isAuthenticated,
  });
};
```

### API Endpoints
- `GET /api/tenants` - List all tenants (SuperAdmin only)
- `GET /api/tenants/me` - Get current user's tenant
- `POST /api/tenants` - Create new tenant (SuperAdmin only)
- `PATCH /api/tenants/{tenantId}` - Update tenant
- `GET /api/tenants/{tenantId}/integrations` - List tenant integrations
- `POST /api/tenants/{tenantId}/integrations` - Create integration
- `PATCH /api/tenants/{tenantId}/integrations/{integrationId}` - Update integration
- `DELETE /api/tenants/{tenantId}/integrations/{integrationId}` - Delete integration

---

## Project Management

### Description
Comprehensive project lifecycle management including creation, configuration, member management, and resource access.

### Key Functionality
- **Project Creation**: Create projects with specific types and cloud integrations
- **Project Configuration**: Manage project settings and parameters
- **Member Management**: Add, remove, and manage project members with roles
- **Project Lifecycle**: Archive, unarchive, and delete projects
- **Resource Access**: Access project files and resources through cloud integrations

### Project Roles
- **Project Owner**: Full project control and management
- **Project Deputy**: Edit project details and manage members
- **Project Member**: View and interact with project resources

### Features by Role

#### SuperAdmin
- View all projects across all tenants
- Archive/unarchive any project
- Access project analytics and metrics
- Override project permissions when necessary

#### Tenant Owner
- Create new projects within their tenant
- Manage all projects in their tenant
- Assign project owners and members
- Configure project settings and integrations

#### Project Owner
- Full control over their specific project
- Edit project details and settings
- Manage project members and their roles
- Archive/unarchive the project
- Access all project resources

#### Project Deputy
- Edit project details (limited)
- Manage project members (cannot change owners)
- Access all project resources
- Cannot archive project or change critical settings

#### Project Member
- View project details and information
- Access project files and resources
- Cannot edit project or manage members

### User Flows
```
Project Creation:
Tenant Dashboard → Create Project → Select Type & Integration → Configure Settings → Add Members → Create Project

Project Member Management:
Project Settings → Members → Add Member → Select Role → Send Invitation → Member Added

Project Resource Access:
Project Dashboard → Files → Browse Cloud Storage → Select File → View/Download
```

### Technical Implementation
```typescript
// Project management hooks
export const useProjects = (tenantId?: string) => {
  const endpoint = tenantId ? `/projects?tenantId=${tenantId}` : '/projects';
  return useQuery({
    queryKey: ['projects', tenantId],
    queryFn: () => api.get(endpoint),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectData) => api.post('/projects', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};
```

### API Endpoints
- `GET /api/projects` - List projects (filtered by user permissions)
- `GET /api/projects/{projectId}` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/{projectId}` - Update project
- `DELETE /api/projects/{projectId}` - Delete project
- `GET /api/projects/{projectId}/members` - List project members
- `POST /api/projects/{projectId}/members` - Add project member
- `PATCH /api/projects/{projectId}/members/{memberId}` - Update member role
- `DELETE /api/projects/{projectId}/members/{memberId}` - Remove member

---

## Cloud Provider Integration

### Description
Seamless integration with multiple cloud storage providers, enabling unified access to files and resources across different platforms.

### Supported Providers
- **Google Drive**: Full integration with Google Drive API
- **Dropbox**: Complete Dropbox API integration
- **OneDrive**: Microsoft OneDrive integration
- **Amazon S3**: AWS S3 bucket integration (planned)

### Key Functionality
- **OAuth Integration**: Secure OAuth 2.0 flow for provider authentication
- **Token Management**: Automatic token refresh and renewal
- **Unified File Access**: Browse files across different providers with consistent interface
- **Provider Configuration**: Configure provider settings and permissions
- **Integration Management**: Add, update, and remove provider integrations

### Features by Role

#### SuperAdmin
- Manage global cloud provider configurations
- Add new cloud provider types to the system
- Configure provider-specific settings and limitations
- Monitor provider usage and performance

#### Tenant Owner
- Create cloud provider integrations for their tenant
- Configure integration settings and permissions
- Manage OAuth tokens and refresh cycles
- Monitor integration usage within their tenant

### User Flows
```
Provider Integration Setup:
Tenant Settings → Integrations → Add Provider → Select Provider Type → OAuth Flow → Configure Settings → Integration Created

OAuth Token Refresh:
System Background → Token Expiry Check → Refresh Token Request → Update Stored Token → Continue Operation

File Access Through Integration:
Project Dashboard → Files → Select Integration → Browse Provider Files → Access File
```

### Technical Implementation
```typescript
// Cloud provider integration hooks
export const useCloudProviders = () => {
  return useQuery({
    queryKey: ['cloud-providers'],
    queryFn: () => api.get('/cloud-providers'),
    enabled: isSuperAdmin,
  });
};

export const useTenantIntegrations = (tenantId: string) => {
  return useQuery({
    queryKey: ['tenants', tenantId, 'integrations'],
    queryFn: () => api.get(`/tenants/${tenantId}/integrations`),
  });
};

export const useRefreshIntegrationToken = () => {
  return useMutation({
    mutationFn: ({ tenantId, integrationId }: RefreshTokenParams) =>
      api.post(`/oauth/tenants/${tenantId}/integrations/${integrationId}/refresh`),
  });
};
```

### OAuth Flow Implementation
```typescript
// OAuth callback handling
export const OAuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');
      
      if (code && state) {
        try {
          // Exchange code for tokens
          await api.post('/oauth/callback', { code, state });
          navigate('/tenant/integrations', { 
            state: { message: 'Integration successful' }
          });
        } catch (error) {
          navigate('/tenant/integrations', { 
            state: { error: 'Integration failed' }
          });
        }
      }
    };
    
    handleOAuthCallback();
  }, [location, navigate]);
  
  return <LoadingSpinner message="Completing integration..." />;
};
```

### API Endpoints
- `GET /api/cloud-providers` - List available cloud providers
- `POST /api/cloud-providers` - Create new cloud provider (SuperAdmin)
- `PATCH /api/cloud-providers/{providerId}` - Update cloud provider
- `GET /api/tenants/{tenantId}/integrations` - List tenant integrations
- `POST /api/tenants/{tenantId}/integrations` - Create integration
- `PATCH /api/tenants/{tenantId}/integrations/{integrationId}` - Update integration
- `DELETE /api/tenants/{tenantId}/integrations/{integrationId}` - Delete integration
- `POST /api/oauth/tenants/{tenantId}/integrations/{integrationId}/refresh` - Refresh OAuth token

---

## Project Type Management

### Description
Define and manage project templates that standardize project creation and configuration across the platform.

### Key Functionality
- **Template Definition**: Create reusable project templates
- **Schema Configuration**: Define project-specific data schemas
- **Default Settings**: Set default configurations for project types
- **Validation Rules**: Implement validation for project type compliance
- **Type Management**: Archive, update, and maintain project types

### Features by Role

#### SuperAdmin
- Create new project types
- Edit existing project type configurations
- Define schemas and validation rules
- Set default settings and parameters
- Archive/unarchive project types
- Monitor project type usage across tenants

### User Flows
```
Project Type Creation:
SuperAdmin Dashboard → Project Types → Create Type → Define Schema → Set Defaults → Create Type

Project Type Usage:
Create Project → Select Project Type → Auto-populate Settings → Customize if Needed → Create Project
```

### Technical Implementation
```typescript
// Project type management hooks
export const useProjectTypes = () => {
  return useQuery({
    queryKey: ['project-types'],
    queryFn: () => api.get('/project-types'),
  });
};

export const useCreateProjectType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectTypeData) => api.post('/project-types', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-types'] });
    },
  });
};
```

### Schema Definition Example
```typescript
// Project type schema structure
interface ProjectTypeSchema {
  id: string;
  name: string;
  description: string;
  schema: {
    properties: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean' | 'object' | 'array';
        required?: boolean;
        default?: any;
        validation?: {
          min?: number;
          max?: number;
          pattern?: string;
          enum?: string[];
        };
      };
    };
  };
  defaultSettings: {
    [key: string]: any;
  };
}
```

### API Endpoints
- `GET /api/project-types` - List all project types
- `GET /api/project-types/{typeId}` - Get project type details
- `POST /api/project-types` - Create new project type (SuperAdmin)
- `PATCH /api/project-types/{typeId}` - Update project type (SuperAdmin)
- `DELETE /api/project-types/{typeId}` - Delete project type (SuperAdmin)

---

## File Management

### Description
Unified file management system that provides seamless access to files stored across different cloud providers through project integrations.

### Key Functionality
- **Unified File Browser**: Browse files across different cloud providers with consistent interface
- **File Operations**: View, download, and manage files (read-only access)
- **Folder Navigation**: Navigate through folder structures
- **File Metadata**: View file properties and metadata
- **Search Functionality**: Search for files across integrated providers
- **File Preview**: Preview supported file types

### Features by Role

#### All Project Members
- Browse project files through cloud integrations
- View file metadata and properties
- Download files from cloud storage
- Navigate folder structures
- Search for specific files

### User Flows
```
File Browsing:
Project Dashboard → Files → Select Integration → Browse Folders → Select File → View Details

File Download:
File Browser → Select File → Download Action → File Downloaded to Local System

File Search:
File Browser → Search Input → Enter Query → View Results → Select File
```

### Technical Implementation
```typescript
// File management hooks
export const useProjectFiles = (projectId: string, path: string = '/') => {
  return useQuery({
    queryKey: ['projects', projectId, 'files', path],
    queryFn: () => api.get(`/projects/${projectId}/files?path=${encodeURIComponent(path)}`),
    enabled: !!projectId,
  });
};

export const useFileContent = (projectId: string, fileId: string) => {
  return useQuery({
    queryKey: ['projects', projectId, 'files', fileId, 'content'],
    queryFn: () => api.get(`/projects/${projectId}/files/${fileId}/content`),
    enabled: !!projectId && !!fileId,
  });
};
```

### File Browser Component
```typescript
// File browser implementation
export const FileBrowser: React.FC<{ projectId: string }> = ({ projectId }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const { data: fileData, isLoading, error } = useProjectFiles(projectId, currentPath);
  
  const handleFolderClick = (folderPath: string) => {
    setCurrentPath(folderPath);
  };
  
  const handleFileDownload = async (fileId: string, fileName: string) => {
    try {
      const response = await api.get(
        `/projects/${projectId}/files/${fileId}/content`,
        { responseType: 'blob' }
      );
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  
  return (
    <div className="file-browser">
      <Breadcrumbs path={currentPath} onNavigate={setCurrentPath} />
      
      <div className="file-grid">
        {fileData?.folders.map(folder => (
          <FolderItem
            key={folder.id}
            folder={folder}
            onClick={() => handleFolderClick(folder.path)}
          />
        ))}
        
        {fileData?.files.map(file => (
          <FileItem
            key={file.id}
            file={file}
            onDownload={() => handleFileDownload(file.id, file.name)}
          />
        ))}
      </div>
    </div>
  );
};
```

### API Endpoints
- `GET /api/projects/{projectId}/files` - List files and folders
- `GET /api/projects/{projectId}/files/{fileId}` - Get file metadata
- `GET /api/projects/{projectId}/files/{fileId}/content` - Get file content
- `GET /api/projects/{projectId}/files/search` - Search files

---

## User Management

### Description
Comprehensive user management system for handling user accounts, roles, and permissions within the platform.

### Key Functionality
- **User Profiles**: Manage user profile information and preferences
- **Role Assignment**: Assign and manage user roles within projects and tenants
- **Permission Management**: Control user access to features and resources
- **User Invitations**: Invite new users to join projects and organizations
- **Account Management**: Handle user account lifecycle and settings

### Features by Role

#### SuperAdmin
- View all users across the platform
- Manage user roles and permissions
- Access user analytics and activity logs
- Handle user account issues and support

#### Tenant Owner
- Invite users to their tenant
- Manage user roles within their tenant
- View tenant user activity and analytics

#### Project Owner
- Invite users to their projects
- Manage project member roles
- Remove users from projects

### User Flows
```
User Invitation:
Project Settings → Members → Invite User → Enter Email → Select Role → Send Invitation

Role Management:
Project Members → Select User → Change Role → Confirm Change → Role Updated

User Profile Management:
User Menu → Profile → Edit Information → Save Changes → Profile Updated
```

### Technical Implementation
```typescript
// User management hooks
export const useProjectMembers = (projectId: string) => {
  return useQuery({
    queryKey: ['projects', projectId, 'members'],
    queryFn: () => api.get(`/projects/${projectId}/members`),
  });
};

export const useInviteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, email, role }: InviteUserParams) =>
      api.post(`/projects/${projectId}/members`, { email, role }),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'members'] });
    },
  });
};
```

### API Endpoints
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile
- `GET /api/projects/{projectId}/members` - List project members
- `POST /api/projects/{projectId}/members` - Invite user to project
- `PATCH /api/projects/{projectId}/members/{memberId}` - Update member role
- `DELETE /api/projects/{projectId}/members/{memberId}` - Remove member

---

## System Administration

### Description
Platform-wide administration features available to SuperAdmins for managing the entire MWAP system.

### Key Functionality
- **Platform Configuration**: Configure system-wide settings and parameters
- **Tenant Management**: Oversee all tenant organizations
- **User Administration**: Manage users across all tenants
- **System Monitoring**: Monitor platform performance and usage
- **Analytics Dashboard**: View system-wide analytics and metrics

### Features (SuperAdmin Only)
- **Global Settings**: Configure platform-wide settings
- **Tenant Oversight**: Monitor and manage all tenant organizations
- **User Analytics**: View user activity and engagement metrics
- **System Health**: Monitor system performance and issues
- **Audit Logs**: Access comprehensive audit trails

### Technical Implementation
```typescript
// System administration hooks
export const useSystemAnalytics = () => {
  return useQuery({
    queryKey: ['system', 'analytics'],
    queryFn: () => api.get('/admin/analytics'),
    enabled: isSuperAdmin,
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: () => api.get('/admin/health'),
    enabled: isSuperAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};
```

---

## Feature Status & Roadmap

### Completed Features ✅
- Authentication & Authorization (Auth0 integration, RBAC)
- Tenant Management (CRUD operations, settings)
- Project Management (Full lifecycle management)
- Cloud Provider Integration (Google Drive, Dropbox, OneDrive)
- Project Type Management (Template system)
- File Management (Read-only access, unified browser)
- User Management (Invitations, role management)

### In Development 🚧
- Advanced File Operations (Upload, edit, delete)
- Real-time Collaboration Features
- Enhanced Analytics Dashboard
- Mobile Application Support

### Planned Features 📋
- Amazon S3 Integration
- Advanced Search and Filtering
- Workflow Automation
- API Rate Limiting Dashboard
- Advanced Audit Logging
- Multi-language Support
- Progressive Web App Features

---

**References**:
- Source: `src/features/` directory structure and implementation
- Source: `docs/UserFlowSpecification.md` user flow documentation
- Source: API endpoint implementations in feature hooks
- Source: Component implementations in feature pages
- Source: `API_V3_MIGRATION_SUMMARY.md` for API compatibility information