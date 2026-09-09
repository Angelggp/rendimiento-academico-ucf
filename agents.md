# agents.md

Web system for the **Faculty of Engineering at the University of Cienfuegos** that digitizes academic performance tracking. Replaces Excel spreadsheets and emails with a role-based web app for managing students, subjects, evaluations, and reports.

## Stack

- **Backend:** NestJS 12 + Prisma + PostgreSQL (Docker) + JWT auth
- **Frontend:** React 19 + Vite + shadcn/ui + Tailwind CSS 4
- **Testing:** Vitest + Supertest | **Linting:** oxlint | **Formatting:** Prettier

## Roles

| Role | Access |
|---|---|
| **Admin / Vice Dean** | Full CRUD. Can view pending students and filtered reports. |
| **Professor** | Only own subjects and evaluations. Cannot touch other users' data. |

## Modules (MVP)

1. **Students** — CRUD + municipality of origin. Admin only.
2. **Subjects** — CRUD, linked to a professor, semester, and faculty. Admin only.
3. **Evaluations** — Professor records per student: `APPROVED` or `PENDING`.
4. **Pending view** — Derived query, not a separate module. Students with at least one `PENDING` evaluation.
5. **Reports** — Filters: subject, professor, semester, municipality. CSV export.

## Code conventions

- **Package manager:** Use `pnpm` for all package operations (install, add, remove).
- All generated code, variable names, function names, and comments must be **in Spanish** (domain-specific terms like class names, DTOs, and Prisma models can stay in English for consistency with the framework).
- Generate CRUDs with `nest g resource <name>`.
- Roles are enforced with `@Roles('admin')` or `@Roles('professor')` decorator per endpoint.
- **"Pending" status** is always a derived query, never a stored field.

## Commit conventions

Format: `<type>(<scope>): <description>` — **always in English**.

**Scope:** Use `backend` or `frontend` only when the change is exclusive to that folder. If it spans both or affects the root (config, docs), **omit scope**.

| Type | When to use | Example |
|---|---|---|
| `feat` | New functionality | `feat(backend): add evaluaciones CRUD` |
| `fix` | Bug fix | `fix(frontend): redirect to login on token expiry` |
| `refactor` | Restructure without changing behavior | `refactor: extract role validation into guard` |
| `docs` | Documentation | `docs: update Sprints.md` |
| `style` | Formatting only (spaces, commas) | `style(backend): apply prettier` |
| `test` | Add or modify tests | `test(backend): add auth service tests` |
| `chore` | Dependencies, configs | `chore(frontend): install tanstack-query` |
| `ci` | CI/CD pipelines | `ci: add GitHub Actions workflow` |
