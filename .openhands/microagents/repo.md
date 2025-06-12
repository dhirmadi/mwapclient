# MWAP Repository Overview

## 📌 Repository Purpose

This repository hosts the backend and frontend of the Modular Web Application Platform (MWAP). It is designed to manage multi-tenant projects with fine-grained RBAC, powered by Node.js, MongoDB, React, and Auth0.

MWAP includes:
- RESTful API (v3) for tenants, projects, cloud providers, integrations
- Zod-validated schemas and clean architecture patterns
- React frontend with role-based dashboards and CRUD workflows

---

## ⚙️ Setup Instructions

### Backend
```bash
# Install dependencies
cd mwapserver
npm install

# Create .env file and configure Auth0 + MongoDB URI

# Run server
npm run dev
```

### Frontend (Planned)
```bash
cd mwapclient
npm install
npm run dev
```

---

## 🧱 Repository Structure

```txt
.
├── src/
│   ├── features/               # Domain logic (tenants, projects, cloud-integrations)
│   ├── schemas/                # Zod validation schemas
│   ├── middleware/             # JWT, RBAC, error handling
│   ├── utils/                  # Response and validation helpers
│   ├── routes/                 # API v1 routers
│   └── server.ts               # App entrypoint
├── tests/                      # API integration test suite (apitest.py)
├── .github/workflows/          # CI pipelines
└── openhands/microagents/     # Microagents for OpenHands tasks
```

---

## 🧪 CI/CD Workflows

- `.github/workflows/node.yml`: Lints and tests server code on PR
- `.github/workflows/test.yml`: Runs Python-based API integration tests
- Coming soon: deploy frontend to Vercel or Netlify

---

## 🧑‍💻 Development Guidelines

- Follow modular `feature-pattern.md` for organizing code
- Use Zod for all validation logic
- Commit new endpoints to `v3-api.md`
- Define reusable logic in OpenHands microagents
- Always test API changes via `/tests/apitest.py`