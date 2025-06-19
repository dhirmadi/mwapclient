# MWAP Permission System

## Overview

The MWAP application uses a comprehensive permission system to control access to various features and resources. This document explains how the permission system works and how to use it in your components.

## Permission Types

Permissions are defined in the `src/utils/permissions.ts` file as an enum:

```typescript
export enum Permission {
  // Tenant Management
  MANAGE_TENANTS = 'MANAGE_TENANTS',
  VIEW_TENANTS = 'VIEW_TENANTS',
  
  // Cloud Provider Management
  MANAGE_CLOUD_PROVIDERS = 'MANAGE_CLOUD_PROVIDERS',
  VIEW_CLOUD_PROVIDERS = 'VIEW_CLOUD_PROVIDERS',
  
  // Project Type Management
  MANAGE_PROJECT_TYPES = 'MANAGE_PROJECT_TYPES',
  VIEW_PROJECT_TYPES = 'VIEW_PROJECT_TYPES',
  
  // Tenant Settings
  MANAGE_TENANT_SETTINGS = 'MANAGE_TENANT_SETTINGS',
  VIEW_TENANT_SETTINGS = 'VIEW_TENANT_SETTINGS',
  
  // Tenant Integrations
  MANAGE_TENANT_INTEGRATIONS = 'MANAGE_TENANT_INTEGRATIONS',
  VIEW_TENANT_INTEGRATIONS = 'VIEW_TENANT_INTEGRATIONS',
  
  // Project Management
  CREATE_PROJECTS = 'CREATE_PROJECTS',
  VIEW_PROJECT = 'VIEW_PROJECT',
  EDIT_PROJECT = 'EDIT_PROJECT',
  MANAGE_PROJECT_MEMBERS = 'MANAGE_PROJECT_MEMBERS',
}
```

## Role-Based Permissions

Permissions are assigned based on user roles:

1. **SuperAdmin**: Has all permissions
2. **TenantOwner**: Has tenant-specific permissions
3. **Project Roles**: Project-specific permissions based on role (OWNER, DEPUTY, MEMBER)

## Using Permissions in Components

### 1. Using the `usePermissions` Hook

```typescript
import { useAuth } from '../context/AuthContext';
import { usePermissions, Permission } from '../utils/permissions';

const MyComponent = () => {
  const { roles } = useAuth();
  const permissions = usePermissions(roles);
  
  // Check if user has a specific permission
  const canManageTenants = permissions.can(Permission.MANAGE_TENANTS);
  
  // Check if user is a SuperAdmin
  const isSuperAdmin = permissions.isSuperAdmin();
  
  // Check if user is a TenantOwner
  const isTenantOwner = permissions.isTenantOwner();
  
  // Check if user has a specific role in a project
  const isProjectOwner = permissions.canInProject('project-id', 'OWNER');
  
  return (
    <div>
      {canManageTenants && <button>Manage Tenants</button>}
    </div>
  );
};
```

### 2. Using the `ProtectedRoute` Component

```tsx
// In AppRouter.tsx
<Route 
  element={<ProtectedRoute requiredPermissions={[Permission.MANAGE_TENANTS]} />}
>
  <Route path="/admin/tenants" element={<TenantList />} />
</Route>

// For project-specific routes
<Route 
  element={<ProtectedRoute 
    requiredPermissions={[Permission.EDIT_PROJECT]} 
    projectIdParam="id" 
  />}
>
  <Route path="/projects/:id/edit" element={<ProjectEdit />} />
</Route>
```

### 3. Conditional Rendering in Components

```tsx
import { usePermissions, Permission } from '../utils/permissions';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { roles } = useAuth();
  const permissions = usePermissions(roles);
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {permissions.can(Permission.MANAGE_TENANTS) && (
        <div>
          <h2>Tenant Management</h2>
          {/* Tenant management UI */}
        </div>
      )}
      
      {permissions.can(Permission.MANAGE_CLOUD_PROVIDERS) && (
        <div>
          <h2>Cloud Provider Management</h2>
          {/* Cloud provider management UI */}
        </div>
      )}
    </div>
  );
};
```

## Permission Mapping to Project Roles

For project-specific permissions, the system maps permissions to project roles:

- `VIEW_PROJECT` → Any project member (MEMBER, DEPUTY, OWNER)
- `EDIT_PROJECT` → Project DEPUTY or OWNER
- `MANAGE_PROJECT_MEMBERS` → Project OWNER only

## Best Practices

1. **Always use the permission system** instead of directly checking roles
2. **Use the most specific permission** needed for a feature
3. **Document new permissions** when adding them to the system
4. **Test with different user roles** to ensure permissions work correctly

## Migrating from Role-Based to Permission-Based

When updating existing components:

1. Replace:
   ```typescript
   const { isSuperAdmin, isTenantOwner } = useAuth();
   
   if (isSuperAdmin) {
     // Show admin UI
   }
   ```

2. With:
   ```typescript
   const { roles } = useAuth();
   const permissions = usePermissions(roles);
   
   if (permissions.can(Permission.MANAGE_TENANTS)) {
     // Show admin UI
   }
   ```

## Troubleshooting

If you encounter permission issues:

1. Check that the user has the correct role in the database
2. Verify that the permission is correctly mapped to the role in `permissions.ts`
3. Ensure you're using the correct permission enum value
4. Check the browser console for permission debugging information