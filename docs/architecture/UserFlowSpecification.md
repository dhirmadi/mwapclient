# MWAP Application User Flow Specification for OpenHands (Detailed)

This document outlines the complete user flow for the MWAP (Modular Web Application Platform) frontend application. It is optimized for OpenHands + Claude 3.5/3.7 to support generation of a fully functional, RBAC-driven, API-integrated React frontend in a single coordinated pass (oneShot).

---

## 🧠 Global Architecture Context

- **Authentication**: Auth0 (Authorization Code + PKCE flow)
- **Authorization**: Role-based, resolved via `GET /users/me/roles`
- **API Transport**: Axios + React Query
- **Forms**: React Hook Form + Zod
- **State Management**: Context API + React Query
- **Styling**: Tailwind CSS + Mantine
- **Component Design**: Atomic + Feature-based folder architecture
- **Routing**: React Router v6 with `<PrivateRoute />` and `<RoleRoute />`

---

## 🔐 Role Resolution

Upon login, the frontend fetches role context via:

```http
GET /api/v1/users/me/roles
```

### 🎯 Response (UserRolesResponse)
```ts
interface UserRolesResponse {
  userId: string;
  isSuperAdmin: boolean;
  isTenantOwner: boolean;
  tenantId: string | null;
  projectRoles: Array<{
    projectId: string;
    role: 'OWNER' | 'DEPUTY' | 'MEMBER';
  }>;
}
```

### 🎛️ Role Data Usage
This is injected into the frontend `useAuth()` context and provides:
- `isSuperAdmin`
- `isTenantOwner`
- `hasProjectRole(projectId, role)` — based on role hierarchy

---

## 🧭 User Flow

### 1. User Visits App
- Route: `/`
- Redirects to `/login` via `<PrivateRoute />` if unauthenticated

### 2. Auth0 Login
- Redirects back to `/dashboard`
- `useAuth()` loads and caches:
  - Access token (from Auth0 SDK)
  - User metadata
  - Roles via `/users/me/roles`

### 3. Role-Aware Routing
- Route: `/dashboard`
- Renders one of:
  - `<SuperAdminDashboard />` (if `isSuperAdmin`)
  - `<TenantOwnerDashboard />` (if `isTenantOwner`)
  - `<ProjectMemberDashboard />` (fallback)

---

## 🧑‍💼 SuperAdmin Experience

- `/dashboard` → `<SuperAdminDashboard />`
- Capabilities:
  - View/manage tenants
  - Manage cloud providers
  - CRUD project types

#### Routes
- `/admin/tenants` → `TenantList`
- `/admin/project-types` → `ProjectTypeList`
- `/admin/cloud-providers` → `CloudProviderList`

---

## 🏢 Tenant Owner Experience

- `/dashboard` → `<TenantOwnerDashboard />`
- Displays:
  - Tenant metadata (name, createdAt)
  - Projects for tenant
  - Cloud integration status

#### Routes
- `/tenant/settings` → `TenantSettings`
- `/tenant/integrations` → `IntegrationList`
- `/projects` → `ProjectList`
- `/projects/create` → `CreateProjectModal` or `CreateProjectPage`
- `/projects/:id` → `ProjectDetail`
- `/projects/:id/settings` → `ProjectSettings`
- `/projects/:id/members` → `ProjectMembers`

#### Project Creation Inputs
- Project name
- Folder path (dropdown or folder picker)
- Cloud integration (select input)
- Project type (select input)

---

## 👩‍💻 Project Member Experience

- `/dashboard` → `<ProjectMemberDashboard />`
- Lists projects where user is member (based on `projectRoles`)

#### Routes
- `/projects/:id` → `ProjectDetail`
- `/projects/:id/files` → `FileExplorer`

#### File Listing
- Dynamically loaded from cloud provider integration
- Uses query params: `folder`, `fileTypes`, `recursive`
- Supports browsing, metadata view, (future: upload/delete)

---

## ♻️ Shared Capabilities

### RBAC: Project Members
- `/projects/:id/members`
  - Viewable by all project members
  - Editable by OWNER or DEPUTY

### RBAC: Project Settings
- `/projects/:id/settings`
  - Editable by OWNER or DEPUTY

### Project Roles Hierarchy
- `OWNER > DEPUTY > MEMBER`
- Enforced via `hasProjectRole(projectId, requiredRole)`

### Navigation Guards
All protected routes use:
```tsx
<Route element={<RoleRoute requiredRoles={[...]} projectId={...}>} />
```

---

## ⛔ Error Flows

| Error Type | UX Behavior | Route |
|------------|-------------|-------|
| Auth Error | Redirect to login | `/login` |
| Forbidden (403) | Display forbidden page | `/forbidden` |
| Not Found (404) | Display not found page | `/not-found` |
| Server Error (500) | Display server error | `/server-error` |

---

## 🧭 Route Summary Table

| Route | Roles | Component |
|-------|-------|-----------|
| `/dashboard` | All | `Dashboard` router logic |
| `/admin/tenants` | SuperAdmin | `TenantList` |
| `/admin/project-types` | SuperAdmin | `ProjectTypeList` |
| `/admin/cloud-providers` | SuperAdmin | `CloudProviderList` |
| `/tenant/settings` | TenantOwner | `TenantSettings` |
| `/tenant/integrations` | TenantOwner | `IntegrationList` |
| `/projects` | TenantOwner | `ProjectList` |
| `/projects/create` | TenantOwner | `CreateProject` modal or page |
| `/projects/:id` | ProjectMember+ | `ProjectDetail` |
| `/projects/:id/settings` | Owner, Deputy | `ProjectSettings` |
| `/projects/:id/members` | Owner | `ProjectMembers` |
| `/projects/:id/files` | Member+ | `FileExplorer` |

---

## 🧠 Usage for OpenHands OneShot Prompting

This document serves as source context for:
- OneShot prompts targeting frontend generation
- Deriving layout, routing, and RBAC logic
- Seeding Claude with:
  - API interactions
  - Role logic
  - Component structure
  - Layout and navigation awareness

---

## ✅ Claude Prompt Example Seed

```txt
Task: Build Dashboard component

Context:
- After login, route `/dashboard` must route to appropriate sub-dashboard
- Role logic resolved via `useAuth()`

Requirements:
- If `isSuperAdmin` → render `<SuperAdminDashboard />`
- Else if `isTenantOwner` → render `<TenantOwnerDashboard />`
- Else → render `<ProjectMemberDashboard />`
- Show loading state if role info not yet resolved
```

