# 釣りドコロ (Tsuridokoro)

Pick a fish species, an area and a look-back period, and the app uses Gemini (with Google Search grounding) to aggregate public fishing reports and show the top spots to try. Japan-only, Japanese UI. See [docs/SPECIFICATION.md](docs/SPECIFICATION.md) and [docs/ROADMAP.md](docs/ROADMAP.md).

It is a full-stack TypeScript npm-workspaces monorepo with a shared validation layer, component testing, E2E testing, visual regression, and CI/CD.

## Tech Stack

| Area | Tech |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, Tailwind CSS 4, React Router 7 |
| State | Zustand |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| UI primitives | Headless UI |
| HTTP | Axios (`src/api/myAxios.ts`) |
| Backend | Express 5, TypeScript (CommonJS) |
| LLM | Gemini API (`@google/genai`) + Google Search grounding |
| Shared | `@app/shared` — types, Zod schemas, API constants, MSW handlers |
| Unit/component tests | Vitest, Testing Library, MSW, Storybook test runner |
| E2E | Playwright |
| Visual regression | Storybook + Chromatic |
| Hosting | Cloudflare Pages (frontend), Render Web Service (backend) |
| CI/CD | GitHub Actions → Cloudflare Pages |
| Git hooks | Husky |

## Repository Layout

```
.
├── frontend/   # Vite + React app (dev server :5173, proxies /api → :3001)
├── backend/    # Express API (:3001), routes colocated with tests under src/routes/<name>/
├── shared/     # @app/shared — built to shared/dist, imported by both frontend & backend
├── docs/       # SPECIFICATION.md, ROADMAP.md, design mockups
├── .github/workflows/   # ci, playwright, chromatic, deploy
├── render.yaml # Render Blueprint for the backend
└── .husky/     # pre-commit, post-commit, post-merge hooks
```

This is an **npm workspaces** monorepo (`frontend`, `backend`, `shared`).

### `shared/` — the single source of truth
`shared/src/index.ts` exports a `Shared` object with:
- `Shared.api` — URL constants, messages, and MSW handlers
- `Shared.validation` — Zod schemas (`aggregateSchema` for the form, `aggregateResultSchema` for the Gemini result contract)
- `Shared.messages`, `Shared.pages` — shared UI messages and page-level constants

It also exports the `AggregateInput` / `AggregateResult` types.

> **Important:** `shared` is consumed from its **compiled output** (`shared/dist`), not its TypeScript source, so Node-based runners (Playwright, backend) can load it. Run `npm run share` after editing anything under `shared/src`. The git hooks below help enforce this.

## Getting Started

```bash
npm install          # installs all workspaces
npm run dev          # builds shared, then runs frontend + backend concurrently
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001 (frontend proxies `/api/*` to it)

## Common Commands

### Root
```bash
npm run share        # build @app/shared (run after editing shared/src)
npm run dev          # build shared + run frontend & backend together
```

### Frontend (`cd frontend` or `--workspace=frontend`)
```bash
npm run dev          # Vite dev server :5173
npm run build        # tsc -b + vite build
npm run lint         # eslint
npm run test         # vitest watch (incl. Storybook browser tests)
npm run test:run     # vitest single run
npm run test:e2e     # Playwright (auto-starts frontend + backend)
npm run storybook    # Storybook dev server :6006
npm run build-storybook
```

### Backend (`cd backend` or `--workspace=backend`)
```bash
npm run dev          # ts-node-dev hot reload :3001
npm run build        # tsc → dist/
npm run start        # run compiled dist/index.js
npm run test:run     # vitest single run
```

## Architecture Notes

### Frontend routing & layouts (`src/App.tsx`)
Routes are two arrays:
- `globalLinks` → rendered in `Layout` (Header + Sidebar + Footer)
- `staticLinks` → rendered in `Layout2` (minimal layout, e.g. Privacy Policy)

### Theming
`data-theme="dark|light"` on `<html>`; CSS custom properties in `src/index.css` map light/dark values to Tailwind utilities (`bg-primary`, `text-text`, …). `ThemeModeSwitcher` toggles it.

### State (Zustand)
Global state lives in `src/store/` (e.g. `useToastStore.ts`). Prefer slice selectors (`useToastStore(s => s.toasts)`) over selecting the whole store to avoid re-renders.

### Forms
React Hook Form + `zodResolver` using schemas from `@app/shared`. The backend validates the **same** schema via `Shared.validation.*.safeParse()`. See `frontend/src/pages/Home.tsx` + `backend/src/routes/aggregate/aggregate.ts` (`aggregateSchema`).

### Backend
`src/index.ts` starts the server; `src/app.ts` configures Express and mounts the `/api` router. Routes live in `src/routes/<name>/` next to their tests.

## Testing

- **Storybook tests** — stories with `play` functions run in real Chromium via `@storybook/addon-vitest` under `npm run test`. API calls are mocked with `msw-storybook-addon`; `Shared.api.handlers` provides the default handlers. (There is no jsdom test project at the moment.)
- **Backend** — Vitest + Supertest against the `app` export.
- **E2E** — Playwright in `frontend/tests/`; config auto-starts both dev servers.

## Deployment

| Part | Host | How |
| --- | --- | --- |
| Frontend | Cloudflare Pages (`https://tsuridokoro.pages.dev`) | `deploy.yml` builds `frontend/dist` and uploads it with `wrangler pages deploy` on push to `main`. `public/_redirects` provides the SPA fallback. |
| Backend | Render Web Service (`tsuridokoro-backend`, Singapore, free plan) | Defined in `render.yaml` (Blueprint). Builds from the repo root so the `@app/shared` workspace resolves; health check `/api/health`. |

### Environment variables

| Where | Name | Purpose |
| --- | --- | --- |
| Render | `GEMINI_API_KEY` | Gemini API key (secret, set in the Render dashboard) |
| Render | `GEMINI_API_MODE` | `live` calls Gemini; `mock` returns mock data |
| Render | `ALLOWED_ORIGIN` | CORS allowlist (comma-separated), e.g. the Cloudflare Pages origin |
| GitHub Actions | `VITE_API_BASE_URL` | Render backend URL, baked into the frontend build |
| GitHub Actions | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | Used by `wrangler` to deploy to Cloudflare Pages |
| GitHub Actions | `CHROMATIC_PROJECT_TOKEN` | Chromatic visual regression |

Locally, put `GEMINI_API_KEY` / `GEMINI_API_MODE` in `backend/.env`.

## CI/CD (GitHub Actions)

| Workflow | Trigger | Does |
| --- | --- | --- |
| `ci.yml` | PR | lint, typecheck/build, frontend + backend tests |
| `playwright.yml` | push to `main` / PR | E2E |
| `chromatic.yml` | push to `main` / PR | visual regression (needs `CHROMATIC_PROJECT_TOKEN` secret) |
| `deploy.yml` | push to `main` | build frontend, deploy to Cloudflare Pages |

Every job runs `npm ci` then `npm run share` before building/testing.

The backend is not deployed by GitHub Actions; Render deploys it from `render.yaml`.

**One-time setup:** create the `tsuridokoro` Cloudflare Pages project, connect the repo to Render as a Blueprint, and add the GitHub Actions secrets listed above.

## Git Hooks (Husky)

- **pre-commit** / **post-commit** — keep `shared/dist` in sync with `shared/src`; if you commit a `shared/src` change without rebuilding, a follow-up commit captures the fresh `dist`.
- **post-merge** — rebuilds `shared` after a pull that touched `shared/src`.

Bypass with `git commit --no-verify` if needed; CI is the real backstop.
