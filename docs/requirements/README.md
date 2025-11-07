# Requirements Documentation

This directory contains detailed software requirements specifications (SRS) for MWAP Client features and improvements.

## Active Requirements

### [RBAC Optimization: JWT Custom Claims Migration](./rbac-optimization-jwt-custom-claims.md)
**Status:** Draft  
**Version:** 0.1.0  
**Last Updated:** 2025-11-05  
**Priority:** P0 (Critical)  
**Team:** Frontend

**Overview:**  
Comprehensive requirements for migrating from API-based role fetching to JWT custom claims, improving performance by 60-75% and eliminating loading spinners.

**Key Deliverables:**
1. JWT custom claims parsing in AuthContext
2. Centralized `usePermissions` hook
3. Migration of 29 component files
4. Feature flag for gradual rollout
5. Optimistic role updates

**Timeline:** 9 weeks (including 2 weeks pre-work)

**Supplementary Documents:**
- [Implementation Checklist](./rbac-optimization-implementation-checklist.md) - Step-by-step developer guide
- [Backend Change Request](./rbac-backend-auth0-action-change-request.md) - Backend requirements

---

### [Backend Change Request: Auth0 Post-Login Action](./rbac-backend-auth0-action-change-request.md)
**Status:** Draft  
**Version:** 0.1.0  
**Last Updated:** 2025-11-05  
**Priority:** P0 (Critical - Blocking Frontend)  
**Team:** Backend + DevOps

**Overview:**  
Change request for backend team to implement Auth0 Post-Login Action and internal API endpoint to support frontend JWT optimization.

**Key Deliverables:**
1. Internal API endpoint: `GET /internal/users/:auth0UserId/roles`
2. Internal API key authentication middleware
3. Auth0 Post-Login Action implementation
4. Database query optimization with indexes
5. Monitoring and alerting setup

**Timeline:** 2 weeks (Backend implementation)

**Dependencies:**  
Frontend implementation blocked until backend completes this work.

---

## Requirements Template

When creating new requirements, use the `/requirementsengineer` command with the following structure:

1. **Overview** - Problem, goals, success metrics
2. **User Flow Summary** - Main + alternate paths with diagrams
3. **Functional Requirements** - Numbered FR-n items with acceptance criteria
4. **Acceptance Criteria** - Gherkin scenarios
5. **Non-Functional Requirements** - Performance, security, scalability
6. **Data & API Contracts** - Schemas and interfaces
7. **UX Notes** - UI states, accessibility, copy
8. **Risks & Assumptions** - Risk matrix and open questions
9. **Traceability Matrix** - Flow → FR → AC → API mapping
10. **Release & Validation Plan** - Milestones and testing

---

## Related Documentation

- [User Flows](../requirements/) - Original user flow specifications
- [Architecture](../02-Architecture/) - System architecture documentation
- [Features](../10-Features/) - Feature specifications
- [Reports](../09-Reports-and-History/) - Technical reviews and analysis

---

**Maintained by:** Product Management + Engineering Team

