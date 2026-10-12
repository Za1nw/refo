---
name: project-architecture
description: Enforces this project's Laravel-modules backend architecture and React/Inertia frontend architecture before any code is created or modified. Use this skill whenever you are about to create, edit, move, or place any file in this codebase — a new Action/Service/Repository/Controller/Model/DTO/Request/Event/Listener/Job/Policy under Modules/{ModuleName}, or any React/TypeScript component/hook/service under modules/[module-name]/resources/assets/admin. Also use it whenever deciding where a new file belongs, whether a folder/class already exists that should be reused instead of duplicated, or whether code should be split across files (backend layers, or frontend components/hooks/services). Trigger even if the user doesn't mention "architecture" explicitly — any request to build a feature, add an endpoint, add a page, fix a bug, or refactor in this project should consult this skill first.
---

# Project Architecture

This project has two separate, mandatory architecture documents, both at the
**project root** (same level as `Modules/` and `modules/`):

- `backend-architecture.md` — Laravel + `nwidart/laravel-modules` backend.
- `frontend-architecture.md` — React + Inertia.js admin frontend.

**Read the matching one in full (from the project root) before writing or moving any
file** — do not rely on memory of a prior read, since exact folder names and layer
rules matter. This skill does not bundle copies of them; always read the live files
so you never work from a stale snapshot.

## Step 0 — Decide the domain

| Task touches... | Read (from project root) |
|---|---|
| `Modules/{ModuleName}/app/`, `database/`, routes, any PHP class | `backend-architecture.md` |
| `modules/[module-name]/resources/assets/admin/`, any `.tsx`/`.ts` | `frontend-architecture.md` |
| Both (new endpoint + the page/component that consumes it) | Both, backend first |

If either file can't be found at the project root, ask the user for its location
rather than guessing at folder conventions from general Laravel/React knowledge.

Never guess folder names or layer responsibilities from general Laravel/React
knowledge — this project's conventions differ from generic framework defaults in
specific, deliberate ways (see the "hard rules" below). The reference files are the
only source of truth.

## Step 1 — Search before creating

Before creating any new class or component, search the codebase for an existing one
that already provides the responsibility. Never duplicate:

- an Action, Service, Repository, DTO, Request, Resource, Event, Listener, or Job on
  the backend
- a component, hook, service function, or `*SelectField` on the frontend

Copying the closest existing analog as a starting point is the expected workflow on
both sides (e.g. copy the nearest `*SelectField` rather than building a combobox from
scratch; copy the nearest Action rather than writing a new pattern).

## Step 2 — Place the file correctly

### Backend — quick decision tree (full detail in the reference file)

```text
Complete use case?            → Modules/{Name}/app/Actions/
Structured data transfer?     → Modules/{Name}/app/DTOs/
HTTP input validation?        → Modules/{Name}/app/Http/Requests/
HTTP response formatting?     → Modules/{Name}/app/Http/Responses/
Reusable business operation?  → Modules/{Name}/app/Services/
Database/data-access logic?   → Modules/{Name}/app/Repositories/
API representation?           → Modules/{Name}/app/Transformers/
Something happened (fact)?    → Modules/{Name}/app/Events/
Reaction to an event?         → Modules/{Name}/app/Listeners/
Background/async work?        → Modules/{Name}/app/Jobs/
Authorization?                → Modules/{Name}/app/Policies/
HTTP pipeline behavior?       → Modules/{Name}/app/Http/Middleware/
Validation rule?              → Modules/{Name}/app/Rules/
Reusable technical utility?   → Modules/{Name}/app/Support/
Database model?               → Modules/{Name}/app/Models/
Module tests (Feature / Unit)?→ Modules/{Name}/tests/
```

Is it truly shared across multiple modules / app-wide infrastructure and not owned by
one business domain? → goes in the root `app/` instead of `Modules/{Name}/app/` (and root `tests/` for global tests).

### Frontend — quick folder map (full detail in the reference file)

```text
modules/[module-name]/resources/assets/admin/
├── pages/                    ← Inertia page entry points ONLY — no logic, just render SectionList[Module]
├── [ModuleName]Status.ts     ← status enum
├── types/                    ← TS interface mirroring the backend *Resource shape
├── contexts/                 ← Context for secondary dialogs, if the module has any
├── actions/                  ← row-action factory functions
├── cells/                    ← custom table cells
├── lables/                   ← column labels (i18n)
├── services/                 ← create-only .service.ts (or all CRUD for simple modules)
│   └── [module]_actions.service.ts  ← everything except create, for semi-immutable resources
├── hooks/
│   ├── [module]/             ← use[Module]Actions / Columns / ServerSync / useTable[Module]
│   └── forms/                ← use[Module]Form.ts
└── components/
    ├── SectionList[Module].tsx      ← the real page component (entry point renders this)
    ├── [Module]DrawerForm.tsx
    └── forms/                       ← secondary dialog forms
```

## Hard rules (violating these is the most common failure mode)

**Backend**
- Never create `Modules/{Name}/Actions/`, `Services/`, `Models/` etc. directly under
  the Module root — everything goes under `Modules/{Name}/app/`.
- All tests for a module (Unit and Feature) MUST be placed inside `Modules/{Name}/tests/` (e.g. `Modules/{Name}/tests/Feature/` or `Modules/{Name}/tests/Unit/`). Never place module-specific tests in the root `tests/` directory.
- Controllers stay thin: Request → DTO → Action → Resource. No business logic, no
  financial calculation, no complex queries in a Controller, Request, Route,
  Transformer, or Model.
- Frontend input is never trusted for authoritative/financial values — the guard
  always lives on the backend; the frontend only hides/disables for UX.

**Frontend**
- Every axios/JSON response from Laravel is wrapped — extract `res.data.data`, not
  `res.data`.
- `pages/*.tsx` must stay a thin render of the matching `SectionList[Module]`
  component — no state, no fetching logic in the page file itself.
- Any interactive button (hour/minute pickers, popovers, dialog buttons) rendered
  inside a `<form onSubmit>` needs explicit `type="button"`, or it submits the form.
- Never do `String(possiblyNullValue)` unconditionally — it produces the literal text
  `"null"`. Guard explicitly: `value ? String(value) : ''`.
- When a UI condition hides a field, reset that field's state at the same moment —
  don't rely on it simply not being sent later.
- `router.reload({ only: [...] })` after a mutation, not optimistic updates — the
  backend is the source of truth.
- Use `useDirection()` + explicit `dir` ternary for fields with a forced direction
  (phone numbers, English-only fields) — don't mix in Tailwind logical utilities
  (`ms-`/`me-`) there, only for ordinary spacing.

## Step 3 — Verify before finishing

Backend: namespaces/imports, DI, routes, validation, authorization, response
structure, DB transactions where the operation must be atomic, tests.

Frontend: TypeScript types match the backend Resource, `.data.data` extraction,
loading/processing guards, i18n labels, RTL/LTR behavior, hidden-field state reset.

If anything in this checklist is ambiguous for the task at hand, open the full
reference file rather than guessing — both are short enough to read in full.
