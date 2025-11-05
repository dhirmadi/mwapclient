# Projects Feature Specification

**Last Updated:** 2025-10-08  
**Owner:** Lead Architect  
**Status:** Ready for implementation

## Overview

This document defines the Projects feature for MWAP. Projects are tenant-scoped collaborative workspaces that:
- Belong to exactly one tenant
- Are owned by their creator (who becomes Project Owner)
- Have a project type (defines behavior and templates)
- Are associated with exactly one cloud provider integration from the same tenant
- Have members with roles (Owner > Deputy > Member)
- Are assigned a root folder within the selected integration (created or selected at project creation)

This specification includes requirements, API contracts, frontend components, security constraints, and a delivery plan to enable the project manager to plan and track the work.

## Goals & Non-Goals

### Goals
- CRUD for projects with tenant scoping and RBAC
- Member management with clear role hierarchy
- Project Type assignment and validation
- Integration selection from tenant’s existing integrations
- Root folder assignment under the chosen integration
- Audit logging, validation, and error handling

### Non-Goals (Phase 1)
- Cross-tenant projects
- Multiple integrations per project
- Per-project custom OAuth scopes
- Real-time presence/collaboration

## Domain Model

```
Tenant 1 ──┐
           ├─ Integration 1 (Dropbox)
           ├─ Integration 2 (Google Drive)
           └─ Project Type (e.g., "Photography")

Project ───────────────────────────────────────────────
id: string
tenantId: string
name: string
description?: string
typeId: string                 // references Project Type
integrationId: string          // references Tenant Integration
rootFolderPath: string         // path/id within provider
status: 'active' | 'archived'
createdBy: string              // userId
createdAt: ISO string
updatedAt: ISO string

ProjectMember
projectId: string
userId: string
role: 'OWNER' | 'DEPUTY' | 'MEMBER'
addedAt: ISO string
addedBy: string
```

## Security & RBAC

- Projects are tenant-scoped: a project’s `tenantId` must equal the current user’s tenant; cross-tenant access is forbidden.
- Creator becomes `OWNER` automatically.
- Role hierarchy:
  - OWNER: full control, can delete project, manage roles
  - DEPUTY: manage members (not owners), update project
  - MEMBER: read access and project participation
- All endpoints require authentication; RBAC enforced server-side and mirrored client-side.

## Backend API (Authoritative)

All endpoints use base prefix `/api/v1` and follow the unified response wrapper.

### Project CRUD APIs ✅

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/projects` | Authenticated | List projects for current user | ✅ Implemented |
| GET | `/api/v1/projects/:id` | Project Member | Get project details | ✅ Implemented |
| POST | `/api/v1/projects` | Tenant Owner | Create project | ✅ Implemented |
| PATCH | `/api/v1/projects/:id` | Project Deputy+ | Update project | ✅ Implemented |
| DELETE | `/api/v1/projects/:id` | Project Owner | Delete project | ✅ Implemented |

### Project Members Management APIs ✅

| Method | Endpoint | Authorization | Description | Status |
|--------|----------|---------------|-------------|--------|
| GET | `/api/v1/projects/:id/members` | Project Member | List project members | ✅ Implemented |
| GET | `/api/v1/projects/:id/members/me` | Authenticated | Get my membership | ✅ Implemented |
| POST | `/api/v1/projects/:id/members` | Project Deputy+ | Add member | ✅ Implemented |
| PATCH | `/api/v1/projects/:id/members/:userId` | Project Owner | Update member role | ✅ Implemented |
| DELETE | `/api/v1/projects/:id/members/:userId` | Project Owner | Remove member | ✅ Implemented |

### Project Creation Contract

Request:
```json
{
  "name": "Website Redesign",
  "description": "Marketing site overhaul",
  "typeId": "<projectTypeId>",
  "integrationId": "<tenantIntegrationId>",
  "rootFolder": {
    "mode": "create|use_existing",
    "pathOrName": "Projects/Website-Redesign"
  }
}
```

Rules:
- `integrationId` must belong to the same tenant as the project
- If `mode=create`, backend creates the folder on the provider under a tenant-specific prefix and stores the resulting path/id
- Creator becomes OWNER; audit entry recorded

Response (200/201):
```json
{
  "success": true,
  "data": {
    "id": "...",
    "tenantId": "...",
    "name": "Website Redesign",
    "typeId": "...",
    "integrationId": "...",
    "rootFolderPath": "Projects/Website-Redesign",
    "status": "active",
    "createdBy": "user-id",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### Validation & Errors

- 400 `validation/invalid-input` – invalid `typeId`, `integrationId`, or `rootFolder`
- 403 `auth/forbidden` – user not in tenant or lacks role
- 404 `resource/not-found` – type or integration not found
- 409 `resource/conflict` – folder already exists (when `mode=create` and policy forbids reuse)

## Frontend Implementation

### Feature Structure

```
src/features/projects/
├── pages/
│   ├── ProjectListPage.tsx
│   ├── ProjectCreatePage.tsx
│   └── ProjectDetailsPage.tsx
├── components/
│   ├── ProjectCard.tsx
│   ├── ProjectMemberList.tsx
│   ├── ProjectForm.tsx
│   └── RootFolderPicker.tsx
├── hooks/
│   ├── useProjects.ts
│   ├── useCreateProject.ts
│   ├── useUpdateProject.ts
│   ├── useDeleteProject.ts
│   ├── useProjectMembers.ts
│   └── useUpdateProjectMember.ts
├── types/
│   └── project.types.ts
└── utils/
    └── projectUtils.ts
```

### Pages

1) ProjectListPage
- Lists projects for current user with search, filter by type, and status badges
- Uses `useProjects()` with React Query

2) ProjectCreatePage (Wizard)
- Step 1: Basic info (name, description, project type)
- Step 2: Integration selection (from tenant’s integrations)
- Step 3: Root folder assignment (create or use existing)
- Step 4: Review & create

3) ProjectDetailsPage
- Shows project info, members, and quick actions
- Tabs: Overview, Members, Settings, Activity

### Components

- ProjectForm: Zod-validated form for name/description/type
- RootFolderPicker: Uses chosen integration to browse or create folder
- ProjectMemberList: List with add/remove and role update actions (Owner/Deputy/Member)

### Hooks

- `useProjects` – list and get by ID
- `useCreateProject` – create with optimistic UI and error rollback
- `useUpdateProject` – update name/description/type/status
- `useDeleteProject` – confirm delete, soft delete support
- `useProjectMembers` – list/add/remove members
- `useUpdateProjectMember` – change roles with safeguards

### Types (Frontend)

```ts
export type ProjectRole = 'OWNER' | 'DEPUTY' | 'MEMBER';

export interface Project {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  typeId: string;
  integrationId: string;
  rootFolderPath: string;
  status: 'active' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  role: ProjectRole;
  addedAt: string;
  addedBy: string;
}
```

## UX Requirements

- Mantine v8 components, accessible and responsive
- Clear error notifications (centralized notifications)
- Prevent duplicate project names within the same tenant (soft rule, warn on duplicate)
- When integration lacks proper scopes for folder creation, show actionable error with link to re-authenticate integration

## Security Requirements

- Enforce tenant isolation on all reads/writes
- Only Tenant Owner can create projects; Owner/Deputy can update; Owner can delete; Members read-only
- Validate chosen `integrationId` belongs to the project’s tenant
- Validate chosen `typeId` exists and is permitted for the tenant

## Audit & Logging

- Record: create, update, delete, add/remove member, role changes
- Include actor, timestamp, projectId, tenantId, and payload deltas (sanitized)

## Performance

- React Query caching for projects and members
- Pagination and search for large lists
- Avoid N+1 requests: batch member lookups where possible

## Test Plan

### Backend
- Unit: create/update/delete, member add/remove, role updates, folder creation adapter
- Integration: create with folder create, create with existing folder, invalid integration/type
- Security: cross-tenant access blocked, role enforcement

### Frontend
- Unit: hooks and utilities (validation, transformations)
- Component: forms, lists, member management
- E2E: create → view → add members → update → archive → delete

## Delivery Plan & Estimates

### Backend (3–4 days)
1. Model and schemas (types + validation) – 0.5d
2. CRUD endpoints with RBAC – 1.5d
3. Members endpoints and role updates – 1d
4. Provider folder assignment adapter – 0.5–1d

### Frontend (3–4 days)
1. Pages and routing – 1d
2. Hooks and API integration – 1d
3. Forms, wizards, and components – 1–1.5d
4. Testing and polish – 0.5d

### Risks & Mitigations
- Missing provider scopes for folder creation → Detect and guide to re-auth
- Large member lists → Pagination and search
- Duplicate names → Soft warning and allow proceed

## References

- `docs/02-Architecture/README.md`
- `docs/03-Frontend/README.md`
- `docs/04-Backend/api-reference.md`
- `docs/05-Security/rbac.md`
- `docs/06-Guidelines/development-guide.md`

