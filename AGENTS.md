# AGENTS.md — Lebaux (Open2D2)

Aluminum carpentry quotation system, migrated from MS Access to React + Vite + TypeScript.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build (typecheck first)
npm run lint      # ESLint (flat config v9)
npm run preview   # Vite preview
```

No test framework is configured.

## Architecture

- **Entry**: `src/main.tsx` — wraps app in `QueryClientProvider → BrowserRouter → HeroUIProvider → AuthProvider`
- **Auth**: Dual Zustand store (`authStore.ts`) + React context (`AuthContext.tsx`). Session sync via `supabase.auth.onAuthStateChange` listener in `App.tsx`. Login/logout never set Zustand state directly — the listener does it.
- **Routing** (`App.tsx`): Public (`/login`, `/register`), protected (`ProtectedRoute → AppLayout → pages`). Root `/` redirects to `/inicio`.
- **State**: Zustand (auth, catalogs, obras) with localStorage persistence; React Query for server data (5min staleTime, no refetchOnWindowFocus, 1 retry).
- **Path alias**: `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- **Types**: 912-line `src/types/index.ts` — single file mirroring old Access schema.

## Directories

| Path | Purpose |
|------|---------|
| `src/pages/` | Route-level page components |
| `src/components/` | UI components by domain (layout, catalogs, products, presupuesto) |
| `src/store/` | Zustand stores |
| `src/hooks/` | Custom hooks (productos CRUD grouped by entity, obra despiece) |
| `src/lib/` | `supabaseClient.ts`, `queryClient.ts`, `calculoDespiece.ts` (formula engine via mathjs), `motorDespiece.ts` (v2 calculation engine) |
| `src/services/` | Supabase API wrappers |
| `src/types/` | All TypeScript interfaces |
| `src/routes/` | `ProtectedRoute.tsx` |
| `src/context/` | `AuthContext.tsx` |

## Key modules

- **`calculoDespiece.ts`** — formula evaluator using mathjs. Variables: `ancho`, `alto`, `hojas`, `cruces_h`, `cruces_v`, `pos_h[]`, `pos_v[]`. Replaces `Entero()` with `floor()`, `IIf()` with conditional.
- **`motorDespiece.ts`** (815 lines) — main calculation engine v2. Coordinates profile/accessory/glass cutting calculations. Wired to hooks under `src/hooks/productos/despieces/`.
- **`ProtectedRoute.tsx`** — shows spinner while `isCheckingAuth`, redirects to `/login` if unauthenticated, also silently verifies Supabase session integrity on route change.

## Styles

- Tailwind CSS v4 with `@import "tailwindcss"` + `@config` directive in `index.css`
- Custom color tokens: `lebaux-*` (amber, gray), `steel-*` (50–950)
- Dark mode via `class` strategy. HeroUI themes sync dark/light palettes.
- Font families (local .woff2): `DM Sans`, `Syne`, `JetBrains Mono`, `Roboto`

## Supabase

- Credentials in `.env` (required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`)
- Local dev config in `supabase/config.toml` (API port 54321, DB port 54322)
- Local CLI available via `npx supabase` (v2.96.0)
