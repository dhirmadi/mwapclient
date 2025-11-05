# Projects Implementation Plan

**Date:** 2025-10-08

**Author:** Lead Architect

**Status:** Approved for implementation

## Source Documents
- Feature Spec: `docs/10-Features/projects.md`
- Architecture: `docs/02-Architecture/README.md`
- API Reference: `docs/04-Backend/api-reference.md`
- Security & RBAC: `docs/05-Security/rbac.md`
- Development Guide: `docs/06-Guidelines/development-guide.md`

## Objectives

- Implement tenant-scoped Projects with full CRUD, member management, type assignment, and integration-based root folder assignment.
- Ensure RBAC and tenant isolation.
- Provide complete frontend feature with wizard, details page, and list.

## Scope

- Backend: Models, endpoints, validation, folder assignment adapter, audit logging.
- Frontend: Pages, components, hooks, types, UX flows, notifications.
- Ops: Logging, rate limiting, documentation.
- Cleanup: Review and remove legacy `src/features/projects` implementation if present and conflicting.

## Phases & Tasks

### Phase 1: Backend (3–4 days)
1. Data Model & Schemas (0.5d)
   - Add `Project` and `ProjectMember` models per spec.
   - Zod validation for create/update/member endpoints.
2. CRUD Endpoints (1.5d)
   - `GET /projects`, `GET /projects/:id`, `POST /projects`, `PATCH /projects/:id`, `DELETE /projects/:id`.
   - Enforce tenant isolation and RBAC (Owner/Deputy/Member).
   - Unified responses and errors.
3. Members Management (1.0d)
   - `GET /projects/:id/members`, `GET /projects/:id/members/me`, `POST`, `PATCH`, `DELETE`.
   - Role hierarchy enforcement and audit logging.
4. Root Folder Assignment (0.5–1.0d)
   - Adapter for provider folder creation/lookup via selected integration.
   - Validate `integrationId` belongs to tenant; store `rootFolderPath`.

### Phase 2: Frontend (3–4 days)
1. Pages & Routing (1.0d)
   - `ProjectListPage`, `ProjectCreatePage` (wizard), `ProjectDetailsPage` with tabs.
2. Hooks & API Integration (1.0d)
   - `useProjects`, `useCreateProject`, `useUpdateProject`, `useDeleteProject`, `useProjectMembers`, `useUpdateProjectMember`.
   - Centralize API calls via `src/shared/utils/api.ts` and `handleApiResponse`.
3. Forms, Wizard & Components (1.0–1.5d)
   - `ProjectForm`, `ProjectMemberList`, `RootFolderPicker` (uses integration to browse/create).
   - Zod validation, notifications, optimistic updates where safe.
4. Testing & Polish (0.5d)
   - Unit tests for hooks and utils; smoke tests for pages.

### Phase 3: Ops & Documentation (0.5–1.0 days)
- Audit logging for create/update/delete/member changes.
- Rate limiting and error surfaces.
- Update docs where needed; link new feature docs from index.

## Milestones & Acceptance Criteria

- M1: Backend CRUD & Members endpoints return expected payloads with RBAC (Postman suite passes).
- M2: Frontend wizard creates project with root folder created/selected; details page shows correct info.
- M3: Member management fully operational with role constraints and audit logs written.
- M4: All documentation linked and aligned; no TypeScript errors; E2E smoke flows pass.

## Risk Assessment & Mitigations

- Missing provider scopes → Detect pre-create and provide re-auth link.
- Duplicate project names → Soft warning; allow continue (no hard uniqueness constraint).
- Folder creation failures → Clear error with retry and option to select existing folder.
- Legacy conflicts → Remove/disable old `src/features/projects` code path after new implementation is verified.

## Legacy Implementation Review & Cleanup

- Location: `src/features/projects/` (existing files/components/hooks may be legacy).
- Actions:
  1. Review current files for duplication/mismatch versus `docs/10-Features/projects.md`.
  2. If legacy flows conflict (e.g., missing root folder step, different APIs), deprecate and remove after new feature merged.
  3. Ensure routes updated; remove unused exports from `src/features/projects/index.ts`.
  4. Validate no references remain in other features; update imports accordingly.

## Detailed Work Breakdown

### Backend Tasks
- [ ] Define Mongoose/Prisma models (as applicable) for Project and ProjectMember
- [ ] Implement Zod schemas for requests/responses
- [ ] Implement CRUD controllers and services
- [ ] Implement members controllers and services
- [ ] Implement provider folder adapter (Dropbox/Google/OneDrive)
- [ ] Add audit logging hooks
- [ ] Add rate limiting for write endpoints
- [ ] Add integration tests for success/error paths

### Frontend Tasks
- [ ] Add routes and pages
- [ ] Implement hooks with React Query
- [ ] Implement wizard steps and forms with Zod validation
- [ ] Implement `RootFolderPicker` integrated with Integrations feature
- [ ] Implement member list management with role updates
- [ ] Add notifications and error handling per standards
- [ ] Write unit tests for hooks and utils

### Documentation & Indexing
- [ ] Verify `docs/10-Features/projects.md` coverage
- [ ] Link plan and update project status after completion

## Testing Strategy

- Backend unit/integration tests for CRUD and members flows
- Frontend unit tests for hooks and validation
- E2E: Create → View → Add members → Update → Archive → Delete

## Rollout Plan

- Feature flag for Projects in UI (optional)
- Staged rollout: Dev → Staging → Production
- Monitoring: API error rates, audit log checks, client error logs

## Done Definition

- All acceptance criteria met
- No TypeScript errors; CI green
- Documentation updated; legacy code removed
- Security review passed (RBAC, tenant isolation, token handling)

---

Prepared by the MWAP architecture team. All changes must follow coding standards and go through code review.
