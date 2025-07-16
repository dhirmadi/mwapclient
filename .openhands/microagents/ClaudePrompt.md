# ClaudePrompt.md — MWAP Prompt Template

This file provides a reusable Claude instruction template to be used in conjunction with `repo.md`. Use this to guide Claude when creating or modifying features in the MWAP project.

---

## 🔁 General Instructions (Append to Every Prompt)

Claude, please follow these instructions carefully for all actions on the MWAP repository:

- 🧠 **Read comprehensive documentation**: Start with [`DOCUMENTATION_INDEX.md`](../../DOCUMENTATION_INDEX.md) for complete project understanding
- 🔁 **Reuse existing patterns**: Follow established components, hooks, types, middleware, and routes
- ✅ **Maintain type safety**: Keep implementations TypeScript-strict and minimal
- 📚 **Follow MWAP standards**: Use `AppError`, `logger`, `SuccessResponse` patterns consistently
- 🔐 **Never skip security**: Always implement authentication/authorization middleware
- 🚫 **Avoid duplication**: Do not create duplicate functions, services, types, or schemas
- 🧪 **Validate inputs**: Use Zod for all input validation
- 🧱 **Maintain modularity**: Follow clean `features/<module>/` structure
- 📖 **Reference documentation**: Use organized docs structure for accurate implementation

### 📚 Essential Documentation References
- **[Architecture](../../docs/architecture/README.md)**: System design and technical decisions
- **[Development Guidelines](../../docs/development/README.md)**: Coding standards and conventions
- **[API Integration](../../docs/api/README.md)**: Complete API documentation with critical configurations
- **[Security](../../docs/security/README.md)**: Authentication flows and security patterns
- **[Components](../../docs/components/README.md)**: UI patterns and component structure

---

## 🧩 Enhanced Feature Prompt Template

> **Title**: Add project archive button to tenant project table  
> **Labels**: `project management`, `ui enhancement`  
> **Target Files**: `src/features/projects/pages/TenantProjects.tsx`, `src/features/projects/hooks/useTenantProjects.ts`  
> **Documentation**: Reference [`docs/features/README.md`](../../docs/features/README.md) for project management patterns

**Prompt:**

You are working in the MWAP React TypeScript application. Your task is to add an "Archive" action button to each project listed in the tenant project table.

### Requirements
- **Follow Documentation**: Review [`docs/development/README.md`](../../docs/development/README.md) for coding standards
- **Security**: Implement proper RBAC using patterns from [`docs/security/README.md`](../../docs/security/README.md)
- **API Integration**: Use patterns from [`docs/api/README.md`](../../docs/api/README.md) for API calls
- **Components**: Reuse existing components per [`docs/components/README.md`](../../docs/components/README.md)

### Technical Implementation
- Use existing `useTenantProjects()` hook to refresh the list
- Call `PATCH /api/v1/projects/:id` with `{ archived: true }` when button clicked
- Ensure user has correct role (`ProjectRole.ADMIN`) using established RBAC patterns
- Use Mantine `ActionIcon` following existing UI patterns
- Handle errors with `AppError` pattern and show user feedback
- Reuse existing API client utility patterns
- Add required types to `src/features/projects/types/` but reuse where possible
- Validate inputs with Zod schemas

### Implementation Checklist
- [ ] Analyze existing similar features in `src/features/projects/`
- [ ] Reuse established patterns and components
- [ ] Implement proper TypeScript types
- [ ] Add authentication/authorization checks
- [ ] Handle errors consistently
- [ ] Test functionality thoroughly

**Always reference [`DOCUMENTATION_INDEX.md`](../../DOCUMENTATION_INDEX.md) and follow all conventions in `repo.md`.**

---

## 🎯 Quick Task Template

For smaller tasks, use this condensed format:

```markdown
**Task**: [Brief description]
**Files**: `src/features/[module]/[specific-files]`
**Requirements**: Follow [`docs/development/README.md`](../../docs/development/README.md), implement RBAC, use existing patterns
**Documentation**: Reference relevant sections in [`docs/`](../../docs/) directory
```

Use these templates to ensure consistent, well-documented feature development that follows MWAP standards.