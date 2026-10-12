---
trigger: always_on
---

# Project Architecture

This project's architecture is split into two source-of-truth documents:

- **`backend-architecture.md`** — Laravel backend architecture: `nwidart/laravel-modules`
  structure, Actions, DTOs, Requests, Responses, Services, Repositories, Transformers,
  Events, Listeners, Jobs, Policies, Middleware, Models, Support, naming conventions,
  and backend-specific AI coding rules.
- **`frontend-architecture.md`** — React + Inertia.js frontend architecture: the
  per-module folder structure under `modules/[module-name]/resources/assets/admin`
  (including `pages/`), component/hook/service patterns, forms, tables, dialogs,
  RTL/LTR handling, and common frontend bugs to avoid.

## Which file to read

- **Backend task** (anything under `Modules/{ModuleName}/app/`, `database/`, routes,
  or any PHP/Laravel code): read `backend-architecture.md` before creating or
  modifying code.
- **Frontend task** (anything under `modules/[module-name]/resources/assets/admin/`,
  React/TypeScript/Inertia code): read `frontend-architecture.md` before creating or
  modifying code.
- **Task touching both** (e.g. a new feature that needs a new API endpoint and a new
  page): read both documents. Implement the backend contract first, then the frontend
  consumer, per `backend-architecture.md`'s API Contract Stability rule.

Do not guess which structure applies — always read the matching document first for
the code you're about to touch.

## Mandatory Rules

- Follow the existing project architecture (as defined in the two documents above)
  before creating or modifying code.
- Never use the old `nwidart/laravel-modules` structure (classes directly under the
  Module root instead of under `app/`).
- All Module application code MUST be inside `Modules/{ModuleName}/app/`.
- All Module database code MUST be inside `Modules/{ModuleName}/database/`.
- All Module tests (Feature & Unit) MUST be inside `Modules/{ModuleName}/tests/` (e.g. `Modules/{ModuleName}/tests/Feature/` or `Modules/{ModuleName}/tests/Unit/`). Only global/app-wide tests go to the root `tests/` directory.
- All Module frontend code MUST be inside `Modules/{ModuleName}/resources/assets/admin/`,
  with Inertia page entry points inside `Modules/{ModuleName}/resources/assets/admin/pages/`.
- Never create `Modules/{ModuleName}/Actions/`, `Services/`, `Models/`, or similar
  directories outside `app/`.
- Search existing implementations before creating new classes or components.
- Reuse existing components and services whenever possible.
- Controllers must remain thin.
- Do not put business logic in Controllers, Requests, Routes, Transformers, or Models.
- Frontend code must never be trusted to determine authoritative business or
  financial values — the backend is always the source of truth.
- Preserve existing behavior unless the requested change requires otherwise.

When either architecture document conflicts with a generic framework convention,
follow the architecture document.
