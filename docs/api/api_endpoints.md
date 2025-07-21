# MWAP API

**Version:** 1.0.0  
**OpenAPI Version:** 3.1.0  
**Generated:** Mon Jul 21 13:57:19 UTC 2025 UTC

## Overview

# Modular Web Application Platform API

A comprehensive, secure, and scalable SaaS framework API built with Node.js, Express, and MongoDB Atlas.

## Features
- **Multi-tenant Architecture**: Secure tenant isolation and management
- **Project Management**: Complete project lifecycle with role-based access control
- **Cloud Integrations**: Support for multiple cloud providers and services
- **OAuth Integration**: Secure authentication and authorization flows
- **File Management**: Project-based file storage and management
- **User Management**: Role-based user management and permissions

## Authentication
All API endpoints require JWT authentication using Auth0. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
API requests are rate-limited to 100 requests per 15-minute window per IP address.

## Error Handling
All errors follow a consistent format with appropriate HTTP status codes and detailed error messages.

## Contact Information

- **Team:** MWAP Team
- **Email:** support@mwap.dev
- **Repository:** https://github.com/dhirmadi/mwapserver

## License

- **License:** ISC
- **URL:** https://opensource.org/licenses/ISC

## Servers

- **Development server:** `http://localhost:26818`

## Authentication

All API endpoints require JWT authentication using Auth0. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

API requests are rate-limited to 100 requests per 15-minute window per IP address.

## API Endpoints

### Cloud Integrations

Tenant-specific cloud service integrations

#### `GET /api/v1/tenants/{tenantId}/integrations`

**Summary:** Get cloud integration

**Description:** Get cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `POST /api/v1/tenants/{tenantId}/integrations`

**Summary:** Create cloud integration

**Description:** Create cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateCloudProviderIntegration`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `GET /api/v1/tenants/{tenantId}/integrations/{integrationId}`

**Summary:** Get cloud integration

**Description:** Get cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `PATCH /api/v1/tenants/{tenantId}/integrations/{integrationId}`

**Summary:** Update cloud integration

**Description:** Update cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `UpdateCloudProviderIntegration`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `DELETE /api/v1/tenants/{tenantId}/integrations/{integrationId}`

**Summary:** Delete cloud integration

**Description:** Delete cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `POST /api/v1/tenants/{tenantId}/integrations/{integrationId}/refresh-token`

**Summary:** Create cloud integration

**Description:** Create cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateCloudProviderIntegration`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `GET /api/v1/tenants/{tenantId}/integrations/{integrationId}/health`

**Summary:** Get cloud integration

**Description:** Get cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

### Cloud Providers

Cloud provider configurations

#### `GET /api/v1/cloud-providers`

**Summary:** List all cloud providers

**Description:** List all cloud providers. Requires JWT authentication.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `POST /api/v1/cloud-providers`

**Summary:** Create cloud provider

**Description:** Create cloud provider. Requires JWT authentication.

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateCloudProvider`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `GET /api/v1/cloud-providers/{id}`

**Summary:** Get cloud provider by ID

**Description:** Get cloud provider by ID. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `PATCH /api/v1/cloud-providers/{id}`

**Summary:** Update cloud provider

**Description:** Update cloud provider. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `UpdateCloudProvider`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `DELETE /api/v1/cloud-providers/{id}`

**Summary:** Delete cloud provider

**Description:** Delete cloud provider. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

### Files

Project-based file storage and management

#### `GET /api/v1/projects/{id}/files`

**Summary:** Get project files

**Description:** Get project files. Requires JWT authentication and project MEMBER role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: MEMBER

---

### OAuth

OAuth authentication and token management

#### `GET /api/v1/oauth/callback`

**Summary:** Handle OAuth callback

**Description:** Handle OAuth callback. This is a public endpoint for OAuth callbacks.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

---

#### `POST /api/v1/oauth/tenants/{tenantId}/integrations/{integrationId}/refresh`

**Summary:** Create cloud integration

**Description:** Create cloud integration. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **tenantId** (path) (required): tenantId identifier
  - Type: `string`
- **integrationId** (path) (required): integrationId identifier
  - Type: `string`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

### Project Types

Project type definitions and templates

#### `GET /api/v1/project-types`

**Summary:** List all project types

**Description:** List all project types. Requires JWT authentication.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `POST /api/v1/project-types`

**Summary:** Create project type

**Description:** Create project type. Requires JWT authentication.

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateProjectType`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `GET /api/v1/project-types/{id}`

**Summary:** Get project type by ID

**Description:** Get project type by ID. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `PATCH /api/v1/project-types/{id}`

**Summary:** Update project type

**Description:** Update project type. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `UpdateProjectType`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `DELETE /api/v1/project-types/{id}`

**Summary:** Delete project type

**Description:** Delete project type. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

### Projects

Project lifecycle and member management

#### `GET /api/v1/projects`

**Summary:** List all projects

**Description:** List all projects. Requires JWT authentication.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `POST /api/v1/projects`

**Summary:** Create project

**Description:** Create project. Requires JWT authentication.

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateProject`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `GET /api/v1/projects/{id}`

**Summary:** Get project by ID

**Description:** Get project by ID. Requires JWT authentication.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `PATCH /api/v1/projects/{id}`

**Summary:** Update project

**Description:** Update project. Requires JWT authentication and project DEPUTY role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `UpdateProject`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: DEPUTY

---

#### `DELETE /api/v1/projects/{id}`

**Summary:** Delete project

**Description:** Delete project. Requires JWT authentication and project OWNER role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: OWNER

---

#### `GET /api/v1/projects/{id}/members`

**Summary:** Get project members

**Description:** Get project members. Requires JWT authentication and project MEMBER role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: MEMBER

---

#### `POST /api/v1/projects/{id}/members`

**Summary:** Create project member

**Description:** Create project member. Requires JWT authentication and project DEPUTY role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Request Body:**


**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: DEPUTY

---

#### `PATCH /api/v1/projects/{id}/members/{userId}`

**Summary:** Update project member

**Description:** Update project member. Requires JWT authentication and project OWNER role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`
- **userId** (path) (required): userId identifier
  - Type: `string`

**Request Body:**


**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: OWNER

---

#### `DELETE /api/v1/projects/{id}/members/{userId}`

**Summary:** Delete project member

**Description:** Delete project member. Requires JWT authentication and project OWNER role or higher.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`
- **userId** (path) (required): userId identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- projectRole: OWNER

---

### Tenants

Multi-tenant organization management

#### `GET /api/v1/tenants`

**Summary:** List all tenants

**Description:** List all tenants. Requires JWT authentication and super administrator privileges.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`
- **includeArchived** (query) (optional): Include archived tenants in results
  - Type: `boolean`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- superAdminRole

---

#### `POST /api/v1/tenants`

**Summary:** Create tenant

**Description:** Create tenant. Requires JWT authentication.

**Request Body:**

- Content-Type: `application/json`
- Schema: `CreateTenant`

**Responses:**

- **201**: Created successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `GET /api/v1/tenants/me`

**Summary:** Get current user's tenant

**Description:** Get current user's tenant. Requires JWT authentication.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`
- **includeArchived** (query) (optional): Include archived tenants in results
  - Type: `boolean`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

#### `GET /api/v1/tenants/{id}`

**Summary:** Get tenant by ID

**Description:** Get tenant by ID. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `PATCH /api/v1/tenants/{id}`

**Summary:** Update tenant

**Description:** Update tenant. Requires JWT authentication and tenant owner or super administrator privileges.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Request Body:**

- Content-Type: `application/json`
- Schema: `UpdateTenant`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- tenantOwnerRole

---

#### `DELETE /api/v1/tenants/{id}`

**Summary:** Delete tenant

**Description:** Delete tenant. Requires JWT authentication and super administrator privileges.

**Parameters:**

- **id** (path) (required): id identifier
  - Type: `string`

**Responses:**

- **200**: Deleted successfully
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth
- superAdminRole

---

### Users

User management and role assignments

#### `GET /api/v1/users/me/roles`

**Summary:** Get user roles

**Description:** Get user roles. Requires JWT authentication.

**Parameters:**

- **page** (query) (optional): Page number for pagination
  - Type: `integer`
- **limit** (query) (optional): Number of items per page
  - Type: `integer`

**Responses:**

- **200**: Success
- **400**: Bad Request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not Found
- **500**: Internal Server Error

**Security:**

- bearerAuth

---

## Data Schemas

The following schemas define the data structures used by the API:

### CloudProvider

**Type:** `object`

**Properties:**

- **_id** (required):
  - Type: `unknown`
- **authUrl** (required):
  - Type: `string`
  - Format: `uri`
- **clientId** (required):
  - Type: `string`
  - Min Length: 1
- **clientSecret** (required):
  - Type: `string`
  - Min Length: 1
- **createdAt** (required):
  - Type: `string`
- **createdBy** (required):
  - Type: `string`
- **grantType** (optional):
  - Type: `string`
  - Default: `authorization_code`
- **metadata** (optional):
  - Type: `object`
- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **scopes** (required):
  - Type: `array`
  - Items Type: `string`
- **slug** (required):
  - Type: `string`
  - Min Length: 2
  - Max Length: 20
  - Pattern: `^[a-z0-9-]+$`
- **tokenMethod** (optional):
  - Type: `string`
  - Default: `POST`
- **tokenUrl** (required):
  - Type: `string`
  - Format: `uri`
- **updatedAt** (required):
  - Type: `string`

**Required Fields:** _id, name, slug, scopes, authUrl, tokenUrl, clientId, clientSecret, createdAt, updatedAt, createdBy

---

### CloudProviderIntegration

**Type:** `object`

**Properties:**

- **_id** (required):
  - Type: `string`
- **accessToken** (optional):
  - Type: `string`
- **connectedAt** (optional):
  - Type: `string`
- **createdAt** (required):
  - Type: `string`
- **createdBy** (required):
  - Type: `string`
- **metadata** (optional):
  - Type: `object`
- **providerId** (required):
  - Type: `string`
- **refreshToken** (optional):
  - Type: `string`
- **scopesGranted** (optional):
  - Type: `array`
  - Items Type: `string`
- **status** (optional):
  - Type: `string`
  - Allowed Values: active, expired, revoked, error
  - Default: `active`
- **tenantId** (required):
  - Type: `string`
- **tokenExpiresAt** (optional):
  - Type: `string`
- **updatedAt** (required):
  - Type: `string`

**Required Fields:** _id, tenantId, providerId, createdAt, updatedAt, createdBy

---

### CreateCloudProvider

**Type:** `object`

**Properties:**

- **authUrl** (required):
  - Type: `string`
  - Format: `uri`
- **clientId** (required):
  - Type: `string`
  - Min Length: 1
- **clientSecret** (required):
  - Type: `string`
  - Min Length: 1
- **grantType** (optional):
  - Type: `string`
  - Default: `authorization_code`
- **metadata** (optional):
  - Type: `object`
- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **scopes** (required):
  - Type: `array`
  - Items Type: `string`
- **slug** (required):
  - Type: `string`
  - Min Length: 2
  - Max Length: 20
  - Pattern: `^[a-z0-9-]+$`
- **tokenMethod** (optional):
  - Type: `string`
  - Default: `POST`
- **tokenUrl** (required):
  - Type: `string`
  - Format: `uri`

**Required Fields:** name, slug, scopes, authUrl, tokenUrl, clientId, clientSecret

---

### CreateCloudProviderIntegration

**Type:** `object`

**Properties:**

- **metadata** (optional):
  - Type: `object`
- **providerId** (required):
  - Type: `string`
- **scopesGranted** (optional):
  - Type: `array`
  - Items Type: `string`
- **status** (optional):
  - Type: `string`
  - Allowed Values: active, expired, revoked, error
  - Default: `active`
- **tenantId** (optional):
  - Type: `string`

**Required Fields:** providerId

---

### CreateProject

**Type:** `object`

**Properties:**

- **archived** (optional):
  - Type: `boolean`
  - Default: `False`
- **cloudIntegrationId** (required):
  - Type: `string`
- **description** (optional):
  - Type: `string`
  - Max Length: 500
- **folderpath** (required):
  - Type: `string`
  - Min Length: 1
- **members** (required):
  - Type: `array`
  - Items Type: `object`
- **name** (required):
  - Type: `string`
  - Min Length: 1
  - Max Length: 100
- **projectTypeId** (required):
  - Type: `string`
- **tenantId** (required):
  - Type: `string`

**Required Fields:** tenantId, projectTypeId, cloudIntegrationId, folderpath, name, members

---

### CreateProjectType

**Type:** `object`

**Properties:**

- **configSchema** (required):
  - Type: `object`
- **description** (required):
  - Type: `string`
  - Max Length: 500
- **isActive** (required):
  - Type: `boolean`
- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50

**Required Fields:** name, description, configSchema, isActive

---

### CreateTenant

**Type:** `object`

**Properties:**

- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **settings** (optional):
  - Type: `object`
  - Object Properties: 2 fields

**Required Fields:** name

---

### ErrorResponse

**Type:** `object`

**Properties:**

- **error** (required):
  - Type: `object`
  - Object Properties: 3 fields
- **success** (optional):
  - Type: `boolean`
  - Default: `False`

**Required Fields:** error

---

### File

**Type:** `object`

**Properties:**

- **createdAt** (optional):
  - Type: `unknown`
- **fileId** (required):
  - Type: `string`
- **metadata** (optional):
  - Type: `object`
- **mimeType** (required):
  - Type: `string`
- **modifiedAt** (optional):
  - Type: `unknown`
- **name** (required):
  - Type: `string`
- **path** (required):
  - Type: `string`
- **size** (optional):
  - Type: `number`
- **status** (required):
  - Type: `string`
  - Allowed Values: pending, processed, error

**Required Fields:** fileId, name, mimeType, path, status

---

### FileQuery

**Type:** `object`

**Properties:**

- **fileTypes** (optional):
  - Type: `array`
  - Items Type: `string`
- **folder** (optional):
  - Type: `string`
- **limit** (optional):
  - Type: `number`
  - Default: `100`
- **page** (optional):
  - Type: `number`
  - Default: `1`
- **recursive** (optional):
  - Type: `boolean`
  - Default: `False`

---

### PaginationMeta

**Type:** `object`

**Properties:**

- **limit** (required):
  - Type: `number`
- **page** (required):
  - Type: `number`
- **total** (required):
  - Type: `number`
- **totalPages** (required):
  - Type: `number`

**Required Fields:** page, limit, total, totalPages

---

### Project

**Type:** `object`

**Properties:**

- **_id** (required):
  - Type: `string`
- **archived** (optional):
  - Type: `boolean`
  - Default: `False`
- **cloudIntegrationId** (required):
  - Type: `string`
- **createdAt** (required):
  - Type: `string`
- **createdBy** (required):
  - Type: `string`
- **description** (optional):
  - Type: `string`
  - Max Length: 500
- **folderpath** (required):
  - Type: `string`
  - Min Length: 1
- **members** (required):
  - Type: `array`
  - Items Type: `object`
- **name** (required):
  - Type: `string`
  - Min Length: 1
  - Max Length: 100
- **projectTypeId** (required):
  - Type: `string`
- **tenantId** (required):
  - Type: `string`
- **updatedAt** (required):
  - Type: `string`

**Required Fields:** _id, tenantId, projectTypeId, cloudIntegrationId, folderpath, name, members, createdAt, updatedAt, createdBy

---

### ProjectRole

**Type:** `object`

**Properties:**

- **projectId** (required):
  - Type: `string`
- **role** (required):
  - Type: `string`
  - Allowed Values: OWNER, DEPUTY, MEMBER

**Required Fields:** projectId, role

---

### ProjectType

**Type:** `object`

**Properties:**

- **_id** (optional):
  - Type: `unknown`
- **configSchema** (required):
  - Type: `object`
- **createdAt** (optional):
  - Type: `string`
- **createdBy** (optional):
  - Type: `string`
- **description** (required):
  - Type: `string`
  - Max Length: 500
- **isActive** (required):
  - Type: `boolean`
- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **updatedAt** (optional):
  - Type: `string`

**Required Fields:** name, description, configSchema, isActive

---

### SuccessResponse

**Type:** `object`

**Properties:**

- **data** (optional):
  - Type: `unknown`
- **message** (optional):
  - Type: `string`
- **success** (required):
  - Type: `boolean`

**Required Fields:** success

---

### Tenant

**Type:** `object`

**Properties:**

- **_id** (required):
  - Type: `string`
- **archived** (optional):
  - Type: `boolean`
  - Default: `False`
- **createdAt** (required):
  - Type: `string`
- **name** (required):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **ownerId** (required):
  - Type: `string`
- **settings** (optional):
  - Type: `object`
  - Default: `{'allowPublicProjects': False, 'maxProjects': 10}`
  - Object Properties: 2 fields
- **updatedAt** (required):
  - Type: `string`

**Required Fields:** _id, name, ownerId, createdAt, updatedAt

---

### UpdateCloudProvider

**Type:** `object`

**Properties:**

- **authUrl** (optional):
  - Type: `string`
  - Format: `uri`
- **clientId** (optional):
  - Type: `string`
  - Min Length: 1
- **clientSecret** (optional):
  - Type: `string`
  - Min Length: 1
- **grantType** (optional):
  - Type: `string`
  - Default: `authorization_code`
- **metadata** (optional):
  - Type: `object`
- **name** (optional):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **scopes** (optional):
  - Type: `array`
  - Items Type: `string`
- **slug** (optional):
  - Type: `string`
  - Min Length: 2
  - Max Length: 20
  - Pattern: `^[a-z0-9-]+$`
- **tokenMethod** (optional):
  - Type: `string`
  - Default: `POST`
- **tokenUrl** (optional):
  - Type: `string`
  - Format: `uri`

---

### UpdateCloudProviderIntegration

**Type:** `object`

**Properties:**

- **accessToken** (optional):
  - Type: `string`
- **connectedAt** (optional):
  - Type: `string`
- **metadata** (optional):
  - Type: `object`
- **refreshToken** (optional):
  - Type: `string`
- **scopesGranted** (optional):
  - Type: `array`
  - Items Type: `string`
- **status** (optional):
  - Type: `string`
  - Allowed Values: active, expired, revoked, error
  - Default: `active`
- **tokenExpiresAt** (optional):
  - Type: `string`

---

### UpdateProject

**Type:** `object`

**Properties:**

- **archived** (optional):
  - Type: `boolean`
- **description** (optional):
  - Type: `string`
  - Max Length: 500
- **name** (optional):
  - Type: `string`
  - Min Length: 1
  - Max Length: 100

---

### UpdateProjectType

**Type:** `object`

**Properties:**

- **_id** (optional):
  - Type: `unknown`
- **createdAt** (optional):
  - Type: `string`
- **createdBy** (optional):
  - Type: `string`
- **description** (optional):
  - Type: `string`
  - Max Length: 500
- **isActive** (optional):
  - Type: `boolean`
- **name** (optional):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **updatedAt** (optional):
  - Type: `string`

---

### UpdateTenant

**Type:** `object`

**Properties:**

- **archived** (optional):
  - Type: `boolean`
- **name** (optional):
  - Type: `string`
  - Min Length: 3
  - Max Length: 50
- **settings** (optional):
  - Type: `object`
  - Object Properties: 2 fields

---

### UserRoles

**Type:** `object`

**Properties:**

- **isSuperAdmin** (required):
  - Type: `boolean`
- **isTenantOwner** (required):
  - Type: `boolean`
- **projectRoles** (required):
  - Type: `array`
  - Items Type: `object`
- **tenantId** (required):
  - Type: `['string', 'null']`
- **userId** (required):
  - Type: `string`

**Required Fields:** userId, isSuperAdmin, isTenantOwner, tenantId, projectRoles

---

## Error Handling

All errors follow a consistent format with appropriate HTTP status codes and detailed error messages.

### Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "error_code",
    "message": "Human readable error message",
    "status": 400
  }
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid JWT token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

## Security Schemes

### bearerAuth

**Type:** http
**Scheme:** bearer
**Bearer Format:** JWT
**Description:** JWT token obtained from Auth0

### superAdminRole

**Type:** apiKey
**Description:** Super administrator role requirement

### tenantOwnerRole

**Type:** apiKey
**Description:** Tenant owner role requirement

### projectRole

**Type:** apiKey
**Description:** Project role requirement (MEMBER, DEPUTY, OWNER)

---

## Documentation Source

This documentation was automatically generated from the MWAP API OpenAPI specification.
**Source:** `https://mwapss.shibari.photo/api/v1/openapi`
**Generated on:** Mon Jul 21 13:58:02 UTC 2025 UTC

For the most up-to-date API information, please refer to the live OpenAPI specification endpoint.