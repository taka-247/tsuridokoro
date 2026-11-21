# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Root (runs both frontend and backend concurrently)
```bash
npm run dev
```

### Frontend (`cd frontend` or use `--prefix frontend`)
```bash
npm run dev          # Vite dev server on :5173
npm run build        # tsc + vite build
npm run lint         # eslint
npm run test         # vitest (watch mode)
npm run test:run     # vitest (single run)
npm run test:ui      # vitest with browser UI
npm run test:e2e     # playwright (auto-starts dev server)
npm run test:e2e:ui  # playwright with browser UI
```

### Backend (`cd backend`)
```bash
npm run dev      # ts-node-dev with hot reload on :3001
npm run build    # tsc
npm run start    # run compiled dist/index.js
npm run test     # vitest (watch mode)
npm run test:run # vitest (single run)
```

### Running a single test
```bash
# frontend
cd frontend && npx vitest run src/components/ui/Button.stories.tsx

# backend
cd backend && npx vitest run src/routes/aggregate/aggregate.test.ts
```

## Architecture

### Monorepo Structure
This is an npm workspaces monorepo with three packages: `frontend`, `backend`, and `shared`.

- **`shared/`** — Shared TypeScript types, validation schemas, and API constants used by both frontend and backend. Import as `@app/shared`. The `shared/src/index.ts` exports a `Shared` object with `api` (URL constants and messages) and `validation` (Zod schemas). Adding new API endpoints or validation rules means updating `shared/` first.

- **`frontend/`** — Vite + React 19 + TypeScript + Tailwind CSS 4. The dev server proxies `/api/*` requests to `http://localhost:3001` (configured in `vite.config.ts`).

- **`backend/`** — Express 5 + TypeScript (CommonJS). Entry: `src/index.ts` starts the server; `src/app.ts` configures Express and mounts the `/api` router; routes are colocated with their test files under `src/routes/<name>/`.

### Frontend Routing & Layouts
Routes are defined in `App.tsx` as two arrays:
- `globalLinks` — pages rendered inside `Layout` (Header + Sidebar + Footer)
- `staticLinks` — pages rendered inside `Layout2` (minimal layout, e.g. Privacy Policy)

### State Management
Zustand is used for global state. See `src/store/useToastStore.ts` for the pattern. Prefer accessing individual slices (`useToastStore(state => state.toasts)`) over the whole store to avoid unnecessary re-renders.

### Theme / Dark Mode
Theme is controlled by `data-theme="dark|light"` on `<html>`. CSS custom properties in `frontend/src/index.css` define separate light/dark values (`--color-light-*`, `--color-dark-*`) mapped via `@theme inline` to Tailwind utility classes (`bg-primary`, `text-text`, `border-border`, etc.). The `ThemeModeSwitcher` component toggles the attribute; the system preference is the default.

### Form Pattern
Forms use `react-hook-form` + `zodResolver` with schemas from `@app/shared`. The backend validates the same schema via `Shared.validation.aggregateSchema.safeParse()`. See `frontend/src/pages/Home.tsx` and `backend/src/routes/aggregate/aggregate.ts` for the full pattern.

### API Client
`frontend/src/api/myAxios.ts` is a thin axios wrapper whose `baseURL` comes from `src/config.tsx`: `''` in dev (Vite proxies `/api`) and `VITE_API_BASE_URL` (the Render backend) in production builds. Use `myAxios.isAxiosError(err)` for typed error handling.

### Aggregation (core feature)
`POST /api/aggregate` validates input with `Shared.validation.aggregateSchema`, then calls Gemini with Google Search grounding (`backend/src/routes/aggregate/aggregateSearch.ts`) when `GEMINI_API_MODE=live`, or returns mock data when it is `mock`. The prompt lives in `prompt.md` next to it; the output is validated with `aggregateResultSchema`. The frontend stores results in localStorage via `src/storage/results.ts` (expires at the end of the week). Product spec: `docs/SPECIFICATION.md`; progress: `docs/ROADMAP.md`.

### Testing
- **Frontend tests** are Storybook stories run by Vitest via `@storybook/addon-vitest` (`vitest.config.ts` defines a single `storybook` project in headless Chromium through Playwright). Stories live next to their components (`src/components/ui/*.stories.tsx`) and are tested through their `play` functions. API calls are mocked with `msw-storybook-addon` (initialized in `.storybook/preview.tsx`); set handlers per story via `parameters.msw.handlers`, using `Shared.api.handlers` as the default success handlers (see `APITest.stories.tsx`). There is currently no jsdom test project and no `src/test/` setup.
- **Backend tests** use Vitest + Supertest against the `app` export from `src/app.ts`.
- **E2E tests** use Playwright; test files live in `frontend/tests/`. The config auto-starts the dev server before running.

### Tooling already in place
Storybook (`npm run storybook`, :6006), Chromatic visual regression (`.github/workflows/chromatic.yml`), GitHub Actions CI/CD (`ci.yml`, `playwright.yml`, `deploy.yml` → Cloudflare Pages), and Husky git hooks. The backend deploys to Render via `render.yaml`.

## Planned (not yet implemented)
Context from `md/DEVELOPMENT.md`: a v2 auth layer (login, authentication, session management, React Query, `withAuth` protected routes, RBAC) and v2 backend persistence (ORM such as Prisma/Drizzle, PostgreSQL/MongoDB, API authorization) are planned but not started.
