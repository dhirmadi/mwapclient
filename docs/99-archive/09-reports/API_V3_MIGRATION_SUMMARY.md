# MWAP Client - API v3 Migration Summary

This document summarizes all changes made to update the MWAP client to be compatible with the v3 API documentation.

## Overview

The MWAP client has been successfully updated to work with the new v3 API. All breaking changes have been addressed, and the client now follows the v3 API specification exactly.

## Changes Made

### 1. API Base URL Update
**File:** `src/shared/utils/api.ts`
- **Change:** Updated base URL from `/api` to `/api/v1`
- **Impact:** All API calls now use the correct v3 endpoint structure

### 2. Authentication Endpoints
**File:** `src/core/context/AuthContext.tsx`
- **Change:** Updated user roles endpoint from `/user/roles` to `/users/me/roles`
- **Impact:** User role fetching now uses the correct v3 endpoint

### 3. Tenant Management Updates

#### Endpoints
**File:** `src/features/tenants/hooks/useTenants.ts`
- **Change:** Updated tenant current endpoint from `/tenant/current` to `/tenants/me`
- **Change:** Updated HTTP method from PUT to PATCH for tenant updates
- **Change:** Added tenant integration endpoints with proper structure:
  - Create: `POST /tenants/{tenantId}/integrations`
  - Delete: `DELETE /tenants/{tenantId}/integrations/{integrationId}`
  - Update: `PATCH /tenants/{tenantId}/integrations/{integrationId}`
- **Change:** Added OAuth token refresh endpoint: `POST /oauth/tenants/{tenantId}/integrations/{integrationId}/refresh`

#### Types
**File:** `src/features/tenants/types/tenant.types.ts`
- **Change:** Updated tenant types to match v3 schema with proper settings structure
- **Change:** Added proper `TenantSettings` interface with `allowPublicProjects` and `maxProjects`
- **Change:** Updated `TenantUpdate` type to include optional settings and archived fields

### 4. Cloud Provider Updates

#### Types
**File:** `src/features/cloud-providers/types/cloud-provider.types.ts`
- **Change:** Updated CloudProvider type to use `id` instead of `_id`
- **Change:** Added missing `CloudProviderIntegrationUpdate` type
- **Change:** Updated all integration types to match v3 API schema

#### Endpoints
**File:** `src/features/cloud-providers/hooks/useCloudProviders.ts`
- **Change:** Updated HTTP method from PUT to PATCH for cloud provider updates
- **Change:** Fixed tenant integration endpoints to use proper tenant ID structure

#### UI Components
**File:** `src/features/cloud-providers/pages/CloudProviderListPage.tsx`
- **Change:** Updated references from `provider._id` to `provider.id`

### 5. Project Management Updates

#### Endpoints
**Files:** 
- `src/features/projects/hooks/useProjects.ts`
- `src/features/projects/hooks/useUpdateProject.ts`
- **Change:** Updated HTTP method from PUT to PATCH for project updates
- **Change:** Updated project member updates to use PATCH method
- **Impact:** All project modifications now use the correct v3 HTTP methods

#### Types
**File:** `src/features/projects/types/project.types.ts`
- **Status:** No changes needed - project types correctly use `_id` as per v3 API schema

### 6. Project Types Updates
**File:** `src/features/project-types/hooks/useProjectTypes.ts`
- **Change:** Updated HTTP method from PUT to PATCH for project type updates
- **Impact:** Project type modifications now use the correct v3 HTTP method

### 7. File Management Updates
**File:** `src/features/files/hooks/useFiles.ts`
- **Change:** Removed upload and delete functionality (not supported in v3 API)
- **Change:** Files are now read-only as per v3 API specification
- **Impact:** Files are derived at runtime via CloudProviderIntegration, not persisted in DB

## API Endpoint Mapping

### Before (v2) → After (v3)

| Feature | Old Endpoint | New Endpoint | Method Change |
|---------|-------------|--------------|---------------|
| User Roles | `/user/roles` | `/users/me/roles` | - |
| Current Tenant | `/tenant/current` | `/tenants/me` | - |
| Update Tenant | `PUT /tenants/{id}` | `PATCH /tenants/{id}` | PUT → PATCH |
| Update Cloud Provider | `PUT /cloud-providers/{id}` | `PATCH /cloud-providers/{id}` | PUT → PATCH |
| Tenant Integrations | `/tenant/integrations` | `/tenants/{tenantId}/integrations` | - |
| Update Project | `PUT /projects/{id}` | `PATCH /projects/{id}` | PUT → PATCH |
| Update Project Member | `PUT /projects/{id}/members/{userId}` | `PATCH /projects/{id}/members/{userId}` | PUT → PATCH |
| Update Project Type | `PUT /project-types/{id}` | `PATCH /project-types/{id}` | PUT → PATCH |

## Schema Changes

### CloudProvider
- **Before:** Used `_id` field
- **After:** Uses `id` field

### Tenant
- **Before:** Simple settings object
- **After:** Structured settings with `allowPublicProjects` and `maxProjects`

### Files
- **Before:** Supported upload/delete operations
- **After:** Read-only, derived at runtime from cloud integrations

## New Features Added

1. **OAuth Token Refresh:** Added endpoint for refreshing OAuth tokens for tenant integrations
2. **Tenant Integration Management:** Added proper CRUD operations for tenant cloud integrations
3. **Enhanced Error Handling:** Updated to handle v3 API error codes and responses

## Verification

- ✅ Build passes successfully with `npm run build`
- ✅ All TypeScript errors resolved
- ✅ No old `/api` endpoints remaining
- ✅ All PUT methods updated to PATCH where required
- ✅ All type definitions match v3 API schemas
- ✅ All endpoint paths match v3 API documentation

## Testing Recommendations

1. **Authentication Flow:** Test user login and role fetching
2. **Tenant Management:** Test tenant creation, updates, and integration management
3. **Cloud Provider Integration:** Test cloud provider setup and OAuth flows
4. **Project Management:** Test project CRUD operations and member management
5. **File Access:** Test file listing and browsing functionality

## Breaking Changes Summary

1. **API Base URL:** All endpoints now use `/api/v1` prefix
2. **HTTP Methods:** Update operations now use PATCH instead of PUT
3. **CloudProvider ID:** Uses `id` instead of `_id`
4. **File Operations:** Upload/delete removed (read-only access only)
5. **Tenant Settings:** Now uses structured settings object
6. **Integration Endpoints:** Now use tenant-scoped paths

## Conclusion

The MWAP client has been successfully migrated to be fully compatible with the v3 API. All breaking changes have been addressed, and the client now follows the v3 API specification exactly. The application should work seamlessly with the new API version.