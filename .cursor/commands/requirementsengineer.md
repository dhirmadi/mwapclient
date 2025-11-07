# Requirements from User Flow

Turn the **user flow** I paste next into a complete, implementation-ready requirements package. If needed, ask focused clarifying questions (max 7) before drafting; otherwise proceed.

## Inputs You Will Receive
- **User Flow Text:** Steps, actors, triggers, success/alt paths. I’ll paste it inline after this command.
- **(Optional) Constraints:** Tech stack, compliance, SLAs, deadlines.
- **(Optional) Existing Context:** Scan repo for `README`, `docs/`, ADRs, `.env.example`, OpenAPI/GraphQL schemas, and `package.json` to infer platform & standards.

## Objectives
1) Produce a **Software Requirements Specification (SRS)** that is specific, testable, and traceable.
2) Include functional + non-functional requirements, data contracts, and clear acceptance criteria.
3) Generate artifacts the team can implement immediately, with **no hidden assumptions**.

## Deliverables (in this exact order)
1. **Overview**
   - Problem statement, goals, out-of-scope, success metrics.
   - Primary actors/roles & permissions matrix (CRUD/execute per entity/action).

2. **User Flow Summary**
   - Bullet summary of the flow (main path + alternates).
   - **Mermaid sequence diagram** (and, if helpful, a state diagram).

3. **Functional Requirements**
   - Numbered `FR-n` items grouped by capability/feature.
   - For each: rationale, dependencies, and **traceability** back to user-flow step IDs.

4. **Acceptance Criteria (Gherkin)**
   - For each FR, add `Scenario` blocks with Given/When/Then.
   - Include happy path, alt path, and key edge cases.

5. **Non-Functional Requirements**
   - Performance (latency/throughput), availability & RTO/RPO, security (authN/Z, data at rest/in transit, OWASP), privacy/compliance, i18n/a11y, observability (logs/metrics/traces), scalability, maintainability, cost.

6. **Data & API Contracts**
   - Domain entities with fields, types, constraints, and validation.
   - API surface: list endpoints/operations with method, path, purpose, request/response schemas, error model.
   - Events (if any): topics, payloads, idempotency, ordering, retries, DLQs.

7. **UX Notes**
   - Critical UI states (loading/empty/error), accessibility notes (WCAG), copy/tone, localization.

8. **Risks, Assumptions, Open Questions**
   - Rank risks by impact/probability with mitigation.
   - Explicit assumptions.
   - Open questions the team must answer to proceed.

9. **Traceability Matrix**
   - Table mapping: Flow Step → FR → AC Scenarios → API/Data/Events.

10. **Release & Validation Plan**
   - Milestones, feature flags/kill-switches, migration/backfill steps.
   - Test strategy: unit/integration/e2e/perf/security; ownership & gating.

## Formatting & File Output
- Output **a single Markdown file** at: `docs/requirements/<kebab-slug-from-title>.md`.
- Add this frontmatter:
  ```yaml
  ---
  title: "<Descriptive Feature Name>"
  version: "0.1.0"
  owners: ["<team/owner>"]
  last_updated: "<YYYY-MM-DD>"
  status: "draft"
  ---
