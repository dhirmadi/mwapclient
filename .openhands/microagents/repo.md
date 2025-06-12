# MWAP Frontend Repository Overview

## 🎯 Repository Purpose

This repository contains the **frontend client** for the Modular Web Application Platform (MWAP).  
It is built using React and TypeScript, and is designed to allow users to interact with the MWAP API based on their role (SuperAdmin, TenantOwner, ProjectMember).

This frontend consumes the MWAP backend via a RESTful API defined in `docs/v3-api.md`, providing role-aware dashboards, project tools, and tenant administration.

---

## ⚙️ Setup Instructions

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Start development server
npm run dev
```

> Ensure the MWAP backend and Auth0 tenant are configured as described in `docs/authentication.md`.

---

## 🧱 Repository Structure (Planned)

```txt
src/
  features/                # Feature-based modules (projects, tenants, auth, etc.)
  components/              # Shared UI components (tables, modals, etc.)
  lib/                     # API client, hooks, auth logic
  router/                  # Route definitions with role-based protection
  pages/                   # Entry points per route
  app.tsx                  # App entry and layout
  index.tsx                # Mount point
```

---

## 🧪 CI/CD Workflows

```txt
.github/workflows/
  lint.yml     # Lint TypeScript, styles
  test.yml     # Run Vitest or Playwright tests
  deploy.yml   # (planned) Deploy to Vercel or Netlify
```

---

## 📐 Development Guidelines

- Follow feature-based folder structure (`/features/{domain}`)
- All forms use Zod + React Hook Form
- All API interaction goes through Axios + React Query hooks
- Auth0 provides authentication and role resolution
- Role-aware routing via `<RoleRoute>` wrappers
- Reuse microagents where possible for consistency
- Align with `docs/component-structure.md`, `docs/architecture.md`, and `docs/rbac.md`

---

## 📚 References

- [`docs/frontend.md`](./frontend.md)
- [`docs/v3-api.md`](./v3-api.md)
- [`docs/rbac.md`](./rbac.md)
- [`docs/component-structure.md`](./component-structure.md)
- [`docs/authentication.md`](./authentication.md)